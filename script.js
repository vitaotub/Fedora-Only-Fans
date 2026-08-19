/**
 * Fedora Only Fans (FOF) - Script Compartilhado
 * Versão: 0.5.0-alpha
 * CORREÇÕES v2 - Todos os problemas resolvidos
 */

// ============================================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================================

const FOF_VERSION = '0.5.0-alpha';
const STORAGE_KEY = 'fof_progress';
const API_URL = 'http://localhost:3000';

// ============================================================
// GERENCIAMENTO DE PROGRESSO (localStorage)
// ============================================================

function getProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { executados: [], pulados: [] };
    } catch (e) {
        return { executados: [], pulados: [] };
    }
}

function saveProgress(progress) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        console.warn('Não foi possível salvar o progresso:', e);
    }
}

function marcarComoExecutado(idComando) {
    const progress = getProgress();
    if (!progress.executados.includes(idComando)) {
        progress.executados.push(idComando);
        saveProgress(progress);
    }
    atualizarInterfaceProgresso();
}

function marcarComoPulado(idComando) {
    const progress = getProgress();
    if (!progress.pulados.includes(idComando)) {
        progress.pulados.push(idComando);
        saveProgress(progress);
    }
    atualizarInterfaceProgresso();
}

function desmarcarComoExecutado(idComando) {
    const progress = getProgress();
    progress.executados = progress.executados.filter(id => id !== idComando);
    saveProgress(progress);
    atualizarInterfaceProgresso();
}

function desmarcarComoPulado(idComando) {
    const progress = getProgress();
    progress.pulados = progress.pulados.filter(id => id !== idComando);
    saveProgress(progress);
    atualizarInterfaceProgresso();
}

function isExecutado(idComando) {
    const progress = getProgress();
    return progress.executados.includes(idComando);
}

function isPulado(idComando) {
    const progress = getProgress();
    return progress.pulados.includes(idComando);
}

function getStatusComando(idComando) {
    if (isExecutado(idComando)) return 'executado';
    if (isPulado(idComando)) return 'pulado';
    return 'pendente';
}

function atualizarInterfaceProgresso() {
    document.querySelectorAll('.etapa-card').forEach(card => {
        const id = card.id;
        if (!id) return;
        const status = getStatusComando(id);
        card.classList.remove('concluida', 'pulada');
        if (status === 'executado') card.classList.add('concluida');
        if (status === 'pulado') card.classList.add('pulada');
    });
        atualizarBarraProgressoGeral();
}

function atualizarBarraProgressoGeral() {
    const progress = getProgress();
    const total = 9;
    const concluidos = progress.executados.length;
    const percentual = Math.round((concluidos / total) * 100);

    const fill = document.getElementById('progress-geral-fill');
    const count = document.getElementById('progress-geral-count');
    const percent = document.getElementById('progress-geral-percent');

    if (fill) fill.style.width = percentual + '%';
    if (count) count.textContent = concluidos + '/' + total;
    if (percent) percent.textContent = percentual + '%';

    const fillAvancado = document.getElementById('progress-geral-fill-avancado');
    const countAvancado = document.getElementById('progress-count');
    const percentAvancado = document.getElementById('progress-percent-label');

    if (fillAvancado) fillAvancado.style.width = percentual + '%';
    if (countAvancado) countAvancado.textContent = concluidos + '/' + total;
    if (percentAvancado) percentAvancado.textContent = percentual + '%';

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
// FUNÇÕES DE BOTÕES
// ============================================================

function obterBotoesPorId(idComando) {
    let btnExecutar = null;
    const allButtons = document.querySelectorAll('.btn-executar');
    for (const btn of allButtons) {
        const onclick = btn.getAttribute('onclick') || '';
        if (onclick.includes("'" + idComando + "'") || onclick.includes('"' + idComando + '"') || onclick.includes(idComando)) {
            btnExecutar = btn;
            break;
        }
    }
    if (!btnExecutar) {
        btnExecutar = document.querySelector('.btn-executar[data-comando="' + idComando + '"]');
    }
    let btnReverter = null;
    if (btnExecutar && btnExecutar.parentElement) {
        btnReverter = btnExecutar.parentElement.querySelector('.btn-reverter');
    }
    return { btnExecutar: btnExecutar, btnReverter: btnReverter };
}

function marcarBotaoComoExecutado(idComando) {
    const botoes = obterBotoesPorId(idComando);
    const btnExecutar = botoes.btnExecutar;
    const btnReverter = botoes.btnReverter;

    if (btnExecutar) {
        if (!btnExecutar.hasAttribute('data-texto-original')) {
            btnExecutar.setAttribute('data-texto-original', btnExecutar.innerHTML);
        }
        btnExecutar.innerHTML = '✅ Concluído';
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

function marcarBotaoComoPermanente(idComando) {
    const botoes = obterBotoesPorId(idComando);
    const btnExecutar = botoes.btnExecutar;
    const btnReverter = botoes.btnReverter;

    if (btnExecutar) {
        if (!btnExecutar.hasAttribute('data-texto-original')) {
            btnExecutar.setAttribute('data-texto-original', btnExecutar.innerHTML);
        }
        btnExecutar.innerHTML = '✅ Concluído';
        btnExecutar.style.backgroundColor = '#4b5563';
        btnExecutar.style.cursor = 'default';
        btnExecutar.disabled = true;
    }
    if (btnReverter) {
        btnReverter.style.display = 'none';
        btnReverter.disabled = true;
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
        btnExecutar.style.backgroundColor = 'var(--accent)';
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
// CORREÇÃO: RESTAURAR BOTÃO APÓS EXECUÇÃO
// ============================================================

function restaurarBotaoAposExecucao(idComando, sucesso) {
    if (sucesso === undefined) sucesso = true;
    const botoes = obterBotoesPorId(idComando);
    const btnExecutar = botoes.btnExecutar;
    const btnReverter = botoes.btnReverter;

    if (!btnExecutar) return;

    // ============================================================
    // CORREÇÃO SESSÃO 1: "Atualizar Fedora" - SEMPRE CLICÁVEL, SEM DESFAZER
    // ============================================================
    if (idComando === 'atualizacao-inicial') {
        if (btnExecutar) {
            btnExecutar.disabled = false;
            btnExecutar.innerHTML = '🔄 Atualizar Fedora';
            btnExecutar.style.backgroundColor = '#d97706';
            btnExecutar.style.opacity = '1';
            btnExecutar.style.cursor = 'pointer';
        }
        if (btnReverter) {
            btnReverter.style.display = 'none';
            btnReverter.disabled = true;
        }
        return;
    }

    // Botões que ficam como "Concluído" permanentemente (sem desfazer)
    const botoesPermanentesSemDesfazer = [
        'idioma-packs',
        'idioma-hunspell',
        'idioma-localectl',
        'dual-boot-time',
        'fontes-ms-all',
        'vulkan-amd'
        // 'instalar-easyeffects' - REMOVIDO: agora tem desfazer!
    ];

    if (botoesPermanentesSemDesfazer.indexOf(idComando) !== -1) {
        if (sucesso) {
            marcarBotaoComoPermanente(idComando);
        }
        return;
    }

    // Botões que ficam como "Concluído" com desfazer
    const botoesComDesfazer = [
        'btrfs-install',
        'rpm-fusion',
        'flatpak-setup',
        'codecs-essenciais',
        'extras-tainted',
        'vaapi-amd',
        'vaapi-swap',
        'steam-install',
        'heroic-install',
        'lutris-install',
        'protonup-install',
        'obs-cam',
        'instalar-easyeffects' // ADICIONADO: EasyEffects agora tem desfazer
    ];

    if (botoesComDesfazer.indexOf(idComando) !== -1) {
        if (sucesso) {
            marcarBotaoComoExecutado(idComando);
        } else {
            if (btnExecutar) {
                const original = btnExecutar.getAttribute('data-texto-original') || 'Executar';
                btnExecutar.innerHTML = original;
                btnExecutar.style.backgroundColor = 'var(--accent)';
                btnExecutar.style.cursor = 'pointer';
                btnExecutar.disabled = false;
            }
            if (btnReverter) {
                btnReverter.style.display = 'none';
                btnReverter.disabled = true;
            }
        }
        return;
    }

    // Comportamento padrão: volta a ficar clicável após 3 segundos
    if (sucesso) {
        btnExecutar.innerHTML = '✅ Concluído';
        btnExecutar.style.backgroundColor = '#4b5563';
        btnExecutar.style.opacity = '1';
        btnExecutar.disabled = true;

        marcarComoExecutado(idComando);

        setTimeout(function() {
            const original = btnExecutar.getAttribute('data-texto-original') || 'Executar';
            btnExecutar.innerHTML = original;
            btnExecutar.style.backgroundColor = 'var(--accent)';
            btnExecutar.style.opacity = '1';
            btnExecutar.disabled = false;
        }, 3000);
    } else {
        btnExecutar.disabled = false;
        const original = btnExecutar.getAttribute('data-texto-original') || 'Executar';
        btnExecutar.innerHTML = original;
        btnExecutar.style.backgroundColor = 'var(--accent)';
        btnExecutar.style.opacity = '1';
    }
}

// ============================================================
// FUNÇÃO PADRÃO PARA EXECUTAR COMANDOS
// ============================================================

async function executarComandoPadrao(idComando, scriptComando, manterHabilitado) {
    if (manterHabilitado === undefined) manterHabilitado = false;
    const logBox = document.getElementById('log-' + idComando);
    if (!logBox) {
        console.error('Log box não encontrado: log-' + idComando);
        return;
    }

    iniciarProgresso(idComando);

    logBox.innerHTML = '';
    logBox.style.display = 'block';
    logBox.style.height = '100px';
    logBox.style.maxHeight = '100px';

    const header = document.createElement('div');
    header.className = 'log-line info';
    header.textContent = '🚀 Iniciando... (' + new Date().toLocaleTimeString() + ')';
    logBox.appendChild(header);

    conectarSSE(idComando, logBox);

    const botoes = obterBotoesPorId(idComando);
    const btnExecutar = botoes.btnExecutar;

    if (btnExecutar && !btnExecutar.hasAttribute('data-texto-original')) {
        btnExecutar.setAttribute('data-texto-original', btnExecutar.textContent);
    }

    if (btnExecutar) {
        btnExecutar.disabled = true;
        btnExecutar.textContent = '⏳ Executando...';
        btnExecutar.style.opacity = '0.6';
    }

    try {
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comando: scriptComando, idComando: idComando })
        });

        if (!response.ok) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = '❌ Erro HTTP: ' + response.status + ' - ' + response.statusText;
            logBox.appendChild(errorLine);
            completarProgresso(idComando, false);
            if (btnExecutar) {
                btnExecutar.disabled = false;
                const original = btnExecutar.getAttribute('data-texto-original') || 'Executar';
                btnExecutar.innerHTML = original;
                btnExecutar.style.opacity = '1';
                btnExecutar.style.backgroundColor = 'var(--accent)';
            }
        }
    } catch (e) {
        const errorLine = document.createElement('div');
        errorLine.className = 'log-line error';
        errorLine.textContent = '❌ Erro de conexão: ' + e.message;
        logBox.appendChild(errorLine);
        completarProgresso(idComando, false);
        if (btnExecutar) {
            btnExecutar.disabled = false;
            const original = btnExecutar.getAttribute('data-texto-original') || 'Executar';
            btnExecutar.innerHTML = original;
            btnExecutar.style.opacity = '1';
            btnExecutar.style.backgroundColor = 'var(--accent)';
        }
    }
}

