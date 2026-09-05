#!/usr/bin/env bash
# ============================================================
# Fedora Only Fans (FOF) - Script de Instalação
# Versão: 0.9.8-alpha
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

VERSION="0.9.8-alpha"
INSTALL_DIR="$HOME/.local/share/fedora-only-fans"
BIN_DIR="$HOME/.local/bin"
DESKTOP_FILE="$HOME/.local/share/applications/fedora-only-fans.desktop"
DESKTOP_FILE_COMPAT="$HOME/.local/share/applications/fedora-only-fans-compat.desktop"
REPO_URL="https://github.com/vitaotek/Fedora-Only-Fans.git"
LOG_FILE="/tmp/fof-install-$(date +%Y%m%d-%H%M%S).log"

SESSAO_ARQUIVOS=(
    "00-boas-vindas.html"
    "01-restauracao.html"
    "02-otimizacao.html"
    "03-repositorios.html"
    "04-fontes.html"
    "05-launchers.html"
    "06-loja.html"
    "07-manutencao.html"
    "08-fof-manutencao.html"
)

ARQUIVOS_PRINCIPAIS=(
    "server.js"
    "index.html"
    "guiado.html"
    "manutencao.html"
    "style.css"
    "script.js"
    "icone_app.png"
    "iniciar_fof.sh"
    "iniciar_fof_compat.sh"
    "build-container.sh"
    "Makefile"
    "template-sessao.html"
)

