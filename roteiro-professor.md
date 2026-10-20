# Primeiro contato com PostgreSQL — roteiro do professor

**Turma:** S4 — Integrado em Informática. **Duração:** 120 minutos, em dois encontros de 60 minutos. **Pré-requisito:** conceitos básicos de modelagem relacional. **Foco:** definir estruturas pela interface do pgAdmin e reconhecer DDL.

Abra a [aula interativa](index.html) e a [relação de contas e bancos](../../alunos.md). A página local orienta a atividade; as ações de criação são realizadas no pgAdmin conectado ao servidor da turma. O [gabarito DDL](gabarito-ddl.sql) é material de consulta do professor, para comparação posterior.

Ao terminar, cada estudante terá um schema `escola`, três tabelas relacionadas, uma coluna adicionada depois da criação e a experiência de excluir uma tabela descartável. Nesta aula, as tabelas podem permanecer vazias: a evidência de aprendizagem é a estrutura criada e sua explicação.

## Preparação antes da aula

O ambiente do repositório usa PostgreSQL 18 e pgAdmin 4 **9.13** em Docker. Os caminhos de menus deste roteiro usam os nomes em inglês dessa instalação; uma interface traduzida pode apresentar rótulos equivalentes. As fontes oficiais do pgAdmin listadas ao final estão fixadas na versão 9.13.

Somente o professor executa os comandos abaixo, no diretório do projeto. Eles não fazem parte da atividade dos alunos.

```sh
docker compose up -d
```

Confira os serviços e, se necessário, os registros de inicialização:

```sh
docker compose ps
docker compose logs --tail=50 postgres pgadmin pgadmin-users
```

O serviço `pgadmin-users` realiza uma carga e termina; seu encerramento com código zero é esperado. `postgres` e `pgadmin` devem continuar em execução. Um teste adicional de disponibilidade pode ser feito com as variáveis existentes dentro do contêiner:

```sh
docker compose exec postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Antes de receber a turma:

- Para disponibilizar a aula na rede local, execute `python3 servir_aula.py` na raiz do projeto e mantenha o terminal aberto. Acesse `http://localhost:8000/` neste computador e divulgue `http://<IP-do-servidor>:8000/` à turma; no laboratório configurado no material, `http://172.16.4.26:8000/`. Confirme o acesso em um computador de aluno. Para encerrar ao final, pressione **Ctrl+C** no terminal do servidor. O Python serve o material na porta 8000, enquanto o pgAdmin permanece na porta 80.
- Confira se `.env` está configurado conforme o ambiente já preparado, sem exibir as credenciais administrativas no projetor.
- Teste o endereço do pgAdmin a partir de um computador de aluno. Na configuração padrão, use `http://<endereço-do-servidor>:80`; no computador que hospeda o Docker, `http://localhost:80`. Se a porta foi alterada em `PGADMIN_LISTEN_PORT`, divulgue a porta correspondente.
- Teste uma conta de aluno e confirme que seu banco está acessível. Use o usuário e o banco exatos de [alunos.md](../../alunos.md), incluindo os dois usuários com domínio `s4.ifce`.
- Confira se o estudante consegue criar objetos no próprio banco. A role é proprietária desse banco e tem `NOCREATEDB`: ela não precisa criar outro banco.
- Abra a [aula interativa](index.html) no navegador e explique que o avanço na página deve acompanhar a prática no pgAdmin.
- Prepare uma conta de demonstração autorizada ou apresente a tela de um estudante com sua concordância. Evite realizar a demonstração como superusuário, pois os menus e permissões seriam diferentes.

As roles e os bancos do projeto são criados pelo script de inicialização somente no primeiro uso de um volume PostgreSQL vazio. **Não reaplique `init/01-students.sql` automaticamente:** ele contém `CREATE ROLE` e `CREATE DATABASE` e não foi escrito para execução repetida. Caso uma conta ou banco esteja ausente, diagnostique a preparação desse ambiente antes da aula. Preserve os volumes e os trabalhos existentes.

## Plano de 120 minutos

