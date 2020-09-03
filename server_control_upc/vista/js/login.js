var app = {}; 

app.init = function(){
  this.setDOM();
  this.setEventos();
};

app.setDOM = function(){
  var DOM = {};

  DOM.frmIniciar = $("form");
  DOM.txtUsuario = $("#txtusuario");
  DOM.txtClave = $("#txtclave");
  DOM.chkRecordar = $("#chkrecordar");

  this.DOM = DOM;
};

app.setEventos  = function(){
  var self = this;

  self.DOM.frmIniciar.on("submit", function(e){
    e.preventDefault();
    self.iniciarSesion();
  });
};

app.limpiar = function(){
  this.DOM.frmIniciar[0].reset();
};

app.iniciarSesion = function(){
  var DOM = this.DOM,
      fn = function(xhr){
        if (xhr.rpt == true){
          window.location.href = "principal.vista.php";
        } else{
          alert(xhr.msj);    
        }
      };

  new Ajxur.Api({
    modelo: "Sesion",
    metodo: "iniciarSesion",
    data_in :  {
      p_usuario : DOM.txtUsuario.val(),
      p_clave : DOM.txtClave.val(),
      p_recordar : DOM.chkRecordar[0].checked
    }
  },fn);
};


$(document).ready(function(){
  app.init();
});