print_header() {
    echo ""
    echo "============================================================"
    echo "  🐧 Fedora Only Fans (FOF) - Instalador v$VERSION"
    echo "============================================================"
    echo ""
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_step() { echo -e "${CYAN}▶ $1${NC}"; }

log() { echo "[$(date '+%H:%M:%S')] $1" >> "$LOG_FILE"; }

reaplicar_permissoes() {
    print_step "Reaplicando permissões dos arquivos..."

    local arquivos_para_permissoes=(
        "iniciar_fof.sh"
        "iniciar_fof_compat.sh"
        "fof-container"
        "build-container.sh"
    )

    for arquivo in "${arquivos_para_permissoes[@]}"; do
        if [ -f "$INSTALL_DIR/$arquivo" ]; then
            chmod +x "$INSTALL_DIR/$arquivo"
            print_info "Permissão aplicada: $arquivo"
        fi
    done

    local links_para_permissoes=("fof" "fof-compat" "fof-container")
    for link in "${links_para_permissoes[@]}"; do
        if [ -f "$BIN_DIR/$link" ]; then
            chmod +x "$BIN_DIR/$link"
            print_info "Permissão aplicada: $link (link)"
        fi
    done

    print_success "Permissões reaplicadas com sucesso!"
}

verificar_arquivos_instalados() {
    print_step "Verificando arquivos instalados..."
    local todos_ok=true
    local arquivos_para_verificar=("${ARQUIVOS_PRINCIPAIS[@]}" "${SESSAO_ARQUIVOS[@]}")

    for arquivo in "${arquivos_para_verificar[@]}"; do
        if [ ! -f "$INSTALL_DIR/$arquivo" ]; then
            print_warning "Arquivo não encontrado: $arquivo"
            todos_ok=false
        fi
    done

    if [ "$todos_ok" = true ]; then
        print_success "Todos os arquivos verificados com sucesso!"
    else
        print_warning "Alguns arquivos podem estar faltando. Tente: $0 --update"
    fi
}

instalar_dependencias_container() {
    print_step "Instalando dependências do container nativo..."

    local pacotes=(
        "webkit2gtk4.1-devel"
        "gtk3-devel"
        "gcc"
        "make"
        "pkgconfig"
        "python3-pyqt6"
    )

    local instalar=()

    for pkg in "${pacotes[@]}"; do
        if ! rpm -q $pkg &> /dev/null; then
            instalar+=($pkg)
        fi
    done

    if [ ${#instalar[@]} -gt 0 ]; then
        print_info "Instalando: ${instalar[*]}"
        if sudo dnf install -y "${instalar[@]}"; then
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
        if "$INSTALL_DIR/build-container.sh" && [ -f "$INSTALL_DIR/fof-container" ]; then
            ln -sf "$INSTALL_DIR/fof-container" "$BIN_DIR/fof-container"
            chmod +x "$BIN_DIR/fof-container"
            print_success "Container compilado e instalado"
            return 0
        fi
    fi

    print_warning "Não foi possível compilar o container"
    print_info "O FOF usará o navegador como fallback"
    return 1
}

verificar_sistema() {
    print_step "Verificando sistema operacional..."

    if [ -f /etc/fedora-release ]; then
        local version=$(cat /etc/fedora-release | grep -oP '[0-9]+' | head -1)
        print_success "Fedora $version detectado"
        log "Sistema: Fedora $version"
    else
        print_warning "Sistema não identificado como Fedora"
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
        if ! sudo dnf install -y "${faltando[@]}"; then
            print_error "Falha ao instalar dependências"
            print_error "Tente manualmente: sudo dnf install ${faltando[*]}"
            exit 1
        fi
        print_success "Dependências instaladas"
    else
        print_success "Todas as dependências estão instaladas"
    fi
}

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
    if ! npm install --no-audit --no-fund --silent; then
        print_error "Falha ao instalar dependências"
        exit 1
    fi

    ln -sf "$INSTALL_DIR/iniciar_fof.sh" "$BIN_DIR/fof"
    chmod +x "$INSTALL_DIR/iniciar_fof.sh"
    chmod +x "$BIN_DIR/fof"

    if [ -f "$INSTALL_DIR/iniciar_fof_compat.sh" ]; then
        ln -sf "$INSTALL_DIR/iniciar_fof_compat.sh" "$BIN_DIR/fof-compat"
        chmod +x "$INSTALL_DIR/iniciar_fof_compat.sh"
        chmod +x "$BIN_DIR/fof-compat"
    fi

    print_success "FOF instalado em: $INSTALL_DIR"
    print_success "Comando 'fof' disponível em: $BIN_DIR"
    print_success "Comando 'fof-compat' disponível em: $BIN_DIR"
}

criar_atalhos() {
    print_step "Criando atalhos no menu de aplicativos..."
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
    print_success "Atalho criado: $DESKTOP_FILE"

    if [ -f "$INSTALL_DIR/iniciar_fof_compat.sh" ]; then
        cat > "$DESKTOP_FILE_COMPAT" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fedora Only Fans (Modo Compatibilidade)
Comment=Painel de Automação do Fedora - Modo compatível com GPUs antigas
Exec=$BIN_DIR/fof-compat
Icon=$icone
Terminal=false
Categories=System;Settings;
StartupNotify=true
X-GNOME-Autostart-enabled=true
EOF

        chmod +x "$DESKTOP_FILE_COMPAT"
        print_success "Atalho de compatibilidade criado: $DESKTOP_FILE_COMPAT"
    fi

    update-desktop-database ~/.local/share/applications/ 2>/dev/null
}

fixar_na_barra() {
    print_step "Fixando atalho na barra de tarefas..."

    if [[ "$XDG_CURRENT_DESKTOP" != *"KDE"* ]] && [[ "$DESKTOP_SESSION" != *"plasma"* ]]; then
        return 0
    fi

    if [ ! -f "$DESKTOP_FILE" ]; then
        return 1
    fi

    local fixed=false

    if command -v kwriteconfig5 &> /dev/null; then
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
            fixed=true
        fi
    fi

    if [ "$fixed" = false ] && command -v qdbus &> /dev/null; then
        if qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.addFavorite "applications:fedora-only-fans.desktop" 2>/dev/null; then
            fixed=true
            print_success "Atalho fixado na barra de tarefas (qdbus)"
        fi
    fi

    if [ "$fixed" = true ]; then
        print_success "✨ FOF fixado na barra de tarefas!"
    else
        print_warning "Não foi possível fixar automaticamente na barra de tarefas"
        print_info "Fixar manualmente: botão direito no ícone do FOF → 'Adicionar ao Painel'"
    fi

    return 0
}

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

    local links=("fof" "fof-compat" "fof-container")
    for link in "${links[@]}"; do
        if [ -f "$BIN_DIR/$link" ]; then
            rm -f "$BIN_DIR/$link"
            print_success "Link removido: $BIN_DIR/$link"
        fi
    done

    local atalhos=("$DESKTOP_FILE" "$DESKTOP_FILE_COMPAT")
    for atalho in "${atalhos[@]}"; do
        if [ -f "$atalho" ]; then
            rm -f "$atalho"
            print_success "Atalho removido: $atalho"
        fi
    done

    rm -f /tmp/fof-*.log
    print_success "Logs removidos"

    local arquivos_estado=(".fof.pid" ".progresso.json" ".estado.json" ".historico.json")
    for arquivo in "${arquivos_estado[@]}"; do
        if [ -f "$INSTALL_DIR/$arquivo" ]; then
            rm -f "$INSTALL_DIR/$arquivo"
            print_success "Arquivo removido: $arquivo"
        fi
    done

    remover_linha_path() {
        local arquivo="$1"
        local backup="${arquivo}.fof-backup"
        local linha_a_remover='export PATH="$HOME/.local/bin:$PATH"'

        if [ -f "$arquivo" ]; then
            cp "$arquivo" "$backup"
            grep -vF "$linha_a_remover" "$arquivo" > "${arquivo}.tmp"
            mv "${arquivo}.tmp" "$arquivo"
            print_success "Linha removida de: $arquivo"
        fi
    }

    remover_linha_path "$HOME/.bashrc"
    remover_linha_path "$HOME/.zshrc"
    remover_linha_path "$HOME/.profile"

    update-desktop-database ~/.local/share/applications/ 2>/dev/null

    echo ""
    print_success "✅ FOF completamente desinstalado!"
}

atualizar() {
    print_header

    if [ ! -d "$INSTALL_DIR/.git" ]; then
        print_error "FOF não está instalado ou não foi clonado do Git"
        print_info "Execute a instalação primeiro: ./install.sh"
        exit 1
    fi

    print_step "Atualizando Fedora Only Fans..."
    cd "$INSTALL_DIR"

    git stash save "Backup automático antes da atualização" 2>/dev/null

    if ! git pull origin main; then
        print_error "Falha ao atualizar"
        exit 1
    fi

    git stash pop 2>/dev/null

    print_step "Atualizando dependências do Node.js..."
    if ! npm install --no-audit --no-fund --silent; then
        print_warning "Falha ao atualizar dependências, continuando..."
    fi

    print_step "Recompilando container..."
    if [ -f "$INSTALL_DIR/build-container.sh" ]; then
        chmod +x "$INSTALL_DIR/build-container.sh"
        "$INSTALL_DIR/build-container.sh" 2>/dev/null || print_warning "Não foi possível recompilar o container"
    fi

    verificar_arquivos_instalados
    reaplicar_permissoes
    criar_atalhos
    fixar_na_barra

    print_success "✅ FOF atualizado para a versão mais recente!"
}

mostrar_ajuda() {
    cat <<EOF
🐧 Fedora Only Fans (FOF) - Instalador v$VERSION

Uso: $(basename "$0") [opções]

Opções:
  --help, -h      Mostra esta ajuda
  --update        Atualiza uma instalação existente
  --uninstall     Desinstala o FOF do sistema

Após a instalação:
  - O comando 'fof' estará disponível no terminal
  - O comando 'fof-compat' estará disponível (modo compatibilidade)
  - Dois atalhos serão criados no menu de aplicativos

EOF
    exit 0
}

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
    verificar_arquivos_instalados
    instalar_dependencias_container
    compilar_container_install
    criar_atalhos
    fixar_na_barra
    configurar_path
    reaplicar_permissoes

    echo ""
    print_success "🎉 Fedora Only Fans instalado com sucesso!"
    echo ""
    print_info "📁 Instalado em: $INSTALL_DIR"
    print_info ""
    print_info "Para iniciar o FOF:"
    echo "  - Terminal: digite 'fof' ou 'fof-compat'"
    echo "  - Menu: procure por 'Fedora Only Fans'"
    echo ""
    print_info "📋 Log da instalação: $LOG_FILE"
    echo ""
}

main "$@"