| Tempo | Atividade | Evidência para avançar |
|---|---|---|
| 0–10 min | Apresentar o desafio e entrar no pgAdmin — missão 1 | Login individual concluído |
| 10–25 min | Registrar o servidor PostgreSQL — missão 2 | Conexão aberta com a conta individual |
| 25–35 min | Localizar o banco pessoal e criar o schema | `escola` dentro do banco correto |
| 35–45 min | Ler o modelo e discutir os tipos — missão 4 | Estudante explica a função de `matriculas` |
| 45–60 min | Criar `turmas` com demonstração orientada — missão 5 | Colunas, tipos, PK e obrigatoriedade conferidos |
| 60–75 min | Criar `alunos` com apoio do roteiro | `data_nascimento` permanece opcional |
| 75–100 min | Criar `matriculas`, as duas FKs e a UNIQUE composta | Referências e combinação única corretas |
| 100–107 min | Adicionar `alunos.email` pela interface — missão 8 | Coluna opcional com limite de 120 caracteres |
| 107–112 min | Criar e excluir somente `rascunho` — missão 9 | Estrutura final continua com três tabelas |
| 112–120 min | Conferência, observar SQL e bilhete de saída — missão 10 | Estudante relaciona CREATE, ALTER e DROP às ações realizadas |

Para **três encontros de 50 minutos**, amplie o tempo de apoio: primeiro encontro para conexão, schema e início de `turmas`; segundo para concluir `turmas`, criar `alunos` e iniciar `matriculas`; terceiro para concluir relacionamentos e unicidade, fazer ALTER e DROP e revisar as estruturas em pares. Os 30 minutos adicionais permitem recuperar dificuldades sem acrescentar recursos novos.

## Enunciado para apresentar à turma

> Você vai organizar a estrutura de uma pequena escola. Ela oferece turmas regulares e oficinas. Um aluno pode participar de várias turmas, e cada turma recebe vários alunos. Uma matrícula liga um aluno a uma turma. A mesma combinação aluno–turma só pode aparecer uma vez. Cada turma representa uma oferta em um ano específico; uma nova oferta em outro ano recebe outro `id`.
>
> Seu banco pessoal `aluno_nomealuno` já existe. Dentro dele, crie o schema `escola` e as tabelas `turmas`, `alunos` e `matriculas`. Use os nomes, tipos e regras indicados na aula. Primeiro criaremos tudo pelos menus do pgAdmin; depois veremos os comandos SQL que essas escolhas representam.

Explique a hierarquia antes dos cliques:

```text
Servidor PostgreSQL da turma
└── Banco pessoal: aluno_nomealuno
    └── Schema: escola
        ├── turmas
        ├── alunos
        └── matriculas
```