// ============================================================
// COMANDOS ESPECÍFICOS POR SESSÃO
// ============================================================

// --- Sessão 00: Boas-Vindas ---
async function executarAtualizacaoFedora() {
    const idComando = 'atualizacao-inicial';
    const comando = 'sudo dnf upgrade --refresh -y';
    await executarComandoPadrao(idComando, comando);
}

// --- Sessão 01: Restauração ---
async function instalarBtrfsAssistant() {
    const idComando = 'btrfs-install';
    const comando = 'sudo dnf install btrfs-assistant -y';
    await executarComandoPadrao(idComando, comando);
}

async function abrirBtrfsAssistant() {
    const logBox = document.getElementById('log-btrfs-install');
    if (logBox) {
        logBox.innerHTML = '';
        logBox.style.display = 'block';
        logBox.style.height = '100px';
        logBox.style.maxHeight = '100px';
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line info';
        infoLine.textContent = '🚀 Abrindo Btrfs-Assistant...';
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }
    try {
        await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: 'btrfs-assistant-launcher &',
                idComando: 'btrfs-open'
            })
        });
        if (logBox) {
            const successLine = document.createElement('div');
            successLine.className = 'log-line success';
            successLine.textContent = '✅ Btrfs-Assistant aberto!';
            logBox.appendChild(successLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    } catch (e) {
        if (logBox) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = '❌ Erro ao abrir: ' + e.message;
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    }
}

// Sessão 2 - Btrfs-Assistant
async function reverterBtrfsAssistant() {
    const idComando = 'btrfs-install';
    const comando = 'sudo dnf remove btrfs-assistant -y && sudo dnf clean all && sudo dnf autoremove -y';

    const logBox = document.getElementById('log-' + idComando);
    if (logBox) {
        logBox.innerHTML = '';
        logBox.style.display = 'block';
        logBox.style.height = '100px';
        logBox.style.maxHeight = '100px';
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line info';
        infoLine.textContent = '🗑️ Desinstalando Btrfs-Assistant...';
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }

    try {
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comando: comando, idComando: idComando + '-uninstall' })
        });

        // Aguardar conclusão
        await new Promise(resolve => setTimeout(resolve, 2000));

        // FORÇAR restauração do botão
        const botoes = obterBotoesPorId(idComando);
        if (botoes.btnExecutar) {
            const original = botoes.btnExecutar.getAttribute('data-texto-original') || '📦 Instalar Btrfs-Assistant';
            botoes.btnExecutar.innerHTML = original;
            botoes.btnExecutar.style.backgroundColor = '#8b5cf6';
            botoes.btnExecutar.style.cursor = 'pointer';
            botoes.btnExecutar.disabled = false;
        }
        if (botoes.btnReverter) {
            botoes.btnReverter.style.display = 'none';
            botoes.btnReverter.disabled = true;
        }

        // Remover do progresso
        desmarcarComoExecutado(idComando);
        atualizarInterfaceProgresso();

        if (logBox) {
            const successLine = document.createElement('div');
            successLine.className = 'log-line success';
            successLine.textContent = '✅ Btrfs-Assistant desinstalado com sucesso!';
            logBox.appendChild(successLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    } catch (e) {
        if (logBox) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = '❌ Erro ao desinstalar: ' + e.message;
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    }
}

// --- Sessão 02: Otimização ---
async function executarAjusteDNF() {
    const conexoes = document.getElementById('select-downloads').value;
    const idComando = 'dnf-speed';
    const comandoMontado = 'sudo dnf config-manager setopt max_parallel_downloads=' + conexoes + ' && sudo dnf config-manager setopt fastestmirror=True';
    const logBox = document.getElementById('log-dnf-speed');
    if (logBox) {
        logBox.innerHTML = '';
        logBox.style.display = 'block';
        logBox.style.height = '100px';
        logBox.style.maxHeight = '100px';
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line info';
        infoLine.textContent = '📦 Aplicando ajuste: ' + conexoes + ' conexões simultâneas...';
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }
    await executarComandoPadrao(idComando, comandoMontado);
}

// --- Sessão 03: Repositórios ---
async function executarRPMFusion() {
    const idComando = 'rpm-fusion';
    const comando = 'sudo dnf install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-44.noarch.rpm https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-44.noarch.rpm && sudo dnf install -y rpmfusion-*-appstream-data && sudo dnf update -y --refresh';
    await executarComandoPadrao(idComando, comando);
}

async function reverterRPMFusion() {
    const idComando = 'rpm-fusion';
    const comando = 'sudo dnf remove rpmfusion-free-release rpmfusion-nonfree-release -y && sudo dnf clean all && sudo dnf autoremove -y';
    await executarComandoPadrao(idComando, comando);
    await new Promise(resolve => setTimeout(resolve, 1500));
    restaurarBotaoOriginal(idComando);
    desmarcarComoExecutado(idComando);
    atualizarInterfaceProgresso();
}

async function executarFlatpak() {
    const idComando = 'flatpak-setup';
    const desktop = detectarDesktopFrontend();
    let comandoExtra = '';

    switch (desktop) {
        case 'KDE':
            comandoExtra = 'sudo dnf install plasma-discover flatpak -y';
            break;
        case 'GNOME':
            comandoExtra = 'sudo dnf install gnome-software flatpak -y';
            break;
        case 'XFCE':
        case 'CINNAMON':
        case 'MATE':
        case 'LXQT':
        case 'LXDE':
        default:
            comandoExtra = 'sudo dnf install flatpak -y';
            break;
    }

    const comando = comandoExtra + ' && flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo';
    await executarComandoPadrao(idComando, comando);
}

async function reverterFlatpak() {
    const idComando = 'flatpak-setup';
    const desktop = detectarDesktopFrontend();
    let comandoExtra = '';

    switch (desktop) {
        case 'KDE':
            comandoExtra = 'sudo dnf remove plasma-discover -y';
            break;
        case 'GNOME':
            comandoExtra = 'sudo dnf remove gnome-software -y';
            break;
        default:
            comandoExtra = '';
            break;
    }

    const comando = comandoExtra + ' && sudo dnf remove flatpak -y && rm -rf ~/.local/share/flatpak && rm -rf ~/.var/app';
    await executarComandoPadrao(idComando, comando);
    await new Promise(resolve => setTimeout(resolve, 1500));
    restaurarBotaoOriginal(idComando);
    desmarcarComoExecutado(idComando);
    atualizarInterfaceProgresso();
}

async function executarCodecs() {
    const idComando = 'codecs-essenciais';
    const comando = 'sudo dnf swap ffmpeg-free ffmpeg --allowerasing -y && sudo dnf install --setopt=\'install_weak_deps=False\' gstreamer1-plugins-good gstreamer1-plugins-bad-free gstreamer1-plugin-openh264 gstreamer1-plugin-libav --exclude=PackageKit-gstreamer-plugin -y && sudo dnf config-manager setopt fedora-cisco-openh264.enabled=1';
    await executarComandoPadrao(idComando, comando);
}

async function reverterCodecs() {
    const idComando = 'codecs-essenciais';
    const comando = 'sudo dnf swap ffmpeg ffmpeg-free --allowerasing -y && sudo dnf clean all && sudo dnf autoremove -y';
    await executarComandoPadrao(idComando, comando);
    await new Promise(resolve => setTimeout(resolve, 1500));
    restaurarBotaoOriginal(idComando);
    desmarcarComoExecutado(idComando);
    atualizarInterfaceProgresso();
}

async function executarExtrasTainted() {
    const idComando = 'extras-tainted';
    const comando = 'sudo dnf install rpmfusion-free-release-tainted -y && sudo dnf install rpmfusion-nonfree-release-tainted -y && sudo dnf install libdvdcss -y';
    await executarComandoPadrao(idComando, comando);
}

async function reverterExtrasTainted() {
    const idComando = 'extras-tainted';
    const comando = 'sudo dnf remove rpmfusion-free-release-tainted rpmfusion-nonfree-release-tainted libdvdcss -y && sudo dnf clean all && sudo dnf autoremove -y';
    await executarComandoPadrao(idComando, comando);
    await new Promise(resolve => setTimeout(resolve, 1500));
    restaurarBotaoOriginal(idComando);
    desmarcarComoExecutado(idComando);
    atualizarInterfaceProgresso();
}

async function executarVaapi() {
    const idComando = 'vaapi-amd';
    const comando = 'sudo dnf install ffmpeg-libs libva libva-utils -y && sudo dnf install mesa-va-drivers-freeworld mesa-va-drivers-freeworld.i686 -y';
    await executarComandoPadrao(idComando, comando);
}

async function reverterVaapi() {
    const idComando = 'vaapi-amd';
    const comando = 'sudo dnf remove mesa-va-drivers-freeworld mesa-va-drivers-freeworld.i686 ffmpeg-libs libva libva-utils -y && sudo dnf clean all && sudo dnf autoremove -y';
    await executarComandoPadrao(idComando, comando);
    await new Promise(resolve => setTimeout(resolve, 1500));
    restaurarBotaoOriginal(idComando);
    desmarcarComoExecutado(idComando);
    atualizarInterfaceProgresso();
}

async function executarVaapiSwap() {
    const idComando = 'vaapi-swap';
    const comando = 'sudo dnf swap mesa-va-drivers mesa-va-drivers-freeworld -y && sudo dnf swap mesa-vdpau-drivers mesa-vdpau-drivers-freeworld -y';
    await executarComandoPadrao(idComando, comando);
}

