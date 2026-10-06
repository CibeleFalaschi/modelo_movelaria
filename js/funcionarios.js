let funcionarios = [];
let editandoId = null;

function gerarSenha() {
    const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const bytes = crypto.getRandomValues(new Uint32Array(10));
    document.getElementById('senha').value = Array.from(bytes, n => letras[n % letras.length]).join('');
}

function mostrarLista() {
    document.getElementById('secao-form').style.display = 'none';
    document.getElementById('secao-lista').style.display = 'block';
}

function fecharFormulario() {
    mostrarLista();
}

function abrirFormulario(titulo) {
    document.getElementById('titulo-form').textContent = titulo;
    document.getElementById('secao-lista').style.display = 'none';
    document.getElementById('secao-form').style.display = 'block';
    window.scrollTo(0, 0);
}

function novoFuncionario() {
    editandoId = null;
    ['nome', 'cargo', 'login', 'senha'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('perfil').value = 'funcionario';
    document.getElementById('ativo').value = '1';
    document.getElementById('legenda-senha').textContent = 'Senha (obrigatória)';
    abrirFormulario('Novo funcionário');
}

function editarFuncionario(id) {
    const f = funcionarios.find(item => item.ID === id);
    if (!f) return;
    editandoId = id;
    document.getElementById('nome').value = f.nome || '';
    document.getElementById('cargo').value = f.cargo || '';
    document.getElementById('login').value = f.login || '';
    document.getElementById('perfil').value = f.Perfil;
    document.getElementById('ativo').value = f.Ativo ? '1' : '0';
    document.getElementById('senha').value = '';
    document.getElementById('legenda-senha').textContent = 'Redefinir senha (deixe em branco para manter a atual)';
    abrirFormulario(`Editar - ${f.nome}`);
}

async function salvarFuncionario() {
    const nome = document.getElementById('nome').value.trim();
    const login = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value;

    if (!nome || !login) return alert('Informe nome e login.');
    if (!editandoId && senha.length < 6) return alert('Informe uma senha de ao menos 6 caracteres (ou use "Gerar senha").');
    if (senha && senha.length < 6) return alert('A senha deve ter ao menos 6 caracteres.');

    const corpo = {
        nome,
        login,
        cargo: document.getElementById('cargo').value.trim(),
        perfil: document.getElementById('perfil').value,
        ativo: document.getElementById('ativo').value === '1'
    };
    if (senha) corpo.senha = senha;

    try {
        if (editandoId) {
            await window.api.request(`/funcionarios/${editandoId}`, { method: 'PUT', body: corpo });
        } else {
            await window.api.request('/funcionarios', { method: 'POST', body: corpo });
        }
        alert(senha
            ? `Salvo. Login: ${login}\nSenha: ${senha}\n\nAnote agora: depois não será possível consultá-la.`
            : 'Dados salvos com sucesso.');
        mostrarLista();
        await carregarFuncionarios();
    } catch (erro) {
        alert(`Não foi possível salvar: ${erro.message}`);
    }
}

async function alternarSituacao(id) {
    const f = funcionarios.find(item => item.ID === id);
    if (!f) return;
    const acao = f.Ativo ? 'inativar' : 'reativar';
    if (!confirm(`Deseja ${acao} ${f.nome}?`)) return;
    try {
        await window.api.request(`/funcionarios/${id}`, { method: 'PUT', body: { ativo: !f.Ativo } });
        await carregarFuncionarios();
    } catch (erro) {
        alert(`Não foi possível alterar: ${erro.message}`);
    }
}

async function excluirFuncionario(id) {
    const f = funcionarios.find(item => item.ID === id);
    if (!f) return;
    if (!confirm(`Excluir ${f.nome} definitivamente? Esta ação não pode ser desfeita.`)) return;
    try {
        await window.api.request(`/funcionarios/${id}`, { method: 'DELETE' });
        await carregarFuncionarios();
    } catch (erro) {
        alert(erro.message);
    }
}

function renderizarFuncionarios() {
    const tabela = document.getElementById('tabela-funcionarios');
    tabela.innerHTML = '';
    funcionarios.forEach(f => {
        const linha = tabela.insertRow();
        linha.insertCell(0).textContent = f.nome;
        linha.insertCell(1).textContent = f.login;
        linha.insertCell(2).textContent = f.cargo || '';
        linha.insertCell(3).textContent = f.Perfil === 'admin' ? 'Administrador' : 'Funcionário';
        linha.insertCell(4).textContent = f.Ativo ? 'Ativo' : 'Inativo';
        linha.insertCell(5).innerHTML = `<button class="btn-edit" type="button" onclick="editarFuncionario(${f.ID})">✏️ Editar</button> `
            + `<button type="button" onclick="alternarSituacao(${f.ID})">${f.Ativo ? '⏸ Inativar' : '▶ Reativar'}</button> `
            + `<button type="button" onclick="excluirFuncionario(${f.ID})">🗑️ Excluir</button>`;
    });
}

async function carregarFuncionarios() {
    try {
        funcionarios = await window.api.request('/funcionarios');
        renderizarFuncionarios();
    } catch (erro) {
        alert(`Não foi possível carregar os funcionários: ${erro.message}`);
    }
}

function inicializarFuncionarios() {
    // A API é quem barra de verdade; aqui só evitamos mostrar a tela a quem não é admin.
    if (window.api.perfil() !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }
    carregarFuncionarios();
}

window.addEventListener('movelaria:api-ready', inicializarFuncionarios, { once: true });
if (window.api?.request) inicializarFuncionarios();
