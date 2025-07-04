const express = require('express');

const app = express();
const {engine} = require('express-handlebars');

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

app.engine('handlebars', engine({
  helpers: {
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    }
  }
}));

app.use(express.urlencoded({extended: true}));

const mysql = require('mysql2');

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use('/static', express.static(__dirname + '/static'));

app.use('/js',express.static(__dirname+'/js'));


app.set('views', './views');
 
const conexao = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'senac',
  port: 3306,
  database: 'db_pi_keyloan'
});

conexao.connect((erro) => {
  if (erro) {
    console.error('😫 Erro ao conectar ao banco de dados:', erro);
    return;
  }
  console.log('😁 Conexão com o banco de dados estabelecida com sucesso!');
});

app.get('/', function (req,res){
  let sql = 'SELECT * FROM tb_emprestimo';
  conexao.query(sql, function (erro, tb_emprestimo_qs) {
    if (erro) {
      console.error('Erro ao emprestar/devolver chaves: ', erro);
      res.status(500).send('Erro ao emprestar/devolver chave');
      return;
    }
    res.render('index', {tb_emprestimo: tb_emprestimo_qs, tb_emprestimo: tb_emprestimo_qs});
  });
});

app.post('/emprestimo/retirar', (req, res) => {
  const {fk_chave, fk_usuario} = req.body;

  const sql = `
      INSERT INTO tb_emprestimo (fk_chave, fk_usuario)
      VALUES (?,?)
  `;

  conexao.query(sql, [fk_chave, fk_usuario], (erro, resultado) => {
    if (erro) {
      console.error('Erro ao retirar chave: ', erro);
      return res.status(500).send('Erro ao retirar chave.');
    }
    res.redirect('/');
  });
});

//app.get("/chaves", function (req,res){
  //let sql = 'SELECT * FROM tb_chave';
  //conexao.query(sql, function (erro, tb_chave_qs) {
  //  if (erro) {
  //    console.error('Erro ao consultar chaves: ', erro);
  //console.log("passei aqui");
      //res.status(500).send('Erro ao consultar chave');
  //    return;
  //  }
  //  res.render('chaves');//, {chaves: tb_chave_qs});
  //});
//});

app.get('/cadChave', function(req,res){
  res.render('cadChave',{
            formAction: '/cadChave/add', //rota post
  });
});

app.post('/cadChave/add', (req, res) => {
  const {titulo, status_chave, permite_reserva, descricao, emprestada} = req.body;
  const sql=`
  INSERT INTO tb_chave (titulo, status_chave, permite_reserva, descricao)
  VALUES (?,?,?,?)
  `;
  conexao.query(sql,[titulo, status_chave, permite_reserva, descricao, emprestada], (erro,resultado) => {
    if(erro){
      console.error('Erro ao inserir chave:',erro);
      return res.status(500).send('Erro ao adicionar chave');
    }
    res.redirect('/chaves');
  });
});

app.get('/chaves', function(req,res){
  let sql = 'SELECT * FROM tb_chave';
  conexao.query(sql, function (erro, tb_chaves_qs) {
    if (erro) {
      console.error('Erro ao consultar chaves: ', erro);
      res.status(500).send('Erro ao consultar chaves');
      return;
    }
    res.render('chaves', {tb_chaves: tb_chaves_qs});
  });
});

app.get('/chave/:id/detalhes', function(req,res){
  const id = req.params.id;

  let sql = `SELECT * FROM tb_chave 
             WHERE id_chave = ?`;
  
  conexao.query(sql, [id], function (erro, tb_chave_qs) {
    if (erro) {
      console.error('Erro ao consultar chave: ', erro);
      res.status(500).send('Erro ao consultar chave');
      return;
    }
    res.render('chave', {tb_chave: tb_chave_qs[0]});
  });
});

