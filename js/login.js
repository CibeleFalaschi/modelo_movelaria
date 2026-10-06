import { loginRequest, setToken } from './api.js';

async function login() {
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    const botao = document.querySelector('.btn');

    const erroEl = document.getElementById('erro');
    erroEl.innerText = '';

    if (usuario === '' || senha === '') {
        erroEl.innerText = 'Preencha usuário e senha.';
        return;
    }

    try {
        botao.disabled = true;
        botao.classList.add('esta-carregando');
        botao.textContent = 'Entrando...';
        const body = await loginRequest(usuario, senha);
        if (body && body.token) {
            setToken(body.token);
            window.location.href = 'dashboard.html';
            return;
        }
        erroEl.innerText = 'Resposta inválida do servidor.';
    } catch (err) {
        if (err && err.status === 401) erroEl.innerText = 'Usuário ou senha inválidos.';
        else erroEl.innerText = err.message || 'Erro ao autenticar. Tente novamente.';
        console.error('Login error', err);
    } finally {
        botao.disabled = false;
        botao.classList.remove('esta-carregando');
        botao.textContent = 'Entrar';
    }
}

window.login = login;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('senha').addEventListener('keydown', event => {
        if (event.key === 'Enter') login();
    });
});
