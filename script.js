/**
 * Fedora Only Fans (FOF) - Script Compartilhado
 * Versão: 0.9.9-alpha
 *
 * Este arquivo contém as funções GLOBAIS compartilhadas entre todas as sessões.
 * Cada sessão (00-*.html) tem seu próprio JS específico que usa estas funções.
 *
 * i18n: strings visíveis ao usuário usam tOr(chave, fallback) — em pt-BR,
 *       tOr cai no fallback (texto original), mantendo o comportamento
 *       idêntico ao anterior. Em en/es, retorna a string traduzida do JSON.
 */

// ============================================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================================

let FOF_VERSION = '';

// i18n: versão usada como cache-buster ao carregar locales. É preenchida
// por carregarVersaoServidor() e consumida por i18n.js (via window).
window.FOF_VERSION_UI18N = '';

async function carregarVersaoServidor() {
    try {
        const response = await fetch(API_URL + '/info');
        if (response.ok) {
            const data = await response.json();
            FOF_VERSION = data.version || FOF_VERSION;
            window.FOF_VERSION_UI18N = FOF_VERSION;
        }
    } catch (e) {
        console.warn('[Versão] Não foi possível consultar /info:', e.message);
    }
    document.querySelectorAll('.fof-version').forEach(function(el) {
        el.textContent = FOF_VERSION || '?';
    });

    // Correção do badge em EN/ES: o badge usa data-i18n-html com {versao}.
    // Quando i18n.js aplicou as traduções, o valor de FOF_VERSION ainda podia
    // não ter chegado do servidor, então o placeholder {versao} ficou literal.
    // Aqui, depois que temos a versão, re-aplicamos a tradução do badge.
    if (typeof I18N !== 'undefined' && typeof I18N.aplicarTraducoes === 'function') {
        var badges = document.querySelectorAll('[data-i18n-html="index.badge_versao"]');
        if (badges.length > 0) {
            I18N.aplicarTraducoes();
        }
    }

    console.log('🚀 Fedora Only Fans v' + (FOF_VERSION || '?') + ' - Script compartilhado carregado!');
}

var STORAGE_KEY = 'fof_progress';
var API_URL = 'http://localhost:3000';

// ============================================================
// i18n HELPER LOCAL
// ============================================================
// tOr(chave, fallback, vars?) — definido em i18n.js. Aqui garantimos
// que, se i18n.js não carregou, o código continua funcionando.
function _t(chave, fallback) {
    return (typeof tOr === 'function') ? tOr(chave, fallback) : fallback;
}
function _tVars(chave, fallback, vars) {
    return (typeof tOr === 'function') ? tOr(chave, fallback, vars) : fallback;
}

// ============================================================
// REGISTRO CENTRAL DE SESSÕES
// ============================================================
// i18n: cada sessão ganha um campo `nomeKey` (chave i18n) além do
// `nome` original (que serve como fallback PT-BR). O código que
// precisa do nome exibido usa nomeDaSessao(), que prioriza nomeKey.
// Isso mantém compatibilidade total com qualquer código que ainda
// leia `sessao.nome` diretamente.

