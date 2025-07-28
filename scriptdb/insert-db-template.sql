USE db_pi_keyloan;

-- Inserção na tabela tb_cargo
INSERT INTO tb_cargo (descricao_cargo) VALUES
('Síndico'), ('Zelador'), ('Porteiro'), ('Morador'), ('Administrador'),
('Manutenção'), ('Segurança'), ('Faxineiro'), ('Visitante'), ('Conselheiro');

SELECT * FROM tb_cargo;

-- Inserção na tabela tb_usuario
INSERT INTO tb_usuario (perfil_adm, prontuario, nome, email, autoriza_alerta, status_usuario, fk_cargo) VALUES
(TRUE, 'PR001', 'João da Silva', 'joao.silva@email.com', TRUE, TRUE, 1),
(FALSE, 'PR002', 'Maria Oliveira', 'maria.oliveira@email.com', TRUE, TRUE, 4),
(FALSE, 'PR003', 'Carlos Souza', 'carlos.souza@email.com', FALSE, TRUE, 4),
(FALSE, 'PR004', 'Ana Lima', 'ana.lima@email.com', TRUE, TRUE, 4),
(TRUE, 'PR005', 'Paulo Mendes', 'paulo.mendes@email.com', TRUE, TRUE, 5),
(FALSE, 'PR006', 'Fernanda Rocha', 'fernanda.rocha@email.com', TRUE, TRUE, 4),
(FALSE, 'PR007', 'Rafael Torres', 'rafael.torres@email.com', FALSE, TRUE, 4),
(FALSE, 'PR008', 'Juliana Alves', 'juliana.alves@email.com', TRUE, TRUE, 4),
(FALSE, 'PR009', 'Eduardo Castro', 'eduardo.castro@email.com', TRUE, TRUE, 4),
(FALSE, 'PR010', 'Cláudia Nunes', 'claudia.nunes@email.com', TRUE, TRUE, 4);

SELECT * FROM tb_usuario;

-- Inserção na tabela tb_chave
INSERT INTO tb_chave (titulo, status_chave, permite_reserva, descricao) VALUES
('Salão Festa 01', TRUE, TRUE, 'Salão principal térreo'),
('Academia', TRUE, TRUE, 'Sala com equipamentos'),
('Churrasqueira 01', TRUE, TRUE, 'Área externa coberta'),
('Piscina', TRUE, FALSE, 'Piscina térmica coberta'),
('Salão Jogos', TRUE, TRUE, 'Mesas de jogos e sinuca'),
('Coworking', TRUE, TRUE, 'Espaço com internet'),
('Biblioteca', TRUE, FALSE, 'Sala de leitura'),
('Brinquedoteca', TRUE, TRUE, 'Área para crianças'),
('Sala Reunião', TRUE, TRUE, 'Sala para reuniões'),
('Quadra Esportes', TRUE, TRUE, 'Quadra poliesportiva');

SELECT * FROM tb_chave;

-- Inserção na tabela tb_periodo
-- Inserção na tabela tb_periodo
INSERT INTO tb_periodo (descricao) VALUES
('Manhã'), ('Tarde'), ('Noite');

--DROP TABLE tb_periodo;

SELECT * FROM tb_periodo;

-- Inserção na tabela tb_periodo_chave

INSERT INTO tb_periodo_chave (fk_periodo, fk_chave) VALUES
(1, 1), (2, 1), (3, 1), (1, 2), (2, 2),
(3, 2), (1, 3), (2, 4), (3, 5), (1, 6);

--TRUNCATE TABLE tb_periodo_chave;

--DROP TABLE tb_periodo_chave;

SELECT * FROM tb_periodo_chave;

-- Inserção na tabela tb_reserva
INSERT INTO tb_reserva (dt_reserva, dt_planejada, dt_planejadafinal, fk_chave, fk_usuario) VALUES
(NOW(), '2025-09-24 10:00:00', '2025-09-24 11:00:00', 1, 1),
(NOW(), '2025-09-24 14:00:00', '2025-09-24 15:00:00', 2, 2),
(NOW(), '2025-09-24 18:00:00', '2025-09-24 19:00:00', 3, 3),
(NOW(), '2025-09-24 09:00:00', '2025-09-24 10:00:00', 4, 4),
(NOW(), '2025-09-24 16:00:00', '2025-09-24 17:00:00', 5, 5),
(NOW(), '2025-09-24 11:00:00', '2025-09-24 12:00:00', 6, 6),
(NOW(), '2025-09-24 13:00:00', '2025-09-24 14:00:00', 7, 7),
(NOW(), '2025-09-24 15:00:00', '2025-09-24 16:00:00', 8, 8),
(NOW(), '2025-09-24 17:00:00', '2025-09-24 18:00:00', 9, 9),
(NOW(), '2025-09-24 19:00:00', '2025-09-24 20:00:00', 10, 10);

INSERT INTO tb_reserva (dt_reserva, dt_planejada, fk_chave) VALUES
(NOW(), '2025-05-13 19:19:19', 3);

SELECT * FROM tb_reserva;

-- Inserção na tabela tb_reserva_periodo_chave
INSERT INTO tb_reserva_periodo_chave (fk_reserva, fk_periodo_chave) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10);

--TRUNCATE TABLE tb_reserva_periodo_chave;
--DROP TABLE tb_reserva_periodo_chave;

SELECT * FROM tb_reserva_periodo_chave;

-- Inserção na tabela tb_emprestimo
INSERT INTO tb_emprestimo (dt_emprestimo, dt_devolucao, fk_chave, fk_usuario) VALUES
(NOW(), '2025-06-15 12:00:00', 1, 1),
(NOW(), '2025-06-15 16:00:00', 2, 2),
(NOW(), '2025-06-16 20:00:00', 3, 3),
(NOW(), '2025-06-17 11:00:00', 4, 4),
(NOW(), '2025-06-18 18:00:00', 5, 5),
(NOW(), '2025-06-19 13:00:00', 6, 6),
(NOW(), '2025-06-20 15:00:00', 7, 7),
(NOW(), '2025-06-21 17:00:00', 8, 8),
(NOW(), '2025-06-22 19:00:00', 9, 9),
(NOW(), '2025-06-23 21:00:00', 10, 10);

SELECT * FROM tb_emprestimo;

TRUNCATE TABLE tb_reserva;

update tb_emprestimo set dt_devolucao = NULL where id_emprestimo = 1;

ALTER TABLE tb_usuario ADD COLUMN senha VARCHAR(255);

UPDATE tb_usuario SET senha = '$2b$10$vcShCSwNHImUdm0/x2xk3e9qBh1DYR4vY.MUvGoX92e6N/ZYnBBNe';

UPDATE tb_cargo SET descricao_cargo = 'Administrador' WHERE id_cargo = 1;
UPDATE tb_cargo SET descricao_cargo = 'Síndico' WHERE id_cargo = 5;

UPDATe tb_reserva set status_reserva = "INATIVO" where id_reserva > 12