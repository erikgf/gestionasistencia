var app = {},
  _TEMPID = -1,
  _ACCION = "agregar",
  _CLASE = "EquipoProblema",
  DT = null;

app.init = function(){
  this.setDOM();
  this.setEventos();
  this.setTemplate();

  app.llenarCombos();
  app.listar();
};

app.setDOM = function(){
  var DOM = {};

  DOM.listado = $("#listado");
  DOM.modal = $("#mdlRegistro");
  DOM.frmGrabar = $("#frmgrabar");
  DOM.mdlHeader = DOM.modal.find(".modal-header h3");

  DOM.cboFiltro = $("#cbofiltro");
  DOM.cboTipoEquipo = DOM.frmGrabar.find("#cbotipoequipo");
  DOM.cboTipoProblema = DOM.frmGrabar.find("#cbotipoproblema");
  DOM.cboTipoEvento = DOM.frmGrabar.find("#cbotipoevento");

  this.DOM = DOM;
};

app.setEventos  = function(){
  var self = this,
      DOM  = self.DOM;

  DOM.modal.on("hidden.bs.modal",function(e){
    self.limpiar();
  });

  DOM.modal.on("shown.bs.modal",function(e){
    DOM.cboTipoEquipo.chosen("destroy").chosen({allow_single_deselect:true});
    DOM.cboTipoProblema.chosen("destroy").chosen({allow_single_deselect:true});
  });

  DOM.cboFiltro.on("change", function(e){
    self.listar();
  });

  DOM.frmGrabar.on("submit", function(e){
    e.preventDefault();
    swal({
          title: "Confirme",
          text: "¿Esta seguro de grabar los datos ingresados?",
          showCancelButton: true,
          confirmButtonColor: '#3d9205',
          confirmButtonText: 'Si',
          cancelButtonText: "No",
          closeOnConfirm: false,
          closeOnCancel: true,
          imageUrl: "../images/pregunta.png"
        },
        function(isConfirm){ 
          if (isConfirm){
            self.grabar();
          }
      });
  });
};

app.setTemplate = function(){
  var tpl8 = {};
  tpl8.listado = Handlebars.compile($("#tpl8Listado").html());
  tpl8.combo = Handlebars.compile($("#tpl8Combo").html());

  this.tpl8 = tpl8;
};

app.limpiar = function(){
  var DOM = this.DOM;
  DOM.frmGrabar[0].reset();

  _ACCION = "agregar";
  _TEMPID = -1;
};

app.agregar = function(){
  _ACCION = "agregar";
  _TEMPID = -1;
  this.DOM.mdlHeader.html((_ACCION+" Equipo y problema").toUpperCase());
};

app.editar = function(cod){
  _ACCION = "editar";
  _TEMPID = cod;
  var DOM = this.DOM,
    fn = function (xhr){
      var datos = xhr.datos;
      if (datos.rpt) {      
        var data = datos.data;
        DOM.cboTipoEquipo.val(data.cod_tipo_equipo);
        DOM.cboTipoProblema.val(data.cod_tipo_problema);
        DOM.cboTipoEvento.val(data.tipo_evento);
      }else{
        console.error(datos.msj);
      }
  };

  DOM.mdlHeader.html((_ACCION+" Equipo y problema").toUpperCase());
  new Ajxur.Api({
    modelo: _CLASE,
    metodo: "leerDatos",
    data_in : {
      p_codServicioEquipoProblema: cod
    }
  },fn);
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
                  p_codServicioEquipoProblema: cod
                }
              },fn);
          }
      });

};

app.grabar = function(){
  var DOM = this.DOM,
      fn = function(xhr){
        var datos = xhr.datos;
        if (datos.rpt){
          swal("Exito", datos.msj, "success");
          DOM.modal.modal("hide");
          app.listar();
        } else {
          swal("Error", datos.msj, "error");
        } 
      };

  new Ajxur.Api({
    modelo: _CLASE,
    metodo: _ACCION,
    data_in :  {
      p_codTipoProblema : DOM.cboTipoProblema.val(),
      p_codTipoEquipo : DOM.cboTipoEquipo.val(),
      p_tipoEvento : DOM.cboTipoEvento.val(),
      p_codServicioEquipoProblema : _TEMPID
    }
  },fn);
};

app.listar = function(){
  var DOM = this.DOM,
      tpl8Listado = this.tpl8.listado;
  var fn = function (xhr){
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
    metodo: "listar",
    data_in : {
      p_codTipoEquipo : DOM.cboFiltro.val()
    }
  },fn);
};

app.llenarCombos = function(){
  var DOM = this.DOM,
      tpl8 = this.tpl8.combo;
  var fn = function (xhr){
    var datos = xhr.datos;
      if (datos.rpt) {
        DOM.cboFiltro.html(tpl8({opciones: datos.data.tipo_equipos, rotulo: "tipo de equipo"}));
        DOM.cboTipoEquipo.html(tpl8({opciones: datos.data.tipo_equipos, rotulo: "tipo de equipo"}));
        DOM.cboTipoProblema.html(tpl8({opciones: datos.data.tipo_problemas, rotulo: "tipo de problema"}));

        _DATA_PROBLEMAS = datos.data.tipo_problemas; 
        DOM.cboFiltro.chosen("destroy").chosen({allow_single_deselect:true});
      }else{
        console.error(datos.msj);
      }
  };

  new Ajxur.Api({
    modelo: "EquipoProblema",
    metodo: "obtenerCombos"
  },fn);
};

$(document).ready(function(){
  app.init();
});