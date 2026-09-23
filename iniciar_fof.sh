#!/usr/bin/env bash
# ============================================================
# Fedora Only Fans (FOF) - Script de Inicialização
# ============================================================
#
# Este script inicia o servidor e abre a interface do FOF.
#
# Uso: ./iniciar_fof.sh [opções]
#
# Opções:
#   --debug, -d      Modo debug (logs detalhados)
#   --no-clean       Não limpar perfis do navegador
#   --no-minimize    Não minimizar o terminal do servidor
#   --help, -h       Mostra esta ajuda
# ============================================================

set -e
set -o pipefail

# ============================================================
# RESOLUÇÃO DE SYMLINK
# ============================================================
#
# Quando o usuário clica no ícone do menu (ou roda `fof`), o script
# é invocado via o symlink ~/.local/bin/fof → <install>/iniciar_fof.sh.
#
# Sem resolver o symlink, BASH_SOURCE[0] aponta para ~/.local/bin/fof,
# então `dirname` retorna ~/.local/bin — e o script não encontra
# server.js, style.css, etc. (ficam no diretório real de instalação).
#
# readlink -f resolve toda a cadeia de symlinks e retorna o caminho
# real do arquivo. Usamos dirname disso para chegar ao diretório certo.
if [ -L "${BASH_SOURCE[0]}" ]; then
    DIR="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
else
    DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi
cd "$DIR"

VERSION="1.0.0-09232026"
DEBUG=false
NO_CLEAN=false
NO_MINIMIZE=false

# FOF_LOG_FILE é herdado do processo pai durante a reinvocação, para
# que pai e filho escrevam no mesmo arquivo de log. Sem isso, cada
# invocação cria um log novo com timestamp diferente, e o log útil
# (do filho que efetivamente roda o servidor) fica separado do log
# do pai (que só tentou abrir o terminal).
LOG_FILE="${FOF_LOG_FILE:-/tmp/fof-$(date +%Y%m%d-%H%M%S).log}"
export FOF_LOG_FILE="$LOG_FILE"

SERVER_PID_FILE="$DIR/.fof.pid"

# ============================================================
# FUNÇÕES DE LOG
# ============================================================

log() {
    local msg="[$(date '+%H:%M:%S')] $1"
    echo -e "$msg"
    echo "$msg" >> "$LOG_FILE"
}

log_debug() {
    if [ "$DEBUG" = true ]; then
        log "🐛 DEBUG: $1"
    fi
}

log_info() {
    log "ℹ️ $1"
}

log_success() {
    log "✅ $1"
}

log_warning() {
    log "⚠️ $1"
}

log_error() {
    log "❌ $1"
}

log_header() {
    echo ""
    echo "============================================================"
    echo " 🐧 Fedora Only Fans (FOF) v$VERSION"
    echo "============================================================"
    echo ""
}

# ============================================================
# FUNÇÕES DE TERMINAL
# ============================================================
#
# Estratégia para não travar o KDE:
#
# 1. NUNCA usar `exec` para chamar o terminal. `exec` substitui o
#    processo rastreado pelo KDE, e como o script é um bash (não
#    envia o sinal de "startup complete"), o KDE mata o processo
#    filho após o timeout do StartupNotify (~10s).
#
# 2. Usar `setsid ... &` + `disown` + `exit 0`. Isso cria uma
#    sessão independente para o terminal, remove do job control
#    e sai limpo, deixando o terminal sobreviver.
#
# 3. KDE: `kstart --iconify` faz o konsole nascer minimizado,
#    sem precisar de xdotool/wmctrl.
#
# 4. Plasma 6 renomeou o binário para kstart6; Plasma 5 usa kstart5;
#    algumas instalações ainda mantêm o nome antigo kstart. Testamos
#    os três, e verificamos se o binário encontrado realmente suporta
#    a opção --iconify antes de confiar nele.

