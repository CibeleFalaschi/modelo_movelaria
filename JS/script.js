// Para o login
function login() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    if (usuario === '' || senha === '') {
        document.getElementById('erro').innerText = 'Preencha usuário e senha.';
        return;
    }

    window.location.href = 'dashboard.html';
}

// Para o orçamento
function abrirOrcamento(id) {
    window.location.href = `briefing_orcamento.html?id=${id}`;
}

// Para o cliente
function abrirEdicaoCliente(idCliente) {
    document.getElementById('secao-lista').style.display = 'none';
    document.getElementById('secao-edicao').style.display = 'block';

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

let contadorAmbiente = 2;

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

function mostrarAlerta(msg) {
    const alerta = document.getElementById("alerta-sucesso");
    alerta.innerText = msg;
    alerta.classList.add("mostrar");
    setTimeout(() => {
        alerta.classList.remove("mostrar");
    }, 3000);
}

function salvarBriefing() {
    const pagina = window.location.pathname;

    if (pagina.includes("briefing_orcamento.html")) {
        const nome = document.querySelector('input[placeholder="Nome do contato"]');
        if (!nome || nome.value === "") {
            mostrarAlerta("⚠️ Preencha o nome");
            return;
        }
        mostrarAlerta("💾 Briefing salvo!");
    }

    if (pagina.includes("orcamento.html")) {
        const prazo = document.getElementById("prazoEntrega");
        if (!prazo || prazo.value === "") {
            mostrarAlerta("⚠️ Preencha o prazo de entrega");
            return;
        }
        mostrarAlerta("💾 Orçamento salvo!");
    }
}

function atualizarDadosImpressao() {
    const empresa     = document.getElementById('empresaSeletor').value;
    const logoImg     = document.getElementById('logo-img');
    const nomeTxt     = document.getElementById('empresa-nome');
    const enderecoTxt = document.getElementById('empresa-endereco');
    const cabecalho   = document.getElementById('cabecalho-print');

    if (empresa === 'apparato') {
        logoImg.src           = 'imagens/Logo_Apparato.jpg';
        nomeTxt.innerText     = 'APPARATO MOVELARIA';
        enderecoTxt.innerText = 'R. dos Bambus, 000 - Jardim São Paulo, Campinas - SP';
        cabecalho.style.backgroundColor = '#f7941d';
    } else {
        logoImg.src           = 'imagens/logo_signore.jpg';
        nomeTxt.innerText     = 'SIGNORE MOBILI';
        enderecoTxt.innerText = '___________________';
        cabecalho.style.backgroundColor = '#8b4513';
    }
}

function imprimirOrcamento() {
    document.body.classList.remove('imprimindo-contrato');
    document.body.classList.remove('imprimindo-orcamento-cliente');
   
    window.print();
}

function prepararImpressao(numero, cliente, valor, endereco, telefone, cidade) {
    document.getElementById("p-numero").innerText = numero;

    const hoje = new Date();
    document.getElementById("p-data").innerText = hoje.toLocaleDateString("pt-BR");

    document.getElementById("p-nome").innerText   = cliente;
    document.getElementById("p-end").innerText    = endereco;
    document.getElementById("p-cidade").innerText = cidade;
    document.getElementById("p-tel").innerText    = telefone;

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
            </tr>`;
        total += item.avista;
    });

    document.getElementById("p-total").innerText = formatarMoeda(total);

    const prazo    = document.getElementById("prazoEntrega").value;
    const pagamento = document.getElementById("formaPagamento").value;

    document.getElementById("p-prazo").innerText    = prazo || "A combinar";
    document.getElementById("p-pagamento").innerText = pagamento || "A combinar";

    document.body.classList.remove('imprimindo-contrato');
    document.body.classList.remove('imprimindo-briefing');
    document.body.classList.add('imprimindo-orcamento-cliente');
    window.print();
    document.body.classList.remove('imprimindo-orcamento-cliente');
}

function obterItensDoFormulario() {
    const nomes  = document.getElementsByName("ambiente[]");
    const valores = document.getElementsByName("valor_ambiente[]");
    const obs    = document.getElementsByName("obs_ambiente[]");

    const itens = [];

    for (let i = 0; i < nomes.length; i++) {
        itens.push({
            ambiente:  nomes[i].value,
            descricao: obs[i].value,
            avista:    parseFloat(valores[i].value) || 0,
            prazo:     (parseFloat(valores[i].value) || 0) * 1.1
        });
    }

    return itens;
}

// PROSPECÇÃO
let linhaSelecionada = null;
let linhaHistSelecionada = null;

function abrirNovaProspeccao() {
    linhaSelecionada = null;
    document.getElementById("nome").value   = "";
    document.getElementById("telefone").value = "";
    document.getElementById("status").value = "Em andamento";
    document.getElementById("overlay").style.display = "flex";
}

function editarProspeccao(botao) {
    linhaSelecionada = botao.closest("tr");

    document.getElementById("nome").value     = linhaSelecionada.cells[1].textContent;
    document.getElementById("telefone").value = linhaSelecionada.cells[2].textContent;
    document.getElementById("status").value   = linhaSelecionada.cells[3].textContent;

    document.getElementById("overlay").style.display = "flex";
}

function salvarEdicao() {
    const nome     = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const status   = document.getElementById("status").value;

    if (linhaSelecionada) {
        linhaSelecionada.cells[1].textContent = nome;
        linhaSelecionada.cells[2].textContent = telefone;
        linhaSelecionada.cells[3].textContent = status;
    } else {
        const tabela   = document.querySelector("#tabela-prospeccao tbody");
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

function abrirHistorico(botao) {
    const linha = botao.closest("tr");
    const nome = linha.cells[1].textContent;

    localStorage.setItem("contatoNome", nome);

    window.location.href = "historico_prospeccao.html";
}

function abrirNovoHistorico() {
    linhaHistSelecionada = null;
    document.getElementById("tipoAcao").value          = "Ligação";
    document.getElementById("observacaoHist").value    = "";
    document.getElementById("proximoContatoHist").value = "";
    document.getElementById("overlay-historico").style.display = "flex";
}

function editarHistorico(botao) {
    linhaHistSelecionada = botao.closest("tr");

    document.getElementById("tipoAcao").value          = linhaHistSelecionada.cells[1].textContent;
    document.getElementById("observacaoHist").value    = linhaHistSelecionada.cells[2].textContent;
    document.getElementById("proximoContatoHist").value = linhaHistSelecionada.cells[3].textContent;

    document.getElementById("overlay-historico").style.display = "flex";
}

function salvarHistorico() {
    const tipo = document.getElementById("tipoAcao").value;
    const obs  = document.getElementById("observacaoHist").value;
    const prox = document.getElementById("proximoContatoHist").value;
    const hoje = new Date().toLocaleDateString('pt-BR');

    if (linhaHistSelecionada) {
        linhaHistSelecionada.cells[1].textContent = tipo;
        linhaHistSelecionada.cells[2].textContent = obs;
        linhaHistSelecionada.cells[3].textContent = prox;
    } else {
        const tabela   = document.querySelector("#tabela-historico tbody");
        const novaLinha = tabela.insertRow();

        novaLinha.insertCell(0).textContent = hoje;
        novaLinha.insertCell(1).textContent = tipo;
        novaLinha.insertCell(2).textContent = obs;
        novaLinha.insertCell(3).textContent = prox;

        const acoes = novaLinha.insertCell(4);
        acoes.innerHTML = `
    <button onclick="editarProspeccao(this)">✏️</button>
    <button onclick="abrirHistorico(this)">📋</button>
`;
    }
    fecharHistorico();
}

function fecharHistorico() {
    document.getElementById("overlay-historico").style.display = "none";
}

function voltar() {
    window.location.href = "prospeccao.html";
}

function filtrarProspeccoes() {
    const filtro = document.getElementById("inputBusca").value.toLowerCase();
    const linhas = document.querySelectorAll("#tabela-prospeccao tbody tr");

    linhas.forEach(linha => {
        const celulaNome = linha.cells[1];
        if (celulaNome) {
            const textoNome = celulaNome.textContent.toLowerCase();
            linha.style.display = textoNome.includes(filtro) ? "" : "none";
        }
    });
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function verificarStatusContrato(valor) {
    const btn = document.getElementById('btn-contrato');
    if (valor === '3') {
        btn.style.display = 'inline-flex';
    } else {
        btn.style.display = 'none';
    }
}

function gerarContrato() {
    const nome     = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const empresa  = document.getElementById('empresa').value;

    const empresas = {
        apparato: {
            nome:        'APPARATO MÓVEIS SOB MEDIDA',
            cnpj:        '___________________',
            endereco:    'R. dos Bambus, 000',
            bairro:      'Jardim São Paulo',
            cidade:      'Campinas - SP',
            cep:         '13468-120',
            telefone:    '(19) 97134-6269',
            whatsapp:    '19 97134-6269',
            email1:      'contato@apparatomoveissobmedida.com.br',
            email2:      'financeiro@apparatomoveissobmedida.com.br',
            logo:        'imagens/Logo_Apparato.jpg',
            responsavel: 'NATHALIA TREVISAN G. DA F. FIGUEIRA'
        },
        signore: {
            nome:        'SIGNORE MOBILI',
            cnpj:        '___________________',
            endereco:    '___________________',
            bairro:      '___________________',
            cidade:      '___________________',
            cep:         '___________________',
            telefone:    '___________________',
            whatsapp:    '___________________',
            email1:      '___________________',
            email2:      '___________________',
            logo:        'imagens/logo_signore.jpg',
            responsavel: '___________________'
        }
    };

    const emp = empresas[empresa] || empresas['apparato'];

    document.getElementById('c-empresa-nome').innerText      = emp.nome;
    document.getElementById('c-empresa-razao').innerText     = emp.nome;
    document.getElementById('c-empresa-cnpj').innerText      = emp.cnpj;
    document.getElementById('c-empresa-end').innerText       = emp.endereco;
    document.getElementById('c-empresa-bairro').innerText    = emp.bairro;
    document.getElementById('c-empresa-cidade').innerText    = emp.cidade;
    document.getElementById('c-empresa-cep').innerText       = emp.cep;
    document.getElementById('c-empresa-tel').innerText       = emp.telefone;
    document.getElementById('c-empresa-whats').innerText     = emp.whatsapp;
    document.getElementById('c-empresa-email').innerText     = emp.email1;
    document.getElementById('c-empresa-email-fin').innerText = emp.email2;
    document.getElementById('c-empresa-endereco').innerText  = emp.endereco + ' - ' + emp.bairro;
    document.getElementById('c-empresa-telefone').innerText  = emp.telefone;
    document.getElementById('c-empresa-ass').innerText       = emp.responsavel;

    document.getElementById('c-nome').innerText      = nome;
    document.getElementById('c-nome-ass').innerText  = nome;
    document.getElementById('c-telefone').innerText  = telefone;

    const hoje = new Date();
    document.getElementById('c-data').innerText     = hoje.toLocaleDateString('pt-BR');
    document.getElementById('c-data-ass').innerText = hoje.toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    }).toUpperCase();

    const nomes   = document.getElementsByName('ambiente[]');
    const valores = document.getElementsByName('valor_ambiente[]');
    const obs     = document.getElementsByName('obs_ambiente[]');

    let total = 0;
    let linhas = '';

    for (let i = 0; i < nomes.length; i++) {
        const val = Math.round(parseFloat(valores[i].value) * 100) / 100 || 0;
        total += val;
        linhas += `
            <tr>
                <td style="border:1px solid #000; padding:4px 6px;">${nomes[i].value}</td>
                <td style="border:1px solid #000; padding:4px 6px;">${obs[i].value || '—'}</td>
                <td style="border:1px solid #000; padding:4px 6px; text-align:right;">
                    ${formatarMoeda(val)}
                </td>
            </tr>`;
    }

    document.getElementById('c-ambientes').innerHTML = linhas;
    document.getElementById('c-total').innerText     = formatarMoeda(total);
    document.getElementById('c-total-ext').innerText = formatarMoeda(total);

    const entrada  = Math.round(total * 0.5 * 100) / 100;
    const restante = Math.round(total * 0.5 * 100) / 100;
    document.getElementById('c-entrada').innerText  = formatarMoeda(entrada);
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
    logo.src = emp.logo;
}
document.addEventListener("DOMContentLoaded", function () {
    const nome = localStorage.getItem("contatoNome");

    if (nome) {
        const campo = document.getElementById("nome-contato");

        if (campo) {
            campo.textContent = "Cliente: " + nome;
        }
    }
});

