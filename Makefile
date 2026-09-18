# ============================================================
# Fedora Only Fans (FOF) - Makefile
# Versão: 1.0.0-rc.2
# ============================================================

PREFIX ?= /usr/local
BINDIR = $(PREFIX)/bin
APPDIR = $(PREFIX)/share/applications
ICONDIR = $(PREFIX)/share/icons/hicolor/256x256/apps

CC = gcc
CFLAGS = -Wall -O2
LDFLAGS = -lm

# Detecção de WebKitGTK 4.1 (GTK3). Se não achar, tenta 4.0 (legado).
WEBKIT_PKG := $(shell pkg-config --exists webkit2gtk-4.1 && echo webkit2gtk-4.1)
ifeq ($(WEBKIT_PKG),)
WEBKIT_PKG := $(shell pkg-config --exists webkit2gtk-4.0 && echo webkit2gtk-4.0)
endif

ifeq ($(WEBKIT_PKG),)
$(error WebKitGTK não encontrado. Instale: sudo dnf install webkit2gtk4.1-devel gtk3-devel)
endif

PKG_CFLAGS := $(shell pkg-config --cflags $(WEBKIT_PKG) gtk+-3.0)
PKG_LIBS := $(shell pkg-config --libs $(WEBKIT_PKG) gtk+-3.0)

TARGET = fof-container
SRC = src/fof-container.c

.PHONY: all clean install uninstall run

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $(PKG_CFLAGS) -o $(TARGET) $(SRC) $(PKG_LIBS) $(LDFLAGS)

clean:
	rm -f $(TARGET)

install: $(TARGET)
	install -d $(DESTDIR)$(BINDIR)
	install -m 755 $(TARGET) $(DESTDIR)$(BINDIR)/$(TARGET)
	install -d $(DESTDIR)$(APPDIR)
	install -d $(DESTDIR)$(ICONDIR)
	install -m 644 icone_app.png $(DESTDIR)$(ICONDIR)/fof-container.png

uninstall:
	rm -f $(DESTDIR)$(BINDIR)/$(TARGET)
	rm -f $(DESTDIR)$(ICONDIR)/fof-container.png

run: $(TARGET)
	./$(TARGET) --url http://localhost:3000 --icon icone_app.png
