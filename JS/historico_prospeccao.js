function voltar() {
    window.history.back();
}

function abrirNovoHistorico() {
    document.getElementById('overlay-historico').style.display = 'flex';
}

function fecharHistorico() {
    document.getElementById('overlay-historico').style.display = 'none';
}

async function salvarHistorico() {
    const tipo = document.getElementById('tipoAcao').value;
    const obs = document.getElementById('observacaoHist').value;
    const proximo = document.getElementById('proximoContatoHist').value;

    if (!obs.trim()) {
        alert('Informe uma observação.');
        return;
    }

    const prospeccaoId = localStorage.getItem('prospeccaoId');
    if (!prospeccaoId || !window.api?.request) {
        alert('Prospecção ou API não encontrada.');
        return;
    }

    try {
        await window.api.request(`/prospeccoes/${prospeccaoId}/historico`, {
            method: 'POST',
            body: {
                tipoAcao: tipo,
                observacao: obs.trim(),
                proximoContato: proximo || null
            }
        });
        await carregarHistorico();
        fecharHistorico();
    } catch (erro) {
        console.error('Erro ao salvar histórico', erro);
        alert(`Não foi possível salvar: ${erro.message}`);
    }
}

function renderizarHistorico(registros) {
    const tabela = document.getElementById('tabela-historico').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';

    registros.forEach(registro => {
        const linha = tabela.insertRow();
        linha.insertCell(0).innerText = registro.dataAcao
            ? new Date(registro.dataAcao).toLocaleDateString('pt-BR')
            : '';
        linha.insertCell(1).innerText = registro.tipoAcao || '';
        linha.insertCell(2).innerText = registro.observacao || '';
        linha.insertCell(3).innerText = registro.proximoContato
            ? new Date(`${registro.proximoContato}T00:00:00`).toLocaleDateString('pt-BR')
            : '';
    });
}

async function carregarHistorico() {
    const prospeccaoId = localStorage.getItem('prospeccaoId');
    if (!prospeccaoId || !window.api?.request) return;

    try {
        const registros = await window.api.request(`/prospeccoes/${prospeccaoId}/historico`);
        renderizarHistorico(registros);
    } catch (erro) {
        console.error('Erro ao carregar histórico', erro);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nome-contato').textContent = localStorage.getItem('contatoNome') || '';
    carregarHistorico();
});
