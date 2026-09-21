# <img src="icone_app.png" width="55" align="center"> Fedora Only Fans (FOF)

**🌐 Idioma:** [Português (BR)](README.md) | [English](README.en.md) | Español

![Autor](https://img.shields.io/badge/Creador-Vit%C3%A3oTub-blue?style=flat-square)
![Versión](https://img.shields.io/badge/Versi%C3%B3n-v1.0.0--rc.3-orange?style=flat-square)
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

🧭 Iniciar Configuración: paso a paso, una sesión a la vez, con navegación intuitiva (Anterior/Siguiente). El orden importa para el resultado final, así que esta es la única forma de recorrer las sesiones de configuración de Fedora.

🛠️ Mantenimiento: kernels, limpieza de temporales, GRUB, actualizar/desinstalar FOF — tareas que no dependen del orden entre sí ni con el resto de la configuración, por eso viven en una página aparte, accesible en cualquier momento.

Cada botón recuerda su propio estado (ejecutado o pendiente), así que cerrar y reabrir FOF (o reiniciar el ordenador) siempre muestra exactamente dónde te detuviste.

---

✨ Funcionalidades Completas

Sesiones de Configuración (en orden)

    1	👋 Bienvenida
        Actualización completa del sistema Fedora (dnf upgrade --refresh)
        
    2	💾 Restauración
        Instalación de Btrfs-Assistant para gestión de snapshots del sistema
        
    3	⚙️ Optimización
        Ajuste de velocidad de descarga de DNF, idioma PT-BR, corrector ortográfico y corrección de dual-boot
        
    4	📦 Repositorios
        Activación de RPM Fusion, configuración de Flatpak/Flathub, códecs multimedia y extras tainted
        
    5	🔤 Fuentes
        Instalación de fuentes de Microsoft para compatibilidad (Arial, Times, Calibri, etc.)
        
    6	🎮 Launchers
        Instalación de Steam, Heroic Games, Lutris, y herramientas de compatibilidad Wine/Proton (Wine, Winetricks, Bottles, GameMode, MangoHud)
        
    7	🎬 Producción Multimedia
        Instalación de OBS Studio (Flatpak), activación de cámara virtual y EasyEffects (procesador de audio para PipeWire)
        
    8	🖥️ Hardware
        Controladores y herramientas específicas de GPU (AMD y NVIDIA), control de ventiladores (CoreCtrl, LACT, CoolerControl) y soporte para mandos (grupo input). Incluye Vulkan completo, Mesa 3D/RADV y VA-API/VDPAU para AMD, controlador propietario + NVENC/NVDEC + modesetting para NVIDIA, y ajuste de overclocking (amdgpu.ppfeaturemask)
        
    9	📱 Waydroid
        Instalación de Waydroid (Android en Linux) vía COPR yanqiyu/waydroid, con GApps (Google Play Store), traducción ARM (libndk/libhoudini), Magisk, Widevine DRM, Logitech SmartDock y waydroid-helper (vía el COPR oficial cuteneko/waydroid-helper). Requiere GPU AMD o Intel — no funciona con NVIDIA
        
    10	📦 Aplicaciones Recomendadas
        Selección curada de software útil para el día a día, todo vía Flatpak: productividad (OnlyOffice, LibreOffice, Obsidian, Thunderbird, Okular, Joplin, Foliate), entretenimiento (Haruna, VLC, MPV, Spotify, Plex, Stremio), herramientas gráficas (Krita, Inkscape, Pinta, GIMP, Darktable, FreeCAD, LibreCAD, Cura, Upscayl, XnView MP y la Suite Affinity), internet (Opera, Brave, Zen Browser, Edge, Chromium, Zoom, Vivaldi, Discord, Telegram, Signal), edición de vídeo y modelado 3D (Kdenlive, Shotcut, Pitivi, OpenShot, Avidemux, Lightworks, Drift, Blender), edición y creación de audio (Ardour, LMMS, Audacity) y sincronización en la nube (Rclone, Rclone Manager)


Sesiones de Mantenimiento (sin orden — página aparte)

        🛠️ Mantenimiento
        Limpieza de caché, gestión de kernels (listar/eliminar, con bloqueo del kernel en uso) y configuración de GRUB (timeout y visibilidad del menú)
        
        🔧 Mantenimiento FOF
        Actualización o desinstalación completa de Fedora Only Fans


🎨 Características Técnicas

    🖥️ Interfaz oscura y moderna - Diseño enfocado en confort visual
    🎨 Tema claro/oscuro - Alternancia en tiempo real, con preferencia guardada
    🌐 Multilingüe - Interfaz en Portugués (BR), Inglés y Español, con cambio en tiempo real
    📡 Registros en tiempo real - Sigue la ejecución vía Server-Sent Events (SSE)
    📋 Registro único por sesión - Cada sesión comparte un registro unificado, en orden cronológico, con separadores entre ejecuciones
    🔒 Bloqueo de sesión - Durante una instalación, los otros botones de la misma sesión se desactivan para evitar ejecuciones simultáneas
    📊 Barra de progreso - Visualiza el avance de las tareas
    🔐 Autenticación segura - Usa pkexec/kdesu (sin exponer contraseñas)
    🛡️ Comandos sin autenticación - Comandos de consulta (rpm -q, uname -r, etc.) no piden contraseña
    🐧 Soporte multi-escritorio - KDE, GNOME, XFCE, Cinnamon, MATE, LXQt, LXDE
    🖱️ 100% visual - Nunca necesitas abrir la terminal
    💾 Persistencia - Estado de cada acción guardado automáticamente (servidor local + navegador), sin depender de ningún informe agregado
    📦 Contenedor nativo - La aplicación corre en WebKitGTK (sin necesidad de navegador)
    🗂️ Acordeones nativos - Uso de <details>/<summary> para organizar bloques grandes sin saturar la interfaz


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
    Lógica para peticiones a la API local + internacionalización (PT-BR, EN, ES)

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
├── 📄 manutencao.html         # Mantenimiento (kernels, limpieza, GRUB, FOF — sin orden)
├── 📄 style.css               # CSS compartido (global)
├── 📄 script.js               # JS compartido (funciones globales)
├── 📄 i18n.js                 # Módulo de internacionalización (PT-BR/EN/ES)
├── 📂 locales/                # Archivos de traducción
│   ├── 📄 pt-BR.json          # Portugués (predeterminado)
│   ├── 📄 en.json             # Inglés
│   └── 📄 es.json             # Español
├── 📄 00-boas-vindas.html     # Sesión 1 (HTML + JS específico)
├── 📄 01-restauracao.html     # Sesión 2 (HTML + JS específico)
├── 📄 02-otimizacao.html      # Sesión 3 (HTML + JS específico)
├── 📄 03-repositorios.html    # Sesión 4 (HTML + JS específico)
├── 📄 04-fontes.html          # Sesión 5 (HTML + JS específico)
├── 📄 05-launchers.html       # Sesión 6 (HTML + JS específico)
├── 📄 06-loja.html            # Sesión 7 (HTML + JS específico)
├── 📄 10-hardware.html        # Sesión 8 — Hardware (AMD, NVIDIA y Mandos)
├── 📄 11-waydroid.html        # Sesión 9 — Waydroid
├── 📄 09-softwares-uteis.html # Sesión 10 — Aplicaciones Recomendadas
├── 📄 07-manutencao.html      # Mantenimiento — kernels, limpieza, GRUB (sin orden)
├── 📄 08-fof-manutencao.html  # Mantenimiento FOF — actualizar/desinstalar (sin orden)
├── 📄 template-sessao.html    # Plantilla para crear una sesión nueva
├── 📄 iniciar_fof.sh          # Script de inicio
├── 📄 iniciar_fof_compat.sh   # Modo compatibilidad (GPUs antiguas)
├── 📄 install.sh              # Instalador del sistema
├── 📄 server.js               # Servidor Node.js
├── 📄 icone_app.png           # Icono de la aplicación
├── 📄 package.json            # Dependencias de Node.js
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


📋 Registros

Los registros se guardan automáticamente en:

```bash
/tmp/fof-YYYYMMDD-HHMMSS.log
```

Para ver los registros en tiempo real:

```bash
tail -f /tmp/fof-*.log
```

🎯 Roadmap

v1.0.0-rc.3 (Actual) 🚧

    ✅ Sesión Waydroid: waydroid-helper ahora usa el COPR oficial cuteneko/waydroid-helper (recomendado por upstream) en lugar de descargar AppImage
    ✅ Sesión Waydroid: botón de waydroid-helper dividido en dos (Instalar / Abrir), siguiendo el patrón CoreCtrl/LACT/Rclone
    ✅ Sesión Waydroid: acordeón renombrado a "Configuraciones Avanzadas" y bloque de preajustes a "Ajustes Recomendados"
    ✅ Sesión Bienvenida: tema claro corregido (la tarjeta ya no se oscurece)
    ✅ Tema claro: nuevas variables CSS (--accent-soft, --warning-soft, --success-soft) garantizan contraste adecuado en porcentajes, badges y textos de progreso
    ✅ Servidor: regex de strip de sudo corregido para preservar flags (-E, -u, -H)
    ✅ Servidor: outputTemp ya no se elimina tras el timeout de 60s (comandos largos no pierden el final del registro)
    ✅ Sesiones: migración de DOMContentLoaded a IIFE (el listener nunca se disparaba por la carga vía eval)
    ✅ Guiado/Mantenimiento: captura de data-texto-original movida antes de restaurarEstadoSessao()
    ✅ Correcciones menores en script.js (clave muerta eliminada, botón Revertir oculto tras desinstalación, simetría textContent/innerHTML)

v1.0.0 (Futuro) 🔮

    □ Perfil EasyEffects con presets
    □ ?


➕ Cómo añadir una sesión nueva

FOF tiene un registro central de sesiones (SESSOES, al inicio de script.js) — es el único lugar que necesita ser editado para añadir una sesión nueva con botones nuevos.

    Copia template-sessao.html a NN-nombre-de-la-sesion.html (dos dígitos + guion + nombre en minúsculas).
    Rellena los placeholders con el contenido real (título, botones, comandos).
    Añade una entrada al array SESSOES en script.js, con el mismo id del archivo (sin .html) y los data-comando de tus botones. Si la sesión es una tarea sin dependencia de orden con el resto (como las de mantenimiento), márcala con manutencao: true — aparecerá en manutencao.html en lugar del flujo secuencial de guiado.html.

Listo — no necesitas editar guiado.html, manutencao.html, index.html ni server.js. La posición de tu entrada en el array SESSOES ya define el orden de visualización y el número "Sesión N" (calculado automáticamente) de las sesiones principales, y la ruta del servidor acepta cualquier sesión nombrada en ese patrón.

El template-sessao.html tiene comentarios que apuntan a sesiones existentes que sirven como ejemplos para patrones más específicos (botón siempre clicable, varios botones lado a lado, dropdown, flujo con confirmación doble, etc.). Importante: FOF no tiene botones de "deshacer" genéricos — si una acción tiene un "deshacer" con sentido, modela un segundo botón independiente, también siempre clicable (ver grub-aplicar-recomendado/grub-restaurar-padrao en 07-manutencao.html y el par amdgpu-overclock en 10-hardware.html).

🌐 Cómo añadir un idioma nuevo

    Copia locales/pt-BR.json a locales/XX.json (código del idioma).
    Traduce todos los valores (mantén las claves idénticas).
    Añade el código del idioma a LANGS_DISPONIVEIS en i18n.js y a LANGS_SUPORTADOS en server.js.
    Añade una <option> al array `opcoes` dentro de criarSeletorIdioma() en i18n.js.

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
