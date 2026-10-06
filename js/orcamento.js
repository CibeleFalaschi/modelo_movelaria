// Dados das empresas vêm do banco (GET /empresas); o código publicado não guarda endereço real.
let empresasCadastro = [];
const LOGOS_EMPRESA = {
    apparato: 'imagens/Logo_Apparato.jpg',
    signore: 'imagens/logo_signore_contrato.png'
};

function atualizarDadosImpressao(codigo) {
    const seletor = document.getElementById('empresaSeletor');
    if (typeof codigo === 'string' && [...seletor.options].some(opcao => opcao.value === codigo)) seletor.value = codigo;
    const empresa = seletor.value;
    const logoImg = document.getElementById('logo-img');
    const nomeTxt = document.getElementById('empresa-nome');
    const enderecoTxt = document.getElementById('empresa-endereco');

    const cadastro = empresasCadastro.find(item => item.Codigo === empresa) || {};
    const endereco = [cadastro.Endereco, cadastro.Bairro, cadastro.Cidade].filter(Boolean).join(', ');

    logoImg.src = LOGOS_EMPRESA[empresa] || '';
    nomeTxt.innerText = (cadastro.Nome || empresa).toUpperCase();
    enderecoTxt.innerText = endereco || '___________________';
}

function prepararImpressao(numero, cliente, valor, endereco, telefone, cidade, itens = obterItensDoFormulario()) {
    document.getElementById("p-numero").innerText = numero;

    const hoje = new Date();
    document.getElementById("p-data").innerText = hoje.toLocaleDateString("pt-BR");

    document.getElementById("p-nome").innerText = cliente;
    document.getElementById("p-end").innerText = endereco;
    document.getElementById("p-cidade").innerText = cidade;
    document.getElementById("p-tel").innerText = telefone;

    const corpo = document.getElementById("corpo-print");
    corpo.innerHTML = "";
    let total = 0;

    itens.forEach(item => {
        corpo.innerHTML += `
            <tr>
                <td>${escapeHtml(item.descricao)}</td>
                <td>${formatarMoeda(item.avista)}</td>
                <td>${formatarMoeda(item.prazo)}</td>
            </tr>`;
        total += item.avista;
    });

    document.getElementById("p-total").innerText = formatarMoeda(total);

    const prazo = document.getElementById("prazoEntrega").value;
    const pagamento = document.getElementById("formaPagamento").value;

    document.getElementById("p-prazo").innerText = prazo || "A combinar";
    document.getElementById("p-pagamento").innerText = pagamento || "A combinar";

    document.body.classList.remove('imprimindo-contrato');
    document.body.classList.remove('imprimindo-briefing');
    document.body.classList.add('imprimindo-orcamento-cliente');
    window.print();
    document.body.classList.remove('imprimindo-orcamento-cliente');
}

function obterItensDoFormulario() {
    const nomes = document.getElementsByName("ambiente[]");
    const valores = document.getElementsByName("valor_ambiente[]");
    const obs = document.getElementsByName("obs_ambiente[]");
    const itens = [];

    for (let i = 0; i < nomes.length; i++) {
        const valor = converterMoedaParaNumero(valores[i].value);

        itens.push({
            ambiente: nomes[i].value,
            descricao: obs[i].value,
            avista: valor,
            prazo: valor * 1.1
        });
    }

    return itens;
}

function filtrarClientes() {
    const filtro = document.getElementById("buscaCliente").value.toLowerCase();
    const linhas = document.querySelectorAll("#tabelaCorpo tr");

    linhas.forEach(linha => {
        const nome = linha.cells[1]?.textContent.toLowerCase() || "";
        linha.style.display = nome.includes(filtro) ? "" : "none";
    });
}

function renderizarOrcamentos(orcamentos) {
    const tabela = document.getElementById('tabelaCorpo');
    tabela.innerHTML = '';

    orcamentos.forEach(item => {
        const linha = tabela.insertRow();
        linha.insertCell(0).textContent = item.numeroOrcamento || item.id;
        linha.insertCell(1).textContent = item.contato?.nome || '';
        linha.insertCell(2).textContent = formatarDataBR(item.dataSolicitacao);
        linha.insertCell(3).textContent = formatarMoeda(item.valor || 0);
        linha.insertCell(4).textContent = item.status || '';
        linha.insertCell(5).innerHTML = `<button type="button" onclick="abrirOrcamento(${item.id})">✏️ Editar</button>`
            + `<button type="button" data-imprimir="${item.id}">🖨️ Imprimir</button>`;
        linha.querySelector('[data-imprimir]').addEventListener('click', async () => {
            try {
                const detalhes = await window.api.request(`/orcamentos/${item.id}`);
                atualizarDadosImpressao(detalhes.empresaCodigo);
                const itens = (detalhes.ambientes || []).map(ambiente => ({
                    ambiente: ambiente.nome,
                    descricao: ambiente.observacao ? `${ambiente.nome} - ${ambiente.observacao}` : ambiente.nome,
                    avista: Number(ambiente.valor) || 0,
                    prazo: (Number(ambiente.valor) || 0) * 1.1
                }));
                prepararImpressao(
                    detalhes.numeroOrcamento || item.numeroOrcamento || item.id,
                    detalhes.contato?.nome || item.contato?.nome || '',
                    detalhes.valor || item.valor || 0,
                    detalhes.contato?.endereco?.endereco || '',
                    detalhes.contato?.telefone || '',
                    detalhes.contato?.endereco?.cidade || '',
                    itens
                );
            } catch (erro) {
                alert(`Não foi possível carregar o orçamento: ${erro.message}`);
            }
        });
    });
}

async function carregarOrcamentos() {
    if (!window.api?.request) return;

    try {
        const [orcamentos, empresas] = await Promise.all([
            window.api.request('/orcamentos'),
            window.api.request('/empresas')
        ]);
        empresasCadastro = empresas;
        atualizarDadosImpressao();
        renderizarOrcamentos(orcamentos);
    } catch (erro) {
        console.error('Erro ao carregar orçamentos', erro);
        alert(`Não foi possível carregar os orçamentos: ${erro.message}`);
    }
}

atualizarDadosImpressao();
window.addEventListener('movelaria:api-ready', carregarOrcamentos, { once: true });
if (window.api?.request) carregarOrcamentos();