var SESSOES = [
    {
        id: '00-boas-vindas',
        nome: 'Boas-vindas',
        nomeKey: 'sessoes.00-boas-vindas.nome',
        comandos: {
            'atualizacao-inicial': { sempreClicavel: true }
        }
    },
{
    id: '01-restauracao',
    nome: 'Restauração',
    nomeKey: 'sessoes.01-restauracao.nome',
    comandos: {
        'btrfs-install': { textoConcluido: '✅ Btrfs-Assistant instalado', textoConcluidoKey: 'sessoes.01-restauracao.texto_concluido' }
    }
},
{
    id: '02-otimizacao',
    nome: 'Otimização',
    nomeKey: 'sessoes.02-otimizacao.nome',
    comandos: {
        'dnf-speed': { sempreClicavel: true },
        'idioma-packs': { textoConcluido: '✅ Tradução instalada', textoConcluidoKey: 'sessoes.02-otimizacao.texto_concluido_packs' },
        'idioma-hunspell': { textoConcluido: '✅ Corretor instalado', textoConcluidoKey: 'sessoes.02-otimizacao.texto_concluido_hunspell' },
        'idioma-localectl': { textoConcluido: '✅ Localidade configurada', textoConcluidoKey: 'sessoes.02-otimizacao.texto_concluido_localectl' },
        'dual-boot-time': { sempreClicavel: true, textoConcluido: '✅ Relógio corrigido', textoConcluidoKey: 'sessoes.02-otimizacao.texto_concluido_dual_boot' }
    }
},
{
    id: '03-repositorios',
    nome: 'Repositórios',
    nomeKey: 'sessoes.03-repositorios.nome',
    comandos: {
        'rpm-fusion': { textoConcluido: '✅ RPM Fusion ativado', textoConcluidoKey: 'sessoes.03-repositorios.texto_concluido_rpm' },
        'flatpak-setup': { textoConcluido: '✅ Flatpak configurado', textoConcluidoKey: 'sessoes.03-repositorios.texto_concluido_flatpak' },
        'codecs-essenciais': { textoConcluido: '✅ Codecs instalados', textoConcluidoKey: 'sessoes.03-repositorios.texto_concluido_codecs' },
        'extras-tainted': { textoConcluido: '✅ Extras instalados', textoConcluidoKey: 'sessoes.03-repositorios.texto_concluido_extras' },
        'vaapi-amd': { textoConcluido: '✅ VA-API instalado', textoConcluidoKey: 'sessoes.03-repositorios.texto_concluido_vaapi' },
        'vaapi-swap': { textoConcluido: '✅ VA-API instalado', textoConcluidoKey: 'sessoes.03-repositorios.texto_concluido_vaapi' }
    }
},
{
    id: '04-fontes',
    nome: 'Fontes',
    nomeKey: 'sessoes.04-fontes.nome',
    comandos: {
        'fontes-ms-all': { textoConcluido: '✅ Fontes MS instaladas', textoConcluidoKey: 'sessoes.04-fontes.texto_concluido' }
    }
},
{
    id: '05-launchers',
    nome: 'Launchers',
    nomeKey: 'sessoes.05-launchers.nome',
    comandos: {
        'vulkan-amd': { textoConcluido: '✅ Vulkan instalado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_vulkan' },
        'steam-install': { textoConcluido: '✅ Steam instalado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_steam' },
        'heroic-install': { textoConcluido: '✅ Heroic instalado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_heroic' },
        'lutris-install': { textoConcluido: '✅ Lutris instalado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_lutris' },
        'protonup-install': { textoConcluido: '✅ ProtonUp instalado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_protonup' },
        'wine-install': { textoConcluido: '✅ Wine instalado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_wine' },
        'winetricks-install': { textoConcluido: '✅ Winetricks instalado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_winetricks' },
        'bottles-install': { textoConcluido: '✅ Bottles instalado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_bottles' },
        'gamemode-install': { textoConcluido: '✅ GameMode ativado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_gamemode' },
        'mangohud-install': { textoConcluido: '✅ MangoHud instalado', textoConcluidoKey: 'sessoes.05-launchers.texto_concluido_mangohud' }
    }
},
{
    id: '06-loja',
    nome: 'Produção Multimídia',
    nomeKey: 'sessoes.06-loja.nome',
    comandos: {
        'instalar-obs-studio': { textoConcluido: '✅ OBS Studio instalado', textoConcluidoKey: 'sessoes.06-loja.texto_concluido_obs' },
        'obs-cam': { textoConcluido: '✅ Câmera Virtual ativada', textoConcluidoKey: 'sessoes.06-loja.texto_concluido_cam' },
        'instalar-easyeffects': { textoConcluido: '✅ EasyEffects instalado', textoConcluidoKey: 'sessoes.06-loja.texto_concluido_easyeffects' },
        'instalar-kdenlive': { textoConcluido: '✅ Kdenlive instalado', textoConcluidoKey: 'sessoes.06-loja.texto_concluido_kdenlive' },
        'instalar-audacity': { textoConcluido: '✅ Audacity instalado', textoConcluidoKey: 'sessoes.06-loja.texto_concluido_audacity' }
    }
},
{
    id: '07-manutencao',
    nome: 'Manutenção',
    nomeKey: 'sessoes.07-manutencao.nome',
    manutencao: true,
    comandos: {
        'limpeza-sistema': { sempreClicavel: true, textoConcluido: '✅ Limpeza concluída', textoConcluidoKey: 'sessoes.07-manutencao.texto_concluido_limpeza' },
        'verificar-grub': { sempreClicavel: true },
        'listar-kernels': { sempreClicavel: true },
        'grub-aplicar-recomendado': { sempreClicavel: true, textoConcluido: '✅ Configuração aplicada' },
        'grub-restaurar-padrao': { sempreClicavel: true, textoConcluido: '✅ Padrão restaurado' }
    }
},
{
    id: '08-fof-manutencao',
    nome: 'Manutenção FOF',
    nomeKey: 'sessoes.08-fof-manutencao.nome',
    manutencao: true,
    comandos: {
        'atualizar-fof': { sempreClicavel: true, textoConcluido: '✅ FOF atualizado' },
        'desinstalar-fof': { textoConcluido: '✅ FOF desinstalado' }
    }
}
];

