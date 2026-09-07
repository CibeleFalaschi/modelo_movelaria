function formatarData(data) {
    if (!data) return '';
    return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
}

function atualizarTabelaVazia(id, colunas) {
    document.getElementById(id).innerHTML = `<tr><td colspan="${colunas}">Nenhum registro encontrado.</td></tr>`;
}

async function carregarDashboard() {
    if (!window.api?.request) return;

    try {
        const [orcamentos, contatos, prospeccoes] = await Promise.all([
            window.api.request('/orcamentos'),
            window.api.request('/contatos'),
            window.api.request('/prospeccoes')
        ]);

        const filtro = document.getElementById('filtro-empresa').value;
        const orcamentosFiltrados = filtro === 'todas'
            ? orcamentos
            : orcamentos.filter(item => (item.empresaNome || item.empresa?.nome || '').toLowerCase() === filtro);
        const statusOrcamento = item => item.statusDescricao || item.status || '';
        const statusProspeccao = item => item.Status || item.status || '';
        const fechados = orcamentosFiltrados.filter(item => statusOrcamento(item) === 'Fechado').length;
        const perdidos = orcamentosFiltrados.filter(item => statusOrcamento(item) === 'Perdido').length;
        const convertidos = prospeccoes.filter(item => statusProspeccao(item) === 'Convertido').length;

        document.getElementById('total-abertos').textContent = orcamentosFiltrados.filter(item => statusOrcamento(item) === 'Em aberto').length;
        document.getElementById('total-fechados').textContent = fechados;
        document.getElementById('total-perdidos').textContent = perdidos;
        document.getElementById('total-clientes').textContent = contatos.length;
        document.getElementById('taxa-conversao').textContent = prospeccoes.length
            ? `${Math.round((convertidos / prospeccoes.length) * 100)}%`
            : '0%';

        const tabelaOrcamentos = document.getElementById('tabela-orcamentos');
        tabelaOrcamentos.innerHTML = '';
        orcamentosFiltrados.filter(item => statusOrcamento(item) === 'Em aberto').forEach(item => {
            const linha = tabelaOrcamentos.insertRow();
            const id = item.ID || item.id;
            linha.insertCell(0).textContent = item.NumeroOrcamento || item.numeroOrcamento || id;
            linha.insertCell(1).textContent = item.contatoNome || item.contato?.nome || '';
            linha.insertCell(2).textContent = formatarMoeda(item.Valor ?? item.valor);
            linha.insertCell(3).textContent = formatarData(item.DataSolicitacao || item.dataSolicitacao);
            linha.insertCell(4).textContent = statusOrcamento(item);
            linha.insertCell(5).innerHTML = `<button class="btn-edit" type="button" onclick="abrirOrcamento(${id})">✏️ Abrir</button>`;
        });
        if (!tabelaOrcamentos.rows.length) atualizarTabelaVazia('tabela-orcamentos', 6);
        atualizarTabelaVazia('tabela-proximos-contatos', 5);
        atualizarTabelaVazia('tabela-visitas', 5);
    } catch (erro) {
        console.error('Erro ao carregar dashboard', erro);
        window.notify?.(erro.message || 'Não foi possível carregar o dashboard.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarDashboard();
    document.getElementById('filtro-empresa').addEventListener('change', carregarDashboard);
});