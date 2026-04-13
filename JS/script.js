
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
        enderecoTxt.innerTSext = 'R. dos Bambus, 000 - Jardim Sao Paulo, Campinas - SP, 13468-120';
        cnpjTxt.innerText = 'CNPJ: 11.222.333/0001-00';
        cabecalho.style.backgroundColor = '#f7941d'; // Laranja
    } else {
        logoImg.src = 'imagens/logo_signore.jpg';
        nomeTxt.innerText = 'MOVELARIA MODELO';
        enderecoTxt.innerText = 'Rua Nove de Julho, 000 - Morumbi, São Paulo - SP'; // Ajuste aqui se souber o endereço da Modelo
        cnpjTxt.innerText = 'CNPJ: 44.555.666/0001-99';
        cabecalho.style.backgroundColor = '#8b4513'; // Marrom
    }
}

function prepararImpressao(numero, cliente, valor, endereco, telefone, cidade) {
    // 1. Atualiza Empresa, Logo e Endereço da Marcenaria
    atualizarDadosImpressao();

    // 2. Preenche os dados do Cliente
    const campoNome = document.getElementById('p-nome');
    const campoEnd  = document.getElementById('p-end');
    const campoTel  = document.getElementById('p-tel');
    const campoCid  = document.getElementById('p-cidade');

    if (campoNome) campoNome.innerText = cliente    || '---';
    if (campoEnd)  campoEnd.innerText  = endereco   || '---';
    if (campoTel)  campoTel.innerText  = telefone   || '---';
    if (campoCid)  campoCid.innerText  = cidade     || '---';

    // 3. Preenche a tabela de valores
    const corpoPrint = document.getElementById('corpo-print');
    if (corpoPrint) {
        corpoPrint.innerHTML = `
            <tr>
                <td>MÓVEIS PLANEJADOS CONFORME PROJETO</td>
                <td>${valor}</td>
                <td>-</td>
            </tr>
        `;
    }

    // 4. Abre a tela de impressão
    window.print();
}


let linhaSelecionada = null;

// abre formulário vazio
function abrirNovaProspeccao() {
    linhaSelecionada = null;

    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";

    document.getElementById("form-prospeccao").style.display = "block";
}

// clicar no ✏️
function editarProspeccao(botao) {

    linhaSelecionada = botao.parentNode.parentNode;

    const nome = linhaSelecionada.cells[1].innerText;
    const telefone = linhaSelecionada.cells[2].innerText;

    document.getElementById("nome").value = nome;
    document.getElementById("telefone").value = telefone;

    document.getElementById("form-prospeccao").style.display = "block";

    // 🔥 ESCONDE A TABELA
    document.querySelector("table").style.display = "table";
}

// salvar edição
function salvarEdicao() {

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const status = document.getElementById("status").value;


linhaSelecionada.cells[4].innerText = status;

    // 👉 SE ESTÁ EDITANDO
    if (linhaSelecionada != null) {

        linhaSelecionada.cells[1].innerText = nome;
        linhaSelecionada.cells[2].innerText = telefone;

        alert("Prospecção atualizada!");

    } else {
        // 👉 SE É NOVA PROSPECÇÃO

        const tabela = document.querySelector("tbody");

        const novaLinha = tabela.rows.length + 1;

 
        alert("Nova prospecção criada!");
    }

    // limpa tudo
    document.getElementById("form-prospeccao").style.display = "none";
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("form-prospeccao").style.display = "none";


    linhaSelecionada = null;
}