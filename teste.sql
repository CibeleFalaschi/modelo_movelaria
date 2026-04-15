--TESTES DO SISTEMA DE GERENCIAMENTO DE VENDAS--

--Inserir empresa--
INSERT INTO Empresa (Nome, CNPJ)
VALUES ('Marcenaria Matriz', '11.111.111/0001-11'),
       ('Marcenaria Filial', '22.222.222/0001-22');

SELECT * FROM Empresa;

DELETE FROM Empresa
WHERE ID IN (1, 2);

SELECT * FROM Empresa;

DELETE FROM Empresa

SELECT * FROM Empresa

ALTER TABLE Empresa AUTO_INCREMENT = 1;

INSERT INTO Empresa (Nome, CNPJ)
VALUES ('Marcenaria Matriz', '11.111.111/0001-11'),
       ('Marcenaria Filial', '22.222.222/0001-22');

SELECT * FROM Empresa;

INSERT INTO Contato (Nome, telefone, Email, Origem)
VALUES 
('João TESTE', '11999999999', 'joaoteste@gmail.com', 'google'),
('Maria TESTE', '11988888888', 'mariatest@gmail.com', 'indicação');

SELECT * FROM Contato;

INSERT INTO Funcionario (nome, cargo, login, senhaHash, ativo)
VALUES 
('Marcia TESTE','Vendedor', 'marciateste', '123', TRUE),
('Ana TESTE', 'Vendedor', 'anatest', '123', TRUE),
('Carlos TESTE', 'Vendedor', 'carlosteste', '123', FALSE);

SELECT * FROM Funcionario;

SELECT * FROM statusorcamento;

INSERT INTO StatusOrcamento (descricao) 
VALUES 
('Em aberto'),
('Em elaboração'),
('Fechado'),
('Perdido'),
('Entregue');

INSERT INTO StatusVisita (descricao)
VALUES
('Em aberto'),
('Em elaboração'),
('Fechado'),
('Perdido'),
('Entregue');

SELECT * FROM StatusVisita;

INSERT INTO StatusProjeto (descricao)
VALUES
('Em planejamento'),
('Em execução'),
('Concluído'),
('Cancelado');

SELECT * FROM StatusProjeto;

INSERT INTO Orcamento 
(IDContato, IDStatusOrcamento, IDFuncionario, IDEmpresa, NumeroOrcamento, DataSolicitacao, 
NecessitaProjeto, NecessitaVisita, Observacao, Valor, DataEntregaOrcamento, DataFechamento)
VALUES
(1, 1, 1, 1, 'ORC-001', '2024-06-01', TRUE, TRUE, 'Orçamento para projeto de cozinha', 5000.00, NULL, NULL);

SELECT * FROM Orcamento;

INSERT INTO Ambiente (IDOrcamento, nome, valor)
VALUES
(1, 'Cozinha', 30000.00),
(1, 'Sala', 20000.00);

SELECT * FROM Ambiente;

DELETE FROM Ambiente
WHERE ID > 2;

SELECT * FROM Ambiente;

UPDATE orcamento
SET Valor = (
    SELECT SUM(valor) FROM Ambiente WHERE IDOrcamento = 1)

    WHERE ID = 1;

SELECT * FROM Orcamento;

--Testando novamente o orçamento para verificar o campo observação--
INSERT INTO Orcamento 
(IDContato, IDStatusOrcamento, IDFuncionario, IDEmpresa, NumeroOrcamento, DataSolicitacao, 
ValorTotal, Observacao)
VALUES
(1, 1, 1, 1, 'TESTE-OBS-RAPIDO', CURDATE (), 0, 'O cliente pediu *urgência* no projeto');

SELECT * FROM Orcamento
WHERE NumeroOrcamento = 'TESTE-OBS-RAPIDO';

SELECT * FROM statusvisita

INSERT INTO Visita (IDOrcamento, IDStatus, DataAgendada, Observacao)
VALUES
(1, 1, NULL, 'Visita para levantamento de medidas');

SELECT * FROM Visita;

UPDATE Visita
SET DataAgendada = CURDATE()
WHERE ID = 1;

--Teste para erro esperado--
INSERT INTO visita (IDOrcamento, IDStatus)
VALUES
(3, 1)

