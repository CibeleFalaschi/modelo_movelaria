function atualizarTabelaVazia(id, colunas) {
    document.getElementById(id).innerHTML = `<tr><td colspan="${colunas}">Nenhum registro encontrado.</td></tr>`;
}

function preencherTabela(id, colunas, linhas) {
    const tbody = document.getElementById(id);
    tbody.innerHTML = '';
    if (!linhas.length) return atualizarTabelaVazia(id, colunas);
    linhas.forEach(valores => {
        const linha = tbody.insertRow();
        valores.forEach((valor, indice) => { linha.insertCell(indice).textContent = valor ?? ''; });
    });
}

function noMesAtual(data) {
    return Boolean(data) && String(data).slice(0, 7) === hojeLocal().slice(0, 7);
}

async function carregarDashboard() {
    if (!window.api?.request) return;

    try {
        const [orcamentos, clientes, prospeccoes, empresas, agenda] = await Promise.all([
            window.api.request('/orcamentos?limit=1000'),
            window.api.request('/clientes'),
            window.api.request('/prospeccoes?limit=1000'),
            window.api.request('/empresas'),
            window.api.request('/dashboard/agenda')
        ]);

        const seletorEmpresa = document.getElementById('filtro-empresa');
        const filtroAtual = seletorEmpresa.value;
        seletorEmpresa.innerHTML = '<option value="todas">Todas</option>';
        empresas.forEach(empresa => {
            const codigo = empresa.Codigo || empresa.codigo || String(empresa.Nome || empresa.nome || '').toLowerCase();
            seletorEmpresa.add(new Option(empresa.Nome || empresa.nome, codigo));
        });
        seletorEmpresa.value = [...seletorEmpresa.options].some(opcao => opcao.value === filtroAtual)
            ? filtroAtual
            : 'todas';

        const filtro = seletorEmpresa.value;
        const orcamentosFiltrados = filtro === 'todas'
            ? orcamentos
            : orcamentos.filter(item => item.empresaCodigo === filtro);
        const statusOrcamento = item => item.statusDescricao || item.status || '';
        const statusProspeccao = item => item.Status || item.status || '';
        const fechados = orcamentosFiltrados.filter(item => statusOrcamento(item) === 'Fechado'
            && noMesAtual(item.dataFechamento || item.dataSolicitacao)).length;
        const perdidos = orcamentosFiltrados.filter(item => statusOrcamento(item) === 'Perdido'
            && noMesAtual(item.dataSolicitacao)).length;
        const convertidos = prospeccoes.filter(item => statusProspeccao(item) === 'Convertido').length;

        document.getElementById('total-abertos').textContent = orcamentosFiltrados.filter(item => statusOrcamento(item) === 'Em aberto').length;
        document.getElementById('total-fechados').textContent = fechados;
        document.getElementById('total-perdidos').textContent = perdidos;
        document.getElementById('total-clientes').textContent = clientes.length;
        document.getElementById('taxa-conversao').textContent = prospeccoes.length
            ? `${Math.round((convertidos / prospeccoes.length) * 100)}%`
            : '0%';

        const tabelaOrcamentos = document.getElementById('tabela-orcamentos');
        tabelaOrcamentos.innerHTML = '';
        orcamentosFiltrados.filter(item => statusOrcamento(item) === 'Em aberto').forEach(item => {
            const linha = tabelaOrcamentos.insertRow();
            const id = Number(item.id);
            linha.insertCell(0).textContent = item.numeroOrcamento || id;
            linha.insertCell(1).textContent = item.contato?.nome || '';
            linha.insertCell(2).textContent = formatarMoeda(item.valor);
            linha.insertCell(3).textContent = formatarDataBR(item.dataSolicitacao);
            linha.insertCell(4).textContent = statusOrcamento(item);
            linha.insertCell(5).innerHTML = `<button class="btn-edit" type="button" onclick="abrirOrcamento(${id})">✏️ Abrir</button>`;
        });
        if (!tabelaOrcamentos.rows.length) atualizarTabelaVazia('tabela-orcamentos', 6);

        const hoje = hojeLocal();
        preencherTabela('tabela-proximos-contatos', 5, agenda.proximosContatos.map(item => [
            item.contato, item.telefone,
            formatarDataBR(item.data) + (item.data < hoje ? ' (atrasado)' : ''),
            item.responsavel, item.observacao
        ]));
        preencherTabela('tabela-visitas', 5, agenda.visitas.map(item => [
            item.contato, item.telefone, item.data ? formatarDataBR(item.data) : 'A agendar',
            item.responsavel, item.status
        ]));
    } catch (erro) {
        console.error('Erro ao carregar dashboard', erro);
        window.notify?.(erro.message || 'Não foi possível carregar o dashboard.', 'error');
    }
}

function inicializarDashboard() {
    carregarDashboard();
    document.getElementById('filtro-empresa').addEventListener('change', carregarDashboard);
}

window.addEventListener('movelaria:api-ready', inicializarDashboard, { once: true });
if (window.api?.request) inicializarDashboard();