abrir_no_terminal_nativo() {
    local script_path="$1"
    local titulo="Fedora Only Fans - Servidor"

    log_debug "Tentando abrir no terminal nativo..."

    # ─── Descobre qual binário kstart está disponível ──────────
    #
    # Ordem: kstart6 (Plasma 6) → kstart5 (Plasma 5) → kstart (legado).
    # Paramos no primeiro que existir. Em seguida, verificamos se ele
    # suporta --iconify consultando o --help. Sem essa checagem, um
    # kstart que não reconhece --iconify sai com erro, o konsole nunca
    # abre, e como redirecionamos tudo para /dev/null + exit 0, a falha
    # é completamente silenciosa (era o bug relatado).
    local KSTART_BIN=""
    if [ "$NO_MINIMIZE" != true ]; then
        for cand in kstart6 kstart5 kstart; do
            if command -v "$cand" &> /dev/null; then
                if "$cand" --help 2>&1 | grep -q -- "--iconify"; then
                    KSTART_BIN="$cand"
                else
                    log_debug "$cand existe mas não suporta --iconify"
                fi
                break  # para no primeiro binário kstart encontrado
            fi
        done
    fi

    # ─── KDE: konsole (com kstart --iconify se disponível) ─────
    if command -v konsole &> /dev/null; then
        if [ -n "$KSTART_BIN" ]; then
            log_debug "Usando $KSTART_BIN --iconify + konsole (minimizado)"
            # stderr vai para o log (não /dev/null) para diagnóstico.
            setsid "$KSTART_BIN" --iconify konsole --title "$titulo" \
                -e bash "$script_path" --no-fork \
                >> "$LOG_FILE" 2>&1 &
            disown 2>/dev/null || true
            exit 0
        fi

        log_debug "Usando konsole (KDE, sem minimização)"
        setsid konsole --title "$titulo" \
            -e bash "$script_path" --no-fork \
            >> "$LOG_FILE" 2>&1 &
        disown 2>/dev/null || true
        exit 0
    fi

    # ─── GNOME / genéricos ──────────────────────────────────────
    if command -v xdg-terminal-exec &> /dev/null; then
        log_debug "Usando xdg-terminal-exec"
        setsid xdg-terminal-exec bash "$script_path" --no-fork \
            >> "$LOG_FILE" 2>&1 &
        disown 2>/dev/null || true
        exit 0
    fi

    if command -v ptyxis &> /dev/null; then
        log_debug "Usando ptyxis (GNOME)"
        setsid ptyxis --title "$titulo" -- bash "$script_path" --no-fork \
            >> "$LOG_FILE" 2>&1 &
        disown 2>/dev/null || true
        exit 0
    fi

    if command -v gnome-terminal &> /dev/null; then
        log_debug "Usando gnome-terminal (GNOME)"
        setsid gnome-terminal --title="$titulo" -- bash "$script_path" --no-fork \
            >> "$LOG_FILE" 2>&1 &
        disown 2>/dev/null || true
        exit 0
    fi

    # ─── XFCE ──────────────────────────────────────────────────
    #
    # CORREÇÃO: xfce4-terminal -e espera comando e argumentos como
    # argumentos separados (não uma única string). A versão anterior
    # passava "-e \"bash \\\"$script_path\\\" --no-fork\"", o que fazia
    # o terminal tentar executar um programa literalmente chamado
    # 'bash "/caminho/script.sh" --no-fork' — falha garantida.
    if command -v xfce4-terminal &> /dev/null; then
        log_debug "Usando xfce4-terminal (XFCE)"
        setsid xfce4-terminal --title="$titulo" \
            -e bash "$script_path" --no-fork \
            >> "$LOG_FILE" 2>&1 &
        disown 2>/dev/null || true
        exit 0
    fi

    # ─── Fallbacks universais ──────────────────────────────────
    for term in tilix alacritty kitty xterm x-terminal-emulator; do
        if command -v $term &> /dev/null; then
            log_debug "Usando $term (fallback)"
            setsid $term -e bash "$script_path" --no-fork \
                >> "$LOG_FILE" 2>&1 &
            disown 2>/dev/null || true
            exit 0
        fi
    done

    log_error "Nenhum emulador de terminal compatível foi encontrado."
    exit 1
}

# ============================================================
# REINVOCAÇÃO (abrir terminal separado antes de prosseguir)
# ============================================================
#
# Se o usuário não passou --no-fork, reabrimos o script num terminal
# próprio. Isso permite que o servidor fique rodando em uma janela
# dedicada (minimizada no KDE), enquanto o processo pai sai limpo.

