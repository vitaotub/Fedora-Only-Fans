# <img src="icone_app.png" width="55" align="center"> Fedora Only Fans (FOF)

**🌐 Idioma:** [Português (BR)](README.md) | [English](README.en.md) | Español

![Autor](https://img.shields.io/badge/Creador-Vit%C3%A3oTub-blue?style=flat-square)
![Versión](https://img.shields.io/badge/Versi%C3%B3n-v1.0.0--09252026-orange?style=flat-square)
![Fedora](https://img.shields.io/badge/Fedora-44+-294172?style=flat-square&logo=fedora)
![Licencia](https://img.shields.io/badge/Licencia-GPL--3.0-green?style=flat-square)
![Idiomas](https://img.shields.io/badge/Idiomas-PT--BR%20%7C%20EN%20%7C%20ES-3c67e3?style=flat-square)
![Estado](https://img.shields.io/badge/Estado-Release%20Candidate-orange?style=flat-square)
[![Instalar](https://img.shields.io/badge/🚀_Instalar_con_un_comando-Fedora_Only_Fans-3c67e3?style=flat-square)](https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh)

> Dejando tu Fedora listo para el "play" de forma visual, rápida y sin complicaciones.

---

## 🚀 Instalación en 1 Comando

Copia el comando de abajo, abre el Terminal, pégalo (CTRL + SHIFT + V) y presiona ENTER:

```bash
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh)
```

¡Eso es todo! El script se encarga del resto. 🎉

El instalador hará:

    ✅ Verificar que estés en Fedora
    ✅ Instalar dependencias (Node.js 18+, npm, git, curl)
    ✅ Descargar el proyecto desde GitHub
    ✅ Instalar dependencias de Node.js
    ✅ Crear el comando fof en la terminal
    ✅ Crear un acceso directo en el menú de aplicaciones
    ✅ Compilar el contenedor nativo WebKitGTK (opcional)

📦 Comandos Disponibles

Después de la instalación:

```bash
# Iniciar FOF (modo normal)
fof

# Iniciar FOF (modo compatibilidad - para GPUs antiguas)
fof-compat

# Actualizar a la última versión
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh) --update

# Desinstalar completamente
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh) --uninstall
```

---

📖 Sobre el Proyecto

Fedora Only Fans es un panel de automatización interactivo con interfaz web diseñado para principiantes (y también para usuarios avanzados que buscan practicidad).

El objetivo es transformar una instalación limpia de Fedora en un sistema operativo completo, con todos los códecs, repositorios, controladores y herramientas esenciales activados — todo visualmente y sin necesidad de usar la terminal.

---

🧭 Configuración y Mantenimiento

FOF tiene dos puntos de entrada, con propósitos diferentes:

🧭 Iniciar Configuración: paso a paso, una sesión a la vez, con navegación intuitiva (Anterior/Siguiente) y un menú fijo en la parte superior mostrando todas las sesiones disponibles. El orden importa para el resultado final, así que esta es la única forma de recorrer las sesiones de configuración de Fedora.

🛠️ Mantenimiento: tareas sueltas que no dependen del orden entre sí ni con el resto de la configuración. Viven en una página aparte, accesible en cualquier momento, organizadas en dos acordeones: Mantenimiento de Fedora (limpieza, kernels, GRUB) y Mantenimiento del FOF (actualizar, desinstalar).

Cada botón recuerda su propio estado (ejecutado o pendiente), así que cerrar y reabrir FOF (o reiniciar el ordenador) siempre muestra exactamente dónde te detuviste.

---

✨ Funcionalidades Completas

Sesiones de Configuración (en orden)

    1	👋 Bienvenida
        Presentación del FOF (qué es, por qué fue creado, qué obtienes y qué no hace) + actualización completa del sistema Fedora (dnf upgrade --refresh)
        
    2	💾 Restauración
        Instalación de Btrfs-Assistant para gestión de snapshots del sistema
        
    3	⚙️ Optimización
        Ajuste de velocidad de descarga de DNF, idioma PT-BR, corrector ortográfico y corrección de dual-boot
        
    4	📦 Repositorios
        Activación de RPM Fusion, configuración de Flatpak/Flathub, códecs multimedia y extras tainted
        
    5	🔤 Fuentes
        Instalación de fuentes de Microsoft para compatibilidad (Arial, Times, Calibri, etc.)
        
    6	🖥️ Hardware
        Controladores y herramientas específicas de GPU (AMD y NVIDIA), control de ventiladores (CoreCtrl, LACT, CoolerControl) y soporte para mandos (grupo input). Incluye Vulkan completo, Mesa 3D/RADV y VA-API/VDPAU para AMD, controlador propietario + NVENC/NVDEC + modesetting para NVIDIA, y ajuste de overclocking (amdgpu.ppfeaturemask)
        
    7	🎮 Gaming
        Sesión dedicada a juegos, organizada en varios bloques colapsables:
        • Launchers (Steam, Heroic, Lutris)
        • Compatibilidad (Wine, Winetricks, Bottles, NTSYNC)
        • Rendimiento y Monitoreo (GameMode, MangoHud, Goverlay, Gamescope)
        • Gaming Avanzado (ProtonUp-Qt, vkBasalt, presets de GameMode+MangoHud, Gamescope Session, prueba de mando)
        • Emuladores (RetroArch + cores recomendados, Dolphin, PCSX2, RPCS3, Duckstation — sin emulador de Nintendo Switch por cuestiones legales)
        • Red para Juegos Online (QoS Cake anti-bufferbloat, ajuste de MTU, prueba de bufferbloat)
        • Anti-cheat Awareness (panel informativo sobre qué anti-cheats funcionan en Linux)
        • Consejos y Trucos
        
    8	🎬 Producción Multimedia
        Herramientas para grabar, editar, transmitir y producir contenido:
        • OBS Studio + Cámara Virtual
        • EasyEffects (procesador de efectos de audio para PipeWire)
        • Streaming Ready (plantillas de escena de OBS, Streamdeck UI, NDI Tools)
        • Enrutamiento de Audio (qpwgraph para PipeWire)
        • Presets de Vídeo (HandBrake + presets, plantillas de proyecto de Kdenlive)
        • Captura de Pantalla (wf-recorder en Wayland, SimpleScreenRecorder en X11)
        
    9	📱 Waydroid
        Instalación de Waydroid (Android en Linux) vía COPR yanqiyu/waydroid, con GApps (Google Play Store), traducción ARM (libndk/libhoudini), Magisk, Widevine DRM, Logitech SmartDock y waydroid-helper (vía el COPR oficial cuteneko/waydroid-helper). Requiere GPU AMD o Intel — no funciona con NVIDIA
        
    10	📦 Aplicaciones Recomendadas
        Selección curada de software útil para el día a día, todo vía Flatpak: productividad (OnlyOffice, LibreOffice, Obsidian, Thunderbird, Okular, Joplin, Foliate), entretenimiento (Haruna, VLC, MPV, Spotify, Plex, Stremio), herramientas gráficas (Krita, Inkscape, Pinta, GIMP, Darktable, FreeCAD, LibreCAD, Cura, Upscayl, XnView MP y la Suite Affinity), internet (Opera, Brave, Zen Browser, Edge, Chromium, Zoom, Vivaldi, Discord, Telegram, Signal), edición de vídeo y modelado 3D (Kdenlive, Shotcut, Pitivi, OpenShot, Avidemux, Lightworks, Drift, Blender), edición y creación de audio (Ardour, LMMS, Audacity) y sincronización en la nube (Rclone, Rclone Manager)
        
    11	🏠 Casa Lista
        Configuraciones para dejar Fedora listo para uso doméstico, en bloques independientes:
        • Impresora y Escáner (CUPS + Avahi + system-config-printer)
        • Compartir Archivos (Samba para Windows, LocalSend para móvil, Warpinator para red Linux)
        • Gestor de Contraseñas (KeePassXC offline)
        • PDF y OCR (Okular + Tesseract + paquetes de idioma PT/EN)
        
    12	📊 Diagnóstico
        Panel visual del estado del sistema, todo en bloques colapsables:
        • Panel del Sistema (CPU, RAM, disco, uptime, cortafuegos, SELinux, procesos, arranque)
        • Top 5 Procesos (por CPU y por RAM)
        • Particiones (uso, libre, punto de montaje)
        • Análisis Visual de Disco (Baobab)
        • Salud del Hardware: SMART (smartmontools) y temperaturas (lm_sensors)
        • Registros y Errores Recientes (journal agrupado por origen de las últimas 24h)
        
    13	📋 Central FOF
        Panel central del propio FOF:
        • Panel de Estado (versión, progreso, uptime, tema, idioma, Fedora, CPU, RAM, disco, cortafuegos, SELinux)
        • Búsqueda Global (Ctrl+K) — encuentra cualquier sesión, botón o término
        • Asistente de Perfil — sugiere sesiones relevantes según tu uso
        • Changelog — historial de versiones con enlaces a las releases en GitHub
        
    14	🐧 Fedora
        Información y herramientas específicas de Fedora:
        • Versión de Fedora (verificación de compatibilidad)
        • Fedora Atomic / Silverblue (detección de sistema inmutable)
        • SELinux (estado, avisos AVC recientes, setroubleshoot en lenguaje claro)


Sesiones de Mantenimiento (sin orden — página aparte)

        🛠️ Mantenimiento de Fedora
        Limpieza de caché, gestión de kernels (listar/eliminar, con bloqueo del kernel en uso) y configuración de GRUB (timeout y visibilidad del menú)
        
        🔧 Mantenimiento del FOF
        Verificación automática de actualizaciones (con badge ⬆️ en el header cuando hay nueva versión), actualización con popup de confirmación post-actualización, y desinstalación completa de Fedora Only Fans


🎨 Características Técnicas

    🖥️ Interfaz oscura y moderna - Diseño enfocado en confort visual
    🎨 Tema claro/oscuro - Alternancia en tiempo real, con preferencia guardada
    🌐 Multilingüe - Interfaz en Portugués (BR), Inglés y Español, con cambio en tiempo real
    📡 Registros en tiempo real - Sigue la ejecución vía Server-Sent Events (SSE)
    📋 Registro único por sesión - Cada sesión comparte un registro unificado, en orden cronológico, con separadores entre ejecuciones
    🔓 Registro expandido por defecto - El registro de cada sesión comienza expandido; el usuario puede contraerlo haciendo clic en el encabezado
    📏 Altura uniforme de los registros - Todas las sesiones usan la misma altura de registro, manteniendo la interfaz consistente
    🔍 Búsqueda global (Ctrl+K) - Encuentra cualquier sesión, botón o término en cualquier página del FOF
    📊 Panel de estado - Panel central con información del FOF y del sistema
    🧭 Asistente de perfil - Sugiere sesiones relevantes según tu uso (sin ocultar ninguna sesión)
    🔔 Verificación automática de actualizaciones - FOF consulta GitHub Releases al iniciar y muestra un badge ⬆️ cuando hay nueva versión disponible
    ✅ Popup post-actualización - Tras actualizar FOF, una alerta avisa para reiniciar la app y aplicar los cambios
    🔒 Bloqueo de sesión - Durante una instalación, los otros botones de la misma sesión se desactivan para evitar ejecuciones simultáneas
    📊 Barra de progreso - Visualiza el avance de las tareas
    🔐 Autenticación segura - Usa pkexec/kdesu (sin exponer contraseñas)
    🛡️ Comandos sin autenticación - Comandos de consulta (rpm -q, uname -r, etc.) no piden contraseña
    🐧 Soporte multi-escritorio - KDE, GNOME, XFCE, Cinnamon, MATE, LXQt, LXDE
    🖱️ 100% visual - Nunca necesitas abrir la terminal
    💾 Persistencia - Estado de cada acción guardado automáticamente (servidor local + navegador), sin depender de ningún informe agregado
    📦 Contenedor nativo - La aplicación corre en WebKitGTK (sin necesidad de navegador)
    🗂️ Acordeones nativos - Uso de <details>/<summary> para organizar bloques grandes sin saturar la interfaz
    🏷️ Versión centralizada - La versión del FOF vive en un solo lugar (package.json) y es leída en runtime por todos los componentes


🖥️ Escritorios Soportados

KDE Plasma
Discover ✅

GNOME
GNOME Software	✅

XFCE
AppFinder	✅

Cinnamon
Software Center	✅

MATE
Software Boutique	✅

LXQt
LXQt Software Center	✅

LXDE
LXDE Software Center	✅


🚀 ¿Cómo funciona?

Si vienes de distribuciones como Linux Mint, Ubuntu o Zorin OS, sabes que Fedora es increíble, pero requiere algunos pasos iniciales (como activar RPM Fusion o configurar Flathub).


Con FOF tú:

    Seleccionas visualmente lo que quieres instalar o configurar (códecs de medios, controladores, Flatpaks, optimizaciones de DNF).
    
    Ejecutas las tareas directamente a través de la interfaz web integrada, ingresando tu contraseña de administrador solo cuando el sistema lo solicite.
    
    Sigues el progreso en tiempo real con registros y barra de progreso.
    
    Recibes notificación automática cuando hay una nueva versión de FOF disponible.
    
    Usas la Búsqueda Global (Ctrl+K) para encontrar rápidamente cualquier sesión, botón o término.
    
    Consultas el Panel de Estado para ver el estado actual del sistema sin abrir la terminal.


💻 ¿Cómo ejecutar FOF localmente?

📦 Requisitos

    Fedora Linux 44+
    Node.js 18+
    Navegador (Firefox o Chromium) - opcional, ya que se prefiere el contenedor nativo
    Conexión a internet


🚀 Método Rápido

Para iniciar el panel, descarga todos los archivos de este repositorio, abre la terminal en la carpeta donde guardaste el proyecto y ejecuta los comandos de abajo:

```bash
# Dar permiso de ejecución al script
chmod +x iniciar_fof.sh

# Ejecutar el script de inicio
./iniciar_fof.sh
```

El script hará:

    ✅ Verificar que todos los archivos estén presentes
    ✅ Instalar Node.js 18+ (si es necesario)
    ✅ Instalar dependencias del proyecto
    ✅ Compilar el contenedor nativo WebKitGTK (si es posible)
    ✅ Iniciar el servidor en el puerto 3000
    ✅ Abrir la interfaz en el contenedor nativo o navegador


🔧 Opciones del Script:

```bash
# Modo debug (registros detallados)
./iniciar_fof.sh --debug

# No limpiar perfiles del navegador
./iniciar_fof.sh --no-clean

# Mostrar ayuda
./iniciar_fof.sh --help
```

🖥️ Método Manual:

```bash
# 1. Instalar dependencias del sistema
sudo dnf install -y nodejs npm

# 2. Instalar dependencias de Node.js
npm install

# 3. Iniciar el servidor
node server.js

# 4. Abrir el navegador en http://localhost:3000
firefox http://localhost:3000
```

🛠️ Tecnologías Utilizadas

    HTML5 / CSS3
    Interfaz responsiva y moderna

    JavaScript
    Lógica para peticiones a la API local + internacionalización (PT-BR, EN, ES) + verificación de actualizaciones vía GitHub Releases API + búsqueda global + panel

    Node.js
    Servidor backend local para ejecución segura de procesos

    Server-Sent Events (SSE)
    Registros en tiempo real

    Bash
    Script de inicio para el entorno Fedora

    pkexec / kdesu
    Autenticación segura

    WebKitGTK
    Contenedor nativo para ejecutar la aplicación


📂 Estructura del Proyecto

```bash
Fedora-Only-Fans/
├── 📄 index.html              # Landing page (elegir entre configuración/mantenimiento)
├── 📄 guiado.html             # Configuración paso a paso (sesiones principales, en orden)
├── 📄 manutencao.html         # Mantenimiento (Fedora + FOF en 2 acordeones, sin orden)
├── 📄 style.css               # CSS compartido (global)
├── 📄 script.js               # JS compartido (funciones globales + actualizaciones + búsqueda + panel)
├── 📄 i18n.js                 # Módulo de internacionalización (PT-BR/EN/ES)
├── 📂 locales/                # Archivos de traducción
│   ├── 📄 pt-BR.json          # Portugués (predeterminado)
│   ├── 📄 en.json             # Inglés
│   └── 📄 es.json             # Español
├── 📄 00-boas-vindas.html     # Sesión 1 — Bienvenida + Actualización (en acordeones)
├── 📄 01-restauracao.html     # Sesión 2 — Restauración del sistema
├── 📄 02-otimizacao.html      # Sesión 3 — Optimización del sistema e idioma
├── 📄 03-repositorios.html    # Sesión 4 — Repositorios, códecs y aceleración gráfica
├── 📄 04-fontes.html          # Sesión 5 — Fuentes para compatibilidad
├── 📄 05-hardware.html        # Sesión 6 — Hardware (AMD, NVIDIA y Mandos)
├── 📄 06-gaming.html          # Sesión 7 — Gaming (launchers, Wine/Proton, emuladores, red, anti-cheat)
├── 📄 07-loja.html            # Sesión 8 — Producción Multimedia (OBS, streaming, audio)
├── 📄 08-waydroid.html        # Sesión 9 — Waydroid (Android en Linux)
├── 📄 09-softwares-uteis.html # Sesión 10 — Aplicaciones Recomendadas
├── 📄 10-casa-pronta.html     # Sesión 11 — Casa Lista (impresora, archivos, contraseñas, PDF+OCR)
├── 📄 11-diagnostico.html     # Sesión 12 — Diagnóstico (panel del sistema, hardware, registros)
├── 📄 12-central-fof.html     # Sesión 13 — Central FOF (panel, búsqueda, asistente, changelog)
├── 📄 13-fedora.html          # Sesión 14 — Fedora (versión, atomic, SELinux)
├── 📄 template-sessao.html    # Plantilla para crear una sesión nueva
├── 📄 iniciar_fof.sh          # Script de inicio
├── 📄 iniciar_fof_compat.sh   # Modo compatibilidad (GPUs antiguas)
├── 📄 install.sh              # Instalador del sistema
├── 📄 server.js               # Servidor Node.js
├── 📄 icone_app.png           # Icono de la aplicación
├── 📄 package.json            # Dependencias de Node.js + versión del FOF (fuente única)
├── 📄 README.md               # Documentación (PT-BR)
├── 📄 README.en.md            # Documentation (English)
├── 📄 README.es.md            # Documentación (Español)
├── 📄 LICENSE                 # Licencia GPL-3.0
├── 📄 .gitignore              # Archivos ignorados por Git
├── 📄 Makefile                # Build del contenedor nativo
├── 📄 build-container.sh      # Script de compilación del contenedor
└── 📂 src/                    # Código fuente del contenedor
    └── 📄 fof-container.c     # Contenedor WebKitGTK (C + GTK3)
```

🛡️ Seguridad

    ✅ Autenticación segura - Usa pkexec/kdesu en lugar de echo contraseña | sudo
    ✅ Comandos sin autenticación - Comandos de consulta no piden contraseña
    ✅ Sanitización de entrada - Protección contra inyección de comandos
    ✅ Registros detallados - Registro de todas las operaciones
    ✅ Validación de versión - Verifica que la versión de Fedora exista antes de la actualización
    ✅ Rate limiting - Límite de 1.5s por idComando (evita bucles accidentales)
    ✅ Validación de idComando - Acepta solo letras, números, guion y guion bajo


📋 Registros

Los registros se guardan automáticamente en:

```bash
/tmp/fof-YYYYMMDD-HHMMSS.log
```

Los registros con más de 7 días se eliminan automáticamente al iniciar el servidor.

Para ver los registros en tiempo real:

```bash
tail -f /tmp/fof-*.log
```

🎯 Roadmap

v1.0.0-09252026 (Actual) 🚧

    ✅ Versión centralizada en package.json (fuente única de la verdad)
    ✅ Nueva sesión 11 — Casa Lista (impresora, archivos, contraseñas, PDF+OCR)
    ✅ Nueva sesión 12 — Diagnóstico (panel del sistema, hardware, registros)
    ✅ Nueva sesión 13 — Central FOF (panel, búsqueda Ctrl+K, asistente, changelog)
    ✅ Nueva sesión 14 — Fedora (versión, atomic, SELinux)
    ✅ Gaming ampliado: Gaming Avanzado, Emuladores, Red para Juegos Online, Anti-cheat Awareness
    ✅ Producción Multimedia ampliada: Streaming Ready, enrutamiento PipeWire, presets de vídeo, captura
    ✅ Mantenimiento consolidado en 2 acordeones (Fedora + FOF) en manutencao.html
    ✅ Menú fijo de sesiones en la parte superior (reemplaza los puntos de color)
    ✅ Búsqueda global Ctrl+K en cualquier página
    ✅ Panel de estado centralizado
    ✅ Nuevos endpoints en server.js: /system-info, /top-processes, /disk-usage, /journal-errors
    ✅ Rotación automática de registros (7 días)
    ✅ Rate limiting (1.5s por idComando)

v1.0.0-09232026 ✅

    ✅ Verificación automática de actualizaciones vía GitHub Releases API (badge ⬆️ en el header)
    ✅ Popup de confirmación post-actualización (avisa para reiniciar FOF)
    ✅ Sesión 00 reformulada en 2 acordeones (Bienvenida + Actualizaciones del Sistema)
    ✅ Sesión Gaming con aviso detallado sobre NTSYNC
    ✅ Registros de sesión expandidos por defecto
    ✅ Altura uniforme de los registros en todas las sesiones (120–200px)
    ✅ Header con controles inline junto al título (idioma, tema y volver al inicio en la misma línea)
    ✅ Botón "Volver al inicio" con icono SVG de casa
    ✅ Ajustes de diseño y limpieza de CSS

v1.0.0 (Futuro) 🔮

    □ Snapshots Btrfs automáticos antes de sesiones críticas
    □ Vista previa de comandos antes de ejecutar
    □ Export/import de configuración (migrar a otro equipo)
    □ Reportar problema con registros adjuntos (genera zip + abre issue pre-rellenada)


➕ Cómo añadir una sesión nueva

FOF tiene un registro central de sesiones (SESSOES, al inicio de script.js) — es el único lugar que necesita ser editado para añadir una sesión nueva con botones nuevos.

    Copia template-sessao.html a NN-nombre-de-la-sesion.html (dos dígitos + guion + nombre en minúsculas).
    Rellena los placeholders con el contenido real (título, botones, comandos).
    Añade una entrada al array SESSOES en script.js, con el mismo id del archivo (sin .html) y los data-comando de tus botones.

Listo — no necesitas editar guiado.html, manutencao.html, index.html ni server.js. La posición de tu entrada en el array SESSOES ya define el orden de visualización y el número "Sesión N" (calculado automáticamente) de las sesiones principales, y la ruta del servidor acepta cualquier sesión nombrada en ese patrón.

El template-sessao.html tiene comentarios que apuntan a sesiones existentes que sirven como ejemplos para patrones más específicos (botón siempre clicable, varios botones lado a lado, dropdown, flujo con confirmación doble, etc.). Importante: FOF no tiene botones de "deshacer" genéricos — si una acción tiene un "deshacer" con sentido, modela un segundo botón independiente, también siempre clicable (ver grub-aplicar-recomendado/grub-restaurar-padrao en manutencao.html y el par amdgpu-overclock en 05-hardware.html).

🌐 Cómo añadir un idioma nuevo

    Copia locales/pt-BR.json a locales/XX.json (código del idioma).
    Traduce todos los valores (mantén las claves idénticas).
    Añade el código del idioma a LANGS_DISPONIVEIS en i18n.js y a LANGS_SUPORTADOS en server.js.
    Añade una <option> al array `opcoes` dentro de criarSeletorIdioma() en i18n.js.

🏷️ Cómo publicar una versión nueva del FOF

La versión del FOF vive en un solo archivo: package.json. Al publicar:

    Edita package.json → "version": "1.0.0-<NUEVA_VERSION>"
    Edita i18n.js → var FALLBACK_VERSION = '1.0.0-<NUEVA_VERSION>' (la única excepción, usada como cache-buster antes de que /info responda)
    Crea la etiqueta/release en GitHub con el mismo nombre (ej.: v1.0.0-<NUEVA_VERSION>)

Todo lo demás es automático:

    server.js lee la versión de package.json en runtime (endpoint /info)
    install.sh e iniciar_fof.sh leen el banner de la versión de package.json
    Makefile y build-container.sh pasan la versión a gcc vía -DFOF_VERSION
    El contenedor C (fof-container) muestra la versión inyectada en --help
    El badge ⬆️ del FOF compara con la etiqueta de GitHub Releases automáticamente

🤝 Cómo contribuir

¡Toda ayuda es muy bienvenida! Si quieres sugerir nuevas optimizaciones para Fedora, nuevos Flatpaks esenciales o mejorar la interfaz:

1. **Haz un Fork del proyecto**

2. **Crea una rama para tu modificación:**
   ```bash
   git checkout -b feature/nueva-optimizacion
   ```

3. **Commit de tus cambios:**
   ```bash
   git commit -m 'Añade nueva optimización'
   ```

4. **Push a la rama:**
   ```bash
   git push origin feature/nueva-optimizacion
   ```

5. **Abre un Pull Request**


🐛 Reportar Problemas

¿Encontraste un bug? Abre un issue en GitHub: Issues del Proyecto

Información Necesaria:

    Versión de Fedora
    Entorno de escritorio (KDE, GNOME, XFCE, etc.)
    Registros del servidor (/tmp/fof-*.log)
    Pasos para reproducir el problema

⚠️ Aviso Legal

    ESTE PROYECTO ESTÁ EN DESARROLLO Y SU ESTADO SE CONSIDERA ALPHA.
    No se recomienda su uso en entornos de producción, a menos que sepas lo que estás haciendo. ¡Úsalo bajo tu propio riesgo!
    Siempre haz backup de tus datos antes de ejecutar cambios en el sistema.

📄 Licencia

Este proyecto está licenciado bajo la **Licencia GPL-3.0** - ver el archivo [LICENSE](LICENSE) para más detalles.


## 👤 Autor

**VitãoTub**
- 🌐 [Website](https://www.vitaotub.com)
- 🐙 [GitHub](https://github.com/vitaotub)


## 🙏 Agradecimientos

- [Fedora Project](https://getfedora.org/)
- [RPM Fusion](https://rpmfusion.org/)
- [Flathub](https://flathub.org/)


## ⭐ Soporte

Si te gustó el proyecto, ¡deja una ⭐ en GitHub!


**Hecho con ❤️ para la comunidad Fedora**
