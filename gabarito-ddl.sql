-- Consulta do professor: estrutura correspondente à atividade pela interface.
-- Este arquivo não foi executado para preparar a aula.
-- Se for utilizado posteriormente, conecte-se antes ao banco pessoal correto.
-- Não executar sobre o trabalho já criado: CREATE sem IF NOT EXISTS é intencional
-- para que divergências não sejam ocultadas. Não cria nem remove bancos.

CREATE SCHEMA escola;

CREATE TABLE escola.turmas (
    id integer PRIMARY KEY,
    nome character varying(60) NOT NULL,
    ano_letivo integer NOT NULL
);

CREATE TABLE escola.alunos (
    id integer PRIMARY KEY,
    nome character varying(100) NOT NULL,
    data_nascimento date
);

CREATE TABLE escola.matriculas (
    id integer PRIMARY KEY,
    aluno_id integer NOT NULL,
    turma_id integer NOT NULL,
    data_matricula date NOT NULL,
    CONSTRAINT fk_matriculas_aluno
        FOREIGN KEY (aluno_id) REFERENCES escola.alunos (id)
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fk_matriculas_turma
        FOREIGN KEY (turma_id) REFERENCES escola.turmas (id)
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT uq_matriculas_aluno_turma UNIQUE (aluno_id, turma_id)
);

-- ALTER: a coluna continua opcional; nenhum valor padrão ou UNIQUE é criado.
ALTER TABLE escola.alunos
    ADD COLUMN email character varying(120);

-- DROP: somente o objeto descartável criado para a demonstração.
CREATE TABLE escola.rascunho (
    anotacao text
);

DROP TABLE escola.rascunho;
