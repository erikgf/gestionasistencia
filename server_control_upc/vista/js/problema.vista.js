var app = {},
  _CAMBIANDO_ESTADO = false,
  _COD_EVENTO = null,
  _SELECT = null,
  DT = null;

app.init = function(){
  this.setDOM();
  this.setEventos();
  this.setTemplate();

  app.listar();
};

app.setDOM = function(){
  var DOM = {};

  DOM.cboEstado = $("#cboestado");
  DOM.listado = $("#listado");

  DOM.mdlObservaciones = $("#mdlObservaciones");
  DOM.frmGrabar = $("#frmgrabar");
  DOM.lblModalHeader = $("#lblmodalheader");
  DOM.txtObservaciones = $("#txtobservaciones");

  DOM.cboEstado.chosen();

  this.DOM = DOM;
};

app.setEventos  = function(){
  var self = this,
      DOM  = self.DOM;

  DOM.cboEstado.on("change",function(e){
    self.listar();
  });

  DOM.mdlObservaciones.on("hidden.bs.modal", function(){
    DOM.txtObservaciones.val("");
    self.resetVariables();
  });

  DOM.frmGrabar.on("submit", function(e){
    e.preventDefault();
    self.cambiarEstado();
  });
};

app.setTemplate = function(){
  var tpl8 = {};
  tpl8.listado = Handlebars.compile($("#tpl8Listado").html());

  this.tpl8 = tpl8;
};

app.resetVariables = function(){
    _COD_EVENTO = null;
    _CAMBIANDO_ESTADO = false;
    if (_SELECT != null){
      _SELECT.val("");
      _SELECT = null;
    }
};

app.modalCambiarEstado = function(cboEstado, codEvento){
  var DOM = this.DOM;
  if (cboEstado.val() == ""){
    return;
  }

  DOM.mdlObservaciones.modal("show");
  DOM.lblModalHeader.html(cboEstado.find("option:selected").html());

  _CAMBIANDO_ESTADO = true;
  _COD_EVENTO = codEvento;
  _SELECT = cboEstado;
};


app.cambiarEstado = function(){
  var self = this,
    DOM = self.DOM,
    fn = function (xhr){
      var datos = xhr.datos;
      if (datos.rpt) {      
         swal("Exito", datos.msj, "success");
         self.resetVariables();
         DOM.mdlObservaciones.modal("hide");
         self.listar();
      }else{
        console.error(datos.msj);
      }
  };

  if (_COD_EVENTO == null){
    return;
  }

  swal({
          title: "Confirme",
          text: "¿Esta seguro de cambiar el estado?",
          showCancelButton: true,
          confirmButtonColor: '#3d9205',
          confirmButtonText: 'Si',
          cancelButtonText: "No",
          closeOnConfirm: true,
          closeOnCancel: true,
          imageUrl: "../images/pregunta.png"
        },
        function(isConfirm){ 
          if (isConfirm){
              new Ajxur.Api({
                modelo: "SolicitudEvento",
                metodo: "cambiarEstado",
                data_in: {
                  p_observacion: DOM.txtObservaciones.val(),
                  p_estado : _SELECT.val()
                },
                data_out : [_COD_EVENTO]
              },fn);
          }
      });
};

app.listar = function(){
  var DOM = this.DOM,
      tpl8Listado = this.tpl8.listado,
      fn = function (xhr){
        var datos = xhr.datos;
          if (datos.rpt) {
            if (DT) { DT.fnDestroy(); DT = null; }
            DOM.listado.html(tpl8Listado(datos.data));
            DT = DOM.listado.find("table").dataTable({
              "scrollX": true
            });
          }else{
            swal("Error", datos.msj, "error");
          }
      };

  new Ajxur.Api({
    modelo: "SolicitudEvento",
    metodo: "listarProblemas",
    data_out : [DOM.cboEstado.val()]
  },fn);
};

$(document).ready(function(){
  app.init();
});

