function redirecionarParaCadUsuario() {
    // Redireciona para a página desejada
    window.location.href = "cadUsuario.html";
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
    window.location.href = "cadChave.html";
  }
  
  // Espera o DOM carregar e associa a função ao botão
  document.addEventListener("DOMContentLoaded", function () {
    const botao = document.getElementById("btnCadastrarChave");
  
    if (botao) {
      botao.addEventListener("click", redirecionarParaCadChave);
    }
  });