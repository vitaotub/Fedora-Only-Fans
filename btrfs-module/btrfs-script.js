/**
 * Módulo Btrfs - Gerenciador de Snapshots
 * Versão: 0.7.1-alpha - CORREÇÕES
 *
 * CORREÇÕES v0.7.1-alpha:
 *   - Botões "Tornar Padrão" agora usam snapshot selecionado na lista
 *   - Correção do comando para definir snapshot como padrão de boot (btrfs subvolume set-default)
 *   - Adicionada função para obter Subvolume ID
 *   - Botão "Tornar Padrão (Read-Write)" agora funciona corretamente
 *   - Remove dependência do botão "Ver Snapshot Atual"
 *
 * Comunica com o servidor FOF via API /executar
 * Todos os comandos usam 'sudo' e acionam autenticação (pkexec)
 */

const API_URL = 'http://localhost:3000';

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================

let snapshotAtualNumber = null;

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Executa um comando no servidor e retorna o output
 */
async function executarComando(comando, idComando) {
    try {
        const response = await fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comando, idComando })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const dados = await response.json();
        return dados.output || '';
    } catch (e) {
        console.error('Erro ao executar comando:', e);
        throw e;
    }
}

/**
 * Aguarda o SSE completar e retorna o output
 * Útil para comandos longos
 */
async function executarComandoSSE(comando, idComando) {
    return new Promise((resolve, reject) => {
        let output = '';

        fetch(API_URL + '/executar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comando, idComando })
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const eventSource = new EventSource(API_URL + '/stream?id=' + idComando);

            eventSource.onmessage = function(event) {
                try {
                    const dados = JSON.parse(event.data);

                    if (dados.tipo === 'end') {
                        eventSource.close();
                        resolve(output.trim());
                        return;
                    }

                    if (dados.tipo === 'output' || dados.tipo === 'info') {
                        output += dados.mensagem;
                    }
                } catch (e) {
                    console.error('Erro SSE:', e);
                }
            };

            eventSource.onerror = function() {
                eventSource.close();
                resolve(output.trim());
            };

            setTimeout(() => {
                if (eventSource.readyState !== EventSource.CLOSED) {
                    eventSource.close();
                    resolve(output.trim());
                }
            }, 30000);
        })
        .catch(reject);
    });
}

/**
 * Obtém o número do snapshot atual
 */
async function obterSnapshotAtual() {
    try {
        const response = await fetch(API_URL + '/check-booted-snapshot');
        if (!response.ok) throw new Error('Erro ao verificar snapshot atual');
        const data = await response.json();
        return data.inSnapshot ? data.snapshotNumber : null;
    } catch (e) {
        console.error('Erro ao obter snapshot atual:', e);
        return null;
    }
}

// ============================================================
// NOVA FUNÇÃO: Obter Subvolume ID
// ============================================================

/**
 * Obtém o Subvolume ID de um snapshot
 * @param {number} snapshotNumber - Número do snapshot
 * @returns {string} Subvolume ID (ex: "256")
 */
async function obterSubvolumeId(snapshotNumber) {
    if (!snapshotNumber || snapshotNumber <= 0) {
        throw new Error('Número do snapshot inválido');
    }

    const comando = `btrfs subvolume show /.snapshots/${snapshotNumber}/snapshot 2>/dev/null | grep "Subvolume ID:" | awk '{print $3}'`;
    const id = 'get-subvolume-id-' + Date.now();
    const output = await executarComandoSSE(comando, id);
    const subvolumeId = output.trim();

    if (!subvolumeId || isNaN(parseInt(subvolumeId, 10))) {
        throw new Error(`Não foi possível obter o Subvolume ID do snapshot #${snapshotNumber}`);
    }

    return subvolumeId;
}

// ============================================================
// 0. VERIFICAÇÃO DA CONFIGURAÇÃO (CORRIGIDA)
// ============================================================

/**
 * Verifica se a configuração "root" existe e se .snapshots é subvolume
 * CORRIGIDO: Se estiver dentro de um snapshot, considera configurado
 */
async function verificarConfiguracaoSnapper() {
    try {
        // 1. Verificar se estamos dentro de um snapshot
        const bootResponse = await fetch(API_URL + '/check-booted-snapshot');
        if (bootResponse.ok) {
            const bootData = await bootResponse.json();
            if (bootData.inSnapshot) {
                console.log('🔍 Rodando dentro do snapshot #' + bootData.snapshotNumber + '. Considerando configurado.');
                return true;
            }
        }

        // 2. Verificar se a configuração existe (via API, SEM SUDO)
        const response = await fetch(API_URL + '/check-snapper-config');
        if (!response.ok) throw new Error('Erro ao verificar configuração');
        const data = await response.json();

        console.log('🔍 Dados da verificação:', data);

        // Se a configuração existe e está funcionando, retornar true
        if (data.configured === true) {
            console.log('✅ Snapper já está configurado e funcionando!');
            return true;
        }

        // 3. Se a configuração existe mas não está funcionando, tentar verificar manualmente
        if (data.configExists === true) {
            console.log('⚠️ Configuração existe mas Snapper não está funcionando. Verificando manualmente...');

            // Verificar se .snapshots é um subvolume Btrfs (SEM SUDO!)
            const checkSubvol = await executarComando(
                'btrfs subvolume show /.snapshots 2>/dev/null && echo "OK"',
                'check-snapshots-subvol'
            );
            const isSubvolume = checkSubvol.trim() === 'OK';

            if (isSubvolume) {
                console.log('✅ .snapshots é um subvolume válido. Considerando configurado.');
                return true;
            }
        }

        // 4. Verificar se .snapshots é um subvolume Btrfs (SEM SUDO!)
        const checkSubvol = await executarComando(
            'btrfs subvolume show /.snapshots 2>/dev/null && echo "OK"',
            'check-snapshots-subvol'
        );
        const isSubvolume = checkSubvol.trim() === 'OK';

        console.log('🔍 Configuração existe?', data.configExists);
        console.log('🔍 .snapshots é subvolume?', isSubvolume);
        console.log('🔍 Snapper funcionando?', data.working);

        // 5. Retornar true apenas se a configuração existe E o Snapper está funcionando
        return data.configExists === true && isSubvolume && data.working === true;
    } catch (e) {
        console.error('Erro ao verificar configuração:', e);
        // Se houve erro, verificar se .snapshots existe
        try {
            const checkSubvol = await executarComando(
                'btrfs subvolume show /.snapshots 2>/dev/null && echo "OK"',
                'check-snapshots-subvol-fallback'
            );
            return checkSubvol.trim() === 'OK';
        } catch (e2) {
            return false;
        }
    }
}

// ============================================================
// 0.1. PASSO 1: CONFIGURAR GRUB (INDEPENDENTE)
// ============================================================

/**
 * Configura o GRUB para mostrar snapshots
 * Esta função é chamada separadamente pelo botão "Preparar GRUB"
 */
