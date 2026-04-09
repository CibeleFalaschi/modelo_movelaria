
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

O arquivo `teste.sql` contém os cenários utilizados.

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