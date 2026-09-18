const http = require('http');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ARQUIVO_PROGRESSO = path.join(__dirname, '.progresso.json');
const FOF_VERSION = '1.0.0-rc.2';

const LANGS_SUPORTADOS = ['pt-BR', 'en', 'es'];
const LOCALES_DIR = path.join(__dirname, 'locales');

const COMANDOS_SEM_AUTENTICACAO = [
'rpm -q',
'uname -r',
'ls /boot/vmlinuz-*',
'which',
'cat /etc/fedora-release',
'hostname',
'whoami',
'test',
'gtk-launch',
'rclone-manager',
'corectrl',
'lact',
'waydroid',
'bash <(curl',
'echo "s" | bash'
];

function _cmdSemAutenticacao(comando) {
const trimmed = (comando || '').trim();
return COMANDOS_SEM_AUTENTICACAO.some(function(cmd) {
return trimmed === cmd
|| trimmed.startsWith(cmd + ' ')
|| trimmed.startsWith(cmd + '\t');
});
}

function _filtrarLog(mensagem) {
if (!mensagem) return mensagem;

// Normalização de \r: barras de progresso usam \r sozinho para
// "sobrescrever" a linha. Como o WebKit não faz isso, convertemos
// tudo para \n — cada atualização vira uma linha nova no log.
mensagem = mensagem.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Filtro de ruído do portal KDE/Qt (kdesu sem sessão gráfica)
if (mensagem.indexOf('qt.qpa') === -1 &&
mensagem.indexOf('QDBusError') === -1 &&
mensagem.indexOf('portal') === -1) {
return mensagem;
}
const linhas = mensagem.split('\n');
const filtradas = linhas.filter(function(line) {
if (line.includes('qt.qpa.services: failed to register with host portal')) return false;
if (line.includes('QDBusError("org.freedesktop.portal.Error.Failed"')) return false;
if (line.includes('could not register app ID:')) return false;
return true;
});
return filtradas.join('\n');
}

const HOME_DIR_USUARIO = process.env.HOME || ('/home/' + (process.env.USER || 'user'));
const USUARIO_REAL = process.env.USER || process.env.LOGNAME || 'user';

