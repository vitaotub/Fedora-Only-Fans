# <img src="icone_app.png" width="55" align="center"> Fedora Only Fans (FOF)

![Autor](https://img.shields.io/badge/Criador-Vit%C3%A3oTub-blue?style=flat-square)
![Versão](https://img.shields.io/badge/Versão-v0.7.0--alpha-orange?style=flat-square)
![Fedora](https://img.shields.io/badge/Fedora-40+-294172?style=flat-square&logo=fedora)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-GPL--3.0-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=flat-square)
[![Instalar](https://img.shields.io/badge/🚀_Instalar_com_um_comando-Fedora_Only_Fans-3c67e3?style=flat-square)](https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh)

> Deixando o seu Fedora pronto para o "play" de forma visual, rápida e sem complicação.

---

## 🚀 Instalação em 1 Comando

```bash
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh)

```

Isso é tudo! O script cuida de todo o resto. 🎉

O instalador irá:

✅ Verificar se você está no Fedora
✅ Instalar dependências (Node.js, npm, git, curl)
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

## 📖 Sobre o Projeto

O Fedora Only Fans é um painel de automação interativo com interface web projetado para usuários iniciantes (e também para os avançados que buscam praticidade).

O objetivo é transformar uma instalação limpa do Fedora em um sistema operacional completo, com todos os codecs, repositórios, drivers e ferramentas essenciais ativadas — tudo visualmente e sem precisar usar o terminal.

---

🧭 Modos de Uso
Modo	Descrição	Ideal para
🧭 Modo Guiado	Passo a passo, uma sessão por vez, com explicações detalhadas e navegação intuitiva (Anterior/Próximo/Pular). Possui barra de progresso e resumo final.	Iniciantes
⚡ Modo Avançado	Todas as sessões em uma única página com controle total sobre cada ação e botões de reversão individuais.	Usuários experientes

✨ Funcionalidades Completas
Sessão	Funcionalidade	Descrição
1	👋 Boas-vindas	Atualização completa do sistema Fedora (dnf upgrade --refresh)
2	💾 Restauração	Instalação do Btrfs-Assistant para gerenciamento de snapshots do sistema
3	⚙️ Otimização	Ajuste de velocidade do DNF, idioma PT-BR, corretor ortográfico e correção de dual-boot
4	📦 Repositórios	Ativação do RPM Fusion, configuração do Flatpak/Flathub, codecs multimídia, extras tainted e aceleração gráfica VA-API
5	🔤 Fontes	Instalação de fontes Microsoft para compatibilidade (Arial, Times, Calibri, etc.)
6	🎮 Launchers	Instalação de Steam, Heroic Games, Lutris, ProtonUp-Qt e drivers Vulkan para AMD
7	🛍️ Loja	Abertura da central de aplicativos, instalação do OBS Studio (Flatpak), ativação de câmera virtual e instalação do EasyEffects
8	🛠️ Manutenção	Limpeza de cache, gerenciamento de kernels, upgrade de versão do Fedora e sincronização com canal estável (distro-sync)
9	🔧 Manutenção FOF	Atualização ou desinstalação completa do Fedora Only Fans

🎨 Características Técnicas

    🖥️ Interface escura e moderna - Design pensado para conforto visual
    📡 Logs em tempo real - Acompanhe a execução via Server-Sent Events (SSE)
    📊 Barra de progresso - Visualize o andamento das tarefas
    🔐 Autenticação segura - Usa pkexec/kdesu (sem expor senhas)
    🛡️ Comandos sem autenticação - Comandos de consulta (rpm -q, uname -r, etc.) não solicitam senha
    🐧 Suporte a múltiplos desktops - KDE, GNOME, XFCE, Cinnamon, MATE, LXQt, LXDE
    🖱️ 100% visual - Nunca precisa abrir o terminal
    💾 Persistência - Progresso salvo automaticamente no navegador (localStorage)
    🔄 Botões de reversão - Desfaça alterações com um clique
    📦 Container nativo - Aplicação roda em WebKitGTK (sem necessidade de navegador)
    📸 Gerenciador de Snapshots Btrfs - Módulo integrado para gerenciar snapshots do sistema
    
🖥️ Desktops Suportados
Desktop	Central de Apps	Status
KDE Plasma	Discover	✅
GNOME	GNOME Software	✅
XFCE	AppFinder	✅
Cinnamon	Software Center	✅
MATE	Software Boutique	✅
LXQt	LXQt Software Center	✅
LXDE	LXDE Software Center	✅

🚀 Como funciona?

Se você veio de distribuições como Linux Mint, Ubuntu ou Zorin OS, sabe que o Fedora é incrível, mas exige alguns passos iniciais (como ativar o RPM Fusion ou configurar o Flathub).

Com o FOF você:

    Seleciona visualmente o que deseja instalar ou configurar (Codecs de mídia, Drivers, Flatpaks, Otimizações do DNF).
    Executa as tarefas diretamente através da interface web integrada, digitando sua senha de administrador apenas quando solicitado pelo sistema.
    Acompanha o progresso em tempo real com logs e barra de progresso.

💻 Como Rodar o FOF localmente?
📦 Requisitos

    Fedora Linux 40+
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
✅ Instalar o Node.js (se necessário)
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
Tecnologia	Finalidade
HTML5 / CSS3	Interface responsiva e moderna
JavaScript	Lógica de requisições à API local
Node.js	Servidor backend local para execução segura de processos
Server-Sent Events (SSE)	Logs em tempo real
Bash	Script de inicialização do ambiente no Fedora
pkexec / kdesu	Autenticação segura
WebKitGTK	Container nativo para rodar a aplicação
Btrfs / Snapper	Gerenciamento de snapshots do sistema

📂 Estrutura do Projeto
```bash
Fedora-Only-Fans/
├── 📄 index.html              # Landing page (escolha do modo)
├── 📄 guiado.html             # Modo Guiado (passo a passo)
├── 📄 avancado.html           # Modo Avançado (todas as sessões)
├── 📄 style.css               # CSS compartilhado
├── 📄 script.js               # JS compartilhado (com todas as correções)
├── 📄 00-boas-vindas.html     # Sessão 1
├── 📄 01-restauracao.html     # Sessão 2
├── 📄 02-otimizacao.html      # Sessão 3
├── 📄 03-repositorios.html    # Sessão 4
├── 📄 04-fontes.html          # Sessão 5
├── 📄 05-launchers.html       # Sessão 6
├── 📄 06-loja.html            # Sessão 7
├── 📄 07-manutencao.html      # Sessão 8
├── 📄 08-fof-manutencao.html  # Sessão 9
├── 📄 iniciar_fof.sh          # Script de inicialização
├── 📄 iniciar_fof_compat.sh   # Modo compatibilidade (GPUs antigas)
├── 📄 install.sh              # Instalador do sistema
├── 📄 server.js               # Servidor Node.js
├── 📄 icone_app.png           # Ícone do aplicativo
├── 📄 package.json            # Dependências Node.js
├── 📄 README.md               # Documentação
├── 📄 LICENSE                 # Licença GPL-3.0
├── 📄 .gitignore              # Arquivos ignorados pelo Git
├── 📂 src/                    # Código fonte do container
│   └── 📄 fof-container.c     # Container WebKitGTK
└── 📂 btrfs-module/           # Módulo de gerenciamento de snapshots
    ├── 📄 index.html          # Página do gerenciador
    ├── 📄 btrfs-script.js     # Lógica do gerenciador
    ├── 📄 btrfs-style.css     # Estilos do gerenciador
    └── 📄 README.md           # Documentação do módulo
```

🛡️ Segurança

    ✅ Autenticação segura - Usa pkexec/kdesu em vez de echo senha | sudo
    ✅ Comandos sem autenticação - Comandos de consulta não solicitam senha
    ✅ Sanitização de entrada - Proteção contra injeção de comandos
    ✅ Logs detalhados - Registro de todas as operações
    ✅ Validação de versão - Verifica se a versão do Fedora existe antes do upgrade
    
📋 Logs

Os logs são salvos automaticamente em:
```bash
/tmp/fof-YYYYMMDD-HHMMSS.log
```
Para visualizar os logs em tempo real:
```bash
tail -f /tmp/fof-*.log
```

🎯 Roadmap
v0.7.0 (Atual) ✅

    ✅ Modo Guiado com navegação passo a passo
    ✅ Modo Avançado com todas as sessões
    ✅ Botões de reversão para todas as ações
    ✅ Persistência via localStorage
    ✅ Correção de todos os bugs conhecidos
    ✅ Gerenciador de Snapshots Btrfs integrado
    ✅ Instalação do OBS Studio via Flatpak
    ✅ Remoção de repositórios Flatpak do Fedora (fedora e fedora-testing)
    ✅ Sincronização com canal estável (distro-sync)
    ✅ Correção da Central de Apps (sem autenticação)
    ✅ Launchers com sistema de toggle (instalar/desinstalar)
    ✅ Progresso com timeout de segurança
    ✅ Modo Compatibilidade para GPUs antigas

v0.8.0 (Futuro) 🔮

    □ Localização
    □ Perfil EasyEffects

🤝 Como contribuir

Toda ajuda é muito bem-vinda! Se você quer sugerir novas otimizações para o Fedora, novos Flatpaks essenciais ou melhorar a interface:

    Faça um Fork do projeto

    Crie uma branch para sua modificação:
```bash
    git checkout -b feature/nova-otimizacao
```
    Commit suas mudanças:
```bash
    git commit -m 'Adiciona nova otimização'
```
    Push para a branch:
```bash
    git push origin feature/nova-otimizacao
```
    Abra um Pull Request

🐛 Reportar Problemas

Encontrou um bug? Abra uma issue no GitHub:
Issues do Projeto

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

Este projeto está licenciado sob a GPL-3.0 License - veja o arquivo LICENSE para detalhes.

👤 Autor

VitãoTub

    🌐 Website
    🐙 GitHub
    
🙏 Agradecimentos

    Fedora Project
    RPM Fusion
    Flathub

⭐ Suporte

Se você gostou do projeto, deixe uma ⭐ no GitHub!


Feito com ❤️ para a comunidade Fedora
