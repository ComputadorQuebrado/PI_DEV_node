const express = require('express');

const app = express();
const {engine} = require('express-handlebars');

const moment = require('moment');
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

app.engine('handlebars', engine({
  defaultLayout: 'main',
  partialsDir: __dirname + '/views/partials',
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
    },
    formatDate: (date) => {
      return moment(date).format('DD/MM/YYYY')
    },
    formatDateTime: (date) => {
      return moment(date).format('DD/MM/YYYY HH:mm')
    },
    formatTime: (date) => {
      return moment(date).format('HH:mm')
    }
  }
}));

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));



const mysql = require('mysql2');

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use('/static', express.static(__dirname + '/static'));

const session = require('express-session');
const bcrypt = require('bcrypt');

app.use(session({
  secret: 'chave-secreta-ultra-segura',
  resave: false,
  cookie: {maxAge:3600000}
}));

// Torna `usuario` acessível nas views e partials
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

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

app.get('/home', (req,res) => {
    if (!req.session.usuario) {
        return('/login');
    }
    res.render('home_user', { usuario: req.session.usuario });
});

app.get('/login', (req,res) => {
    res.render('login');
});

app.post('/login', (req,res) => {
    const { email, senha } = req.body;
    const sql = 'SELECT * FROM tb_usuario WHERE email = ?';

    conexao.query(sql, [email], (erro, resultado) => {
        if (erro || resultado.length === 0) {
            return res.status(401).send('E-mail não encontrado.');
        }

        const usuario = resultado [0];

        bcrypt.compare(senha, usuario.senha, (erroHash,senhaOk) => {
            if (erroHash || !senhaOk) {
                return res.status(401).send('Senha incorreta.');
            }

            req.session.usuario = {
                id: usuario.id_usuario,
                nome: usuario.nome,
                tipo: usuario.fk_cargo,
                email: usuario.email
            };

            res.redirect('/home');
        });
    });
});

app.get('/logout', (req,res) => {
    req.session.destroy((erro) => {
        if(erro) {
            console.error('Erro ao encerrar sessão: ', erro);
            return res.status(500).send('Erro ao encerrar sessão.');
        }
        res.redirect('/login');
    });
});

app.get('/', function (req,res){
  let sql = 'SELECT * FROM tb_chave WHERE emprestada = "NÃO" AND status_chave = "ATIVO" ORDER BY titulo';
  conexao.query(sql, function (erro, tb_chave_qs) {
    if (erro) {
      console.error('Erro ao consultar chaves: ', erro);
      res.status(500).send('Erro ao consultar chaves');
      return;
    }
    let sql;
    let tipo = req.session.usuario.tipo;
    let params = [];

    if (tipo == 1){
      sql = 'SELECT * FROM tb_usuario WHERE status_usuario = "ATIVO" ORDER BY nome';
    }
    else {
      sql = 'SELECT * FROM tb_usuario WHERE status_usuario = "ATIVO" AND id_usuario = ? ORDER BY nome';
      params.push(req.session.usuario.id); // ou o campo correto que identifica o usuário
    }
    
    conexao.query(sql, params, function (erro, tb_usuario_qs, tipo) {
      if (erro) {
        console.error('Erro ao consultar usuários: ', erro);
        res.status(500).send('Erro ao consultar usuários');
        return;
      }
      res.render('index', {tb_chaves: tb_chave_qs, tb_usuarios: tb_usuario_qs, usuario: req.session.usuario, tipo});
    });
  });
});

app.get('/cadDevolucao', function (req,res){
  if (!req.session.usuario) {
    return('/login');
  }
  let sql = `SELECT * FROM tb_chave WHERE emprestada = 'SIM' AND status_chave = 'ATIVO' ORDER BY titulo`;
  conexao.query(sql, function (erro, tb_chave_qs) {
    if (erro) {
      console.error('Erro ao consultar chaves: ', erro);
      res.status(500).send('Erro ao consultar chaves');
      return;
    }
    let sql2
    let tipo = req.session.usuario.tipo;
    let params = [];

    if (tipo == 1){
      sql2 = 'SELECT * FROM tb_usuario WHERE status_usuario = "ATIVO" ORDER BY nome';
    }
    else {
      sql2 = 'SELECT * FROM tb_usuario WHERE status_usuario = "ATIVO" AND id_usuario = ? ORDER BY nome';
      params.push(req.session.usuario.id); // ou o campo correto que identifica o usuário
    }
    
    conexao.query(sql2, params, function (erro, tb_usuario_qs) {
      if (erro) {
        console.error('Erro ao consultar usuários: ', erro);
        res.status(500).send('Erro ao consultar usuários');
        return;
      }
      res.render('cadDevolucao', {tb_chaves: tb_chave_qs, tb_usuarios: tb_usuario_qs});
    });
  });
});

