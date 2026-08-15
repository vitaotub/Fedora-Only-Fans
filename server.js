const http = require('http');
const { exec, execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ARQUIVO_PROGRESSO = path.join(__dirname, '.progresso.json');
const HTML_FILE = path.join(__dirname, 'fof.html');

// ============ VARIÁVEIS DE STREAM ============

const sseClients = new Map();

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

    const processo = spawn(comandoFinal, {
        shell: '/bin/bash',
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let saidaCompleta = '';
    let erros = '';

    processo.stdout.on('data', (data) => {
        const texto = data.toString();
        saidaCompleta += texto;
        enviarLog(idComando, texto, 'output');
    });

    processo.stderr.on('data', (data) => {
        const texto = data.toString();
        erros += texto;
        const textoFiltrado = texto.replace(/\[sudo\] password for .+: /g, '');
        if (textoFiltrado.trim()) {
            enviarLog(idComando, textoFiltrado, 'error');
        }
    });

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
        enviarLog(idComando, '__END__', 'end');

        callback(code === 0 ? null : new Error(`Código de saída: ${code}`), saidaCompleta, erros);
    });

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

// ============ FUNÇÃO PRINCIPAL DE EXECUÇÃO (SEM WHITELIST) ============

function procederComExecucao(comando, idComando, isReversao, res) {
    // Remove qualquer validação de whitelist - executa diretamente

    // Responde imediatamente que o comando foi aceito
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: true,
        output: 'Comando aceito. Acompanhe o progresso no log abaixo.'
    }));

    // Executa o comando em background
    setImmediate(() => {
        if (comando.includes('sudo ') || comando.includes('pkexec ') || comando.includes('kdesu ')) {
            executarComAutenticacaoSegura(comando, idComando, isReversao, (error, stdout, stderr) => {
                // Callback vazio pois já estamos usando SSE
            });
        } else {
            executarComandoComStream(comando, idComando, isReversao, (error, stdout, stderr) => {
                // Callback vazio pois já estamos usando SSE
            });
        }
    });
}

// ============ SERVER ARQUIVOS ESTÁTICOS ============

function servirArquivoEstatico(req, res, filePath) {
    const fullPath = path.join(__dirname, filePath);

    if (fs.existsSync(fullPath)) {
        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.css': 'text/css',
            '.js': 'application/javascript'
        };

        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mimeType });
        fs.createReadStream(fullPath).pipe(res);
    } else {
        res.writeHead(404);
        res.end('Arquivo não encontrado');
    }
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

        const heartbeat = setInterval(() => {
            res.write(': heartbeat\n\n');
        }, 30000);

        adicionarClienteSSE(idComando, res);

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

    // GET /icone_app.png - Serve o ícone
    if (req.method === 'GET' && req.url === '/icone_app.png') {
        servirArquivoEstatico(req, res, 'icone_app.png');
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
            platform: process.platform
        }));
        return;
    }

    // GET /security - Informações de segurança
    if (req.method === 'GET' && req.url === '/security') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'Whitelist removida',
            mensagem: 'Todos os comandos são permitidos'
        }));
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
    console.log(` 🛡️  Whitelist: Removida (todos os comandos são permitidos)`);
    console.log(` 📁 Arquivos estáticos: Ativo (ícone, etc)`);
    console.log(`====================================================`);
});
