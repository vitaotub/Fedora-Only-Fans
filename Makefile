# ============================================================
# Fedora Only Fans - Makefile
# ============================================================

CC = gcc
CFLAGS = -Wall -O2 $(shell pkg-config --cflags webkit2gtk-4.1 gtk+-3.0)
LIBS = $(shell pkg-config --libs webkit2gtk-4.1 gtk+-3.0)
TARGET = fof-container
SRC = src/fof-container.c

.PHONY: all clean install uninstall

all: $(TARGET)

$(TARGET): $(SRC)
	@echo "📦 Compilando container..."
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