var SESSOES_ORDEM = SESSOES.map(function(s) { return s.id; });
var SESSOES_PRINCIPAIS = SESSOES.filter(function(s) { return !s.manutencao; }).map(function(s) { return s.id; });
var SESSOES_MANUTENCAO = SESSOES.filter(function(s) { return s.manutencao; }).map(function(s) { return s.id; });

function _infoComando(idComando) {
    for (var i = 0; i < SESSOES.length; i++) {
        var comandos = SESSOES[i].comandos;
        if (comandos && comandos[idComando]) return comandos[idComando];
    }
    return null;
}

var SEMPRE_CLICAVEIS = SESSOES.reduce(function(lista, sessao) {
    Object.keys(sessao.comandos || {}).forEach(function(id) {
        if (sessao.comandos[id].sempreClicavel) lista.push(id);
    });
        return lista;
}, []);

function numerarSessao(sessaoId, container) {
    const index = SESSOES_PRINCIPAIS.indexOf(sessaoId);
    if (index === -1 || !container) return;
    const label = container.querySelector('.sessao-label');
    if (label) label.textContent = _tVars('comum.sessao_label', 'Sessão ' + (index + 1), { n: index + 1 });
}

// i18n: retorna o nome da sessão no idioma atual. Prioriza nomeKey
// (tradução), cai para `nome` (PT-BR) se a tradução não existir.
function nomeDaSessao(sessaoId) {
    const sessao = SESSOES.find(function(s) { return s.id === sessaoId; });
    if (!sessao) return sessaoId;
    if (sessao.nomeKey) {
        return _t(sessao.nomeKey, sessao.nome);
    }
    return sessao.nome;
}

// ============================================================
// GERENCIAMENTO DE PROGRESSO
// ============================================================

var progressCache = null;
var progressLoaded = false;
var progressLoading = false;

async function getProgress() {
    if (progressLoaded && progressCache) {
        return progressCache;
    }

    if (progressLoading) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return progressCache || { executados: [], pulados: [] };
    }

    progressLoading = true;

    try {
        const response = await fetch(API_URL + '/progress');
        if (response.ok) {
            const data = await response.json();
            progressCache = {
                executados: data.executados || [],
                pulados: data.pulados || []
            };
            progressLoaded = true;

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(progressCache));
            } catch (e) { /* ignore */ }

            progressLoading = false;
            return progressCache;
        }
    } catch (e) {
        console.warn('⚠️ Não foi possível conectar ao servidor. Usando localStorage como fallback.');
    }

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const localData = data ? JSON.parse(data) : { executados: [], pulados: [] };
        progressCache = localData;
        progressLoaded = true;
        progressLoading = false;
        return localData;
    } catch (e) {
        progressLoading = false;
        return { executados: [], pulados: [] };
    }
}

async function saveProgress(progress) {
    progressCache = progress;
    progressLoaded = true;

    // CORREÇÃO #6: salva primeiro no localStorage (síncrono, rápido).
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { /* ignore */ }

    try {
        const response = await fetch(API_URL + '/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                executados: progress.executados || [],
                pulados: progress.pulados || []
            })
        });
        if (!response.ok) {
            throw new Error('Erro ao salvar no servidor');
        }
        console.log('✅ Progresso salvo no servidor');
    } catch (e) {
        console.warn('⚠️ Não foi possível salvar no servidor. Salvando apenas no localStorage.');
    }
}

function getProgressSync() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { executados: [], pulados: [] };
    } catch (e) {
        return { executados: [], pulados: [] };
    }
}

async function carregarProgressoInicial() {
    const progress = await getProgress();
    console.log('📊 Progresso carregado:', progress.executados.length + ' itens');
}

function isExecutado(idComando) {
    const progress = getProgressSync();
    return progress.executados.includes(idComando);
}

function isPulado(idComando) {
    const progress = getProgressSync();
    return progress.pulados.includes(idComando);
}

var SESSAO_COMANDOS = SESSOES.reduce(function(mapa, sessao) {
    if (sessao.manutencao) return mapa;
    mapa[sessao.id] = Object.keys(sessao.comandos || {}).filter(function(id) {
        return !sessao.comandos[id].sempreClicavel;
    });
    return mapa;
}, {});