app.get('/chave/:id/editar', function(req,res){
  const id = req.params.id;
  let sql = `SELECT * FROM tb_chave 
             WHERE id_chave = ?`;
  
  conexao.query(sql, [id], function (erro, tb_chave_qs) {
    if (erro) {
      console.error('Erro ao consultar chave: ', erro);
      res.status(500).send('Erro ao consultar chave');
      return;
    }
    const chave = tb_chave_qs[0];
    res.render('cadChave', {
                formAction: `/chave/${id}/editar`,
                chave //rota post
    });
  });
});

app.post('/chave/:id/editar', function(req,res){
  const id = req.params.id;

  const {titulo, status_chave, permite_reserva, descricao} = req.body;

  let sql = `UPDATE tb_chave 
              SET titulo=?, status_chave=?, permite_reserva=?, descricao=?
             WHERE id_chave = ?`;

  conexao.query(sql, [titulo, status_chave, permite_reserva, descricao,id], function (erro, tb_chave_upd) {
    if (erro) {
      console.error('Erro ao editar chave: ', erro);
      res.status(500).send('Erro ao editar chave');
      return;
    }
  });

  res.redirect('/chaves');

});

app.post('/chave/:id/remover', function(req,res){
  const id = req.params.id;

  let sql = `DELETE FROM tb_chave 
             WHERE id_chave = ?`;

  console.log([id]);

  conexao.query(sql, [id], function (erro, tb_chave_del) {
    if (erro) {
      console.error('Erro ao remover chave: ', erro);
      res.status(500).send('Erro ao remover chave');
      return;
    }
  });

  res.redirect('/chaves');

});

app.get('/cadUsuario', function(req,res){
  res.render('cadUsuario');
});

app.get('/cadReserva', function(req,res){
  let sql = 'SELECT * FROM tb_chave';
  conexao.query(sql, function (erro, tb_chaves_qs) {
    if (erro) {
      console.error('Erro ao consultar chaves: ', erro);
      res.status(500).send('Erro ao consultar chaves');
      return;
    }
    res.render('chavesReserva', {tb_chaves: tb_chaves_qs});
  });
});

app.get('/cadReserva/:id/reservas', (req, res) => {
    const id = req.params.id;

    let sql = `SELECT tb_reserva.*, tb_chave.titulo as chave_titulo
                FROM tb_reserva
                JOIN tb_chave
                ON tb_reserva.fk_chave = tb_chave.id_chave
                WHERE tb_reserva.fk_chave = ?`;
    
    conexao.query(sql,[id], function(erro, tb_reserva_qs){
        if (erro) {
            console.error('Erro ao consultar reservas: ', erro);
            res.status(500).send('Erro ao consultar reservas.');
            return;
        }
        const reserva = tb_reserva_qs[0];
        res.render('cadReserva', { tb_reserva: tb_reserva_qs, reserva });
    });
});

/*app.get('/cadReserva', function(req, res){
  let sqlreserva = 'SELECT * FROM tb_reserva WHERE dt_planejada > NOW()';
  let sqlchave = 'SELECT * FROM tb_chave WHERE status_chave = 1';
  conexao.query(sqlchave, function (erro, tb_chave_qs) {
    if (erro) {
      console.error('Erro ao consultar chaves: ', erro);
      res.status(500).send('Erro ao consultar chaves');
      return;
    }
    conexao.query(sqlreserva, function (erro, tb_reserva_qs) {
      if (erro) {
        console.error('Erro ao consultar reservas: ', erro);
        res.status(500).send('Erro ao consultar reservas');
        return;
      }
      res.render('cadReserva', {tb_reserva: tb_reserva_qs, tb_chave: tb_chave_qs});
    });
  });
});
*/

app.listen(8080);

/*
const mysql = require('mysql2');
 
const conexao = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'senac',
  port: 3306,
  database: 'ecommerce_pc'
});
 
conexao.connect((erro) => {
  if (erro) {
    console.error('😫 Erro ao conectar ao banco de dados:', erro);
    return;
  }
  console.log('😁 Conexão com o banco de dados estabelecida com sucesso!');
});
*/