INSERT INTO Projeto (IDOrcamento, IDStatus, NomeProjeto, DataInicio, Observacao)
VALUES
(1, 1, 'Projeto Cozinha', CURDATE(), 'Gabinete, armário aéreo e bancada'),
(1,1, 'Projeto Sala', CURDATE(), 'Rack e painel de TV')

SELECT * FROM Projeto;

DELETE FROM Projeto
WHERE ID = 2;

INSERT INTO Cliente 
(IDContato, CPF_CNPJ, DataNascimento, Profissao, EstadoCivil, Endereco, 
    Cidade, Estado,  Observacao)
VALUES
(1, '123.456.789-00', '1980-01-01', 'Engenheiro', 'Casado', 'Rua Exemplo, 123', 'São Paulo', 'SP', 'Cliente muito exigente');

SELECT * FROM Cliente;

--Teste de duplicidade de cliente, deve dar erro por conta do IDContato único--
INSERT INTO Cliente (IDContato, endereco)
VALUES
(1, 'Rua Exemplo, 123');

--Teste para verificar histórico de orçamento do cliente--
SELECT * FROM orcamento
WHERE IDContato = 1;

INSERT INTO HistoricoOrcamento (IDOrcamento, IDFuncionario, DataRegistro, Observacao, ProximoContato) 
VALUES (1, 1, CURDATE(), 'Cliente interessado, em fase de finalização interna', '2026-05-30');

SELECT * FROM HistoricoOrcamento
WHERE IDOrcamento = 1;

DESC orcamento

INSERT INTO Contato (nome, telefone, email, origem)
VALUES ('João Silva', '(19) 99999-9999', 'joao@email.com', 'instagram');

SELECT * FROM contato

INSERT INTO Cliente (
    IDContato,
    CPF_CNPJ,
    Cidade,
    Estado,
    CodigoCliente,
    IDEmpresa
)
VALUES (
    3,
    '12345678900',
    'Americana',
    'SP',
    491,
    1
);

INSERT INTO Orcamento (
    IDContato,
    IDStatusOrcamento,
    IDFuncionario,
    NumeroOrcamento,
    DataSolicitacao,
    Valor,
    IDEmpresa,
    NumeroSequencial,
    Mes,
    Ano
)
VALUES (
    3, -- mesmo cliente
    1,
    1,
    '2465_05_2026',
    CURDATE(),
    12000.00,
    1,
    2465,
    5,
    2026
);

DESC cliente

INSERT INTO Cliente (
    IDContato,
    CPF_CNPJ,
    Cidade,
    Estado,
    CodigoCliente,
    IDEmpresa,
    DataCadastro
)
VALUES (
    2,
    '99999999900',
    'Campinas',
    'SP',
    492,
    1,
    '2026-03-15'
);

SELECT * FROM cliente

SELECT COUNT(*) AS total_de_clientes
FROM Orcamento
WHERE DataSolicitacao BETWEEN '2026-04-01' AND '2026-04-31';

SELECT IDEmpresa, COUNT(*) AS total
FROM cliente
WHERE DataSolicitacao BETWEEN '2026-03-01' AND '2026-03-31'
GROUP BY IDEmpresa;

SELECT IDEmpresa, COUNT(*) AS total
FROM Cliente
WHERE DataCadastro BETWEEN '2026-03-01' AND '2026-03-31'
GROUP BY IDEmpresa;

INSERT INTO Prospeccao (
    IDFuncionario,
    NomeProspecto,
    Telefone,
    Origem,
    Status
)
VALUES (
    1,
    'Carlos Prospecção',
    '11999999999',
    'Instagram',
    'Em andamento'
);

SELECT * FROM Prospeccao;

INSERT INTO HistoricoProspeccao (
    IDProspeccao,
    TipoAcao,
    Observacao,
    ProximoContato
)
VALUES (
    1,
    'WhatsApp',
    'Mensagem enviada',
    '2026-04-15'
);

INSERT INTO Contato (nome, telefone, email, origem)
VALUES ('Carlos Prospecção', '11999999999', 'carlos@email.com', 'instagram');

UPDATE Prospeccao
SET IDContato = 4, -- usa o ID real
    Status = 'Convertido'
WHERE ID = 1;

SELECT COUNT(*) 
FROM Prospeccao
WHERE IDContato IS NOT NULL;

SHOW CREATE TABLE Orcamento;

SHOW CREATE TABLE Cliente;
SHOW CREATE TABLE Empresa;