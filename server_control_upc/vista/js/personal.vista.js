var app = {},
  _TEMPID = -1,
  _seleccionados = [],
  _dataPersonalTmp = [],
  DT = null;

app.init = function(){
  this.setDOM();
  this.setEventos();
  this.setTemplate();

  app.llenarCargos();
  app.listar();
};

app.setDOM = function(){
  var DOM = {};

  DOM.tbPersonal = $("#tbpersonal");
  DOM.tblPersonal = $("#tblpersonal");
  DOM.modal = $("#mdlPersonal");
  DOM.frmGrabar = $("#frmgrabar");
  DOM.mdlHeader = DOM.modal.find(".modal-header h3");

  DOM.txtDni = DOM.frmGrabar.find("#txtdni");
  DOM.txtNombresApellidos = DOM.frmGrabar.find("#txtnombresapellidos");
  DOM.txtFechaIngreso = DOM.frmGrabar.find("#txtfechaingreso");
  DOM.txtFechaNacimiento = DOM.frmGrabar.find("#txtfechanacimiento");
  DOM.txtCussp = DOM.frmGrabar.find("#txtcussp");
  DOM.txtDireccion = DOM.frmGrabar.find("#txtdireccion");
  DOM.cboCargo = DOM.frmGrabar.find("#cbocargo");
  DOM.cboAgricasa = DOM.frmGrabar.find("#cboagricasa");

  DOM.btnNuevo = $("#btnnuevo");
  DOM.btnEliminarMasivo = $("#btneliminarmasivo");
  DOM.btnCarneMasivo = $("#btncarnemasivo");
  DOM.btnCarneMasivoTodos = $("#btncarnemasivotodos");

  this.DOM = DOM;
};

