/**
 * Fedora Only Fans (FOF) - Script Compartilhado
 * Versão: 0.9.5-alpha
 *
 * Este arquivo contém as funções GLOBAIS compartilhadas entre todas as sessões.
 * Cada sessão (00-*.html) tem seu próprio JS específico que usa estas funções.
 */

// ============================================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================================

const FOF_VERSION = '0.9.5-alpha';
const STORAGE_KEY = 'fof_progress';
const API_URL = 'http://localhost:3000';

// ============================================================
// GERENCIAMENTO DE PROGRESSO (API do Servidor + localStorage fallback)
// ============================================================

let progressCache = null;
let progressLoaded = false;
let progressLoading = false;

/**
 * Busca o progresso do servidor (ou fallback para localStorage)
 */
async function getProgress() {
    // Se já carregou e tem cache, retorna o cache
    if (progressLoaded && progressCache) {
        return progressCache;
    }

    // Evita múltiplas requisições simultâneas
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

            // Sincroniza com localStorage (fallback)
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(progressCache));
            } catch (e) { /* ignore */ }

            progressLoading = false;
            return progressCache;
        }
    } catch (e) {
        console.warn('⚠️ Não foi possível conectar ao servidor. Usando localStorage como fallback.');
    }

    // Fallback: localStorage
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

/**
 * Salva o progresso no servidor (e localStorage como fallback)
 */
async function saveProgress(progress) {
    progressCache = progress;
    progressLoaded = true;

    // Tenta salvar no servidor
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

    // Sempre salva no localStorage como fallback
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { /* ignore */ }
}

/**
 * Reinicia o progresso (remove do servidor e localStorage)
 */
async function reiniciarProgresso() {
    if (!confirm('Tem certeza que deseja reiniciar todo o progresso?\n\nTodas as sessões serão marcadas como pendentes.')) {
        return;
    }

    // Remove do servidor
    try {
        const response = await fetch(API_URL + '/progress', {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log('✅ Progresso removido do servidor');
        }
    } catch (e) {
        console.warn('⚠️ Não foi possível remover do servidor');
    }

    // Remove do localStorage
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }

    // Limpa cache
    progressCache = { executados: [], pulados: [] };
    progressLoaded = true;

    // Recarrega a página
    location.reload();
}

/**
 * Função síncrona para compatibilidade com código existente
 */
function getProgressSync() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { executados: [], pulados: [] };
    } catch (e) {
        return { executados: [], pulados: [] };
    }
}

/**
 * Carrega o progresso na inicialização e restaura os botões
 */
async function carregarProgressoInicial() {
    const progress = await getProgress();
    if (progress.executados) {
        progress.executados.forEach(id => {
            // Tenta restaurar o botão com o texto correto
            const btn = document.querySelector('[data-comando="' + id + '"]');
            if (btn) {
                const textoFinal = getTextoAposExecucao(id);
                btn.textContent = textoFinal;
                btn.style.backgroundColor = '#4b5563';
                btn.style.cursor = 'default';
                btn.disabled = true;

                // Mostra botão reverter se existir
                const btnReverter = btn.parentElement.querySelector('.btn-reverter');
                if (btnReverter && !['dnf-speed', 'limpeza-sistema', 'atualizacao-inicial'].includes(id)) {
                    btnReverter.style.display = 'inline-block';
                    btnReverter.disabled = false;
                }
            }
        });
    }
    atualizarInterfaceProgresso();
    console.log('📊 Progresso carregado:', progress.executados.length + ' itens');
}

// ============================================================
// FUNÇÕES DE PROGRESSO (compatibilidade)
// ============================================================

function isExecutado(idComando) {
    const progress = getProgressSync();
    return progress.executados.includes(idComando);
}

function isPulado(idComando) {
    const progress = getProgressSync();
    return progress.pulados.includes(idComando);
}

function getStatusComando(idComando) {
    if (isExecutado(idComando)) return 'executado';
    if (isPulado(idComando)) return 'pulado';
    return 'pendente';
}

async function marcarComoExecutado(idComando) {
    const progress = await getProgress();
    if (!progress.executados.includes(idComando)) {
        progress.executados.push(idComando);
        await saveProgress(progress);
    }
    atualizarInterfaceProgresso();
}