function getStatusSessao(sessaoId) {
    if (isPulado(sessaoId)) return 'pulado';
    const comandos = SESSAO_COMANDOS[sessaoId] || [];
    if (comandos.length > 0 && comandos.every(id => isExecutado(id))) {
        return 'executado';
    }
    return 'pendente';
}

async function marcarComoExecutado(idComando) {
    const progress = await getProgress();
    if (!progress.executados.includes(idComando)) {
        progress.executados.push(idComando);
        await saveProgress(progress);
    }
}

async function marcarComoPulado(idComando) {
    const progress = await getProgress();
    if (!progress.pulados.includes(idComando)) {
        progress.pulados.push(idComando);
        await saveProgress(progress);
    }
}

async function desmarcarComoExecutado(idComando) {
    const progress = await getProgress();
    progress.executados = progress.executados.filter(id => id !== idComando);
    await saveProgress(progress);
}

async function desmarcarComoPulado(idComando) {
    const progress = await getProgress();
    progress.pulados = progress.pulados.filter(id => id !== idComando);
    await saveProgress(progress);
}

// ============================================================
// BARRA DE PROGRESSO
// ============================================================

var progressIntervals = {};
var progressTimeouts = {};

function iniciarProgresso(idComando) {
    const container = document.getElementById('progress-' + idComando);
    if (!container) return;
    container.style.display = 'block';

    const fill = document.getElementById('progress-fill-' + idComando);
    const percent = document.getElementById('progress-percent-' + idComando);
    const status = document.getElementById('progress-status-' + idComando);

    if (!fill || !percent || !status) return;

    fill.style.width = '0%';
    fill.className = 'progress-fill';
    percent.textContent = '0%';
    status.textContent = _t('comum.status_iniciando', '⏳ Iniciando...');
    status.className = 'status running';

    let progresso = 0;

    if (progressIntervals[idComando]) {
        clearInterval(progressIntervals[idComando]);
        delete progressIntervals[idComando];
    }

    if (progressTimeouts[idComando]) {
        clearTimeout(progressTimeouts[idComando]);
        delete progressTimeouts[idComando];
    }

    progressTimeouts[idComando] = setTimeout(() => {
        if (progressIntervals[idComando]) {
            console.log('[PROGRESS] Timeout de segurança para: ' + idComando);
            clearInterval(progressIntervals[idComando]);
            delete progressIntervals[idComando];
            completarProgresso(idComando, true);
        }
    }, 1800000);

    progressIntervals[idComando] = setInterval(() => {
        if (progresso < 85) {
            const incremento = Math.max(0.05, (85 - progresso) / 200);
            progresso = Math.min(85, progresso + incremento);
            fill.style.width = progresso + '%';
            percent.textContent = Math.round(progresso) + '%';
            status.textContent = _t('comum.status_executando', '⏳ Executando...');
            status.className = 'status running';
        }
    }, 100);
}

// ============================================================
// CONCLUSÃO REAL DE UM COMANDO
// ============================================================

var _aguardandoConclusao = {};

function aguardarConclusaoReal(idComando, timeoutMs) {
    return new Promise(function(resolve) {
        if (!_aguardandoConclusao[idComando]) _aguardandoConclusao[idComando] = [];
        _aguardandoConclusao[idComando].push(resolve);
        setTimeout(function() {
            resolve(null);
        }, timeoutMs || 60000);
    });
}

function _notificarConclusaoReal(idComando, sucesso) {
    const esperando = _aguardandoConclusao[idComando];
    if (esperando) {
        delete _aguardandoConclusao[idComando];
        esperando.forEach(function(resolve) { resolve(sucesso); });
    }
}

function completarProgresso(idComando, sucesso) {
    const container = document.getElementById('progress-' + idComando);

    const aplicarUI = function() {
        if (container) {
            const fill = document.getElementById('progress-fill-' + idComando);
            const percent = document.getElementById('progress-percent-' + idComando);
            const status = document.getElementById('progress-status-' + idComando);

            if (progressTimeouts[idComando]) {
                clearTimeout(progressTimeouts[idComando]);
                delete progressTimeouts[idComando];
            }

            if (progressIntervals[idComando]) {
                clearInterval(progressIntervals[idComando]);
                delete progressIntervals[idComando];
            }

            if (fill && percent && status) {
                fill.style.width = '100%';
                fill.className = 'progress-fill complete';
                percent.textContent = '100%';

                if (sucesso) {
                    status.textContent = _t('comum.status_concluido', '✅ Concluído!');
                    status.className = 'status success';
                } else {
                    status.textContent = _t('comum.status_falha', '❌ Falha na execução');
                    status.className = 'status error';
                }

                setTimeout(() => {
                    container.style.display = 'none';
                }, 5000);
            }
        }

        restaurarBotaoAposExecucao(idComando, sucesso);
        _notificarConclusaoReal(idComando, sucesso);
    };

    if (sucesso && !SEMPRE_CLICAVEIS.includes(idComando)) {
        marcarComoExecutado(idComando).then(aplicarUI, aplicarUI);
    } else {
        aplicarUI();
    }
}

