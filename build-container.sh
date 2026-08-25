#!/usr/bin/env bash
# ============================================================
# Build do Container FOF
# Versão: 0.9.5-alpha
# ============================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE}")" && pwd)"
cd "$DIR"

echo "============================================================"
echo "  🏗️  Fedora Only Fans - Build do Container"
echo "============================================================"
echo ""

echo "🔍 Verificando dependências..."

# ============================================================
# DETECÇÃO AUTOMÁTICA DA VERSÃO DO WEBKITGTK
# ============================================================

WEBKIT_VERSION=""
WEBKIT_PKG=""

# Tenta encontrar a versão mais recente disponível
for version in 4.1 4.0; do
    if pkg-config --exists webkit2gtk-$version gtk+-3.0 2>/dev/null; then
        WEBKIT_VERSION=$version
        WEBKIT_PKG="webkit2gtk-$version"
        echo "✅ WebKitGTK-$version detectado"
        break
    fi
done

if [ -z "$WEBKIT_VERSION" ]; then
    echo "❌ Nenhuma versão do WebKitGTK encontrada!"
    echo ""
    echo "   Instale com:"
    echo "   sudo dnf install webkit2gtk4.1-devel gtk3-devel"
    echo "   ou"
    echo "   sudo dnf install webkit2gtk4.0-devel gtk3-devel"
    echo ""
    exit 1
fi

echo "✅ Dependências OK"

mkdir -p src

if [ ! -f "src/fof-container.c" ]; then
    echo "❌ Arquivo src/fof-container.c não encontrado!"
    echo ""
    echo "   Certifique-se de que o arquivo existe."
    exit 1
fi

echo ""
echo "📦 Compilando container com WebKitGTK-$WEBKIT_VERSION..."

# ============================================================
# DEFINIÇÕES DE COMPILAÇÃO BASEADAS NA VERSÃO
# ============================================================

# Define flags específicos para cada versão
if [ "$WEBKIT_VERSION" = "4.1" ]; then
    # WebKitGTK 4.1 usa a API mais nova
    EXTRA_CFLAGS="-DWEBKIT_API_41"
elif [ "$WEBKIT_VERSION" = "4.0" ]; then
    # WebKitGTK 4.0 usa a API mais antiga
    EXTRA_CFLAGS="-DWEBKIT_API_40"
fi

# Compila usando os flags detectados
gcc -Wall -O2 \
    $(pkg-config --cflags $WEBKIT_PKG gtk+-3.0) \
    $EXTRA_CFLAGS \
    -o fof-container src/fof-container.c \
    $(pkg-config --libs $WEBKIT_PKG gtk+-3.0) -lm

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================================"
    echo "  ✅ Container compilado com sucesso!"
    echo "============================================================"
    echo ""
    echo "📁 Arquivo: $DIR/fof-container"
    echo "📦 Tamanho: $(du -h fof-container | cut -f1)"
    echo "🔧 WebKitGTK: $WEBKIT_VERSION"
    echo ""
    echo "Para executar:"
    echo "  ./fof-container"
    echo ""
    echo "Com opções:"
    echo "  ./fof-container --url http://localhost:3000 --icon icone_app.png"
    echo ""
    echo "Para instalar no sistema:"
    echo "  sudo make install"
    echo ""
else
    echo "❌ Falha na compilação"
    exit 1
fi