async function marcarComoPulado(idComando) {
    const progress = await getProgress();
    if (!progress.pulados.includes(idComando)) {
        progress.pulados.push(idComando);
        await saveProgress(progress);
    }
    atualizarInterfaceProgresso();
}

async function desmarcarComoExecutado(idComando) {
    const progress = await getProgress();
    progress.executados = progress.executados.filter(id => id !== idComando);
    await saveProgress(progress);
    atualizarInterfaceProgresso();
}

async function desmarcarComoPulado(idComando) {
    const progress = await getProgress();
    progress.pulados = progress.pulados.filter(id => id !== idComando);
    await saveProgress(progress);
    atualizarInterfaceProgresso();
}

// ============================================================
// INTERFACE DE PROGRESSO
// ============================================================

function atualizarInterfaceProgresso() {
    // Atualiza classes das sessões
    document.querySelectorAll('.sessao-container').forEach(card => {
        const id = card.id;
        if (!id) return;
        const sessaoNome = id.replace('sessao-', '');
        const status = getStatusComando(sessaoNome);
        card.classList.remove('concluida', 'pulada');
        if (status === 'executado') card.classList.add('concluida');
        if (status === 'pulado') card.classList.add('pulada');
    });

        // Atualiza labels das sessões (para modo avançado)
        document.querySelectorAll('.sessao-label').forEach(label => {
            const parent = label.closest('.sessao-container');
            if (parent) {
                const id = parent.id;
                if (id) {
                    const sessaoNome = id.replace('sessao-', '');
                    const status = getStatusComando(sessaoNome);
                    label.className = 'sessao-label';
                    if (status === 'executado') label.classList.add('concluida');
                    if (status === 'pulado') label.classList.add('pulada');
                }
            }
        });

        atualizarBarraProgressoGeral();
}

function atualizarBarraProgressoGeral() {
    const progress = getProgressSync();
    const total = 9;
    const concluidos = progress.executados.length;
    const percentual = Math.round((concluidos / total) * 100);

    // Index
    const fill = document.getElementById('progress-geral-fill');
    const count = document.getElementById('progress-geral-count');
    const percent = document.getElementById('progress-geral-percent');

    if (fill) fill.style.width = percentual + '%';
    if (count) count.textContent = concluidos + '/' + total;
    if (percent) percent.textContent = percentual + '%';

    // Modo Avançado
    const fillAvancado = document.getElementById('progress-geral-fill-avancado');
    const countAvancado = document.getElementById('progress-count');
    const percentAvancado = document.getElementById('progress-percent-label');

    if (fillAvancado) fillAvancado.style.width = percentual + '%';
    if (countAvancado) countAvancado.textContent = concluidos + '/' + total;
    if (percentAvancado) percentAvancado.textContent = percentual + '%';

    // Stats do modo avançado
    const statsExecutados = document.getElementById('stats-executados');
    const statsPulados = document.getElementById('stats-pulados');
    const statsPendentes = document.getElementById('stats-pendentes');

    if (statsExecutados) statsExecutados.textContent = progress.executados.length;
    if (statsPulados) statsPulados.textContent = progress.pulados.length;
    if (statsPendentes) {
        const pendentes = total - progress.executados.length - progress.pulados.length;
        statsPendentes.textContent = pendentes;
    }
}

// ============================================================
// BARRA DE PROGRESSO (para comandos individuais)
// ============================================================

let progressIntervals = {};
let progressTimeouts = {};

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
    status.textContent = '⏳ Iniciando...';
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
    }, 60000);

    progressIntervals[idComando] = setInterval(() => {
        if (progresso < 85) {
            const incremento = Math.max(0.05, (85 - progresso) / 200);
            progresso = Math.min(85, progresso + incremento);
            fill.style.width = progresso + '%';
            percent.textContent = Math.round(progresso) + '%';
            status.textContent = '⏳ Executando...';
            status.className = 'status running';
        }
    }, 100);
}

