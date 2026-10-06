let clienteSelecionado = null;

function abrirEdicaoCliente(idCliente) {
    clienteSelecionado = window.clientes?.find(cliente => cliente.id === idCliente) || null;
    if (!clienteSelecionado) return;

    document.getElementById('secao-lista').style.display = 'none';
    document.getElementById('secao-edicao').style.display = 'block';

    document.getElementById('nome').value = clienteSelecionado.contato?.nome || '';
    document.getElementById('telefone').value = clienteSelecionado.contato?.telefone || '';
    document.getElementById('cpf_cnpj').value = clienteSelecionado.cpfCnpj || '';
    document.getElementById('rg').value = clienteSelecionado.rg || '';
    document.getElementById('data_nascimento').value = String(clienteSelecionado.dataNascimento || '').slice(0, 10);
    document.getElementById('profissao').value = clienteSelecionado.profissao || '';
    document.getElementById('estado_civil').value = clienteSelecionado.estadoCivil || '';
    document.getElementById('endereco').value = clienteSelecionado.endereco?.logradouro || '';
    document.getElementById('cep').value = clienteSelecionado.endereco?.cep || '';
    document.getElementById('cidade').value = clienteSelecionado.cidade || '';
    document.getElementById('estado').value = clienteSelecionado.estado || '';
    document.getElementById('observacao').value = clienteSelecionado.observacao || '';

    window.scrollTo(0, 0);
}

function fecharEdicao() {
    document.getElementById('secao-edicao').style.display = 'none';
    document.getElementById('secao-lista').style.display = 'block';
}

async function salvarCliente() {
    if (!clienteSelecionado || !window.api?.request) {
        alert('Cliente ou API não encontrado.');
        return;
    }

    try {
        await window.api.request(`/clientes/${clienteSelecionado.id}`, {
            method: 'PUT',
            body: {
                idContato: clienteSelecionado.contato.id,
                idEmpresa: clienteSelecionado.empresa?.id || null,
                idEndereco: clienteSelecionado.endereco?.id || null,
                nome: document.getElementById('nome').value.trim(),
                telefone: document.getElementById('telefone').value.trim(),
                cpfCnpj: document.getElementById('cpf_cnpj').value.trim(),
                rg: document.getElementById('rg').value.trim(),
                dataNascimento: document.getElementById('data_nascimento').value || null,
                profissao: document.getElementById('profissao').value.trim(),
                estadoCivil: document.getElementById('estado_civil').value,
                endereco: document.getElementById('endereco').value.trim(),
                cep: document.getElementById('cep').value.trim(),
                cidade: document.getElementById('cidade').value.trim(),
                estado: document.getElementById('estado').value.trim().toUpperCase(),
                observacao: document.getElementById('observacao').value.trim()
            }
        });
        alert('Dados salvos com sucesso.');
        await carregarClientes();
        fecharEdicao();
    } catch (erro) {
        console.error('Erro ao salvar cliente', erro);
        alert(`Não foi possível salvar: ${erro.message}`);
    }
}

function renderizarClientes(clientes) {
    const tabela = document.getElementById('tabela-clientes');
    tabela.innerHTML = '';

    clientes.forEach(cliente => {
        const linha = tabela.insertRow();
        linha.insertCell(0).textContent = cliente.codigoCliente || cliente.id;
        linha.insertCell(1).textContent = cliente.contato?.nome || '';
        linha.insertCell(2).textContent = cliente.contato?.telefone || '';
        linha.insertCell(3).textContent = cliente.cidade || '';
        linha.insertCell(4).textContent = cliente.orcamentos?.length
            ? `${cliente.orcamentos.length} orçamento(s)`
            : '0 orçamentos';
        linha.insertCell(5).innerHTML = `<button class="btn-edit" type="button" onclick="abrirEdicaoCliente(${cliente.id})">✏️ Editar</button>`;
    });
}

async function carregarClientes() {
    if (!window.api?.request) return;

    try {
        window.clientes = await window.api.request('/clientes');
        renderizarClientes(window.clientes);
    } catch (erro) {
        console.error('Erro ao carregar clientes', erro);
        alert(`Não foi possível carregar os clientes: ${erro.message}`);
    }
}

function inicializarClientes() {
    carregarClientes();
    document.getElementById('busca').addEventListener('input', event => {
        const busca = event.target.value.toLowerCase();
        document.querySelectorAll('#tabela-clientes tr').forEach(linha => {
            linha.style.display = linha.cells[1]?.textContent.toLowerCase().includes(busca) ? '' : 'none';
        });
    });
}

window.addEventListener('movelaria:api-ready', inicializarClientes, { once: true });
if (window.api?.request) inicializarClientes();
