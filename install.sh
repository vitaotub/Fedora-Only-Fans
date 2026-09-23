#!/usr/bin/env bash
# ============================================================
# Fedora Only Fans (FOF) - Script de Instalação
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

VERSION="1.0.0-09232026"
INSTALL_DIR="$HOME/.local/share/fedora-only-fans"
BIN_DIR="$HOME/.local/bin"

# ============================================================
# CORREÇÃO ÍCONE (KDE/Wayland): os nomes dos arquivos .desktop
# agora batem com o app_id definido em g_set_prgname("fof-container")
# no C. O KDE Plasma em Wayland é rigoroso: se o nome do .desktop
# não bater com o app_id da janela, o ícone não é associado e o
# toolkit mostra o ícone genérico ("W" do WebKitGTK).
# Não alterar sem atualizar o g_set_prgname no src/fof-container.c.
# ============================================================
DESKTOP_FILE="$HOME/.local/share/applications/fof-container.desktop"
DESKTOP_FILE_COMPAT="$HOME/.local/share/applications/fof-container-compat.desktop"

# Nomes antigos (para limpeza em desinstalação/atualização)
DESKTOP_FILE_OLD="$HOME/.local/share/applications/fedora-only-fans.desktop"
DESKTOP_FILE_COMPAT_OLD="$HOME/.local/share/applications/fedora-only-fans-compat.desktop"

REPO_URL="https://github.com/vitaotek/Fedora-Only-Fans.git"
LOG_FILE="/tmp/fof-install-$(date +%Y%m%d-%H%M%S).log"

