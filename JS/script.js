function login() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario === "admin" && senha === "123") {
        window.location.href = "home.html";
    } else {
        document.getElementById("erro").innerText = "Login inválido!";
    }
}

function filtrarClientes() {
    // 1. Pega o valor digitado e transforma em minúsculo para facilitar a busca
    let input = document.getElementById("buscaCliente").value.toLowerCase();
    
    // 2. Pega todas as linhas (tr) do corpo da tabela
    let tabela = document.getElementById("tabelaCorpo");
    let linhas = tabela.getElementsByTagName("tr");

    // 3. Percorre cada linha
    for (let i = 0; i < linhas.length; i++) {
        // Pega a coluna do "Cliente" (que é a segunda, índice 1)
        let colunaCliente = linhas[i].getElementsByTagName("td")[1];
        
        if (colunaCliente) {
            let nomeCliente = colunaCliente.textContent || colunaCliente.innerText;
            
            // 4. Se o nome contiver o que foi digitado, mostra. Se não, esconde.
            if (nomeCliente.toLowerCase().indexOf(input) > -1) {
                linhas[i].style.display = "";
            } else {
                linhas[i].style.display = "none";
            }
        }
    }
}
