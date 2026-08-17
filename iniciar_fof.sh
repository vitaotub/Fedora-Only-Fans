#!/usr/bin/env bash
# ============================================================
# Fedora Only Fans (FOF) - Script de Inicialização
# Versão: 0.3.0
# ============================================================
# 
# Este script inicia o servidor e abre a interface do FOF
# 
# Uso: ./iniciar_fof.sh [opções]
# 
# Opções:
#   --debug, -d     Modo debug (logs detalhados)
#   --no-clean      Não limpar perfis do navegador
#   --help, -h      Mostra esta ajuda
# ============================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE}")" && pwd)"
cd "$DIR"

VERSION="0.3.0"
DEBUG=false
NO_CLEAN=false
LOG_FILE="/tmp/fof-$(date +%Y%m%d-%H%M%S).log"
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
    log "ℹ️  $1"
}

log_success() {
    log "✅ $1"
}

log_warning() {
    log "⚠️  $1"
}

log_error() {
    log "❌ $1"
}

log_header() {
    echo ""
    echo "============================================================"
    echo "  🐧 Fedora Only Fans (FOF) v$VERSION"
    echo "============================================================"
    echo ""
}

# ============================================================
# FUNÇÕES DE TERMINAL
# ============================================================

abrir_no_terminal_nativo() {
    local script_path="$1"
    local titulo="Fedora Only Fans - Servidor"
    
    log_debug "Tentando abrir no terminal nativo..."
    
    if command -v xdg-terminal-exec &> /dev/null; then
        log_debug "Usando xdg-terminal-exec"
        exec xdg-terminal-exec bash "$script_path" --no-fork
    fi
    
    if command -v konsole &> /dev/null; then
        log_debug "Usando konsole (KDE)"
        exec konsole --title "$titulo" -e bash "$script_path" --no-fork
    fi
    
    if command -v ptyxis &> /dev/null; then
        log_debug "Usando ptyxis (GNOME)"
        exec ptyxis --title "$titulo" -- bash "$script_path" --no-fork
    fi
    if command -v gnome-terminal &> /dev/null; then
        log_debug "Usando gnome-terminal (GNOME)"
        exec gnome-terminal --title="$titulo" -- bash "$script_path" --no-fork
    fi
    
    if command -v xfce4-terminal &> /dev/null; then
        log_debug "Usando xfce4-terminal (XFCE)"
        exec xfce4-terminal --title "$titulo" -e "bash \"$script_path\" --no-fork"
    fi
    
    if command -v gnome-terminal &> /dev/null; then
        log_debug "Usando gnome-terminal (Cinnamon)"
        exec gnome-terminal --title="$titulo" -- bash "$script_path" --no-fork
    fi
    
    for term in tilix alacritty kitty xterm x-terminal-emulator; do
        if command -v $term &> /dev/null; then
            log_debug "Usando $term (fallback)"
            exec $term -e bash "$script_path" --no-fork
        fi
    done
    
    log_error "Nenhum emulador de terminal compatível foi encontrado."
    exit 1
}

if [ "$1" != "--no-fork" ] && [ "$1" != "--debug" ] && [ "$1" != "--no-clean" ] && [ "$1" != "--help" ] && [ "$1" != "-h" ] && [ "$1" != "-d" ]; then
    SCRIPT_PATH="$(realpath "${BASH_SOURCE}")"
    abrir_no_terminal_nativo "$SCRIPT_PATH"
    exit 0
fi

# ============================================================
# CONTAINER WEBKITGTK
# ============================================================

abrir_container() {
    local url="$1"
    local icone="$DIR/icone_app.png"

    if [ -f "$DIR/fof-container" ]; then
        log_info "📦 Abrindo no container nativo (WebKitGTK)..."
        "$DIR/fof-container" --url "$url" --icon "$icone" --name "Fedora Only Fans"
        exit 0
    fi

    if command -v fof-container &> /dev/null; then
        log_info "📦 Abrindo no container nativo (WebKitGTK)..."
        fof-container --url "$url" --icon "$icone" --name "Fedora Only Fans"
        exit 0
    fi

    return 1
}

