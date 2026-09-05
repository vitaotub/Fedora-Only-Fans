# <img src="icone_app.png" width="55" align="center"> Fedora Only Fans (FOF)

![Autor](https://img.shields.io/badge/Criador-Vit%C3%A3oTub-blue?style=flat-square)
![Versão](https://img.shields.io/badge/Versão-v0.9.8--alpha-orange?style=flat-square)
![Fedora](https://img.shields.io/badge/Fedora-44+-294172?style=flat-square&logo=fedora)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-GPL--3.0-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=flat-square)
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

---

📖 Sobre o Projeto

O Fedora Only Fans é um painel de automação interativo com interface web projetado para usuários iniciantes (e também para os avançados que buscam praticidade).

O objetivo é transformar uma instalação limpa do Fedora em um sistema operacional completo, com todos os codecs, repositórios, drivers e ferramentas essenciais ativadas — tudo visualmente e sem precisar usar o terminal.

---

🧭 Configuração e Manutenção

O FOF tem dois pontos de entrada, com propósitos diferentes:

🧭 Iniciar Configuração	Passo a passo, uma sessão por vez, com navegação intuitiva (Anterior/Próximo/Pular). A ordem importa pro resultado final, então esta é a única forma de percorrer as sessões de configuração do Fedora — não existe um "modo avançado" que pule a ordem.

🛠️ Manutenção: Kernels, limpeza de temporários, GRUB, atualizar/desinstalar o FOF — tarefas que não têm dependência de ordem entre si nem com o resto da configuração, por isso ficam numa página à parte, acessível a qualquer momento.

O FOF não gera nenhum tipo de relatório de conclusão — cada botão lembra seu próprio estado (executado, pulado, ou pendente), então fechar e reabrir o FOF (ou reiniciar o computador) sempre mostra exatamente onde você parou.

---

✨ Funcionalidades Completas

Sessões da Configuração (em ordem)

    1	👋 Boas-vindas
        Atualização completa do sistema Fedora (dnf upgrade --refresh)
        
    2	💾 Restauração
        Instalação do Btrfs-Assistant para gerenciamento de snapshots do sistema
        
    3	⚙️ Otimização
        Ajuste de velocidade do DNF, idioma PT-BR, corretor ortográfico e correção de dual-boot
        
    4	📦 Repositórios
        Ativação do RPM Fusion, configuração do Flatpak/Flathub, codecs multimídia, extras tainted e aceleração gráfica VA-API
        
    5	🔤 Fontes
        Instalação de fontes Microsoft para compatibilidade (Arial, Times, Calibri, etc.)
        
    6	🎮 Launchers
        Instalação de Steam, Heroic Games, Lutris, ProtonUp-Qt, drivers Vulkan para AMD, e ferramentas de compatibilidade Wine/Proton (Wine, Winetricks, Bottles, GameMode, MangoHud)
        
    7	🎬 Produção Multimídia
        Instalação do OBS Studio (Flatpak), ativação de câmera virtual, EasyEffects, edição de vídeo/áudio (Kdenlive, Audacity), e instalador da suíte Affinity via Wine (projeto de terceiros AffinityOnLinux)


Sessões de Manutenção (sem ordem — página à parte)

        🛠️ Manutenção
        Limpeza de cache, gerenciamento de kernels (listar/remover, com bloqueio do kernel em uso) e configuração do GRUB (timeout e visibilidade do menu)
        
        🔧 Manutenção FOF
        Atualização ou desinstalação completa do Fedora Only Fans


🎨 Características Técnicas

    🖥️ Interface escura e moderna - Design pensado para conforto visual
    📡 Logs em tempo real - Acompanhe a execução via Server-Sent Events (SSE)
    📊 Barra de progresso - Visualize o andamento das tarefas
    🔐 Autenticação segura - Usa pkexec/kdesu (sem expor senhas)
    🛡️ Comandos sem autenticação - Comandos de consulta (rpm -q, uname -r, etc.) não solicitam senha
    🐧 Suporte a múltiplos desktops - KDE, GNOME, XFCE, Cinnamon, MATE, LXQt, LXDE
    🖱️ 100% visual - Nunca precisa abrir o terminal
    💾 Persistência - Estado de cada ação salvo automaticamente (servidor local + navegador), sem depender de nenhum relatório agregado
    🔄 Botões de reversão - Desfaça alterações com um clique
    📦 Container nativo - Aplicação roda em WebKitGTK (sem necessidade de navegador)


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

    HTML5 / CSS3
    Interface responsiva e moderna

    JavaScript
    Lógica de requisições à API local

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
├── 📄 manutencao.html         # Manutenção (kernels, limpeza, GRUB, FOF — sem ordem)
├── 📄 style.css               # CSS compartilhado (global)
├── 📄 script.js               # JS compartilhado (funções globais)
├── 📄 00-boas-vindas.html     # Sessão 1 (HTML + JS específico)
├── 📄 01-restauracao.html     # Sessão 2 (HTML + JS específico)
├── 📄 02-otimizacao.html      # Sessão 3 (HTML + JS específico)
├── 📄 03-repositorios.html    # Sessão 4 (HTML + JS específico)
├── 📄 04-fontes.html          # Sessão 5 (HTML + JS específico)
├── 📄 05-launchers.html       # Sessão 6 (HTML + JS específico)
├── 📄 06-loja.html            # Sessão 7 (HTML + JS específico)
├── 📄 07-manutencao.html      # Manutenção — kernels, limpeza, GRUB (sem ordem)
├── 📄 08-fof-manutencao.html  # Manutenção FOF — atualizar/desinstalar (sem ordem)
├── 📄 template-sessao.html    # Molde pra criar uma sessão nova
├── 📄 iniciar_fof.sh          # Script de inicialização
├── 📄 iniciar_fof_compat.sh   # Modo compatibilidade (GPUs antigas)
├── 📄 install.sh              # Instalador do sistema
├── 📄 server.js               # Servidor Node.js
├── 📄 icone_app.png           # Ícone do aplicativo
├── 📄 package.json            # Dependências Node.js
├── 📄 README.md               # Documentação
├── 📄 LICENSE                 # Licença GPL-3.0
├── 📄 .gitignore              # Arquivos ignorados pelo Git
├── 📄 Makefile                # Build do container nativo
├── 📄 build-container.sh      # Script de compilação do container
├── 📂 test/                   # Teste de fumaça do servidor (npm test)
│   └── 📄 smoke-test.js
└── 📂 src/                    # Código fonte do container
    └── 📄 fof-container.c     # Container WebKitGTK (C + GTK3)
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
v0.9.8 (Atual) ✅

    ✅ Configuração sequencial em ordem (a ordem das sessões importa pro resultado)
    ✅ Página de Manutenção separada (kernels, limpeza, GRUB, FOF — sem dependência de ordem)
    ✅ Botões de reversão só onde a ação é reversível — ações repetíveis (sempre clicáveis) nunca têm par de reverter
    ✅ Persistência via localStorage/servidor (sem relatório de conclusão — só o estado de cada botão)
    ✅ Auditoria completa do código (bugs de segurança, lógica e duplicação corrigidos)
    ✅ Instalação do Btrfs-Assistant via interface
    ✅ Instalação do OBS Studio via Flatpak
    ✅ Sincronização com canal estável (distro-sync)
    ✅ Correção da Central de Apps (sem autenticação)
    ✅ Launchers com sistema de toggle (instalar/desinstalar)
    ✅ Ferramentas de compatibilidade Wine/Proton (Wine, Winetricks, Bottles, GameMode, MangoHud)
    ✅ Edição de vídeo/áudio (Kdenlive, Audacity)
    ✅ Progresso com timeout de segurança
    ✅ Modo Compatibilidade para GPUs antigas
    ✅ Botão "Atualizar FOF" sempre clicável (pode ser reexecutado)
    ✅ Remoção do endpoint /reverter não utilizado
    ✅ Remoção de classes CSS mortas (.etapa-card, .etapa-titulo)
    ✅ WebKitGTK 4.1 como requisito único (removido suporte a 4.0)
    ✅ Timeout de remoção de kernel aumentado para 3 minutos
    ✅ Variáveis globais convertidas de const para var (evita erro de redeclaração)
    ✅ window.close() com fallback de mensagem

v1.0.0 (Futuro) 🔮

    □ Perfil EasyEffects com presets
    □ Tema claro/escuro
    □ Localização


➕ Como adicionar uma sessão nova

O FOF tem um registro central de sessões (SESSOES, no topo de script.js) — é o único lugar que precisa ser editado pra adicionar uma sessão nova com botões novos.

    Copie template-sessao.html para NN-nome-da-sessao.html (dois dígitos + hífen + nome em minúsculas).
    Preencha os placeholders com o conteúdo real (título, botões, comandos).
    Adicione uma entrada no array SESSOES em script.js, com o mesmo id do arquivo (sem .html) e os data-comando dos seus botões. Se a sessão for uma tarefa sem dependência de ordem com o resto (tipo as de manutenção), marque com manutencao: true — ela vai aparecer em manutencao.html em vez do fluxo sequencial de guiado.html.

Pronto — não precisa editar guiado.html, manutencao.html, index.html nem server.js. A posição da sua entrada no array SESSOES já define a ordem de exibição e o número "Sessão N" (calculado automaticamente) das sessões principais, e a rota do servidor aceita qualquer sessão nomeada nesse padrão.

O template-sessao.html traz comentários apontando pra sessões existentes que servem de exemplo pra padrões mais específicos (botão sempre clicável, vários botões lado a lado, dropdown, fluxo com confirmação dupla, etc.). Importante: um comando sempreClicavel: true nunca deve ter um botão de reverter/remover associado — se a ação tiver um "desfazer" com sentido, modele como um segundo botão independente, também sempre clicável (veja grub-aplicar-recomendado/grub-restaurar-padrao em 07-manutencao.html).

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
