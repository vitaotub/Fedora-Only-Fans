const http = require('http');
const { exec, execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ARQUIVO_PROGRESSO = path.join(__dirname, '.progresso.json');
const HTML_FILE = path.join(__dirname, 'index.html');
const FOF_VERSION = '0.5.0-alpha';

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

    // ============================================================
    // CORREÇÃO: Comandos que NÃO precisam de autenticação
    // ============================================================
    const comandosSemAutenticacao = [
        'rpm -q',
        'uname -r',
        'ls /boot/vmlinuz-*',
        'which',
        'cat /etc/fedora-release',
        'hostname',
        'whoami'
    ];

    const precisaAutenticacao = !comandosSemAutenticacao.some(cmd => comandoFinal.includes(cmd));

    if (!precisaAutenticacao) {
        console.log(`[INFO] Comando SEM autenticação: ${comandoFinal}`);
        enviarLog(idComando, `$ ${comandoFinal}\n`, 'info');

        exec(comandoFinal, {
            shell: '/bin/bash',
            maxBuffer: 1024 * 1024 * 50,
            timeout: 30000
        }, (error, stdout, stderr) => {
            if (stdout) {
                enviarLog(idComando, stdout, 'output');
            }
            if (stderr) {
                const stderrFiltrado = stderr.replace(/\[sudo\] password for .+: /g, '');
                if (stderrFiltrado.trim()) {
                    enviarLog(idComando, stderrFiltrado, 'error');
                }
            }
            if (error) {
                enviarLog(idComando, `\n❌ Comando falhou com código: ${error.code || 1}\n`, 'error');
                console.error(`[ERRO] ${idComando}: Código ${error.code || 1}`);
                callback(error, stdout, stderr);
            } else {
                if (isReversao) {
                    removerProgresso(idComando);
                } else {
                    salvarProgresso(idComando);
                }
                enviarLog(idComando, `\n✅ Comando concluído com sucesso!\n`, 'success');
                console.log(`[SUCESSO] ${idComando}`);
                enviarLog(idComando, '__END__', 'end');
                callback(null, stdout, stderr);
            }
        });
        return;
    }

    // ============================================================
    // Comandos que precisam de autenticação
    // ============================================================

    enviarLog(idComando, `$ ${comandoFinal}\n`, 'info');
    enviarLog(idComando, '─'.repeat(50) + '\n', 'info');

    const isComplexo = comandoFinal.includes('|') ||
    comandoFinal.includes('<(') ||
    comandoFinal.includes('>') ||
    comandoFinal.includes('&&') ||
    comandoFinal.includes(';');

    if (isComplexo) {
        console.log(`[EXEC] Comando complexo detectado: ${comandoFinal}`);

        exec(comandoFinal, {
            shell: '/bin/bash',
            maxBuffer: 1024 * 1024 * 50,
            timeout: 1800000
        }, (error, stdout, stderr) => {
            if (stdout) {
                enviarLog(idComando, stdout, 'output');
            }
            if (stderr) {
                const stderrFiltrado = stderr.replace(/\[sudo\] password for .+: /g, '');
                if (stderrFiltrado.trim()) {
                    enviarLog(idComando, stderrFiltrado, 'error');
                }
            }

            if (error) {
                enviarLog(idComando, `\n❌ Comando falhou com código: ${error.code || 1}\n`, 'error');
                console.error(`[ERRO] ${idComando}: Código ${error.code || 1}`);
            } else {
                if (isReversao) {
                    removerProgresso(idComando);
                } else {
                    salvarProgresso(idComando);
                }
                enviarLog(idComando, `\n✅ Comando concluído com sucesso!\n`, 'success');
                console.log(`[SUCESSO] ${idComando}`);
            }

            enviarLog(idComando, '─'.repeat(50) + '\n', 'info');
            enviarLog(idComando, '✅ Tarefa concluída!\n', 'success');
            enviarLog(idComando, '__END__', 'end');

            callback(error, stdout, stderr);
        });
        return;
    }

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
        enviarLog(idComando, '✅ Tarefa concluída!\n', 'success');
        enviarLog(idComando, '__END__', 'end');

        callback(code === 0 ? null : new Error(`Código de saída: ${code}`), saidaCompleta, erros);
    });

    processo.on('error', (err) => {
        enviarLog(idComando, `\n❌ Erro ao iniciar processo: ${err.message}\n`, 'error');
        callback(err, saidaCompleta, erros);
    });
}

// ============================================================
// EXECUÇÃO COM AUTENTICAÇÃO SEGURA
// ============================================================

