CREATE DATABASE db_pi_keyloan
    DEFAULT CHARACTER SET = 'utf8mb4';

USE db_pi_keyloan;

CREATE TABLE tb_cargo (
id_cargo INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
descricao_cargo VARCHAR(65)
);

CREATE TABLE tb_chave (
id_chave INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
titulo VARCHAR(20),
status_chave BOOLEAN,
permite_reserva BOOLEAN,
descricao VARCHAR(40)
);


ALTER TABLE tb_chave ADD COLUMN emprestada BOOLEAN DEFAULT false;

CREATE TABLE tb_periodo (
id_periodo INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
descricao VARCHAR(10)
);

CREATE TABLE tb_periodo_chave (
id_periodo_chave INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
fk_periodo INT NOT NULL,
fk_chave INT NOT NULL,
FOREIGN KEY (fk_periodo) REFERENCES tb_periodo(id_periodo),
FOREIGN KEY (fk_chave) REFERENCES tb_chave(id_chave)
);

CREATE TABLE tb_reserva (
id_reserva INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
dt_reserva DATETIME,
dt_planejada DATETIME,
fk_chave INT NOT NULL,
FOREIGN KEY (fk_chave) REFERENCES tb_chave(id_chave)
);

CREATE TABLE tb_reserva_periodo_chave (
id_reserva_periodo_chave INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
fk_reserva INT NOT NULL,
fk_periodo_chave INT NOT NULL,
FOREIGN KEY (fk_reserva) REFERENCES tb_reserva(id_reserva),
FOREIGN KEY (fk_periodo_chave) REFERENCES tb_periodo_chave(id_periodo_chave)
);

CREATE TABLE tb_usuario (
id_usuario INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
perfil_adm BOOLEAN,
prontuario VARCHAR(20),
nome VARCHAR(100),
email VARCHAR(100),
autoriza_alerta BOOLEAN,
status_usuario BOOLEAN,
fk_cargo INT NOT NULL,
FOREIGN KEY (fk_cargo) REFERENCES tb_cargo(id_cargo)
);

CREATE TABLE tb_emprestimo (
id_emprestimo INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
dt_emprestimo DATETIME,
dt_devolucao DATETIME,
fk_chave INT NOT NULL,
fk_usuario INT NOT NULL,
FOREIGN KEY (fk_chave) REFERENCES tb_chave(id_chave),
FOREIGN KEY (fk_usuario) REFERENCES tb_usuario(id_usuario)
);


alter table tb_chave modify status_chave varchar(10) DEFAULT 'ATIVO';

alter table tb_chave modify permite_reserva varchar(10) DEFAULT 'SIM';

alter table tb_chave modify emprestada varchar(10) DEFAULT 'NÃO';

update tb_chave set status_chave = 'ATIVO', permite_reserva = 'SIM', emprestada = 'SIM' where 1=1;

alter table tb_usuario modify status_usuario varchar(10) DEFAULT 'ATIVO';

update tb_usuario set status_usuario = 'ATIVO' where 1=1;

alter table tb_usuario drop COLUMN autoriza_alerta;

ALTER TABLE tb_emprestimo
MODIFY COLUMN dt_emprestimo DATETIME DEFAULT (CURRENT_TIMESTAMP);

ALTER TABLE tb_emprestimo
MODIFY COLUMN dt_devolucao DATETIME DEFAULT (CURRENT_TIMESTAMP + INTERVAL 3 HOUR);

ALTER TABLE tb_reserva ADD fk_usuario INT NOT NULL;

SELECT * FROM tb_reserva;

UPDATE tb_reserva SET fk_usuario = 1 WHERE 1=1;

ALTER TABLE tb_reserva ADD CONSTRAINT fg_usuario FOREIGN KEY (fk_usuario) REFERENCES tb_usuario(id_usuario);

ALTER TABLE tb_reserva MODIFY COLUMN dt_reserva DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE tb_reserva
ADD COLUMN dt_planejadafinal DATETIME;