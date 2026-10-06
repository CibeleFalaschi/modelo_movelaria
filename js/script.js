function abrirOrcamento(id) {
    window.location.href = `briefing_orcamento.html?id=${id}`;
}

function mostrarAlerta(msg) {
    const alerta = document.getElementById("alerta-sucesso");

    if (!alerta) {
        alert(msg);
        return;
    }

    alerta.innerText = msg;
    alerta.classList.add("mostrar");

    setTimeout(() => {
        alerta.classList.remove("mostrar");
    }, 3000);
}

function escapeHtml(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, caractere => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[caractere]));
}

// Data local (YYYY-MM-DD); toISOString() usa UTC e vira "amanhã" após as 21h no Brasil.
function hojeLocal() {
    const agora = new Date();
    const dois = n => String(n).padStart(2, '0');
    return `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`;
}

function formatarDataBR(data) {
    if (!data) return '';
    return new Date(`${String(data).slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function converterMoedaParaNumero(valor) {
    return parseFloat(
        String(valor || "")
            .replace("R$ ", "")
            .replace(/\./g, "")
            .replace(",", ".")
    ) || 0;
}

function aplicarMascaraMoeda(campo) {
    if (!campo) {
        return;
    }

    campo.addEventListener("input", function () {
        let valor = this.value.replace(/\D/g, "");

        valor = (parseInt(valor || 0) / 100).toFixed(2);
        valor = valor.replace(".", ",");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        this.value = "R$ " + valor;
    });
}
