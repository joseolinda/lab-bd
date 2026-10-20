# Aula 01 — Primeiro contato com PostgreSQL

Abra **index.html** no Chrome, Edge, Firefox ou Safari. Não precisa instalar dependências, iniciar servidor web nem acessar a internet para ler a aula. Mantenha `index.html`, `estilos.css` e `aula.js` juntos nesta pasta. O pgAdmin precisa estar acessível na rede do laboratório para realizar a prática.

Para servir a aula aos outros computadores, execute `python3 servir_aula.py` na raiz do projeto (dois níveis acima desta pasta). Abra `http://localhost:8000/` neste computador e divulgue `http://<IP-do-servidor>:8000/` à turma. Na rede do laboratório usada no material, o endereço é `http://172.16.4.26:8000/`. O servidor atende em todas as interfaces; mantenha o terminal aberto e use **Ctrl+C** para encerrar. Outra porta pode ser escolhida com `--port 8080`. O pgAdmin continua separado na porta 80.

A aula foi planejada para **120 minutos**. Começa com o login e o registro do servidor PostgreSQL no Docker. A criação de schema, tabelas, PKs, FKs, campos obrigatórios, UNIQUE, adição de coluna e remoção da tabela de rascunho é feita pela interface do pgAdmin. Os exemplos SQL aparecem na última missão.

- **index.html:** percurso do estudante, com 10 missões, 19 verificações e 6 perguntas com feedback.
- **roteiro-professor.md:** preparação do laboratório, plano de tempo, checkpoints, avaliação e respostas esperadas.
- **gabarito-ddl.sql:** referência do professor para estudo posterior; não executar sobre o trabalho que já foi criado pelos menus.
- **../../alunos.md:** relação das contas e bancos individuais existentes no projeto.

Os campos de usuário e banco personalizam os exemplos e não são salvos. Checklists e respostas são armazenados somente neste navegador, quando ele permitir armazenamento local. Em computador compartilhado, use **Limpar marcações** antes de iniciar o trabalho de outro estudante. O bilhete de saída fica apenas na aba até ser baixado junto com o registro da aula. A página não executa SQL, não se conecta ao pgAdmin e não verifica automaticamente os objetos reais.

O botão **Imprimir aula** inclui as dez missões, inclusive as informações recolhidas. Para distribuir o material, extraia o arquivo `aula-s4-postgresql.zip` e preserve sua estrutura de pastas. Abra `aulas/01-primeiro-contato/index.html` dentro da pasta extraída. Assim, a relação de contas e o roteiro continuam acessíveis.

O endereço do pgAdmin deve ser informado pelo professor. Nesta instalação, a porta web padrão é 80; na configuração de conexão ao PostgreSQL, o host é `postgres`, a porta é `5432` e o banco de manutenção é o banco pessoal do estudante. Os serviços foram conferidos como PostgreSQL 18 e pgAdmin 4 versão 9.13. Fontes oficiais estão na missão final e no roteiro do professor.