async function reverterVaapiSwap() {
    const idComando = 'vaapi-swap';
    const comando = 'sudo dnf swap mesa-va-drivers-freeworld mesa-va-drivers -y && sudo dnf swap mesa-vdpau-drivers-freeworld mesa-vdpau-drivers -y';
    await executarComandoPadrao(idComando, comando);
    await new Promise(resolve => setTimeout(resolve, 1500));
    restaurarBotaoOriginal(idComando);
    desmarcarComoExecutado(idComando);
    atualizarInterfaceProgresso();
}

// --- Sessão 04: Fontes ---
async function executarFontesMS() {
    const idComando = 'fontes-ms-all';
    const comando = 'sudo dnf install -y curl cabextract fontconfig && curl -L https://downloads.sourceforge.net/project/mscorefonts2/rpms/msttcore-fonts-installer-2.6-1.noarch.rpm -o /tmp/msfonts.rpm && rpm2cpio /tmp/msfonts.rpm | cpio -idmv -D /tmp/ && sudo mkdir -p /usr/share/fonts/microsoft && sudo mv /tmp/usr/share/fonts/msttcore/* /usr/share/fonts/microsoft/ && sudo fc-cache -f -v && rm -rf /tmp/msfonts.rpm /tmp/usr';
    await executarComandoPadrao(idComando, comando);
}

// --- Sessão 05: Launchers ---
async function executarVulkan() {
    const idComando = 'vulkan-amd';
    const comando = 'sudo dnf install vulkan-tools mesa-vulkan-drivers mesa-vulkan-drivers.i686 libva.i686 mesa-dri-drivers.i686 -y';
    await executarComandoPadrao(idComando, comando);
}

// CORREÇÃO: Sessão 6 - Launchers com sistema de toggle
async function toggleLauncher(nome, idComando, comandoInstalar, comandoDesinstalar) {
    const status = getStatusComando(idComando);

    if (status === 'executado') {
        // DESINSTALAR
        if (confirm(`Deseja desinstalar ${nome}?`)) {
            const logBox = document.getElementById('log-' + idComando);
            if (logBox) {
                logBox.innerHTML = '';
                logBox.style.display = 'block';
                logBox.style.height = '100px';
                logBox.style.maxHeight = '100px';
                const infoLine = document.createElement('div');
                infoLine.className = 'log-line info';
                infoLine.textContent = `🗑️ Desinstalando ${nome}...`;
                logBox.appendChild(infoLine);
                logBox.scrollTop = logBox.scrollHeight;
            }

            await executarComandoPadrao(idComando + '-uninstall', comandoDesinstalar);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Restaurar botão de instalar
            restaurarBotaoOriginal(idComando);
            desmarcarComoExecutado(idComando);
            atualizarInterfaceProgresso();

            // Esconder botão de desinstalar
            const btnDesinstalar = document.querySelector(`[data-comando="${idComando}-uninstall"]`);
            if (btnDesinstalar) {
                btnDesinstalar.style.display = 'none';
            }

            if (logBox) {
                const successLine = document.createElement('div');
                successLine.className = 'log-line success';
                successLine.textContent = `✅ ${nome} desinstalado com sucesso!`;
                logBox.appendChild(successLine);
                logBox.scrollTop = logBox.scrollHeight;
            }
        }
    } else {
        // INSTALAR
        await executarComandoPadrao(idComando, comandoInstalar);
        await new Promise(resolve => setTimeout(resolve, 1500));
        marcarBotaoComoExecutado(idComando);
        atualizarInterfaceProgresso();

        // Mostrar botão de desinstalar
        const btnDesinstalar = document.querySelector(`[data-comando="${idComando}-uninstall"]`);
        if (btnDesinstalar) {
            btnDesinstalar.style.display = 'inline-block';
        }
    }
}

async function executarSteam() {
    await toggleLauncher(
        'Steam',
        'steam-install',
        'flatpak install flathub com.valvesoftware.Steam -y',
        'flatpak uninstall com.valvesoftware.Steam -y'
    );
}

async function executarHeroic() {
    await toggleLauncher(
        'Heroic Games',
        'heroic-install',
        'flatpak install flathub com.heroicgameslauncher.hgl -y',
        'flatpak uninstall com.heroicgameslauncher.hgl -y'
    );
}

async function executarLutris() {
    await toggleLauncher(
        'Lutris',
        'lutris-install',
        'flatpak install flathub net.lutris.Lutris -y',
        'flatpak uninstall net.lutris.Lutris -y'
    );
}

async function executarProtonUp() {
    await toggleLauncher(
        'ProtonUp-Qt',
        'protonup-install',
        'flatpak install flathub net.davidotek.pupgui2 -y',
        'flatpak uninstall net.davidotek.pupgui2 -y'
    );
}

// --- Sessão 06: Loja ---
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

function abrirCentralApps() {
    const desktop = detectarDesktopFrontend();
    let comando = '';
    let nomeCentral = '';
    const spanDesktop = document.getElementById('desktop-detectado');
    if (spanDesktop) {
        const nomes = {
            'KDE': '🪟 KDE Plasma (Discover)',
            'GNOME': '🐧 GNOME (GNOME Software)',
            'XFCE': '🐭 XFCE (AppFinder)',
            'CINNAMON': '🍃 Cinnamon (Software Center)',
            'MATE': '🦎 MATE (Software Boutique)',
            'LXQT': '💠 LXQt (LXQt Software Center)',
            'LXDE': '💠 LXDE (LXDE Software Center)',
            'UNKNOWN': '❓ Desktop desconhecido'
        };
        spanDesktop.textContent = nomes[desktop] || 'Desktop: ' + desktop;
        spanDesktop.style.color = desktop === 'UNKNOWN' ? '#f59e0b' : '#34d399';
    }
    switch (desktop) {
        case 'KDE': comando = 'plasma-discover &'; nomeCentral = 'Discover (KDE Plasma)'; break;
        case 'GNOME': comando = 'gnome-software &'; nomeCentral = 'GNOME Software'; break;
        case 'XFCE': comando = 'xfce4-appfinder &'; nomeCentral = 'AppFinder (XFCE)'; break;
        case 'CINNAMON': comando = 'cinnamon-software & 2>/dev/null || gnome-software &'; nomeCentral = 'Software Center (Cinnamon)'; break;
        case 'MATE': comando = 'mate-software & 2>/dev/null || gnome-software &'; nomeCentral = 'Software Boutique (MATE)'; break;
        case 'LXQT': comando = 'lxqt-software-center & 2>/dev/null || discover & 2>/dev/null || gnome-software &'; nomeCentral = 'LXQt Software Center'; break;
        case 'LXDE': comando = 'lxde-software-center & 2>/dev/null || discover & 2>/dev/null || gnome-software &'; nomeCentral = 'LXDE Software Center'; break;
        default: comando = 'plasma-discover & 2>/dev/null || gnome-software & 2>/dev/null || xfce4-appfinder & 2>/dev/null || cinnamon-software & 2>/dev/null || mate-software &'; nomeCentral = 'Central de Apps (modo automático)'; break;
    }
    const logBox = document.getElementById('log-abrir-central');
    if (logBox) {
        logBox.innerHTML = '';
        logBox.style.display = 'block';
        logBox.style.height = '100px';
        logBox.style.maxHeight = '100px';
        const info1 = document.createElement('div');
        info1.className = 'log-line info';
        info1.textContent = '🛍️ Desktop detectado: ' + desktop;
        logBox.appendChild(info1);
        const info2 = document.createElement('div');
        info2.className = 'log-line output';
        info2.textContent = '📦 Abrindo: ' + nomeCentral;
        logBox.appendChild(info2);
        const info3 = document.createElement('div');
        info3.className = 'log-line success';
        info3.textContent = '✅ Central aberta!';
        logBox.appendChild(info3);
        logBox.scrollTop = logBox.scrollHeight;
    }
    fetch(API_URL + '/executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comando: comando, idComando: 'abrir-central' })
    }).catch(function(e) { console.error('Erro ao abrir central:', e); });
}

async function executarOBSCam() {
    const idComando = 'obs-cam';
    const comando = 'sudo dnf install akmod-v4l2loopback v4l-utils -y 2>/dev/null || sudo dnf install v4l2loopback v4l-utils -y';
    await executarComandoPadrao(idComando, comando);
}

async function reverterOBSCam() {
    const idComando = 'obs-cam';
    const comando = 'sudo dnf remove akmod-v4l2loopback v4l-utils -y && sudo dnf clean all && sudo dnf autoremove -y';
    await executarComandoPadrao(idComando, comando);
    await new Promise(resolve => setTimeout(resolve, 1500));
    restaurarBotaoOriginal(idComando);
    desmarcarComoExecutado(idComando);
    atualizarInterfaceProgresso();
}

// Sessão 7 - EasyEffects
async function executarEasyEffects() {
    const idComando = 'instalar-easyeffects';
    const comando = 'flatpak install flathub com.github.wwmm.easyeffects -y';
    await executarComandoPadrao(idComando, comando);
}

async function reverterEasyEffects() {
    const idComando = 'instalar-easyeffects';
    const comando = 'flatpak uninstall com.github.wwmm.easyeffects -y';

    const logBox = document.getElementById('log-' + idComando);
    if (logBox) {
        logBox.innerHTML = '';
        logBox.style.display = 'block';
        logBox.style.height = '100px';
        logBox.style.maxHeight = '100px';
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line info';
        infoLine.textContent = '🗑️ Desinstalando EasyEffects...';
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }

    try {
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comando: comando, idComando: idComando + '-uninstall' })
        });

        // Aguardar conclusão
        await new Promise(resolve => setTimeout(resolve, 2000));

        // FORÇAR restauração do botão
        const botoes = obterBotoesPorId(idComando);
        if (botoes.btnExecutar) {
            const original = botoes.btnExecutar.getAttribute('data-texto-original') || 'Instalar EasyEffects (Flatpak)';
            botoes.btnExecutar.innerHTML = original;
            botoes.btnExecutar.style.backgroundColor = 'var(--accent)';
            botoes.btnExecutar.style.cursor = 'pointer';
            botoes.btnExecutar.disabled = false;
        }
        if (botoes.btnReverter) {
            botoes.btnReverter.style.display = 'none';
            botoes.btnReverter.disabled = true;
        }

        // Remover do progresso
        desmarcarComoExecutado(idComando);
        atualizarInterfaceProgresso();

        if (logBox) {
            const successLine = document.createElement('div');
            successLine.className = 'log-line success';
            successLine.textContent = '✅ EasyEffects desinstalado com sucesso!';
            logBox.appendChild(successLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    } catch (e) {
        if (logBox) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = '❌ Erro ao desinstalar: ' + e.message;
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    }
}

