# 📸 Módulo Btrfs - Gerenciador de Snapshots
**Versão:** 0.7.0-alpha

Este módulo oferece uma interface simples e segura para gerenciar snapshots do sistema de arquivos Btrfs no Fedora, integrado ao Fedora Only Fans (FOF).

## 🔧 Funcionalidades

- **Configurar Snapshots Automáticos**: Defina a frequência (hora, diário, semanal, mensal) e quantos snapshots manter.
- **Listar Snapshots Existentes**: Visualize todos os snapshots com número, tipo, descrição e data.
- **Excluir Snapshots**: Selecione um ou mais snapshots e exclua com confirmação.
- **Criar Snapshot Manual**: Crie um snapshot a qualquer momento com uma descrição personalizada.

## 🛡️ Segurança

- Todos os comandos que modificam o sistema usam `sudo` e acionam a autenticação segura do FOF (`pkexec`/`kdesu`/`zenity`).
- As operações são realizadas via backend Node.js, nunca expostas diretamente no frontend.
- Exclusão de snapshots requer confirmação explícita do usuário.

## 📁 Estrutura do Módulo

btrfs-module/
├── index.html # Página principal
├── btrfs-script.js # Lógica JavaScript (comunicação com o servidor)
├── btrfs-style.css # Estilos isolados
└── README.md # Esta documentação


## 🔗 Integração com o FOF

O módulo é acessado através de um botão na Sessão 2 (Restauração de Sistema) do FOF, que só aparece quando o Btrfs-Assistant está instalado.

## 🚀 Como Testar Localmente

1. Certifique-se de que o FOF está rodando (`node server.js`).
2. Acesse diretamente: `http://localhost:3000/btrfs-module/index.html`.
3. Ou clique no botão "Gerenciar Snapshots" na Sessão 2 do FOF.

## ⚠️ Requisitos

- Fedora Linux com sistema de arquivos Btrfs.
- Snapper instalado (`sudo dnf install snapper`).
- Configuração do Snapper para a raiz (`sudo snapper -c root create-config /`).

## 📝 Comandos Utilizados (para referência)

| Ação | Comando |
|------|---------|
| Configurar frequência | `sudo snapper -c root set-config TIMELINE_LIMIT_{HOURLY/DAILY/WEEKLY/MONTHLY}=N` |
| Listar snapshots | `sudo snapper -c root list --columns number,type,description,userdata,date` |
| Excluir snapshots | `sudo snapper -c root delete ID1,ID2,...` |
| Criar snapshot | `sudo snapper -c root create -d "Descrição"` |

## 🤝 Contribuição

Sinta-se à vontade para melhorar este módulo! Ele foi projetado para ser independente do FOF principal, então você pode modificar sem medo de quebrar o resto.

## 📄 Licença

GPL-3.0 (mesma licença do FOF)