// Substitui ~, $HOME, $USER, $SUDO_USER pelos valores reais do
// usuário ANTES de escrever o script que roda como root. Sem isso,
// `cd ~/.local/share/fof-waydroid/...` expandiria para /root e
// quebraria os extras do Waydroid.
function _substituirCaminhosUsuario(comando) {
if (!comando) return comando;
return comando
.replace(/~\//g, HOME_DIR_USUARIO + '/')
.replace(/\$HOME\b/g, HOME_DIR_USUARIO)
.replace(/\$SUDO_USER\b/g, USUARIO_REAL)
.replace(/\$USER\b/g, USUARIO_REAL);
}

const sseClients = new Map();

// ============================================================
// BUFFER DE REPLAY DO SSE
// ============================================================
//
// O cliente abre o EventSource e dispara /executar quase juntos.
// Como o SSE demora alguns ms pra estabelecer, as primeiras
// mensagens que o servidor envia se perdem. Solução: manter um
// buffer por idComando e, quando um SSE novo conecta, reenviar
// todo o buffer de replay.
const sseBuffers = new Map();
const SSE_BUFFER_MAX = 500;
const SSE_BUFFER_TTL_MS = 10000;

function lerProgresso() {
try {
if (fs.existsSync(ARQUIVO_PROGRESSO)) {
const dados = JSON.parse(fs.readFileSync(ARQUIVO_PROGRESSO, 'utf8'));

if (Array.isArray(dados)) {
return { executados: dados, pulados: [] };
}

return {
executados: Array.isArray(dados.executados) ? dados.executados : [],
pulados: Array.isArray(dados.pulados) ? dados.pulados : []
};
}
} catch (e) {
console.error("[Erro ao ler progresso]:", e.message);
}
return { executados: [], pulados: [] };
}

function escreverProgresso(progresso) {
fs.writeFileSync(ARQUIVO_PROGRESSO, JSON.stringify(progresso, null, 2), 'utf8');
}

function salvarProgresso(idComando) {
try {
const progresso = lerProgresso();
if (!progresso.executados.includes(idComando)) {
progresso.executados.push(idComando);
}
progresso.pulados = progresso.pulados.filter(id => id !== idComando);
escreverProgresso(progresso);
} catch (e) {
console.error("[Erro ao salvar progresso]:", e.message);
}
}

function removerProgresso(idComando) {
try {
const progresso = lerProgresso();
progresso.executados = progresso.executados.filter(id => id !== idComando);
escreverProgresso(progresso);
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

function enviarLog(idComando, mensagem, tipo = 'output', extra = {}) {
const mensagemLimpa = _filtrarLog(mensagem);

if (!mensagemLimpa || mensagemLimpa.trim() === '') {
if (tipo !== 'end') return;
}

const dados = { tipo, mensagem: mensagemLimpa, ...extra };

// Guarda no buffer de replay
if (!sseBuffers.has(idComando)) sseBuffers.set(idComando, []);
const buffer = sseBuffers.get(idComando);
buffer.push(dados);
if (buffer.length > SSE_BUFFER_MAX) buffer.shift();

// Envia para os clientes conectados agora
const clients = sseClients.get(idComando) || [];
const json = JSON.stringify(dados);
clients.forEach(client => {
client.write(`data: ${json}\n\n`);
});

// Limpa o buffer depois do 'end', dando tempo do cliente ler
if (tipo === 'end') {
setTimeout(function() {
sseBuffers.delete(idComando);
}, SSE_BUFFER_TTL_MS);
}
}

function adicionarClienteSSE(idComando, res) {
// Replay: envia tudo que já foi acumulado antes do SSE conectar.
const buffer = sseBuffers.get(idComando) || [];
buffer.forEach(function(dados) {
res.write(`data: ${JSON.stringify(dados)}\n\n`);
});

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

function obterMetodoAutenticacao() {
const desktop = detectarDesktop();

if (desktop === 'KDE' && commandExists('kdesu')) {
return { tipo: 'kdesu', comando: 'kdesu', descricao: 'kdesu (KDE)' };
}

if (commandExists('pkexec')) {
return { tipo: 'pkexec', comando: 'pkexec', descricao: 'pkexec (PolicyKit)' };
}

if (commandExists('kdialog') || commandExists('zenity')) {
return {
tipo: 'dialog_fallback',
comando: commandExists('kdialog') ? 'kdialog' : 'zenity',
descricao: (commandExists('kdialog') ? 'kdialog' : 'zenity') + ' (fallback gráfico)'
};
}

return {
tipo: 'sudo_fallback',
comando: 'sudo',
descricao: 'sudo (fallback)'
};
}

function commandExists(cmd) {
try {
const result = require('child_process').execSync(`which ${cmd}`, { encoding: 'utf8', timeout: 1000 });
return result.trim().length > 0;
} catch (e) {
return false;
}
}

function executarComandoComStream(comandoFinal, idComando, isReversao, callback) {
const precisaAutenticacao = !_cmdSemAutenticacao(comandoFinal);

if (!precisaAutenticacao) {
console.log(`[INFO] Comando SEM autenticação: ${comandoFinal.substring(0, 50)}...`);
enviarLog(idComando, `$ ${comandoFinal}\n`, 'info');

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
timeout: 1800000,
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
enviarLog(idComando, '__END__', 'end', { sucesso: false });
callback(error, stdout, stderr);
} else {
if (isReversao) {
removerProgresso(idComando);
} else {
salvarProgresso(idComando);
}
enviarLog(idComando, `\n✅ Comando concluído com sucesso!\n`, 'success');
console.log(`[SUCESSO] ${idComando}`);
enviarLog(idComando, '__END__', 'end', { sucesso: true });
callback(null, stdout, stderr);
}
});
return;
}

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
enviarLog(idComando, error ? '❌ Tarefa falhou!\n' : '✅ Tarefa concluída!\n', error ? 'error' : 'success');
enviarLog(idComando, '__END__', 'end', { sucesso: !error });

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
enviarLog(idComando, code === 0 ? '✅ Tarefa concluída!\n' : '❌ Tarefa falhou!\n', code === 0 ? 'success' : 'error');
enviarLog(idComando, '__END__', 'end', { sucesso: code === 0 });

callback(code === 0 ? null : new Error(`Código de saída: ${code}`), saidaCompleta, erros);
});