// --- Sessão 07: Manutenção ---
async function executarLimpeza() {
    const idComando = 'limpeza-sistema';
    const comando = 'sudo dnf clean all && sudo dnf autoremove -y && flatpak uninstall --unused -y';
    await executarComandoPadrao(idComando, comando);
}

var kernelsList = [];

// Sessão 8 - Kernels
async function listarKernels() {
    const idComando = 'listar-kernels';
    const comando = 'rpm -q kernel-core --queryformat "%{VERSION}-%{RELEASE}.%{ARCH}\n" 2>/dev/null';

    const logBox = document.getElementById('log-listar-kernels');
    if (logBox) {
        logBox.innerHTML = '';
        logBox.style.display = 'block';
        logBox.style.height = '100px';
        logBox.style.maxHeight = '100px';
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line info';
        infoLine.textContent = '📋 Obtendo lista de kernels instalados...';
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }

    const btn = document.querySelector("button[onclick='listarKernels()']");
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Verificando...';
        btn.style.opacity = '0.6';
    }

    // Variável para capturar o output do SSE
    let outputCompleto = '';
    let sseConnection = null;

    try {
        // 1. Primeiro, faz a requisição para executar o comando
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: comando,
                idComando: idComando
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // 2. Conecta ao SSE para capturar o output
        const ssePromise = new Promise((resolve, reject) => {
            const eventSource = new EventSource(API_URL + '/stream?id=' + idComando);
            sseConnection = eventSource;

            let outputLines = [];

            eventSource.onmessage = function(event) {
                try {
                    const dados = JSON.parse(event.data);

                    if (dados.tipo === 'end') {
                        // Fim da execução, resolve com o output capturado
                        eventSource.close();
                        resolve(outputLines.join('\n'));
                        return;
                    }

                    if (dados.tipo === 'output' || dados.tipo === 'info') {
                        // Adiciona a linha ao output
                        const linha = dados.mensagem.trim();
                        if (linha && !linha.includes('Comando aceito')) {
                            outputLines.push(linha);
                            // Mostra no log
                            if (logBox) {
                                const lineElement = document.createElement('div');
                                lineElement.className = 'log-line ' + dados.tipo;
                                lineElement.textContent = linha;
                                logBox.appendChild(lineElement);
                                logBox.scrollTop = logBox.scrollHeight;
                            }
                        }
                    }
                } catch (e) {
                    console.error('Erro ao processar SSE:', e);
                }
            };

            eventSource.onerror = function(event) {
                // Se o SSE falhar, tenta o fallback
                console.warn('SSE error, tentando fallback...');
                eventSource.close();
                reject(new Error('SSE connection failed'));
            };

            // Timeout de segurança
            setTimeout(() => {
                if (eventSource.readyState !== EventSource.CLOSED) {
                    eventSource.close();
                    // Se não recebeu dados, tenta fallback
                    if (outputLines.length === 0) {
                        reject(new Error('Timeout'));
                    } else {
                        resolve(outputLines.join('\n'));
                    }
                }
            }, 30000);
        });

        // Aguarda o SSE completar
        outputCompleto = await ssePromise;
        console.log('📝 Output completo do SSE:', outputCompleto);

        // Processa o output
        let lines = outputCompleto.split('\n')
        .map(line => line.trim())
        .filter(line => {
            return line !== '' &&
            !line.includes('Comando aceito') &&
            !line.includes('rpm -q') &&
            !line.includes('sed') &&
            !line.includes('grep') &&
            !line.includes('kernel-core') &&
            !line.includes('{') &&
            !line.includes('}') &&
            !line.includes('success') &&
            !line.includes('output') &&
            !line.includes('──────────') &&
            !line.includes('$ ');
        });

        console.log('📊 Linhas processadas:', lines);

        const select = document.getElementById('kernel-select');
        const btnRemover = document.getElementById('btn-remover-kernel');

        select.innerHTML = '';

        if (lines.length === 0) {
            // Tenta o fallback com uname -r
            console.log('⚠️ Nenhum kernel encontrado, tentando fallback...');
            await listarKernelsFallback();
        } else {
            kernelsList = lines;
            lines.forEach(function(kernel) {
                const option = document.createElement('option');
                option.value = kernel;
                option.textContent = 'kernel-' + kernel;
                select.appendChild(option);
            });
            select.disabled = false;
            btnRemover.disabled = false;

            if (logBox) {
                const successLine = document.createElement('div');
                successLine.className = 'log-line success';
                successLine.textContent = '✅ ' + lines.length + ' kernel(s) encontrado(s):';
                logBox.appendChild(successLine);
                lines.forEach(function(kernel) {
                    const kernelLine = document.createElement('div');
                    kernelLine.className = 'log-line output';
                    kernelLine.textContent = '   • kernel-' + kernel;
                    logBox.appendChild(kernelLine);
                });
                logBox.scrollTop = logBox.scrollHeight;
            }
        }

    } catch (e) {
        console.error('❌ Erro:', e);
        // Se falhou, tenta fallback
        await listarKernelsFallback();
    } finally {
        // Limpa a conexão SSE
        if (sseConnection) {
            sseConnection.close();
        }
    }

    if (btn) {
        btn.disabled = false;
        btn.textContent = '📋 Verificar Kernels';
        btn.style.opacity = '1';
        btn.style.backgroundColor = 'var(--accent)';
    }
}

// Função fallback usando uname -r
async function listarKernelsFallback() {
    console.log('🔄 Usando fallback com uname -r');
    const logBox = document.getElementById('log-listar-kernels');
    const idComando = 'uname-current';
    const comando = 'uname -r';

    let outputCompleto = '';
    let sseConnection = null;

    try {
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: comando,
                idComando: idComando
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Conecta ao SSE para capturar o output
        const ssePromise = new Promise((resolve, reject) => {
            const eventSource = new EventSource(API_URL + '/stream?id=' + idComando);
            sseConnection = eventSource;

            let outputLines = [];

            eventSource.onmessage = function(event) {
                try {
                    const dados = JSON.parse(event.data);

                    if (dados.tipo === 'end') {
                        eventSource.close();
                        resolve(outputLines.join('\n'));
                        return;
                    }

                    if (dados.tipo === 'output' || dados.tipo === 'info') {
                        const linha = dados.mensagem.trim();
                        if (linha && !linha.includes('Comando aceito')) {
                            outputLines.push(linha);
                            if (logBox) {
                                const lineElement = document.createElement('div');
                                lineElement.className = 'log-line ' + dados.tipo;
                                lineElement.textContent = linha;
                                logBox.appendChild(lineElement);
                                logBox.scrollTop = logBox.scrollHeight;
                            }
                        }
                    }
                } catch (e) {
                    console.error('Erro ao processar SSE:', e);
                }
            };

            eventSource.onerror = function(event) {
                eventSource.close();
                reject(new Error('SSE connection failed'));
            };

            setTimeout(() => {
                if (eventSource.readyState !== EventSource.CLOSED) {
                    eventSource.close();
                    if (outputLines.length === 0) {
                        reject(new Error('Timeout'));
                    } else {
                        resolve(outputLines.join('\n'));
                    }
                }
            }, 30000);
        });

        outputCompleto = await ssePromise;
        console.log('📝 Kernel atual (fallback):', outputCompleto);

        const currentKernel = outputCompleto.trim();
        const select = document.getElementById('kernel-select');
        const btnRemover = document.getElementById('btn-remover-kernel');

        select.innerHTML = '';

        if (currentKernel &&
            !currentKernel.includes('Comando aceito') &&
            !currentKernel.includes('{') &&
            !currentKernel.includes('}') &&
            currentKernel !== '') {

            kernelsList = [currentKernel];
        const option = document.createElement('option');
        option.value = currentKernel;
        option.textContent = 'kernel-' + currentKernel + ' (atual)';
        select.appendChild(option);
        select.disabled = false;
        btnRemover.disabled = false;

        if (logBox) {
            const successLine = document.createElement('div');
            successLine.className = 'log-line success';
            successLine.textContent = '✅ Kernel atual encontrado:';
            logBox.appendChild(successLine);
            const kernelLine = document.createElement('div');
            kernelLine.className = 'log-line output';
            kernelLine.textContent = '   • kernel-' + currentKernel + ' (atual)';
            logBox.appendChild(kernelLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
            } else {
                select.innerHTML = '<option value="">Nenhum kernel encontrado</option>';
                select.disabled = true;
                btnRemover.disabled = true;
                if (logBox) {
                    const warningLine = document.createElement('div');
                    warningLine.className = 'log-line warning';
                    warningLine.textContent = '⚠️ Nenhum kernel encontrado no sistema';
                    logBox.appendChild(warningLine);
                    logBox.scrollTop = logBox.scrollHeight;
                }
            }

    } catch (e) {
        console.error('❌ Erro no fallback:', e);
        if (logBox) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = '❌ Erro no fallback: ' + e.message;
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    } finally {
        if (sseConnection) {
            sseConnection.close();
        }
    }
}

async function removerKernel() {
    const select = document.getElementById('kernel-select');
    const kernel = select.value;

    if (!kernel) {
        alert('Selecione um kernel para remover.');
        return;
    }

    // Verificar se é o kernel atual
    try {
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: 'uname -r',
                idComando: 'check-current-kernel'
            })
        });

        if (response.ok) {
            // Aguardar o SSE completar para capturar o output
            const currentKernel = await new Promise((resolve) => {
                let output = '';
                const eventSource = new EventSource(API_URL + '/stream?id=check-current-kernel');

                eventSource.onmessage = function(event) {
                    try {
                        const dados = JSON.parse(event.data);
                        if (dados.tipo === 'end') {
                            eventSource.close();
                            resolve(output.trim());
                            return;
                        }
                        if (dados.tipo === 'output' || dados.tipo === 'info') {
                            output += dados.mensagem;
                        }
                    } catch (e) {}
                };

                eventSource.onerror = function() {
                    eventSource.close();
                    resolve('');
                };

                setTimeout(() => {
                    if (eventSource.readyState !== EventSource.CLOSED) {
                        eventSource.close();
                        resolve(output.trim());
                    }
                }, 10000);
            });

            // Verifica se o kernel selecionado é o atual
            if (currentKernel && kernel.includes(currentKernel)) {
                alert('⚠️ Você está tentando remover o kernel atual! Isso não é recomendado e pode causar problemas.');
                return;
            }
        }
    } catch (e) {
        console.error('Erro ao verificar kernel atual:', e);
    }

    // Confirmar remoção
    const confirmacao = confirm(
        '⚠️ ATENÇÃO!\n\nVocê está prestes a remover o kernel:\n' +
        kernel + '\n\n' +
        'Esta ação requer privilégios de administrador.\n' +
        'Tem certeza que deseja continuar?'
    );

    if (!confirmacao) return;

    const logBox = document.getElementById('log-listar-kernels');
    if (logBox) {
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line info';
        infoLine.textContent = '🗑️ Removendo kernel: ' + kernel + '...';
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }

    const idComando = 'remover-kernel';
    // CORREÇÃO: Usar sudo com autenticação
    const comando = 'sudo dnf remove kernel-core-' + kernel + ' -y';

    // Desabilitar botões durante a remoção
    const btnRemover = document.getElementById('btn-remover-kernel');
    const selectKernel = document.getElementById('kernel-select');
    if (btnRemover) {
        btnRemover.disabled = true;
        btnRemover.textContent = '⏳ Removendo...';
        btnRemover.style.opacity = '0.6';
    }
    if (selectKernel) {
        selectKernel.disabled = true;
    }

    try {
        // Executar o comando com autenticação
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: comando,
                idComando: idComando
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Aguardar o SSE completar
        await new Promise((resolve) => {
            const eventSource = new EventSource(API_URL + '/stream?id=' + idComando);

            eventSource.onmessage = function(event) {
                try {
                    const dados = JSON.parse(event.data);
                    if (dados.tipo === 'end') {
                        eventSource.close();
                        resolve();
                        return;
                    }
                    // Mostrar logs em tempo real
                    if (dados.tipo === 'output' || dados.tipo === 'info' || dados.tipo === 'error') {
                        if (logBox) {
                            const lineElement = document.createElement('div');
                            lineElement.className = 'log-line ' + dados.tipo;
                            lineElement.textContent = dados.mensagem;
                            logBox.appendChild(lineElement);
                            logBox.scrollTop = logBox.scrollHeight;
                        }
                    }
                } catch (e) {}
            };

            eventSource.onerror = function() {
                eventSource.close();
                resolve();
            };

            setTimeout(() => {
                if (eventSource.readyState !== EventSource.CLOSED) {
                    eventSource.close();
                    resolve();
                }
            }, 60000); // 1 minuto timeout
        });

        // Sucesso - atualizar a lista
        if (logBox) {
            const successLine = document.createElement('div');
            successLine.className = 'log-line success';
            successLine.textContent = '✅ Kernel ' + kernel + ' removido com sucesso!';
            logBox.appendChild(successLine);
            logBox.scrollTop = logBox.scrollHeight;
        }

        // Recarregar a lista de kernels
        setTimeout(async function() {
            await listarKernels();
        }, 2000);

    } catch (e) {
        console.error('❌ Erro ao remover kernel:', e);
        if (logBox) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = '❌ Erro ao remover kernel: ' + e.message;
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    } finally {
        // Reabilitar botões
        if (btnRemover) {
            btnRemover.disabled = false;
            btnRemover.textContent = '🗑️ Remover';
            btnRemover.style.opacity = '1';
        }
        if (selectKernel) {
            selectKernel.disabled = false;
        }
    }
}

