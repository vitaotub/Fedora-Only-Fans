# <img src="icone_app.png" width="55" align="center"> Fedora Only Fans (FOF)

**🌐 Language:** [Português (BR)](README.md) | English | [Español](README.es.md)

![Author](https://img.shields.io/badge/Creator-Vit%C3%A3oTub-blue?style=flat-square)
![Version](https://img.shields.io/badge/Version-v1.0.0--rc.2-orange?style=flat-square)
![Fedora](https://img.shields.io/badge/Fedora-44+-294172?style=flat-square&logo=fedora)
![License](https://img.shields.io/badge/License-GPL--3.0-green?style=flat-square)
![Languages](https://img.shields.io/badge/Languages-PT--BR%20%7C%20EN%20%7C%20ES-3c67e3?style=flat-square)
![Status](https://img.shields.io/badge/Status-Release%20Candidate-orange?style=flat-square)
[![Install](https://img.shields.io/badge/🚀_Install_with_one_command-Fedora_Only_Fans-3c67e3?style=flat-square)](https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh)

> Getting your Fedora ready to "play" visually, quickly and without complications.

---

## 🚀 Install in 1 Command

Copy the command below, open the Terminal, paste it (CTRL + SHIFT + V) and press ENTER:

```bash
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh)
```

That's it! The script handles everything else. 🎉

The installer will:

    ✅ Check that you're on Fedora
    ✅ Install dependencies (Node.js 18+, npm, git, curl)
    ✅ Download the project from GitHub
    ✅ Install Node.js dependencies
    ✅ Create the fof command in the terminal
    ✅ Create a shortcut in the applications menu
    ✅ Compile the native WebKitGTK container (optional)

📦 Available Commands

After installation:

```bash
# Start FOF (normal mode)
fof

# Start FOF (compatibility mode - for older GPUs)
fof-compat

# Update to the latest version
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh) --update

# Completely uninstall
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh) --uninstall
```

---

📖 About the Project

Fedora Only Fans is an interactive automation panel with a web interface designed for beginners (and also for advanced users looking for convenience).

The goal is to transform a clean Fedora installation into a complete operating system, with all essential codecs, repositories, drivers and tools enabled — all visually and without needing to use the terminal.

---

🧭 Setup and Maintenance

FOF has two entry points, with different purposes:

🧭 Start Setup: step by step, one session at a time, with intuitive navigation (Previous/Next). The order matters for the final result, so this is the only way to go through the Fedora configuration sessions.

🛠️ Maintenance: kernels, temporary file cleanup, GRUB, updating/uninstalling FOF — tasks that don't depend on order between themselves or with the rest of the configuration, so they live on a separate page, accessible at any time.

Each button remembers its own state (executed or pending), so closing and reopening FOF (or restarting the computer) always shows exactly where you stopped.

---

✨ Complete Features

Setup Sessions (in order)

    1	👋 Welcome
        Full system update of Fedora (dnf upgrade --refresh)
        
    2	💾 Restore
        Installation of Btrfs-Assistant for system snapshot management
        
    3	⚙️ Optimization
        DNF download speed tuning, PT-BR language, spell checker and dual-boot fix
        
    4	📦 Repositories
        RPM Fusion activation, Flatpak/Flathub setup, multimedia codecs and tainted extras
        
    5	🔤 Fonts
        Microsoft fonts installation for compatibility (Arial, Times, Calibri, etc.)
        
    6	🎮 Launchers
        Installation of Steam, Heroic Games, Lutris, and Wine/Proton compatibility tools (Wine, Winetricks, Bottles, GameMode, MangoHud)
        
    7	🎬 Media Production
        OBS Studio (Flatpak) installation, virtual camera activation and EasyEffects (audio processor for PipeWire)
        
    8	🖥️ Hardware
        GPU-specific drivers and tools (AMD and NVIDIA), fan control (CoreCtrl, LACT, CoolerControl) and controller support (input group). Includes full Vulkan, Mesa 3D/RADV and VA-API/VDPAU for AMD, proprietary driver + NVENC/NVDEC + modesetting for NVIDIA, and overclocking adjustment (amdgpu.ppfeaturemask)
        
    9	📱 Waydroid
        Waydroid installation (Android on Linux) via COPR yanqiyu/waydroid, with GApps (Google Play Store), ARM translation (libndk/libhoudini), Magisk, Widevine DRM, Logitech SmartDock and waydroid-helper. Requires AMD or Intel GPU — does not work with NVIDIA
        
    10	📦 Recommended Apps
        Curated selection of useful everyday software, all via Flatpak: productivity (OnlyOffice, LibreOffice, Obsidian, Thunderbird, Okular, Joplin, Foliate), entertainment (Haruna, VLC, MPV, Spotify, Plex, Stremio), graphics tools (Krita, Inkscape, Pinta, GIMP, Darktable, FreeCAD, LibreCAD, Cura, Upscayl, XnView MP and the Affinity Suite), internet (Opera, Brave, Zen Browser, Edge, Chromium, Zoom, Vivaldi, Discord, Telegram, Signal), video editing and 3D modeling (Kdenlive, Shotcut, Pitivi, OpenShot, Avidemux, Lightworks, Drift, Blender), audio editing and creation (Ardour, LMMS, Audacity) and cloud sync (Rclone, Rclone Manager)


Maintenance Sessions (no order — separate page)

        🛠️ Maintenance
        Cache cleanup, kernel management (list/remove, with blocking of the kernel in use) and GRUB configuration (timeout and menu visibility)
        
        🔧 FOF Maintenance
        Update or complete uninstall of Fedora Only Fans


🎨 Technical Features

    🖥️ Dark and modern interface - Design focused on visual comfort
    🎨 Light/dark theme - Real-time switching, with saved preference
    🌐 Multilingual - Interface in Portuguese (BR), English and Spanish, with real-time switching
    📡 Real-time logs - Follow execution via Server-Sent Events (SSE)
    📋 Single log per session - Each session shares a unified log, in chronological order, with separators between executions
    🔒 Session lock - During an installation, other buttons in the same session are disabled to prevent simultaneous executions
    📊 Progress bar - Visualize task progress
    🔐 Secure authentication - Uses pkexec/kdesu (no password exposure)
    🛡️ Commands without authentication - Query commands (rpm -q, uname -r, etc.) don't ask for a password
    🐧 Multi-desktop support - KDE, GNOME, XFCE, Cinnamon, MATE, LXQt, LXDE
    🖱️ 100% visual - Never need to open the terminal
    💾 Persistence - State of each action saved automatically (local server + browser), without relying on any aggregate report
    📦 Native container - Application runs in WebKitGTK (no browser needed)
    🗂️ Native accordions - Uses <details>/<summary> to organize large blocks without cluttering the interface


🖥️ Supported Desktops

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


🚀 How does it work?

If you come from distributions like Linux Mint, Ubuntu or Zorin OS, you know Fedora is amazing, but requires some initial steps (like enabling RPM Fusion or setting up Flathub).


With FOF you:

    Visually select what you want to install or configure (media codecs, drivers, Flatpaks, DNF optimizations).
    
    Execute tasks directly through the integrated web interface, entering your administrator password only when requested by the system.
    
    Follow progress in real time with logs and progress bar.


💻 How to run FOF locally?

📦 Requirements

    Fedora Linux 44+
    Node.js 18+
    Browser (Firefox or Chromium) - optional, since the native container is preferred
    Internet connection


🚀 Quick Method

To start the panel, download all files from this repository, open the terminal in the folder where you saved the project and run the commands below:

```bash
# Give execution permission to the script
chmod +x iniciar_fof.sh

# Run the startup script
./iniciar_fof.sh
```

The script will:

    ✅ Check that all files are present
    ✅ Install Node.js 18+ (if needed)
    ✅ Install project dependencies
    ✅ Compile the native WebKitGTK container (if possible)
    ✅ Start the server on port 3000
    ✅ Open the interface in the native container or browser


🔧 Script Options:

```bash
# Debug mode (detailed logs)
./iniciar_fof.sh --debug

# Don't clean browser profiles
./iniciar_fof.sh --no-clean

# Show help
./iniciar_fof.sh --help
```

🖥️ Manual Method:

```bash
# 1. Install system dependencies
sudo dnf install -y nodejs npm

# 2. Install Node.js dependencies
npm install

# 3. Start the server
node server.js

# 4. Open the browser at http://localhost:3000
firefox http://localhost:3000
```

🛠️ Technologies Used

    HTML5 / CSS3
    Responsive and modern interface

    JavaScript
    Logic for requests to the local API + internationalization (PT-BR, EN, ES)

    Node.js
    Local backend server for secure process execution

    Server-Sent Events (SSE)
    Real-time logs

    Bash
    Startup script for the Fedora environment

    pkexec / kdesu
    Secure authentication

    WebKitGTK
    Native container to run the application


📂 Project Structure

```bash
Fedora-Only-Fans/
├── 📄 index.html              # Landing page (choose between setup/maintenance)
├── 📄 guiado.html             # Step-by-step setup (main sessions, in order)
├── 📄 manutencao.html         # Maintenance (kernels, cleanup, GRUB, FOF — no order)
├── 📄 style.css               # Shared CSS (global)
├── 📄 script.js               # Shared JS (global functions)
├── 📄 i18n.js                 # Internationalization module (PT-BR/EN/ES)
├── 📂 locales/                # Translation files
│   ├── 📄 pt-BR.json          # Portuguese (default)
│   ├── 📄 en.json             # English
│   └── 📄 es.json             # Spanish
├── 📄 00-boas-vindas.html     # Session 1 (HTML + session-specific JS)
├── 📄 01-restauracao.html     # Session 2 (HTML + session-specific JS)
├── 📄 02-otimizacao.html      # Session 3 (HTML + session-specific JS)
├── 📄 03-repositorios.html    # Session 4 (HTML + session-specific JS)
├── 📄 04-fontes.html          # Session 5 (HTML + session-specific JS)
├── 📄 05-launchers.html       # Session 6 (HTML + session-specific JS)
├── 📄 06-loja.html            # Session 7 (HTML + session-specific JS)
├── 📄 10-hardware.html        # Session 8 — Hardware (AMD, NVIDIA and Controllers)
├── 📄 11-waydroid.html        # Session 9 — Waydroid
├── 📄 09-softwares-uteis.html # Session 10 — Recommended Apps
├── 📄 07-manutencao.html      # Maintenance — kernels, cleanup, GRUB (no order)
├── 📄 08-fof-manutencao.html  # FOF Maintenance — update/uninstall (no order)
├── 📄 template-sessao.html    # Template for creating a new session
├── 📄 iniciar_fof.sh          # Startup script
├── 📄 iniciar_fof_compat.sh   # Compatibility mode (older GPUs)
├── 📄 install.sh              # System installer
├── 📄 server.js               # Node.js server
├── 📄 icone_app.png           # Application icon
├── 📄 package.json            # Node.js dependencies
├── 📄 README.md               # Documentation (PT-BR)
├── 📄 README.en.md            # Documentation (English)
├── 📄 README.es.md            # Documentación (Español)
├── 📄 LICENSE                 # GPL-3.0 License
├── 📄 .gitignore              # Files ignored by Git
├── 📄 Makefile                # Native container build
├── 📄 build-container.sh      # Container compilation script
└── 📂 src/                    # Container source code
    └── 📄 fof-container.c     # WebKitGTK container (C + GTK3)
```

🛡️ Security

    ✅ Secure authentication - Uses pkexec/kdesu instead of echo password | sudo
    ✅ Commands without authentication - Query commands don't ask for a password
    ✅ Input sanitization - Protection against command injection
    ✅ Detailed logs - Record of all operations
    ✅ Version validation - Checks that the Fedora version exists before upgrade


📋 Logs

Logs are saved automatically at:

```bash
/tmp/fof-YYYYMMDD-HHMMSS.log
```

To view logs in real time:

```bash
tail -f /tmp/fof-*.log
```

🎯 Roadmap

v1.0.0-rc.2 (Current) 🚧

    ✅ New Session 8 — Hardware (AMD, NVIDIA and Controllers)
    ✅ New Session 9 — Waydroid (Android on Linux)
    ✅ Reordering: Recommended Apps is now the last session (Session 10)
    ✅ Vulkan moved from Session 6 (Launchers) to Session 8 (Hardware)
    ✅ VA-API/VDPAU moved from Session 4 (Repositories) to Session 8 (Hardware)
    ✅ ProtonUp-Qt removed from FOF (Proton GE installation should be done via Steam)
    ✅ Native accordions (<details>) to organize blocks with many items
    ✅ Light theme with real-time switching
    ✅ Node.js version check (18+) during installation
    ✅ Fixed "Project GitHub" button (Affinity)
    ✅ Fixed "Open Rclone Manager" button
    ✅ Revert buttons only where the action is reversible
    ✅ HTML notices correctly rendered in EN/ES
    ✅ Orphan localization keys removed
    ✅ Authentication-free command list sanitized

v1.0.0 (Future) 🔮

    □ EasyEffects profile with presets
    □ ?


➕ How to add a new session

FOF has a central session registry (SESSOES, at the top of script.js) — it's the only place that needs to be edited to add a new session with new buttons.

    Copy template-sessao.html to NN-session-name.html (two digits + hyphen + lowercase name).
    Fill in the placeholders with the real content (title, buttons, commands).
    Add an entry to the SESSOES array in script.js, with the same id as the file (without .html) and the data-comando of your buttons. If the session is a task without order dependency with the rest (like maintenance ones), mark it with manutencao: true — it will appear in manutencao.html instead of the sequential flow in guiado.html.

Done — no need to edit guiado.html, manutencao.html, index.html or server.js. The position of your entry in the SESSOES array already defines the display order and the "Session N" number (calculated automatically) of the main sessions, and the server route accepts any session named in that pattern.

The template-sessao.html has comments pointing to existing sessions that serve as examples for more specific patterns (always-clickable button, multiple side-by-side buttons, dropdown, double confirmation flow, etc.). Important: FOF has no generic "undo" buttons — if an action has a meaningful "undo", model it as a second independent button, also always clickable (see grub-aplicar-recomendado/grub-restaurar-padrao in 07-manutencao.html and the amdgpu-overclock pair in 10-hardware.html).

🌐 How to add a new language

    Copy locales/pt-BR.json to locales/XX.json (language code).
    Translate all values (keep the keys identical).
    Add the language code to LANGS_DISPONIVEIS in i18n.js and to LANGS_SUPORTADOS in server.js.
    Add an <option> to the `opcoes` array inside criarSeletorIdioma() in i18n.js.

🤝 How to contribute

All help is very welcome! If you want to suggest new Fedora optimizations, new essential Flatpaks or improve the interface:

1. **Fork the project**

2. **Create a branch for your modification:**
   ```bash
   git checkout -b feature/new-optimization
   ```

3. **Commit your changes:**
   ```bash
   git commit -m 'Add new optimization'
   ```

4. **Push to the branch:**
   ```bash
   git push origin feature/new-optimization
   ```

5. **Open a Pull Request**


🐛 Report Issues

Found a bug? Open an issue on GitHub: Project Issues

Required Information:

    Fedora version
    Desktop Environment (KDE, GNOME, XFCE, etc.)
    Server logs (/tmp/fof-*.log)
    Steps to reproduce the problem

⚠️ Legal Notice

    THIS PROJECT IS IN DEVELOPMENT AND ITS STATUS IS CONSIDERED ALPHA.
    Use in production environments is not recommended unless you know what you're doing. Use at your own risk!
    Always back up your data before running system changes.

📄 License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.


## 👤 Author

**VitãoTub**
- 🌐 [Website](https://www.vitaotub.com)
- 🐙 [GitHub](https://github.com/vitaotub)


## 🙏 Acknowledgements

- [Fedora Project](https://getfedora.org/)
- [RPM Fusion](https://rpmfusion.org/)
- [Flathub](https://flathub.org/)


## ⭐ Support

If you liked the project, leave a ⭐ on GitHub!


**Made with ❤️ for the Fedora community**
