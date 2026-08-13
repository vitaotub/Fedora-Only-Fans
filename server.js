const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ARQUIVO_PROGRESSO = path.join(__dirname, '.progresso.json');

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

function verificarSeVersaoExiste(versao, callback) {
    const urlCheck = `https://mirrors.fedoraproject.org/mirrorlist?repo=fedora-${versao}&arch=x86_64`;
    exec(`curl -s --max-time 4 -o /dev/null -w "%{http_code}" "${urlCheck}"`, (err, stdout) => {
        const statusCode = parseInt(stdout.trim(), 10);
        if (!err && statusCode === 200) callback(true);
        else callback(false);
    });
}

// Função dinamicamente adaptada para qualquer Desktop Environment (KDE, GNOME, XFCE, etc.)
function obterComandoPromptSenha() {
    const desktop = (process.env.XDG_CURRENT_DESKTOP || '').toUpperCase();
    
    // Se estiver no GNOME ou ferramentas GTK preferíveis
    if (desktop.includes('GNOME') || desktop.includes('XFCE') || desktop.includes('PANEL')) {
        return `zenity --password --title="Autenticação do Sistema" --text="Este ajuste requer privilégios de administrador. Digite sua senha:"`;
    } 
    // Se estiver no KDE Plasma
    else if (desktop.includes('KDE')) {
        return `kdialog --password "Este ajuste requer privilégios de administrador. Digite sua senha:" --title "Autenticação do Sistema"`;
    } 
    // Fallbacks para caso o ambiente não declare ou a ferramenta principal não esteja disponível
    return `zenity --password --title="Autenticação do Sistema" --text="Digite sua senha de administrador:" 2>/dev/null || kdialog --password "Digite sua senha de administrador:" --title "Autenticação do Sistema" 2>/dev/null`;
}

function executarComSudoGrafico(comandoOriginal, idComando, isReversao, callback) {
    const envGrafico = { env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0' } };
    const comandoPrompt = obterComandoPromptSenha();

    exec(comandoPrompt, envGrafico, (errPrompt, senha, stderrPrompt) => {
        if (errPrompt || !senha) {
            return callback(new Error("Autenticação cancelada pelo usuário."), "", "Operação abortada.");
        }

        const senhaLimpa = senha.trim().replace(/'/g, "'\\''");

        const comandoSemSudoRepetido = comandoOriginal.replace(/sudo /g, '');

        const comandoEscapado = comandoSemSudoRepetido
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\$/g, '\\$');

        const comandoComSudoS = `echo '${senhaLimpa}' | sudo -S sh -c "${comandoEscapado}"`;

        exec(comandoComSudoS, (error, stdout, stderr) => {
            let stderrFiltrado = stderr ? stderr.replace(/\[sudo\] password for .+: /g, '') : '';
            if (!error) {
                if (isReversao) removerProgresso(idComando);
                else salvarProgresso(idComando);
            }
            callback(error, stdout, stderrFiltrado);
        });
    });
}

function procederComExecucao(comando, idComando, isReversao, res) {
    if (comando.includes('sudo ')) {
        executarComSudoGrafico(comando, idComando, isReversao, (error, stdout, stderr) => {
            let outputFinal = '';
            if (stdout) outputFinal += stdout;
            if (stderr) outputFinal += `\n${stderr}`;
            if (error) outputFinal += `\n[Erro]: ${error.message}`;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: !error, output: outputFinal }));
        });
    } else {
        exec(comando, (error, stdout, stderr) => {
            let outputFinal = '';
            if (stdout) outputFinal += stdout;
            if (stderr) outputFinal += `\n${stderr}`;
            if (error) outputFinal += `\n[Erro]: ${error.message}`;

            if (!error) {
                if (isReversao) removerProgresso(idComando);
                else salvarProgresso(idComando);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: !error, output: outputFinal }));
        });
    }
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200); res.end(); return;
    }

    if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ executados: lerProgresso() }));
        return;
    }

    if (req.method === 'POST' && (req.url === '/executar' || req.url === '/reverter')) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { comando, idComando } = JSON.parse(body);
                const isReversao = req.url === '/reverter';

                if (!comando) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Nenhum comando fornecido' }));
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
                                    output: `[AVISO DE SEGURANÇA]: O Fedora ${versaoAlvo} ainda NÃO foi lançado oficialmente nos repositórios públicos do projeto!\n\nOperação cancelada.`
                                }));
                            }
                            procederComExecucao(comando, idComando, isReversao, res);
                        });
                        return;
                    }
                }

                procederComExecucao(comando, idComando, isReversao, res);

            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Erro interno.' }));
            }
        });
    } else {
        res.writeHead(404); res.end();
    }
});

server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Servidor de Automação Fedora Ativo na Porta ${PORT}`);
    console.log(`====================================================`);
});