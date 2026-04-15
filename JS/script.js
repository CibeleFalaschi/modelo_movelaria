
// Para o login
    function login() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    // Validação básica
    if (usuario === '' || senha === '') {
        document.getElementById('erro').innerText = 'Preencha usuário e senha.';
        return;
    }

    // Por enquanto redireciona direto - futuramente valida no backend
    window.location.href = 'dashboard.html';
    
}

// Para o orçamento
function abrirOrcamento(id) {
    window.location.href = `contato.html?id=${id}`;
}

// Para o cliente
function abrirEdicaoCliente(idCliente) {
    document.getElementById('secao-lista').style.display = 'none';
    document.getElementById('secao-edicao').style.display = 'block';

    // Futuramente vem do backend
    document.getElementById('nome').value = 'João Silva';
    document.getElementById('telefone').value = '(19) 99999-9999';

    window.scrollTo(0, 0);
}

function fecharEdicao() {
    document.getElementById('secao-edicao').style.display = 'none';
    document.getElementById('secao-lista').style.display = 'block';
}

function salvarCliente() {
    alert('Dados salvos!');
    fecharEdicao();
}

let contadorAmbiente = 2; // começa em 2 porque o primeiro já existe

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
                <input type="number" name="valor_ambiente[]" placeholder="R$ 0,00" step="0.01" style="flex: 1; padding: 5px;">
            </div>
            
            <textarea name="obs_ambiente[]" placeholder="Observações e detalhes..." rows="2" style="width: 100%; box-sizing: border-box; padding: 5px;"></textarea>
        </fieldset>`;
    
    lista.insertAdjacentHTML('beforeend', novoAmbiente);
    contadorAmbiente++;
}

function removerAmbiente(botao) {
    botao.closest('.item-ambiente').remove();
}

function atualizarDadosImpressao() {
    const empresa = document.getElementById('empresaSeletor').value;
    
    const logoImg = document.getElementById('logo-img');
    const nomeTxt = document.getElementById('empresa-nome');
    const enderecoTxt = document.getElementById('empresa-endereco');
    const cnpjTxt = document.getElementById('empresa-cnpj');
    const cabecalho = document.getElementById('cabecalho-print');

    if (empresa === 'apparato') {
        logoImg.src = 'imagens/logo_Apparato.jpg';
        nomeTxt.innerText = 'APPARATO MOVELARIA';
        enderecoTxt.innerText = 'R. dos Bambus, 000 - Jardim Sao Paulo, Campinas - SP, 13468-120';
        cnpjTxt.innerText = 'CNPJ: 11.222.333/0001-00';
        cabecalho.style.backgroundColor = '#f7941d';
    } else {
        logoImg.src = 'imagens/logo_signore.jpg';
        nomeTxt.innerText = 'MOVELARIA MODELO';
        enderecoTxt.innerText = 'Rua Nove de Julho, 000 - Morumbi, São Paulo - SP';
        cnpjTxt.innerText = 'CNPJ: 44.555.666/0001-99';
        cabecalho.style.backgroundColor = '#8b4513';
    }
}

function prepararImpressao(numero, cliente, valor, endereco, telefone, cidade) {

    document.getElementById("p-numero").innerText = numero;

    const hoje = new Date();
    document.getElementById("p-data").innerText = hoje.toLocaleDateString("pt-BR");

    document.getElementById("p-nome").innerText = cliente;
    document.getElementById("p-end").innerText = endereco;
    document.getElementById("p-cidade").innerText = cidade;
    document.getElementById("p-tel").innerText = telefone;

    // tabela simples (sem função externa)
    const corpo = document.getElementById("corpo-print");
    const itens = obterItensDoFormulario();

corpo.innerHTML = "";
let total = 0;

itens.forEach(item => {
    corpo.innerHTML += `
        <tr>
            <td>${item.descricao}</td>
            <td>${formatarMoeda(item.avista)}</td>
            <td>${formatarMoeda(item.prazo)}</td>
        </tr>
    `;

    total += item.avista;
});

document.getElementById("p-total").innerText = formatarMoeda(total);

    // prazo e pagamento simples
    const prazo = document.getElementById("prazoEntrega").value;
    const pagamento = document.getElementById("formaPagamento").value;

    document.getElementById("p-prazo").innerText = prazo || "A combinar";
    document.getElementById("p-pagamento").innerText = pagamento || "A combinar";

    window.print();
}

function obterItensDoFormulario() {

    const nomes = document.getElementsByName("ambiente[]");
    const valores = document.getElementsByName("valor_ambiente[]");
    const obs = document.getElementsByName("obs_ambiente[]");

    const itens = [];

    for (let i = 0; i < nomes.length; i++) {
        itens.push({
            ambiente: nomes[i].value,
            descricao: obs[i].value,
            avista: parseFloat(valores[i].value) || 0,
            prazo: (parseFloat(valores[i].value) || 0) * 1.1
        });
    }

    return itens;
}
//PROSPECÇAO//
let linhaSelecionada = null;
let linhaHistSelecionada = null;

// === FUNÇÕES TELA PROSPECÇÃO ===

function abrirNovaProspeccao() {
    linhaSelecionada = null;
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("status").value = "Em andamento";
    document.getElementById("overlay").style.display = "flex";
}

function editarProspeccao(botao) {
    linhaSelecionada = botao.closest("tr");
    
    document.getElementById("nome").value = linhaSelecionada.cells[1].textContent;
    document.getElementById("telefone").value = linhaSelecionada.cells[2].textContent;
    document.getElementById("status").value = linhaSelecionada.cells[3].textContent;

    document.getElementById("overlay").style.display = "flex";
}

function salvarEdicao() {
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const status = document.getElementById("status").value;

    if (linhaSelecionada) {
        linhaSelecionada.cells[1].textContent = nome;
        linhaSelecionada.cells[2].textContent = telefone;
        linhaSelecionada.cells[3].textContent = status;
    } else {
        const tabela = document.querySelector("#tabela-prospeccao tbody");
        const novaLinha = tabela.insertRow();
        
        novaLinha.insertCell(0).textContent = tabela.rows.length;
        novaLinha.insertCell(1).textContent = nome;
        novaLinha.insertCell(2).textContent = telefone;
        novaLinha.insertCell(3).textContent = status;
        novaLinha.insertCell(4).textContent = "Vendedor A";
        
        const acoes = novaLinha.insertCell(5);
        acoes.innerHTML = `
            <button onclick="editarProspeccao(this)">✏️</button>
            <button onclick="abrirHistorico()">📋</button>
        `;
    }
    fecharModal();
}

function fecharModal() {
    document.getElementById("overlay").style.display = "none";
}

function abrirHistorico() {
    window.location.href = "historico_prospeccao.html";
}

// === FUNÇÕES TELA HISTÓRICO ===

function abrirNovoHistorico() {
    linhaHistSelecionada = null;
    document.getElementById("tipoAcao").value = "Ligação";
    document.getElementById("observacaoHist").value = "";
    document.getElementById("proximoContatoHist").value = "";
    document.getElementById("overlay-historico").style.display = "flex";
}

function editarHistorico(botao) {
    linhaHistSelecionada = botao.closest("tr");

    document.getElementById("tipoAcao").value = linhaHistSelecionada.cells[1].textContent;
    document.getElementById("observacaoHist").value = linhaHistSelecionada.cells[2].textContent;
    document.getElementById("proximoContatoHist").value = linhaHistSelecionada.cells[3].textContent;

    document.getElementById("overlay-historico").style.display = "flex";
}

function salvarHistorico() {
    const tipo = document.getElementById("tipoAcao").value;
    const obs = document.getElementById("observacaoHist").value;
    const prox = document.getElementById("proximoContatoHist").value;
    const hoje = new Date().toLocaleDateString('pt-BR');

    if (linhaHistSelecionada) {
        linhaHistSelecionada.cells[1].textContent = tipo;
        linhaHistSelecionada.cells[2].textContent = obs;
        linhaHistSelecionada.cells[3].textContent = prox;
    } else {
        const tabela = document.querySelector("#tabela-historico tbody");
        const novaLinha = tabela.insertRow();

        novaLinha.insertCell(0).textContent = hoje;
        novaLinha.insertCell(1).textContent = tipo;
        novaLinha.insertCell(2).textContent = obs;
        novaLinha.insertCell(3).textContent = prox;
        
        const acoes = novaLinha.insertCell(4);
        acoes.innerHTML = `<button onclick="editarHistorico(this)">✏️</button>`;
    }
    fecharHistorico();
}

function fecharHistorico() {
    document.getElementById("overlay-historico").style.display = "none";
}

function voltar() {
    window.location.href = "prospeccao.html";
}

// FUNÇÃO DE BUSCA/FILTRO
function filtrarProspeccoes() {
    // 1. Pega o valor da busca
    const filtro = document.getElementById("inputBusca").value.toLowerCase();
    
    // 2. Seleciona apenas as linhas que estão dentro do tbody (ignora o cabeçalho)
    const linhas = document.querySelectorAll("#tabela-prospeccao tbody tr");

    linhas.forEach(linha => {
        // 3. Pegamos o conteúdo da segunda célula (índice 1), que é o Nome
        const celulaNome = linha.cells[1];
        
        if (celulaNome) {
            const textoNome = celulaNome.textContent.toLowerCase();
            
            // 4. Verifica se o que foi digitado está contido no nome
            if (textoNome.includes(filtro)) {
                linha.style.display = ""; // Mostra a linha
            } else {
                linha.style.display = "none"; // Esconde a linha
            }
        }
    });
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}
