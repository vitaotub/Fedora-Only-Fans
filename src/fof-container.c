// ============================================================
// Fedora Only Fans (FOF) - Container WebKitGTK
// Versão: 0.9.8-alpha
// ============================================================

#include <gtk/gtk.h>
#include <webkit2/webkit2.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <unistd.h>
#include <errno.h>

#define WINDOW_WIDTH 980
#define WINDOW_HEIGHT 880
#define APP_NAME "Fedora Only Fans"
#define DEFAULT_URL "http://localhost:3000"

typedef struct {
    GtkWidget *window;
    GtkWidget *webview;
    GtkWidget *header_bar;
    GtkWidget *spinner;
    GtkWidget *status_label;
    GtkWidget *progress_bar;
    char *url;
    char *icon_path;
    char *app_name;
    int window_width;
    int window_height;
    int debug_mode;
} AppData;

// ============================================================
// CORREÇÃO: Função de ícone melhorada para KDE
// ============================================================
void set_app_icon(GtkWindow *window, const char *icon_path) {
    if (icon_path && g_file_test(icon_path, G_FILE_TEST_EXISTS)) {
        // Método 1: Direto do arquivo (mais confiável)
        gtk_window_set_icon_from_file(GTK_WINDOW(window), icon_path, NULL);
        g_print("[FOF] ✅ Ícone aplicado: %s\n", icon_path);

        // Método 2: Também define como ícone padrão da aplicação
        GdkPixbuf *pixbuf = gdk_pixbuf_new_from_file(icon_path, NULL);
        if (pixbuf) {
            gtk_window_set_icon(GTK_WINDOW(window), pixbuf);
            g_object_unref(pixbuf);
        }
    } else {
        gtk_window_set_icon_name(GTK_WINDOW(window), "applications-utilities");
        g_print("[FOF] ⚠️ Ícone não encontrado: %s\n", icon_path ? icon_path : "(nenhum)");
    }
}

void atualizar_status(AppData *data, const char *mensagem, const char *estilo) {
    if (data->status_label) {
        char buffer[256];
        snprintf(buffer, sizeof(buffer), "<span %s>%s</span>", estilo ? estilo : "", mensagem);
        gtk_label_set_markup(GTK_LABEL(data->status_label), buffer);
    }
}

void on_webview_load_changed(WebKitWebView *webview, WebKitLoadEvent load_event, gpointer user_data) {
    AppData *data = (AppData*)user_data;

    switch (load_event) {
        case WEBKIT_LOAD_STARTED:
            if (data->spinner) {
                gtk_widget_show(data->spinner);
                gtk_spinner_start(GTK_SPINNER(data->spinner));
            }
            if (data->progress_bar) {
                gtk_widget_show(data->progress_bar);
                gtk_progress_bar_set_fraction(GTK_PROGRESS_BAR(data->progress_bar), 0.0);
            }
            atualizar_status(data, "⏳ Carregando...", "foreground='#60a5fa'");
            g_print("[FOF] ⏳ Carregando página...\n");
            break;

        case WEBKIT_LOAD_REDIRECTED:
            atualizar_status(data, "🔄 Redirecionando...", "foreground='#f59e0b'");
            break;

        case WEBKIT_LOAD_COMMITTED:
            atualizar_status(data, "📄 Carregando conteúdo...", "foreground='#60a5fa'");
            break;

        case WEBKIT_LOAD_FINISHED:
            if (data->spinner) {
                gtk_spinner_stop(GTK_SPINNER(data->spinner));
                gtk_widget_hide(data->spinner);
            }
            if (data->progress_bar) {
                gtk_progress_bar_set_fraction(GTK_PROGRESS_BAR(data->progress_bar), 1.0);
                gtk_widget_hide(data->progress_bar);
            }
            atualizar_status(data, "✅ Pronto", "foreground='#34d399'");
            g_print("[FOF] ✅ Página carregada com sucesso!\n");
            break;

        default:
            break;
    }
}

void on_webview_load_progress(WebKitWebView *webview, gint progress, gpointer user_data) {
    AppData *data = (AppData*)user_data;
    if (data->progress_bar) {
        gtk_progress_bar_set_fraction(GTK_PROGRESS_BAR(data->progress_bar), progress / 100.0);
        char buffer[16];
        snprintf(buffer, sizeof(buffer), "%d%%", progress);
        gtk_progress_bar_set_text(GTK_PROGRESS_BAR(data->progress_bar), buffer);
    }
}

