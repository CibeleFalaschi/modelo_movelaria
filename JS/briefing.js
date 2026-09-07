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
                <input type="text" name="valor_ambiente[]" placeholder="R$ 0,00" class="campo-moeda" style="flex: 1; padding: 5px;">
            </div>
            <textarea name="obs_ambiente[]" placeholder="Observações e detalhes..." rows="2" style="width: 100%; box-sizing: border-box; padding: 5px;"></textarea>
        </fieldset>`;

    lista.insertAdjacentHTML('beforeend', novoAmbiente);
    contadorAmbiente++;

    const ultimoCampo = lista.querySelector('.item-ambiente:last-child .campo-moeda');
    aplicarMascaraMoeda(ultimoCampo);
}

function removerAmbiente(botao) {
    botao.closest('.item-ambiente').remove();
}

function obterDataAtual() {
    return new Date().toISOString().slice(0, 10);
}

function obterValorTotalAmbientes() {
    return Array.from(document.getElementsByName('valor_ambiente[]'))
        .reduce((total, campo) => total + converterMoedaParaNumero(campo.value), 0);
}

function montarDadosBriefing() {
    const nomes = document.getElementsByName('ambiente[]');
    const valores = document.getElementsByName('valor_ambiente[]');
    const observacoes = document.getElementsByName('obs_ambiente[]');
    const necessitaVisita = document.querySelector('input[name="visita"]:checked')?.value === 'sim';
    const necessitaProjeto = document.querySelector('input[name="projeto"]:checked')?.value === 'sim';
    const funcionario = Number(document.querySelector('[name="id_funcionario"]').value);
    const empresa = Number(document.getElementById('empresa').value);

    return {
        idContato: null,
        dadosContato: {
            nome: document.getElementById('nome').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            email: document.getElementById('email').value.trim(),
            origem: document.getElementById('origem').value
        },
        idFuncionario: funcionario,
        idEmpresa: empresa,
        idStatusOrcamento: Number(document.getElementById('status_orcamento').value),
        dataSolicitacao: document.getElementById('data_contato').value || obterDataAtual(),
        dataEntregaOrcamento: document.querySelector('[name="data_entrega"]').value || null,
        dataFechamento: null,
        valor: obterValorTotalAmbientes(),
        observacao: document.getElementById('observacao').value.trim(),
        necessitaVisita,
        necessitaProjeto,
        ambientes: Array.from(nomes).map((campo, indice) => ({
            nome: campo.value.trim(),
            valor: converterMoedaParaNumero(valores[indice].value),
            observacao: observacoes[indice].value.trim()
        })),
        visita: necessitaVisita ? {
            idStatus: Number(document.querySelector('[name="status_visita"]').value),
            dataAgendada: document.querySelector('[name="data_visita"]').value || null,
            observacao: 'Visita técnica solicitada no briefing'
        } : null,
        projeto: necessitaProjeto ? {
            nomeProjeto: `Projeto - ${document.getElementById('nome').value.trim()}`,
            idStatus: Number(document.querySelector('[name="status_projeto"]').value),
            observacao: document.getElementById('observacao').value.trim()
        } : null,
        obsHistorico: document.querySelector('[name="obs_historico"]').value.trim(),
        proximoContato: document.querySelector('[name="proximo_contato"]').value || null
    };
}

async function enviarArquivosBriefing(idOrcamento) {
    const arquivos = [
        ...Array.from(document.getElementById('arquivos_briefing').files).map(arquivo => ({ arquivo, tipo: 'briefing_inspiracao' })),
        ...Array.from(document.getElementById('arquivos_projeto').files).map(arquivo => ({ arquivo, tipo: 'projeto_tecnico' }))
    ];

    for (const item of arquivos) {
        const formData = new FormData();
        formData.append('arquivo', item.arquivo);
        formData.append('tipo', item.tipo);
        await window.api.request(`/orcamentos/${idOrcamento}/arquivos`, {
            method: 'POST',
            body: formData
        });
    }
}

async function carregarOpcoesBriefing() {
    if (!window.api?.request) return;

    try {
        const [empresas, funcionarios] = await Promise.all([
            window.api.request('/empresas'),
            window.api.request('/funcionarios')
        ]);

        const seletorEmpresa = document.getElementById('empresa');
        seletorEmpresa.innerHTML = '<option value="">Selecionar Empresa</option>';
        empresas.forEach(item => seletorEmpresa.add(new Option(item.nome, item.id)));

        const seletorFuncionario = document.querySelector('[name="id_funcionario"]');
        seletorFuncionario.innerHTML = '<option value="">Selecione o funcionário</option>';
        funcionarios.forEach(item => seletorFuncionario.add(new Option(item.nome, item.id)));
    } catch (erro) {
        console.error('Não foi possível carregar empresas e funcionários', erro);
    }
}

async function salvarBriefing() {
    const nome = document.querySelector('input[placeholder="Nome do contato"]');

    if (!nome || nome.value === "") {
        mostrarAlerta("⚠️ Preencha o nome");
        return;
    }

    if (!window.api?.request) {
        mostrarAlerta('API indisponível. Verifique o servidor.');
        return;
    }

    try {
        const resposta = await window.api.request('/orcamentos', {
            method: 'POST',
            body: montarDadosBriefing()
        });

        if (resposta?.id) {
            await enviarArquivosBriefing(resposta.id);
        }

        mostrarAlerta('💾 Briefing salvo com sucesso!');
    } catch (erro) {
        console.error('Erro ao salvar briefing', erro);
        mostrarAlerta(`Não foi possível salvar: ${erro.message}`);
    }
}

function imprimirOrcamento() {
    document.body.classList.remove('imprimindo-contrato');
    document.body.classList.remove('imprimindo-orcamento-cliente');

    window.print();
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
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const empresa = document.getElementById('empresa').value;

    const empresas = {
        apparato: {
            nome: 'APPARATO MÓVEIS SOB MEDIDA',
            cnpj: '___________________',
            endereco: 'R. dos Bambus, 000',
            bairro: 'Jardim São Paulo',
            cidade: 'Campinas - SP',
            cep: '13468-120',
            telefone: '(19) 97134-6269',
            whatsapp: '19 97134-6269',
            email1: 'contato@apparatomoveissobmedida.com.br',
            email2: 'financeiro@apparatomoveissobmedida.com.br',
            logo: 'imagens/Logo_Apparato.jpg',
            responsavel: 'NATHALIA TREVISAN G. DA F. FIGUEIRA'
        },
        signore: {
            nome: 'SIGNORE MOBILI',
            cnpj: '___________________',
            endereco: '___________________',
            bairro: '___________________',
            cidade: '___________________',
            cep: '___________________',
            telefone: '___________________',
            whatsapp: '___________________',
            email1: '___________________',
            email2: '___________________',
            logo: 'imagens/logo_signore.jpg',
            responsavel: '___________________'
        }
    };

    const emp = empresas[empresa] || empresas['apparato'];

    document.getElementById('c-empresa-nome').innerText = emp.nome;
    document.getElementById('c-empresa-razao').innerText = emp.nome;
    document.getElementById('c-empresa-cnpj').innerText = emp.cnpj;
    document.getElementById('c-empresa-end').innerText = emp.endereco;
    document.getElementById('c-empresa-bairro').innerText = emp.bairro;
    document.getElementById('c-empresa-cidade').innerText = emp.cidade;
    document.getElementById('c-empresa-cep').innerText = emp.cep;
    document.getElementById('c-empresa-tel').innerText = emp.telefone;
    document.getElementById('c-empresa-whats').innerText = emp.whatsapp;
    document.getElementById('c-empresa-email').innerText = emp.email1;
    document.getElementById('c-empresa-email-fin').innerText = emp.email2;
    document.getElementById('c-empresa-endereco').innerText = emp.endereco + ' - ' + emp.bairro;
    document.getElementById('c-empresa-telefone').innerText = emp.telefone;
    document.getElementById('c-empresa-ass').innerText = emp.responsavel;

    document.getElementById('c-nome').innerText = nome;
    document.getElementById('c-nome-ass').innerText = nome;
    document.getElementById('c-telefone').innerText = telefone;

    const hoje = new Date();
    document.getElementById('c-data').innerText = hoje.toLocaleDateString('pt-BR');
    document.getElementById('c-data-ass').innerText = hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).toUpperCase();

    const nomes = document.getElementsByName('ambiente[]');
    const valores = document.getElementsByName('valor_ambiente[]');
    const obs = document.getElementsByName('obs_ambiente[]');

    let total = 0;
    let linhas = '';

    for (let i = 0; i < nomes.length; i++) {
        const val = Math.round(converterMoedaParaNumero(valores[i].value) * 100) / 100;
        total += val;

        linhas += `
            <tr>
                <td style="border:1px solid #000; padding:4px 6px;">${nomes[i].value}</td>
                <td style="border:1px solid #000; padding:4px 6px;">${obs[i].value || '—'}</td>
                <td style="border:1px solid #000; padding:4px 6px; text-align:right;">${formatarMoeda(val)}</td>
            </tr>`;
    }

    document.getElementById('c-ambientes').innerHTML = linhas;
    document.getElementById('c-total').innerText = formatarMoeda(total);
    document.getElementById('c-total-ext').innerText = formatarMoeda(total);

    const entrada = Math.round(total * 0.5 * 100) / 100;
    const restante = Math.round(total * 0.5 * 100) / 100;

    document.getElementById('c-entrada').innerText = formatarMoeda(entrada);
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
    document.querySelectorAll(".campo-moeda").forEach(campo => {
        aplicarMascaraMoeda(campo);
    });

    carregarOpcoesBriefing();
});