compilar_container() {
    log_info "🔧 Compilando container nativo..."

    if [ -f "$DIR/build-container.sh" ]; then
        chmod +x "$DIR/build-container.sh"
        "$DIR/build-container.sh"
        if [ $? -eq 0 ] && [ -f "$DIR/fof-container" ]; then
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
    
    if [ ! -f "$DIR/fof.html" ]; then
        log_error "Arquivo fof.html não encontrado!"
        log_error "Certifique-se de estar no diretório correto."
        exit 1
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
        log_info "🖥️  Fedora $version detectado"
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
        
        sudo dnf install -y nodejs npm 2>&1 | while read line; do
            log_debug "dnf: $line"
        done
        
        if [ $? -ne 0 ]; then
            log_error "Falha ao instalar Node.js"
            log_error "Tente instalar manualmente: sudo dnf install nodejs npm"
            exit 1
        fi
        log_success "Node.js instalado"
    else
        log_info "Node.js: $(node --version 2>/dev/null || echo 'versão desconhecida')"
    fi
}

instalar_dependencias_npm() {
    if [ -f "$DIR/package.json" ]; then
        if [ ! -d "$DIR/node_modules" ]; then
            log_info "Instalando dependências do Node.js..."
            
            npm install --no-audit --no-fund --silent 2>&1 | while read line; do
                log_debug "npm: $line"
            done
            
            if [ $? -ne 0 ]; then
                log_error "Falha ao instalar dependências"
                log_error "Tente instalar manualmente: npm install"
                exit 1
            fi
            log_success "Dependências instaladas"
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
        abrir_firefox "file://$DIR/fof.html"
        return 0
    fi

    if command -v chromium &> /dev/null || command -v chromium-browser &> /dev/null; then
        abrir_chromium "file://$DIR/fof.html"
        return 0
    fi

    log_warning "Nenhum navegador encontrado. Tentando instalar Chromium..."
    sudo dnf install -y chromium
    if [ $? -eq 0 ] && command -v chromium &> /dev/null; then
        abrir_chromium "file://$DIR/fof.html"
        return 0
    fi

    log_error "Não foi possível abrir a interface"
    return 1
}

# ============================================================
# ATALHO DO MENU
# ============================================================

criar_atalho() {
    local desktop_file="$HOME/.local/share/applications/fedora-only-fans.desktop"
    local icone="$DIR/icone_app.png"
    
    if [ -f "$desktop_file" ] && [ ! "$DEBUG" = true ]; then
        log_info "Atalho já existe: $desktop_file"
        return 0
    fi
    
    log_info "Criando atalho no menu de aplicativos..."
    
    mkdir -p "$(dirname "$desktop_file")"
    
    if [ ! -f "$icone" ]; then
        icone="applications-utilities"
        log_warning "Ícone não encontrado, usando ícone genérico"
    fi
    
    cat > "$desktop_file" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fedora Only Fans
Comment=Painel de Automação do Fedora
Exec=$DIR/iniciar_fof.sh --no-fork
Icon=$icone
Terminal=false
Categories=System;Settings;
StartupNotify=true
X-GNOME-Autostart-enabled=true
EOF
    
    chmod +x "$desktop_file"
    update-desktop-database ~/.local/share/applications/ 2>/dev/null
    
    log_success "Atalho criado: $desktop_file"
    log_info "O FOF aparecerá no menu de aplicativos como 'Fedora Only Fans'"
}

# ============================================================
# FUNÇÃO DE AJUDA
# ============================================================

mostrar_ajuda() {
    cat <<EOF
🐧 Fedora Only Fans (FOF) v$VERSION

Uso: $(basename "$0") [opções]

Opções:
  --debug, -d     Modo debug (logs detalhados no terminal)
  --no-clean      Não limpar perfis do navegador
  --help, -h      Mostra esta ajuda

Descrição:
  Este script inicia o servidor e abre a interface do FOF.
  Ele detecta automaticamente seu ambiente desktop e
  abre o terminal e navegador apropriados.

Arquivos:
  server.js       Servidor Node.js
  fof.html        Interface web
  icone_app.png   Ícone do aplicativo

Logs:
  $LOG_FILE

Exemplos:
  ./iniciar_fof.sh              # Inicialização normal
  ./iniciar_fof.sh --debug      # Modo debug
  ./iniciar_fof.sh --no-clean   # Manter perfis do navegador

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
        esac
    done
    
    shift $((OPTIND-1)) 2>/dev/null
    
    log_header
    
    if [ "$DEBUG" = true ]; then
        log_info "🐛 Modo DEBUG ativado"
        log_info "📋 Arquivo de log: $LOG_FILE"
    fi
    
    if [ "$NO_CLEAN" = true ]; then
        log_info "🧹 Limpeza de perfis desabilitada"
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