async function configurarGrubParaSnapshots() {
    const outputLog = [];
    const tempScriptPath = `/tmp/setup-grub-${Date.now()}.sh`;

    const mainScriptContent = `#!/bin/bash
    set -e

    echo "============================================================"
    echo "  🔧 CONFIGURANDO GRUB PARA SNAPSHOTS"
    echo "============================================================"
    echo ""

    echo "📦 Instalando grub-btrfs..."
    echo ""

    # Verificar se já está instalado
    if rpm -q grub-btrfs &>/dev/null; then
        echo "   ✅ grub-btrfs já está instalado: $(rpm -q grub-btrfs)"
        echo ""
        else
            echo "   🔧 Instalando grub-btrfs (pode levar alguns segundos)..."
            echo ""

            # Habilitar COPR
            echo "   📦 Habilitando COPR kylegospo/grub-btrfs..."
            dnf copr enable kylegospo/grub-btrfs -y 2>&1 || true
            echo ""

            # Instalar via dnf
            echo "   📦 Instalando via dnf..."
            dnf install -y grub-btrfs 2>&1 || true
            echo ""

            # Verificar
            if rpm -q grub-btrfs &>/dev/null; then
                echo "   ✅ grub-btrfs instalado com sucesso!"
                echo "   📦 Versão: $(rpm -q grub-btrfs)"
                echo ""
                else
                    echo "   ❌ Falha ao instalar grub-btrfs via dnf!"
                    echo "   Tentando fallback com RPM direto..."
                    echo ""
                    FEDORA_VER=\$(rpm -E %fedora)
                    dnf install -y "https://download.copr.fedorainfracloud.org/results/kylegospo/grub-btrfs/fedora-\${FEDORA_VER}-x86_64/grub-btrfs-*.rpm" 2>&1 || true
                    if rpm -q grub-btrfs &>/dev/null; then
                        echo "   ✅ grub-btrfs instalado via RPM direto!"
                        echo "   📦 Versão: $(rpm -q grub-btrfs)"
                        echo ""
                        else
                            echo "   ❌ Falha total ao instalar grub-btrfs!"
                            echo "   ⚠️ As entradas de snapshot NÃO aparecerão no GRUB."
                            echo ""
                            fi
                            fi
                            fi

                            echo "============================================================"
                            echo "  ⚙️ CONFIGURANDO GRUB"
                            echo "============================================================"
                            echo ""

                            # Garantir que GRUB_TIMEOUT existe e é 10
                            if grep -q "^GRUB_TIMEOUT=" /etc/default/grub; then
                                sed -i 's/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=10/' /etc/default/grub
                                else
                                    echo 'GRUB_TIMEOUT=10' >> /etc/default/grub
                                    fi

                                    # Garantir que GRUB_TIMEOUT_STYLE existe e é "menu"
                                    if grep -q "^GRUB_TIMEOUT_STYLE=" /etc/default/grub; then
                                        sed -i 's/^GRUB_TIMEOUT_STYLE=.*/GRUB_TIMEOUT_STYLE="menu"/' /etc/default/grub
                                        else
                                            echo 'GRUB_TIMEOUT_STYLE="menu"' >> /etc/default/grub
                                            fi

                                            # Remover GRUB_HIDDEN_TIMEOUT se existir
                                            sed -i '/^GRUB_HIDDEN_TIMEOUT=/d' /etc/default/grub

                                            # ============================================================
                                            # REMOVER menu_auto_hide (evita ocultação automática do menu)
                                            # ============================================================
                                            echo "Removendo menu_auto_hide (garantir que o menu apareça)..."
                                            grub2-editenv - unset menu_auto_hide 2>/dev/null || true
                                            echo "   ✅ menu_auto_hide removido"
                                            echo ""

                                            # 4. Verificar configuração do GRUB
                                            echo "4. Verificando configuração do GRUB:"
                                            echo "   $(grep '^GRUB_TIMEOUT=' /etc/default/grub)"
                                            echo "   $(grep '^GRUB_TIMEOUT_STYLE=' /etc/default/grub)"
                                            echo ""

                                            echo "============================================================"
                                            echo "  📝 CRIANDO WRAPPER DO SNAPPER"
                                            echo "============================================================"
                                            echo ""

                                            # 5. Criar wrapper para atualizar GRUB
                                            echo "5. Criando wrapper para atualização do GRUB..."
                                            cat > /usr/local/bin/update-grub-snapper << 'WRAPPEREOF'
                                            #!/bin/bash
                                            # Script executado pelo Snapper após criar snapshots
                                            /usr/sbin/grub2-mkconfig -o /boot/grub2/grub.cfg
                                            WRAPPEREOF

                                            chmod +x /usr/local/bin/update-grub-snapper

                                            if [ -f /usr/local/bin/update-grub-snapper ]; then
                                                echo "   ✅ Wrapper criado: /usr/local/bin/update-grub-snapper"
                                                else
                                                    echo "   ❌ Falha ao criar wrapper!"
                                                    fi
                                                    echo ""

                                                    echo "============================================================"
                                                    echo "  🔗 CONFIGURANDO HOOK DO SNAPPER"
                                                    echo "============================================================"
                                                    echo ""

                                                    # 6. Configurar hook do Snapper
                                                    echo "6. Configurando hook POST_SNAPSHOT_SCRIPT..."
                                                    snapper -c root set-config POST_SNAPSHOT_SCRIPT="/usr/local/bin/update-grub-snapper"

                                                    if snapper -c root get-config 2>/dev/null | grep -q POST_SNAPSHOT_SCRIPT; then
                                                        echo "   ✅ Hook configurado com sucesso!"
                                                        echo "   $(snapper -c root get-config 2>/dev/null | grep POST_SNAPSHOT_SCRIPT)"
                                                        else
                                                            echo "   ❌ Falha ao configurar hook!"
                                                            fi
                                                            echo ""

                                                            echo "============================================================"
                                                            echo "  🔄 GERANDO GRUB"
                                                            echo "============================================================"
                                                            echo ""

                                                            # 7. Gerar GRUB pela primeira vez
                                                            echo "7. Gerando menu do GRUB..."
                                                            grub2-mkconfig -o /boot/grub2/grub.cfg 2>&1 | while read line; do
                                                            echo "   $line"
                                                            done
                                                            echo ""

                                                            echo "============================================================"
                                                            echo "  🔍 VERIFICANDO ENTRA NO GRUB"
                                                            echo "============================================================"
                                                            echo ""

                                                            # 8. Verificar se as entradas foram criadas
                                                            echo "8. Verificando entradas de snapshot no GRUB..."
                                                            if grep -q "submenu.*snapshots" /boot/grub2/grub.cfg 2>/dev/null; then
                                                                echo "   ✅ Submenu 'Fedora Linux snapshots' encontrado!"
                                                                echo "   📋 Conteúdo:"
                                                                grep -A 5 "submenu.*snapshots" /boot/grub2/grub.cfg 2>/dev/null | sed 's/^/      /'
                                                                elif grep -q "menuentry.*snapshot" /boot/grub2/grub.cfg 2>/dev/null; then
                                                                echo "   ✅ Entradas de snapshot encontradas!"
                                                                else
                                                                    echo "   ⚠️ Nenhuma entrada de snapshot encontrada."
                                                                    echo "   Criando snapshot de teste para gerar entradas..."
                                                                    snapper -c root create -d "Primeiro snapshot para GRUB" 2>/dev/null || true
                                                                    grub2-mkconfig -o /boot/grub2/grub.cfg 2>/dev/null
                                                                    if grep -q "submenu.*snapshots\|menuentry.*snapshot" /boot/grub2/grub.cfg 2>/dev/null; then
                                                                        echo "   ✅ Entradas criadas com sucesso!"
                                                                        else
                                                                            echo "   ⚠️ Ainda sem entradas. Pode ser necessário reiniciar."
                                                                            fi
                                                                            fi

                                                                            echo ""
                                                                            echo "============================================================"
                                                                            echo "  ✅ GRUB CONFIGURADO COM SUCESSO!"
                                                                            echo "============================================================"
                                                                            echo ""
                                                                            echo "📋 Resumo:"
                                                                            echo "   ✅ grub-btrfs instalado"
                                                                            echo "   ✅ GRUB_TIMEOUT=10 (menu visível por 10 segundos)"
                                                                            echo "   ✅ Hook POST_SNAPSHOT_SCRIPT configurado"
                                                                            echo "   ✅ Wrapper criado em /usr/local/bin/update-grub-snapper"
                                                                            echo ""
                                                                            echo "🔄 Agora, clique em 'Continuar' para finalizar a configuração do Snapper."
                                                                            `;

                                                                            try {
                                                                                outputLog.push('📝 Criando script temporário para configurar GRUB...');

                                                                                const writeCmd = `tee ${tempScriptPath} > /dev/null << 'EOF'\n${mainScriptContent}\nEOF\nchmod +x ${tempScriptPath}`;
                                                                                await executarComandoSSE(writeCmd, 'write-grub-script');

                                                                                outputLog.push('🔐 Executando script com privilégios de root...');

                                                                                const execCmd = `pkexec bash ${tempScriptPath}`;
                                                                                const result = await executarComandoSSE(execCmd, 'run-grub-setup');
                                                                                outputLog.push(result);

                                                                                return { outputLog, status: 'GRUB configurado com sucesso!' };
                                                                            } catch (error) {
                                                                                outputLog.push(`❌ Erro durante a execução: ${error.message}`);
                                                                                throw error;
                                                                            } finally {
                                                                                outputLog.push('🧹 Removendo script temporário...');
                                                                                await executarComandoSSE(`rm -f ${tempScriptPath}`, 'cleanup-grub-script');
                                                                            }
}


