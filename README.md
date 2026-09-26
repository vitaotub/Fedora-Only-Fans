# <img src="icone_app.png" width="55" align="center"> Fedora Only Fans (FOF)

**🌐 Idioma:** Português (BR) | [English](README.en.md) | [Español](README.es.md)

![Autor](https://img.shields.io/badge/Criador-Vit%C3%A3oTub-blue?style=flat-square)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-v1.0.0--09252026-orange?style=flat-square)
![Fedora](https://img.shields.io/badge/Fedora-44+-294172?style=flat-square&logo=fedora)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-GPL--3.0-green?style=flat-square)
![Idiomas](https://img.shields.io/badge/Idiomas-PT--BR%20%7C%20EN%20%7C%20ES-3c67e3?style=flat-square)
![Status](https://img.shields.io/badge/Status-Release%20Candidate-orange?style=flat-square)
[![Instalar](https://img.shields.io/badge/🚀_Instalar_com_um_comando-Fedora_Only_Fans-3c67e3?style=flat-square)](https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh)

> Deixando o seu Fedora pronto para o "play" de forma visual, rápida e sem complicação.

---

## 🚀 Instalação em 1 Comando

Copie o comando abaixo, abra o Terminal, cole o comando no Terminal (CTRL + SHIFT + V) e aperte ENTER:

```bash
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh)
```

Isso é tudo! O script cuida de todo o resto. 🎉

O instalador irá:

    ✅ Verificar se você está no Fedora
    ✅ Instalar dependências (Node.js 18+, npm, git, curl)
    ✅ Baixar o projeto do GitHub
    ✅ Instalar dependências Node.js
    ✅ Criar o comando fof no terminal
    ✅ Criar atalho no menu de aplicativos
    ✅ Compilar o container nativo WebKitGTK (opcional)

📦 Comandos Disponíveis

Após a instalação:

```bash
# Iniciar o FOF (modo normal)
fof

# Iniciar o FOF (modo compatibilidade - para GPUs antigas)
fof-compat

# Atualizar para a versão mais recente
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh) --update

# Desinstalar completamente
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh) --uninstall
```

---

📖 Sobre o Projeto

O Fedora Only Fans é um painel de automação interativo com interface web projetado para usuários iniciantes (e também para os avançados que buscam praticidade).

O objetivo é transformar uma instalação limpa do Fedora em um sistema operacional completo, com todos os codecs, repositórios, drivers e ferramentas essenciais ativadas — tudo visualmente e sem precisar usar o terminal.

---

🧭 Configuração e Manutenção

O FOF tem dois pontos de entrada, com propósitos diferentes:

🧭 Iniciar Configuração: passo a passo, uma sessão por vez, com navegação intuitiva (Anterior/Próximo) e um menu fixo no topo mostrando todas as sessões disponíveis. A ordem importa pro resultado final, então esta é a única forma de percorrer as sessões de configuração do Fedora.

🛠️ Manutenção: tarefas avulsas que não dependem de ordem entre si nem com o resto da configuração. Ficam numa página à parte, acessível a qualquer momento, organizadas em dois acordeões: Manutenção do Fedora (limpeza, kernels, GRUB) e Manutenção do FOF (atualizar, desinstalar).

Cada botão lembra seu próprio estado (executado ou pendente), então fechar e reabrir o FOF (ou reiniciar o computador) sempre mostra exatamente onde você parou.

---

✨ Funcionalidades Completas

Sessões da Configuração (em ordem)

    1	👋 Boas-vindas
        Apresentação do FOF (o que é, para que foi criado, o que você ganha e o que ele não faz) + atualização completa do sistema Fedora (dnf upgrade --refresh)
        
    2	💾 Restauração
        Instalação do Btrfs-Assistant para gerenciamento de snapshots do sistema
        
    3	⚙️ Otimização
        Ajuste de velocidade do DNF, idioma PT-BR, corretor ortográfico e correção de dual-boot
        
    4	📦 Repositórios
        Ativação do RPM Fusion, configuração do Flatpak/Flathub, codecs multimídia e extras tainted
        
    5	🔤 Fontes
        Instalação de fontes Microsoft para compatibilidade (Arial, Times, Calibri, etc.)
        
    6	🖥️ Hardware
        Drivers e ferramentas específicas de GPU (AMD e NVIDIA), controle de fans (CoreCtrl, LACT, CoolerControl) e suporte a controles (grupo input). Inclui Vulkan completo, Mesa 3D/RADV e VA-API/VDPAU para AMD, driver proprietário + NVENC/NVDEC + modesetting para NVIDIA, e ajuste de overclocking (amdgpu.ppfeaturemask)
        
    7	🎮 Gaming
        Sessão dedicada a jogos, organizada em vários blocos colapsáveis:
        • Launchers (Steam, Heroic, Lutris)
        • Compatibilidade (Wine, Winetricks, Bottles, NTSYNC)
        • Desempenho e Monitoramento (GameMode, MangoHud, Goverlay, Gamescope)
        • Gaming Avançado (ProtonUp-Qt, vkBasalt, presets de GameMode+MangoHud, Gamescope Session, teste de controle)
        • Emuladores (RetroArch + cores recomendados, Dolphin, PCSX2, RPCS3, Duckstation — sem emulador de Nintendo Switch por questões legais)
        • Rede para Jogos Online (QoS Cake anti-bufferbloat, ajuste de MTU, teste de bufferbloat)
        • Anti-cheat Awareness (painel informativo sobre quais anti-cheats funcionam no Linux)
        • Dicas e Truques
        
    8	🎬 Produção Multimídia
        Ferramentas para gravar, editar, transmitir e produzir conteúdo:
        • OBS Studio + Câmera Virtual
        • EasyEffects (processador de áudio para PipeWire)
        • Streaming Ready (templates de cena do OBS, Streamdeck UI, NDI Tools)
        • Roteamento de Áudio (qpwgraph para PipeWire)
        • Presets de Vídeo (HandBrake + presets, templates de projeto do Kdenlive)
        • Captura de Tela (wf-recorder em Wayland, SimpleScreenRecorder em X11)
        
    9	📱 Waydroid
        Instalação do Waydroid (Android no Linux) via COPR yanqiyu/waydroid, com GApps (Google Play Store), tradução ARM (libndk/libhoudini), Magisk, Widevine DRM, Logitech SmartDock e waydroid-helper (via COPR oficial cuteneko/waydroid-helper). Requer GPU AMD ou Intel — não funciona com NVIDIA
        
    10	📦 Aplicativos Recomendados
        Curadoria de softwares úteis para o dia-a-dia, todos via Flatpak: produtividade (OnlyOffice, LibreOffice, Obsidian, Thunderbird, Okular, Joplin, Foliate), entretenimento (Haruna, VLC, MPV, Spotify, Plex, Stremio), ferramentas gráficas (Krita, Inkscape, Pinta, GIMP, Darktable, FreeCAD, LibreCAD, Cura, Upscayl, XnView MP e a Suíte Affinity), internet (Opera, Brave, Zen Browser, Edge, Chromium, Zoom, Vivaldi, Discord, Telegram, Signal), edição de vídeo e modelagem 3D (Kdenlive, Shotcut, Pitivi, OpenShot, Avidemux, Lightworks, Drift, Blender), edição e criação de áudio (Ardour, LMMS, Audacity) e sincronização em nuvem (Rclone, Rclone Manager)
        
    11	🏠 Casa Pronta
        Configurações para deixar o Fedora pronto para uso doméstico, em blocos independentes:
        • Impressora e Scanner (CUPS + Avahi + system-config-printer)
        • Compartilhamento de Arquivos (Samba para Windows, LocalSend para celular, Warpinator para rede Linux)
        • Gerenciador de Senhas (KeePassXC offline)
        • PDF e OCR (Okular + Tesseract + idiomas PT/EN)
        
    12	📊 Diagnóstico
        Painel visual do estado do sistema, tudo em blocos colapsáveis:
        • Painel do Sistema (CPU, RAM, disco, uptime, firewall, SELinux, processos, boot)
        • Top 5 Processos (por CPU e por RAM)
        • Partições (uso, livre, ponto de montagem)
        • Análise Visual de Disco (Baobab)
        • Saúde do Hardware: SMART (smartmontools) e temperaturas (lm_sensors)
        • Logs e Erros Recentes (journal agrupado por origem nas últimas 24h)
        
    13	📋 Central FOF
        Painel central do próprio FOF:
        • Dashboard de Estado (versão, progresso, uptime, tema, idioma, Fedora, CPU, RAM, disco, firewall, SELinux)
        • Busca Global (Ctrl+K) — encontra qualquer sessão, botão ou termo
        • Wizard de Perfil — sugere sessões relevantes baseado no seu uso
        • Changelog — histórico de versões com link para as releases no GitHub
        
    14	🐧 Fedora
        Informações e ferramentas específicas do Fedora:
        • Versão do Fedora (verificação de compatibilidade)
        • Fedora Atomic / Silverblue (detecção de sistema imutável)
        • SELinux (status, avisos AVC recentes, setroubleshoot em português claro)


Sessões de Manutenção (sem ordem — página à parte)

        🛠️ Manutenção do Fedora
        Limpeza de cache e resíduos, gerenciamento de kernels (listar/remover, com bloqueio do kernel em uso) e configuração do GRUB (timeout e visibilidade do menu)
        
        🔧 Manutenção do FOF
        Verificação automática de atualizações (com badge ⬆️ no header quando há nova versão), atualização com popup de confirmação pós-update e desinstalação completa do Fedora Only Fans


🎨 Características Técnicas

    🖥️ Interface escura e moderna - Design pensado para conforto visual
    🎨 Tema claro/escuro - Alternância em tempo real, com preferência salva
    🌐 Multilíngue - Interface em Português (BR), Inglês e Espanhol, com troca em tempo real
    📡 Logs em tempo real - Acompanhe a execução via Server-Sent Events (SSE)
    📋 Log único por sessão - Cada sessão compartilha um log unificado, em ordem cronológica, com separadores entre execuções
    🔓 Log expandido por padrão - Os logs de cada sessão já nascem abertos; o usuário pode recolher clicando no cabeçalho
    📏 Altura uniforme dos logs - Todas as sessões usam a mesma altura de log, mantendo a interface consistente
    🔍 Busca global (Ctrl+K) - Encontra qualquer sessão, botão ou termo em qualquer página do FOF
    📊 Dashboard de estado - Painel central com informações do FOF e do sistema
    🧭 Wizard de perfil - Sugere sessões relevantes baseado no seu uso (sem esconder nenhuma sessão)
    🔔 Verificação automática de atualizações - O FOF consulta o GitHub Releases ao iniciar e mostra um badge ⬆️ quando há nova versão disponível
    ✅ Popup pós-atualização - Após atualizar o FOF, um alerta avisa para reiniciar o app e aplicar as mudanças
    🔒 Bloqueio de sessão - Durante uma instalação, os outros botões da mesma sessão ficam desabilitados para evitar execuções simultâneas
    📊 Barra de progresso - Visualize o andamento das tarefas
    🔐 Autenticação segura - Usa pkexec/kdesu (sem expor senhas)
    🛡️ Comandos sem autenticação - Comandos de consulta (rpm -q, uname -r, etc.) não solicitam senha
    🐧 Suporte a múltiplos desktops - KDE, GNOME, XFCE, Cinnamon, MATE, LXQt, LXDE
    🖱️ 100% visual - Nunca precisa abrir o terminal
    💾 Persistência - Estado de cada ação salvo automaticamente (servidor local + navegador), sem depender de nenhum relatório agregado
    📦 Container nativo - Aplicação roda em WebKitGTK (sem necessidade de navegador)
    🗂️ Acordeões nativos - Uso de <details>/<summary> para organizar blocos grandes sem poluir a interface
    🏷️ Versão centralizada - A versão do FOF vive num único lugar (package.json) e é lida em runtime por todos os componentes


🖥️ Desktops Suportados

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


🚀 Como funciona?

Se você veio de distribuições como Linux Mint, Ubuntu ou Zorin OS, sabe que o Fedora é incrível, mas exige alguns passos iniciais (como ativar o RPM Fusion ou configurar o Flathub).


Com o FOF você:

    Seleciona visualmente o que deseja instalar ou configurar (Codecs de mídia, Drivers, Flatpaks, Otimizações do DNF).
    
    Executa as tarefas diretamente através da interface web integrada, digitando sua senha de administrador apenas quando solicitado pelo sistema.
    
    Acompanha o progresso em tempo real com logs e barra de progresso.
    
    Recebe aviso automático quando há uma nova versão do FOF disponível.
    
    Usa a Busca Global (Ctrl+K) para encontrar rapidamente qualquer sessão, botão ou termo.
    
    Consulta o Dashboard de Estado para ver o estado atual do sistema sem abrir o terminal.


💻 Como Rodar o FOF localmente?

📦 Requisitos

    Fedora Linux 44+
    Node.js 18+
    Navegador (Firefox ou Chromium) - opcional, pois o container nativo é preferido
    Conexão com internet


🚀 Método Rápido

Para inicializar o painel, baixe todos os arquivos deste repositório, abra o terminal na pasta onde salvou o projeto e execute os comandos abaixo:

```bash
# Dê permissão de execução ao script
chmod +x iniciar_fof.sh

# Execute o script de inicialização
./iniciar_fof.sh
```

O script irá:

    ✅ Verificar se todos os arquivos estão presentes
    ✅ Instalar o Node.js 18+ (se necessário)
    ✅ Instalar as dependências do projeto
    ✅ Compilar o container nativo WebKitGTK (se possível)
    ✅ Iniciar o servidor na porta 3000
    ✅ Abrir a interface no container nativo ou navegador


🔧 Opções do Script:

```bash
# Modo debug (logs detalhados)
./iniciar_fof.sh --debug

# Não limpar perfis do navegador
./iniciar_fof.sh --no-clean

# Ver ajuda
./iniciar_fof.sh --help
```

🖥️ Método Manual:

```bash
# 1. Instale as dependências do sistema
sudo dnf install -y nodejs npm

# 2. Instale as dependências do Node.js
npm install

# 3. Inicie o servidor
node server.js

# 4. Abra o navegador em http://localhost:3000
firefox http://localhost:3000
```

🛠️ Tecnologias Utilizadas

    HTML5 / CSS3
    Interface responsiva e moderna

    JavaScript
    Lógica de requisições à API local + internacionalização (PT-BR, EN, ES) + verificação de atualizações via GitHub Releases API + busca global + dashboard

    Node.js
    Servidor backend local para execução segura de processos

    Server-Sent Events (SSE)
    Logs em tempo real

    Bash
    Script de inicialização do ambiente no Fedora

    pkexec / kdesu
    Autenticação segura

    WebKitGTK
    Container nativo para rodar a aplicação


📂 Estrutura do Projeto

```bash
Fedora-Only-Fans/
├── 📄 index.html              # Landing page (escolha entre configuração/manutenção)
├── 📄 guiado.html             # Configuração passo a passo (sessões principais, em ordem)
├── 📄 manutencao.html         # Manutenção (Fedora + FOF em 2 acordeões, sem ordem)
├── 📄 style.css               # CSS compartilhado (global)
├── 📄 script.js               # JS compartilhado (funções globais + atualizações + busca + dashboard)
├── 📄 i18n.js                 # Módulo de internacionalização (PT-BR/EN/ES)
├── 📂 locales/                # Arquivos de tradução
│   ├── 📄 pt-BR.json          # Português (padrão)
│   ├── 📄 en.json             # Inglês
│   └── 📄 es.json             # Espanhol
├── 📄 00-boas-vindas.html     # Sessão 1 — Boas-vindas + Atualização (em acordeões)
├── 📄 01-restauracao.html     # Sessão 2 — Restauração de sistema
├── 📄 02-otimizacao.html      # Sessão 3 — Otimização do sistema e idioma
├── 📄 03-repositorios.html    # Sessão 4 — Repositórios, codecs e aceleração gráfica
├── 📄 04-fontes.html          # Sessão 5 — Fontes para compatibilidade
├── 📄 05-hardware.html        # Sessão 6 — Hardware (AMD, NVIDIA e Controles)
├── 📄 06-gaming.html          # Sessão 7 — Gaming (launchers, Wine/Proton, emuladores, rede, anti-cheat)
├── 📄 07-loja.html            # Sessão 8 — Produção Multimídia (OBS, streaming, áudio)
├── 📄 08-waydroid.html        # Sessão 9 — Waydroid (Android no Linux)
├── 📄 09-softwares-uteis.html # Sessão 10 — Aplicativos Recomendados
├── 📄 10-casa-pronta.html     # Sessão 11 — Casa Pronta (impressora, arquivos, senhas, PDF+OCR)
├── 📄 11-diagnostico.html     # Sessão 12 — Diagnóstico (painel do sistema, hardware, logs)
├── 📄 12-central-fof.html     # Sessão 13 — Central FOF (dashboard, busca, wizard, changelog)
├── 📄 13-fedora.html          # Sessão 14 — Fedora (versão, atomic, SELinux)
├── 📄 template-sessao.html    # Molde pra criar uma sessão nova
├── 📄 iniciar_fof.sh          # Script de inicialização
├── 📄 iniciar_fof_compat.sh   # Modo compatibilidade (GPUs antigas)
├── 📄 install.sh              # Instalador do sistema
├── 📄 server.js               # Servidor Node.js
├── 📄 icone_app.png           # Ícone do aplicativo
├── 📄 package.json            # Dependências Node.js + versão do FOF (fonte única)
├── 📄 README.md               # Documentação (PT-BR)
├── 📄 README.en.md            # Documentation (English)
├── 📄 README.es.md            # Documentación (Español)
├── 📄 LICENSE                 # Licença GPL-3.0
├── 📄 .gitignore              # Arquivos ignorados pelo Git
├── 📄 Makefile                # Build do container nativo
├── 📄 build-container.sh      # Script de compilação do container
└── 📂 src/                    # Código fonte do container
    └── 📄 fof-container.c     # Container WebKitGTK (C + GTK3)
```

🛡️ Segurança

    ✅ Autenticação segura - Usa pkexec/kdesu em vez de echo senha | sudo
    ✅ Comandos sem autenticação - Comandos de consulta não solicitam senha
    ✅ Sanitização de entrada - Proteção contra injeção de comandos
    ✅ Logs detalhados - Registro de todas as operações
    ✅ Validação de versão - Verifica se a versão do Fedora existe antes do upgrade
    ✅ Rate limiting - Limite de 1.5s por idComando (evita loops acidentais)
    ✅ Validação de idComando - Aceita apenas letras, números, hífen e underline


📋 Logs

Os logs são salvos automaticamente em:

```bash
/tmp/fof-YYYYMMDD-HHMMSS.log
```

Logs com mais de 7 dias são removidos automaticamente na inicialização do servidor.

Para visualizar os logs em tempo real:

```bash
tail -f /tmp/fof-*.log
```

🎯 Roadmap

v1.0.0-09252026 (Atual) 🚧

    ✅ Versão centralizada em package.json (fonte única da verdade)
    ✅ Nova sessão 11 — Casa Pronta (impressora, arquivos, senhas, PDF+OCR)
    ✅ Nova sessão 12 — Diagnóstico (painel do sistema, hardware, logs)
    ✅ Nova sessão 13 — Central FOF (dashboard, busca Ctrl+K, wizard, changelog)
    ✅ Nova sessão 14 — Fedora (versão, atomic, SELinux)
    ✅ Gaming expandido: Gaming Avançado, Emuladores, Rede para Jogos Online, Anti-cheat Awareness
    ✅ Produção Multimídia expandida: Streaming Ready, roteamento PipeWire, presets de vídeo, captura
    ✅ Manutenção consolidada em 2 acordeões (Fedora + FOF) na página manutencao.html
    ✅ Menu fixo de sessões no topo (substitui as bolinhas coloridas)
    ✅ Busca global Ctrl+K em qualquer página
    ✅ Dashboard de estado centralizado
    ✅ Novos endpoints no server.js: /system-info, /top-processes, /disk-usage, /journal-errors
    ✅ Log rotation (7 dias) automática
    ✅ Rate limiting (1.5s por idComando)

v1.0.0-09232026 ✅

    ✅ Verificação automática de atualizações via GitHub Releases API (badge ⬆️ no header)
    ✅ Popup de confirmação pós-atualização (avisa para reiniciar o FOF)
    ✅ Sessão 00 reformulada em 2 acordeões (Boas-Vindas + Atualizações de Sistema)
    ✅ Sessão Gaming com aviso detalhado sobre NTSYNC
    ✅ Logs de sessão expandidos por padrão
    ✅ Altura uniforme dos logs em todas as sessões (120–200px)
    ✅ Header com controles inline ao título (idioma, tema e voltar ao início na mesma linha)
    ✅ Botão "Voltar ao início" com ícone SVG de casa
    ✅ Ajustes de layout e limpeza de CSS

v1.0.0 (Futuro) 🔮

    □ Snapshots Btrfs automáticos antes de sessões críticas
    □ Preview de comandos antes de executar
    □ Export/import de configuração (migrar para outro computador)
    □ Reportar problema com logs anexados (gera zip + abre issue pré-preenchida)


➕ Como adicionar uma sessão nova

O FOF tem um registro central de sessões (SESSOES, no topo de script.js) — é o único lugar que precisa ser editado pra adicionar uma sessão nova com botões novos.

    Copie template-sessao.html para NN-nome-da-sessao.html (dois dígitos + hífen + nome em minúsculas).
    Preencha os placeholders com o conteúdo real (título, botões, comandos).
    Adicione uma entrada no array SESSOES em script.js, com o mesmo id do arquivo (sem .html) e os data-comando dos seus botões.

Pronto — não precisa editar guiado.html, manutencao.html, index.html nem server.js. A posição da sua entrada no array SESSOES já define a ordem de exibição e o número "Sessão N" (calculado automaticamente) das sessões principais, e a rota do servidor aceita qualquer sessão nomeada nesse padrão.

O template-sessao.html traz comentários apontando pra sessões existentes que servem de exemplo pra padrões mais específicos (botão sempre clicável, vários botões lado a lado, dropdown, fluxo com confirmação dupla, etc.). Importante: o FOF não tem botões de "desfazer" genéricos — se uma ação tiver um "desfazer" com sentido, modele como um segundo botão independente, também sempre clicável (ver grub-aplicar-recomendado/grub-restaurar-padrao em manutencao.html e o par amdgpu-overclock em 05-hardware.html).

🌐 Como adicionar um idioma novo

    Copie locales/pt-BR.json para locales/XX.json (código do idioma).
    Traduza todos os valores (mantenha as chaves idênticas).
    Adicione o código do idioma em LANGS_DISPONIVEIS no i18n.js e em LANGS_SUPORTADOS no server.js.
    Adicione uma <option> no array `opcoes` dentro de criarSeletorIdioma() em i18n.js.

🏷️ Como lançar uma nova versão do FOF

A versão do FOF vive em um único arquivo: package.json. Ao lançar uma release:

    Edite package.json → "version": "1.0.0-<NOVA_VERSAO>"
    Edite i18n.js → var FALLBACK_VERSION = '1.0.0-<NOVA_VERSAO>' (única exceção, usada como cache-buster antes do /info responder)
    Crie a tag/release no GitHub com o mesmo nome (ex.: v1.0.0-<NOVA_VERSAO>)

Tudo o mais é automático:

    server.js lê a versão do package.json em runtime (endpoint /info)
    install.sh e iniciar_fof.sh leem o banner da versão do package.json
    Makefile e build-container.sh passam a versão ao gcc via -DFOF_VERSION
    O container C (fof-container) mostra a versão injetada no --help
    O badge ⬆️ do FOF compara com a tag do GitHub Releases automaticamente

🤝 Como contribuir

Toda ajuda é muito bem-vinda! Se você quer sugerir novas otimizações para o Fedora, novos Flatpaks essenciais ou melhorar a interface:

1. **Faça um Fork do projeto**

2. **Crie uma branch para sua modificação:**
   ```bash
   git checkout -b feature/nova-otimizacao
   ```

3. **Commit suas mudanças:**
   ```bash
   git commit -m 'Adiciona nova otimização'
   ```

4. **Push para a branch:**
   ```bash
   git push origin feature/nova-otimizacao
   ```

5. **Abra um Pull Request**


🐛 Reportar Problemas

Encontrou um bug? Abra uma issue no GitHub: Issues do Projeto

Informações Necessárias:

    Versão do Fedora
    Desktop Environment (KDE, GNOME, XFCE, etc.)
    Logs do servidor (/tmp/fof-*.log)
    Passos para reproduzir o problema

⚠️ Aviso Legal

    ESTE PROJETO ESTÁ EM DESENVOLVIMENTO E SEU STATUS É CONSIDERADO ALPHA.
    Não é recomendada a utilização em ambiente de produção, a menos que você saiba o que está fazendo. Utilize por sua conta e risco!
    Sempre faça backup dos seus dados antes de executar alterações no sistema.

📄 Licença

Este projeto está licenciado sob a **GPL-3.0 License** - veja o arquivo [LICENSE](LICENSE) para detalhes.


## 👤 Autor

**VitãoTub**
- 🌐 [Website](https://www.vitaotub.com)
- 🐙 [GitHub](https://github.com/vitaotub)


## 🙏 Agradecimentos

- [Fedora Project](https://getfedora.org/)
- [RPM Fusion](https://rpmfusion.org/)
- [Flathub](https://flathub.org/)


## ⭐ Suporte

Se você gostou do projeto, deixe uma ⭐ no GitHub!


**Feito com ❤️ para a comunidade Fedora**
