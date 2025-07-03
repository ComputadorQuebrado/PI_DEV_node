  function redirecionarParaHome() {
    // Redireciona para a página desejada
    window.location.href = "/";
  }

  document.addEventListener("DOMContentLoaded", function () {
    const botao = document.getElementById("btnCancelar");
  
    if (botao) {
      botao.addEventListener("click", redirecionarParaHome);
    }
  });

  function redirecionarParaCadUsuario() {
    // Redireciona para a página desejada
    window.location.href = "/usuarios";
  }
  
  // Espera o DOM carregar e associa a função ao botão
  document.addEventListener("DOMContentLoaded", function () {
    const botao = document.getElementById("btnCadastrarUsuario");
  
    if (botao) {
      botao.addEventListener("click", redirecionarParaCadUsuario);
    }
  });

  function redirecionarParaCadChave() {
    // Redireciona para a página desejada
    window.location.href = "/chaves";
  }
  
  // Espera o DOM carregar e associa a função ao botão
  document.addEventListener("DOMContentLoaded", function () {
    const botao = document.getElementById("btnCadastrarChave");
  
    if (botao) {
      botao.addEventListener("click", redirecionarParaCadChave);
    }
  });

  function redirecionarParaCadReserva() {
    // Redireciona para a página desejada
    window.location.href = "/cadReserva";
  }
  
  // Espera o DOM carregar e associa a função ao botão
  document.addEventListener("DOMContentLoaded", function () {
    const botao = document.getElementById("btnCadastrarReserva");
  
    if (botao) {
      botao.addEventListener("click", redirecionarParaCadReserva);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    const botao = document.getElementById("btnCadastrarUsuario");
  
    if (botao) {
      botao.addEventListener("click", redirecionarParaCadUsuario);
    }
  });