**Não existe banco dentro de banco no PostgreSQL.** `escola` é um schema, um espaço de organização dos objetos dentro do banco existente. A conta do estudante não pode criar novos bancos, o que é esperado neste ambiente. [Referência: schemas no PostgreSQL 18](https://www.postgresql.org/docs/18/ddl-schemas.html).

## Conexão: dois acessos, duas funções

Primeiro, o aluno acessa a aplicação web pgAdmin. Depois, registra nela uma conexão ao PostgreSQL. As credenciais individuais coincidem neste laboratório, mas os acessos são diferentes.

| Etapa | Campo | Preenchimento |
|---|---|---|
| Login web do pgAdmin | Email/usuário | Exatamente o usuário de [alunos.md](../../alunos.md) |
| Login web do pgAdmin | Senha | `s4info` |
| `Servers → Register → Server…` | `General → Name` | `Postgres da turma` ou outro rótulo descritivo |
| Registro do servidor | `Connection → Host name/address` | `postgres` |
| Registro do servidor | `Port` | `5432` |
| Registro do servidor | `Maintenance database` | O próprio banco, como `aluno_ana` |
| Registro do servidor | `Username` | O usuário exato de [alunos.md](../../alunos.md) |
| Registro do servidor | `Password` | `s4info` |

Deixe os demais campos nas configurações padrão e salve. `Name` é o nome do registro exibido no pgAdmin; ele não cria nem renomeia um servidor. `Maintenance database` é o banco inicial da conexão: neste ambiente deve ser o banco pessoal, pois o acesso aos bancos administrativos é restrito. [Referência: Server Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/server_dialog.rst).

O navegador usa o endereço público do pgAdmin. O pgAdmin, dentro do Docker, usa `postgres:5432` para alcançar o banco pela rede interna. A porta PostgreSQL não é publicada no computador hospedeiro por este Compose; não substituir o host por `localhost` no diálogo.

**Checkpoint 1:** peça a cada estudante para apontar seu nome de usuário e seu banco na relação de contas. Depois, confirme a conexão e a localização de `Databases → aluno_nomealuno`. Os nomes de outros bancos podem aparecer no navegador de objetos; isso não significa que a conta possa acessá-los.

## Criar o schema e as tabelas

No banco pessoal, use `Schemas → Create → Schema…`, informe `escola` e mantenha a própria role como proprietária. Salve e atualize a árvore de objetos quando necessário. [Referência: Schema Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/schema_dialog.rst).

Para as tabelas, use `Schemas → escola → Tables → Create → Table…`. Na aba `General`, confira nome e schema. Em `Columns`, use `+` para adicionar cada coluna. Para textos, o tipo pode aparecer como **`character varying`**, equivalente a `varchar`; preencha o tamanho em `Length/Precision`, sem tentar escrever `varchar(60)` como nome da coluna. Marque `Primary key?` somente na coluna `id` e ajuste `Not NULL?` conforme as fichas. Salve pela interface. Na missão final, retome a aba `SQL` para observar os comandos correspondentes às escolhas realizadas. [Referência: Table Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/table_dialog.rst).

### Ficha 1 — `escola.turmas`

| Coluna | Tipo | PK | Obrigatória | Observação |
|---|---|---|---|---|
| `id` | `integer` | Sim | Sim, pela PK | Identificador manual |
| `nome` | `character varying(60)` | Não | Sim | Ex.: S4 Informática ou Oficina de Robótica |
| `ano_letivo` | `integer` | Não | Sim | Ano da oferta |

O nome não precisa ser único: ofertas diferentes podem compartilhar um nome. A identificação de cada oferta é feita por `id`.

**Checkpoint 2:** confirmar que `turmas` está em `escola`, que há três colunas e que somente `id` é PK. Perguntar: “Marcar PK faz aparecer o próximo número automaticamente?”. Resposta: não. Usaremos identificadores preenchidos manualmente em uma aula posterior; não há identity, serial nem valor padrão neste exercício.

### Ficha 2 — `escola.alunos`

| Coluna | Tipo | PK | Obrigatória |
|---|---|---|---|
| `id` | `integer` | Sim | Sim, pela PK |
| `nome` | `character varying(100)` | Não | Sim |
| `data_nascimento` | `date` | Não | Não |

**Checkpoint 3:** perguntar o significado de uma data opcional. `NULL` representa a ausência de um valor informado; não é uma data falsa, zero nem uma sequência de espaços. `NOT NULL` impede `NULL`; não verifica sozinho se um texto é significativo nem se uma data faz sentido para a escola.

### Ficha 3 — `escola.matriculas`

| Coluna | Tipo | PK | Obrigatória | Referência |
|---|---|---|---|---|
| `id` | `integer` | Sim | Sim, pela PK | — |
| `aluno_id` | `integer` | Não | Sim | `escola.alunos(id)` |
| `turma_id` | `integer` | Não | Sim | `escola.turmas(id)` |
| `data_matricula` | `date` | Não | Sim | — |

`data_matricula` não recebe valor padrão nesta aula. Os tipos de `aluno_id` e `turma_id` devem ser `integer`, como os identificadores referenciados.

### As duas chaves estrangeiras

Pode-se configurar as restrições no diálogo da tabela ou, depois de salvar, expandindo `matriculas`, clicando com o botão direito em `Constraints` e escolhendo `Create → Foreign key…`. É mais fácil acompanhar uma por vez após a tabela existir.

Para cada FK, informe o nome em `General`; em `Columns`, selecione `Local column` (coluna de `matriculas`), `References` (tabela em `escola`) e `Referencing` (`id` da tabela de destino). Clique em `+` / `Add` para incluir a associação na lista antes de salvar; apenas selecionar os três campos não adiciona o mapeamento.

| Nome da restrição | Coluna local | Tabela referenciada | Coluna referenciada |
|---|---|---|---|
| `fk_matriculas_aluno` | `aluno_id` | `escola.alunos` | `id` |
| `fk_matriculas_turma` | `turma_id` | `escola.turmas` | `id` |

Mantenha `On update` e `On delete` em **`NO ACTION`**. Não ative exclusões em cascata. O objetivo é reconhecer a referência e proteger a consistência dos registros. [Referência: Foreign key Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/foreign_key_dialog.rst).

**Checkpoint 4:** conferir as duas restrições na árvore. Perguntar: “Se o aluno 99 não existir em `alunos`, uma matrícula poderia apontar para ele?”. Resposta: a FK impede essa referência quando os dados forem cadastrados. A coluna com um nome terminado em `_id` não cria a FK sozinha.

### A regra de matrícula única

Em `matriculas`, clique com o botão direito em `Constraints` e escolha `Create → Unique constraint`. Use o nome **`uq_matriculas_aluno_turma`**. Em `Definition → Columns`, selecione **as duas colunas na mesma restrição**: `aluno_id` e `turma_id`. Salve. [Referência: Unique Constraint Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/unique_constraint_dialog.rst).

**Checkpoint 5:** confira que existe uma restrição composta, e não duas restrições únicas separadas. Discuta os pares abaixo apenas no papel ou oralmente, supondo que os alunos e turmas citados existem:

| Par `(aluno_id, turma_id)` | Resultado conceitual |
|---|---|
| `(1, 10)` | Primeira matrícula nessa combinação: permitida |
| `(1, 20)` | Mesmo aluno, outra turma: permitida |
| `(2, 10)` | Outro aluno, mesma turma: permitida |
| `(1, 10)` novamente | Combinação repetida: recusada |

Uma PK diferente em `matriculas.id` não impediria a repetição do par. A PK identifica a matrícula; a UNIQUE composta expressa a regra de negócio.

## ALTER: acrescentar um contato opcional

Apresente a mudança de requisito: “A escola quer guardar o email dos alunos, quando ele for informado”. Expanda `alunos → Columns`, clique com o botão direito em `Columns` e escolha `Create → Column…`.

Preencha `General → Name` com `email`. Em `Definition`, selecione `character varying` e comprimento `120`. Em `Constraints`, mantenha `Not Null` em **No**, sem valor padrão e sem identity. Salve pela interface. Ao final da prática, relacione essa mudança a `ALTER TABLE`. [Referência: Column Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/column_dialog.rst).

**Checkpoint 6:** `alunos` passa a ter quatro colunas, e `email` permite `NULL`. Não adicionar UNIQUE ao email neste exercício. O tipo textual não valida sozinho o formato de um endereço de email. Pergunte: “Foi criada outra tabela ou a estrutura da tabela existente mudou?”.

## DROP: remover somente a tabela de exercício

Crie em `escola` uma tabela chamada **`rascunho`**, com uma coluna `anotacao` do tipo `text`, opcional. Essa é uma tabela comum criada para ser descartada; não é um recurso de tabela temporária do PostgreSQL.

Na árvore, selecione especificamente `escola → Tables → rascunho`. Clique com o botão direito e escolha `Drop`, leia o nome do objeto na confirmação e exclua **somente essa tabela**. `Drop (Cascade)` é uma opção separada e não deve ser selecionada. Caso apareça uma dependência inesperada, cancele e peça ajuda.

**Checkpoint 7:** `rascunho` desapareceu e as três tabelas da escola continuam presentes. Explique que `DROP TABLE` remove a própria estrutura e os dados que ela contivesse; nesta atividade a tabela descartável foi criada vazia. Excluir uma linha é uma operação sobre dados que será estudada depois.

## Como conduzir a interação

Use o ciclo **prever → fazer → conferir → explicar**. Antes de uma ação nova, peça uma previsão curta. Faça a primeira tabela junto com a turma, deixe que `alunos` seja criada com mais autonomia e retome a demonstração na primeira FK. Enquanto a turma trabalha, observe os checkpoints; um botão marcado na página local não comprova sozinho que o objeto foi criado no PostgreSQL.

Organize conferências em pares sem troca de conta: um estudante mostra sua árvore e explica uma decisão; o colega confere o requisito e depois invertem os papéis. Ajude primeiro com perguntas como “Em qual banco você está?” e “Qual é a coluna local da FK?”, antes de assumir o mouse.

Se houver dificuldade de conexão, recupere essa etapa antes de avançar. Se a diferença de ritmo surgir na UNIQUE, quem terminou pode explicar os quatro pares do exemplo a um colega. Não transforme o tempo disponível em corrida por mais tabelas ou comandos.

## Avaliação formativa — 10 pontos

Avalie a estrutura no pgAdmin e uma explicação breve do estudante. Não atribua nota à memorização dos rótulos em inglês ou da sintaxe SQL.

| Critério | Pontos | Evidência observável |
|---|---:|---|
| Acesso e organização | 1,0 | Conta e banco individuais corretos; schema `escola` no banco pessoal |
| Colunas e tipos iniciais | 3,0 | Três tabelas com nomes, colunas e tipos das fichas; 1,0 por tabela |
| Chaves primárias | 1,0 | PK nas três colunas `id`; explica que não há geração automática |
| Obrigatoriedade | 1,0 | Campos obrigatórios corretos; nascimento e email opcionais |
| Chaves estrangeiras | 2,0 | Cada FK aponta para tabela e coluna corretas; 1,0 por FK |
| Regra de matrícula única | 1,0 | Uma UNIQUE com o par correto; explica o efeito da combinação |
| Alteração da estrutura | 0,5 | `email` adicionado à tabela existente com comprimento 120 |
| Exclusão controlada | 0,5 | Removeu `rascunho` e preservou as três tabelas finais |
| **Total** | **10,0** | |

Conceda pontuação parcial proporcional aos itens atendidos e permita corrigir erros com base na devolutiva. Um erro de infraestrutura que não depende do estudante deve gerar nova oportunidade de demonstração, sem desconto automático.

**Devolutiva curta:** “Sua estrutura já identifica cada aluno e relaciona as matrículas. A regra de duplicidade ainda está em duas UNIQUEs separadas; reúna `aluno_id` e `turma_id` na mesma restrição para permitir várias turmas por aluno”.

## Perguntas de conferência e gabarito conceitual

| Pergunta | Resposta esperada |
|---|---|
| Onde criamos `escola`? | Como schema dentro do banco pessoal já existente. |
| O pgAdmin é o servidor que armazena as tabelas? | É a ferramenta de administração; o PostgreSQL mantém o banco. |
| O que muda ao registrar um servidor? | Salvamos no pgAdmin os parâmetros de uma conexão; não criamos outra instância PostgreSQL. |
| Por que o host é `postgres`? | Esse é o nome do serviço alcançado pelo pgAdmin na rede Docker. |
| Qual banco informar em `Maintenance database`? | O banco do próprio estudante, conforme a relação de contas. |
| `id` marcado como PK gera números sozinho? | Não. A PK exige identificação única e não nula; a geração automática é outro recurso. |
| Uma FK é criada apenas pelo nome `aluno_id`? | Não. É necessário configurar a restrição e a referência. |
| Por que duas FKs em `matriculas`? | Uma referencia o aluno e outra a turma da matrícula. |
| O que a UNIQUE composta impede? | A repetição do mesmo par aluno–turma, mantendo outras combinações possíveis. |
| `NOT NULL` valida o formato do email? | Não. Ele impede `NULL`; outras validações exigem outras regras. |
| Adicionar `email` corresponde a qual ação DDL? | `ALTER TABLE`, pois modifica uma estrutura existente. |
| Criar e remover `rascunho` correspondem a quais ações? | `CREATE TABLE` e `DROP TABLE`. |
| Excluir uma matrícula é o mesmo que excluir `matriculas`? | Não. Uma ação afetaria um registro; `DROP TABLE` remove a tabela. |

**Bilhete de saída:** como na página interativa, peça que cada estudante explique a diferença entre excluir uma matrícula e excluir a tabela `matriculas`, e cite uma regra criada para a escola. Retome oralmente a diferença entre banco e schema e os exemplos de CREATE, ALTER e DROP.

## Suporte aos erros mais comuns

| Sintoma | O que conferir e como orientar |
|---|---|
| A página do pgAdmin não abre | Endereço público, porta configurada, rede do laboratório e estado do serviço `pgadmin`. `postgres` não é o endereço a digitar no navegador dos alunos. |
| O login web falha | Usuário exato na lista e senha `s4info`; confira os domínios `s4.info` e `s4.ifce`. O professor verifica a carga de `pgadmin-users` se necessário. |
| `could not translate host name` | No registro do servidor, o host deve ser `postgres`; o professor confere os serviços e a rede Compose. |
| `connection refused` | Host e porta `5432`; professor confere se PostgreSQL iniciou. Trocar para a porta 80 não resolve uma conexão PostgreSQL. |
| `password authentication failed` | É a autenticação PostgreSQL: confira `Username` e senha do registro da conexão, mesmo que o login web tenha funcionado. |
| `permission denied for database postgres` | Troque `Maintenance database` para o banco pessoal exato; a restrição ao banco administrativo é esperada. |
| Não consegue criar um novo banco | As contas têm `NOCREATEDB`; localize o banco já existente e crie `escola` em `Schemas`. |
| `permission denied` ao criar schema ou tabela | Confira banco e role da conexão. No próprio banco, a conta preparada deve ser proprietária; se persistir, o professor verifica as permissões. |
| Nome já existe | Atualize a árvore e abra o objeto existente. Confira sua definição em vez de repetir a criação ou apagar o trabalho. |
| Tabela não aparece após salvar | Atualize `Tables` e confira o banco e schema selecionados no diálogo. Verifique se a operação foi salva sem mensagem de erro. |
| `varchar` não aparece com esse nome | Procure `character varying`; informe o tamanho no campo próprio. |
| FK não encontra tabela ou coluna | Salve primeiro `alunos` e `turmas`; confira schema `escola`, PKs, tipos e atualização da árvore. |
| A FK não permite salvar ou não tem o mapeamento esperado | Confira a linha com coluna local, tabela e coluna referenciada; na criação, clique em `+` / `Add` para adicionar o par à lista. |
| Um aluno só parece poder ter uma turma | Confira se foi criada UNIQUE somente em `aluno_id`; a regra correta reúne as duas colunas na mesma UNIQUE. |
| `email` ficou obrigatório | Abra as propriedades da coluna e ajuste `Not Null` para No; confira também se não recebeu PK. |
| A exclusão informa dependências | Cancele; confirme se selecionou a tabela descartável `rascunho`. Não usar cascata como correção automática. |

Na próxima aula, retome a aba SQL para relacionar as escolhas visuais à sintaxe DDL. Cadastros, consultas e identificadores automáticos podem ser introduzidos quando a turma já distinguir estrutura, restrição e registro.

## Fontes oficiais

Menus de referência local: **pgAdmin 4 9.13**, conforme `compose.yaml`. A documentação e o código-fonte oficiais na tag `REL-9_13` foram conferidos em **20/10/2026**.

- [pgAdmin 9.13 — Server Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/server_dialog.rst): parâmetros para registrar a conexão.
- [pgAdmin 9.13 — Schema Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/schema_dialog.rst): criação e propriedade do schema.
- [pgAdmin 9.13 — Table Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/table_dialog.rst): colunas, tipos, PK, NOT NULL e visualização do SQL gerado.
- [pgAdmin 9.13 — Column Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/column_dialog.rst): adição e alteração de colunas.
- [pgAdmin 9.13 — Foreign key Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/foreign_key_dialog.rst): mapeamento das referências e ações das FKs.
- [pgAdmin 9.13 — Unique Constraint Dialog](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/unique_constraint_dialog.rst): restrição com uma combinação de colunas.
- [PostgreSQL 18 — Schemas](https://www.postgresql.org/docs/18/ddl-schemas.html): relação entre banco, schema e objetos.

- [pgAdmin 9.13 — Login](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/login.rst): campos de autenticação no pgAdmin.
- [pgAdmin 9.13 — Connecting](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/docs/en_US/connecting.rst): caminho `Servers → Register → Server`.
- [pgAdmin 9.13 — menus e confirmação de Drop](https://github.com/pgadmin-org/pgadmin4/blob/REL-9_13/web/pgadmin/browser/static/js/node.js#L157): `Drop` e `Drop (Cascade)` são ações separadas.
- [PostgreSQL 18 — Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html): distinções entre PK, FK, UNIQUE e NOT NULL.
