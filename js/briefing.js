let contadorAmbiente = 2;
let orcamentoId = null;
let salvando = false;
// Prospecção que originou este briefing (?prospeccao=ID): ao salvar, ela vira "Convertido".
let prospeccaoOrigemId = null;
// Dados das empresas vêm do banco (nada de endereço/telefone real no código publicado).
let empresasCadastro = [];
// Largura própria por logo: a da Apparato é quadrada (com margem) e a da Signore é horizontal.
const LOGOS_EMPRESA = {
    apparato: { arquivo: 'imagens/Logo_Apparato.jpg', largura: '100px' },
    signore: { arquivo: 'imagens/logo_signore_contrato.png', largura: '140px' }
};

function adicionarAmbiente() {
    const lista = document.getElementById('lista-ambientes');

    const novoAmbiente = `
        <fieldset class="item-ambiente" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
            <legend style="padding: 0 10px; font-weight: bold;">
                Ambiente ${contadorAmbiente}
                <button type="button" onclick="removerAmbiente(this)"
                        style="margin-left: 10px; background: #c0392b; color: white;
                               border: none; border-radius: 4px; cursor: pointer; padding: 2px 8px;">
                    ✖ Remover
                </button>
            </legend>
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input type="text" name="ambiente[]" placeholder="Ex: Quarto Planejado" style="flex: 3; padding: 5px;" required>
                <input type="text" name="valor_ambiente[]" placeholder="R$ 0,00" class="campo-moeda" style="flex: 1; padding: 5px;">
            </div>
            <textarea name="obs_ambiente[]" placeholder="Observações e detalhes..." rows="2" style="width: 100%; box-sizing: border-box; padding: 5px;"></textarea>
        </fieldset>`;

    lista.insertAdjacentHTML('beforeend', novoAmbiente);
    contadorAmbiente++;

    const ultimoCampo = lista.querySelector('.item-ambiente:last-child .campo-moeda');
    aplicarMascaraMoeda(ultimoCampo);
    return lista.querySelector('.item-ambiente:last-child');
}

function removerAmbiente(botao) {
    botao.closest('.item-ambiente').remove();
    atualizarTotal();
}