function completarProgresso(idComando, sucesso) {
    const container = document.getElementById('progress-' + idComando);
    if (!container) return;

    const fill = document.getElementById('progress-fill-' + idComando);
    const percent = document.getElementById('progress-percent-' + idComando);
    const status = document.getElementById('progress-status-' + idComando);

    if (!fill || !percent || !status) return;

    if (progressTimeouts[idComando]) {
        clearTimeout(progressTimeouts[idComando]);
        delete progressTimeouts[idComando];
    }

    if (progressIntervals[idComando]) {
        clearInterval(progressIntervals[idComando]);
        delete progressIntervals[idComando];
    }

    fill.style.width = '100%';
    fill.className = 'progress-fill complete';
    percent.textContent = '100%';

    if (sucesso) {
        status.textContent = '✅ Concluído!';
        status.className = 'status success';
    } else {
        status.textContent = '❌ Falha na execução';
        status.className = 'status error';
    }

    setTimeout(() => {
        container.style.display = 'none';
    }, 5000);

    restaurarBotaoAposExecucao(idComando, sucesso);
}

// ============================================================
// TEXTO CORRETO DOS BOTÕES APÓS EXECUÇÃO
// ============================================================

function getTextoAposExecucao(idComando) {
    const textos = {
        'btrfs-install': '✅ Btrfs-Assistant instalado',
        'idioma-packs': '✅ Tradução instalada',
        'idioma-hunspell': '✅ Corretor instalado',
        'idioma-localectl': '✅ Localidade configurada',
        'dual-boot-time': '✅ Relógio corrigido',
        'rpm-fusion': '✅ RPM Fusion ativado',
        'flatpak-setup': '✅ Flatpak configurado',
        'codecs-essenciais': '✅ Codecs instalados',
        'extras-tainted': '✅ Extras instalados',
        'vaapi-amd': '✅ VA-API instalado',
        'vaapi-swap': '✅ VA-API instalado',
        'fontes-ms-all': '✅ Fontes MS instaladas',
        'vulkan-amd': '✅ Vulkan instalado',
        'steam-install': '✅ Steam instalado',
        'heroic-install': '✅ Heroic instalado',
        'lutris-install': '✅ Lutris instalado',
        'protonup-install': '✅ ProtonUp instalado',
        'instalar-obs-studio': '✅ OBS Studio instalado',
        'obs-cam': '✅ Câmera Virtual ativada',
        'instalar-easyeffects': '✅ EasyEffects instalado',
        'config-grub': '✅ GRUB configurado',
        'reverter-grub': '✅ GRUB revertido',
        'limpeza-sistema': '✅ Limpeza concluída',
        'atualizar-fof': '✅ FOF atualizado',
        'desinstalar-fof': '✅ FOF desinstalado'
    };
    return textos[idComando] || '✅ Concluído';
}

// ============================================================
// RESTAURAR BOTÃO APÓS EXECUÇÃO
// ============================================================

function restaurarBotaoAposExecucao(idComando, sucesso) {
    const botoes = obterBotoesPorId(idComando);
    const btnExecutar = botoes.btnExecutar;
    const btnReverter = botoes.btnReverter;

    if (!btnExecutar) return;

    const sempreClicaveis = [
        'atualizacao-inicial',
        'dnf-speed',
        'limpeza-sistema',
        'verificar-grub',
        'verificar-versao',
        'listar-kernels',
        'check-version'
    ];

    if (sempreClicaveis.includes(idComando)) {
        const original = btnExecutar.getAttribute('data-texto-original') || btnExecutar.textContent;
        btnExecutar.innerHTML = original;
        btnExecutar.style.backgroundColor = 'var(--accent, #3c67e3)';
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
        btnExecutar.style.backgroundColor = 'var(--accent, #3c67e3)';
        btnExecutar.style.cursor = 'pointer';
        btnExecutar.disabled = false;
        btnExecutar.style.opacity = '1';
    }
}

// ============================================================
// SSE - LOGS EM TEMPO REAL
// ============================================================

let sseConnections = {};

