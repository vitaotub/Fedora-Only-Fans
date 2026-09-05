# ============================================================
# Fedora Only Fans - Makefile
# ============================================================

CC = gcc

# CORREÇÃO: o Fedora removeu o pacote webkit2gtk-4.0 (não existe mais em
# nenhum Fedora 40+, alvo deste projeto). O código C usa APIs exclusivas
# do WebKitGTK 4.1 (webkit_policy_decision_use,
# webkit_navigation_policy_decision_get_navigation_action), então 4.0 não
# é mais uma opção válida de compilação. Mantemos apenas 4.1.
WEBKIT_PKG := $(shell pkg-config --exists webkit2gtk-4.1 && echo webkit2gtk-4.1 || echo NENHUM)

CFLAGS = -Wall -O2 $(shell pkg-config --cflags $(WEBKIT_PKG) gtk+-3.0 2>/dev/null)
LIBS = $(shell pkg-config --libs $(WEBKIT_PKG) gtk+-3.0 2>/dev/null)
TARGET = fof-container
SRC = src/fof-container.c

.PHONY: all clean install uninstall

all: $(TARGET)

$(TARGET): $(SRC)
	@if [ "$(WEBKIT_PKG)" = "NENHUM" ]; then \
		echo "❌ WebKitGTK 4.1 não encontrado!"; \
		echo ""; \
		if pkg-config --exists webkitgtk-6.0 2>/dev/null; then \
			echo "   Detectamos webkitgtk6.0-devel instalado (base GTK4), mas este"; \
			echo "   programa foi escrito para GTK3 e precisa do webkit2gtk4.1."; \
			echo "   Os dois pacotes podem conviver no mesmo sistema — instale também:"; \
			echo ""; \
			echo "   sudo dnf install webkit2gtk4.1-devel gtk3-devel"; \
		else \
			echo "   Instale com:"; \
			echo ""; \
			echo "   sudo dnf install webkit2gtk4.1-devel gtk3-devel"; \
		fi; \
		echo ""; \
		exit 1; \
	fi
	@echo "📦 Compilando container com $(WEBKIT_PKG)..."
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC) $(LIBS)
	@echo "✅ Container compilado: $(TARGET)"
	@echo ""
	@echo "   Para executar: ./$(TARGET)"
	@echo "   Para instalar: sudo make install"

clean:
	@echo "🧹 Limpando..."
	rm -f $(TARGET)
	@echo "✅ Limpo"

install: $(TARGET)
	@echo "📦 Instalando..."
	mkdir -p /usr/local/bin
	cp $(TARGET) /usr/local/bin/
	@echo "✅ Instalado em: /usr/local/bin/$(TARGET)"
	@echo "   Agora você pode executar: $(TARGET)"

uninstall:
	@echo "🧹 Desinstalando..."
	rm -f /usr/local/bin/$(TARGET)
	@echo "✅ Removido: /usr/local/bin/$(TARGET)"
