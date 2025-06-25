const express = require('express');

const app = express();
const {engine} = require('express-handlebars');

const mysql = require('mysql2');

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/static', express.static(__dirname + '/static'));

app.use('/js',express.static(__dirname+'/js'));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
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

app.get("/", function (req,res){
  let sql = 'SELECT * FROM tb_chave';
  conexao.query(sql, function (erro, tb_chave_qs) {
    if (erro) {
      console.error('Erro ao emprestar/devolver chaves: ', erro);
      res.status(500).send('Erro ao emprestar/devolver chave');
      return;
    }
    res.render('index', {tb_chave: tb_chave_qs, tb_chave: tb_chave_qs});
  });
});

app.get("/cadChave", function(req,res){
  res.render('cadChave');
});

app.get("/cadUsuario", function(req,res){
  res.render('cadUsuario');
});

app.get("/cadReserva", function(req, res){
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