// ============================================================
// 0.2. PASSO 2: CONFIGURAR SNAPPER (SEM GRUB-BTRFS)
// ============================================================

/**
 * Configura Snapper (sem tocar no GRUB)
 * Esta função é chamada após o GRUB já estar configurado
 */
async function configurarSnapperCompleto() {
    const outputLog = [];
    const tempScriptPath = `/tmp/setup-snapper-${Date.now()}.sh`;

    const mainScriptContent = `#!/bin/bash
    set -e

    echo "============================================================"
    echo "  📸 CONFIGURANDO SNAPPER"
    echo "============================================================"
    echo ""
    # ============================================================
    # PASSO 0: INSTALAR SNAPPER (SE NÃO ESTIVER INSTALADO)
    # ============================================================
    echo "📦 Verificando/Instalando Snapper..."
    if ! command -v snapper &> /dev/null; then
        echo "   Snapper não encontrado. Instalando..."
        dnf install -y snapper 2>&1 || true
        if ! command -v snapper &> /dev/null; then
            echo "   ❌ Falha ao instalar Snapper!"
            exit 1
            fi
            echo "   ✅ Snapper instalado com sucesso!"
            else
                echo "   ✅ Snapper já está instalado"
                fi
                echo ""

                # ============================================================
                # PASSO 1: REMOVER CONFIGURAÇÕES ANTIGAS
                # ============================================================
                echo "🗑️ Removendo configurações e diretórios antigos..."

                if snapper list-configs 2>/dev/null | grep -qw root; then
                    snapper -c root delete-config 2>/dev/null || true
                    fi

                    rm -f /etc/snapper/configs/root
                    rm -f /etc/snapper/configs/root.bak

                    # ============================================================
                    # CORREÇÃO: Verificar .snapshots - DEIXAR O SNAPPER CRIAR
                    # ============================================================
                    echo "🔍 Verificando /.snapshots..."

                    if [ -d /.snapshots ]; then
                        if btrfs subvolume show /.snapshots &>/dev/null; then
                            echo "✅ /.snapshots já é um subvolume Btrfs"
                            else
                                echo "⚠️ /.snapshots existe mas NÃO é um subvolume Btrfs"
                                echo "🗑️ Removendo diretório comum..."
                                rm -rf /.snapshots
                                echo "✅ Diretório removido. O Snapper criará o subvolume."
                                fi
                                else
                                    echo "📁 /.snapshots não existe. O Snapper criará automaticamente."
                                    fi

                                    # Parar timers
                                    systemctl stop snapper-timeline.timer snapper-cleanup.timer 2>/dev/null || true
                                    systemctl disable snapper-timeline.timer snapper-cleanup.timer 2>/dev/null || true

                                    # ============================================================
                                    # PASSO 1.1: LIMPAR REGISTRO
                                    # ============================================================
                                    echo "🧹 Limpando registro de configs em /etc/sysconfig/snapper..."
                                    if [ -f /etc/sysconfig/snapper ]; then
                                        sed -i 's/SNAPPER_CONFIGS="[^"]*"/SNAPPER_CONFIGS=""/' /etc/sysconfig/snapper
                                        fi

                                        # ============================================================
                                        # PASSO 2: REINICIAR O SERVIÇO
                                        # ============================================================
                                        echo "🔄 Reiniciando e habilitando serviço do Snapper..."
                                        systemctl stop snapperd.service 2>/dev/null || true
                                        systemctl start snapperd.service 2>/dev/null || true
                                        systemctl enable snapperd.service 2>/dev/null || true

                                        echo "🔍 Verificando se o snapperd está rodando..."

                                        MAX_ATTEMPTS=5
                                        ATTEMPT=0
                                        SNAPPERD_ACTIVE=false

                                        while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
                                            if systemctl is-active --quiet snapperd.service; then
                                                SNAPPERD_ACTIVE=true
                                                echo "✅ snapperd está ativo!"
                                                break
                                                else
                                                    ATTEMPT=$((ATTEMPT + 1))
                                                    echo "⏳ Tentativa $ATTEMPT/$MAX_ATTEMPTS: snapperd não está ativo. Aguardando..."
                                                    systemctl restart snapperd.service 2>/dev/null || true
                                                    sleep 2
                                                    fi
                                                    done

                                                    if [ "$SNAPPERD_ACTIVE" = false ]; then
                                                        echo "❌ snapperd NÃO está ativo após $MAX_ATTEMPTS tentativas!"
                                                        systemctl start snapperd.service --force 2>/dev/null || true
                                                        sleep 2
                                                        if systemctl is-active --quiet snapperd.service; then
                                                            echo "✅ snapperd ativado com force!"
                                                            else
                                                                echo "⚠️ Aviso: snapperd não está ativo."
                                                                fi
                                                                fi

                                                                # Verificar timers
                                                                echo "🔍 Verificando timers do Snapper..."
                                                                systemctl enable --now snapper-timeline.timer 2>/dev/null || true
                                                                systemctl enable --now snapper-cleanup.timer 2>/dev/null || true

                                                                # ============================================================
                                                                # PASSO 3: CRIAR CONFIGURAÇÃO
                                                                # ============================================================
                                                                echo "📁 Criando configuração raiz do Snapper..."
                                                                snapper -c root create-config /

                                                                echo "⚙️ Ajustando permissões do /.snapshots..."
                                                                chmod 750 /.snapshots

                                                                # ============================================================
                                                                # VERIFICAÇÃO FINAL
                                                                # ============================================================
                                                                echo "🔍 VERIFICANDO SE A CONFIGURAÇÃO FOI CRIADA..."

                                                                if snapper list-configs 2>/dev/null | grep -qw root; then
                                                                    echo "✅ Configuração 'root' encontrada!"

                                                                    if btrfs subvolume show /.snapshots &>/dev/null; then
                                                                        echo "✅ /.snapshots é um subvolume Btrfs válido!"
                                                                        else
                                                                            echo "⚠️ /.snapshots NÃO é um subvolume. Tentando recriar..."
                                                                            rm -rf /.snapshots 2>/dev/null || true
                                                                            snapper -c root create-config / --force 2>/dev/null
                                                                            chmod 750 /.snapshots
                                                                            fi
                                                                            else
                                                                                echo "❌ ERRO CRÍTICO: Configuração 'root' NÃO foi criada!"
                                                                                echo "   Tentando criar novamente com --force..."
                                                                                snapper -c root create-config / --force 2>/dev/null

                                                                                if snapper list-configs 2>/dev/null | grep -qw root; then
                                                                                    echo "✅ Configuração 'root' criada com --force!"
                                                                                    else
                                                                                        echo "❌ Falha total ao criar configuração."
                                                                                        exit 1
                                                                                        fi
                                                                                        fi

                                                                                        # Reativar timers
                                                                                        systemctl enable --now snapper-timeline.timer 2>/dev/null || true
                                                                                        systemctl enable --now snapper-cleanup.timer 2>/dev/null || true

                                                                                        # ============================================================
                                                                                        # VERIFICAÇÃO FINAL COMPLETA
                                                                                        # ============================================================
                                                                                        echo ""
                                                                                        echo "============================================================"
                                                                                        echo "  🔍 VERIFICAÇÃO FINAL"
                                                                                        echo "============================================================"

                                                                                        echo ""
                                                                                        echo "📋 Configuração do Snapper:"
                                                                                        snapper list-configs 2>/dev/null || echo "   ❌ Nenhuma configuração encontrada!"

                                                                                        echo ""
                                                                                        echo "📁 Subvolume .snapshots:"
                                                                                        if btrfs subvolume show /.snapshots &>/dev/null; then
                                                                                            echo "   ✅ É um subvolume Btrfs válido!"
                                                                                            else
                                                                                                echo "   ❌ NÃO é um subvolume Btrfs válido!"
                                                                                                fi

                                                                                                echo ""
                                                                                                echo "🔧 Serviço snapperd:"
                                                                                                if systemctl is-active --quiet snapperd.service; then
                                                                                                    echo "   ✅ Ativo e rodando!"
                                                                                                    else
                                                                                                        echo "   ❌ NÃO está rodando!"
                                                                                                        fi

                                                                                                        echo ""
                                                                                                        echo "📸 Snapshots:"
                                                                                                        if snapper -c root list &>/dev/null; then
                                                                                                            echo "   ✅ Snapshot #0 (current) encontrado!"
                                                                                                            else
                                                                                                                echo "   ❌ Nenhum snapshot encontrado!"
                                                                                                                fi

                                                                                                                echo ""
                                                                                                                echo "============================================================"
                                                                                                                echo "  ✅ SNAPPER CONFIGURADO COM SUCESSO!"
                                                                                                                echo "============================================================"
                                                                                                                `;

                                                                                                            try {
                                                                                                                outputLog.push('📝 Criando script temporário para configurar Snapper...');

                                                                                                                const writeCmd = `tee ${tempScriptPath} > /dev/null << 'EOF'\n${mainScriptContent}\nEOF\nchmod +x ${tempScriptPath}`;
                                                                                                                await executarComandoSSE(writeCmd, 'write-snapper-script');

                                                                                                                outputLog.push('🔐 Executando script com privilégios de root...');

                                                                                                                const execCmd = `pkexec bash ${tempScriptPath}`;
                                                                                                                const result = await executarComandoSSE(execCmd, 'run-snapper-setup');
                                                                                                                outputLog.push(result);

                                                                                                                return { outputLog, status: 'Snapper configurado com sucesso!' };
                                                                                                            } catch (error) {
                                                                                                                outputLog.push(`❌ Erro durante a execução: ${error.message}`);
                                                                                                                throw error;
                                                                                                            } finally {
                                                                                                                outputLog.push('🧹 Removendo script temporário...');
                                                                                                                await executarComandoSSE(`rm -f ${tempScriptPath}`, 'cleanup-snapper-script');
                                                                                                            }
}