// Função para verificar a versão atual do Fedora
async function verificarVersaoFedora() {
    const logBox = document.getElementById('log-system-upgrade');
    const statusDiv = document.getElementById('upgrade-status');

    if (logBox) {
        logBox.innerHTML = '';
        logBox.style.display = 'block';
        logBox.style.height = '100px';
        logBox.style.maxHeight = '100px';
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line info';
        infoLine.textContent = '🔍 Verificando versão atual do Fedora...';
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }

    if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.style.backgroundColor = 'var(--bg-card)';
        statusDiv.style.border = '1px solid var(--border)';
        statusDiv.innerHTML = '⏳ Verificando...';
    }

    try {
        // Comando para verificar a versão do Fedora
        const comando = 'cat /etc/fedora-release | grep -oP "[0-9]+" | head -1';

        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: comando,
                idComando: 'check-fedora-version'
            })
        });

        if (response.ok) {
            // Aguardar o SSE completar
            const versaoAtual = await new Promise((resolve) => {
                let output = '';
                const eventSource = new EventSource(API_URL + '/stream?id=check-fedora-version');

                eventSource.onmessage = function(event) {
                    try {
                        const dados = JSON.parse(event.data);
                        if (dados.tipo === 'end') {
                            eventSource.close();
                            resolve(output.trim());
                            return;
                        }
                        if (dados.tipo === 'output' || dados.tipo === 'info') {
                            const linha = dados.mensagem.trim();
                            if (linha && !linha.includes('Comando aceito')) {
                                output += linha;
                            }
                            // Mostrar no log
                            if (logBox) {
                                const lineElement = document.createElement('div');
                                lineElement.className = 'log-line ' + dados.tipo;
                                lineElement.textContent = dados.mensagem;
                                logBox.appendChild(lineElement);
                                logBox.scrollTop = logBox.scrollHeight;
                            }
                        }
                    } catch (e) {}
                };

                eventSource.onerror = function() {
                    eventSource.close();
                    resolve('');
                };

                setTimeout(() => {
                    if (eventSource.readyState !== EventSource.CLOSED) {
                        eventSource.close();
                        resolve(output.trim());
                    }
                }, 10000);
            });

            // Verificar versão mais recente disponível
            const versaoSelecionada = document.getElementById('select-fedora-version').value;
            const versaoAtualInt = parseInt(versaoAtual);
            const versaoSelecionadaInt = parseInt(versaoSelecionada);

            // Verificar se a versão selecionada já foi lançada
            const versaoDisponivel = await verificarVersaoDisponivel(versaoSelecionadaInt);

            if (statusDiv) {
                statusDiv.style.display = 'block';

                if (!versaoDisponivel) {
                    statusDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    statusDiv.style.border = '1px solid #ef4444';
                    statusDiv.style.color = '#ef4444';
                    statusDiv.innerHTML = `
                    ❌ <strong>Fedora ${versaoSelecionada} ainda não foi lançado!</strong><br>
                    A versão mais recente disponível é o Fedora ${versaoAtualInt}.
                    `;
                    if (logBox) {
                        const warningLine = document.createElement('div');
                        warningLine.className = 'log-line warning';
                        warningLine.textContent = `⚠️ Fedora ${versaoSelecionada} ainda não foi lançado! Versão atual: ${versaoAtualInt}`;
                        logBox.appendChild(warningLine);
                        logBox.scrollTop = logBox.scrollHeight;
                    }
                    return;
                }

                if (versaoSelecionadaInt <= versaoAtualInt) {
                    statusDiv.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                    statusDiv.style.border = '1px solid #f59e0b';
                    statusDiv.style.color = '#f59e0b';
                    statusDiv.innerHTML = `
                    ⚠️ <strong>Você já está na versão ${versaoAtualInt} ou superior!</strong><br>
                    Versão atual: Fedora ${versaoAtualInt}<br>
                    Versão selecionada: Fedora ${versaoSelecionada}
                    `;
                    if (logBox) {
                        const warningLine = document.createElement('div');
                        warningLine.className = 'log-line warning';
                        warningLine.textContent = `⚠️ Você já está na versão ${versaoAtualInt} (selecionado: ${versaoSelecionada})`;
                        logBox.appendChild(warningLine);
                        logBox.scrollTop = logBox.scrollHeight;
                    }
                    return;
                }

                // Upgrade disponível
                statusDiv.style.backgroundColor = 'rgba(52, 211, 153, 0.1)';
                statusDiv.style.border = '1px solid #34d399';
                statusDiv.style.color = '#34d399';
                statusDiv.innerHTML = `
                ✅ <strong>Upgrade disponível!</strong><br>
                Versão atual: Fedora ${versaoAtualInt}<br>
                Versão alvo: Fedora ${versaoSelecionada}<br>
                <span style="font-size: 0.85rem; color: var(--text-muted);">
                Clique em "Baixar Nova Versão" para iniciar o upgrade.
                </span>
                `;
                if (logBox) {
                    const successLine = document.createElement('div');
                    successLine.className = 'log-line success';
                    successLine.textContent = `✅ Upgrade disponível: Fedora ${versaoAtualInt} → Fedora ${versaoSelecionada}`;
                    logBox.appendChild(successLine);
                    logBox.scrollTop = logBox.scrollHeight;
                }
            }
        }
    } catch (e) {
        console.error('Erro ao verificar versão:', e);
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            statusDiv.style.border = '1px solid #ef4444';
            statusDiv.style.color = '#ef4444';
            statusDiv.innerHTML = '❌ Erro ao verificar versão: ' + e.message;
        }
    }
}

// Função para verificar se a versão já foi lançada
async function verificarVersaoDisponivel(versao) {
    try {
        const url = `https://mirrors.fedoraproject.org/mirrorlist?repo=fedora-${versao}&arch=x86_64`;
        const comando = `curl -s --max-time 5 -o /dev/null -w "%{http_code}" "${url}"`;

        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: comando,
                idComando: 'check-version-available'
            })
        });

        if (!response.ok) {
            return false;
        }

        // Aguardar o SSE completar e capturar o output
        const output = await new Promise((resolve) => {
            let output = '';
            const eventSource = new EventSource(API_URL + '/stream?id=check-version-available');

            eventSource.onmessage = function(event) {
                try {
                    const dados = JSON.parse(event.data);
                    if (dados.tipo === 'end') {
                        eventSource.close();
                        resolve(output.trim());
                        return;
                    }
                    if (dados.tipo === 'output' || dados.tipo === 'info') {
                        const linha = dados.mensagem.trim();
                        if (linha && !linha.includes('Comando aceito')) {
                            output += linha;
                        }
                    }
                } catch (e) {
                    console.error('Erro ao processar SSE:', e);
                }
            };

            eventSource.onerror = function() {
                eventSource.close();
                resolve(output.trim());
            };

            setTimeout(() => {
                if (eventSource.readyState !== EventSource.CLOSED) {
                    eventSource.close();
                    resolve(output.trim());
                }
            }, 10000);
        });

        console.log(`📡 Verificando versão ${versao}:`, output);

        // CORREÇÃO: Verificar se o código HTTP é 200
        const codigo = output.trim();
        if (codigo === '200') {
            console.log(`✅ Fedora ${versao} está disponível!`);
            return true;
        } else {
            console.log(`❌ Fedora ${versao} NÃO está disponível (código: ${codigo})`);
            return false;
        }
    } catch (e) {
        console.error('Erro ao verificar versão disponível:', e);
        return false;
    }
}

