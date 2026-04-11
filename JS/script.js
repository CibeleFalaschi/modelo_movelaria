
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