// ============================================================
// TEXTO CORRETO DOS BOTÕES APÓS EXECUÇÃO
// ============================================================

// i18n: prioriza textoConcluidoKey (chave i18n), cai para textoConcluido
// (fallback PT-BR), cai para '✅ Concluído' se nenhum existir.
function getTextoAposExecucao(idComando) {
    const info = _infoComando(idComando);
    if (!info) return _t('comum.btn_concluido', '✅ Concluído');
    if (info.textoConcluidoKey) {
        return _t(info.textoConcluidoKey, info.textoConcluido || '✅ Concluído');
    }
    return info.textoConcluido || _t('comum.btn_concluido', '✅ Concluído');
}

// ============================================================
// RESTAURAR BOTÃO APÓS EXECUÇÃO
// ============================================================

function _corOriginalDoBotao(btn) {
    if (btn.hasAttribute('data-cor-original')) {
        return btn.getAttribute('data-cor-original');
    }
    let cor = btn.style.backgroundColor || '';
    if (!cor) {
        try {
            cor = window.getComputedStyle(btn).backgroundColor || '';
        } catch (e) {
            cor = '';
        }
    }
    btn.setAttribute('data-cor-original', cor);
    return cor;
}

function restaurarBotaoAposExecucao(idComando, sucesso) {
    const botoes = obterBotoesPorId(idComando);
    const btnExecutar = botoes.btnExecutar;
    const btnReverter = botoes.btnReverter;

    if (!btnExecutar) return;

    const corOriginal = _corOriginalDoBotao(btnExecutar);

    if (SEMPRE_CLICAVEIS.includes(idComando)) {
        const original = btnExecutar.getAttribute('data-texto-original') || btnExecutar.textContent;
        btnExecutar.innerHTML = original;
        btnExecutar.style.backgroundColor = corOriginal || 'var(--accent, #3c67e3)';
        btnExecutar.style.cursor = 'pointer';
        btnExecutar.disabled = false;
        btnExecutar.style.opacity = '1';
        return;
    }

    if (sucesso) {
        const textoFinal = getTextoAposExecucao(idComando);
        btnExecutar.innerHTML = textoFinal;
        btnExecutar.style.backgroundColor = '#4b5563';
        btnExecutar.style.cursor = 'default';
        btnExecutar.disabled = true;
        btnExecutar.style.opacity = '1';

        if (btnReverter) {
            btnReverter.style.display = 'inline-block';
            btnReverter.disabled = false;
        }

        marcarComoExecutado(idComando);
    } else {
        const original = btnExecutar.getAttribute('data-texto-original') || btnExecutar.textContent;
        btnExecutar.innerHTML = original;
        btnExecutar.style.backgroundColor = corOriginal || 'var(--accent, #3c67e3)';
        btnExecutar.style.cursor = 'pointer';
        btnExecutar.disabled = false;
        btnExecutar.style.opacity = '1';
    }
}

// ============================================================
// SSE - LOGS EM TEMPO REAL (com suporte a toggle)
// ============================================================

var sseConnections = {};

function toggleTerminalLog(idComando) {
    const toggle = document.getElementById('log-toggle-' + idComando);
    const logBox = document.getElementById('log-' + idComando);
    if (!toggle || !logBox) return;

    toggle.classList.toggle('expandido');
    logBox.classList.toggle('expandido');
}

function criarToggleParaLog(idComando) {
    const logBox = document.getElementById('log-' + idComando);
    if (!logBox) return;

    if (document.getElementById('log-toggle-' + idComando)) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'terminal-log-wrapper';

    const toggle = document.createElement('div');
    toggle.className = 'terminal-log-toggle';
    toggle.id = 'log-toggle-' + idComando;
    // i18n: o texto do toggle é traduzível.
    const toggleTexto = _t('comum.log_execucao', '📋 Log de execução');
    toggle.innerHTML = `
    <span class="toggle-arrow">▼</span>
    <span class="toggle-text">${toggleTexto}</span>
    `;
    toggle.addEventListener('click', function() {
        toggleTerminalLog(idComando);
    });

    logBox.parentNode.insertBefore(wrapper, logBox);
    wrapper.appendChild(toggle);
    wrapper.appendChild(logBox);

    logBox.style.display = 'block';
    logBox.style.height = '0';
    logBox.style.maxHeight = '0';
}