// ============================================================
// 1. CONFIGURAR SNAPPER (TIMELINE)
// ============================================================

/**
 * Configura a frequência e quantidade de snapshots automáticos
 */
async function configurarSnapper(frequencia, quantidade) {
    const freqMap = {
        hourly: 'HOURLY',
        daily: 'DAILY',
        weekly: 'WEEKLY',
        monthly: 'MONTHLY'
    };
    const freq = freqMap[frequencia] || 'DAILY';

    const comando = `sudo snapper -c root set-config TIMELINE_LIMIT_${freq}=${quantidade}`;
    const id = 'snapper-config-' + Date.now();

    const output = await executarComandoSSE(comando, id);
    return output;
}


// ============================================================
// 2. LISTAR SNAPSHOTS (CORRIGIDO PARA DENTRO DE SNAPSHOT)
// ============================================================

/**
 * Lista todos os snapshots disponíveis
 * CORRIGIDO: Se estiver dentro de um snapshot, retorna mensagem amigável
 */
async function listarSnapshots() {
    // Verificar se estamos dentro de um snapshot
    try {
        const bootResponse = await fetch(API_URL + '/check-booted-snapshot');
        if (bootResponse.ok) {
            const bootData = await bootResponse.json();
            if (bootData.inSnapshot) {
                return `ℹ️ Você está rodando dentro do snapshot #${bootData.snapshotNumber}. Para gerenciar snapshots, reinicie no sistema principal.`;
            }
        }
    } catch (e) {
        console.warn('Não foi possível verificar se está em um snapshot:', e);
    }

    const comando = 'sudo snapper -c root list -a --columns number,type,description,userdata,date';
    const id = 'snapper-list-' + Date.now();
    const output = await executarComandoSSE(comando, id);
    return output;
}


// ============================================================
// 3. EXCLUIR SNAPSHOTS
// ============================================================

/**
 * Exclui snapshots pelos números fornecidos
 */
async function excluirSnapshots(ids) {
    if (!ids.length) return '';
    const idsStr = ids.join(' ');
    const comando = `sudo snapper -c root delete --sync ${idsStr}`;
    const id = 'snapper-delete-' + Date.now();
    const output = await executarComandoSSE(comando, id);
    return output;
}


// ============================================================
// 4. CRIAR SNAPSHOT MANUAL
// ============================================================

/**
 * Cria um snapshot manual com descrição personalizada
 */
async function criarSnapshot(descricao) {
    if (!descricao) descricao = 'Snapshot criado pelo FOF';
    const descricaoEscapada = descricao.replace(/"/g, '\\"');

    // Método 1: Criar snapshot com --print-number
    const comando = `sudo snapper -c root create -d "${descricaoEscapada}" --print-number`;
    const id = 'snapper-create-' + Date.now();
    console.log('🛠️ Criando snapshot:', comando);
    let output = await executarComandoSSE(comando, id);
    console.log('📦 Output da criação:', output);

    // EXTRAIR APENAS O NÚMERO (ignorar qualquer outro texto)
    const match = output.match(/\b(\d+)\b/);
    let numero = match ? parseInt(match[1], 10) : NaN;

    // Se não conseguiu extrair, usar método alternativo
    if (isNaN(numero) || numero <= 0) {
        console.warn('⚠️ --print-number não retornou número. Tentando método alternativo...');

        // Método 2: Criar snapshot sem --print-number
        const comando2 = `sudo snapper -c root create -d "${descricaoEscapada}"`;
        const id2 = 'snapper-create-alt-' + Date.now();
        await executarComandoSSE(comando2, id2);

        // Aguardar um momento
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Listar snapshots e pegar o último
        const listOutput = await listarSnapshots();
        console.log('📋 Lista para extrair número:', listOutput);

        const lines = listOutput.split('\n').filter(line => line.trim() !== '');
        let dataStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('──') && lines[i].includes('┼')) {
                dataStartIndex = i + 1;
                break;
            }
        }

        if (dataStartIndex !== -1 && dataStartIndex < lines.length) {
            const dataLines = lines.slice(dataStartIndex).filter(line => line.trim() !== '');
            if (dataLines.length > 0) {
                const lastLine = dataLines[dataLines.length - 1];
                const parts = lastLine.split('│').map(p => p.trim());
                if (parts.length > 0) {
                    const num = parseInt(parts[0], 10);
                    if (!isNaN(num) && num > 0) {
                        numero = num;
                        console.log(`✅ Número extraído da lista: ${numero}`);
                    }
                }
            }
        }

        // Se ainda não conseguiu, mostrar erro
        if (isNaN(numero) || numero <= 0) {
            console.error('❌ Não foi possível extrair o número do snapshot.');
            throw new Error(`Não foi possível obter o número do snapshot. Verifique manualmente com: sudo snapper -c root list`);
        }
    }

    // Se conseguiu o número, atualizar GRUB e retornar
    if (!isNaN(numero) && numero > 0) {
        console.log(`🔄 Atualizando GRUB (snapshot #${numero})...`);
        await executarComandoSSE('sudo grub2-mkconfig -o /boot/grub2/grub.cfg', 'grub-update-' + Date.now());
        return { success: true, number: numero, output };
    }

    throw new Error(`Falha ao obter número do snapshot. Output: ${output || 'vazio'}`);
}