app.post('/emprestimo/retirar', (req, res) => {
  if (!req.session.usuario) {
    return('/login');
  }
  const {fk_chave, fk_usuario} = req.body;

  const sql = `
      INSERT INTO tb_emprestimo (fk_chave, fk_usuario)
      VALUES (?,?)
  `;

  const sqlChaveEmprestada = `
      UPDATE tb_chave 
      SET emprestada = 'SIM' 
      WHERE id_chave = ? AND emprestada <> 'SIM' 
  `;

  conexao.query(sql, [fk_chave, fk_usuario], (erro, resultado) => {
    if (erro) {
      console.error('Erro ao retirar chave: ', erro);
      return res.status(500).send('Erro ao retirar chave.');
    }
    conexao.query(sqlChaveEmprestada, [fk_chave], (erro, resultado2) => {
      if (erro) {
        console.error('Erro ao atualizar chave retirada: ', erro);
        return res.status(500).send('Erro ao atualizar chave retirada.');
      }
    });
    res.redirect('/');
  });
});

app.post('/emprestimo/devolver', (req, res) => {
  if (!req.session.usuario) {
    return('/login');
  }
  const {fk_chave, fk_usuario} = req.body;

  const sql = `
      UPDATE tb_emprestimo 
      SET dt_devolucao = now() 
      WHERE fk_chave = ? AND fk_usuario = ? AND dt_devolucao IS NULL
  `;

  const sqlChaveDevolvida = `
      UPDATE tb_chave 
      SET emprestada = 'NÃO' 
      WHERE id_chave = ? AND emprestada <> 'NÃO'
  `;

  conexao.query(sql, [fk_chave, fk_usuario], (erro, resultado) => {
    if (erro) {
      console.error('Erro ao devolver chave: ', erro);
      return res.status(500).send('Erro ao devolver chave.');
    }
    conexao.query(sqlChaveDevolvida, [fk_chave], (erro, resultado2) => {
      if (erro) {
        console.error('Erro ao atualizar devolução da chave: ', erro);
        return res.status(500).send('Erro ao atualizar devolução da chave.');
      }
    });
    res.redirect('/');
  });
});

app.get('/cadChave', function(req,res){
  if (!req.session.usuario) {
    return('/login');
  }
  res.render('cadChave',{
            formAction: '/cadChave/add', //rota post
  });
});