function executarComAutenticacaoSegura(comandoOriginal, idComando, isReversao, callback) {
    const desktop = detectarDesktop();
    const metodo = obterMetodoAutenticacao();

    const descricoesComandos = {
        'dnf upgrade': 'Atualizar o sistema Fedora',
        'dnf install': 'Instalar pacotes',
        'dnf remove': 'Remover pacotes',
        'dnf autoremove': 'Remover dependências não utilizadas',
        'dnf clean': 'Limpar cache do sistema',
        'dnf config-manager': 'Configurar gerenciador de pacotes',
        'dnf distro-sync': 'Sincronizar pacotes com o canal estável',
        'dnf system-upgrade': 'Atualizar versão do Fedora',
        'dnf swap': 'Substituir pacotes',
        'dnf groupinstall': 'Instalar grupo de pacotes',
        'flatpak install': 'Instalar aplicativo Flatpak',
        'flatpak uninstall': 'Remover aplicativo Flatpak',
        'flatpak update': 'Atualizar aplicativos Flatpak',
        'flatpak remote-add': 'Adicionar repositório Flatpak',
        'localectl': 'Alterar configurações de localidade',
        'timedatectl': 'Alterar data e hora do sistema',
        'fwupdmgr': 'Atualizar firmware do hardware'
    };

    let descricao = 'Executar comando administrativo';
    for (const [key, value] of Object.entries(descricoesComandos)) {
        if (comandoOriginal.includes(key)) {
            descricao = value;
            break;
        }
    }

    if (descricao === 'Executar comando administrativo' && idComando) {
        const descricoesPorId = {
            'atualizacao-inicial': 'Atualizar o sistema Fedora',
            'dnf-speed': 'Ajustar velocidade de download do DNF',
            'idioma-packs': 'Instalar pacotes de idioma PT-BR',
            'idioma-hunspell': 'Instalar corretor ortográfico PT-BR',
            'idioma-localectl': 'Configurar localidade PT-BR',
            'dual-boot-time': 'Corrigir relógio para dual-boot',
            'rpm-fusion': 'Ativar repositórios RPM Fusion',
            'flatpak-setup': 'Configurar Flatpak e Flathub',
            'arquivos-compactados': 'Instalar suporte a arquivos compactados',
            'codecs-essenciais': 'Instalar codecs multimídia',
            'firmware-update': 'Atualizar firmware do hardware',
            'extras-tainted': 'Instalar extras e suporte a DVD',
            'vaapi-amd': 'Instalar aceleração gráfica VA-API',
            'vaapi-swap': 'Substituir drivers de aceleração gráfica',
            'fontes-ms-all': 'Instalar fontes Microsoft',
            'vulkan-amd': 'Instalar drivers Vulkan para AMD',
            'steam-install': 'Instalar Steam',
            'obs-cam': 'Instalar câmera virtual para OBS',
            'instalar-easyeffects': 'Instalar EasyEffects',
            'limpeza-sistema': 'Limpar arquivos temporários e cache',
            'system-upgrade': 'Baixar atualização de versão do Fedora',
            'distro-sync': 'Sincronizar pacotes com o canal estável'
        };
        if (descricoesPorId[idComando]) {
            descricao = descricoesPorId[idComando];
        }
    }

    enviarLog(idComando, `🔐 Autenticando para: ${descricao}\n`, 'info');

    const comandoSemSudo = comandoOriginal.replace(/sudo\s+/g, '');
    const comandoEscapado = comandoSemSudo
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`');

    let comandoFinal = '';

    switch (metodo.tipo) {
        case 'pkexec': {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const scriptTemp = `/tmp/fof-cmd-${timestamp}-${random}.sh`;

            const scriptContent = `#!/bin/bash
            # Fedora Only Fans - ${descricao}
            # Executado em: $(date '+%d/%m/%Y %H:%M:%S')

            ${comandoEscapado}
            `;

            try {
                fs.writeFileSync(scriptTemp, scriptContent, { mode: 0o755 });
                console.log(`[PKEXEC] Script criado: ${scriptTemp}`);
            } catch (err) {
                enviarLog(idComando, `❌ Erro ao criar script temporário: ${err.message}\n`, 'error');
                return callback(err, "", "");
            }

            comandoFinal = `pkexec ${scriptTemp} && rm -f ${scriptTemp}`;

            setTimeout(() => {
                if (fs.existsSync(scriptTemp)) {
                    try {
                        fs.unlinkSync(scriptTemp);
                        console.log(`[PKEXEC] Limpeza forçada: ${scriptTemp} removido`);
                    } catch(e) {}
                }
            }, 60000);
            break;
        }

        case 'sudo_fallback':
            enviarLog(idComando, '⚠️ Usando fallback com sudo - pode expor senha!\n', 'warning');

            let promptSenha;
            if (desktop === 'KDE' || desktop === 'LXQT') {
                promptSenha = `kdialog --password "Digite sua senha de administrador:" --title "Fedora Only Fans - ${descricao}" 2>/dev/null`;
            } else {
                promptSenha = `zenity --password --title="Fedora Only Fans" --text="🔐 ${descricao}" 2>/dev/null`;
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
                executarComandoComStream(comandoFinal, idComando, isReversao, (error, stdout, stderr) => {
                    callback(error, stdout, stderr);
                });
            });
            return;
    }

    executarComandoComStream(comandoFinal, idComando, isReversao, callback);
}

// ============ FUNÇÃO PRINCIPAL DE EXECUÇÃO ============

function procederComExecucao(comando, idComando, isReversao, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: true,
        output: 'Comando aceito. Acompanhe o progresso no log abaixo.'
    }));

    setImmediate(() => {
        // ============================================================
        // CORREÇÃO: Lista de comandos que NÃO precisam de autenticação
        // ============================================================
        const comandosSemAutenticacao = [
            'rpm -q',
            'uname -r',
            'ls /boot/vmlinuz-*',
            'which',
            'cat /etc/fedora-release',
            'hostname',
            'whoami',
            'rpm -qa'
        ];

        // CORREÇÃO: Usar let em vez de const
        let precisaAutenticacao = false;

        // Verifica se o comando está na lista de comandos sem autenticação
        const isSemAutenticacao = comandosSemAutenticacao.some(cmd =>
        comando.includes(cmd)
        );

        // Se o comando contém 'sudo' ou 'dnf remove' ou 'dnf install', precisa autenticação
        if (comando.includes('sudo ') ||
            comando.includes('pkexec ') ||
            comando.includes('kdesu ') ||
            comando.includes('dnf remove') ||
            comando.includes('dnf install') ||
            comando.includes('dnf autoremove')) {
            precisaAutenticacao = true;
            }

            // Se não está na lista de comandos sem autenticação, precisa autenticação
            if (!isSemAutenticacao && !precisaAutenticacao) {
                precisaAutenticacao = true;
            }

            if (precisaAutenticacao) {
                console.log(`[AUTH] Comando requer autenticação: ${comando}`);
                executarComAutenticacaoSegura(comando, idComando, isReversao, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`[ERRO] ${idComando}:`, error.message);
                    }
                });
            } else {
                console.log(`[NOAUTH] Comando NÃO requer autenticação: ${comando}`);
                executarComandoComStream(comando, idComando, isReversao, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`[ERRO] ${idComando}:`, error.message);
                    }
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
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
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

    // ============ ROTAS PARA ARQUIVOS ============

    // Landing page
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        if (fs.existsSync(path.join(__dirname, 'index.html'))) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Arquivo index.html não encontrado.');
        }
        return;
    }

    // Modo Guiado
    if (req.method === 'GET' && req.url === '/guiado.html') {
        servirArquivoEstatico(req, res, 'guiado.html');
        return;
    }

    // Modo Avançado
    if (req.method === 'GET' && req.url === '/avancado.html') {
        servirArquivoEstatico(req, res, 'avancado.html');
        return;
    }

    // Sessões (00 a 08)
    if (req.method === 'GET' && req.url.match(/^\/(0[0-8]-[a-z-]+\.html)$/)) {
        const match = req.url.match(/^\/(0[0-8]-[a-z-]+\.html)$/);
        if (match) {
            servirArquivoEstatico(req, res, match[1]);
            return;
        }
    }

    // CSS
    if (req.method === 'GET' && req.url === '/style.css') {
        servirArquivoEstatico(req, res, 'style.css');
        return;
    }

    // JavaScript
    if (req.method === 'GET' && req.url === '/script.js') {
        servirArquivoEstatico(req, res, 'script.js');
        return;
    }

    // Ícone
    if (req.method === 'GET' && req.url === '/icone_app.png') {
        servirArquivoEstatico(req, res, 'icone_app.png');
        return;
    }

    // Status
    if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ executados: lerProgresso() }));
        return;
    }

    // Info
    if (req.method === 'GET' && req.url === '/info') {
        const desktop = detectarDesktop();
        const metodo = obterMetodoAutenticacao();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            desktop: desktop,
            autenticacao: metodo.descricao,
            nodeVersion: process.version,
            platform: process.platform,
            version: '0.4.0-alpha'
        }));
        return;
    }

    // Security
    if (req.method === 'GET' && req.url === '/security') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'Whitelist removida',
            mensagem: 'Todos os comandos são permitidos'
        }));
        return;
    }

    // Executar / Reverter
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
    console.log(` 🐧 Fedora Only Fans - Servidor de Automação v${FOF_VERSION}`);
    console.log(` 🌐 http://localhost:${PORT}`);
    console.log(` 🖥️  Desktop: ${desktop}`);
    console.log(` 🔐 Autenticação: ${metodo.descricao}`);
    console.log(` 📡 SSE: Ativo (logs em tempo real)`);
    console.log(` 🛡️  Whitelist: Removida (todos os comandos são permitidos)`);
    console.log(` 📁 Arquivos estáticos: Ativo (HTML, CSS, JS, ícone)`);
    console.log(` 📝 Script Wrapper: Ativo (pkexec)`);
    console.log(` 📄 Página inicial: index.html (Landing Page)`);
    console.log(` 🔧 Comandos SEM autenticação: rpm -q, uname -r, ls /boot/vmlinuz-*, curl`);
    console.log(`====================================================`);
});