SESSAO_ARQUIVOS=(
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

ARQUIVOS_PRINCIPAIS=(
"server.js"
"index.html"
"guiado.html"
"manutencao.html"
"style.css"
"script.js"
"i18n.js"
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
echo " 🐧 Fedora Only Fans (FOF) - Instalador v$VERSION"
echo "============================================================"
echo ""
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
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

if [ ! -f "$INSTALL_DIR/build-container.sh" ]; then
print_warning "build-container.sh não encontrado"
print_info "O FOF usará o navegador como fallback"
return 1
fi

chmod +x "$INSTALL_DIR/build-container.sh"

# Melhoria: capturar stdout+stderr do build-container.sh no LOG_FILE.
# Assim, se a compilação falhar (pkg-config sem webkit2gtk4.1, gcc
# reclamando, etc.), o motivo fica visível para diagnóstico — em vez
# de um simples "não foi possível recompilar o container".
if "$INSTALL_DIR/build-container.sh" >> "$LOG_FILE" 2>&1; then
if [ -f "$INSTALL_DIR/fof-container" ]; then
ln -sf "$INSTALL_DIR/fof-container" "$BIN_DIR/fof-container"
chmod +x "$BIN_DIR/fof-container"
print_success "Container compilado e instalado"
return 0
else
print_warning "Compilação retornou sucesso, mas o binário não foi encontrado"
print_info "Verifique o log: $LOG_FILE"
return 1
fi
else
print_warning "Falha ao compilar o container"
print_info "Motivo registrado em: $LOG_FILE"
print_info "O FOF continuará usando o container antigo (se existir) ou o navegador como fallback"
return 1
fi
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
local versao_node
versao_node="$(node --version 2>/dev/null | sed 's/^v//')"
local major="${versao_node%%.*}"
if [ -z "$major" ] || [ "$major" -lt 18 ] 2>/dev/null; then
print_warning "Node.js $versao_node é antigo (requer 18+)"
faltando+=("nodejs")
else
print_success "Node.js: $(node --version)"
fi
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

# ============================================================
# CORREÇÃO ÍCONE (KDE/Wayland): o nome do arquivo .desktop agora
# é "fof-container.desktop", casando com o app_id definido em
# g_set_prgname("fof-container") no src/fof-container.c. Sem essa
# correspondência, o KDE Plasma em Wayland não associa o ícone do
# .desktop com a janela do container e mostra o ícone genérico do
# WebKitGTK (o "W" amarelo).
#
# O nome exibido no menu (Name=Fedora Only Fans) não depende do
# nome do arquivo — pode ser qualquer coisa.
# ============================================================

# Ícone no tema hicolor com o MESMO nome do app_id, para o KDE
# achar o ícone por nome (Icon=fof-container) em qualquer tema.
if [ -f "$INSTALL_DIR/icone_app.png" ]; then
mkdir -p "$HOME/.local/share/icons/hicolor/256x256/apps"
cp "$INSTALL_DIR/icone_app.png" "$HOME/.local/share/icons/hicolor/256x256/apps/fof-container.png"
gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
print_success "Ícone do container instalado em hicolor"
fi

mkdir -p "$(dirname "$DESKTOP_FILE")"

# Remove .desktops antigos com nome errado (instalações anteriores)
rm -f "$DESKTOP_FILE_OLD" "$DESKTOP_FILE_COMPAT_OLD" 2>/dev/null

# --- Atalho principal ---
cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fedora Only Fans
Comment=Painel de Automação do Fedora
Exec=$BIN_DIR/fof
Icon=fof-container
Terminal=false
Categories=System;Settings;
StartupNotify=true
StartupWMClass=fof-container
X-GNOME-Autostart-enabled=true
EOF

chmod +x "$DESKTOP_FILE"
print_success "Atalho criado: $DESKTOP_FILE"

# --- Atalho de compatibilidade (modo software rendering) ---
if [ -f "$INSTALL_DIR/iniciar_fof_compat.sh" ]; then
cat > "$DESKTOP_FILE_COMPAT" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fedora Only Fans (Modo Compatibilidade)
Comment=Painel de Automação do Fedora - Modo compatível com GPUs antigas
Exec=$BIN_DIR/fof-compat
Icon=fof-container
Terminal=false
Categories=System;Settings;
StartupNotify=true
StartupWMClass=fof-container
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

if [[ ! "$current_launchers" == *"fof-container"* ]]; then
if [ -z "$current_launchers" ]; then
current_launchers="applications:fof-container.desktop"
else
current_launchers="$current_launchers,applications:fof-container.desktop"
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
if qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.addFavorite "applications:fof-container.desktop" 2>/dev/null; then
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

# Remove TODOS os nomes possíveis de .desktop (novo e antigo)
# para garantir limpeza completa em qualquer instalação.
local atalhos=(
"$DESKTOP_FILE"
"$DESKTOP_FILE_COMPAT"
"$DESKTOP_FILE_OLD"
"$DESKTOP_FILE_COMPAT_OLD"
)
for atalho in "${atalhos[@]}"; do
if [ -f "$atalho" ]; then
rm -f "$atalho"
print_success "Atalho removido: $atalho"
fi
done

# Ícone hicolor
if [ -f "$HOME/.local/share/icons/hicolor/256x256/apps/fof-container.png" ]; then
rm -f "$HOME/.local/share/icons/hicolor/256x256/apps/fof-container.png"
gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
print_success "Ícone removido do hicolor"
fi

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

rm -f "$HOME/.bashrc.fof-backup" \
"$HOME/.zshrc.fof-backup" \
"$HOME/.profile.fof-backup"
print_success "Backups de PATH removidos"

update-desktop-database ~/.local/share/applications/ 2>/dev/null
kbuildsycoca6 --noincremental 2>/dev/null || kbuildsycoca5 --noincremental 2>/dev/null || true

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

# git stash push -m é o substituto moderno do git stash save (que foi
# deprecado no Git 2.13+, 2017). O -m define a mensagem, preservando o
# comportamento do save.
git stash push -m "Backup automático antes da atualização" 2>/dev/null

if ! git pull origin main; then
print_error "Falha ao atualizar"
exit 1
fi

git stash pop 2>/dev/null

print_step "Atualizando dependências do Node.js..."
if ! npm install --no-audit --no-fund --silent; then
print_warning "Falha ao atualizar dependências, continuando..."
fi

# Recompila o container nativo. O install.sh --update é chamado pelo
# botão "Atualizar FOF" na sessão 08, então essa recompilação roda
# automaticamente em cada atualização.
#
# A função compilar_container_install captura stdout+stderr no
# LOG_FILE. Se falhar, o motivo fica disponível para diagnóstico.
# Como essa função retorna 1 em caso de falha, usamos `|| true` para
# não abortar o script (o container antigo continua funcionando).
compilar_container_install || true

print_step "Recriando symlinks dos comandos..."
mkdir -p "$BIN_DIR"
ln -sf "$INSTALL_DIR/iniciar_fof.sh" "$BIN_DIR/fof"
chmod +x "$INSTALL_DIR/iniciar_fof.sh" "$BIN_DIR/fof"
if [ -f "$INSTALL_DIR/iniciar_fof_compat.sh" ]; then
ln -sf "$INSTALL_DIR/iniciar_fof_compat.sh" "$BIN_DIR/fof-compat"
chmod +x "$INSTALL_DIR/iniciar_fof_compat.sh" "$BIN_DIR/fof-compat"
fi
if [ -f "$INSTALL_DIR/fof-container" ]; then
ln -sf "$INSTALL_DIR/fof-container" "$BIN_DIR/fof-container"
chmod +x "$BIN_DIR/fof-container"
fi
print_success "Symlinks atualizados"

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
--help, -h Mostra esta ajuda
--update Atualiza uma instalação existente
--uninstall Desinstala o FOF do sistema

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
echo " - Terminal: digite 'fof' ou 'fof-compat'"
echo " - Menu: procure por 'Fedora Only Fans'"
echo ""
print_info "📋 Log da instalação: $LOG_FILE"
echo ""
}

main "$@"
