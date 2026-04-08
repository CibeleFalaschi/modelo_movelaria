-- Active: 1775003047502@@127.0.0.1@3306@modelo_movelaria
CREATE DATABASE IF NOT EXISTS MODELO_MOVELARIA;
USE MODELO_MOVELARIA;

/*
Tabela de contatos: Armazena pessoas que ainda não são clientes, só é um cliente quando fecha um orçamenti
*/

CREATE TABLE contato (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    origem VARCHAR(255) NOT NULL COMMENT 'Indica como o contato teve conhecimento da movelaria, como "site", "indicação", "instagran", etc.'
);

DESC contato;

SHOW TABLES;

CREATE TABLE StatusOrcamento (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
);

--inserção dos  status padrão (StatusOrcamento)--
INSERT INTO StatusOrcamento (descricao) VALUES 
('Em aberto'),
('Em elaboração'),
('Fechado'),
('Perdido'),
('Entregue');

CREATE TABLE IF NOT EXISTS Statusvisita (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL,
    observacao TEXT COMMENT 'Campo para observações adicionais sobre o status da visita'
);

--inserção dos  status padrão (StatusVisita)--
INSERT INTO StatusVisita (descricao) VALUES 
('Pendente'),
('Agendada'),
('Realizada'),
('Cancelada');

CREATE TABLE StatusProjeto (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
);

--inserção dos  status padrão (StatusProjeto)--
INSERT INTO StatusProjeto (descricao) VALUES 
('Em planejamento'),
('Em execução'),
('Concluído'),
('Cancelado');