function conectarSSE(idComando, logBox) {
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
                    completarProgresso(idComando, true);
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

function detectarDesktopFrontend() {
    const userAgent = navigator.userAgent || '';
    const uaLower = userAgent.toLowerCase();

    if (uaLower.includes('kde') || uaLower.includes('plasma')) return 'KDE';
    if (uaLower.includes('gnome') || uaLower.includes('gnome-shell')) return 'GNOME';
    if (uaLower.includes('xfce')) return 'XFCE';
    if (uaLower.includes('cinnamon')) return 'CINNAMON';
    if (uaLower.includes('mate')) return 'MATE';
    if (uaLower.includes('lxqt')) return 'LXQT';
    if (uaLower.includes('lxde')) return 'LXDE';
    if (navigator.userAgent.includes('Konqueror')) return 'KDE';

    return 'UNKNOWN';
}

// ============================================================
// FUNÇÕES DE BOTÕES (para controle de estado)
// ============================================================

function obterBotoesPorId(idComando) {
    let btnExecutar = null;

    btnExecutar = document.querySelector('.btn-executar[data-comando="' + idComando + '"]');

    if (!btnExecutar) {
        const allButtons = document.querySelectorAll('.btn-executar');
        for (const btn of allButtons) {
            const onclick = btn.getAttribute('onclick') || '';
            if (onclick.includes("'" + idComando + "'") ||
                onclick.includes('"' + idComando + '"') ||
                onclick.includes(idComando)) {
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

function marcarBotaoComoExecutado(idComando) {
    const botoes = obterBotoesPorId(idComando);
    const btnExecutar = botoes.btnExecutar;
    const btnReverter = botoes.btnReverter;

    if (btnExecutar) {
        if (!btnExecutar.hasAttribute('data-texto-original')) {
            btnExecutar.setAttribute('data-texto-original', btnExecutar.innerHTML);
        }
        const textoFinal = getTextoAposExecucao(idComando);
        btnExecutar.innerHTML = textoFinal;
        btnExecutar.style.backgroundColor = '#4b5563';
        btnExecutar.style.cursor = 'default';
        btnExecutar.disabled = true;
    }

    if (btnReverter) {
        btnReverter.style.display = 'inline-block';
        btnReverter.disabled = false;
        btnReverter.innerHTML = '↩️ Desfazer';
        btnReverter.style.backgroundColor = '#ef4444';
        btnReverter.style.padding = '0.4rem 0.8rem';
        btnReverter.style.fontSize = '0.8rem';
        btnReverter.style.borderRadius = '6px';
        btnReverter.style.border = 'none';
        btnReverter.style.cursor = 'pointer';
        btnReverter.style.color = 'white';
        btnReverter.style.width = 'auto';
    }

    marcarComoExecutado(idComando);
}

function restaurarBotaoOriginal(idComando) {
    const botoes = obterBotoesPorId(idComando);
    const btnExecutar = botoes.btnExecutar;
    const btnReverter = botoes.btnReverter;

    if (btnExecutar) {
        const original = btnExecutar.getAttribute('data-texto-original') || 'Executar';
        btnExecutar.innerHTML = original;
        btnExecutar.style.backgroundColor = 'var(--accent, #3c67e3)';
        btnExecutar.style.cursor = 'pointer';
        btnExecutar.disabled = false;
    }

    if (btnReverter) {
        btnReverter.style.display = 'none';
        btnReverter.disabled = true;
        btnReverter.innerHTML = '↩️ Desfazer';
    }

    desmarcarComoExecutado(idComando);
}

// ============================================================
// SELECTS PERSONALIZADOS
// ============================================================

function initCustomSelect(containerId, triggerId, optionsId, hiddenId, displayId) {
    const container = document.getElementById(containerId);
    let trigger, options, hiddenInput, displayValue;

    if (container) {
        trigger = container.querySelector('#' + triggerId);
        options = container.querySelector('#' + optionsId);
        hiddenInput = container.querySelector('#' + hiddenId);
        displayValue = container.querySelector('#' + displayId);
    } else {
        trigger = document.getElementById(triggerId);
        options = document.getElementById(optionsId);
        hiddenInput = document.getElementById(hiddenId);
        displayValue = document.getElementById(displayId);
    }

    if (!trigger || !options || !hiddenInput || !displayValue) {
        console.warn('[Select] Elementos não encontrados');
        return;
    }

    document.addEventListener('click', function(e) {
        if (!trigger.contains(e.target) && !options.contains(e.target)) {
            trigger.classList.remove('open');
            options.classList.remove('open');
        }
    });

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

// ============================================================
// INICIALIZAR SELECTS PERSONALIZADOS (VERSÃO GLOBAL)
// ============================================================

function initCustomSelects() {
    console.log('🔄 Inicializando selects personalizados...');

    const container = document.getElementById('custom-select-container');
    if (container) {
        const trigger = document.getElementById('custom-select-trigger');
        const options = document.getElementById('custom-select-options');
        const hidden = document.getElementById('select-downloads');
        const display = document.getElementById('custom-select-value');

        if (trigger && options && hidden && display) {
            const newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);

            const newOptions = document.getElementById('custom-select-options');
            const newHidden = document.getElementById('select-downloads');
            const newDisplay = document.getElementById('custom-select-value');

            if (newTrigger && newOptions && newHidden && newDisplay) {
                document.addEventListener('click', function(e) {
                    if (!newTrigger.contains(e.target) && !newOptions.contains(e.target)) {
                        newTrigger.classList.remove('open');
                        newOptions.classList.remove('open');
                    }
                });

                newTrigger.addEventListener('click', function(e) {
                    e.stopPropagation();
                    newTrigger.classList.toggle('open');
                    newOptions.classList.toggle('open');
                });

                const optionItems = newOptions.querySelectorAll('li');
                optionItems.forEach(function(li) {
                    li.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const value = this.getAttribute('data-value');
                        const text = this.textContent;
                        newDisplay.textContent = text;
                        newHidden.value = value;

                        optionItems.forEach(function(opt) {
                            opt.classList.remove('selected');
                        });
                        this.classList.add('selected');

                        newTrigger.classList.remove('open');
                        newOptions.classList.remove('open');
                    });
                });

                console.log('✅ Select DNF inicializado');
            }
        }
    }

    const containerFedora = document.getElementById('custom-select-fedora-container');
    if (containerFedora) {
        const trigger = document.getElementById('custom-select-fedora-trigger');
        const options = document.getElementById('custom-select-fedora-options');
        const hidden = document.getElementById('select-fedora-version');
        const display = document.getElementById('custom-select-fedora-value');

        if (trigger && options && hidden && display) {
            const newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);

            const newOptions = document.getElementById('custom-select-fedora-options');
            const newHidden = document.getElementById('select-fedora-version');
            const newDisplay = document.getElementById('custom-select-fedora-value');

            if (newTrigger && newOptions && newHidden && newDisplay) {
                document.addEventListener('click', function(e) {
                    if (!newTrigger.contains(e.target) && !newOptions.contains(e.target)) {
                        newTrigger.classList.remove('open');
                        newOptions.classList.remove('open');
                    }
                });

                newTrigger.addEventListener('click', function(e) {
                    e.stopPropagation();
                    newTrigger.classList.toggle('open');
                    newOptions.classList.toggle('open');
                });

                const optionItems = newOptions.querySelectorAll('li');
                optionItems.forEach(function(li) {
                    li.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const value = this.getAttribute('data-value');
                        const text = this.textContent;
                        newDisplay.textContent = text;
                        newHidden.value = value;

                        optionItems.forEach(function(opt) {
                            opt.classList.remove('selected');
                        });
                        this.classList.add('selected');

                        newTrigger.classList.remove('open');
                        newOptions.classList.remove('open');
                    });
                });

                console.log('✅ Select Fedora inicializado');
            }
        }
    }
}

