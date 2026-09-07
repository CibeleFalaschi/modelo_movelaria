import { authFetch, clearToken, getToken, logoutRequest } from './api.js';

async function request(path, options = {}) {
    try {
        return await authFetch(path, options);
    } catch (erro) {
        if (erro.status === 401) {
            window.location.href = 'index.html';
        }
        throw erro;
    }
}

window.api = {
    request,
    getToken,
    clearToken,
    logout: logoutRequest
};

window.notify = function notify(message, type = 'info') {
    let container = document.getElementById('notificacoes');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificacoes';
        container.className = 'notificacoes';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notificacao notificacao-${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    window.setTimeout(() => notification.remove(), 4500);
};

window.setLoading = function setLoading(element, loading, label = 'Salvando...') {
    if (!element) return;
    if (loading) {
        element.dataset.originalLabel = element.textContent;
        element.textContent = label;
        element.disabled = true;
        element.classList.add('esta-carregando');
    } else {
        element.textContent = element.dataset.originalLabel || element.textContent;
        element.disabled = false;
        element.classList.remove('esta-carregando');
    }
};

const paginaPublica = /(^|\/)index\.html$/.test(window.location.pathname)
    || window.location.pathname.endsWith('/');

if (!paginaPublica && !getToken()) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.btn-sair').forEach(link => {
        link.addEventListener('click', async event => {
            event.preventDefault();
            await logoutRequest();
            window.location.href = link.href;
        });
    });
});