function conectarSSE(idComando, logBox) {
    criarToggleParaLog(idComando);

    if (sseConnections[idComando]) {
        sseConnections[idComando].close();
        delete sseConnections[idComando];
    }

    try {
        const eventSource = new EventSource(API_URL + '/stream?id=' + idComando);
        sseConnections[idComando] = eventSource;

        let linhas = 0;
        const MAX_LINHAS = 100;

        eventSource.onmessage = function(event) {
            try {
                const dados = JSON.parse(event.data);

                if (dados.tipo === 'end') {
                    eventSource.close();
                    delete sseConnections[idComando];
                    const sucesso = dados.sucesso !== false;
                    completarProgresso(idComando, sucesso);
                    return;
                }

                let mensagem = dados.mensagem
                .replace(/\x1b\]3008;[^\x1b]*\x1b\\/g, '')
                .replace(/\x1b\[[0-9;]*m/g, '')
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

                const lines = mensagem.split('\n');

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.trim() === '') continue;

                    if (line.includes('org.kde.plasma.libdiscover')) continue;
                    if (line.includes('QML Shortcut')) continue;
                    if (line.includes('qt.qpa.services')) continue;
                    if (line.includes('WARNING **: Found icon of unknown type')) continue;
                    if (line.includes('QIODevice::read')) continue;
                    if (line.includes('adding empty sources model')) continue;

                    const lineElement = document.createElement('div');
                    lineElement.className = 'log-line ' + dados.tipo;
                    lineElement.textContent = line;
                    logBox.appendChild(lineElement);
                    linhas++;
                }

                if (linhas > MAX_LINHAS) {
                    const children = logBox.children;
                    for (let j = 0; j < linhas - MAX_LINHAS; j++) {
                        if (children[j]) children[j].remove();
                    }
                    linhas = MAX_LINHAS;
                }

                logBox.scrollTop = logBox.scrollHeight;

            } catch (e) {
                console.error('[SSE] Erro ao processar mensagem:', e);
            }
        };

        eventSource.onerror = function(event) {
            if (eventSource.readyState === EventSource.CLOSED) {
                console.log('[SSE] Conexão fechada para:', idComando);
            } else {
                console.warn('[SSE] Erro na conexão:', event);
            }
        };

    } catch (e) {
        console.error('[SSE] Erro ao criar conexão:', e);
        const errorLine = document.createElement('div');
        errorLine.className = 'log-line error';
        errorLine.textContent = '❌ Erro ao conectar SSE: ' + e.message;
        if (logBox) {
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    }
}

// ============================================================
// DETECÇÃO DE DESKTOP
// ============================================================

var desktopCache = null;
async function detectarDesktopReal() {
    if (desktopCache) return desktopCache;
    try {
        const response = await fetch(API_URL + '/info');
        if (response.ok) {
            const data = await response.json();
            desktopCache = data.desktop || 'UNKNOWN';
            return desktopCache;
        }
    } catch (e) {
        console.warn('[Desktop] Não foi possível consultar /info:', e.message);
    }
    return 'UNKNOWN';
}

// ============================================================
// FUNÇÕES DE BOTÕES
// ============================================================

// CORREÇÃO #5: o fallback por substring (`onclick.includes(idComando)`)
// podia casar botões errados. Só considera match exato por id HTML
// ou por idComando entre quotes no onclick.
function obterBotoesPorId(idComando) {
    let btnExecutar = null;

    btnExecutar = document.querySelector('.btn-executar[data-comando="' + idComando + '"]');

    if (!btnExecutar) {
        const allButtons = document.querySelectorAll('.btn-executar');
        for (const btn of allButtons) {
            if (btn.id === 'btn-' + idComando) {
                btnExecutar = btn;
                break;
            }
            const onclick = btn.getAttribute('onclick') || '';
            if (onclick.includes("'" + idComando + "'") ||
                onclick.includes('"' + idComando + '"')) {
                btnExecutar = btn;
            break;
                }
        }
    }

    let btnReverter = null;
    if (btnExecutar && btnExecutar.parentElement) {
        btnReverter = btnExecutar.parentElement.querySelector('.btn-reverter');
    }

    return { btnExecutar, btnReverter };
}