PRECISA_REINVOCAR=true
for arg in "$@"; do
    case "$arg" in
        --no-fork|--debug|-d|--no-clean|--no-minimize|--help|-h)
            PRECISA_REINVOCAR=false
            ;;
    esac
done

if [ "$PRECISA_REINVOCAR" = true ]; then
    SCRIPT_PATH="$(realpath "${BASH_SOURCE[0]}")"
    # FOF_LOG_FILE já foi exportado acima; o filho herda o mesmo
    # arquivo de log, então tudo fica registrado num lugar só.
    abrir_no_terminal_nativo "$SCRIPT_PATH"
    exit 0
fi

# ============================================================
# CONTAINER WEBKITGTK
# ============================================================

abrir_container() {
    local url="$1"
    local icone="$DIR/icone_app.png"
    local extra_args=""

    if [ "$DEBUG" = true ]; then
        extra_args="--debug"
    fi

    if [ -f "$DIR/fof-container" ]; then
        log_info "📦 Abrindo no container nativo (WebKitGTK)..."
        "$DIR/fof-container" --url "$url" --icon "$icone" --name "Fedora Only Fans" $extra_args
        exit 0
    fi

    if command -v fof-container &> /dev/null; then
        log_info "📦 Abrindo no container nativo (WebKitGTK)..."
        fof-container --url "$url" --icon "$icone" --name "Fedora Only Fans" $extra_args
        exit 0
    fi

    return 1
}

compilar_container() {
    log_info "🔧 Compilando container nativo..."

    if [ -f "$DIR/build-container.sh" ]; then
        chmod +x "$DIR/build-container.sh"
        if "$DIR/build-container.sh" && [ -f "$DIR/fof-container" ]; then
            log_success "Container compilado com sucesso!"
            return 0
        fi
    fi

    log_warning "Não foi possível compilar o container"
    return 1
}

# ============================================================
# VERIFICAÇÕES
# ============================================================

verificar_arquivos() {
    log_info "Verificando arquivos do projeto..."

    if [ ! -f "$DIR/server.js" ]; then
        log_error "Arquivo server.js não encontrado!"
        log_error "Certifique-se de estar no diretório correto."
        exit 1
    fi

    if [ ! -f "$DIR/index.html" ]; then
        log_error "Arquivo index.html não encontrado!"
        exit 1
    fi

    if [ ! -f "$DIR/guiado.html" ]; then
        log_warning "Arquivo guiado.html não encontrado!"
    fi

    if [ ! -f "$DIR/manutencao.html" ]; then
        log_warning "Arquivo manutencao.html não encontrado!"
    fi

    if [ ! -f "$DIR/style.css" ]; then
        log_warning "Arquivo style.css não encontrado!"
    fi

    if [ ! -f "$DIR/script.js" ]; then
        log_warning "Arquivo script.js não encontrado!"
    fi

    if [ ! -f "$DIR/i18n.js" ]; then
        log_warning "Arquivo i18n.js não encontrado!"
    fi

    local sessoes=(
        "00-boas-vindas.html"
        "01-restauracao.html"
        "02-otimizacao.html"
        "03-repositorios.html"
        "04-fontes.html"
        "05-hardware.html"
        "06-gaming.html"
        "07-loja.html"
        "08-waydroid.html"
        "09-softwares-uteis.html"
        "90-manutencao.html"
        "91-fof-manutencao.html"
    )

    local missing=0
    for sessao in "${sessoes[@]}"; do
        if [ ! -f "$DIR/$sessao" ]; then
            log_warning "Arquivo $sessao não encontrado!"
            missing=$((missing + 1))
        fi
    done

    if [ $missing -eq 0 ]; then
        log_success "Todas as sessões encontradas!"
    else
        log_warning "$missing arquivo(s) de sessão não encontrado(s)"
    fi

    if [ ! -f "$DIR/icone_app.png" ]; then
        log_warning "Arquivo icone_app.png não encontrado. Ícone pode não aparecer."
    fi

    log_success "Arquivos verificados com sucesso"
}

verificar_sudo() {
    log_info "Verificando permissões sudo..."

    if ! sudo -n true 2>/dev/null; then
        log_warning "Sudo requer senha. Você será solicitado durante a execução."
        log_warning "Alguns comandos podem pedir autenticação."
    else
        log_success "Permissões sudo disponíveis (sem senha)"
    fi
}

