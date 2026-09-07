let linhaSelecionada = null;
let prospeccaoSelecionadaId = null;

function abrirNovaProspeccao() {
    linhaSelecionada = null;
    prospeccaoSelecionadaId = null;
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("vendedor").value = "";
    document.getElementById("status").value = "Em andamento";
    document.getElementById("overlay").style.display = "flex";
}

function editarProspeccao(botao) {
    linhaSelecionada = botao.closest("tr");
    prospeccaoSelecionadaId = Number(linhaSelecionada.dataset.id);

    document.getElementById("nome").value = linhaSelecionada.cells[1].textContent;
    document.getElementById("telefone").value = linhaSelecionada.cells[2].textContent;
    document.getElementById("status").value = linhaSelecionada.cells[3].textContent;
    document.getElementById("vendedor").value = linhaSelecionada.dataset.funcionarioId || '';

    document.getElementById("overlay").style.display = "flex";
}

async function salvarEdicao() {
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const status = document.getElementById("status").value;
    const vendedor = document.getElementById("vendedor").value || "Vendedor A";

    if (!window.api?.request) {
        alert('API indisponível.');
        return;
    }

    const funcionario = Number(document.getElementById("vendedor").value);
    if (!funcionario) {
        alert('Selecione um funcionário.');
        return;
    }

    try {
        const payload = {
            idFuncionario: funcionario,
            nomeProspecto: nome,
            telefone,
            origem: 'site',
            status: status === 'Realizar novo contato' ? 'Em andamento' : status
        };

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
        const vendedorLinha = linha.cells[4]?.textContent || "";
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
        linha.insertCell(0).textContent = indice + 1;
        linha.insertCell(1).textContent = item.nomeProspecto || '';
        linha.insertCell(2).textContent = item.telefone || '';
        linha.insertCell(3).textContent = item.status || '';
        linha.insertCell(4).textContent = item.funcionario?.nome || '';
        linha.insertCell(5).innerHTML = '<button type="button" onclick="editarProspeccao(this)">✏️</button>'
            + '<button type="button" onclick="abrirHistorico(this)">📋</button>';
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
    }
}

async function carregarFuncionarios() {
    if (!window.api?.request) return;

    try {
        const funcionarios = await window.api.request('/funcionarios');
        const seletor = document.getElementById('vendedor');
        seletor.innerHTML = '<option value="">Selecione</option>';
        funcionarios.forEach(item => seletor.add(new Option(item.nome, item.id)));
    } catch (erro) {
        console.error('Erro ao carregar funcionários', erro);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarFuncionarios();
    carregarProspeccoes();
});