// ============================================================
// INICIALIZAÇÃO GLOBAL
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('custom-select-container')) {
        initCustomSelect(
            'custom-select-container',
            'custom-select-trigger',
            'custom-select-options',
            'select-downloads',
            'custom-select-value'
        );
    }

    if (document.getElementById('custom-select-fedora-container')) {
        initCustomSelect(
            'custom-select-fedora-container',
            'custom-select-fedora-trigger',
            'custom-select-fedora-options',
            'select-fedora-version',
            'custom-select-fedora-value'
        );
    }

    // Carrega progresso do servidor e restaura botões
    carregarProgressoInicial();

    // Atualiza versão
    document.querySelectorAll('.fof-version').forEach(function(el) {
        el.textContent = FOF_VERSION;
    });

    // Inicializa selects globais após carregar
    setTimeout(initCustomSelects, 300);

    console.log('🚀 Fedora Only Fans v' + FOF_VERSION + ' - Script compartilhado carregado!');
});

// Chamar após cada sessão ser carregada (modo guiado)
document.addEventListener('sessao-carregada', function() {
    setTimeout(initCustomSelects, 200);
    // Recarrega o estado dos botões após carregar a sessão
    setTimeout(carregarProgressoInicial, 300);
});

// Chamar quando todas as sessões forem carregadas (modo avançado)
document.addEventListener('todas-sessoes-carregadas', function() {
    setTimeout(initCustomSelects, 300);
    setTimeout(carregarProgressoInicial, 400);
});