verificar_fedora() {
    if [ -f /etc/fedora-release ]; then
        local version=$(cat /etc/fedora-release | grep -oP '[0-9]+' | head -1)
        log_info "🖥️ Fedora $version detectado"
    else
        log_warning "Sistema não identificado como Fedora"
        log_warning "Este aplicativo foi desenvolvido para Fedora Linux"
    fi
}

# ============================================================
# DEPENDÊNCIAS
# ============================================================

instalar_nodejs() {
    if ! command -v node &> /dev/null; then
        log_warning "Node.js não encontrado. Instalando..."

        if sudo dnf install -y nodejs npm 2>&1 | while read -r line; do log_debug "dnf: $line"; done; then
            log_success "Node.js instalado"
        else
            log_error "Falha ao instalar Node.js"
            log_error "Tente instalar manualmente: sudo dnf install nodejs npm"
            exit 1
        fi
    fi

    local versao_node
    versao_node="$(node --version 2>/dev/null | sed 's/^v//')"
    local major="${versao_node%%.*}"

    if [ -z "$major" ] || [ "$major" -lt 18 ] 2>/dev/null; then
        log_warning "Node.js $versao_node detectado (requer 18+). Atualizando..."
        if sudo dnf install -y nodejs npm; then
            log_success "Node.js atualizado: $(node --version)"
        else
            log_error "Falha ao atualizar Node.js"
            exit 1
        fi
    else
        log_info "Node.js: $(node --version)"
    fi
}

instalar_dependencias_npm() {
    if [ -f "$DIR/package.json" ]; then
        if [ ! -d "$DIR/node_modules" ]; then
            log_info "Instalando dependências do Node.js..."

            if npm install --no-audit --no-fund --silent 2>&1 | while read -r line; do log_debug "npm: $line"; done; then
                log_success "Dependências instaladas"
            else
                log_error "Falha ao instalar dependências"
                log_error "Tente instalar manualmente: npm install"
                exit 1
            fi
        else
            log_info "Dependências já estão instaladas"
        fi
    else
        log_warning "package.json não encontrado"
        log_warning "Crie um package.json com as dependências necessárias"
    fi
}

verificar_dependencias() {
    instalar_nodejs
    instalar_dependencias_npm
}

# ============================================================
# PERFIS DO NAVEGADOR
# ============================================================

limpar_perfis() {
    if [ "$NO_CLEAN" = true ]; then
        log_info "🧹 Limpeza de perfis desabilitada (--no-clean)"
        return 0
    fi

    log_info "Limpando perfis antigos do navegador..."

    if [ -d "$DIR/.perfil_firefox" ]; then
        rm -rf "$DIR/.perfil_firefox"
        log_debug "Perfil Firefox removido"
    fi

    if [ -d "$DIR/.perfil_app" ]; then
        rm -rf "$DIR/.perfil_app"
        log_debug "Perfil Chromium removido"
    fi

    log_success "Perfis limpos"
}

# ============================================================
# SERVIDOR
# ============================================================

liberar_porta() {
    if command -v lsof &> /dev/null; then
        local port_pid=$(lsof -t -i:3000 2>/dev/null)
        if [ ! -z "$port_pid" ]; then
            log_warning "Porta 3000 ocupada. Liberando..."
            kill -9 $port_pid 2>/dev/null
            sleep 1
            log_success "Porta liberada"
        fi
    fi
}

iniciar_servidor() {
    log_info "Iniciando servidor na porta 3000..."

    if [ -f "$SERVER_PID_FILE" ]; then
        rm -f "$SERVER_PID_FILE"
    fi

    local server_pid

    if [ "$DEBUG" = true ]; then
        node server.js 2>&1 | tee -a "$LOG_FILE" &
        server_pid=$!
    else
        nohup node server.js >> "$LOG_FILE" 2>&1 &
        server_pid=$!
    fi

    echo $server_pid > "$SERVER_PID_FILE"

    local tentativas=0
    local max_tentativas=15

    log_info "Aguardando servidor iniciar..."

    while [ $tentativas -lt $max_tentativas ]; do
        if curl -s --max-time 1 http://localhost:3000/status > /dev/null 2>&1; then
            log_success "Servidor iniciado (PID: $server_pid)"
            log_info "🌐 http://localhost:3000"
            return 0
        fi
        sleep 1
        tentativas=$((tentativas + 1))
        log_debug "Aguardando servidor... ($tentativas/$max_tentativas)"
    done

    log_error "Servidor não respondeu após $max_tentativas segundos"
    log_error "Verifique o log: $LOG_FILE"
    kill $server_pid 2>/dev/null
    exit 1
}

