#!/usr/bin/env bash
# ============================================================
# Build do Container FOF
# ============================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE}")" && pwd)"
cd "$DIR"

echo "============================================================"
echo "  🏗️  Fedora Only Fans - Build do Container"
echo "============================================================"
echo ""

echo "🔍 Verificando dependências..."

if ! pkg-config --exists webkit2gtk-4.1 gtk+-3.0; then
    echo "❌ Bibliotecas de desenvolvimento não encontradas!"
    echo ""
    echo "   Instale com:"
    echo "   sudo dnf install webkit2gtk4.1-devel gtk3-devel"
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
echo "📦 Compilando container..."

make clean
make

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================================"
    echo "  ✅ Container compilado com sucesso!"
    echo "============================================================"
    echo ""
    echo "📁 Arquivo: $DIR/fof-container"
    echo "📦 Tamanho: $(du -h fof-container | cut -f1)"
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