processo.on('error', (err) => {
enviarLog(idComando, `\n❌ Erro ao iniciar processo: ${err.message}\n`, 'error');
enviarLog(idComando, '__END__', 'end', { sucesso: false });
callback(err, saidaCompleta, erros);
});
}

function executarComAutenticacaoSegura(comandoOriginal, idComando, isReversao, callback) {
const desktop = detectarDesktop();

const descricoesComandos = {
'dnf upgrade': 'Atualizar o sistema Fedora',
'dnf install': 'Instalar pacotes',
'dnf remove': 'Remover pacotes',
'dnf autoremove': 'Remover dependências não utilizadas',
'dnf clean': 'Limpar cache do sistema',
'dnf config-manager': 'Configurar gerenciador de pacotes DNF',
'dnf distro-sync': 'Sincronizar pacotes com o canal estável',
'dnf swap': 'Substituir pacotes',
'dnf groupinstall': 'Instalar grupo de pacotes',
'dnf copr': 'Habilitar repositório COPR',
'localectl': 'Alterar configurações de localidade',
'timedatectl': 'Alterar data e hora do sistema',
'rm -rf /usr/share/fonts/microsoft': 'Remover fontes Microsoft',
'btrfs': 'Gerenciar snapshots Btrfs',
'grub2-mkconfig': 'Reconfigurar GRUB',
'grubby': 'Configurar parâmetros do kernel',
'sed -i': 'Modificar arquivo de configuração',
'flatpak install': 'Instalar aplicativo Flatpak',
'flatpak uninstall': 'Remover aplicativo Flatpak',
'flatpak update': 'Atualizar aplicativos Flatpak',
'flatpak remote-add': 'Adicionar repositório Flatpak',
'usermod': 'Modificar grupos do usuário',
'gpasswd': 'Modificar grupos do usuário',
'systemctl': 'Gerenciar serviços do sistema',
'waydroid init': 'Inicializar container Android (Waydroid)'
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
const comandoCorrigido = _substituirCaminhosUsuario(comandoSemSudo);

const hasPkexec = commandExists('pkexec');
const hasKdesu = commandExists('kdesu');
const hasZenity = commandExists('zenity');
const hasKdialog = commandExists('kdialog');

console.log(`[AUTH] Desktop: ${desktop}, pkexec: ${hasPkexec}, kdesu: ${hasKdesu}`);
console.log(`[AUTH] HOME do usuário: ${HOME_DIR_USUARIO}, usuário: ${USUARIO_REAL}`);

// ============================================================
// Constrói o script temporário.
// ============================================================
//
// O kdesu/pkexec executa este script como root. O script:
// 1. Configura DISPLAY, XAUTHORITY, DBUS_SESSION_BUS_ADDRESS
// 2. Roda o comando do usuário
// 3. Redireciona tudo (stdout + stderr) para outputTemp
//
// O servidor lê outputTemp a cada 500ms e envia via SSE. Isso
// funciona porque o `>` do bloco abre o arquivo com modo 0644
// (padrão do root com umask 022), e o servidor (rodando como o
// usuário comum) consegue ler arquivos 644 de root.
//
// Sem o `script -e -q -c` que tentamos antes: o kdesu já consome
// o TTY, e a combinação kdesu → script → bash falhava em
// silêncio. O comando não rodava, mas o kdesu retornava 0.
function _construirScripts(timestamp, random, comandoCorrigido, descricao, outputTemp) {
const scriptTemp = `/tmp/fof-cmd-${timestamp}-${random}.sh`;
const homeDir = HOME_DIR_USUARIO;

// Normaliza line endings (evita CRLF vindo do editor)
const comandoLimpo = (comandoCorrigido || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const scriptContent = `#!/bin/bash
# Fedora Only Fans - ${descricao}
# Executado em: $(date '+%d/%m/%Y %H:%M:%S')
export DISPLAY=${process.env.DISPLAY || ':0'}
export XAUTHORITY=${process.env.XAUTHORITY || homeDir + '/.Xauthority'}
export DBUS_SESSION_BUS_ADDRESS=${process.env.DBUS_SESSION_BUS_ADDRESS || ''}
{
${comandoLimpo}
} > ${outputTemp} 2>&1
`.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

return { scriptTemp, scriptContent };
}

if (desktop === 'KDE' && hasKdesu) {
enviarLog(idComando, '🪟 Usando kdesu (KDE) com interface gráfica...\n', 'info');

const timestamp = Date.now();
const random = Math.random().toString(36).substring(7);
const outputTemp = `/tmp/fof-out-${timestamp}-${random}.log`;
const { scriptTemp, scriptContent } = _construirScripts(timestamp, random, comandoCorrigido, descricao, outputTemp);

try {
fs.writeFileSync(scriptTemp, scriptContent, { mode: 0o755 });
console.log(`[KDESU] Script criado: ${scriptTemp}`);
} catch (err) {
enviarLog(idComando, `❌ Erro ao criar script: ${err.message}\n`, 'error');
return callback(err, "", "");
}

const comandoFinal = `kdesu -c "${scriptTemp}" && rm -f ${scriptTemp}`;

let bytesLidos = 0;

const readerInterval = setInterval(() => {
if (!fs.existsSync(outputTemp)) return;
try {
const conteudo = fs.readFileSync(outputTemp);
if (conteudo.length > bytesLidos) {
const novoConteudo = conteudo.slice(bytesLidos).toString('utf8');
bytesLidos = conteudo.length;
if (novoConteudo) {
enviarLog(idComando, novoConteudo, 'output');
}
}
} catch (e) {
// ignora erros de leitura (EACCES momentâneo, arquivo em escrita)
}
}, 500);

const cleanupReader = () => {
clearInterval(readerInterval);
if (fs.existsSync(outputTemp)) {
try {
const conteudo = fs.readFileSync(outputTemp);
if (conteudo.length > bytesLidos) {
const resto = conteudo.slice(bytesLidos).toString('utf8');
if (resto) enviarLog(idComando, resto, 'output');
}
} catch (e) {}
try { fs.unlinkSync(outputTemp); } catch (e) {}
}
};

setTimeout(() => {
if (fs.existsSync(scriptTemp)) {
try { fs.unlinkSync(scriptTemp); } catch (e) {}
}
if (fs.existsSync(outputTemp)) {
try { fs.unlinkSync(outputTemp); } catch (e) {}
}
}, 60000);

executarComandoComStream(comandoFinal, idComando, isReversao, (err, stdout, stderr) => {
cleanupReader();
callback(err, stdout, stderr);
});

return;
}

if (hasPkexec) {
enviarLog(idComando, '🔑 Usando pkexec com interface gráfica...\n', 'info');

const timestamp = Date.now();
const random = Math.random().toString(36).substring(7);
const outputTemp = `/tmp/fof-out-${timestamp}-${random}.log`;
const { scriptTemp, scriptContent } = _construirScripts(timestamp, random, comandoCorrigido, descricao, outputTemp);

try {
fs.writeFileSync(scriptTemp, scriptContent, { mode: 0o755 });
console.log(`[PKEXEC] Script criado: ${scriptTemp}`);
} catch (err) {
enviarLog(idComando, `❌ Erro ao criar script: ${err.message}\n`, 'error');
return callback(err, "", "");
}

const comandoFinal = `pkexec --disable-internal-agent ${scriptTemp}; rm -f ${scriptTemp}`;

let bytesLidos = 0;

const readerInterval = setInterval(() => {
if (!fs.existsSync(outputTemp)) return;
try {
const conteudo = fs.readFileSync(outputTemp);
if (conteudo.length > bytesLidos) {
const novoConteudo = conteudo.slice(bytesLidos).toString('utf8');
bytesLidos = conteudo.length;
if (novoConteudo) {
enviarLog(idComando, novoConteudo, 'output');
}
}
} catch (e) {
// ignora
}
}, 500);

const cleanupReader = () => {
clearInterval(readerInterval);
if (fs.existsSync(outputTemp)) {
try {
const conteudo = fs.readFileSync(outputTemp);
if (conteudo.length > bytesLidos) {
const resto = conteudo.slice(bytesLidos).toString('utf8');
if (resto) enviarLog(idComando, resto, 'output');
}
} catch (e) {}
try { fs.unlinkSync(outputTemp); } catch (e) {}
}
};

setTimeout(() => {
if (fs.existsSync(scriptTemp)) {
try { fs.unlinkSync(scriptTemp); } catch (e) {}
}
if (fs.existsSync(outputTemp)) {
try { fs.unlinkSync(outputTemp); } catch (e) {}
}
}, 60000);

executarComandoComStream(comandoFinal, idComando, isReversao, (err, stdout, stderr) => {
cleanupReader();
callback(err, stdout, stderr);
});

return;
}

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
const comandoEscapado = comandoCorrigido
.replace(/\\/g, '\\\\')
.replace(/"/g, '\\"')
.replace(/\$/g, '\\$')
.replace(/`/g, '\\`');

const comandoFinal = `echo '${senhaLimpa}' | sudo -S sh -c "${comandoEscapado}"`;
executarComandoComStream(comandoFinal, idComando, isReversao, callback);
});
}

function procederComExecucao(comando, idComando, isReversao, res) {
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({
success: true,
output: 'Comando aceito. Acompanhe o progresso no log abaixo.'
}));

setImmediate(() => {
const isSemAutenticacao = _cmdSemAutenticacao(comando) && !comando.includes('dnf');
const precisaAutenticacao = !isSemAutenticacao;

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

function servirArquivoEstatico(req, res, filePath) {
const fullPath = path.join(__dirname, filePath);

if (fs.existsSync(fullPath)) {
const ext = path.extname(fullPath).toLowerCase();
const mimeTypes = {
'.html': 'text/html; charset=utf-8',
'.css': 'text/css; charset=utf-8',
'.js': 'application/javascript; charset=utf-8',
'.json': 'application/json; charset=utf-8',
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

function servirLocale(req, res, lang) {
if (LANGS_SUPORTADOS.indexOf(lang) === -1) {
res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
res.end(JSON.stringify({ error: 'Idioma não suportado: ' + lang }));
return;
}

const arquivo = path.join(LOCALES_DIR, lang + '.json');

if (path.resolve(arquivo).indexOf(path.resolve(LOCALES_DIR)) !== 0) {
res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
res.end(JSON.stringify({ error: 'Acesso negado' }));
return;
}

if (!fs.existsSync(arquivo)) {
res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
res.end(JSON.stringify({ error: 'Locale não encontrado: ' + lang }));
return;
}

res.writeHead(200, {
'Content-Type': 'application/json; charset=utf-8',
'Cache-Control': 'no-cache'
});
fs.createReadStream(arquivo).pipe(res);
}

const server = http.createServer((req, res) => {
res.setHeader('Access-Control-Allow-Origin', `http://localhost:${PORT}`);
res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

if (req.method === 'OPTIONS') {
res.writeHead(200);
res.end();
return;
}

const url = req.url;

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
'Access-Control-Allow-Origin': `http://localhost:${PORT}`
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

if (req.method === 'GET' && url.startsWith('/locales/')) {
let resto = url.substring('/locales/'.length);
const interroga = resto.indexOf('?');
if (interroga !== -1) resto = resto.substring(0, interroga);

if (resto.endsWith('.json')) {
resto = resto.substring(0, resto.length - '.json'.length);
}

let lang;
try {
lang = decodeURIComponent(resto);
} catch (e) {
res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
res.end(JSON.stringify({ error: 'Requisição inválida' }));
return;
}

servirLocale(req, res, lang);
return;
}

if (req.method === 'GET' && url === '/progress') {
const progresso = lerProgresso();
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({
executados: progresso.executados,
pulados: progresso.pulados
}));
return;
}

if (req.method === 'POST' && url === '/progress') {
let body = '';
req.on('data', chunk => { body += chunk.toString(); });
req.on('end', () => {
try {
const { executados, pulados } = JSON.parse(body);
if (Array.isArray(executados) || Array.isArray(pulados)) {
escreverProgresso({
executados: Array.isArray(executados) ? executados : [],
pulados: Array.isArray(pulados) ? pulados : []
});
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

if (req.method === 'DELETE' && url === '/progress') {
const ok = resetarProgresso();
if (ok) {
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ success: true }));
} else {
res.writeHead(500, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ success: false, error: 'Falha ao remover o arquivo de progresso' }));
}
return;
}

if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
servirArquivoEstatico(req, res, 'index.html');
return;
}

if (req.method === 'GET' && url === '/guiado.html') {
servirArquivoEstatico(req, res, 'guiado.html');
return;
}

if (req.method === 'GET' && url === '/manutencao.html') {
servirArquivoEstatico(req, res, 'manutencao.html');
return;
}

if (req.method === 'GET' && url.match(/^\/(\d{2}-[a-z-]+\.html)$/)) {
const match = url.match(/^\/(\d{2}-[a-z-]+\.html)$/);
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

if (req.method === 'GET' && url === '/i18n.js') {
servirArquivoEstatico(req, res, 'i18n.js');
return;
}

if (req.method === 'GET' && (url === '/icone_app.png' || url === '/favicon.ico')) {
servirArquivoEstatico(req, res, 'icone_app.png');
return;
}

if (req.method === 'GET' && url === '/status') {
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify(lerProgresso()));
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
version: FOF_VERSION,
langsSuportados: LANGS_SUPORTADOS
}));
return;
}

if (req.method === 'GET' && url === '/waydroid-status') {
exec('waydroid status 2>&1', { shell: '/bin/bash', timeout: 5000 }, (error, stdout, stderr) => {
const output = ((stdout || '') + (stderr || '')).trim();

let installed = true;
let initialized = false;
let running = false;

if (/command not found/i.test(output) || /No such file or directory/i.test(output)) {
installed = false;
}

if (output.indexOf('is not initialized') !== -1) {
initialized = false;
} else if (output.indexOf('Session:') !== -1 || output.indexOf('Vendor type:') !== -1) {
initialized = true;
if (/Session:\s*RUNNING/i.test(output)) {
running = true;
}
}

res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({
installed: installed,
initialized: initialized,
running: running,
raw: output
}));
});
return;
}

if (req.method === 'POST' && url === '/executar') {
let body = '';
req.on('data', chunk => { body += chunk.toString(); });
req.on('end', () => {
try {
const { comando, idComando } = JSON.parse(body);
const isReversao = false;

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

server.on('error', (e) => {
if (e.code === 'EADDRINUSE') {
console.error(`[ERRO]: A porta ${PORT} já está em uso.`);
console.error(` Execute: kill -9 $(lsof -t -i:${PORT})`);
} else {
console.error('[Erro do servidor]:', e.message);
}
});

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

const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
const desktop = detectarDesktop();
const metodo = obterMetodoAutenticacao();
console.log(`====================================================`);
console.log(` 🐧 Fedora Only Fans - Servidor de Automação v${FOF_VERSION}`);
console.log(` 🌐 http://localhost:${PORT} (somente local — 127.0.0.1)`);
console.log(` 🖥️ Desktop: ${desktop}`);
console.log(` 🔐 Autenticação: ${metodo.descricao}`);
console.log(` 🏠 HOME do usuário: ${HOME_DIR_USUARIO}`);
console.log(` 👤 Usuário: ${USUARIO_REAL}`);
console.log(` 📡 SSE: Ativo (logs em tempo real, com buffer de replay)`);
console.log(` 📁 Arquivos estáticos: Ativo (HTML, CSS, JS, ícone)`);
console.log(` 🌐 i18n: Ativo (locales em /locales/<lang>.json)`);
console.log(` 📄 Páginas: index.html, guiado.html, manutencao.html, 00-*.html a 11-*.html`);
console.log(` 🔧 Comandos SEM autenticação: rpm -q, uname -r, bash <(curl), etc`);
console.log(` 📊 Progresso: .progresso.json (persistente no servidor)`);
console.log(` 📱 Waydroid status: /waydroid-status (consultado pela sessão 11)`);
console.log(` 🔁 Buffer SSE: ${SSE_BUFFER_MAX} mensagens por comando, TTL ${SSE_BUFFER_TTL_MS/1000}s`);
console.log(`====================================================`);
});