// ============================================================
// EXECUTAR COMANDO GENÉRICO
// ============================================================

async function executarComandoGenerico(idComando, comando, nomeAcao, onSucesso) {
    const logBox = document.getElementById('log-' + idComando);
    const btn = document.getElementById('btn-' + idComando);

    if (!logBox) return;

    if (isExecutado(idComando) && !SEMPRE_CLICAVEIS.includes(idComando)) {
        alert(_t('comum.ja_executado', 'Este comando já foi executado anteriormente.'));
        return;
    }

    iniciarProgresso(idComando);

    logBox.innerHTML = '';
    logBox.style.display = 'block';

    const header = document.createElement('div');
    header.className = 'log-line info';
    header.textContent = '🚀 ' + nomeAcao + '... (' + new Date().toLocaleTimeString() + ')';
    logBox.appendChild(header);
    logBox.scrollTop = logBox.scrollHeight;

    conectarSSE(idComando, logBox);

    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ ' + nomeAcao + '...';
        btn.style.opacity = '0.6';
    }

    try {
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comando: comando, idComando: idComando })
        });

        if (!response.ok) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = _tVars('comum.erro_http', '❌ Erro HTTP: ' + response.status, { status: response.status });
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
            completarProgresso(idComando, false);

            if (btn) {
                btn.disabled = false;
                btn.textContent = btn.getAttribute('data-texto-original') || nomeAcao;
                btn.style.opacity = '1';
            }
            return;
        }

        if (typeof onSucesso === 'function') {
            aguardarConclusaoEEntao(idComando, onSucesso);
        }
    } catch (e) {
        const errorLine = document.createElement('div');
        errorLine.className = 'log-line error';
        errorLine.textContent = _tVars('comum.erro_conexao', '❌ Erro de conexão: ' + e.message, { msg: e.message });
        logBox.appendChild(errorLine);
        logBox.scrollTop = logBox.scrollHeight;
        completarProgresso(idComando, false);

        if (btn) {
            btn.disabled = false;
            btn.textContent = btn.getAttribute('data-texto-original') || nomeAcao;
            btn.style.opacity = '1';
        }
    }
}

// ============================================================
// DESINSTALAR PACOTE
// ============================================================

async function desinstalarPacote(idComando, comandoRemover, nomeExibicao) {
    if (!isExecutado(idComando)) {
        alert(_tVars('comum.nao_instalado', nomeExibicao + ' não está instalado.', { nome: nomeExibicao }));
        return;
    }

    if (!confirm(_tVars('comum.confirmar_desinstalar', 'Deseja desinstalar o ' + nomeExibicao + '?', { nome: nomeExibicao }))) return;

    const logBox = document.getElementById('log-' + idComando);
    const btn = document.getElementById('btn-' + idComando);
    const btnReverter = document.getElementById('btn-reverter-' + idComando);
    const idRevert = idComando + '-revert';

    if (logBox) {
        logBox.innerHTML = '';
        logBox.style.display = 'block';
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line info';
        infoLine.textContent = '🗑️ Desinstalando ' + nomeExibicao + '...';
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }

    if (btnReverter) {
        btnReverter.disabled = true;
    }

    conectarSSE(idRevert, logBox);

    try {
        await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comando: comandoRemover, idComando: idRevert })
        });

        const sucesso = await aguardarConclusaoReal(idRevert, 180000);

        if (!sucesso) {
            if (btnReverter) btnReverter.disabled = false;
            if (logBox) {
                const errorLine = document.createElement('div');
                errorLine.className = 'log-line error';
                errorLine.textContent = sucesso === null
                ? _t('comum.erro_timeout_desinstalar', '❌ Tempo esgotado esperando a desinstalação.')
                : _tVars('comum.erro_falha_desinstalar', '❌ Falha ao desinstalar ' + nomeExibicao + '.', { nome: nomeExibicao });
                logBox.appendChild(errorLine);
                logBox.scrollTop = logBox.scrollHeight;
            }
            return;
        }

        desmarcarComoExecutado(idComando);

        if (btn) {
            btn.textContent = btn.getAttribute('data-texto-original') || nomeExibicao;
            btn.style.backgroundColor = _corOriginalDoBotao(btn);
            btn.style.cursor = 'pointer';
            btn.style.opacity = '1';
            btn.disabled = false;
        }

        if (btnReverter) {
            btnReverter.disabled = true;
        }

        if (logBox) {
            const successLine = document.createElement('div');
            successLine.className = 'log-line success';
            successLine.textContent = _tVars('comum.sucesso_desinstalar', '✅ ' + nomeExibicao + ' desinstalado com sucesso!', { nome: nomeExibicao });
            logBox.appendChild(successLine);
            logBox.scrollTop = logBox.scrollHeight;
        }

    } catch (e) {
        if (btnReverter) {
            btnReverter.disabled = false;
        }
        if (logBox) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = _tVars('comum.erro_desinstalar', '❌ Erro ao desinstalar: ' + e.message, { msg: e.message });
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    }
}

