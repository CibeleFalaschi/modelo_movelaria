// A implantação pode definir window.MOVELARIA_CONFIG antes dos módulos JS.
const localApi = 'http://localhost:3000/api';
const sameOriginApi = `${window.location.origin}/api`;
const API_BASE = (window.MOVELARIA_CONFIG?.API_BASE
	|| (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
		? localApi
		: sameOriginApi)).replace(/\/+$/, '');

export default API_BASE;