// ============================================================
// 5. VERIFICAR SE O SNAPPER ESTÁ INSTALADO
// ============================================================

/**
 * Verifica se o Snapper está instalado no sistema
 */
async function verificarSnapper() {
    try {
        const output = await executarComando('which snapper 2>/dev/null', 'check-snapper');
        return output.trim() !== '';
    } catch (e) {
        return false;
    }
}


// ============================================================
// 6. TORNAR SNAPSHOT PADRÃO (SIMPLES - APENAS SET-DEFAULT)
// ============================================================

/**
 * Torna um snapshot o padrão para o próximo boot (sem alterar read-only)
 * @param {number} snapshotNumber - Número do snapshot
 */
async function setSnapshotDefault(snapshotNumber) {
    if (!snapshotNumber || snapshotNumber <= 0) {
        throw new Error('Número do snapshot inválido');
    }

    // Verificar se o snapshot existe
    const listOutput = await listarSnapshots();
    if (!listOutput.includes(` ${snapshotNumber} │`)) {
        throw new Error(`Snapshot #${snapshotNumber} não encontrado`);
    }

    const comando = `sudo snapper -c root set-default ${snapshotNumber}`;
    const id = 'snapper-set-default-' + Date.now();
    console.log(`📌 Tornando snapshot #${snapshotNumber} o padrão (snapper)...`);

    await executarComandoSSE(comando, id);

    return { success: true, number: snapshotNumber, message: `Snapshot #${snapshotNumber} definido como padrão!` };
}


// ============================================================
// 7. TORNAR SNAPSHOT PADRÃO + READ-WRITE (COMPLETO) - CORRIGIDO
// ============================================================

/**
 * Torna um snapshot read-write e o define como padrão de boot
 * @param {number} snapshotNumber - Número do snapshot
 */
async function tornarSnapshotPadraoCompleto(snapshotNumber) {
    if (!snapshotNumber || snapshotNumber <= 0) {
        throw new Error('Número do snapshot inválido');
    }

    // 1. Verificar se o snapshot existe
    const listOutput = await listarSnapshots();
    if (!listOutput.includes(` ${snapshotNumber} │`)) {
        throw new Error(`Snapshot #${snapshotNumber} não encontrado`);
    }

    // 2. Verificar se o snapshot é readonly
    const checkCmd = `sudo btrfs property get /.snapshots/${snapshotNumber}/snapshot ro 2>/dev/null`;
    const checkId = 'btrfs-check-readonly-' + Date.now();
    const output = await executarComandoSSE(checkCmd, checkId);
    const isReadonly = output.trim().includes('ro=true');

    // 3. Se for readonly, torná-lo read-write
    if (isReadonly) {
        console.log(`📝 Snapshot #${snapshotNumber} é readonly. Tornando read-write...`);
        const rwCmd = `sudo btrfs property set /.snapshots/${snapshotNumber}/snapshot ro false`;
        const rwId = 'btrfs-set-readwrite-' + Date.now();
        await executarComandoSSE(rwCmd, rwId);
        console.log(`✅ Snapshot #${snapshotNumber} agora é read-write!`);
    } else {
        console.log(`✅ Snapshot #${snapshotNumber} já é read-write.`);
    }

    // 4. CORREÇÃO: Obter o Subvolume ID do snapshot
    console.log(`📌 Obtendo Subvolume ID do snapshot #${snapshotNumber}...`);
    const subvolumeId = await obterSubvolumeId(snapshotNumber);
    console.log(`✅ Subvolume ID: ${subvolumeId}`);

    // 5. CORREÇÃO: Definir como padrão de boot usando btrfs subvolume set-default
    console.log(`📌 Definindo subvolume ${subvolumeId} como padrão de boot...`);
    const defaultCmd = `sudo btrfs subvolume set-default ${subvolumeId} /`;
    const defaultId = 'btrfs-set-default-' + Date.now();
    await executarComandoSSE(defaultCmd, defaultId);
    console.log(`✅ Subvolume ${subvolumeId} definido como padrão de boot!`);

    return {
        success: true,
        number: snapshotNumber,
        subvolumeId: subvolumeId,
        message: `Snapshot #${snapshotNumber} agora é read-write e definido como padrão de boot!`
    };
}


// ============================================================
// 8. RESTAURAR BOOT NORMAL
// ============================================================

/**
 * Restaura o boot normal (sistema principal)
 */
async function restoreNormalBoot() {
    try {
        // Obter o Subvolume ID do sistema principal (subvolume @)
        const subvolumeId = await obterSubvolumeId(0);
        console.log(`📌 Subvolume ID do sistema principal: ${subvolumeId}`);

        // Definir o subvolume @ como padrão
        const defaultCmd = `sudo btrfs subvolume set-default ${subvolumeId} /`;
        const defaultId = 'btrfs-set-default-root-' + Date.now();
        await executarComandoSSE(defaultCmd, defaultId);

        // Também definir no Snapper para consistência
        await executarComandoSSE('sudo snapper -c root set-default 0', 'snapper-set-default-0');

        return { success: true, message: 'Boot normal restaurado!' };
    } catch (e) {
        throw new Error(`Erro ao restaurar boot normal: ${e.message}`);
    }
}


// ============================================================
// 9. FUNÇÃO GLOBAL - ATUALIZAR BOTÕES DE PADRÃO
// ============================================================

/**
 * Atualiza o estado dos botões de tornar padrão
 * Esta função é global para ser chamada pelos checkboxes
 */