function atualizarTotal() {
    const total = document.getElementById('total');
    if (total) total.textContent = obterValorTotalAmbientes().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function obterDataAtual() {
    return hojeLocal();
}

function obterValorTotalAmbientes() {
    return Array.from(document.getElementsByName('valor_ambiente[]'))
        .reduce((total, campo) => total + converterMoedaParaNumero(campo.value), 0);
}

function montarDadosBriefing() {
    const nomes = document.getElementsByName('ambiente[]');
    const valores = document.getElementsByName('valor_ambiente[]');
    const observacoes = document.getElementsByName('obs_ambiente[]');
    const necessitaVisita = document.querySelector('input[name="visita"]:checked')?.value === 'sim';
    const necessitaProjeto = document.querySelector('input[name="projeto"]:checked')?.value === 'sim';
    const funcionario = Number(document.querySelector('[name="id_funcionario"]').value);
    const empresa = Number(document.getElementById('empresa').value);

    return {
        idContato: null,
        idProspeccao: orcamentoId ? null : prospeccaoOrigemId,
        dadosContato: {
            nome: document.getElementById('nome').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            email: document.getElementById('email').value.trim(),
            origem: document.getElementById('origem').value
        },
        idFuncionario: funcionario,
        idEmpresa: empresa,
        idStatusOrcamento: Number(document.getElementById('status_orcamento').value),
        dataSolicitacao: document.getElementById('data_contato').value || obterDataAtual(),
        dataEntregaOrcamento: document.querySelector('[name="data_entrega"]').value || null,
        dataFechamento: null,
        valor: obterValorTotalAmbientes(),
        observacao: document.getElementById('observacao').value.trim(),
        necessitaVisita,
        necessitaProjeto,
        ambientes: Array.from(nomes).map((campo, indice) => ({
            nome: campo.value.trim(),
            valor: converterMoedaParaNumero(valores[indice].value),
            observacao: observacoes[indice].value.trim()
        })),
        visita: necessitaVisita ? {
            idStatus: Number(document.querySelector('[name="status_visita"]').value),
            dataAgendada: document.querySelector('[name="data_visita"]').value || null,
            observacao: 'Visita técnica solicitada no briefing'
        } : null,
        projeto: necessitaProjeto ? {
            nomeProjeto: `Projeto - ${document.getElementById('nome').value.trim()}`,
            idStatus: Number(document.querySelector('[name="status_projeto"]').value),
            observacao: document.getElementById('observacao').value.trim()
        } : null,
        obsHistorico: document.querySelector('[name="obs_historico"]').value.trim(),
        proximoContato: document.querySelector('[name="proximo_contato"]').value || null
    };
}

async function enviarArquivosBriefing(idOrcamento) {
    const arquivos = [
        ...Array.from(document.getElementById('arquivos_briefing').files).map(arquivo => ({ arquivo, tipo: 'briefing_inspiracao' })),
        ...Array.from(document.getElementById('arquivos_projeto').files).map(arquivo => ({ arquivo, tipo: 'projeto_tecnico' }))
    ];
    const falhas = [];

    for (const item of arquivos) {
        const formData = new FormData();
        formData.append('tipo', item.tipo);
        formData.append('arquivo', item.arquivo);
        try {
            await window.api.request(`/orcamentos/${idOrcamento}/arquivos`, {
                method: 'POST',
                body: formData,
                timeout: 120000
            });
        } catch (erro) {
            falhas.push(`${item.arquivo.name} (${erro.message})`);
        }
    }
    return falhas;
}

async function abrirArquivo(id) {
    try {
        const blob = await window.api.blob(`/arquivos/${id}/download`);
        window.open(URL.createObjectURL(blob), '_blank');
    } catch (erro) {
        mostrarAlerta(erro.message);
    }
}

function renderizarArquivos(arquivos) {
    const area = document.getElementById('arquivos-existentes');
    if (!area) return;
    if (!arquivos.length) { area.innerHTML = ''; return; }
    area.innerHTML = '<strong>Arquivos já enviados:</strong><ul>'
        + arquivos.map(a => `<li>${escapeHtml(a.nome)} <button type="button" onclick="abrirArquivo(${Number(a.id)})">Abrir</button></li>`).join('')
        + '</ul>';
}

async function carregarOpcoesBriefing() {
    if (!window.api?.request) return;

    try {
        const [empresas, funcionarios, statuses] = await Promise.all([
            window.api.request('/empresas'),
            window.api.request('/funcionarios'),
            window.api.request('/statuses')
        ]);

        empresasCadastro = empresas;
        const seletorEmpresa = document.getElementById('empresa');
        seletorEmpresa.innerHTML = '<option value="">Selecionar Empresa</option>';
        empresas.forEach(item => {
            const opcao = new Option(item.Nome || item.nome, item.ID || item.id);
            opcao.dataset.codigo = item.Codigo || item.codigo || '';
            seletorEmpresa.add(opcao);
        });

        const seletorFuncionario = document.querySelector('[name="id_funcionario"]');
        seletorFuncionario.innerHTML = '<option value="">Selecione o funcionário</option>';
        funcionarios.filter(item => item.Ativo).forEach(item => seletorFuncionario.add(new Option(item.nome, item.ID || item.id)));

        const preencherStatus = (seletor, itens) => {
            const valorAtual = seletor.value;
            seletor.innerHTML = '';
            itens.forEach(item => {
                const opcao = new Option(item.descricao, item.ID || item.id);
                opcao.dataset.codigo = item.codigo || '';
                seletor.add(opcao);
            });
            seletor.value = [...seletor.options].some(opcao => opcao.value === valorAtual)
                ? valorAtual
                : seletor.options[0]?.value || '';
        };
        preencherStatus(document.getElementById('status_orcamento'), statuses.orcamentos || []);
        preencherStatus(document.querySelector('[name="status_visita"]'), statuses.visitas || []);
        preencherStatus(document.querySelector('[name="status_projeto"]'), statuses.projetos || []);
    } catch (erro) {
        console.error('Não foi possível carregar empresas e funcionários', erro);
        mostrarAlerta(`Não foi possível carregar as opções do formulário: ${erro.message}`);
    }
}

function validarBriefing() {
    if (!document.getElementById('empresa').value) return 'Selecione a empresa.';
    if (!document.getElementById('nome').value.trim()) return 'Preencha o nome do contato.';
    if (!document.getElementById('telefone').value.trim()) return 'Preencha o telefone.';
    const email = document.getElementById('email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Informe um e-mail válido.';
    if (!document.getElementById('origem').value) return 'Informe como o contato nos conheceu.';
    if (!document.querySelector('[name="id_funcionario"]').value) return 'Selecione o funcionário responsável.';
    const nomes = Array.from(document.getElementsByName('ambiente[]')).map(campo => campo.value.trim());
    if (!nomes.some(Boolean)) return 'Informe ao menos um ambiente.';
    return null;
}

async function salvarBriefing() {
    if (salvando) return;
    const erroValidacao = validarBriefing();
    if (erroValidacao) {
        mostrarAlerta(`⚠️ ${erroValidacao}`);
        return;
    }

    if (!window.api?.request) {
        mostrarAlerta('API indisponível. Verifique o servidor.');
        return;
    }

    const botao = document.querySelector('.botao-salvar');
    salvando = true;
    window.setLoading?.(botao, true, 'Salvando...');
    try {
        const dados = montarDadosBriefing();
        let idSalvo = orcamentoId;
        if (orcamentoId) {
            await window.api.request(`/orcamentos/${orcamentoId}`, { method: 'PUT', body: dados });
        } else {
            const resposta = await window.api.request('/orcamentos', { method: 'POST', body: dados });
            idSalvo = resposta?.id;
        }

        const falhas = idSalvo ? await enviarArquivosBriefing(idSalvo) : [];
        if (falhas.length) {
            alert(`Briefing salvo, mas alguns arquivos não foram enviados:\n${falhas.join('\n')}`);
        }
        // Recarrega em modo de edição: evita salvar o mesmo briefing duas vezes (duplicando o orçamento).
        window.location.href = `briefing_orcamento.html?id=${idSalvo}&salvo=1`;
    } catch (erro) {
        console.error('Erro ao salvar briefing', erro);
        mostrarAlerta(`Não foi possível salvar: ${erro.message}`);
        window.setLoading?.(botao, false);
        salvando = false;
    }
}

async function carregarOrcamentoParaEdicao(id) {
    try {
        const o = await window.api.request(`/orcamentos/${id}`);
        orcamentoId = o.id;
        document.querySelector('h2').textContent = `📋 Briefing - ${o.numeroOrcamento}`;
        document.getElementById('c-numero').textContent = o.numeroOrcamento;

        const definir = (seletor, valor) => { const el = document.querySelector(seletor); if (el && valor != null) el.value = String(valor); };
        definir('#empresa', o.idEmpresa);
        document.getElementById('empresa').disabled = true;
        definir('#nome', o.contato?.nome);
        definir('#telefone', o.contato?.telefone);
        definir('#email', o.contato?.email);
        definir('#origem', o.contato?.origem);
        definir('#data_contato', o.dataSolicitacao);
        document.getElementById('data_contato').disabled = true;
        definir('#status_orcamento', o.idStatusOrcamento);
        verificarStatusContrato();
        definir('[name="id_funcionario"]', o.idFuncionario);
        definir('[name="data_entrega"]', o.dataEntregaOrcamento);
        definir('#observacao', o.observacao);

        const ambientes = o.ambientes.length ? o.ambientes : [{ nome: '', valor: 0, observacao: '' }];
        const lista = document.getElementById('lista-ambientes');
        lista.querySelectorAll('.item-ambiente').forEach((el, indice) => { if (indice > 0) el.remove(); });
        ambientes.forEach((ambiente, indice) => {
            const bloco = indice === 0 ? lista.querySelector('.item-ambiente') : adicionarAmbiente();
            bloco.querySelector('[name="ambiente[]"]').value = ambiente.nome;
            bloco.querySelector('[name="valor_ambiente[]"]').value = ambiente.valor
                ? formatarMoeda(ambiente.valor).replace(/\u00a0/g, ' ') : '';
            bloco.querySelector('[name="obs_ambiente[]"]').value = ambiente.observacao || '';
        });
        atualizarTotal();

        if (o.visita) {
            document.querySelector('input[name="visita"][value="sim"]').checked = true;
            definir('[name="status_visita"]', o.visita.idStatus);
            definir('[name="data_visita"]', o.visita.dataAgendada);
        }
        if (o.projeto) {
            document.querySelector('input[name="projeto"][value="sim"]').checked = true;
            definir('[name="status_projeto"]', o.projeto.idStatus);
        }
        document.querySelectorAll('input[name="visita"], input[name="projeto"]').forEach(radio => radio.dispatchEvent(new Event('change', { bubbles: true })));

        const ultimo = o.historico?.[0];
        if (ultimo) {
            const anotacao = document.querySelector('[name="obs_historico"]');
            anotacao.placeholder = `Último registro: ${ultimo.observacao}`;
        }

        renderizarArquivos(await window.api.request(`/orcamentos/${id}/arquivos`));
        if (new URLSearchParams(window.location.search).get('salvo')) mostrarAlerta('💾 Briefing salvo com sucesso!');
    } catch (erro) {
        console.error('Erro ao carregar orçamento', erro);
        mostrarAlerta(`Não foi possível carregar o orçamento: ${erro.message}`);
    }
}

function imprimirOrcamento() {
    document.body.classList.remove('imprimindo-contrato');
    document.body.classList.remove('imprimindo-orcamento-cliente');

    window.print();
}

function verificarStatusContrato() {
    const btn = document.getElementById('btn-contrato');
    const opcao = document.getElementById('status_orcamento').selectedOptions[0];

    btn.style.display = opcao?.dataset.codigo === 'fechado' ? 'inline-flex' : 'none';
}

function gerarContrato() {
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const idEmpresa = Number(document.getElementById('empresa').value);
    const cadastro = empresasCadastro.find(item => Number(item.ID) === idEmpresa) || {};
    // Campo sem cadastro sai como linha em branco para preenchimento à mão.
    const campo = valor => valor || '___________________';
    const emp = {
        nome: (cadastro.Nome || '').toUpperCase(),
        cnpj: campo(cadastro.CNPJ),
        endereco: campo(cadastro.Endereco),
        bairro: campo(cadastro.Bairro),
        cidade: campo(cadastro.Cidade),
        cep: campo(cadastro.CEP),
        telefone: campo(cadastro.Telefone),
        whatsapp: campo(cadastro.Whatsapp),
        email1: campo(cadastro.Email),
        email2: campo(cadastro.EmailFinanceiro),
        responsavel: campo(cadastro.Responsavel),
        logo: LOGOS_EMPRESA[cadastro.Codigo] || { arquivo: '', largura: '100px' }
    };

    document.getElementById('c-empresa-nome').innerText = emp.nome;
    document.getElementById('c-empresa-razao').innerText = emp.nome;
    document.getElementById('c-empresa-cnpj').innerText = emp.cnpj;
    document.getElementById('c-empresa-end').innerText = emp.endereco;
    document.getElementById('c-empresa-bairro').innerText = emp.bairro;
    document.getElementById('c-empresa-cidade').innerText = emp.cidade;
    document.getElementById('c-empresa-cep').innerText = emp.cep;
    document.getElementById('c-empresa-tel').innerText = emp.telefone;
    document.getElementById('c-empresa-whats').innerText = emp.whatsapp;
    document.getElementById('c-empresa-email').innerText = emp.email1;
    document.getElementById('c-empresa-email-tab').innerText = emp.email1;
    document.getElementById('c-empresa-email-fin').innerText = emp.email2;
    document.getElementById('c-empresa-endereco').innerText = emp.endereco + ' - ' + emp.bairro;
    document.getElementById('c-empresa-telefone').innerText = emp.telefone;
    document.getElementById('c-empresa-ass').innerText = emp.responsavel;

    document.getElementById('c-nome').innerText = nome;
    document.getElementById('c-nome-ass').innerText = nome;
    document.getElementById('c-telefone').innerText = telefone;

    const hoje = new Date();
    document.getElementById('c-data').innerText = hoje.toLocaleDateString('pt-BR');
    document.getElementById('c-data-ass').innerText = hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).toUpperCase();

    const nomes = document.getElementsByName('ambiente[]');
    const valores = document.getElementsByName('valor_ambiente[]');
    const obs = document.getElementsByName('obs_ambiente[]');

    let total = 0;
    let linhas = '';

    for (let i = 0; i < nomes.length; i++) {
        const val = Math.round(converterMoedaParaNumero(valores[i].value) * 100) / 100;
        total += val;

        linhas += `
            <tr>
                <td style="border:1px solid #000; padding:4px 6px;">${escapeHtml(nomes[i].value)}</td>
                <td style="border:1px solid #000; padding:4px 6px;">${escapeHtml(obs[i].value) || '—'}</td>
                <td style="border:1px solid #000; padding:4px 6px; text-align:right;">${formatarMoeda(val)}</td>
            </tr>`;
    }

    document.getElementById('c-ambientes').innerHTML = linhas;
    document.getElementById('c-total').innerText = formatarMoeda(total);
    document.getElementById('c-total-ext').innerText = formatarMoeda(total);

    const entrada = Math.round(total * 0.5 * 100) / 100;
    const restante = Math.round(total * 0.5 * 100) / 100;

    document.getElementById('c-entrada').innerText = formatarMoeda(entrada);
    document.getElementById('c-restante').innerText = formatarMoeda(restante);

    const logo = document.getElementById('c-logo');

    logo.onload = function() {
        document.body.classList.add('imprimindo-contrato');
        window.print();
        document.body.classList.remove('imprimindo-contrato');
    };

    logo.onerror = function() {
        document.body.classList.add('imprimindo-contrato');
        window.print();
        document.body.classList.remove('imprimindo-contrato');
    };

    logo.style.setProperty('width', emp.logo.largura, 'important');
    logo.src = emp.logo.arquivo;
}

async function inicializarBriefing() {
    document.querySelectorAll(".campo-moeda").forEach(campo => {
        aplicarMascaraMoeda(campo);
    });
    document.getElementById('lista-ambientes').addEventListener('input', atualizarTotal);

    await carregarOpcoesBriefing();
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get('id');
    if (id) await carregarOrcamentoParaEdicao(id);
    else if (parametros.get('prospeccao')) await carregarProspeccaoParaBriefing(parametros.get('prospeccao'));
}

// Prospecção aceita: o contato enviou as informações para cotação e vira orçamento.
async function carregarProspeccaoParaBriefing(id) {
    try {
        const p = await window.api.request(`/prospeccoes/${id}`);
        if (p.idOrcamento) {
            window.location.href = `briefing_orcamento.html?id=${p.idOrcamento}`;
            return;
        }
        prospeccaoOrigemId = p.id;
        document.querySelector('h2').textContent = `📋 Briefing - Prospecção de ${p.nomeProspecto}`;
        const definir = (seletor, valor) => { const el = document.querySelector(seletor); if (el && valor != null) el.value = String(valor); };
        definir('#empresa', p.empresa?.id);
        definir('#nome', p.nomeProspecto);
        definir('#telefone', p.telefone);
        definir('#origem', 'prospeccao');
        definir('[name="id_funcionario"]', p.funcionario?.id);
    } catch (erro) {
        console.error('Erro ao carregar prospecção', erro);
        mostrarAlerta(`Não foi possível carregar a prospecção: ${erro.message}`);
    }
}

window.addEventListener('movelaria:api-ready', inicializarBriefing, { once: true });
if (window.api?.request) inicializarBriefing();
