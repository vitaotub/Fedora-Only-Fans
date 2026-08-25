const http = require('http');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ARQUIVO_PROGRESSO = path.join(__dirname, '.progresso.json');
const FOF_VERSION = '0.9.5-alpha';

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

function resetarProgresso() {
    try {
        if (fs.existsSync(ARQUIVO_PROGRESSO)) {
            fs.unlinkSync(ARQUIVO_PROGRESSO);
            console.log('[PROGRESS] Arquivo .progresso.json removido');
        }
        return true;
    } catch (e) {
        console.error("[Erro ao resetar progresso]:", e.message);
        return false;
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

    return 'UNKNOWN';
}

// ============ AUTENTICAÇÃO ============

function verificarDisponibilidadePkexec() {
    try {
        const result = require('child_process').execSync('which pkexec', { encoding: 'utf8', timeout: 1000 });
        return result.trim().length > 0;
    } catch (e) {
        return false;
    }
}

function obterMetodoAutenticacao() {
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

// ============================================================
// FUNÇÃO AUXILIAR: Verifica se um comando existe
// ============================================================

function commandExists(cmd) {
    try {
        const result = require('child_process').execSync(`which ${cmd}`, { encoding: 'utf8', timeout: 1000 });
        return result.trim().length > 0;
    } catch (e) {
        return false;
    }
}

// ============ EXECUÇÃO COM STREAM ============

function executarComandoComStream(comandoFinal, idComando, isReversao, callback) {
    // ============================================================
    // Comandos que NÃO precisam de autenticação
    // CORREÇÃO: Removidos todos os comandos flatpak
    // ============================================================
    const comandosSemAutenticacao = [
        'rpm -q',
        'uname -r',
        'ls /boot/vmlinuz-*',
        'which',
        'cat /etc/fedora-release',
        'hostname',
        'whoami',
        'test',
        'gtk-launch',
        'bash <(curl',
        'echo "s" | bash'
    ];

    const precisaAutenticacao = !comandosSemAutenticacao.some(cmd => comandoFinal.includes(cmd));

    if (!precisaAutenticacao) {
        console.log(`[INFO] Comando SEM autenticação: ${comandoFinal.substring(0, 50)}...`);
        enviarLog(idComando, `$ ${comandoFinal}\n`, 'info');

        // Configura ambiente para flatpak (caso seja um comando flatpak)
        const env = { ...process.env };
        if (comandoFinal.includes('flatpak')) {
            let uid = 1000;
            try {
                uid = process.getuid ? process.getuid() : 1000;
            } catch (e) {
                uid = 1000;
            }
            env.XDG_RUNTIME_DIR = `/run/user/${uid}`;
            env.DBUS_SESSION_BUS_ADDRESS = `unix:path=/run/user/${uid}/bus`;
            if (!env.HOME) {
                env.HOME = process.env.HOME || '/home/' + (process.env.USER || 'user');
            }
            console.log(`[FLATPAK] XDG_RUNTIME_DIR=${env.XDG_RUNTIME_DIR}`);
            console.log(`[FLATPAK] DBUS_SESSION_BUS_ADDRESS=${env.DBUS_SESSION_BUS_ADDRESS}`);
            console.log(`[FLATPAK] HOME=${env.HOME}`);
        }

        exec(comandoFinal, {
            shell: '/bin/bash',
            maxBuffer: 1024 * 1024 * 50,
            timeout: 30000,
            env: env
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
        console.log(`[EXEC] Comando complexo: ${comandoFinal.substring(0, 50)}...`);

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

    // Comandos simples com spawn
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

// ============ EXECUÇÃO COM AUTENTICAÇÃO SEGURA ============

function executarComAutenticacaoSegura(comandoOriginal, idComando, isReversao, callback) {
    const desktop = detectarDesktop();

    // Descrição do comando para o usuário
    const descricoesComandos = {
        'dnf upgrade': 'Atualizar o sistema Fedora',
        'dnf install': 'Instalar pacotes',
        'dnf remove': 'Remover pacotes',
        'dnf autoremove': 'Remover dependências não utilizadas',
        'dnf clean': 'Limpar cache do sistema',
        'dnf config-manager': 'Configurar gerenciador de pacotes DNF',
        'dnf distro-sync': 'Sincronizar pacotes com o canal estável',
        'dnf system-upgrade': 'Atualizar versão do Fedora',
        'dnf swap': 'Substituir pacotes',
        'dnf groupinstall': 'Instalar grupo de pacotes',
        'localectl': 'Alterar configurações de localidade',
        'timedatectl': 'Alterar data e hora do sistema',
        'rm -rf /usr/share/fonts/microsoft': 'Remover fontes Microsoft',
        'btrfs': 'Gerenciar snapshots Btrfs',
        'grub2-mkconfig': 'Reconfigurar GRUB',
        'sed -i': 'Modificar arquivo de configuração',
        'flatpak install': 'Instalar aplicativo Flatpak',
        'flatpak uninstall': 'Remover aplicativo Flatpak',
        'flatpak update': 'Atualizar aplicativos Flatpak',
        'flatpak remote-add': 'Adicionar repositório Flatpak'
    };

    let descricao = 'Executar comando administrativo';
    for (const [key, value] of Object.entries(descricoesComandos)) {
        if (comandoOriginal.includes(key)) {
            descricao = value;
            break;
        }
    }

    enviarLog(idComando, `🔐 Autenticando para: ${descricao}\n`, 'info');

    const comandoSemSudo = comandoOriginal.replace(/sudo\s+/g, '');

    const hasPkexec = commandExists('pkexec');
    const hasKdesu = commandExists('kdesu');
    const hasZenity = commandExists('zenity');
    const hasKdialog = commandExists('kdialog');

    console.log(`[AUTH] Desktop: ${desktop}, pkexec: ${hasPkexec}, kdesu: ${hasKdesu}`);

    // ============================================================
    // 1. PRIORIDADE: kdesu (para KDE - mais confiável)
    // ============================================================
    if (desktop === 'KDE' && hasKdesu) {
        enviarLog(idComando, '🪟 Usando kdesu (KDE) com interface gráfica...\n', 'info');

        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const scriptTemp = `/tmp/fof-cmd-${timestamp}-${random}.sh`;

        const homeDir = process.env.HOME || '/home/' + (process.env.USER || 'user');
        const scriptContent = `#!/bin/bash
        # Fedora Only Fans - ${descricao}
        # Executado em: $(date '+%d/%m/%Y %H:%M:%S')
        export DISPLAY=${process.env.DISPLAY || ':0'}
        export XAUTHORITY=${process.env.XAUTHORITY || '${homeDir}/.Xauthority'}
        ${comandoSemSudo}
        `;

        try {
            fs.writeFileSync(scriptTemp, scriptContent, { mode: 0o755 });
            console.log(`[KDESU] Script criado: ${scriptTemp}`);
        } catch (err) {
            enviarLog(idComando, `❌ Erro ao criar script: ${err.message}\n`, 'error');
            return callback(err, "", "");
        }

        const comandoFinal = `kdesu -c "${scriptTemp}" 2>/dev/null && rm -f ${scriptTemp}`;

        setTimeout(() => {
            if (fs.existsSync(scriptTemp)) {
                try { fs.unlinkSync(scriptTemp); } catch (e) {}
            }
        }, 60000);

        executarComandoComStream(comandoFinal, idComando, isReversao, callback);
        return;
    }

    // ============================================================
    // 2. pkexec (para GNOME, XFCE, Cinnamon, etc.)
    // ============================================================
    if (hasPkexec) {
        enviarLog(idComando, '🔑 Usando pkexec com interface gráfica...\n', 'info');

        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const scriptTemp = `/tmp/fof-cmd-${timestamp}-${random}.sh`;

        const homeDir = process.env.HOME || '/home/' + (process.env.USER || 'user');
        const scriptContent = `#!/bin/bash
        # Fedora Only Fans - ${descricao}
        export DISPLAY=${process.env.DISPLAY || ':0'}
        export XAUTHORITY=${process.env.XAUTHORITY || '${homeDir}/.Xauthority'}
        export DBUS_SESSION_BUS_ADDRESS=${process.env.DBUS_SESSION_BUS_ADDRESS || ''}
        ${comandoSemSudo}
        `;

        try {
            fs.writeFileSync(scriptTemp, scriptContent, { mode: 0o755 });
            console.log(`[PKEXEC] Script criado: ${scriptTemp}`);
        } catch (err) {
            enviarLog(idComando, `❌ Erro ao criar script: ${err.message}\n`, 'error');
            return callback(err, "", "");
        }

        const comandoFinal = `pkexec --disable-internal-agent ${scriptTemp} && rm -f ${scriptTemp}`;

        setTimeout(() => {
            if (fs.existsSync(scriptTemp)) {
                try { fs.unlinkSync(scriptTemp); } catch (e) {}
            }
        }, 60000);

        executarComandoComStream(comandoFinal, idComando, isReversao, callback);
        return;
    }

    // ============================================================
    // 3. Fallback: zenity/kdialog (último recurso)
    // ============================================================
    enviarLog(idComando, '⚠️ Usando fallback com zenity/kdialog...\n', 'warning');

    let promptSenha;
    if (hasKdialog && (desktop === 'KDE' || desktop === 'LXQT')) {
        promptSenha = `kdialog --password "Digite sua senha de administrador:" --title "Fedora Only Fans - ${descricao}" 2>/dev/null`;
    } else if (hasZenity) {
        promptSenha = `zenity --password --title="Fedora Only Fans" --text="🔐 ${descricao}" 2>/dev/null`;
    } else {
        promptSenha = `kdialog --password "Digite sua senha de administrador:" --title "Fedora Only Fans - ${descricao}" 2>/dev/null || zenity --password --title="Fedora Only Fans" --text="🔐 ${descricao}" 2>/dev/null`;
    }

    const comandoPrompt = `${promptSenha}`;

    exec(comandoPrompt, {
        env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0' }
    }, (errPrompt, senha) => {
        if (errPrompt || !senha || senha.trim().length === 0) {
            enviarLog(idComando, '❌ Autenticação cancelada pelo usuário.\n', 'error');
            return callback(new Error("Autenticação cancelada pelo usuário."), "", "");
        }

        const senhaLimpa = senha.trim().replace(/'/g, "'\\''");
        const comandoEscapado = comandoSemSudo
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\$/g, '\\$')
        .replace(/`/g, '\\`');

        const comandoFinal = `echo '${senhaLimpa}' | sudo -S sh -c "${comandoEscapado}"`;
        executarComandoComStream(comandoFinal, idComando, isReversao, callback);
    });
}

// ============ PROCEDER COM EXECUÇÃO ============

function procederComExecucao(comando, idComando, isReversao, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: true,
        output: 'Comando aceito. Acompanhe o progresso no log abaixo.'
    }));

    setImmediate(() => {
        // ============================================================
        // Comandos que NÃO precisam de autenticação
        // CORREÇÃO: Removidos todos os comandos flatpak
        // ============================================================
        const comandosSemAutenticacao = [
            'rpm -q',
            'uname -r',
            'ls /boot/vmlinuz-*',
            'which',
            'cat /etc/fedora-release',
            'hostname',
            'whoami',
            'test',
            'gtk-launch',
            'bash <(curl',
                 'echo "s" | bash'
        ];

        const comandosComAutenticacao = [
            'dnf config-manager',
            'dnf remove',
            'dnf install',
            'dnf autoremove',
            'dnf upgrade',
            'dnf update',
            'dnf swap',
            'dnf distro-sync',
            'dnf system-upgrade',
            'localectl',
            'timedatectl',
            'rm -rf',
            'btrfs',
            'snapper',
            'grub2-mkconfig',
            'sed -i',
            'flatpak install',
            'flatpak uninstall',
            'flatpak update',
            'flatpak remote-add'
        ];

        let precisaAutenticacao = false;
        let isSemAutenticacao = false;

        for (const cmd of comandosSemAutenticacao) {
            if (comando.includes(cmd)) {
                isSemAutenticacao = true;
                console.log(`[AUTH] Comando SEM autenticação detectado: ${cmd}`);
                break;
            }
        }

        if (!isSemAutenticacao) {
            for (const cmd of comandosComAutenticacao) {
                if (comando.includes(cmd)) {
                    precisaAutenticacao = true;
                    console.log(`[AUTH] Comando COM autenticação detectado: ${cmd}`);
                    break;
                }
            }
            if (!precisaAutenticacao) {
                precisaAutenticacao = true;
                console.log(`[AUTH] Comando não identificado, assumindo que precisa de autenticação`);
            }
        }

        if (comando.includes('dnf')) {
            precisaAutenticacao = true;
            console.log(`[AUTH] FORÇANDO autenticação gráfica para comando dnf`);
        }

        console.log(`[AUTH] ${idComando}: SemAuth=${isSemAutenticacao}, PrecisaAuth=${precisaAutenticacao}`);

        if (precisaAutenticacao) {
            executarComAutenticacaoSegura(comando, idComando, isReversao, (error) => {
                if (error) {
                    console.error(`[ERRO] ${idComando}:`, error.message);
                }
            });
        } else {
            executarComandoComStream(comando, idComando, isReversao, (error) => {
                if (error) {
                    console.error(`[ERRO] ${idComando}:`, error.message);
                }
            });
        }
    });
}

// ============ SERVER - ARQUIVOS ESTÁTICOS ============

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
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = req.url;

    // ===== SSE STREAM =====
    if (req.method === 'GET' && url.startsWith('/stream')) {
        const urlParams = new URL(url, `http://${req.headers.host}`);
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

    // ===== PROGRESSO - GET =====
    if (req.method === 'GET' && url === '/progress') {
        const progresso = lerProgresso();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            executados: progresso,
            pulados: []
        }));
        return;
    }

    // ===== PROGRESSO - POST =====
    if (req.method === 'POST' && url === '/progress') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { executados } = JSON.parse(body);
                if (executados && Array.isArray(executados)) {
                    if (fs.existsSync(ARQUIVO_PROGRESSO)) {
                        fs.unlinkSync(ARQUIVO_PROGRESSO);
                    }
                    executados.forEach(id => salvarProgresso(id));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // ===== PROGRESSO - DELETE =====
    if (req.method === 'DELETE' && url === '/progress') {
        try {
            if (fs.existsSync(ARQUIVO_PROGRESSO)) {
                fs.unlinkSync(ARQUIVO_PROGRESSO);
                console.log('[PROGRESS] Arquivo .progresso.json removido');
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // ===== PÁGINAS HTML =====

    if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
        servirArquivoEstatico(req, res, 'index.html');
        return;
    }

    if (req.method === 'GET' && url === '/guiado.html') {
        servirArquivoEstatico(req, res, 'guiado.html');
        return;
    }

    if (req.method === 'GET' && url === '/avancado.html') {
        servirArquivoEstatico(req, res, 'avancado.html');
        return;
    }

    if (req.method === 'GET' && url.match(/^\/(0[0-8]-[a-z-]+\.html)$/)) {
        const match = url.match(/^\/(0[0-8]-[a-z-]+\.html)$/);
        if (match) {
            servirArquivoEstatico(req, res, match[1]);
            return;
        }
    }

    if (req.method === 'GET' && url === '/style.css') {
        servirArquivoEstatico(req, res, 'style.css');
        return;
    }

    if (req.method === 'GET' && url === '/script.js') {
        servirArquivoEstatico(req, res, 'script.js');
        return;
    }

    if (req.method === 'GET' && (url === '/icone_app.png' || url === '/favicon.ico')) {
        servirArquivoEstatico(req, res, 'icone_app.png');
        return;
    }

    // ===== API =====

    if (req.method === 'GET' && url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ executados: lerProgresso() }));
        return;
    }

    if (req.method === 'GET' && url === '/info') {
        const desktop = detectarDesktop();
        const metodo = obterMetodoAutenticacao();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            desktop: desktop,
            autenticacao: metodo.descricao,
            nodeVersion: process.version,
            platform: process.platform,
            version: FOF_VERSION
        }));
        return;
    }

    if (req.method === 'POST' && (url === '/executar' || url === '/reverter')) {
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
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Página não encontrada');
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
    sseClients.forEach((clients) => {
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
    console.log(` 📁 Arquivos estáticos: Ativo (HTML, CSS, JS, ícone)`);
    console.log(` 📄 Páginas: index.html, guiado.html, avancado.html, 00-*.html a 08-*.html`);
    console.log(` 🔧 Comandos SEM autenticação: rpm -q, uname -r, bash <(curl), etc`);
    console.log(` 📊 Progresso: .progresso.json (persistente no servidor)`);
    console.log(`====================================================`);
});
