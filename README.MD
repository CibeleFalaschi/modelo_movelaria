
# 🪚 Projeto: Modelo Movelaria

Projeto de modelagem de banco de dados para uma movelaria - móveis sob medida, com foco na organização do fluxo comercial — desde o primeiro contato até o fechamento do orçamento.

Desenvolvido com base em um cenário real de empresa familiar, aplicando na prática conhecimentos da graduação em Análise e Desenvolvimento de Sistemas e do curso de Engenharia de Dados (DIO/TOTVS).

---

## 🎯 Objetivo

Organizar o fluxo de vendas da movelaria:

**Contato → Orçamento → Cliente **

O projeto foi desenvolvido como um MVP (Minimum Viable Product), com possibilidade de evolução futura.

---

## 🛠️ Tecnologias utilizadas

- MySQL  
- VS Code  
- QuickDBD  

---

## 🧠 Regras de negócio

- Um contato só se torna cliente após o fechamento do orçamento  
- Um cliente pode ter múltiplos orçamentos  
- Um orçamento pode conter vários ambientes (ex: cozinha, sala)  
- O sistema registra histórico de interações com o cliente  
- Uso de chaves primárias (PK) e estrangeiras (FK) para garantir integridade  

---

## 🧪 Testes realizados

Foram realizados testes para validar o funcionamento do banco:

- Inserção de dados  
- Integridade referencial (FK)  
- Teste de duplicidade (UNIQUE)  
- Relacionamento entre tabelas  
- Simulação de fluxo real do sistema  

O arquivo [teste.sql](teste.sql) contém os cenários utilizados.

---

## 📊 Estrutura do banco

O banco é composto pelas seguintes entidades:

- Contato  
- Empresa 
- Funciocário 
- Orçamento 
- Cliente 
- Ambiente  
- Visita  
- Projeto  
- Histórico do Orçamento  
- Status (Orçamento, Visita, Projeto)  

---

## ⚠️ Observação

O diagrama disponível no repositório pode não refletir 100% a versão mais atual.  
A estrutura completa e últimas atualizações (como IDEmpresa e HistóricoOrçamento) está no arquivo SQL.

## Execução

O frontend é estático e pode ser servido por qualquer servidor HTTP:

```bash
python -m http.server 5500
```

Acesse `http://localhost:5500/index.html`. A API deve estar disponível em `http://localhost:3000/api`.

O frontend pode permanecer em uma pasta/repositório separado da API. Basta iniciar a API na porta
3000 e servir esta pasta na porta 5500. A configuração de integração está em `js/config.js` e
usa `http://localhost:3000/api` automaticamente durante o desenvolvimento local.

## Configuração de produção

Antes da publicação:

- Configure `window.MOVELARIA_CONFIG = { API_BASE: 'https://api.seu-dominio.com/api' }` antes dos módulos JavaScript.
- Publique o frontend somente com HTTPS.
- Restrinja o CORS da API ao domínio do frontend.
- Crie funcionários pelo backend, usando senha criptografada com bcrypt ou Argon2.
- Não use os valores de `teste.sql` como usuários de produção.
- Execute `banco_movelaria.sql` em uma base nova e faça backup antes de qualquer atualização.
- Use um usuário de banco com permissões mínimas, nunca o usuário root.

O frontend não contém a implementação da API. Login, autorização, criação de usuários, hash de senhas, validação final dos dados e controle de uploads devem permanecer no backend.

## Organização dos repositórios

O frontend e o backend são projetos independentes:

```text
CIBELE/
├── modelo_movelaria/       # este projeto
└── modelo_movelaria_API/   # API Node.js
```

Para executar:

1. Inicie o MySQL e a API conforme o README de `modelo_movelaria_API`.
2. Confirme que a API está em `http://localhost:3000/api`.
3. Na pasta deste frontend, execute:

```bash
python -m http.server 5500
```

4. Abra `http://localhost:5500/index.html`.

Em produção, configure `FRONTEND_URL` no backend com o domínio real deste frontend.
O frontend não acessa o banco diretamente; toda comunicação ocorre pela API.

## Versionamento

Este projeto deve possuir seu próprio repositório Git. O backend deve possuir outro repositório.
Os projetos são integrados pelo contrato HTTP documentado no Swagger da API.