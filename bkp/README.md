# <img src="icone_app.png" width="55" align="center"> Fedora Only Fans (FOF)

![Autor](https://img.shields.io/badge/Criador-Vit%C3%A3oTub-blue?style=flat-square)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-v0.1.1--alpha-orange?style=flat-square)
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


📦 Comandos Disponíveis
Após a instalação:
# Iniciar o FOF
```bash
fof
```
# Atualizar para a versão mais recente
```bash
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh) --update
```
# Desinstalar
```bash
bash <(curl -s https://raw.githubusercontent.com/vitaotek/Fedora-Only-Fans/main/install.sh) --uninstall
```

## 📖 Sobre o Projeto

O **Fedora Only Fans** é um **painel de automação interativo** com interface web projetado para usuários iniciantes (e também para os avançados que buscam praticidade). 

O objetivo é transformar uma instalação limpa do Fedora em um sistema operacional completo, com todos os codecs, repositórios e ferramentas essenciais ativadas — **tudo visualmente e sem precisar usar o terminal**.

---

## ✨ Funcionalidades

| Etapa | Funcionalidade | Descrição |
|-------|----------------|-----------|
| **0** | 🔄 Atualização do Sistema | Atualiza todos os pacotes do Fedora |
| **1** | ⚙️ Otimização do Sistema | Configura DNF, idioma PT-BR e dual-boot |
| **2** | 📦 Repositórios e Codecs | RPM Fusion, Flatpak, codecs multimídia |
| **3** | 🔤 Fontes Microsoft | Instala fontes para compatibilidade |
| **4** | 🎮 Configuração para Jogos | Drivers Vulkan e Steam |
| **5** | 🎬 Produção de Áudio/Vídeo | EasyEffects, OBS Studio, apps recomendados |
| **6** | 🛠️ Manutenção | Limpeza, kernels, upgrade de versão |

### 🎨 Características Técnicas

- 🖥️ **Interface escura e moderna** - Design pensado para conforto visual
- 📡 **Logs em tempo real** - Acompanhe a execução enquanto acontece
- 📊 **Barra de progresso** - Visualize o andamento das tarefas
- 🔐 **Autenticação segura** - Usa `pkexec`/`kdesu` (sem expor senhas)
- 🛡️ **Whitelist de comandos** - Proteção contra comandos maliciosos
- 🐧 **Suporte a múltiplos desktops** - KDE, GNOME, XFCE, Cinnamon, MATE, LXQt, LXDE
- 🖱️ **100% visual** - Nunca precisa abrir o terminal

## 🖥️ Desktops Suportados

| Desktop | Central de Apps | Status |
|---------|-----------------|--------|
| **KDE Plasma** | Discover | ✅ |
| **GNOME** | GNOME Software | ✅ |
| **XFCE** | AppFinder | ✅ |
| **Cinnamon** | Software Center | ✅ |
| **MATE** | Software Boutique | ✅ |
| **LXQt** | LXQt Software Center | ✅ |
| **LXDE** | LXDE Software Center | ✅ |

## 🚀 Como funciona?

Se você veio de distribuições como Linux Mint, Ubuntu ou Zorin OS, sabe que o Fedora é incrível, mas exige alguns passos iniciais (como ativar o RPM Fusion ou configurar o Flathub).

Com o FOF você:
1. **Seleciona** visualmente o que deseja instalar ou configurar (Codecs de mídia, Drivers, Flatpaks, Otimizações do DNF).
2. **Executa** as tarefas diretamente através da interface web integrada, digitando sua senha de administrador apenas quando solicitado pelo sistema.
3. **Acompanha** o progresso em tempo real com logs e barra de progresso.

## 💻 Como Rodar o FOF localmente?

### 📦 Requisitos

- **Fedora Linux** 40+
- **Node.js** 18+
- **Navegador** (Firefox ou Chromium)
- **Conexão com internet**

### 🚀 Método Rápido

Para inicializar o painel, baixe todos os arquivos deste repositório, abra o terminal na pasta onde salvou o projeto e execute os comandos abaixo:

# Dê permissão de execução ao script
```bash
chmod +x iniciar_fof.sh
```
# Execute o script de inicialização
```bash
./iniciar_fof.sh
```
O script irá:

✅ Verificar se todos os arquivos estão presentes
✅ Instalar o Node.js (se necessário)
✅ Instalar as dependências do projeto
✅ Iniciar o servidor na porta 3000
✅ Abrir a interface no seu navegador

🔧 Opções do Script
# Modo debug (logs detalhados)
```bash
./iniciar_fof.sh --debug
```
# Não limpar perfis do navegador
```bash
./iniciar_fof.sh --no-clean
```
# Ver ajuda
```bash
./iniciar_fof.sh --help
```
🖥️ Método Manual
# 1. Instale as dependências do sistema
```bash
sudo dnf install -y nodejs npm
```
# 2. Instale as dependências do Node.js
```bash
npm install
```
# 3. Inicie o servidor
```bash
node server.js
```
# 4. Abra o navegador em http://localhost:3000
```bash
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

📂 Estrutura do Projeto:
```bash
Fedora-Only-Fans/
├── 📄 iniciar_fof.sh      # Script de inicialização
├── 📄 server.js            # Servidor Node.js
├── 📄 fof.html             # Interface web
├── 📄 icone_app.png        # Ícone do aplicativo
├── 📄 package.json         # Dependências Node.js
├── 📄 README.md            # Documentação
├── 📄 LICENSE              # Licença GPL-3.0
└── 📁 .perfil_firefox/     # Perfil do Firefox (criado em execução)
└── 📁 .perfil_app/         # Perfil do Chromium (criado em execução)
```

🛡️ Segurança
✅ Autenticação segura - Usa pkexec/kdesu em vez de echo senha | sudo
✅ Whitelist de comandos - Apenas comandos permitidos são executados
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
v0.1.2
□ Backup e restauração de configurações
□ Integração com o terminal
□ Notificações do sistema

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

Informações Necessárias
Versão do Fedora

Desktop Environment (KDE, GNOME, XFCE, etc.)

Logs do servidor (/tmp/fof-*.log)

Passos para reproduzir o problema

⚠️ Aviso Legal
ESTE PROJETO AINDA ESTÁ EM DESENVOLVIMENTO E SEU STATUS É CONSIDERADO ALPHA.

Não é recomendada a utilização em ambiente de produção, a menos que você saiba o que está fazendo. Utilize por sua conta e risco!

Sempre faça backup dos seus dados antes de executar alterações no sistema.

📄 Licença
Este projeto está licenciado sob a GPL-3.0 License - veja o arquivo LICENSE para detalhes.

👤 Autor
VitãoTub

🙏 Agradecimentos
Comunidade Fedora
RPM Fusion
Flatpak/Flathub

⭐ Suporte
Se você gostou do projeto, deixe uma ⭐ no GitHub!

Feito com ❤️ para a comunidade Fedora