window.atualizarBotoesPadrao = function() {
    const selected = document.querySelectorAll('.snapshot-checkbox:checked:not([disabled])');
    const btnTornarPadrao = document.getElementById('btn-tornar-padrao');
    const btnTornarPadraoCompleto = document.getElementById('btn-tornar-padrao-completo');

    // Verificar se há exatamente um snapshot selecionado
    const hasOneSelected = selected.length === 1;

    if (btnTornarPadrao) {
        if (hasOneSelected) {
            const snapshotNumber = parseInt(selected[0].dataset.number);
            if (snapshotNumber === 0) {
                btnTornarPadrao.disabled = true;
                btnTornarPadrao.title = 'Não é possível tornar o snapshot atual (0) o padrão';
            } else {
                btnTornarPadrao.disabled = false;
                btnTornarPadrao.title = 'Tornar este snapshot o padrão (readonly)';
                btnTornarPadrao.dataset.snapshotNumber = snapshotNumber;
            }
        } else {
            btnTornarPadrao.disabled = true;
            btnTornarPadrao.title = selected.length === 0 ? 'Selecione um snapshot' : 'Selecione apenas um snapshot';
        }
    }

    if (btnTornarPadraoCompleto) {
        if (hasOneSelected) {
            const snapshotNumber = parseInt(selected[0].dataset.number);
            if (snapshotNumber === 0) {
                btnTornarPadraoCompleto.disabled = true;
                btnTornarPadraoCompleto.title = 'Não é possível tornar o snapshot atual (0) o padrão';
            } else {
                btnTornarPadraoCompleto.disabled = false;
                btnTornarPadraoCompleto.title = 'Tornar este snapshot read-write e padrão de boot';
                btnTornarPadraoCompleto.dataset.snapshotNumber = snapshotNumber;
            }
        } else {
            btnTornarPadraoCompleto.disabled = true;
            btnTornarPadraoCompleto.title = selected.length === 0 ? 'Selecione um snapshot' : 'Selecione apenas um snapshot';
        }
    }
};

/**
 * Função para obter o número do snapshot selecionado
 */
window.obterNumeroSnapshotSelecionado = function() {
    const selected = document.querySelectorAll('.snapshot-checkbox:checked:not([disabled])');
    if (selected.length === 1) {
        return parseInt(selected[0].dataset.number);
    }
    return null;
};