// Função corrigida para executar upgrade
async function executarUpgradeFedora() {
    console.log('🔧 executarUpgradeFedora() foi chamada!');

    const versaoSelecionada = document.getElementById('select-fedora-version').value;
    console.log('📌 Versão selecionada:', versaoSelecionada);

    const idComando = 'system-upgrade';
    const logBox = document.getElementById('log-system-upgrade');
    const statusDiv = document.getElementById('upgrade-status');

    if (!logBox) {
        console.error('❌ Log box não encontrado!');
        return;
    }

    // Mostrar log inicial
    logBox.innerHTML = '';
    logBox.style.display = 'block';
    logBox.style.height = '100px';
    logBox.style.maxHeight = '100px';

    const infoLine = document.createElement('div');
    infoLine.className = 'log-line info';
    infoLine.textContent = '🔍 Verificando versão atual do Fedora...';
    logBox.appendChild(infoLine);
    logBox.scrollTop = logBox.scrollHeight;

    // Obter versão atual (usando método direto com fetch)
    let versaoAtual = '';
    try {
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: 'cat /etc/fedora-release | grep -oP "[0-9]+" | head -1',
                idComando: 'get-version-direct'
            })
        });

        if (response.ok) {
            const dados = await response.json();
            // O output pode vir no campo 'output'
            versaoAtual = dados.output || '';
            versaoAtual = versaoAtual.trim();
            console.log('📝 Versão atual (direta):', versaoAtual);
        }
    } catch (e) {
        console.error('Erro ao obter versão:', e);
    }

    // Se não conseguiu, tenta método alternativo
    if (!versaoAtual || versaoAtual === '') {
        try {
            const response = await fetch(API_URL + '/executar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comando: 'rpm -q fedora-release --queryformat "%{VERSION}" 2>/dev/null | grep -oP "[0-9]+" | head -1',
                    idComando: 'get-version-rpm'
                })
            });

            if (response.ok) {
                const dados = await response.json();
                versaoAtual = dados.output || '';
                versaoAtual = versaoAtual.trim();
                console.log('📝 Versão atual (rpm):', versaoAtual);
            }
        } catch (e) {
            console.error('Erro ao obter versão via rpm:', e);
        }
    }

    // Se ainda não tem versão, usar valor padrão ou pedir para o usuário
    if (!versaoAtual || versaoAtual === '') {
        // Tentar obter via uname
        try {
            const response = await fetch(API_URL + '/executar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comando: 'uname -r | grep -oP "[0-9]+" | head -1',
                    idComando: 'get-version-uname'
                })
            });

            if (response.ok) {
                const dados = await response.json();
                versaoAtual = dados.output || '';
                versaoAtual = versaoAtual.trim();
                console.log('📝 Versão atual (uname):', versaoAtual);
            }
        } catch (e) {
            console.error('Erro ao obter versão via uname:', e);
        }
    }

    // Se ainda não tem versão, usar fallback
    if (!versaoAtual || versaoAtual === '') {
        versaoAtual = '40'; // Fallback para Fedora 40
        console.log('⚠️ Usando versão fallback:', versaoAtual);

        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            statusDiv.style.border = '1px solid #f59e0b';
            statusDiv.style.color = '#f59e0b';
            statusDiv.innerHTML = `
            ⚠️ Não foi possível detectar a versão automaticamente.<br>
            <span style="font-size: 0.85rem; color: var(--text-muted);">
            Assumindo Fedora ${versaoAtual} como versão atual.
            </span>
            `;
        }
    }

    const versaoAtualInt = parseInt(versaoAtual);
    const versaoSelecionadaInt = parseInt(versaoSelecionada);

    console.log(`📊 Comparação: Atual=${versaoAtualInt}, Selecionada=${versaoSelecionadaInt}`);

    // Verificar se a versão selecionada já foi lançada
    const versaoDisponivel = await verificarVersaoDisponivel(versaoSelecionadaInt);
    console.log(`📊 Versão ${versaoSelecionada} disponível:`, versaoDisponivel);

    if (!versaoDisponivel) {
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            statusDiv.style.border = '1px solid #ef4444';
            statusDiv.style.color = '#ef4444';
            statusDiv.innerHTML = `
            ❌ <strong>Fedora ${versaoSelecionada} ainda não foi lançado!</strong><br>
            A versão mais recente disponível é o Fedora ${versaoAtualInt || 'desconhecida'}.
            `;
        }
        if (logBox) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = `❌ Fedora ${versaoSelecionada} ainda não foi lançado!`;
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
        return;
    }

    if (versaoSelecionadaInt <= versaoAtualInt) {
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            statusDiv.style.border = '1px solid #f59e0b';
            statusDiv.style.color = '#f59e0b';
            statusDiv.innerHTML = `
            ⚠️ <strong>Você já está na versão ${versaoAtualInt}!</strong><br>
            Não é necessário fazer upgrade para o Fedora ${versaoSelecionada}.
            `;
        }
        if (logBox) {
            const warningLine = document.createElement('div');
            warningLine.className = 'log-line warning';
            warningLine.textContent = `⚠️ Você já está na versão ${versaoAtualInt}`;
            logBox.appendChild(warningLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
        return;
    }

    // Confirmar upgrade
    const confirmacao = confirm(
        `⚠️ ATENÇÃO!\n\n` +
        `Você está prestes a fazer upgrade do Fedora ${versaoAtualInt} para o Fedora ${versaoSelecionada}.\n\n` +
        `Este processo irá:\n` +
        `• Baixar todos os pacotes da nova versão\n` +
        `• Preparar o sistema para o upgrade\n` +
        `• Você precisará reiniciar para concluir\n\n` +
        `Tem certeza que deseja continuar?`
    );

    if (!confirmacao) return;

    // Executar o upgrade
    if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.style.backgroundColor = 'rgba(52, 211, 153, 0.1)';
        statusDiv.style.border = '1px solid #34d399';
        statusDiv.style.color = '#34d399';
        statusDiv.innerHTML = `
        ⏳ <strong>Baixando pacotes para Fedora ${versaoSelecionada}...</strong><br>
        Isso pode levar alguns minutos.
        `;
    }

    const comando = `sudo dnf upgrade --refresh -y && sudo dnf system-upgrade download --releasever=${versaoSelecionada} -y`;

    if (logBox) {
        const infoLine = document.createElement('div');
        infoLine.className = 'log-line info';
        infoLine.textContent = `📥 Baixando pacotes para Fedora ${versaoSelecionada}...`;
        logBox.appendChild(infoLine);
        logBox.scrollTop = logBox.scrollHeight;
    }

    const btn = document.querySelector("button[onclick='executarUpgradeFedora()']");
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Baixando...';
        btn.style.opacity = '0.6';
    }

    try {
        console.log('🚀 Enviando requisição para:', comando);

        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: comando,
                idComando: idComando
            })
        });

        console.log('📡 Resposta recebida:', response.status);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Aguardar o SSE completar
        await new Promise((resolve) => {
            const eventSource = new EventSource(API_URL + '/stream?id=' + idComando);

            eventSource.onmessage = function(event) {
                try {
                    const dados = JSON.parse(event.data);
                    if (dados.tipo === 'end') {
                        eventSource.close();
                        resolve();
                        return;
                    }
                    if (dados.tipo === 'output' || dados.tipo === 'info' || dados.tipo === 'success') {
                        if (logBox) {
                            const lineElement = document.createElement('div');
                            lineElement.className = 'log-line ' + dados.tipo;
                            lineElement.textContent = dados.mensagem;
                            logBox.appendChild(lineElement);
                            logBox.scrollTop = logBox.scrollHeight;
                        }
                    }
                } catch (e) {
                    console.error('Erro no SSE:', e);
                }
            };

            eventSource.onerror = function() {
                eventSource.close();
                resolve();
            };

            setTimeout(() => {
                if (eventSource.readyState !== EventSource.CLOSED) {
                    eventSource.close();
                    resolve();
                }
            }, 1800000);
        });

        // Sucesso
        if (statusDiv) {
            statusDiv.style.backgroundColor = 'rgba(52, 211, 153, 0.1)';
            statusDiv.style.border = '1px solid #34d399';
            statusDiv.style.color = '#34d399';
            statusDiv.innerHTML = `
            ✅ <strong>Pacotes baixados com sucesso!</strong><br>
            Para concluir o upgrade, execute no terminal:<br>
            <code style="background-color: #0a0e1a; padding: 0.3rem 0.6rem; border-radius: 4px; display: inline-block; margin-top: 0.3rem;">
            sudo dnf system-upgrade reboot
            </code>
            `;
        }

        if (logBox) {
            const successLine = document.createElement('div');
            successLine.className = 'log-line success';
            successLine.textContent = '✅ Pacotes baixados! Execute "sudo dnf system-upgrade reboot" para finalizar.';
            logBox.appendChild(successLine);
            logBox.scrollTop = logBox.scrollHeight;
        }

    } catch (e) {
        console.error('❌ Erro no upgrade:', e);
        if (statusDiv) {
            statusDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            statusDiv.style.border = '1px solid #ef4444';
            statusDiv.style.color = '#ef4444';
            statusDiv.innerHTML = '❌ Erro ao baixar pacotes: ' + e.message;
        }
        if (logBox) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = '❌ Erro: ' + e.message;
            logBox.appendChild(errorLine);
            logBox.scrollTop = logBox.scrollHeight;
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = '📥 Baixar Nova Versão';
            btn.style.opacity = '1';
        }
    }
}