app.setEventos  = function(){
  var self = this,
      DOM  = self.DOM;

  DOM.modal.on("hidden.bs.modal",function(e){
    self.limpiar();
  });

  DOM.btnNuevo.on("click", function(e){
    e.preventDefault();
    self.agregar();
  });

  DOM.btnEliminarMasivo.on("click", function(e){
    e.preventDefault();
    if (!_seleccionados.length){
      alert("No hay registros seleccionados.");
      return;
    }

    self.eliminarMasivo(_seleccionados);
  });

  DOM.btnCarneMasivo.on("click", function(e){
    e.preventDefault();
    if (!_seleccionados.length){
      alert("No hay registros seleccionados.");
      return;
    }

    self.carneMasivo(_seleccionados);
  });

  DOM.btnCarneMasivoTodos.on("click", function(e){
    e.preventDefault();

    for (var i = _dataPersonalTmp.length - 1; i >= 0; i--) {
      _seleccionados.push({id: _dataPersonalTmp[i].idpersonal, tr: null});
    };

    self.carneMasivo(_seleccionados);
  });

  DOM.frmGrabar.on("submit", function(e){
    e.preventDefault();
    if (!confirm("¿Esta seguro de grabar los datos ingresados?")){
       return;
    }

    self.grabar();
  });


  DOM.tblPersonal.on("change", "tr td input.seleccionador", function(e){
    e.preventDefault();
    var dis = this,
       $tr = dis.parentElement.parentElement;
    if (dis.checked){
      self.agregarSeleccionados($tr);
    } else {
      self.eliminarSeleccionados($tr);
    }
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

  _TEMPID = -1;
};

app.limpiarClave = function(){
  var DOM = this.DOM;
  DOM.frmGrabarClave[0].reset();
};

app.agregar = function(){
  var DOM  = this.DOM;
  _TEMPID = -1;
  DOM.mdlHeader.html(("Nuevo Personal").toUpperCase());
  DOM.modal.modal("show");

  DOM = null;
};

app.editar = function(idpersonal){
   if (!idpersonal){
    console.error("Parametro, FN Editar, vacío.");
    return;
   }

  _TEMPID = idpersonal;

  var DOM = this.DOM,
    fn = function (xhr){
      if (xhr.rpt) {   
        var data = xhr.data;
        DOM.modal.modal("show");
        DOM.txtDni.val(data.dni);
        DOM.txtNombresApellidos.val(data.nombres_apellidos);
        DOM.txtCussp.val(data.cussp);
        DOM.txtFechaIngreso.val(data.fecha_ingreso);
        DOM.txtFechaNacimiento.val(data.fecha_nacimiento);
        DOM.txtDireccion.val(data.direccion);
        DOM.cboAgricasa.val(data.agricasa);
        DOM.cboCargo.val(data.idcargo);

      }else{
        console.error(xhr.msj);
      }
  };

  DOM.mdlHeader.html(("Editar personal").toUpperCase());
  new Ajxur.Api({
    modelo: "Personal",
    metodo: "leerDatos",
    data_in : {
      p_idpersonal: idpersonal
    }
  },fn);
};

app.eliminar = function(arregloIds){
  var self = this,
      DOM = this.DOM,
      fn = function (xhr){
        if (xhr.rpt) {   
            alert(xhr.msj);  
            _seleccionados = [];
            self.listar();
        }else{
          console.error(xhr.msj);
        }
    };

  if (!arregloIds.length){
    return;
  }

  new Ajxur.Api({
                modelo: "Personal",
                metodo: "darBaja",
                data_out : [JSON.stringify(arregloIds)]
              },fn);

};

app.grabar = function(){
  var self = this, 
      DOM = this.DOM,
      fn = function(xhr){
        if (xhr.rpt){
          alert(xhr.msj);
          DOM.modal.modal("hide");
          self.listar();
        } else {
          console.error(xhr.msj);
        } 
      };

  new Ajxur.Api({
    modelo: "Personal",
    metodo: (_TEMPID == -1 ? "agregar" : "editar"),
    data_in :  {
      p_dni : DOM.txtDni.val(),
      p_nombresApellidos : DOM.txtNombresApellidos.val(),
      p_cussp : DOM.txtCussp.val(),
      p_fechaIngreso : DOM.txtFechaIngreso.val(),
      p_fechaNacimiento : DOM.txtFechaNacimiento.val(),
      p_direccion : DOM.txtDireccion.val(),
      p_agricasa : DOM.cboAgricasa.val(),
      p_idcargo : DOM.cboCargo.val(),
      p_idpersonal : _TEMPID
    }

  },fn);
};

app.listar = function(){
  var DOM = this.DOM,
      tpl8Listado = this.tpl8.listado;

  var fn = function (xhr){
      if (xhr.rpt) {
        var data = xhr.data;
        if (DT) { DT.fnDestroy(); DT = null; }
        _dataPersonalTmp = data;
        DOM.tblPersonal.html(tpl8Listado(data));
        DT = DOM.tbPersonal.dataTable({
          "aaSorting": [[0, "asc"]]
        });
      }else{
        console.error(xhr.msj);
      }
  };

  new Ajxur.Api({
    modelo: "Personal",
    metodo: "listar"
  },fn);
};

app.agregarSeleccionados = function($tr){
  var idpersonal = $tr.dataset.id;
  var esContenido = this.esContenido($tr, idpersonal);

  if (esContenido){
    return;
  }

  _seleccionados.push({id: idpersonal, tr: $tr});
};

app.eliminarSeleccionados = function($tr){
  var idpersonal = $tr.dataset.id;
  var esContenido = this.esContenido($tr, idpersonal);

  if (!esContenido){
    return;
  }

  var nuevoArreglo = [];
  for (var i = 0; i < _seleccionados.length; i++) {
    var obj = _seleccionados[i];
    if (obj.id != idpersonal){
      nuevoArreglo.push(_seleccionados[i]);
    }
  };

  _seleccionados = nuevoArreglo;
};

app.esContenido = function($tr, id){
  for (var i = _seleccionados.length - 1; i >= 0; i--) {
    var obj = _seleccionados[i];
    if (obj.id == id){
      return true;
    }
  };

  return false;
};

app.eliminarMasivo = function(arreglo){

  if (!confirm("¿Esta seguro de eliminar estos registros?")){
       return;
  }

  var self = this,
    arregloIds = [];
  for (var i = 0; i < arreglo.length; i++) {
    var obj = arreglo[i];
    arregloIds.push(obj.id);
  };

  self.eliminar(arregloIds);
};

app.carneMasivo = function(arreglo){
  var self = this,
    arregloIds = [];
  for (var i = 0; i < arreglo.length; i++) {
    var obj = arreglo[i];
    arregloIds.push(obj.id);
  };

  self.carne(arregloIds);
};

app.carne = function(arregloIds){
  _seleccionados = [];
  $(".seleccionador").prop("checked",false);

  submit_post_via_hidden_form(
      "imprimir.qrcardspersonal.vista.php",
      {
          p_ids : JSON.stringify(arregloIds)
      }
  );

};

app.llenarCargos = function(){
  var DOM = this.DOM,
      tpl8 = this.tpl8.combo,
      fn = function (xhr){
        if (xhr.rpt) {
          var data = xhr.data;
          DOM.cboCargo.html(tpl8({opciones: data, rotulo: "cargo"}));
        }else{
          console.error(xhr.msj);
        }
      };

  new Ajxur.Api({
    modelo: "Personal",
    metodo: "obtenerCargosCombo"
  },fn);
};


function submit_post_via_hidden_form(url, params) {
    var f = $("<form target='_blank' method='POST' style='display:none;'></form>").attr({
        action: url
    }).appendTo(document.body);

    for (var i in params) {
        if (params.hasOwnProperty(i)) {
            $('<input type="hidden" />').attr({
                name: i,
                value: params[i]
            }).appendTo(f);
        }
    }

    f.submit();

    f.remove();
};


$(document).ready(function(){
  app.init();
});