gboolean on_webview_decide_policy(WebKitWebView *webview, WebKitPolicyDecision *decision,
                                  WebKitPolicyDecisionType type, gpointer user_data) {
    if (type == WEBKIT_POLICY_DECISION_TYPE_NAVIGATION_ACTION) {
        WebKitNavigationPolicyDecision *nav_decision = WEBKIT_NAVIGATION_POLICY_DECISION(decision);
        WebKitNavigationAction *action = webkit_navigation_policy_decision_get_navigation_action(nav_decision);
        WebKitURIRequest *request = webkit_navigation_action_get_request(action);
        const char *uri = webkit_uri_request_get_uri(request);

        g_print("[FOF] 🌐 Navegando para: %s\n", uri);

        if (g_str_has_prefix(uri, "http://localhost:") ||
            g_str_has_prefix(uri, "file://") ||
            g_str_has_prefix(uri, "about:")) {
            webkit_policy_decision_use(decision);
        return TRUE;
            }

            g_print("[FOF] 🔗 Abrindo link externo: %s\n", uri);
            char cmd[512];
            snprintf(cmd, sizeof(cmd), "xdg-open '%s' &", uri);
            system(cmd);
            webkit_policy_decision_ignore(decision);
            return TRUE;
    }
    return FALSE;
                                  }

                                  void on_webview_console_message(WebKitWebView *webview, const char *message,
                                                                  unsigned int line, const char *source_id,
                                                                  gpointer user_data) {
                                      AppData *data = (AppData*)user_data;
                                      if (data->debug_mode) {
                                          g_print("[FOF] 🐛 Console[%s:%d]: %s\n", source_id ? source_id : "???", line, message);
                                      }
                                                                  }

                                                                  void on_close(GtkWidget *widget, gpointer user_data) {
                                                                      g_print("[FOF] 📦 Encerrando container...\n");
                                                                      gtk_main_quit();
                                                                  }

                                                                  gboolean on_window_delete(GtkWidget *widget, GdkEvent *event, gpointer user_data) {
                                                                      on_close(widget, user_data);
                                                                      return FALSE;
                                                                  }

                                                                  gboolean on_window_key_press(GtkWidget *widget, GdkEventKey *event, gpointer user_data) {
                                                                      AppData *data = (AppData*)user_data;

                                                                      if ((event->state & GDK_CONTROL_MASK) && event->keyval == GDK_KEY_r) {
                                                                          webkit_web_view_reload(WEBKIT_WEB_VIEW(data->webview));
                                                                          return TRUE;
                                                                      }

                                                                      if (event->keyval == GDK_KEY_F5) {
                                                                          webkit_web_view_reload(WEBKIT_WEB_VIEW(data->webview));
                                                                          return TRUE;
                                                                      }

                                                                      if ((event->state & GDK_CONTROL_MASK) && (event->state & GDK_SHIFT_MASK) &&
                                                                          event->keyval == GDK_KEY_I) {
                                                                          WebKitWebInspector *inspector = webkit_web_view_get_inspector(WEBKIT_WEB_VIEW(data->webview));
                                                                      if (inspector) {
                                                                          webkit_web_inspector_show(inspector);
                                                                      }
                                                                      return TRUE;
                                                                          }

                                                                          if (event->keyval == GDK_KEY_Escape) {
                                                                              on_close(widget, user_data);
                                                                              return TRUE;
                                                                          }

                                                                          return FALSE;
                                                                  }

                                                                  void setup_header_bar(AppData *data) {
                                                                      data->header_bar = gtk_header_bar_new();
                                                                      gtk_header_bar_set_title(GTK_HEADER_BAR(data->header_bar),
                                                                                               data->app_name ? data->app_name : APP_NAME);
                                                                      gtk_header_bar_set_show_close_button(GTK_HEADER_BAR(data->header_bar), TRUE);
                                                                      gtk_header_bar_set_decoration_layout(GTK_HEADER_BAR(data->header_bar),
                                                                                                           "menu:minimize,maximize,close");

                                                                      gtk_window_set_titlebar(GTK_WINDOW(data->window), data->header_bar);

                                                                      data->spinner = gtk_spinner_new();
                                                                      gtk_widget_set_size_request(data->spinner, 20, 20);
                                                                      gtk_widget_hide(data->spinner);
                                                                      gtk_header_bar_pack_start(GTK_HEADER_BAR(data->header_bar), data->spinner);

                                                                      data->status_label = gtk_label_new(NULL);
                                                                      gtk_label_set_markup(GTK_LABEL(data->status_label), "<span foreground='#9ca3af'>Pronto</span>");
                                                                      gtk_widget_set_size_request(data->status_label, 120, -1);
                                                                      gtk_header_bar_pack_start(GTK_HEADER_BAR(data->header_bar), data->status_label);

                                                                      data->progress_bar = gtk_progress_bar_new();
                                                                      gtk_progress_bar_set_show_text(GTK_PROGRESS_BAR(data->progress_bar), TRUE);
                                                                      gtk_progress_bar_set_text(GTK_PROGRESS_BAR(data->progress_bar), "0%");
                                                                      gtk_widget_set_size_request(data->progress_bar, 80, 20);
                                                                      gtk_widget_hide(data->progress_bar);
                                                                      gtk_header_bar_pack_end(GTK_HEADER_BAR(data->header_bar), data->progress_bar);

                                                                      GtkWidget *reload_btn = gtk_button_new_from_icon_name("view-refresh", GTK_ICON_SIZE_MENU);
                                                                      gtk_button_set_relief(GTK_BUTTON(reload_btn), GTK_RELIEF_NONE);
                                                                      gtk_widget_set_tooltip_text(reload_btn, "Recarregar página (Ctrl+R)");
                                                                      g_signal_connect(reload_btn, "clicked", G_CALLBACK(webkit_web_view_reload), data->webview);
                                                                      gtk_header_bar_pack_end(GTK_HEADER_BAR(data->header_bar), reload_btn);

                                                                      if (data->debug_mode) {
                                                                          GtkWidget *inspect_btn = gtk_button_new_from_icon_name("system-search", GTK_ICON_SIZE_MENU);
                                                                          gtk_button_set_relief(GTK_BUTTON(inspect_btn), GTK_RELIEF_NONE);
                                                                          gtk_widget_set_tooltip_text(inspect_btn, "Abrir inspecionador (Ctrl+Shift+I)");
                                                                          g_signal_connect(inspect_btn, "clicked", G_CALLBACK(webkit_web_view_get_inspector), data->webview);
                                                                          gtk_header_bar_pack_end(GTK_HEADER_BAR(data->header_bar), inspect_btn);
                                                                      }

                                                                      GtkWidget *quit_btn = gtk_button_new_from_icon_name("window-close", GTK_ICON_SIZE_MENU);
                                                                      gtk_button_set_relief(GTK_BUTTON(quit_btn), GTK_RELIEF_NONE);
                                                                      gtk_widget_set_tooltip_text(quit_btn, "Sair (Escape)");
                                                                      g_signal_connect(quit_btn, "clicked", G_CALLBACK(on_close), data);
                                                                      gtk_header_bar_pack_end(GTK_HEADER_BAR(data->header_bar), quit_btn);
                                                                  }

                                                                  int main(int argc, char *argv[]) {
                                                                      gtk_init(&argc, &argv);

                                                                      char *url = DEFAULT_URL;
                                                                      char *icon_path = NULL;
                                                                      char *app_name = APP_NAME;
                                                                      int window_width = WINDOW_WIDTH;
                                                                      int window_height = WINDOW_HEIGHT;
                                                                      int debug_mode = 0;

                                                                      for (int i = 1; i < argc; i++) {
                                                                          if (strcmp(argv[i], "--url") == 0 && i + 1 < argc) {
                                                                              url = argv[++i];
                                                                          } else if (strcmp(argv[i], "--icon") == 0 && i + 1 < argc) {
                                                                              icon_path = argv[++i];
                                                                          } else if (strcmp(argv[i], "--name") == 0 && i + 1 < argc) {
                                                                              app_name = argv[++i];
                                                                          } else if (strcmp(argv[i], "--width") == 0 && i + 1 < argc) {
                                                                              window_width = atoi(argv[++i]);
                                                                          } else if (strcmp(argv[i], "--height") == 0 && i + 1 < argc) {
                                                                              window_height = atoi(argv[++i]);
                                                                          } else if (strcmp(argv[i], "--debug") == 0) {
                                                                              debug_mode = 1;
                                                                          } else if (strcmp(argv[i], "--help") == 0 || strcmp(argv[i], "-h") == 0) {
                                                                              printf("🐧 Fedora Only Fans - Container WebKitGTK v0.9.8-alpha\n");
                                                                              printf("\nUso: %s [opções]\n", argv[0]);
                                                                              printf("\nOpções:\n");
                                                                              printf("  --url URL        URL do servidor (padrão: http://localhost:3000)\n");
                                                                              printf("  --icon CAMINHO   Caminho do ícone da aplicação\n");
                                                                              printf("  --name NOME      Nome da aplicação (padrão: Fedora Only Fans)\n");
                                                                              printf("  --width N        Largura da janela (padrão: 980)\n");
                                                                              printf("  --height N       Altura da janela (padrão: 880)\n");
                                                                              printf("  --debug          Modo debug\n");
                                                                              printf("  --help, -h       Mostra esta ajuda\n");
                                                                              printf("\nAtalhos:\n");
                                                                              printf("  Ctrl+R / F5      Recarregar página\n");
                                                                              printf("  Ctrl+Shift+I     Abrir inspecionador\n");
                                                                              printf("  Escape           Sair\n");
                                                                              printf("\n");
                                                                              return 0;
                                                                          }
                                                                      }

                                                                      AppData data;
                                                                      data.url = url;
                                                                      data.icon_path = icon_path;
                                                                      data.app_name = app_name;
                                                                      data.window_width = window_width;
                                                                      data.window_height = window_height;
                                                                      data.debug_mode = debug_mode;
                                                                      data.webview = NULL;
                                                                      data.header_bar = NULL;
                                                                      data.spinner = NULL;
                                                                      data.status_label = NULL;
                                                                      data.progress_bar = NULL;

                                                                      data.window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
                                                                      gtk_window_set_title(GTK_WINDOW(data.window), app_name);
                                                                      gtk_window_set_default_size(GTK_WINDOW(data.window), window_width, window_height);
                                                                      gtk_window_set_position(GTK_WINDOW(data.window), GTK_WIN_POS_CENTER);
                                                                      gtk_window_set_resizable(GTK_WINDOW(data.window), TRUE);

                                                                      // CORREÇÃO: Aplicar ícone ANTES de mostrar a janela
                                                                      set_app_icon(GTK_WINDOW(data.window), icon_path);

                                                                      // Também definir como ícone da aplicação (para Wayland/KDE)
                                                                      if (icon_path && g_file_test(icon_path, G_FILE_TEST_EXISTS)) {
                                                                          g_set_prgname("fedora-only-fans");
                                                                          g_set_application_name(app_name);
                                                                      }

                                                                      WebKitSettings *settings = webkit_settings_new();

                                                                      webkit_settings_set_enable_developer_extras(settings, debug_mode);
                                                                      webkit_settings_set_enable_javascript(settings, TRUE);
                                                                      webkit_settings_set_enable_webaudio(settings, FALSE);
                                                                      webkit_settings_set_allow_file_access_from_file_urls(settings, TRUE);
                                                                      webkit_settings_set_enable_media_stream(settings, TRUE);
                                                                      webkit_settings_set_enable_page_cache(settings, TRUE);
                                                                      webkit_settings_set_enable_smooth_scrolling(settings, TRUE);
                                                                      webkit_settings_set_enable_back_forward_navigation_gestures(settings, FALSE);
                                                                      webkit_settings_set_user_agent(settings,
                                                                                                     "Mozilla/5.0 (Fedora Only Fans; Linux) AppleWebKit/605.1.15 (KHTML, like Gecko)");

                                                                      data.webview = webkit_web_view_new_with_settings(settings);
                                                                      g_object_unref(settings);

                                                                      g_signal_connect(data.webview, "load-changed",
                                                                                       G_CALLBACK(on_webview_load_changed), &data);
                                                                      g_signal_connect(data.webview, "load-progress",
                                                                                       G_CALLBACK(on_webview_load_progress), &data);
                                                                      g_signal_connect(data.webview, "decide-policy",
                                                                                       G_CALLBACK(on_webview_decide_policy), &data);

                                                                      if (debug_mode) {
                                                                          g_signal_connect(data.webview, "console-message",
                                                                                           G_CALLBACK(on_webview_console_message), &data);
                                                                      }

                                                                      webkit_web_view_load_uri(WEBKIT_WEB_VIEW(data.webview), url);

                                                                      gtk_widget_set_hexpand(data.webview, TRUE);
                                                                      gtk_widget_set_vexpand(data.webview, TRUE);
                                                                      gtk_container_add(GTK_CONTAINER(data.window), data.webview);

                                                                      setup_header_bar(&data);

                                                                      g_signal_connect(data.window, "destroy", G_CALLBACK(on_close), &data);
                                                                      g_signal_connect(data.window, "delete-event", G_CALLBACK(on_window_delete), &data);
                                                                      g_signal_connect(data.window, "key-press-event", G_CALLBACK(on_window_key_press), &data);

                                                                      gtk_widget_show_all(data.window);

                                                                      struct sigaction sa;
                                                                      sa.sa_handler = (void(*)(int))gtk_main_quit;
                                                                      sigemptyset(&sa.sa_mask);
                                                                      sa.sa_flags = 0;
                                                                      sigaction(SIGINT, &sa, NULL);
                                                                      sigaction(SIGTERM, &sa, NULL);

                                                                      g_print("============================================================\n");
                                                                      g_print(" 🐧 Fedora Only Fans - Container WebKitGTK v0.9.8-alpha\n");
                                                                      g_print("============================================================\n");
                                                                      g_print(" 🌐 URL: %s\n", url);
                                                                      g_print(" 📐 Janela: %dx%d\n", window_width, window_height);
                                                                      g_print(" 🐛 Debug: %s\n", debug_mode ? "Ativado" : "Desativado");
                                                                      g_print("============================================================\n");

                                                                      gtk_main();

                                                                      g_print("[FOF] 👋 Encerrado!\n");
                                                                      return 0;
                                                                  }
