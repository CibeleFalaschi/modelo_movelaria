let linhaSelecionada = null;
let prospeccaoSelecionadaId = null;
let prospeccaoConvertida = false;

function definirStatusEditavel(status) {
    const seletor = document.getElementById("status");
    prospeccaoConvertida = status === 'Convertido';
    seletor.value = status;
    // Prospecção convertida já tem orçamento: o status fica travado.
    seletor.disabled = prospeccaoConvertida;
}

function abrirNovaProspeccao() {
    linhaSelecionada = null;
    prospeccaoSelecionadaId = null;
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("empresa").value = "";
    document.getElementById("vendedor").value = "";
    document.getElementById("origem").value = "site";
    definirStatusEditavel("Em andamento");
    document.getElementById("overlay").style.display = "flex";
}

function editarProspeccao(botao) {
    linhaSelecionada = botao.closest("tr");
    prospeccaoSelecionadaId = Number(linhaSelecionada.dataset.id);

    document.getElementById("nome").value = linhaSelecionada.cells[1].textContent;
    document.getElementById("telefone").value = linhaSelecionada.cells[2].textContent;
    definirStatusEditavel(linhaSelecionada.dataset.status);
    document.getElementById("empresa").value = linhaSelecionada.dataset.empresaId || '';
    document.getElementById("vendedor").value = linhaSelecionada.dataset.funcionarioId || '';
    document.getElementById("origem").value = linhaSelecionada.dataset.origem || 'outro';

    document.getElementById("overlay").style.display = "flex";
}

async function salvarEdicao() {
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const status = document.getElementById("status").value;

    if (!window.api?.request) {
        alert('API indisponível.');
        return;
    }

    if (!nome) {
        alert('Informe o nome.');
        return;
    }

    const empresa = Number(document.getElementById("empresa").value);
    if (!empresa) {
        alert('Selecione a empresa.');
        return;
    }

    const funcionario = Number(document.getElementById("vendedor").value);
    if (!funcionario) {
        alert('Selecione um funcionário.');
        return;
    }

    try {
        const payload = {
            idEmpresa: empresa,
            idFuncionario: funcionario,
            nomeProspecto: nome,
            telefone,
            origem: document.getElementById('origem').value
        };
        if (!prospeccaoConvertida) payload.status = status;

        if (prospeccaoSelecionadaId) {
            await window.api.request(`/prospeccoes/${prospeccaoSelecionadaId}`, {
                method: 'PUT',
                body: payload
            });
        } else {
            await window.api.request('/prospeccoes', {
                method: 'POST',
                body: payload
            });
        }

        await carregarProspeccoes();
        fecharModal();
    } catch (erro) {
        console.error('Erro ao salvar prospecção', erro);
        alert(`Não foi possível salvar: ${erro.message}`);
    }
}

function fecharModal() {
    document.getElementById("overlay").style.display = "none";
}

function abrirHistorico(botao) {
    const linha = botao.closest("tr");
    const nome = linha.cells[1].textContent;

    localStorage.setItem("contatoNome", nome);
    localStorage.setItem("prospeccaoId", linha.dataset.id);
    window.location.href = "historico_prospeccao.html";
}

function filtrarProspeccoes() {
    aplicarFiltrosProspeccao();
}

function filtrarPorVendedor() {
    aplicarFiltrosProspeccao();
}

function aplicarFiltrosProspeccao() {
    const busca = document.getElementById("inputBusca").value.toLowerCase();
    const vendedor = document.getElementById("filtro-vendedor").value;
    const linhas = document.querySelectorAll("#tabela-prospeccao tbody tr");

    linhas.forEach(linha => {
        const nome = linha.cells[1]?.textContent.toLowerCase() || "";
        const vendedorLinha = linha.cells[5]?.textContent || "";
        const nomeConfere = nome.includes(busca);
        const vendedorConfere = vendedor === "todos" || vendedorLinha === vendedor;

        linha.style.display = nomeConfere && vendedorConfere ? "" : "none";
    });
}

function renderizarProspeccoes(prospeccoes) {
    const tabela = document.querySelector("#tabela-prospeccao tbody");
    tabela.innerHTML = '';

    prospeccoes.forEach((item, indice) => {
        const linha = tabela.insertRow();
        linha.dataset.id = item.id;
        linha.dataset.funcionarioId = item.funcionario?.id || '';
        linha.dataset.empresaId = item.empresa?.id || '';
        linha.dataset.status = item.status || '';
        linha.dataset.origem = item.origem || '';
        linha.insertCell(0).textContent = indice + 1;
        linha.insertCell(1).textContent = item.nomeProspecto || '';
        linha.insertCell(2).textContent = item.telefone || '';
        linha.insertCell(3).textContent = item.empresa?.nome || '';
        linha.insertCell(4).textContent = item.status || '';
        linha.insertCell(5).textContent = item.funcionario?.nome || '';
        // Já convertida: abre o orçamento gerado. Senão: gera o orçamento quando o contato aceitar a cotação.
        const botaoOrcamento = item.idOrcamento
            ? `<button type="button" title="Abrir orçamento" onclick="location.href='briefing_orcamento.html?id=${Number(item.idOrcamento)}'">📄</button>`
            : `<button type="button" title="Gerar orçamento" onclick="location.href='briefing_orcamento.html?prospeccao=${Number(item.id)}'">➕📄</button>`;
        linha.insertCell(6).innerHTML = '<button type="button" title="Editar" onclick="editarProspeccao(this)">✏️</button>'
            + '<button type="button" title="Histórico" onclick="abrirHistorico(this)">📋</button>'
            + botaoOrcamento;
    });
}

async function carregarProspeccoes() {
    if (!window.api?.request) return;

    try {
        const dados = await window.api.request('/prospeccoes');
        renderizarProspeccoes(dados);
        aplicarFiltrosProspeccao();
    } catch (erro) {
        console.error('Erro ao carregar prospecções', erro);
        alert(`Não foi possível carregar as prospecções: ${erro.message}`);
    }
}

async function carregarEmpresas() {
    if (!window.api?.request) return;

    try {
        const empresas = await window.api.request('/empresas');
        const seletor = document.getElementById('empresa');
        seletor.innerHTML = '<option value="">Selecione</option>';
        empresas.forEach(item => seletor.add(new Option(item.Nome, item.ID)));
    } catch (erro) {
        console.error('Erro ao carregar empresas', erro);
    }
}

async function carregarFuncionarios() {
    if (!window.api?.request) return;

    try {
        const funcionarios = await window.api.request('/funcionarios');
        const seletor = document.getElementById('vendedor');
        seletor.innerHTML = '<option value="">Selecione</option>';
        const ativos = funcionarios.filter(item => item.Ativo);
        ativos.forEach(item => seletor.add(new Option(item.nome, item.ID)));
        const filtro = document.getElementById('filtro-vendedor');
        filtro.innerHTML = '<option value="todos">Todos</option>';
        funcionarios.forEach(item => filtro.add(new Option(item.nome, item.nome)));
    } catch (erro) {
        console.error('Erro ao carregar funcionários', erro);
    }
}

function inicializarProspeccoes() {
    carregarEmpresas();
    carregarFuncionarios();
    carregarProspeccoes();
}

window.addEventListener('movelaria:api-ready', inicializarProspeccoes, { once: true });
if (window.api?.request) inicializarProspeccoes();