app.get('/chaves', function(req,res){
  if (!req.session.usuario) {
    return('/login');
  }
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

app.post('/cadChave/add', (req, res) => {
  if (!req.session.usuario) {
    return('/login');
  }
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

app.get('/chave/:id/detalhes', function(req,res){
  if (!req.session.usuario) {
    return('/login');
  }
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
  if (!req.session.usuario) {
    return('/login');
  }
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
  if (!req.session.usuario) {
    return('/login');
  }
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
  if (!req.session.usuario) {
    return('/login');
  }
  const id = req.params.id;

  let sql = `DELETE FROM tb_chave 
             WHERE id_chave = ?`;

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
  if (!req.session.usuario) {
    return('/login');
  }
  let sql_cargo = `SELECT * 
                    FROM tb_cargo
                    order by descricao_cargo`;
  
  conexao.query(sql_cargo, function (erro, tb_cargos_qs) {
    if (erro) {
      console.error('Erro ao consultar cargos: ', erro);
      res.status(500).send('Erro ao consultar cargos');
      return;
    }
    res.render('cadUsuario',{tb_cargos: tb_cargos_qs,
            formAction: '/cadUsuario/add', //rota post
    });
  });
});

app.get('/usuarios', function(req,res){
  if (!req.session.usuario) {
    return('/login');
  }
  let sql = 'SELECT * FROM tb_usuario';
  conexao.query(sql, function (erro, tb_usuarios_qs) {
    if (erro) {
      console.error('Erro ao consultar usuarios: ', erro);
      res.status(500).send('Erro ao consultar usuarios');
      return;
    }
    res.render('usuarios', {tb_usuarios: tb_usuarios_qs});
  });
});

app.post('/cadUsuario/add', (req, res) => {
  if (!req.session.usuario) {
    return('/login');
  }
  const {perfil_adm, prontuario, nome, email, autoriza_alerta, status_usuario, fk_cargo} = req.body;
  const sql=`
  INSERT INTO tb_usuario (perfil_adm, prontuario, nome, email, status_usuario, fk_cargo)
  VALUES (?,?,?,?,?,?)
  `;
  conexao.query(sql, [perfil_adm, prontuario, nome, email, status_usuario, fk_cargo], (erro,resultado) => {
    if(erro){
      console.error('Erro ao inserir usuário:',erro);
      return res.status(500).send('Erro ao adicionar usuário');
    }
    res.redirect('/usuarios');
  });
});

app.get('/usuario/:id/detalhes', function(req,res){
  if (!req.session.usuario) {
    return('/login');
  }
  const id = req.params.id;

  let sql = `SELECT tu.*, tc.descricao_cargo 
            FROM tb_usuario tu INNER JOIN
            tb_cargo tc ON tu.fk_cargo = tc.id_cargo 
            WHERE tu.id_usuario = ?`;
  
  conexao.query(sql, [id], function (erro, tb_usuario_qs) {
    if (erro) {
      console.error('Erro ao consultar usuario: ', erro);
      res.status(500).send('Erro ao consultar usuario');
      return;
    }
    res.render('usuario', {tb_usuario: tb_usuario_qs[0]});
  });
});

app.get('/usuario/:id/editar', function(req,res){
  if (!req.session.usuario) {
    return('/login');
  }
  const id = req.params.id;
  let sql = `SELECT * FROM tb_usuario 
             WHERE id_usuario = ?`;
  
  conexao.query(sql, [id], function (erro, tb_usuario_qs) {
    if (erro) {
      console.error('Erro ao consultar usuário: ', erro);
      res.status(500).send('Erro ao consultar usuário');
      return;
    }
    const usuario = tb_usuario_qs[0];
    let sql_cargo = `SELECT * 
                    FROM tb_cargo
                    order by descricao_cargo`;
  
    conexao.query(sql_cargo, function (erro, tb_cargos_qs) {
      if (erro) {
        console.error('Erro ao consultar cargos: ', erro);
        res.status(500).send('Erro ao consultar cargos');
        return;
      }

      res.render('cadUsuario', {
                  formAction: `/usuario/${id}/editar`,//rota post
                  usuario,
                  tb_cargos: tb_cargos_qs 
      });
    });
  });
});

app.post('/usuario/:id/editar', function(req,res){
  if (!req.session.usuario) {
    return('/login');
  }
  const id = req.params.id;

  const {perfil_adm, prontuario, nome, email, status_usuario, fk_cargo} = req.body;

  let sql = `UPDATE tb_usuario 
              SET perfil_adm=?, prontuario=?, nome=?, email=?, status_usuario=?, fk_cargo=?
             WHERE id_usuario = ?`;

  conexao.query(sql, [perfil_adm, prontuario, nome, email, status_usuario, fk_cargo, id], function (erro, tb_chave_upd) {
    if (erro) {
      console.error('Erro ao editar usuário: ', erro);
      res.status(500).send('Erro ao editar usuário');
      return;
    }
  });
  res.redirect('/usuarios');
});

app.post('/usuario/:id/remover', function(req,res){
  if (!req.session.usuario) {
    return('/login');
  }
  const id = req.params.id;

  let sql = `DELETE FROM tb_usuario 
             WHERE id_usuario = ?`;

  console.log([id]);

  conexao.query(sql, [id], function (erro, tb_usuario_del) {
    if (erro) {
      console.error('Erro ao remover usuário: ', erro);
      res.status(500).send('Erro ao remover usuário');
      return;
    }
  });
  res.redirect('/usuarios');
});

app.get('/cadReserva', function(req,res){
  if (!req.session.usuario) {
    return('/login');
  }
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
  if (!req.session.usuario) {
    return('/login');
  }
  const id = req.params.id;

  let sqlChave = `SELECT * FROM tb_chave WHERE id_chave = ${id}`;

  let sqlUsuario = `SELECT * FROM tb_usuario ORDER BY nome`;

  let sqlReserva = `SELECT * FROM tb_reserva WHERE dt_planejada > NOW() AND fk_chave = ${id} AND status_reserva = 'ATIVO' ORDER BY dt_planejada LIMIT 3`;
  
  conexao.query(sqlChave,[id], function(erro, tb_chave_qs){
      if (erro) {
          console.error('Erro ao consultar reservas: ', erro);
          res.status(500).send('Erro ao consultar reservas.');
          return;
      }
      conexao.query(sqlUsuario, function(erro, tb_usuario_qs){
        if(erro) {
          console.error('Erro ao consultar usuários: ', erro);
          res.status(500).send('Erro ao consultar usuários.');
          return;
        }
        conexao.query(sqlReserva, function(erro,tb_reserva_qs){
          if(erro) {
            console.error('Erro ao consultar reservas: ', erro);
            res.status(500).send('Erro ao consultar usuários.');
            return;
          }
          const chave = tb_chave_qs[0];
          res.render('cadReserva', { chave, tb_usuario: tb_usuario_qs, tb_reserva: tb_reserva_qs });
        });
      });
  });
});

app.post('/cadReserva/reservar', (req, res) => {
  if (!req.session.usuario) {
    return('/login');
  }
  const {dt_planejada, fk_chave, fk_usuario, dt_planejadafinal} = req.body;

  const sql = `INSERT INTO tb_reserva (fk_chave, fk_usuario, dt_planejada, dt_planejadafinal)
                VALUES (?,?,?,?)`
  
  conexao.query(sql, [fk_chave, fk_usuario, dt_planejada, dt_planejadafinal], (erro,resultado) => {
    if(erro){
      console.error('Erro ao reservar chave:',erro);
      return res.status(500).send('Erro ao reservar chave.');
    }
    res.redirect('/cadReserva');
  });
});

app.post('/cadReserva/:id/desativar', (req, res) => {
  if (!req.session.usuario) {
    return('/login');
  }
  const id = req.params.id;
  const sql = `UPDATE tb_reserva SET status_reserva ='INATIVO' WHERE id_reserva = ?`

  conexao.query(sql, id, function (erro) {
    if (erro) {
      console.error('Erro ao atualizar reserva: ', erro);
      res.status(500).send('Erro ao atualizar reserva.');
      return;
    }
  });
  res.redirect('/cadReserva');
});

app.listen(8080);