# ============================================================
# NAVEGADOR (FALLBACK)
# ============================================================

abrir_firefox() {
    local url="$1"
    local perfil_dir="$DIR/.perfil_firefox"

    mkdir -p "$perfil_dir"

    if [ "$DEBUG" = true ]; then
        firefox --profile "$perfil_dir" --window-size 950,850 --new-window "$url" 2>&1 | tee -a "$LOG_FILE" &
    else
        firefox --profile "$perfil_dir" --window-size 950,850 --new-window "$url" > /dev/null 2>&1 &
    fi

    log_info "🦊 Firefox aberto"
}

abrir_chromium() {
    local url="$1"
    local perfil_dir="$DIR/.perfil_app"
    local icone="$DIR/icone_app.png"

    mkdir -p "$perfil_dir"

    local binario=""
    for cmd in chromium chromium-browser google-chrome brave microsoft-edge opera vivaldi; do
        if command -v $cmd &> /dev/null; then
            binario=$cmd
            break
        fi
    done

    if [ -z "$binario" ]; then
        log_warning "Nenhum navegador Chromium encontrado"
        return 1
    fi

    if [ "$DEBUG" = true ]; then
        $binario --user-data-dir="$perfil_dir" --app="$url" --window-size=950,850 2>&1 | tee -a "$LOG_FILE" &
    else
        $binario --user-data-dir="$perfil_dir" --app="$url" --window-size=950,850 > /dev/null 2>&1 &
    fi

    log_info "🌐 $binario aberto"
}

abrir_navegador() {
    local url="http://localhost:3000"

    if abrir_container "$url"; then
        return 0
    fi

    if compilar_container; then
        if abrir_container "$url"; then
            return 0
        fi
    fi

    log_warning "Container não disponível. Usando navegador..."

    if command -v firefox &> /dev/null; then
        abrir_firefox "$url"
        return 0
    fi

    if command -v chromium &> /dev/null || command -v chromium-browser &> /dev/null; then
        abrir_chromium "$url"
        return 0
    fi

    log_warning "Nenhum navegador encontrado. Tentando instalar Chromium..."
    if sudo dnf install -y chromium && command -v chromium &> /dev/null; then
        abrir_chromium "$url"
        return 0
    fi

    log_error "Não foi possível abrir a interface"
    return 1
}

# ============================================================
# ATALHO DO MENU
# ============================================================

criar_atalho() {
    # O nome do arquivo .desktop DEVE ser igual ao app_id definido em
    # g_set_prgname() no C (fof-container). O KDE Plasma em Wayland é
    # rigoroso com isso: se o nome do .desktop não bater com o app_id
    # da janela, o ícone não é associado e o toolkit mostra o ícone
    # genérico ("W" do WebKitGTK).
    #
    # StartupNotify=false: o processo é um script bash, que não envia o
    # sinal de "startup complete" que o KDE espera. Com StartupNotify=true,
    # o KDE fica aguardando, desiste após ~10s e mata o processo inteiro
    # (incluindo o konsole filho). Com false, o KDE considera o launch
    # concluído de imediato.
    local desktop_file="$HOME/.local/share/applications/fof-container.desktop"
    local icone="$DIR/icone_app.png"

    log_info "Criando atalho no menu de aplicativos..."

    mkdir -p "$(dirname "$desktop_file")"

    if [ ! -f "$icone" ]; then
        icone="applications-utilities"
        log_warning "Ícone não encontrado, usando ícone genérico"
    fi

    # Ícone no tema hicolor com o MESMO nome do app_id
    if [ -f "$DIR/icone_app.png" ]; then
        mkdir -p "$HOME/.local/share/icons/hicolor/256x256/apps"
        cp "$DIR/icone_app.png" "$HOME/.local/share/icons/hicolor/256x256/apps/fof-container.png"
        gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
        log_success "Ícone do container instalado em hicolor"
    fi

    # Remove .desktop antigo com nome errado, se existir
    rm -f "$HOME/.local/share/applications/fedora-only-fans.desktop" 2>/dev/null

    cat > "$desktop_file" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fedora Only Fans
Comment=Painel de Automação do Fedora
Exec=$DIR/iniciar_fof.sh
Icon=fof-container
Terminal=false
Categories=System;Settings;
StartupNotify=false
StartupWMClass=fof-container
X-GNOME-Autostart-enabled=true
EOF

    chmod +x "$desktop_file"
    update-desktop-database ~/.local/share/applications/ 2>/dev/null

    log_success "Atalho criado: $desktop_file"
}