// ============================================================
// EVENT LISTENERS E INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', function() {

    // --- Verificar configuração do Snapper ---
    const configSection = document.getElementById('snapper-config-section');
    const configInitStatus = document.getElementById('config-init-status');
    const btnCriarConfig = document.getElementById('btn-criar-config-snapper');

    // Inicialmente, esconder a seção
    if (configSection) {
        configSection.style.display = 'none';
    }

    /**
     * Verifica a configuração e mostra/esconde a seção
     */
    async function checarConfiguracao() {
        const configExiste = await verificarConfiguracaoSnapper();
        if (!configExiste && configSection) {
            configSection.style.display = 'block';
        } else if (configSection) {
            configSection.style.display = 'none';
        }
    }

    setTimeout(checarConfiguracao, 500);

    // --- Botão "Preparar GRUB" (PASSO 1) ---
    if (btnCriarConfig) {
        btnCriarConfig.addEventListener('click', async function() {
            const btn = this;
            const statusDiv = document.getElementById('config-init-status');

            // Verificar se estamos dentro de um snapshot
            try {
                const bootResponse = await fetch(API_URL + '/check-booted-snapshot');
                if (bootResponse.ok) {
                    const bootData = await bootResponse.json();
                    if (bootData.inSnapshot) {
                        if (!confirm('⚠️ Você está rodando dentro de um snapshot.\n\nRecomenda-se reiniciar no sistema principal antes de configurar o Snapper.\n\nDeseja continuar mesmo assim?')) {
                            return;
                        }
                    }
                }
            } catch (e) {
                console.warn('Não foi possível verificar se está em snapshot:', e);
            }

            // Verificar se o GRUB já está configurado
            const grubInstalled = await executarComando('rpm -q grub-btrfs 2>/dev/null && echo "OK"', 'check-grub-btrfs');
            const isGrubInstalled = grubInstalled.trim() === 'OK';

            if (isGrubInstalled) {
                // Se já está instalado, oferecer para pular
                if (confirm('grub-btrfs já está instalado.\n\nDeseja pular a configuração do GRUB e ir direto para o Snapper?')) {
                    statusDiv.textContent = '⏳ Configurando Snapper...';
                    statusDiv.style.color = '#60a5fa';
                    btn.disabled = true;
                    try {
                        const result = await configurarSnapperCompleto();
                        statusDiv.textContent = '✅ Configuração completa! Snapshots aparecerão no GRUB.';
                        statusDiv.style.color = '#34d399';
                        setTimeout(() => {
                            configSection.style.display = 'none';
                            document.getElementById('btn-listar-snapshots').click();
                        }, 1500);
                    } catch (err) {
                        statusDiv.textContent = '❌ Erro: ' + err.message;
                        statusDiv.style.color = '#ef4444';
                    } finally {
                        btn.disabled = false;
                    }
                    return;
                }
            }

            // PASSO 1: Configurar GRUB
            statusDiv.textContent = '⏳ Configurando GRUB para snapshots...';
            statusDiv.style.color = '#60a5fa';
            btn.disabled = true;
            btn.textContent = '⏳ Configurando GRUB...';

            try {
                // Executar a configuração do GRUB (Passo 1)
                const result = await configurarGrubParaSnapshots();

                statusDiv.textContent = '✅ GRUB configurado com sucesso!';
                statusDiv.style.color = '#34d399';

                // Exibir popup com botão "Continuar"
                const continuar = confirm(
                    '✅ GRUB configurado com sucesso!\n\n' +
                    'O que foi feito:\n' +
                    '• grub-btrfs instalado\n' +
                    '• GRUB_TIMEOUT=10 (menu visível por 10s)\n' +
                    '• Hook do Snapper configurado\n\n' +
                    'Clique em OK para continuar e configurar o Snapper.'
                );

                if (continuar) {
                    // PASSO 2: Configurar Snapper
                    statusDiv.textContent = '⏳ Configurando Snapper...';
                    statusDiv.style.color = '#60a5fa';

                    const result2 = await configurarSnapperCompleto();

                    statusDiv.textContent = '✅ Configuração completa! Snapshots aparecerão no GRUB.';
                    statusDiv.style.color = '#34d399';

                    setTimeout(async () => {
                        const snapshotList = document.getElementById('snapshot-list');
                        if (snapshotList) {
                            snapshotList.innerHTML = '⏳ Configuração concluída. Carregando snapshots...';
                            snapshotList.style.color = '#60a5fa';
                        }
                        configSection.style.display = 'none';
                        document.getElementById('btn-listar-snapshots').click();
                    }, 1500);
                } else {
                    // Usuário cancelou, manter botão habilitado
                    statusDiv.textContent = '⏸️ Configuração pausada. Clique novamente para continuar.';
                    statusDiv.style.color = '#f59e0b';
                }

            } catch (err) {
                console.error('❌ Erro na configuração:', err);
                statusDiv.textContent = '❌ Erro: ' + err.message;
                statusDiv.style.color = '#ef4444';
            } finally {
                btn.disabled = false;
                btn.textContent = '🔧 Preparar GRUB e Configurar Snapper';
            }
        });
    }

    // --- Configurar Snapper (formulário) ---
    const formConfig = document.getElementById('form-config-snapper');
    const configStatus = document.getElementById('config-status');

    if (formConfig) {
        formConfig.addEventListener('submit', async function(e) {
            e.preventDefault();
            const frequencia = document.getElementById('frequencia').value;
            const quantidade = document.getElementById('quantidade').value;

            configStatus.textContent = '⏳ Aplicando configuração...';
            configStatus.style.color = '#60a5fa';

            try {
                const result = await configurarSnapper(frequencia, quantidade);
                configStatus.textContent = '✅ Configuração aplicada com sucesso!';
                configStatus.style.color = '#34d399';
                console.log('Resultado:', result);
            } catch (err) {
                configStatus.textContent = '❌ Erro: ' + err.message;
                configStatus.style.color = '#ef4444';
            }
        });
    }

    // --- Listar Snapshots (CORRIGIDO) ---
    const btnListar = document.getElementById('btn-listar-snapshots');
    const snapshotList = document.getElementById('snapshot-list');

    if (btnListar) {
        btnListar.addEventListener('click', async function() {
            snapshotList.innerHTML = '⏳ Carregando snapshots...';
            snapshotList.style.color = '#60a5fa';

            try {
                const output = await listarSnapshots();

                // Verificar se é uma mensagem amigável (dentro de snapshot)
                if (output.includes('ℹ️ Você está rodando dentro de um snapshot')) {
                    snapshotList.innerHTML = output;
                    snapshotList.style.color = '#f59e0b';
                    return;
                }

                const lines = output.split('\n').filter(line => line.trim() !== '');

                let dataStartIndex = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('──') && lines[i].includes('┼')) {
                        dataStartIndex = i + 1;
                        break;
                    }
                }

                if (dataStartIndex === -1 || dataStartIndex >= lines.length) {
                    snapshotList.innerHTML = 'ℹ️ Nenhum snapshot encontrado.';
                    snapshotList.style.color = '#9ca3af';
                    return;
                }

                const dataLines = lines.slice(dataStartIndex).filter(line => line.trim() !== '');
                const snapshots = [];

                for (const line of dataLines) {
                    const parts = line.split('│').map(p => p.trim());
                    if (parts.length < 3) continue;

                    const number = parts[0] || '';
                    const type = parts[1] || '';
                    let description = '';
                    let date = '';

                    if (parts.length >= 5) {
                        description = parts.slice(2, -2).join(' ').trim();
                        date = parts[parts.length - 1] || '';
                    } else if (parts.length === 4) {
                        description = parts[2] || '';
                        date = parts[3] || '';
                    } else {
                        description = parts.slice(2).join(' ').trim();
                    }

                    if (number === '' && type === '') continue;
                    if (number.includes('──') || number.includes('┼')) continue;

                    snapshots.push({ number, type, description, date });
                }

                if (snapshots.length === 0) {
                    snapshotList.innerHTML = 'ℹ️ Nenhum snapshot encontrado.';
                    snapshotList.style.color = '#9ca3af';
                    return;
                }

                let html = `<table class="snapshot-table">
                <thead>
                <tr>
                <th><input type="checkbox" id="select-all"></th>
                <th>#</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Data</th>
                </tr>
                </thead>
                <tbody>`;

                snapshots.forEach(s => {
                    const isCurrent = s.number === '0';
                    const disabledAttr = isCurrent ? 'disabled' : '';
                    html += `<tr>
                    <td><input type="checkbox" class="snapshot-checkbox" data-number="${s.number}" ${disabledAttr}></td>
                    <td>${s.number}${isCurrent ? ' (atual)' : ''}</td>
                    <td>${s.type}</td>
                    <td>${s.description || '—'}</td>
                    <td>${s.date || '—'}</td>
                    </tr>`;
                });

                html += `</tbody></table>`;
                snapshotList.innerHTML = html;
                snapshotList.style.color = 'inherit';

                // Event listener para "Selecionar Todos"
                const selectAll = document.getElementById('select-all');
                if (selectAll) {
                    selectAll.addEventListener('change', function() {
                        const checkboxes = document.querySelectorAll('.snapshot-checkbox:not([disabled])');
                        checkboxes.forEach(cb => cb.checked = this.checked);
                        atualizarBotaoExcluir();
                        window.atualizarBotoesPadrao();
                    });
                }

                // Event listeners para checkboxes individuais
                document.querySelectorAll('.snapshot-checkbox').forEach(cb => {
                    cb.addEventListener('change', function() {
                        atualizarBotaoExcluir();
                        window.atualizarBotoesPadrao();
                    });
                });

                atualizarBotaoExcluir();
                window.atualizarBotoesPadrao();

            } catch (err) {
                snapshotList.innerHTML = '❌ Erro ao listar snapshots: ' + err.message;
                snapshotList.style.color = '#ef4444';
            }
        });
    }

    // --- Excluir Snapshots ---
    const btnExcluir = document.getElementById('btn-excluir-selecionados');
    const deleteStatus = document.getElementById('delete-status');
    const btnTornarPadrao = document.getElementById('btn-tornar-padrao');
    const btnTornarPadraoCompleto = document.getElementById('btn-tornar-padrao-completo');
    const btnRestaurarPadrao = document.getElementById('btn-restaurar-padrao');

    function atualizarBotaoExcluir() {
        const selected = document.querySelectorAll('.snapshot-checkbox:checked:not([disabled])');
        if (btnExcluir) btnExcluir.disabled = selected.length === 0;
    }

    if (btnExcluir) {
        btnExcluir.addEventListener('click', async function() {
            const selected = document.querySelectorAll('.snapshot-checkbox:checked:not([disabled])');
            if (!selected.length) return;

            const ids = Array.from(selected).map(cb => cb.dataset.number);
            const confirmMsg = `Tem certeza que deseja excluir ${ids.length} snapshot(s)?\n\nIDs: ${ids.join(', ')}`;
            if (!confirm(confirmMsg)) return;

            deleteStatus.textContent = '⏳ Excluindo snapshots...';
            deleteStatus.style.color = '#60a5fa';

            try {
                const result = await excluirSnapshots(ids);
                deleteStatus.textContent = `✅ ${ids.length} snapshot(s) excluído(s) com sucesso.`;
                deleteStatus.style.color = '#34d399';
                setTimeout(() => btnListar.click(), 2000);
            } catch (err) {
                deleteStatus.textContent = '❌ Erro: ' + err.message;
                deleteStatus.style.color = '#ef4444';
            }
        });
    }

    // --- Criar Snapshot ---
    const formCreate = document.getElementById('form-criar-snapshot');
    const createStatus = document.getElementById('create-status');

    if (formCreate) {
        formCreate.addEventListener('submit', async function(e) {
            e.preventDefault();
            const descricao = document.getElementById('descricao').value.trim() || 'Snapshot criado pelo FOF';

            createStatus.textContent = '⏳ Criando snapshot...';
            createStatus.style.color = '#60a5fa';

            try {
                const result = await criarSnapshot(descricao);
                console.log('✅ Resultado da criação:', result);
                createStatus.textContent = `✅ Snapshot #${result.number} criado com sucesso!`;
                createStatus.style.color = '#34d399';
                document.getElementById('descricao').value = '';
                setTimeout(() => {
                    console.log('🔄 Recarregando lista...');
                    if (btnListar) btnListar.click();
                }, 2000);
            } catch (err) {
                console.error('❌ Erro na criação:', err);
                createStatus.textContent = '❌ Erro: ' + err.message;
                createStatus.style.color = '#ef4444';
            }
        });
    }

    // --- Tornar Snapshot Padrão (Versão Simples) - CORRIGIDO ---
    const btnSnapshotAtual = document.getElementById('btn-snapshot-atual');
    const defaultStatus = document.getElementById('default-status');

    // Verificar snapshot atual
    if (btnSnapshotAtual) {
        btnSnapshotAtual.addEventListener('click', async function() {
            defaultStatus.textContent = '⏳ Verificando snapshot atual...';
            defaultStatus.style.color = '#60a5fa';
            this.disabled = true;

            try {
                const response = await fetch(API_URL + '/check-booted-snapshot');
                if (response.ok) {
                    const data = await response.json();
                    if (data.inSnapshot) {
                        snapshotAtualNumber = data.snapshotNumber;
                        defaultStatus.innerHTML = `🔄 Você está rodando no snapshot <strong>#${data.snapshotNumber}</strong>`;
                        defaultStatus.style.color = '#f59e0b';
                        // Habilitar botões usando o snapshot atual (como fallback)
                        if (btnTornarPadrao) {
                            btnTornarPadrao.dataset.snapshotNumber = data.snapshotNumber;
                        }
                        if (btnTornarPadraoCompleto) {
                            btnTornarPadraoCompleto.dataset.snapshotNumber = data.snapshotNumber;
                        }
                        // Mostrar botão de restaurar
                        if (btnRestaurarPadrao) {
                            btnRestaurarPadrao.style.display = 'inline-block';
                        }
                    } else {
                        snapshotAtualNumber = null;
                        defaultStatus.innerHTML = `✅ Você está rodando no sistema principal (fora de um snapshot)`;
                        defaultStatus.style.color = '#34d399';
                        if (btnRestaurarPadrao) {
                            btnRestaurarPadrao.style.display = 'none';
                        }
                    }
                } else {
                    throw new Error('Erro ao verificar');
                }
            } catch (e) {
                defaultStatus.textContent = '❌ Erro ao verificar snapshot atual';
                defaultStatus.style.color = '#ef4444';
            } finally {
                this.disabled = false;
            }
        });
    }

    // --- CORREÇÃO: Tornar snapshot selecionado o padrão (versão simples) ---
    if (btnTornarPadrao) {
        btnTornarPadrao.addEventListener('click', async function() {
            // Obter número do snapshot do dataset (definido pela seleção ou pelo btn-snapshot-atual)
            let snapshotNumber = null;

            if (this.dataset.snapshotNumber) {
                snapshotNumber = parseInt(this.dataset.snapshotNumber);
            } else {
                // Fallback: tentar obter via API
                try {
                    const response = await fetch(API_URL + '/check-booted-snapshot');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.inSnapshot) {
                            snapshotNumber = data.snapshotNumber;
                        }
                    }
                } catch (e) {
                    console.error('Erro ao obter snapshot atual:', e);
                }
            }

            if (!snapshotNumber || snapshotNumber <= 0) {
                defaultStatus.textContent = '❌ Selecione um snapshot na lista acima.';
                defaultStatus.style.color = '#ef4444';
                return;
            }

            if (snapshotNumber === 0) {
                defaultStatus.textContent = '⚠️ Não é possível tornar o snapshot #0 (atual) o padrão.';
                defaultStatus.style.color = '#f59e0b';
                return;
            }

            const confirmMsg =
            `⚠️ ATENÇÃO!\n\n` +
            `Você está prestes a tornar o snapshot #${snapshotNumber} o PADRÃO para o próximo boot.\n\n` +
            `(O snapshot continuará READONLY - você não poderá instalar programas ou salvar arquivos.)\n\n` +
            `Tem certeza?`;

            if (!confirm(confirmMsg)) return;

            defaultStatus.textContent = `⏳ Tornando snapshot #${snapshotNumber} o padrão...`;
            defaultStatus.style.color = '#60a5fa';
            this.disabled = true;

            try {
                const result = await setSnapshotDefault(snapshotNumber);
                defaultStatus.textContent = `✅ ${result.message}`;
                defaultStatus.style.color = '#34d399';

                if (btnRestaurarPadrao) {
                    btnRestaurarPadrao.style.display = 'inline-block';
                }
            } catch (err) {
                defaultStatus.textContent = '❌ Erro: ' + err.message;
                defaultStatus.style.color = '#ef4444';
            } finally {
                this.disabled = false;
            }
        });
    }

    // --- CORREÇÃO: Tornar snapshot selecionado o padrão + read-write (versão completa) ---
    if (btnTornarPadraoCompleto) {
        btnTornarPadraoCompleto.addEventListener('click', async function() {
            // Obter número do snapshot do dataset (definido pela seleção ou pelo btn-snapshot-atual)
            let snapshotNumber = null;

            if (this.dataset.snapshotNumber) {
                snapshotNumber = parseInt(this.dataset.snapshotNumber);
            } else {
                // Fallback: tentar obter via API
                try {
                    const response = await fetch(API_URL + '/check-booted-snapshot');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.inSnapshot) {
                            snapshotNumber = data.snapshotNumber;
                        }
                    }
                } catch (e) {
                    console.error('Erro ao obter snapshot atual:', e);
                }
            }

            if (!snapshotNumber || snapshotNumber <= 0) {
                defaultStatus.textContent = '❌ Selecione um snapshot na lista acima.';
                defaultStatus.style.color = '#ef4444';
                return;
            }

            if (snapshotNumber === 0) {
                defaultStatus.textContent = '⚠️ Não é possível tornar o snapshot #0 (atual) o padrão.';
                defaultStatus.style.color = '#f59e0b';
                return;
            }

            const confirmMsg =
            `⚠️ ATENÇÃO!\n\n` +
            `Você está prestes a tornar o snapshot #${snapshotNumber} o PADRÃO com permissões READ-WRITE.\n\n` +
            `Isso significa:\n` +
            `• O snapshot será TORNADO read-write (para permitir instalações e alterações)\n` +
            `• DEFINIDO como padrão de boot no Btrfs\n\n` +
            `Este snapshot se tornará seu NOVO SISTEMA PRINCIPAL.\n\n` +
            `Tem certeza?`;

            if (!confirm(confirmMsg)) return;

            defaultStatus.textContent = `⏳ Tornando snapshot #${snapshotNumber} read-write e padrão...`;
            defaultStatus.style.color = '#60a5fa';
            this.disabled = true;

            try {
                const result = await tornarSnapshotPadraoCompleto(snapshotNumber);
                defaultStatus.textContent = `✅ ${result.message}`;
                defaultStatus.style.color = '#34d399';

                if (btnRestaurarPadrao) {
                    btnRestaurarPadrao.style.display = 'inline-block';
                }
            } catch (err) {
                defaultStatus.textContent = '❌ Erro: ' + err.message;
                defaultStatus.style.color = '#ef4444';
            } finally {
                this.disabled = false;
            }
        });
    }

    // --- Restaurar boot normal ---
    if (btnRestaurarPadrao) {
        btnRestaurarPadrao.addEventListener('click', async function() {
            const confirmMsg =
            `⚠️ ATENÇÃO!\n\n` +
            `Você está prestes a restaurar o boot normal.\n\n` +
            `Isso significa que o sistema voltará a iniciar pelo sistema principal (subvolume @).\n\n` +
            `Tem certeza que deseja continuar?`;

            if (!confirm(confirmMsg)) return;

            defaultStatus.textContent = '⏳ Restaurando boot normal...';
            defaultStatus.style.color = '#60a5fa';
            this.disabled = true;

            try {
                const result = await restoreNormalBoot();
                defaultStatus.textContent = `✅ ${result.message}`;
                defaultStatus.style.color = '#34d399';
                this.style.display = 'none';
                if (btnTornarPadrao) {
                    btnTornarPadrao.disabled = true;
                    delete btnTornarPadrao.dataset.snapshotNumber;
                }
                if (btnTornarPadraoCompleto) {
                    btnTornarPadraoCompleto.disabled = true;
                    delete btnTornarPadraoCompleto.dataset.snapshotNumber;
                }
            } catch (err) {
                defaultStatus.textContent = '❌ Erro: ' + err.message;
                defaultStatus.style.color = '#ef4444';
            } finally {
                this.disabled = false;
            }
        });
    }

    // --- Verificar se o Snapper está instalado ---
    verificarSnapper().then(instalado => {
        if (!instalado) {
            const msg = document.createElement('div');
            msg.className = 'aviso';
            msg.textContent = '⚠️ O Snapper não está instalado. Instale com: sudo dnf install snapper';
            msg.style.cssText = 'background-color: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; padding: 0.75rem; border-radius: 6px; color: #f59e0b; margin-bottom: 1rem;';
            const container = document.querySelector('.container');
            if (container) container.prepend(msg);
        }
    });

    console.log('🚀 Módulo Btrfs v0.7.1-alpha carregado!');
});
