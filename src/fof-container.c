// ============================================================
// Fedora Only Fans (FOF) - Container WebKitGTK
// ============================================================
// Compilar com:
//   make
// ============================================================

#include <gtk/gtk.h>
#include <webkit2/webkit2.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>

// ============================================================
// CONFIGURAÇÕES
// ============================================================

#define WINDOW_WIDTH 980
#define WINDOW_HEIGHT 880
#define APP_NAME "Fedora Only Fans"
#define DEFAULT_URL "http://localhost:3000"

// ============================================================
// ESTRUTURA DE DADOS
// ============================================================

typedef struct {
    GtkWidget *window;
    GtkWidget *webview;
    GtkWidget *header_bar;
    GtkWidget *spinner;
    char *url;
    char *icon_path;
    char *app_name;
} AppData;

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

void set_app_icon(GtkWindow *window, const char *icon_path) {
    GdkPixbuf *pixbuf = NULL;

    if (icon_path && g_file_test(icon_path, G_FILE_TEST_EXISTS)) {
        pixbuf = gdk_pixbuf_new_from_file(icon_path, NULL);
    }

    if (pixbuf) {
        gtk_window_set_icon(GTK_WINDOW(window), pixbuf);
        g_object_unref(pixbuf);
    } else {
        gtk_window_set_icon_name(GTK_WINDOW(window), "applications-utilities");
    }
}

// ============================================================
// CALLBACKS
// ============================================================

void on_load_finished(WebKitWebView *webview, WebKitLoadEvent load_event, gpointer user_data) {
    AppData *data = (AppData*)user_data;

    if (data->spinner) {
        gtk_widget_hide(data->spinner);
    }

    if (load_event == WEBKIT_LOAD_FINISHED) {
        g_print("[FOF] ✅ Página carregada com sucesso!\n");
    } else {
        g_print("[FOF] ❌ Erro ao carregar a página!\n");
    }
}

void on_load_started(WebKitWebView *webview, gpointer user_data) {
    AppData *data = (AppData*)user_data;

    if (data->spinner) {
        gtk_widget_show(data->spinner);
    }
}

void on_close(GtkWidget *widget, gpointer user_data) {
    g_print("[FOF] Encerrando...\n");
    gtk_main_quit();
}

// ============================================================
// CONFIGURAÇÃO DA INTERFACE
// ============================================================

void setup_header_bar(AppData *data) {
    data->header_bar = gtk_header_bar_new();
    gtk_header_bar_set_title(GTK_HEADER_BAR(data->header_bar), data->app_name ? data->app_name : APP_NAME);
    gtk_header_bar_set_show_close_button(GTK_HEADER_BAR(data->header_bar), TRUE);
    gtk_header_bar_set_decoration_layout(GTK_HEADER_BAR(data->header_bar), "menu:minimize,maximize,close");
    gtk_window_set_titlebar(GTK_WINDOW(data->window), data->header_bar);

    data->spinner = gtk_spinner_new();
    gtk_widget_set_size_request(data->spinner, 20, 20);
    gtk_widget_hide(data->spinner);
    gtk_header_bar_pack_start(GTK_HEADER_BAR(data->header_bar), data->spinner);

    GtkWidget *reload_btn = gtk_button_new_from_icon_name("view-refresh", GTK_ICON_SIZE_MENU);
    gtk_button_set_relief(GTK_BUTTON(reload_btn), GTK_RELIEF_NONE);
    gtk_widget_set_tooltip_text(reload_btn, "Recarregar página");
    g_signal_connect(reload_btn, "clicked", G_CALLBACK(webkit_web_view_reload), data->webview);
    gtk_header_bar_pack_end(GTK_HEADER_BAR(data->header_bar), reload_btn);
}

// ============================================================
// MAIN
// ============================================================

int main(int argc, char *argv[]) {
    gtk_init(&argc, &argv);

    char *url = DEFAULT_URL;
    char *icon_path = NULL;
    char *app_name = APP_NAME;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--url") == 0 && i + 1 < argc) {
            url = argv[++i];
        } else if (strcmp(argv[i], "--icon") == 0 && i + 1 < argc) {
            icon_path = argv[++i];
        } else if (strcmp(argv[i], "--name") == 0 && i + 1 < argc) {
            app_name = argv[++i];
        } else if (strcmp(argv[i], "--help") == 0 || strcmp(argv[i], "-h") == 0) {
            printf("Fedora Only Fans - Container WebKitGTK\n");
            printf("Uso: %s [opções]\n", argv[0]);
            printf("\nOpções:\n");
            printf("  --url URL        URL do servidor (padrão: http://localhost:3000)\n");
            printf("  --icon CAMINHO   Caminho do ícone da aplicação\n");
            printf("  --name NOME      Nome da aplicação (padrão: Fedora Only Fans)\n");
            printf("  --help, -h       Mostra esta ajuda\n");
            printf("\nExemplo:\n");
            printf("  %s --url http://localhost:3000 --icon icone.png\n", argv[0]);
            return 0;
        }
    }

    AppData data;
    data.url = url;
    data.icon_path = icon_path;
    data.app_name = app_name;

    data.window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
    gtk_window_set_title(GTK_WINDOW(data.window), app_name);
    gtk_window_set_default_size(GTK_WINDOW(data.window), WINDOW_WIDTH, WINDOW_HEIGHT);
    gtk_window_set_position(GTK_WINDOW(data.window), GTK_WIN_POS_CENTER);
    gtk_window_set_resizable(GTK_WINDOW(data.window), TRUE);
    g_signal_connect(data.window, "destroy", G_CALLBACK(on_close), NULL);

    set_app_icon(GTK_WINDOW(data.window), icon_path);

    WebKitSettings *settings = webkit_settings_new();
    webkit_settings_set_enable_developer_extras(settings, TRUE);
    webkit_settings_set_enable_javascript(settings, TRUE);
    webkit_settings_set_enable_webaudio(settings, FALSE);
    webkit_settings_set_allow_file_access_from_file_urls(settings, TRUE);
    webkit_settings_set_enable_media_stream(settings, TRUE);

    data.webview = webkit_web_view_new_with_settings(settings);
    g_object_unref(settings);

    g_signal_connect(data.webview, "load-started", G_CALLBACK(on_load_started), &data);
    g_signal_connect(data.webview, "load-finished", G_CALLBACK(on_load_finished), &data);

    webkit_web_view_load_uri(WEBKIT_WEB_VIEW(data.webview), url);

    GtkWidget *scrolled = gtk_scrolled_window_new(NULL, NULL);
    gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(scrolled),
                                   GTK_POLICY_AUTOMATIC,
                                   GTK_POLICY_AUTOMATIC);
    gtk_container_add(GTK_CONTAINER(scrolled), data.webview);

    gtk_container_add(GTK_CONTAINER(data.window), scrolled);

    setup_header_bar(&data);

    gtk_widget_show_all(data.window);

    struct sigaction sa;
    sa.sa_handler = (void(*)(int))gtk_main_quit;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    sigaction(SIGINT, &sa, NULL);

    g_print("[FOF] 🚀 Container iniciado!\n");
    g_print("[FOF] 🌐 URL: %s\n", url);
    g_print("[FOF] 📦 Pressione Ctrl+C para encerrar\n");
    g_print("[FOF] ⏳ Aguardando servidor...\n");

    gtk_main();

    g_print("[FOF] 👋 Encerrado!\n");
    return 0;
}
