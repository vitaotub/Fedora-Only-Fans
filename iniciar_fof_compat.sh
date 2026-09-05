#!/usr/bin/env bash
# ============================================================
# Fedora Only Fans (FOF) - Modo Compatibilidade
# Versão: 0.9.8-alpha
# ============================================================
#
# Este script força renderização por software para GPUs
# sem aceleração 3D (NVIDIA legacy, Intel antiga, VMs, etc.)
#
# Uso: ./iniciar_fof_compat.sh [opções]
#
# Opções:
#   --debug, -d     Modo debug (logs detalhados)
#   --no-clean      Não limpar perfis do navegador
#   --help, -h      Mostra esta ajuda
# ============================================================

# ============================================================
# FORÇAR RENDERIZAÇÃO POR SOFTWARE
# ============================================================

# Desabilitar aceleração gráfica do WebKit
export WEBKIT_DISABLE_COMPOSITING_MODE=1
export WEBKIT_DISABLE_DMABUF_RENDERER=1

# Forçar X11 (evita problemas com Wayland)
export GDK_BACKEND=x11

# Forçar renderização por software (OpenGL via CPU)
export LIBGL_ALWAYS_SOFTWARE=1
export GALLIUM_DRIVER=llvmpipe

# Desabilitar aceleração de vídeo
export WEBKIT_DISABLE_ACCELERATED_2D_CANVAS=1

# ============================================================
# EXECUTAR O SCRIPT NORMAL
# ============================================================

# Seguir link simbólico para encontrar o diretório real
if [ -L "${BASH_SOURCE}" ]; then
    DIR="$(cd "$(dirname "$(readlink "${BASH_SOURCE}")")" && pwd)"
else
    DIR="$(cd "$(dirname "${BASH_SOURCE}")" && pwd)"
fi
cd "$DIR"

echo ""
echo "============================================================"
echo "  🐧 Fedora Only Fans (FOF) - Modo Compatibilidade"
echo "============================================================"
echo ""
echo "ℹ️  Renderização por software ativada"
echo "ℹ️  Ideal para GPUs sem aceleração 3D"
echo "ℹ️  (NVIDIA legacy, Intel antiga, VMs, etc.)"
echo ""

# Verificar se o script principal existe
if [ ! -f "$DIR/iniciar_fof.sh" ]; then
    echo "❌ Arquivo iniciar_fof.sh não encontrado em: $DIR"
    echo "   Certifique-se de estar no diretório correto."
    exit 1
fi

# Verificar modo debug
DEBUG=false
NO_CLEAN=false

for arg in "$@"; do
    case $arg in
        --debug|-d)
            DEBUG=true
            ;;
        --no-clean)
            NO_CLEAN=true
            ;;
        --help|-h)
            echo "🐧 Fedora Only Fans (FOF) - Modo Compatibilidade"
            echo ""
            echo "Uso: ./iniciar_fof_compat.sh [opções]"
            echo ""
            echo "Opções:"
            echo "  --debug, -d     Modo debug (logs detalhados)"
            echo "  --no-clean      Não limpar perfis do navegador"
            echo "  --help, -h      Mostra esta ajuda"
            echo ""
            echo "Este modo força renderização por software para"
            echo "GPUs sem aceleração 3D (NVIDIA legacy, Intel antiga, VMs)"
            exit 0
            ;;
    esac
done

if [ "$DEBUG" = true ]; then
    echo "🐛 Modo DEBUG ativado"
    echo "   Diretório: $DIR"
    echo "   Variáveis de ambiente:"
    echo "   WEBKIT_DISABLE_COMPOSITING_MODE=$WEBKIT_DISABLE_COMPOSITING_MODE"
    echo "   WEBKIT_DISABLE_DMABUF_RENDERER=$WEBKIT_DISABLE_DMABUF_RENDERER"
    echo "   GDK_BACKEND=$GDK_BACKEND"
    echo "   LIBGL_ALWAYS_SOFTWARE=$LIBGL_ALWAYS_SOFTWARE"
    echo "   GALLIUM_DRIVER=$GALLIUM_DRIVER"
    echo ""
fi

if [ "$NO_CLEAN" = true ]; then
    echo "🧹 Limpeza de perfis desabilitada"
    echo ""
fi

echo "🔄 Iniciando o FOF em modo compatível..."
echo ""

# Executar o script normal com as variáveis de ambiente já exportadas
./iniciar_fof.sh "$@"
