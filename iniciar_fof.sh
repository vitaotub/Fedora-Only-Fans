#!/bin/bash

# Função inteligente para abrir o script no terminal nativo de cada interface
abrir_no_terminal_nativo() {
    local script_path="$1"
    local titulo="Servidor de Automação Fedora"
    
    # 1. Tenta o xdg-terminal-exec (Padrão moderno Freedesktop / Fedora recente)
    if command -v xdg-terminal-exec &> /dev/null; then
        exec xdg-terminal-exec bash "$script_path" --no-fork
    
    # 2. KDE Plasma
    elif command -v konsole &> /dev/null; then
        exec konsole --title "$titulo" -e bash "$script_path" --no-fork
        
    # 3. GNOME (Fedora Workstation - Ptyxis ou Gnome-Terminal)
    elif command -v ptyxis &> /dev/null; then
        exec ptyxis --title "$titulo" -- bash "$script_path" --no-fork
    elif command -v gnome-terminal &> /dev/null; then
        exec gnome-terminal --title="$titulo" -- bash "$script_path" --no-fork
        
    # 4. XFCE
    elif command -v xfce4-terminal &> /dev/null; then
        exec xfce4-terminal --title="$titulo" -e "bash \"$script_path\" --no-fork"
        
    # 5. Fallbacks genéricos para outras Spins/Interfaces
    else
        for term in tilix alacritty kitty xterm x-terminal-emulator; do
            if command -v $term &> /dev/null; then
                exec $term -e bash "$script_path" --no-fork
            fi
        done
        
        echo "[ERRO]: Nenhum emulador de terminal compatível foi encontrado."
        exit 1
    fi
}

# Se o script NÃO estiver rodando dentro de uma janela separada, ele se reinicia no terminal nativo
if [ "$1" != "--no-fork" ]; then
    SCRIPT_PATH="$(realpath "${BASH_SOURCE}")"
    abrir_no_terminal_nativo "$SCRIPT_PATH"
    exit 0
fi

DIR="$(cd "$(dirname "${BASH_SOURCE}")" && pwd)"
cd "$DIR"

echo "===================================================="
echo "      Iniciando Servidor de Automação Local         "
echo "===================================================="

# Proteção de porta: Limpa qualquer servidor que tenha ficado travado na porta 3000 de execuções anteriores
if command -v lsof &> /dev/null; then
    PORT_PID=$(lsof -t -i:3000)
    if [ ! -z "$PORT_PID" ]; then
        echo "[AVISO]: Porta 3000 ocupada. Liberando processos anteriores..."
        kill -9 $PORT_PID 2>/dev/null
    fi
fi

# 1. Verifica se o Node.js está instalado no Fedora
if ! command -v node &> /dev/null; then
    echo "[AVISO]: Node.js não encontrado. Instalando agora..."
    sudo dnf install nodejs -y
    if [ $? -ne 0 ]; then
        echo "[ERRO]: Falha ao instalar o Node.js."
        echo "Pressione qualquer tecla para fechar..."
        read -n 1
        exit 1
    fi
    echo "[SUCESSO]: Node.js instalado corretamente."
fi

# 2. Inicia o servidor JavaScript em segundo plano
echo "Iniciando processo do server.js..."
node server.js > /dev/null 2>&1 &
SERVER_PID=$!

# Função de limpeza que mata o Node.js imediatamente ao sair
limpar_tudo() {
    echo ""
    echo "Fechando processos do Node.js..."
    kill $SERVER_PID 2>/dev/null
    exit 0
}

# Garante que a limpeza rode mesmo se o usuário fechar a janela no "X" manualmente
trap limpar_tudo EXIT

# Aguarda 2 segundos para o Node.js estabilizar e subir na porta 3000
sleep 2

# 3. Garante a renderização e ordem dos navegadores
echo "Configurando renderizador de interface..."

URL_ALVO="file://$DIR/fof.html"

# Função para abrir em navegadores baseados no Chromium em Modo App
abrir_modo_chromium() {
    PATH_ICONE="$DIR/icone_app.png"
    PERFIL_DIR="$DIR/.perfil_app"
    mkdir -p "$PERFIL_DIR"

    local BINARIO=""
    if command -v chromium &> /dev/null; then BINARIO="chromium";
    elif command -v chromium-browser &> /dev/null; then BINARIO="chromium-browser";
    elif command -v google-chrome &> /dev/null; then BINARIO="google-chrome";
    elif command -v brave &> /dev/null; then BINARIO="brave";
    elif command -v microsoft-edge &> /dev/null; then BINARIO="microsoft-edge";
    elif command -v opera &> /dev/null; then BINARIO="opera";
    elif command -v vivaldi &> /dev/null; then BINARIO="vivaldi";
    fi

    mkdir -p ~/.local/share/applications
    cat <<EOF > ~/.local/share/applications/${BINARIO}.desktop
[Desktop Entry]
Version=1.0
Name=Painel Fedora
Exec=$BINARIO --ozone-platform-hint=auto --user-data-dir=$PERFIL_DIR --app=$URL_ALVO
Icon=$PATH_ICONE
Terminal=false
Type=Application
StartupWMClass=$BINARIO
MimeType=text/html;
EOF

    update-desktop-database ~/.local/share/applications/ &>/dev/null

    $BINARIO --ozone-platform-hint=auto --user-data-dir="$PERFIL_DIR" --app="$URL_ALVO" --window-size=950,850
}

# --- HIERARQUIA DE VERIFICAÇÃO ---

# TESTE 1: Verificar se existe o FIREFOX instalado
if command -v firefox &> /dev/null; then
    echo "[INFO]: Firefox detectado! Executando Fedora Only Fans no Firefox..."
    firefox --new-window "$URL_ALVO"

# TESTE 2: Se não tiver Firefox, verifica navegadores baseados no CHROMIUM
elif command -v chromium &> /dev/null || \
     command -v chromium-browser &> /dev/null || \
     command -v google-chrome &> /dev/null || \
     command -v brave &> /dev/null || \
     command -v microsoft-edge &> /dev/null || \
     command -v opera &> /dev/null || \
     command -v vivaldi &> /dev/null; then

    echo "[INFO]: Navegador Chromium detectado! Executando em modo App..."
    abrir_modo_chromium

# TESTE 3: Sem Firefox e sem Chromium -> Instala a base do Chromium e executa
else
    echo "----------------------------------------------------"
    echo "[AVISO]: Nenhum navegador suportado foi encontrado."
    echo "Instalando a base do Chromium para executar o app..."
    echo "----------------------------------------------------"
    
    sudo dnf install chromium -y

    if [ $? -eq 0 ]; then
        echo "[SUCESSO]: Chromium instalado com sucesso!"
        abrir_modo_chromium
    else
        echo "[ERRO]: Falha ao instalar o Chromium via DNF."
        echo "Pressione qualquer tecla para sair..."
        read -n 1
        exit 1
    fi
fi

echo "Janela encerrada pelo usuário."
limpar_tudo