// Função alternativa para obter a versão atual
async function obterVersaoAtualAlternativa() {
    try {
        // Usar comando mais simples
        const comando = 'rpm -q fedora-release --queryformat "%{VERSION}" 2>/dev/null | grep -oP "[0-9]+" | head -1';

        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: comando,
                idComando: 'get-version-alt'
            })
        });

        if (!response.ok) {
            return '';
        }

        const versao = await new Promise((resolve) => {
            let output = '';
            let outputFinal = '';
            const eventSource = new EventSource(API_URL + '/stream?id=get-version-alt');

            eventSource.onmessage = function(event) {
                try {
                    const dados = JSON.parse(event.data);

                    if (dados.tipo === 'end') {
                        eventSource.close();
                        const lines = output.split('\n');
                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (trimmed && !trimmed.includes('Comando aceito') && !trimmed.includes('rpm -q')) {
                                const match = trimmed.match(/\d+/);
                                if (match) {
                                    outputFinal = match[0];
                                    break;
                                }
                            }
                        }
                        resolve(outputFinal);
                        return;
                    }

                    if (dados.tipo === 'output' || dados.tipo === 'info') {
                        output += dados.mensagem;
                    }
                } catch (e) {}
            };

            eventSource.onerror = function() {
                eventSource.close();
                const lines = output.split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.includes('Comando aceito')) {
                        const match = trimmed.match(/\d+/);
                        if (match) {
                            outputFinal = match[0];
                            break;
                        }
                    }
                }
                resolve(outputFinal);
            };

            setTimeout(() => {
                if (eventSource.readyState !== EventSource.CLOSED) {
                    eventSource.close();
                    const lines = output.split('\n');
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed && !trimmed.includes('Comando aceito')) {
                            const match = trimmed.match(/\d+/);
                            if (match) {
                                outputFinal = match[0];
                                break;
                            }
                        }
                    }
                    resolve(outputFinal);
                }
            }, 10000);
        });

        console.log('📝 Versão alternativa detectada:', versao);
        return versao;

    } catch (e) {
        console.error('❌ Erro na versão alternativa:', e);
        return '';
    }
}

async function desinstalarFOF() {
    const logBox = document.getElementById('log-desinstalar-fof');
    if (!logBox) return;
    const confirmacao = confirm(
        '⚠️ ATENÇÃO!\n\nVocê está prestes a DESINSTALAR completamente o Fedora Only Fans.\n\n' +
        'Isso irá remover:\n• Todos os arquivos do FOF\n• Atalhos do menu\n• Comando "fof" do terminal\n\n' +
        'Esta ação é IRREVERSÍVEL!\n\nTem certeza que deseja continuar?'
    );
    if (!confirmacao) return;
    const confirmacao2 = confirm(
        '🔄 Última confirmação!\n\nTodos os dados do FOF serão perdidos.\n\nDeseja realmente desinstalar o Fedora Only Fans?'
    );
    if (!confirmacao2) return;

    logBox.innerHTML = '';
    logBox.style.display = 'block';
    logBox.style.height = '100px';
    logBox.style.maxHeight = '100px';
    const header = document.createElement('div');
    header.className = 'log-line info';
    header.textContent = '🗑️ Iniciando desinstalação... (' + new Date().toLocaleTimeString() + ')';
    logBox.appendChild(header);
    logBox.scrollTop = logBox.scrollHeight;

    const btn = document.querySelector('button[onclick="desinstalarFOF()"]');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Desinstalando...';
        btn.style.opacity = '0.6';
    }

    try {
        conectarSSE('desinstalar-fof', logBox);
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comando: 'echo "s" | bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh) --uninstall',
                                 idComando: 'desinstalar-fof'
            })
        });
        if (!response.ok) {
            const errorLine = document.createElement('div');
            errorLine.className = 'log-line error';
            errorLine.textContent = '❌ Erro HTTP: ' + response.status;
            logBox.appendChild(errorLine);
        } else {
            const dados = await response.json();
            if (dados.success === false) {
                const errorLine = document.createElement('div');
                errorLine.className = 'log-line error';
                errorLine.textContent = '❌ Erro: ' + (dados.output || 'Falha na desinstalação');
                logBox.appendChild(errorLine);
                logBox.scrollTop = logBox.scrollHeight;
            } else {
                const successLine = document.createElement('div');
                successLine.className = 'log-line success';
                successLine.textContent = '✅ FOF desinstalado com sucesso!';
                logBox.appendChild(successLine);
                logBox.scrollTop = logBox.scrollHeight;
                setTimeout(function() { window.close(); }, 3000);
            }
        }
    } catch (e) {
        const errorLine = document.createElement('div');
        errorLine.className = 'log-line error';
        errorLine.textContent = '❌ Erro de conexão: ' + e.message;
        logBox.appendChild(errorLine);
        logBox.scrollTop = logBox.scrollHeight;
    }
    setTimeout(function() {
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🗑️ Desinstalar FOF';
            btn.style.opacity = '1';
        }
    }, 10000);
}

// ============================================================
// SSE - LOGS EM TEMPO REAL
// ============================================================

var sseConnections = {};

function conectarSSE(idComando, logBox) {
    if (sseConnections[idComando]) {
        sseConnections[idComando].close();
        delete sseConnections[idComando];
    }
    try {
        var eventSource = new EventSource(API_URL + '/stream?id=' + idComando);
        sseConnections[idComando] = eventSource;
        var linhas = 0;
        var MAX_LINHAS = 100;
        var timeoutId = setTimeout(function() {
            if (sseConnections[idComando]) {
                console.log('[SSE] Timeout de segurança para: ' + idComando);
                completarProgresso(idComando, true);
                restaurarBotaoAposExecucao(idComando, true);
                sseConnections[idComando].close();
                delete sseConnections[idComando];
            }
        }, 1800000);

        eventSource.onmessage = function(event) {
            try {
                var dados = JSON.parse(event.data);
                if (dados.tipo === 'end') {
                    clearTimeout(timeoutId);
                    eventSource.close();
                    delete sseConnections[idComando];
                    completarProgresso(idComando, true);
                    restaurarBotaoAposExecucao(idComando, true);
                    return;
                }
                var mensagem = dados.mensagem;
                mensagem = mensagem.replace(/\x1b\]3008;[^\x1b]*\x1b\\/g, '');
                mensagem = mensagem.replace(/\x1b\[[0-9;]*m/g, '');
                mensagem = mensagem.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
                var lines = mensagem.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.trim() === '') continue;
                    if (line.includes('org.kde.plasma.libdiscover')) continue;
                    if (line.includes('QML Shortcut')) continue;
                    if (line.includes('qt.qpa.services')) continue;
                    if (line.includes('WARNING **: Found icon of unknown type')) continue;
                    if (line.includes('QIODevice::read')) continue;
                    if (line.includes('adding empty sources model')) continue;
                    var lineElement = document.createElement('div');
                    lineElement.className = 'log-line ' + dados.tipo;
                    lineElement.textContent = line;
                    logBox.appendChild(lineElement);
                    linhas++;
                }
                if (linhas > MAX_LINHAS) {
                    var children = logBox.children;
                    for (var j = 0; j < linhas - MAX_LINHAS; j++) {
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
                clearTimeout(timeoutId);
            } else {
                console.warn('[SSE] Erro na conexão:', event);
            }
        };
    } catch (e) {
        console.error('[SSE] Erro ao criar conexão:', e);
        var errorLine = document.createElement('div');
        errorLine.className = 'log-line error';
        errorLine.textContent = '❌ Erro ao conectar SSE: ' + e.message;
        logBox.appendChild(errorLine);
    }
}

// ============================================================
// BARRA DE PROGRESSO
// ============================================================

var progressIntervals = {};

function iniciarProgresso(idComando) {
    var container = document.getElementById('progress-' + idComando);
    if (!container) return;
    container.style.display = 'block';
    var fill = document.getElementById('progress-fill-' + idComando);
    var percent = document.getElementById('progress-percent-' + idComando);
    var status = document.getElementById('progress-status-' + idComando);
    if (!fill || !percent || !status) return;
    fill.style.width = '0%';
    fill.className = 'progress-fill';
    percent.textContent = '0%';
    status.textContent = '⏳ Iniciando...';
    status.className = 'status running';
    var progresso = 0;
    if (progressIntervals[idComando]) {
        clearInterval(progressIntervals[idComando]);
        delete progressIntervals[idComando];
    }
    progressIntervals[idComando] = setInterval(function() {
        if (progresso < 85) {
            var incremento = Math.max(0.05, (85 - progresso) / 200);
            progresso = Math.min(85, progresso + incremento);
            fill.style.width = progresso + '%';
            percent.textContent = Math.round(progresso) + '%';
            status.textContent = '⏳ Executando...';
            status.className = 'status running';
        }
    }, 100);
}

function completarProgresso(idComando, sucesso) {
    if (sucesso === undefined) sucesso = true;
    var container = document.getElementById('progress-' + idComando);
    if (!container) return;
    var fill = document.getElementById('progress-fill-' + idComando);
    var percent = document.getElementById('progress-percent-' + idComando);
    var status = document.getElementById('progress-status-' + idComando);
    if (!fill || !percent || !status) return;
    if (progressIntervals[idComando]) {
        clearInterval(progressIntervals[idComando]);
        delete progressIntervals[idComando];
    }
    if (sucesso) {
        fill.style.width = '100%';
        fill.className = 'progress-fill complete';
        percent.textContent = '100%';
        status.textContent = '✅ Concluído!';
        status.className = 'status success';
    } else {
        fill.style.width = '100%';
        fill.className = 'progress-fill error';
        percent.textContent = '❌ Falha';
        status.textContent = '❌ Erro na execução';
        status.className = 'status error';
    }
    setTimeout(function() {
        var logBox = document.getElementById('log-' + idComando);
        if (logBox && logBox.style.display !== 'block') {
            container.style.display = 'none';
        }
    }, 5000);
}

// ============================================================
// SELECTS PERSONALIZADOS
// ============================================================

function initCustomSelect(containerId, triggerId, optionsId, hiddenId, displayId) {
    var container = document.getElementById(containerId);
    var trigger, options, hiddenInput, displayValue;

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
        var isOpen = trigger.classList.toggle('open');
        options.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen);
    });

    var optionItems = options.querySelectorAll('li');
    for (var i = 0; i < optionItems.length; i++) {
        var li = optionItems[i];
        li.addEventListener('click', function(e) {
            e.stopPropagation();
            var value = this.getAttribute('data-value');
            var text = this.textContent;
            displayValue.textContent = text;
            hiddenInput.value = value;
            var allOptions = options.querySelectorAll('li');
            for (var j = 0; j < allOptions.length; j++) {
                allOptions[j].classList.remove('selected');
            }
            this.classList.add('selected');
            trigger.classList.remove('open');
            options.classList.remove('open');
        });
    }
}

// ============================================================
// NAVEGAÇÃO DO MODO GUIADO
// ============================================================