# ============================================================
# FUNÇÃO DE AJUDA
# ============================================================

mostrar_ajuda() {
    cat <<EOF
🐧 Fedora Only Fans (FOF) v$VERSION

Uso: $(basename "$0") [opções]

Opções:
  --debug, -d      Modo debug (logs detalhados no terminal)
  --no-clean       Não limpar perfis do navegador
  --no-minimize    Não minimizar o terminal do servidor
  --help, -h       Mostra esta ajuda

Descrição:
  Este script inicia o servidor e abre a interface do FOF.
  Ele detecta automaticamente seu ambiente desktop e
  abre o terminal e navegador apropriados.

  No KDE Plasma, o terminal do servidor é automaticamente
  minimizado ao abrir (via kstart --iconify).

Arquivos:
  server.js         Servidor Node.js
  index.html        Landing page (escolha entre configuração/manutenção)
  guiado.html       Configuração passo a passo
  manutencao.html   Manutenção (kernels, limpeza, GRUB, atualizar/desinstalar o FOF)
  icone_app.png     Ícone do aplicativo

Logs:
  $LOG_FILE

Exemplos:
  ./iniciar_fof.sh                 # Inicialização normal
  ./iniciar_fof.sh --debug         # Modo debug
  ./iniciar_fof.sh --no-clean      # Manter perfis do navegador
  ./iniciar_fof.sh --no-minimize   # Não minimizar o terminal

EOF
    exit 0
}

# ============================================================
# MAIN
# ============================================================

main() {
    for arg in "$@"; do
        case $arg in
            --help|-h)
                mostrar_ajuda
                ;;
            --debug|-d)
                DEBUG=true
                ;;
            --no-clean)
                NO_CLEAN=true
                ;;
            --no-minimize)
                NO_MINIMIZE=true
                ;;
        esac
    done

    log_header

    if [ "$DEBUG" = true ]; then
        log_info "🐛 Modo DEBUG ativado"
        log_info "📋 Arquivo de log: $LOG_FILE"
    fi

    if [ "$NO_CLEAN" = true ]; then
        log_info "🧹 Limpeza de perfis desabilitada"
    fi

    if [ "$NO_MINIMIZE" = true ]; then
        log_info "🪟 Minimização do terminal desabilitada"
    fi

    verificar_arquivos
    verificar_sudo
    verificar_fedora

    verificar_dependencias

    limpar_perfis

    liberar_porta
    iniciar_servidor

    abrir_navegador

    criar_atalho

    echo ""
    log_success "🎉 Fedora Only Fans está rodando!"
    log_info "🌐 http://localhost:3000"
    log_info "📋 Log: $LOG_FILE"
    echo ""
    log_info "Pressione Ctrl+C para encerrar o servidor"
    echo ""

    while true; do
        if [ -f "$SERVER_PID_FILE" ]; then
            local pid=$(cat "$SERVER_PID_FILE")
            if ! kill -0 $pid 2>/dev/null; then
                log_error "Servidor morreu inesperadamente!"
                log_error "Verifique o log: $LOG_FILE"
                break
            fi
        fi
        sleep 2
    done
}

# ============================================================
# LIMPEZA AO SAIR
# ============================================================

cleanup() {
    echo ""
    log_info "Encerrando o servidor..."

    if [ -f "$SERVER_PID_FILE" ]; then
        local pid=$(cat "$SERVER_PID_FILE")
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null
            log_success "Servidor encerrado (PID: $pid)"
        fi
        rm -f "$SERVER_PID_FILE"
    fi

    log_info "👋 Até logo!"
    exit 0
}

trap cleanup EXIT INT TERM

# ============================================================
# EXECUÇÃO
# ============================================================

main "$@"
