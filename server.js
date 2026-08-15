const http = require('http');
const { exec, execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ARQUIVO_PROGRESSO = path.join(__dirname, '.progresso.json');
const HTML_FILE = path.join(__dirname, 'fof.html');

// ============ CONFIGURAÇÕES DE SEGURANÇA ============

// Whitelist: Comandos permitidos (prefixos)
const COMANDOS_PERMITIDOS = [
    // DNF (Gerenciador de pacotes)
    'dnf install',
    'dnf upgrade',
    'dnf update',
    'dnf remove',
    'dnf autoremove',
    'dnf clean',
    'dnf repolist',
    'dnf config-manager',
    'dnf distro-sync',
    'dnf system-upgrade',
    'dnf swap',
    'dnf groupinstall',
    'dnf groupremove',
    'dnf check-update',
    'dnf list',
    'dnf info',
    'dnf provides',
    'dnf search',
    'dnf reinstall',
    'dnf downgrade',
    
    // Flatpak
    'flatpak install',
    'flatpak uninstall',
    'flatpak update',
    'flatpak remote-add',
    'flatpak remote-remove',
    'flatpak list',
    'flatpak info',
    'flatpak search',
    'flatpak run',
    'flatpak override',
    'flatpak repair',
    'flatpak uninstall --unused',
    
    // RPM
    'rpm -q',
    'rpm -E',
    'rpm -qa',
    'rpm -qi',
    'rpm -ql',
    
    // Sistema
    'localectl',
    'timedatectl',
    'fwupdmgr',
    'systemctl',
    'hostnamectl',
    
    // Aplicativos
    'gnome-software',
    'plasma-discover',
    'xfce4-appfinder',
    'xdg-open',
    
    // Utilitários
    'curl',
    'wget',
    'unzip',
    '7zip',
    'unrar',
    'tar',
    'gzip',
    'gunzip',
    
    // Ferramentas de desenvolvimento
    'git',
    'make',
    'cmake',
    'gcc',
    'g++',
    
    // Ferramentas de rede
    'ping',
    'traceroute',
    'nslookup',
    'dig',
    'ip',
    'ifconfig',
    'ss',
    'netstat',
    
    // Ferramentas de sistema
    'ls',
    'cat',
    'grep',
    'awk',
    'sed',
    'head',
    'tail',
    'wc',
    'sort',
    'uniq',
    'find',
    'which',
    'whereis',
    'file',
    'stat',
    'du',
    'df',
    'free',
    'uptime',
    'whoami'
];

// Padrões de comandos perigosos (bloqueados)
const PADROES_PERIGOSOS = [
    // Remoção destrutiva
    /rm\s+-rf?\s+\/[^\n]*/i,
    /rm\s+-rf?\s+--no-preserve-root/i,
    /rm\s+-rf?\s+\.\.?\/\.\.?\/\.\.?\//i,
    /rm\s+-rf?\s+~\/\.\w+/i,
    
    // Manipulação de discos
    /dd\s+if=/i,
    /dd\s+of=/i,
    /mkfs\.\w+/i,
    /mke2fs/i,
    /fdisk/i,
    /parted/i,
    /gparted/i,
    /sfdisk/i,
    
    // Fork bomb
    /:\s*\(\)\s*\{\s*:\s*\|/i,
    
    // Permissões perigosas
    /chmod\s+777\s+\//i,
    /chmod\s+777\s+\./i,
    /chmod\s+-R\s+777/i,
    /chown\s+-R/i,
    
    // Redirecionamento perigoso
    />\s*\/dev\/sd[a-z]/i,
    />\s*\/dev\/hd[a-z]/i,
    />\s*\/dev\/nvme/i,
    />\s*\/proc\/[0-9]+\/mem/i,
    />\s*\/sys\/block/i,
    
    // Pipe to shell (execução remota)
    /curl.*\|.*sh/i,
    /wget.*\|.*sh/i,
    /curl.*\|.*bash/i,
    /wget.*\|.*bash/i,
    /curl.*\|.*zsh/i,
    /wget.*\|.*zsh/i,
    
    // Compressão destrutiva
    /dd\s+if=\/dev\/zero/i,
    /dd\s+if=\/dev\/urandom/i,
    /cat\s+\/dev\/zero\s+>/i,
    /cat\s+\/dev\/urandom\s+>/i,
    
    // Killall perigoso
    /killall\s+-9/i,
    /kill\s+-9\s+[0-9]+\s+[0-9]+/i,
    /pkill\s+-9/i,
    
    // Sistema de arquivos
    /umount\s+-f/i,
    /mount\s+-o\s+remount,\s*rw\s+\//i,
    /fsck\s+-y/i,
    
    // Pacotes perigosos
    /dnf\s+remove\s+kernel/i,
    /dnf\s+remove\s+systemd/i,
    /dnf\s+remove\s+glibc/i,
    /dnf\s+remove\s+gcc/i,
    /dnf\s+remove\s+python3/i,
    /dnf\s+remove\s+nodejs/i,
    /dnf\s+remove\s+git/i,
    
    // Comandos sem saída
    />\s*\/dev\/null/i,
    /2>\s*\/dev\/null/i,
    /&>\s*\/dev\/null/i
];

// Caracteres especiais bloqueados (injeção de comandos)
const CARACTERES_BLOQUEADOS = [
    ';',   // Separador de comandos
    '&&',  // AND condicional
    '||',  // OR condicional
    '|',   // Pipe
    '`',   // Backtick (execução)
    '$()', // Substituição de comando
    '${}', // Substituição de variável
    '\\',  // Escape (simples)
    '\\\\', // Escape (duplo)
    '\n',  // Nova linha
    '\r',  // Retorno de carro
    '\t',  // Tab
    '\x00' // Null byte
];

// ============ VARIÁVEIS DE STREAM ============

// Armazena os clients SSE ativos
const sseClients = new Map();

// ============ FUNÇÕES DE VALIDAÇÃO ============

function validarComando(comando) {
    if (!comando || comando.trim().length === 0) {
        console.warn('[VALIDAÇÃO] Comando vazio');
        return { valido: false, motivo: 'Comando vazio' };
    }
    
    let cmdLimpo = comando.trim();
    cmdLimpo = cmdLimpo.replace(/^sudo\s+/, '');
    cmdLimpo = cmdLimpo.replace(/^echo\s+['"].*['"]\s*\|\s*sudo\s+-S\s+sh\s+-c\s+["']/, '');
    cmdLimpo = cmdLimpo.replace(/^pkexec\s+/, '');
    cmdLimpo = cmdLimpo.replace(/^kdesu\s+-c\s+["']/, '');
    cmdLimpo = cmdLimpo.replace(/["']\s*$/, '');
    cmdLimpo = cmdLimpo.replace(/\s*(?:>|>>|2>|&>)\s*\/[^\s]+/g, '');
    cmdLimpo = cmdLimpo.replace(/\s*\|/g, '');
    
    for (const padrao of PADROES_PERIGOSOS) {
        if (padrao.test(cmdLimpo) || padrao.test(comando)) {
            console.warn(`[VALIDAÇÃO] Padrão perigoso detectado: ${padrao}`);
            return { 
                valido: false, 
                motivo: `Padrão perigoso detectado: ${padrao.source}`
            };
        }
    }
    
    for (const char of CARACTERES_BLOQUEADOS) {
        if (comando.includes(char) && !comando.includes('dnf install') && !comando.includes('flatpak install')) {
            return { 
                valido: false, 
                motivo: `Caractere especial bloqueado: ${char}`
            };
        }
    }
    
    const permitido = COMANDOS_PERMITIDOS.some(cmd => {
        return cmdLimpo.startsWith(cmd) || cmdLimpo.includes(` ${cmd}`);
    });
    
    if (!permitido) {
        return { 
            valido: false, 
            motivo: `Comando não permitido: ${cmdLimpo.split(' ')[0]}`
        };
    }
    
    if (comando.includes('system-upgrade download')) {
        const match = comando.match(/--releasever=(\d+)/);
        if (match) {
            const versao = parseInt(match[1]);
            if (versao < 40) {
                return { valido: false, motivo: `Versão ${versao} é muito antiga` };
            }
            if (versao > 50) {
                return { valido: false, motivo: `Versão ${versao} parece ser futura` };
            }
        }
    }
    
    if (comando.includes('..')) {
        if (!comando.includes('ls') && !comando.includes('find') && !comando.includes('cd')) {
            return { valido: false, motivo: 'Uso de caminho relativo perigoso (..)' };
        }
    }
    
    return { valido: true, motivo: 'Comando permitido' };
}

function sanitizarComando(comando) {
    let sanitizado = comando
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
        .trim();
    
    sanitizado = sanitizado.replace(/\s+/g, ' ');
    sanitizado = sanitizado.replace(/\s*(?:>|>>)\s*\/[^\s]+$/g, '');
    
    return sanitizado;
}

// ============ FUNÇÕES DE PROGRESSO ============

function lerProgresso() {
    try {
        if (fs.existsSync(ARQUIVO_PROGRESSO)) {
            const dados = fs.readFileSync(ARQUIVO_PROGRESSO, 'utf8');
            return JSON.parse(dados);
        }
    } catch (e) {
        console.error("[Erro ao ler progresso]:", e.message);
    }
    return [];
}

function salvarProgresso(idComando) {
    try {
        let progresso = lerProgresso();
        if (!progresso.includes(idComando)) {
            progresso.push(idComando);
            fs.writeFileSync(ARQUIVO_PROGRESSO, JSON.stringify(progresso, null, 2), 'utf8');
        }
    } catch (e) {
        console.error("[Erro ao salvar progresso]:", e.message);
    }
}

function removerProgresso(idComando) {
    try {
        let progresso = lerProgresso();
        progresso = progresso.filter(id => id !== idComando);
        fs.writeFileSync(ARQUIVO_PROGRESSO, JSON.stringify(progresso, null, 2), 'utf8');
        console.log(`[Progresso Removido]: Botão '${idComando}' limpo do histórico.`);
    } catch (e) {
        console.error("[Erro ao remover progresso]:", e.message);
    }
}

// ============ FUNÇÕES DE STREAM SSE ============

function enviarLog(idComando, mensagem, tipo = 'output') {
    const clients = sseClients.get(idComando) || [];
    const dados = JSON.stringify({ tipo, mensagem });
    
    clients.forEach(client => {
        client.write(`data: ${dados}\n\n`);
    });
}

function adicionarClienteSSE(idComando, res) {
    if (!sseClients.has(idComando)) {
        sseClients.set(idComando, []);
    }
    sseClients.get(idComando).push(res);
    
    // Remove o cliente quando a conexão fechar
    res.on('close', () => {
        const clients = sseClients.get(idComando) || [];
        const index = clients.indexOf(res);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        if (clients.length === 0) {
            sseClients.delete(idComando);
        }
    });
}

// ============ VERIFICAÇÃO DE VERSÃO ============

function verificarSeVersaoExiste(versao, callback) {
    const urlCheck = `https://mirrors.fedoraproject.org/mirrorlist?repo=fedora-${versao}&arch=x86_64`;
    exec(`curl -s --max-time 4 -o /dev/null -w "%{http_code}" "${urlCheck}"`, (err, stdout) => {
        const statusCode = parseInt(stdout.trim(), 10);
        if (!err && statusCode === 200) callback(true);
        else callback(false);
    });
}

// ============ DETECÇÃO DE DESKTOP ============

function detectarDesktop() {
    const desktop = (process.env.XDG_CURRENT_DESKTOP || '').toUpperCase();
    const session = (process.env.DESKTOP_SESSION || '').toUpperCase();
    
    if (desktop.includes('KDE') || session.includes('KDE') || session.includes('PLASMA')) {
        return 'KDE';
    }
    if (desktop.includes('GNOME') || session.includes('GNOME')) {
        return 'GNOME';
    }
    if (desktop.includes('XFCE') || session.includes('XFCE')) {
        return 'XFCE';
    }
    if (desktop.includes('CINNAMON') || session.includes('CINNAMON')) {
        return 'CINNAMON';
    }
    if (desktop.includes('MATE') || session.includes('MATE')) {
        return 'MATE';
    }
    if (desktop.includes('LXQT') || session.includes('LXQT')) {
        return 'LXQT';
    }
    if (desktop.includes('LXDE') || session.includes('LXDE')) {
        return 'LXDE';
    }
    if (desktop.includes('I3') || desktop.includes('SWAY') || desktop.includes('WM')) {
        return 'WM';
    }
    
    return 'UNKNOWN';
}

// ============ AUTENTICAÇÃO SEGURA ============

function verificarDisponibilidadePkexec() {
    try {
        const result = execSync('which pkexec', { encoding: 'utf8', timeout: 1000 });
        return result.trim().length > 0;
    } catch (e) {
        return false;
    }
}

function verificarDisponibilidadeKdesu() {
    try {
        const result = execSync('which kdesu', { encoding: 'utf8', timeout: 1000 });
        return result.trim().length > 0;
    } catch (e) {
        return false;
    }
}

function obterMetodoAutenticacao() {
    const desktop = detectarDesktop();
    
    if (desktop === 'KDE' && verificarDisponibilidadeKdesu()) {
        return {
            tipo: 'kdesu',
            comando: 'kdesu',
            descricao: 'kdesu (KDE)'
        };
    }
    
    if (verificarDisponibilidadePkexec()) {
        return {
            tipo: 'pkexec',
            comando: 'pkexec',
            descricao: 'pkexec (PolicyKit)'
        };
    }
    
    return {
        tipo: 'sudo_fallback',
        comando: 'sudo',
        descricao: 'sudo (fallback)'
    };
}

// ============ EXECUÇÃO COM STREAM ============

function executarComandoComStream(comandoFinal, idComando, isReversao, callback) {
    enviarLog(idComando, `$ ${comandoFinal}\n`, 'info');
    enviarLog(idComando, '─'.repeat(50) + '\n', 'info');
    
    // Usa spawn para streaming em tempo real
    const processo = spawn(comandoFinal, {
        shell: '/bin/bash',
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let saidaCompleta = '';
    let erros = '';
    
    // Captura stdout em tempo real
    processo.stdout.on('data', (data) => {
        const texto = data.toString();
        saidaCompleta += texto;
        enviarLog(idComando, texto, 'output');
    });
    
    // Captura stderr em tempo real
    processo.stderr.on('data', (data) => {
        const texto = data.toString();
        erros += texto;
        // Filtra mensagens de senha
        const textoFiltrado = texto.replace(/\[sudo\] password for .+: /g, '');
        if (textoFiltrado.trim()) {
            enviarLog(idComando, textoFiltrado, 'error');
        }
    });
    
    // Quando o processo terminar
    processo.on('close', (code) => {
        if (code === 0) {
            if (isReversao) {
                removerProgresso(idComando);
            } else {
                salvarProgresso(idComando);
            }
            enviarLog(idComando, `\n✅ Comando concluído com sucesso! (código: ${code})\n`, 'success');
            console.log(`[SUCESSO] ${idComando}`);
        } else {
            enviarLog(idComando, `\n❌ Comando falhou com código: ${code}\n`, 'error');
            console.error(`[ERRO] ${idComando}: Código ${code}`);
        }
        
        enviarLog(idComando, '─'.repeat(50) + '\n', 'info');
        enviarLog(idComando, '[FIM] Pressione "Concluído" para fechar este log.\n', 'info');
        
        // Envia sinal de fim
        enviarLog(idComando, '__END__', 'end');
        
        callback(code === 0 ? null : new Error(`Código de saída: ${code}`), saidaCompleta, erros);
    });
    
    // Tratamento de erro no spawn
    processo.on('error', (err) => {
        enviarLog(idComando, `\n❌ Erro ao iniciar processo: ${err.message}\n`, 'error');
        callback(err, saidaCompleta, erros);
    });
}

function executarComAutenticacaoSegura(comandoOriginal, idComando, isReversao, callback) {
    const desktop = detectarDesktop();
    const metodo = obterMetodoAutenticacao();
    
    enviarLog(idComando, `🔐 Autenticando usando: ${metodo.descricao}\n`, 'info');
    
    const comandoSemSudo = comandoOriginal.replace(/sudo\s+/g, '');
    
    const comandoEscapado = comandoSemSudo
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\$/g, '\\$')
        .replace(/`/g, '\\`');
    
    let comandoFinal = '';
    
    switch (metodo.tipo) {
        case 'kdesu':
            comandoFinal = `kdesu -c "${comandoEscapado}" 2>/dev/null`;
            break;
            
        case 'pkexec':
            comandoFinal = `pkexec sh -c "${comandoEscapado}"`;
            break;
            
        case 'sudo_fallback':
            enviarLog(idComando, '⚠️ Usando fallback com sudo - pode expor senha!\n', 'warning');
            
            let promptSenha;
            if (desktop === 'KDE' || desktop === 'LXQT') {
                promptSenha = `kdialog --password "Digite sua senha de administrador:" --title "Fedora Only Fans - Autenticação" 2>/dev/null`;
            } else {
                promptSenha = `zenity --password --title="Fedora Only Fans" --text="Digite sua senha de administrador:" 2>/dev/null`;
            }
            
            const comandoPrompt = `${promptSenha} || ${desktop === 'KDE' ? 'zenity' : 'kdialog'} --password --title="Fedora Only Fans" 2>/dev/null`;
            
            exec(comandoPrompt, { 
                env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0' } 
            }, (errPrompt, senha) => {
                if (errPrompt || !senha || senha.trim().length === 0) {
                    enviarLog(idComando, '❌ Autenticação cancelada pelo usuário.\n', 'error');
                    return callback(new Error("Autenticação cancelada pelo usuário."), "", "");
                }
                
                const senhaLimpa = senha.trim().replace(/'/g, "'\\''");
                comandoFinal = `echo '${senhaLimpa}' | sudo -S sh -c "${comandoEscapado}"`;
                executarComandoComStream(comandoFinal, idComando, isReversao, callback);
            });
            return;
    }
    
    executarComandoComStream(comandoFinal, idComando, isReversao, callback);
}

// ============ FUNÇÃO PRINCIPAL DE EXECUÇÃO ============

function procederComExecucao(comando, idComando, isReversao, res) {
    // Validação de segurança
    const validacao = validarComando(comando);
    
    if (!validacao.valido) {
        console.warn(`[BLOQUEADO] ${idComando}: ${validacao.motivo}`);
        
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            success: false,
            output: `❌ Comando bloqueado por segurança!\n\nMotivo: ${validacao.motivo}`
        }));
    }
    
    const comandoSanitizado = sanitizarComando(comando);
    
    // Responde imediatamente que o comando foi aceito
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: true,
        output: 'Comando aceito. Acompanhe o progresso no log abaixo.'
    }));
    
    // Executa o comando em background
    setImmediate(() => {
        if (comandoSanitizado.includes('sudo ') || comandoSanitizado.includes('pkexec ') || comandoSanitizado.includes('kdesu ')) {
            executarComAutenticacaoSegura(comandoSanitizado, idComando, isReversao, (error, stdout, stderr) => {
                // Callback vazio pois já estamos usando SSE
            });
        } else {
            executarComandoComStream(comandoSanitizado, idComando, isReversao, (error, stdout, stderr) => {
                // Callback vazio pois já estamos usando SSE
            });
        }
    });
}

// ============ SERVIDOR HTTP ============

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // GET /stream - SSE para logs em tempo real
    if (req.method === 'GET' && req.url.startsWith('/stream')) {
        const urlParams = new URL(req.url, `http://${req.headers.host}`);
        const idComando = urlParams.searchParams.get('id');
        
        if (!idComando) {
            res.writeHead(400);
            res.end('ID do comando é obrigatório');
            return;
        }
        
        console.log(`[SSE] Cliente conectado para: ${idComando}`);
        
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        
        // Envia heartbeat a cada 30 segundos para manter conexão viva
        const heartbeat = setInterval(() => {
            res.write(': heartbeat\n\n');
        }, 30000);
        
        // Adiciona o cliente à lista
        adicionarClienteSSE(idComando, res);
        
        // Quando o cliente desconectar
        req.on('close', () => {
            clearInterval(heartbeat);
            console.log(`[SSE] Cliente desconectado: ${idComando}`);
        });
        
        return;
    }

    // GET / - Serve a interface HTML
    if (req.method === 'GET' && (req.url === '/' || req.url === '/fof.html')) {
        if (fs.existsSync(HTML_FILE)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            fs.createReadStream(HTML_FILE).pipe(res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Arquivo fof.html não encontrado.');
        }
        return;
    }

    // GET /status - Retorna progresso
    if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ executados: lerProgresso() }));
        return;
    }

    // GET /info - Informações do sistema
    if (req.method === 'GET' && req.url === '/info') {
        const desktop = detectarDesktop();
        const metodo = obterMetodoAutenticacao();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            desktop: desktop,
            autenticacao: metodo.descricao,
            nodeVersion: process.version,
            platform: process.platform,
            comandosPermitidos: COMANDOS_PERMITIDOS.length,
            padroesPerigosos: PADROES_PERIGOSOS.length
        }));
        return;
    }

    // GET /security - Informações de segurança
    if (req.method === 'GET' && req.url === '/security') {
        const info = {
            comandosPermitidos: COMANDOS_PERMITIDOS.length,
            padroesPerigosos: PADROES_PERIGOSOS.length,
            caracteresBloqueados: CARACTERES_BLOQUEADOS,
            timestamp: new Date().toISOString()
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(info));
        return;
    }

    // POST /executar ou /reverter
    if (req.method === 'POST' && (req.url === '/executar' || req.url === '/reverter')) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { comando, idComando } = JSON.parse(body);
                const isReversao = req.url === '/reverter';

                if (!comando || !idComando) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ 
                        success: false, 
                        output: 'Comando e ID são obrigatórios' 
                    }));
                }

                // Verifica se é um upgrade de versão
                if (comando.includes('system-upgrade download')) {
                    const match = comando.match(/--releasever=(\d+)/);
                    const versaoAlvo = match ? match[1] : null;

                    if (versaoAlvo) {
                        verificarSeVersaoExiste(versaoAlvo, (existe) => {
                            if (!existe) {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                return res.end(JSON.stringify({
                                    success: false,
                                    output: `[AVISO DE SEGURANÇA]: O Fedora ${versaoAlvo} ainda NÃO foi lançado oficialmente!`
                                }));
                            }
                            procederComExecucao(comando, idComando, isReversao, res);
                        });
                        return;
                    }
                }

                procederComExecucao(comando, idComando, isReversao, res);

            } catch (err) {
                console.error('[ERRO INTERNO]', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    output: 'Erro interno do servidor' 
                }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

// ============ TRATAMENTO DE ERROS ============

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`[ERRO]: A porta ${PORT} já está em uso.`);
        console.error(`   Execute: kill -9 $(lsof -t -i:${PORT})`);
    } else {
        console.error('[Erro do servidor]:', e.message);
    }
});

// ============ SHUTDOWN GRACEFUL ============

process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    // Fecha todas as conexões SSE
    sseClients.forEach((clients, id) => {
        clients.forEach(client => {
            client.end();
        });
    });
    sseClients.clear();
    
    server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
    });
});

// ============ INÍCIO ============

server.listen(PORT, () => {
    const desktop = detectarDesktop();
    const metodo = obterMetodoAutenticacao();
    console.log(`====================================================`);
    console.log(` 🐧 Fedora Only Fans - Servidor de Automação`);
    console.log(` 🌐 http://localhost:${PORT}`);
    console.log(` 🖥️  Desktop: ${desktop}`);
    console.log(` 🔐 Autenticação: ${metodo.descricao}`);
    console.log(` 📡 SSE: Ativo (logs em tempo real)`);
    console.log(` 🛡️  Comandos permitidos: ${COMANDOS_PERMITIDOS.length}`);
    console.log(` 🛡️  Padrões bloqueados: ${PADROES_PERIGOSOS.length}`);
    console.log(`====================================================`);
});