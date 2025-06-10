const express = require('express');

const app = express();
const {engine} = require('express-handlebars');

const mysql = require('mysql2');

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
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

app.get("/", function(req, res){
    res.render('cadUsuario');
});

conexao.connect((erro) => {
  if (erro) {
    console.error('😫 Erro ao conectar ao banco de dados:', erro);
    return;
  }
  console.log('😁 Conexão com o banco de dados estabelecida com sucesso!');
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