var sessaoAtual = 0;
var sessoes = [
    '00-boas-vindas',
'01-restauracao',
'02-otimizacao',
'03-repositorios',
'04-fontes',
'05-launchers',
'06-loja',
'07-manutencao',
'08-fof-manutencao'
];

var nomesSessoes = {
    '00-boas-vindas': 'Boas-vindas',
    '01-restauracao': 'Restauração',
    '02-otimizacao': 'Otimização',
    '03-repositorios': 'Repositórios',
    '04-fontes': 'Fontes',
    '05-launchers': 'Launchers',
    '06-loja': 'Loja',
    '07-manutencao': 'Manutenção',
    '08-fof-manutencao': 'Manutenção FOF'
};

function irParaSessao(index) {
    var total = sessoes.length;
    if (index < 0 || index >= total) return;

    sessaoAtual = index;

    // Esconde todas as sessões e o resumo
    document.querySelectorAll('.etapa-card').forEach(el => el.style.display = 'none');
    document.getElementById('resumo-final').classList.remove('ativo');

    // Mostra a sessão atual
    const card = document.getElementById('sessao-' + sessoes[index]);
    if (card) {
        card.style.display = 'block';
        card.classList.add('ativa');
    }

    // Atualiza navegação
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProximo = document.getElementById('btn-proximo');
    const btnPular = document.getElementById('btn-pular');
    const infoSessao = document.getElementById('info-sessao');

    if (btnAnterior) btnAnterior.disabled = (index === 0);
    if (btnProximo) btnProximo.disabled = (index === total - 1);
    if (btnPular) {
        var status = getStatusComando(sessoes[index]);
        btnPular.disabled = (status === 'executado' || status === 'pulado');
    }
    if (infoSessao) {
        infoSessao.innerHTML = '<strong>' + (index + 1) + '/' + total + '</strong> - ' + (nomesSessoes[sessoes[index]] || sessoes[index]);
    }

    atualizarBarraProgressoGuia(index, total);
    atualizarIndicadores();

    var statusText = document.getElementById('progress-guia-status');
    if (statusText) {
        var status = getStatusComando(sessoes[index]);
        if (status === 'executado') {
            statusText.textContent = '✅ Concluída';
            statusText.className = 'status-text concluido';
        } else if (status === 'pulado') {
            statusText.textContent = '⏭️ Pulada';
            statusText.className = 'status-text';
        } else {
            statusText.textContent = '⏳ Pendente';
            statusText.className = 'status-text';
        }
    }

    // CORREÇÃO: Verificar conclusão apenas se NÃO for a última sessão
    // Se for a última, verificar se deve mostrar o resumo
    if (index === total - 1) {
        // Estamos na última sessão, verificar se todas estão concluídas
        verificarConclusaoTotal();
    } else {
        // Não está na última, apenas atualizar
        atualizarBarraProgressoGeral();
    }
}

function atualizarBarraProgressoGuia(atual, total) {
    var fill = document.getElementById('progress-guia-fill');
    var text = document.getElementById('progress-guia-text');
    if (fill) {
        var percent = ((atual + 1) / total) * 100;
        fill.style.width = percent + '%';
    }
    if (text) {
        text.textContent = (atual + 1) + ' de ' + total;
    }
}

function sessaoAnterior() {
    if (sessaoAtual > 0) {
        irParaSessao(sessaoAtual - 1);
    }
}

function proximaSessao() {
    if (sessaoAtual < sessoes.length - 1) {
        irParaSessao(sessaoAtual + 1);
    }
}

function pularSessao() {
    var nomeSessao = sessoes[sessaoAtual];
    var status = getStatusComando(nomeSessao);
    if (status === 'executado') {
        alert('Esta sessão já foi executada. Não é possível pular.');
        return;
    }
    if (status === 'pulado') {
        alert('Esta sessão já foi pulada.');
        return;
    }
    if (confirm('Tem certeza que deseja pular "' + (nomesSessoes[nomeSessao] || nomeSessao) + '"?\n\nVocê pode voltar depois para executá-la.')) {
        marcarComoPulado(nomeSessao);
        atualizarInterfaceProgresso();
        atualizarIndicadores();
        var statusText = document.getElementById('progress-guia-status');
        if (statusText) {
            statusText.textContent = '⏭️ Pulada';
            statusText.className = 'status-text';
        }
        var btnPular = document.getElementById('btn-pular');
        if (btnPular) btnPular.disabled = true;
        verificarConclusaoTotal();
    }
}

function criarIndicadores() {
    var container = document.getElementById('sessao-indicadores');
    if (!container) return;
    container.innerHTML = '';
    var total = sessoes.length;
    for (var i = 0; i < total; i++) {
        var dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = i;
        dot.title = nomesSessoes[sessoes[i]] || sessoes[i];
        dot.addEventListener('click', function() {
            var index = parseInt(this.dataset.index);
            if (index !== sessaoAtual) {
                irParaSessao(index);
            }
        });
        container.appendChild(dot);
    }
    atualizarIndicadores();
}

function atualizarIndicadores() {
    var dots = document.querySelectorAll('.sessao-indicador .dot');
    dots.forEach(function(dot, index) {
        dot.className = 'dot';
        var nomeSessao = sessoes[index];
        if (index === sessaoAtual) {
            dot.classList.add('ativa');
        }
        var status = getStatusComando(nomeSessao);
        if (status === 'executado') {
            dot.classList.add('concluida');
        } else if (status === 'pulado') {
            dot.classList.add('pulada');
        }
    });
}

//Modo Guiado
function verificarConclusaoTotal() {
    const progress = getProgress();
    const total = sessoes.length;

    // Verificar se TODAS as sessões foram executadas OU puladas
    const concluidas = new Set([...progress.executados, ...progress.pulados]);

    // SÓ mostrar resumo se todas as 9 sessões estiverem concluídas
    if (concluidas.size >= total) {
        const resumo = document.getElementById('resumo-final');
        if (resumo && !resumo.classList.contains('ativo')) {
            // IMPORTANTE: Verificar se estamos na SESSÃO 9 (índice 8)
            // OU se o usuário está tentando ver o resumo manualmente
            if (sessaoAtual === total - 1) {
                // Estamos na última sessão, pode mostrar o resumo
                mostrarResumoFinal(resumo);
            } else {
                // Não está na última sessão, NÃO mostrar resumo
                // Apenas atualizar a barra de progresso
                atualizarBarraProgressoGeral();
                return;
            }
        }
    }
}

// Função separada para mostrar o resumo
function mostrarResumoFinal(resumo) {
    resumo.classList.add('ativo');
    document.querySelectorAll('.etapa-card').forEach(el => el.style.display = 'none');
    document.getElementById('nav-guide').style.display = 'none';
    document.querySelector('.progress-guide').style.display = 'none';
    document.querySelector('.sessao-indicador').style.display = 'none';

    const progress = getProgress();
    const total = sessoes.length;
    const executados = progress.executados.length;
    const pulados = progress.pulados.length;
    const pendentes = total - executados - pulados;

    document.getElementById('resumo-executados').textContent = executados;
    document.getElementById('resumo-pulados').textContent = pulados;
    document.getElementById('resumo-pendentes').textContent = pendentes;

    const lista = document.getElementById('resumo-lista');
    lista.innerHTML = '';
    const nomes = {
        '00-boas-vindas': 'Boas-vindas',
        '01-restauracao': 'Restauração',
        '02-otimizacao': 'Otimização',
        '03-repositorios': 'Repositórios',
        '04-fontes': 'Fontes',
        '05-launchers': 'Launchers',
        '06-loja': 'Loja',
        '07-manutencao': 'Manutenção',
        '08-fof-manutencao': 'Manutenção FOF'
    };

    sessoes.forEach(sessao => {
        const item = document.createElement('div');
        item.className = 'item';
        const status = getStatusComando(sessao);
        let statusText = '⏳ Pendente';
        let statusClass = 'pendente';
        if (status === 'executado') {
            statusText = '✅ Executado';
            statusClass = 'executado';
        } else if (status === 'pulado') {
            statusText = '⏭️ Pulado';
            statusClass = 'pulado';
        }
        item.innerHTML = `
        <span class="nome">${nomes[sessao] || sessao}</span>
        <span class="status-resumo ${statusClass}">${statusText}</span>
        `;
        lista.appendChild(item);
    });
}

function reiniciarProgresso() {
    if (confirm('Tem certeza que deseja reiniciar todo o progresso?\n\nTodas as sessões serão marcadas como pendentes.')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initCustomSelect('custom-select-container', 'custom-select-trigger', 'custom-select-options', 'select-downloads', 'custom-select-value');
        initCustomSelect('custom-select-fedora-container', 'custom-select-fedora-trigger', 'custom-select-fedora-options', 'select-fedora-version', 'custom-select-fedora-value');
    }, 300);

    var desktop = detectarDesktopFrontend();
    var spanDesktop = document.getElementById('desktop-detectado');
    if (spanDesktop) {
        var nomes = {
            'KDE': '🪟 KDE Plasma (Discover)',
                          'GNOME': '🐧 GNOME (GNOME Software)',
                          'XFCE': '🐭 XFCE (AppFinder)',
                          'CINNAMON': '🍃 Cinnamon (Software Center)',
                          'MATE': '🦎 MATE (Software Boutique)',
                          'LXQT': '💠 LXQt (LXQt Software Center)',
                          'LXDE': '💠 LXDE (LXDE Software Center)',
                          'UNKNOWN': '❓ Não detectado (modo automático)'
        };
        spanDesktop.textContent = nomes[desktop] || 'Desktop: ' + desktop;
        spanDesktop.style.color = desktop === 'UNKNOWN' ? '#f59e0b' : '#34d399';
    }

    var progress = getProgress();
    for (var i = 0; i < progress.executados.length; i++) {
        marcarBotaoComoExecutado(progress.executados[i]);
    }
    atualizarInterfaceProgresso();

    if (document.querySelector('.modo-guiado')) {
        criarIndicadores();
        irParaSessao(0);
    }

    var versionElements = document.querySelectorAll('.fof-version');
    for (var j = 0; j < versionElements.length; j++) {
        versionElements[j].textContent = FOF_VERSION;
    }

    var btnTopo = document.getElementById('btn-topo');
    if (btnTopo) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                btnTopo.classList.add('visivel');
            } else {
                btnTopo.classList.remove('visivel');
            }
        });
    }
    console.log('🚀 Fedora Only Fans v' + FOF_VERSION + ' carregado!');
});
