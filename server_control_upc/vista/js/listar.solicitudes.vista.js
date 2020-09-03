var app = {},
  _CLASE = "Solicitud",
  DT = null;

app.init = function(){
  this.setDOM();
  this.setEventos();
  this.setTemplate();

  app.listar();
};

app.setDOM = function(){
  var DOM = {};

  DOM.listado = $("#listado");

  this.DOM = DOM;
};

app.setEventos  = function(){
  var self = this,
      DOM  = self.DOM;
};

app.setTemplate = function(){
  var tpl8 = {};
  tpl8.listado = Handlebars.compile($("#tpl8Listado").html());

  this.tpl8 = tpl8;
};

app.editar = function(cod){
  window.open("registrar.solicitud.vista.php?cs="+cod);
};

app.eliminar = function(cod){
  var DOM = this.DOM,
    fn = function (xhr){
      var datos = xhr.datos;
      if (datos.rpt) {      
         swal("Exito", datos.msj, "success");
         app.listar();
      }else{
        console.error(datos.msj);
      }
  };

  swal({
          title: "Confirme",
          text: "¿Esta seguro que desea eliminar el registro?",
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
                modelo: _CLASE,
                metodo: "eliminar",
                data_in : {
                  p_codSolicitud: cod
                }
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
              "aaSorting": [[0, "asc"]]
            });
          }else{
            swal("Error", datos.msj, "error");
          }
      };

  new Ajxur.Api({
    modelo: _CLASE,
    metodo: "listar"
  },fn);
};

$(document).ready(function(){
  app.init();
});