// ============================================================
// ABRIR FERRAMENTA EXTERNA
// ============================================================

function abrirFerramentaExterna(comando, idLog, nomeExibicao) {
    fetch(API_URL + '/executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comando: comando, idComando: idLog + '-open' })
    });

    const logBox = document.getElementById('log-' + idLog);
    if (logBox) {
        logBox.innerHTML = '';
        logBox.style.display = 'block';
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line success';
        infoLine.textContent = '🚀 ' + nomeExibicao + ' aberto!';
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }
}

function mostrarBotaoDesinstalar(idComando) {
    const btnReverter = document.getElementById('btn-reverter-' + idComando);
    if (btnReverter) {
        btnReverter.disabled = false;
    }
}

async function aguardarConclusaoEEntao(idComando, onSucesso) {
    const sucesso = await aguardarConclusaoReal(idComando, 1800000);
    if (sucesso) {
        onSucesso(idComando);
    }
}

// ============================================================
// SELECTS PERSONALIZADOS
// ============================================================

var selectOutsideClickBound = false;

function bindCustomSelect(triggerId, optionsId, hiddenId, displayId) {
    const trigger = document.getElementById(triggerId);
    const options = document.getElementById(optionsId);
    const hiddenInput = document.getElementById(hiddenId);
    const displayValue = document.getElementById(displayId);

    if (!trigger || !options || !hiddenInput || !displayValue) return;

    if (trigger.dataset.fofSelectBound === '1') return;
    trigger.dataset.fofSelectBound = '1';

    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        trigger.classList.toggle('open');
        options.classList.toggle('open');
    });

    const optionItems = options.querySelectorAll('li');
    optionItems.forEach(function(li) {
        li.addEventListener('click', function(e) {
            e.stopPropagation();
            const value = this.getAttribute('data-value');
            const text = this.textContent;
            displayValue.textContent = text;
            hiddenInput.value = value;

            optionItems.forEach(function(opt) {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');

            trigger.classList.remove('open');
            options.classList.remove('open');
        });
    });
}

function initCustomSelects() {
    bindCustomSelect('custom-select-trigger', 'custom-select-options', 'select-downloads', 'custom-select-value');

    if (!selectOutsideClickBound) {
        selectOutsideClickBound = true;
        document.addEventListener('click', function(e) {
            document.querySelectorAll('.custom-select').forEach(function(container) {
                if (!container.contains(e.target)) {
                    const t = container.querySelector('.custom-select-trigger');
                    const o = container.querySelector('.custom-select-options');
                    if (t) t.classList.remove('open');
                    if (o) o.classList.remove('open');
                }
            });
        });
    }
}

// ============================================================
// INICIALIZAÇÃO GLOBAL
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    carregarProgressoInicial();
    carregarVersaoServidor();
    setTimeout(initCustomSelects, 300);

    // i18n: garante que o seletor de idioma exista em qualquer página
    // que tenha um container .i18n-seletor-container (idempotente).
    if (typeof I18N !== 'undefined' && typeof I18N.criarSeletorIdioma === 'function') {
        setTimeout(function() { I18N.criarSeletorIdioma(); }, 50);
    }
});

document.addEventListener('sessao-carregada', function() {
    setTimeout(initCustomSelects, 200);
    setTimeout(carregarProgressoInicial, 300);

    // i18n: se uma sessão foi injetada depois do boot, o i18n.js já
    // cuida via aplicarTraducoes(container), chamado pelos shells.
    // Aqui só garantimos que o seletor existe caso ainda não exista.
    if (typeof I18N !== 'undefined' && typeof I18N.criarSeletorIdioma === 'function') {
        setTimeout(function() { I18N.criarSeletorIdioma(); }, 100);
    }
});

document.addEventListener('todas-sessoes-carregadas', function() {
    setTimeout(initCustomSelects, 300);
    setTimeout(carregarProgressoInicial, 400);

    if (typeof I18N !== 'undefined' && typeof I18N.criarSeletorIdioma === 'function') {
        setTimeout(function() { I18N.criarSeletorIdioma(); }, 100);
    }
});
