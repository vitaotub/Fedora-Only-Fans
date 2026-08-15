#!/usr/bin/env bash
# ============================================================
# Fedora Only Fans (FOF) - Script de Instalação
# Versão: 0.3.0
# ============================================================
#
# Este script instala o FOF no sistema
#
# Uso: ./install.sh [opções]
#
# Opções:
#   --help, -h      Mostra esta ajuda
#   --update        Atualiza uma instalação existente
#   --uninstall     Desinstala o FOF do sistema
# ============================================================

set -e

# ============================================================
# CORES PARA TERMINAL
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================
# CONFIGURAÇÕES
# ============================================================

VERSION="0.3.0"
INSTALL_DIR="$HOME/.local/share/fedora-only-fans"
BIN_DIR="$HOME/.local/bin"
DESKTOP_FILE="$HOME/.local/share/applications/fedora-only-fans.desktop"
REPO_URL="https://github.com/vitaotek/Fedora-Only-Fans.git"
LOG_FILE="/tmp/fof-install-$(date +%Y%m%d-%H%M%S).log"

# ============================================================
# FUNÇÕES DE UTILIDADE
# ============================================================

print_header() {
    echo ""
    echo "============================================================"
    echo "  🐧 Fedora Only Fans (FOF) - Instalador v$VERSION"
    echo "============================================================"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

log() {
    echo "[$(date '+%H:%M:%S')] $1" >> "$LOG_FILE"
}

# ============================================================
# FUNÇÃO PARA REAPLICAR PERMISSÕES
# ============================================================

reaplicar_permissoes() {
print_step "Reaplicando permissões dos arquivos..."

    # Dá permissão para o script principal
    if [ -f "$INSTALL_DIR/iniciar_fof.sh" ]; then
        chmod +x "$INSTALL_DIR/iniciar_fof.sh"
        print_info "Permissão aplicada: iniciar_fof.sh"
    fi

    # Dá permissão para o link no PATH
    if [ -f "$BIN_DIR/fof" ]; then
        chmod +x "$BIN_DIR/fof"
        print_info "Permissão aplicada: fof (link)"
    fi

    # Dá permissão para o container
    if [ -f "$INSTALL_DIR/fof-container" ]; then
        chmod +x "$INSTALL_DIR/fof-container"
        print_info "Permissão aplicada: fof-container"
    fi

    # Dá permissão para o script de build
    if [ -f "$INSTALL_DIR/build-container.sh" ]; then
        chmod +x "$INSTALL_DIR/build-container.sh"
        print_info "Permissão aplicada: build-container.sh"
    fi

    # Dá permissão para o link do container
    if [ -f "$BIN_DIR/fof-container" ]; then
        chmod +x "$BIN_DIR/fof-container"
        print_info "Permissão aplicada: fof-container (link)"
    fi

    print_success "Permissões reaplicadas com sucesso!"
}

# ============================================================
# INSTALAÇÃO DO CONTAINER
# ============================================================

instalar_dependencias_container() {
    print_step "Instalando dependências do container nativo..."

    local pacotes=(
        "webkit2gtk4.1-devel"
        "gtk3-devel"
        "gcc"
        "make"
        "pkgconfig"
    )

    local instalar=()

    for pkg in "${pacotes[@]}"; do
        if ! rpm -q $pkg &> /dev/null; then
            instalar+=($pkg)
        fi
    done

    if [ ${#instalar[@]} -gt 0 ]; then
        print_info "Instalando: ${instalar[*]}"
        sudo dnf install -y "${instalar[@]}"
        if [ $? -eq 0 ]; then
            print_success "Dependências instaladas"
        else
            print_warning "Algumas dependências podem não ter sido instaladas"
        fi
    else
        print_success "Todas as dependências já estão instaladas"
    fi
}

compilar_container_install() {
    print_step "Compilando container nativo..."

    cd "$INSTALL_DIR"

    if [ -f "$INSTALL_DIR/build-container.sh" ]; then
        chmod +x "$INSTALL_DIR/build-container.sh"
        "$INSTALL_DIR/build-container.sh"
        if [ $? -eq 0 ] && [ -f "$INSTALL_DIR/fof-container" ]; then
            ln -sf "$INSTALL_DIR/fof-container" "$BIN_DIR/fof-container"
            chmod +x "$BIN_DIR/fof-container"
            print_success "Container compilado e instalado"
            return 0
        fi
    fi

    print_warning "Não foi possível compilar o container"
    return 1
}

# ============================================================
# VERIFICAÇÕES
# ============================================================

verificar_sistema() {
    print_step "Verificando sistema operacional..."

    if [ -f /etc/fedora-release ]; then
        local version=$(cat /etc/fedora-release | grep -oP '[0-9]+' | head -1)
        print_success "Fedora $version detectado"
        log "Sistema: Fedora $version"
    else
        print_warning "Sistema não identificado como Fedora"
        print_warning "O FOF foi desenvolvido para Fedora Linux"
        print_warning "A instalação pode não funcionar corretamente"

        read -p "Continuar mesmo assim? (s/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_error "Instalação cancelada"
            exit 1
        fi
    fi
}

verificar_dependencias() {
    print_step "Verificando dependências..."

    local faltando=()

    if ! command -v node &> /dev/null; then
        faltando+=("nodejs")
        print_warning "Node.js não encontrado"
    else
        print_success "Node.js: $(node --version)"
    fi

    if ! command -v npm &> /dev/null; then
        faltando+=("npm")
        print_warning "npm não encontrado"
    else
        print_success "npm: $(npm --version)"
    fi

    if ! command -v git &> /dev/null; then
        faltando+=("git")
        print_warning "git não encontrado"
    else
        print_success "git: $(git --version | cut -d' ' -f3)"
    fi

    if ! command -v curl &> /dev/null; then
        faltando+=("curl")
        print_warning "curl não encontrado"
    else
        print_success "curl: $(curl --version | head -1 | cut -d' ' -f2)"
    fi

    if [ ${#faltando[@]} -gt 0 ]; then
        print_info "Instalando dependências faltando: ${faltando[*]}"
        log "Instalando: ${faltando[*]}"

        sudo dnf install -y "${faltando[@]}"

        if [ $? -ne 0 ]; then
            print_error "Falha ao instalar dependências"
            print_error "Tente manualmente: sudo dnf install ${faltando[*]}"
            exit 1
        fi

        print_success "Dependências instaladas"
    else
        print_success "Todas as dependências estão instaladas"
    fi
}

# ============================================================
# INSTALAÇÃO
# ============================================================

instalar_fof() {
    print_step "Instalando Fedora Only Fans..."

    mkdir -p "$INSTALL_DIR"
    mkdir -p "$BIN_DIR"

    if [ -d "$INSTALL_DIR/.git" ]; then
        print_info "Atualizando repositório existente..."
        cd "$INSTALL_DIR"
        git pull origin main
    else
        print_info "Clonando repositório..."
        git clone "$REPO_URL" "$INSTALL_DIR"
        cd "$INSTALL_DIR"
    fi

    print_step "Instalando dependências do Node.js..."
    npm install --no-audit --no-fund --silent

    if [ $? -ne 0 ]; then
        print_error "Falha ao instalar dependências"
        exit 1
    fi

    ln -sf "$INSTALL_DIR/iniciar_fof.sh" "$BIN_DIR/fof"
    chmod +x "$INSTALL_DIR/iniciar_fof.sh"
    chmod +x "$BIN_DIR/fof"

    print_success "FOF instalado em: $INSTALL_DIR"
    print_success "Comando 'fof' disponível em: $BIN_DIR"
}

# ============================================================
# ATALHO DO MENU
# ============================================================

criar_atalho() {
    print_step "Criando atalho no menu de aplicativos..."

    local icone="$INSTALL_DIR/icone_app.png"

    if [ ! -f "$icone" ]; then
        icone="applications-utilities"
        print_warning "Ícone não encontrado, usando ícone genérico"
    fi

    mkdir -p "$(dirname "$DESKTOP_FILE")"

    cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fedora Only Fans
Comment=Painel de Automação do Fedora
Exec=$BIN_DIR/fof
Icon=$icone
Terminal=false
Categories=System;Settings;
StartupNotify=true
X-GNOME-Autostart-enabled=true
EOF

    chmod +x "$DESKTOP_FILE"
    update-desktop-database ~/.local/share/applications/ 2>/dev/null

    print_success "Atalho criado: $DESKTOP_FILE"
}

# ============================================================
# FIXAR NA BARRA DE TAREFAS (KDE PLASMA)
# ============================================================

fixar_na_barra() {
    print_step "Fixando atalho na barra de tarefas..."

    if [[ "$XDG_CURRENT_DESKTOP" != *"KDE"* ]] && [[ "$DESKTOP_SESSION" != *"plasma"* ]]; then
        print_warning "Ambiente não identificado como KDE Plasma"
        print_warning "Pule esta etapa ou fixe manualmente o atalho"
        return 0
    fi

    if [ ! -f "$DESKTOP_FILE" ]; then
        print_warning "Arquivo .desktop não encontrado: $DESKTOP_FILE"
        print_warning "Não foi possível fixar na barra de tarefas"
        return 1
    fi

    local fixed=false

    if command -v kwriteconfig5 &> /dev/null; then
        print_info "Tentando fixar com kwriteconfig5..."

        local current_launchers=$(kwriteconfig5 --file ~/.config/plasma-org.kde.plasma.desktop-appletsrc \
            --group Containments --group "1" --group Applets \
            --group "2" --group Configuration --group General \
            --key launcherList 2>/dev/null || echo "")

        if [[ ! "$current_launchers" == *"fedora-only-fans"* ]]; then
            if [ -z "$current_launchers" ]; then
                current_launchers="applications:fedora-only-fans.desktop"
            else
                current_launchers="$current_launchers,applications:fedora-only-fans.desktop"
            fi

            kwriteconfig5 --file ~/.config/plasma-org.kde.plasma.desktop-appletsrc \
                --group Containments --group "1" --group Applets \
                --group "2" --group Configuration --group General \
                --key launcherList "$current_launchers" \
                --type string

            fixed=true
            print_success "Atalho adicionado à barra de tarefas (kwriteconfig5)"
        else
            print_info "Atalho já está fixado na barra de tarefas"
            fixed=true
        fi
    fi

    if [ "$fixed" = false ] && command -v qdbus &> /dev/null; then
        print_info "Tentando fixar com qdbus..."

        qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.addFavorite "applications:fedora-only-fans.desktop" 2>/dev/null
        if [ $? -eq 0 ]; then
            fixed=true
            print_success "Atalho fixado na barra de tarefas (qdbus)"
        fi
    fi

    if [ "$fixed" = true ]; then
        if command -v plasma-apply-desktoptheme &> /dev/null; then
            plasma-apply-desktoptheme &> /dev/null &
        fi

        if command -v qdbus &> /dev/null; then
            qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.reloadConfig 2>/dev/null
        fi

        print_success "✨ FOF fixado na barra de tarefas!"
    else
        print_warning "Não foi possível fixar automaticamente na barra de tarefas"
        print_info "Para fixar manualmente:"
        echo "  1. Clique com o botão direito no ícone do FOF no menu"
        echo "  2. Selecione 'Adicionar ao Painel' ou 'Fixar na Barra de Tarefas'"
        echo "  3. Ou arraste o ícone para a barra de tarefas"
    fi

    return 0
}

# ============================================================
# CONFIGURAÇÃO DO PATH
# ============================================================

configurar_path() {
    print_step "Configurando PATH..."

    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        print_warning "~/.local/bin não está no PATH"

        if [ -f "$HOME/.bashrc" ]; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
            print_success "Adicionado ao .bashrc"
        fi

        if [ -f "$HOME/.zshrc" ]; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
            print_success "Adicionado ao .zshrc"
        fi

        print_info "Reinicie o terminal ou execute: source ~/.bashrc"
    else
        print_success "PATH já configurado"
    fi
}

# ============================================================
# DESINSTALAÇÃO
# ============================================================

desinstalar() {
    print_header
    print_warning "Desinstalando Fedora Only Fans..."

    read -p "Tem certeza? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_info "Desinstalação cancelada"
        exit 0
    fi

    print_step "Removendo arquivos..."

    if [ -d "$INSTALL_DIR" ]; then
        rm -rf "$INSTALL_DIR"
        print_success "Diretório removido: $INSTALL_DIR"
    fi

    if [ -f "$BIN_DIR/fof" ]; then
        rm -f "$BIN_DIR/fof"
        print_success "Link removido: $BIN_DIR/fof"
    fi

    if [ -f "$BIN_DIR/fof-container" ]; then
        rm -f "$BIN_DIR/fof-container"
        print_success "Link removido: $BIN_DIR/fof-container"
    fi

    if [ -f "$DESKTOP_FILE" ]; then
        rm -f "$DESKTOP_FILE"
        print_success "Atalho removido: $DESKTOP_FILE"
    fi

    print_info "Para remover o PATH, edite manualmente .bashrc ou .zshrc"

    print_success "FOF desinstalado com sucesso!"
}

# ============================================================
# ATUALIZAÇÃO (CORRIGIDA COM REAPLICAÇÃO DE PERMISSÕES)
# ============================================================

atualizar() {
    print_header

    if [ ! -d "$INSTALL_DIR/.git" ]; then
        print_error "FOF não está instalado ou não foi clonado do Git"
        print_info "Execute a instalação primeiro: ./install.sh"
        exit 1
    fi

    print_step "Atualizando Fedora Only Fans..."

    cd "$INSTALL_DIR"

    # Salva alterações locais temporariamente
    git stash save "Backup automático antes da atualização" 2>/dev/null

    # Baixa as atualizações
    git pull origin main

    if [ $? -ne 0 ]; then
        print_error "Falha ao atualizar"
        exit 1
    fi

    # Reaplica o stash se houver alterações salvas
    git stash pop 2>/dev/null

    # Atualiza dependências
    print_step "Atualizando dependências do Node.js..."
    npm install --no-audit --no-fund --silent

    if [ $? -ne 0 ]; then
        print_warning "Falha ao atualizar dependências, continuando..."
    fi

    # Recompila o container
    print_step "Recompilando container..."
    if [ -f "$INSTALL_DIR/build-container.sh" ]; then
        chmod +x "$INSTALL_DIR/build-container.sh"
        "$INSTALL_DIR/build-container.sh" 2>/dev/null
    fi

    # ============================================================
    # REAPLICA PERMISSÕES (CORREÇÃO IMPORTANTE)
    # ============================================================
    reaplicar_permissoes

    # Atualiza o atalho do menu
    criar_atalho

    # Tenta fixar na barra de tarefas novamente
    fixar_na_barra

    print_success "✅ FOF atualizado para a versão mais recente!"
    print_info "Versão atual: $(git describe --tags 2>/dev/null || echo 'development')"
}

# ============================================================
# FUNÇÃO DE AJUDA
# ============================================================

mostrar_ajuda() {
    cat <<EOF
🐧 Fedora Only Fans (FOF) - Instalador v$VERSION

Uso: $(basename "$0") [opções]

Opções:
  --help, -h      Mostra esta ajuda
  --update        Atualiza uma instalação existente
  --uninstall     Desinstala o FOF do sistema

Descrição:
  Este script instala o Fedora Only Fans no sistema.
  Ele baixa o projeto, instala dependências e cria atalhos.

Após a instalação:
  - O comando 'fof' estará disponível no terminal
  - Um atalho será criado no menu de aplicativos
  - A instalação fica em: $INSTALL_DIR

Exemplos:
  ./install.sh              # Instalação normal
  ./install.sh --update     # Atualiza instalação existente
  ./install.sh --uninstall  # Desinstala o FOF

EOF
    exit 0
}

# ============================================================
# MAIN
# ============================================================

main() {
    case "$1" in
        --help|-h)
            mostrar_ajuda
            ;;
        --uninstall)
            desinstalar
            exit 0
            ;;
        --update)
            atualizar
            exit 0
            ;;
    esac

    print_header

    verificar_sistema
    verificar_dependencias

    instalar_fof
    instalar_dependencias_container
    compilar_container_install
    criar_atalho
    fixar_na_barra
    configurar_path
    reaplicar_permissoes

    echo ""
    print_success "🎉 Fedora Only Fans instalado com sucesso!"
    echo ""
    print_info "Para iniciar o FOF:"
    echo "  - Terminal: digite 'fof'"
    echo "  - Menu: procure por 'Fedora Only Fans'"
    echo "  - Barra de tarefas: o ícone foi fixado automaticamente (KDE)"
    echo ""
    print_info "📋 Log da instalação: $LOG_FILE"
    echo ""
}

# ============================================================
# EXECUÇÃO
# ============================================================

main "$@"
