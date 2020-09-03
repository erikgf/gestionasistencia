var app = {},
  _MODO = "agregando", /*agregando | editando*/
  _TEMPTR = null,
  _TEMPNUMERO = -1,
  _ESTA_REVISADO = false,
  _ESTA_DEVUELTO = false,
  _DATA  = {},
  _MAQUETA_FILA = {
    "numero": 0,
    "tipo_equipo": 1,
    "tipo_problema": 2,
    "tipo_evento" :3,
    "descripcion": 4,
    "acciones" :5
  };

app.init = function(){
  this.setDOM();
  this.setEventos();
  this.setTemplate();


  this.obtenerDatosFormulario();
  /*
  app.llenarPesos();
  app.listar();
  */
};

app.setDOM = function(){
  var DOM = {};

  DOM.txtCodigo = $("#txtcodigo");
  DOM.cboPersonal = $("#cbopersonal");
  DOM.blkEstado = $("#blkestado");

  DOM.lblAccionEvento = $("#lblaccionevento");
  DOM.blkRegistrarEvento = $("#blkregistrarevento");
  DOM.txtDescripcionEvento = $("#txtdescripcionevento");
  DOM.cboTipoEquipo = $("#cbotipoequipo");
  DOM.cboTipoProblema = $("#cbotipoproblema");
  DOM.btnAgregarEvento = $("#btnagregarevento");
  DOM.btnGuardarEdicion = $("#btneditaredicion");
  DOM.btnCancelarEdicion = $("#btncancelaredicion");

  DOM.blkAlertSolicitud = $("#blkalertsolicitud");
  DOM.blkAlertEvento = $("#blkalertevento");
  DOM.blkAlertModal = $("#blkalertmodal");

  DOM.tbl = $("#tbl");

  DOM.lblDevuelto = $("#lbldevuelto");
  DOM.btnRevisarSolicitud = $("#btnrevisarsolicitud");
  DOM.btnDevolverSolicitud = $("#btndevolversolicitud");
  DOM.btnGuardarSolictud  = $("#btnguardarsolicitud");

  DOM.mdlDevolucion = $("#mdlDevolucion");
  DOM.txtMotivoDevolucion = $("#txtmotivodevolucion");
  DOM.frmGrabar = $("#frmgrabar");


  this.DOM = DOM;
};

app.setEventos  = function(){
  var self = this,
      DOM  = self.DOM;

  DOM.btnGuardarEdicion.on("click", function(e){
    e.preventDefault();
    self.guardarEdicion();
  });

  DOM.btnAgregarEvento.on("click", function(e){
    e.preventDefault();
    self.agregarEvento();
  });

  DOM.btnCancelarEdicion.on("click", function(e){
    e.preventDefault();
    self.limpiar();
  });

  DOM.cboTipoEquipo.on("change", function(e){
    self.renderTipoProblema(this.value);
  });

  DOM.tbl.on("click", "tr td button.eliminar-evento", function(e){
    e.preventDefault();
    if (_MODO == "editando"){
      self.limpiar();
    }
    self.eliminarEvento(this);
  });

  DOM.tbl.on("click", "tr td button.editar-evento", function(e){
    e.preventDefault();
    if (_MODO == "editando"){
      self.limpiar();
    }
    self.editarEvento(this);
  });

  DOM.btnRevisarSolicitud.on("click", function(e){
    e.preventDefault();
    if ( _TEMPID == null || _TEMPID <= 0) return;
    swal({
          title: "Confirme",
          text: "¿Está seguro desea validar/revisar esta solicitud?",
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
            self.revisarSolicitud();
          }
      });
  });

  DOM.btnDevolverSolicitud.on("click", function(e){
    e.preventDefault();
    self.devolverSolicitud();
  });


  DOM.btnGuardarSolictud.on("click", function(e){
    e.preventDefault();
    swal({
          title: "Confirme",
          text: "¿Está seguro de grabar esta solicitud?",
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
            self.guardarSolicitud();
          }
      });
  });


  DOM.frmGrabar.on("submit", function(e){
    e.preventDefault();
    self.guardarDevolveSolicitud();
  });


};

app.setTemplate = function(){
  var tpl8 = {};
  tpl8.personal = Handlebars.compile($("#tpl8Personal").html());
  tpl8.tipo_equipo = Handlebars.compile($("#tpl8TipoEquipo").html());
  tpl8.tipo_problema = Handlebars.compile($("#tpl8TipoProblema").html());
  tpl8.evento = Handlebars.compile($("#tpl8Evento").html());

  this.tpl8 = tpl8;
};

app.limpiar = function(){
  var DOM = this.DOM;

  DOM.cboTipoEquipo.val("").trigger("chosen:updated");
  DOM.cboTipoProblema.empty("").trigger("chosen:updated");
  DOM.txtDescripcionEvento.val(""),

  DOM.lblAccionEvento.html("Nuevo Evento");

  DOM.btnAgregarEvento.show();
  DOM.btnGuardarEdicion.hide();
  DOM.btnCancelarEdicion.hide();

  _MODO = "agregando";
  _TEMPNUMERO = -1;

  if (_TEMPTR != null){
    $(_TEMPTR).removeClass("seleccionado-tr");
  }
  _TEMPTR = null;
};

app.limpiarSolicitud = function(){
  var DOM = this.DOM;

  DOM.cboPersonal.val("").trigger("chosen:updated");
  DOM.txtCodigo.val("");
  DOM.blkEstado.hide();
  DOM.tbl.html(this.tpl8.evento([]));

  this.limpiar();
};

app.agregarEvento = function(){
  /*Obtener los datos, ponerlos en un obj y psarlos por el tpl8, luego append a tabla
    Antes de append contar cuantas columnas (no nulltd, hay).
    Si == 0
      html()
    else
      append()
  */
  var DOM = this.DOM,
      filasExistentes = DOM.tbl.find("tr").not(".td-null").length,
      tpl8 = this.tpl8.evento, objArreglo, obj = [],
      esEditando = (_MODO == "editando");

    objArreglo = this.generarObjetoEvento(!esEditando ? filasExistentes : (filasExistentes - 1));

    if (objArreglo.r == false){
      Util.alert(DOM.blkAlertEvento, {tipo: "e", mensaje: objArreglo.msj});
      return;
    };

    if (esEditando){
      this.eliminarEvento(null, _TEMPTR);
    }

    obj.push(objArreglo.objeto);

    var $obj = $(tpl8(obj));

    if (filasExistentes <= 0){
      DOM.tbl.html($obj);
    } else {
      DOM.tbl.append($obj);
    }

    $obj.addClass("creado-tr");
    setTimeout(function(){
      $obj.removeClass("creado-tr");
    },550);

    this.limpiar();
    Util.alert(DOM.blkAlertEvento, {tipo: "s", "mensaje":(esEditando ? "Evento actualizado." : "Evento agregado."),tiempo:1500});
};

app.generarObjetoEvento = function(numero){
  var DOM = this.DOM, 
    cboTipoProblema = DOM.cboTipoProblema,
    tipoEquipo = DOM.cboTipoEquipo.val(),
    tipoProblema = cboTipoProblema.val(),
    descripcionEvento = DOM.txtDescripcionEvento.val(),
    optTipoProblema,
    objeto;

    if (tipoEquipo == ""){
      return {r: false, "msj":"No se ha seleccionado <strong>tipo de equipo.</strong>"};
    }

    if (tipoProblema == ""){
      return {r: false, "msj":"No se ha seleccionado <strong>tipo de problema.</strong>"};
    }


    optTipoProblema = cboTipoProblema.find("option:selected");

    objeto = {
        numero : ++numero,
        tipo_equipo: {
          codigo: tipoEquipo,
          texto: DOM.cboTipoEquipo.find("option:selected").html()
        },
        tipo_problema: {
          codigo: tipoProblema,
          texto: optTipoProblema.html()
        },
        tipo_evento: optTipoProblema.data("evento"),
        descripcion: descripcionEvento
      };

    return {r:true, objeto: objeto};
};

app.actualizarNumerosTabla = function(nuevoNumeroFilas){
  var filasExistentes = [].slice.call(this.DOM.tbl.find("tr").not(".td-null"));
  if (filasExistentes == undefined || filasExistentes == null){ return };
  //console.log("filas existentes ",nuevoNumeroFilas, filasExistentes, filasExistentes.length);
  for (var i = 0; i < filasExistentes.length; i++) {
    filasExistentes[i].children[0].innerHTML = (i+1);
  };
};

app.eliminarEvento = function($btn, $tr){
  var DOM = this.DOM,
      filasExistentes = [].slice.call(DOM.tbl.find("tr").not(".td-null"));

  if ($btn != null){
    $btn.parentElement.parentElement.remove();
  } else {
    $tr.remove();
  }

  if (filasExistentes.length <= 1){
    DOM.tbl.html(this.tpl8.evento([]));
  } else {
    this.actualizarNumerosTabla(filasExistentes.length - 1);
  }

  Util.alert(DOM.blkAlertEvento, {tipo: "s", "mensaje":"Evento eliminado.",tiempo:1500});
};

app.editarEvento = function($btn){
  var tr = $btn.parentElement.parentElement,
    DOM = this.DOM,
    codTipoEquipo =tr.children[_MAQUETA_FILA.tipo_equipo].dataset.codigo,
    codTipoProblema = tr.children[_MAQUETA_FILA.tipo_problema].dataset.codigo,
    descripcion = tr.children[_MAQUETA_FILA.descripcion].innerHTML;

    _MODO = "editando";
    _TEMPNUMERO = tr.children[_MAQUETA_FILA.numero].innerHTML;

    DOM.cboTipoEquipo.val(codTipoEquipo).trigger("chosen:updated");
    this.renderTipoProblema(codTipoEquipo);
    DOM.cboTipoProblema.val(codTipoProblema).trigger("chosen:updated");
    DOM.txtDescripcionEvento.val(descripcion);

    DOM.btnAgregarEvento.hide();
    DOM.btnGuardarEdicion.show();
    DOM.btnCancelarEdicion.show();
    DOM.lblAccionEvento.html("Editando Evento");

    $(tr).addClass("seleccionado-tr");
    _TEMPTR = tr;
};

app.guardarEdicion = function(){
  /*En la memoria debe estar el numero, 
      (se tomará los ccampos)
      el tr (se limpiará en limpiar)
  */
  this.agregarEvento();
};

app.validarSolicitud = function(){
  var DOM = this.DOM,
      arrayEventos = [],
      codPersonal  = DOM.cboPersonal.val(),
      dataIn;


  if (codPersonal == ""){
    return {r: false, msj: "Debe seleccionar un personal que emita la solicitud."};
  }

  $.each(DOM.tbl.find("tr").not(".td-null"), function(i,o){
    var codTipoEquipo = o.children[_MAQUETA_FILA.tipo_equipo].dataset.codigo,
        codTipoProblema = o.children[_MAQUETA_FILA.tipo_problema].dataset.codigo,
        tipoEvento = o.children[_MAQUETA_FILA.tipo_evento].innerHTML.substr(0,1),
        descripcion = o.children[_MAQUETA_FILA.descripcion].innerHTML;

    arrayEventos.push({
          cod_tipo_equipo: codTipoEquipo,
          cod_tipo_problema: codTipoProblema,
          tipo_evento: tipoEvento,
          descripcion : descripcion
        });
  });

  if (arrayEventos.length <= 0){
    return {r: false, msj: "Debe ingresar al menos UN evento en la solicitud."};
  }

  dataIn = {
    p_codPersonal : codPersonal,
    p_eventos : JSON.stringify(arrayEventos),
    p_codSolicitud: _TEMPID
  };
  return {r: true, "data_in": dataIn};

};

app.guardarSolicitud = function(){
  var self = this,
      DOM = self.DOM,
      objValidacion,
      fn = function(xhr){
        var datos = xhr.datos;
        if (datos.rpt){
          swal("Exito", datos.msj, "success");
          if (_TEMPID == null || _TEMPID == -1){
            self.limpiarSolicitud();
          }
        } else {
          Util.alert(DOM.blkAlertSolicitud, {tipo: "e", "mensaje": datos.msj});
        } 
      };

  /*_Validación_*/
  objValidacion = this.validarSolicitud();
  if (!objValidacion.r){
    Util.alert(DOM.blkAlertSolicitud, {tipo: "e", "mensaje": objValidacion.msj});
    return;
  }

  new Ajxur.Api({
    modelo: "Solicitud",
    metodo: "guardarSolicitudWeb",
    data_in :  objValidacion.data_in
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
    metodo: "listar"
  },fn);
};

app.obtenerDatosFormulario = function(){
  /*
    PERSONAS,
    TIPO EQUIPOS
    TIPO PROBLEMAS
  */
  var self = this;

  var fn = function (xhr){
    var datos = xhr.datos;
      if (datos.rpt) {
        _DATA = datos.data.data_base;
        self.renderDatosBase();

        /*Renderizar si hay un item de editar*/
        if (_TEMPID > 0 && datos.data.solicitud){
          self.renderSolicitud(datos.data.solicitud);
        }
      }else{
        console.error(datos.msj);
      }
  };

  new Ajxur.Api({
    modelo: "Solicitud",
    metodo: "obtenerDatosFormulario",
    data_in : {
      p_codSolicitud : _TEMPID
    }
  },fn);
};

app.renderTipoProblema = function(codTipoEquipo){
  var _DATA_TIPO_PROBLEMA = _DATA.tipo_problemas,
    arregloProblemas = [],
    cboTipoProblema = this.DOM.cboTipoProblema;

  if (codTipoEquipo == null || codTipoEquipo == ""){
    cboTipoProblema.empty().chosen("destroy");
    return;
  }

  for (var i = _DATA_TIPO_PROBLEMA.length - 1; i >= 0; i--) {
    var tmpObj = _DATA_TIPO_PROBLEMA[i];
    if (tmpObj.cod_tipo_equipo == codTipoEquipo){
      arregloProblemas.push(tmpObj);
    }
  }

  cboTipoProblema.html(this.tpl8.tipo_problema(arregloProblemas));
  cboTipoProblema.chosen("destroy").chosen({allow_single_deselect:true});

  return arregloProblemas;
};

app.renderDatosBase = function(){
  var DOM = this.DOM,
      tpl8 = this.tpl8,
      data = _DATA;

      DOM.cboPersonal.html(tpl8.personal(data.personal)); 
      DOM.cboTipoEquipo.html(tpl8.tipo_equipo(data.tipo_equipos)); 

      $(".chosen-select").chosen("destroy").chosen({allow_single_deselect:true});
};

app.renderSolicitud = function(objSolicitud){
  var codSolicitud = _TEMPID,
      DOM = this.DOM,
      nuevoArregloEventos;

  DOM.txtCodigo.val(codSolicitud);
  DOM.cboPersonal.val(objSolicitud.cabecera.cod_personal).trigger("chosen:updated");
  DOM.blkEstado.html(`<label class="control-label">Estado</label><br>
                      <span data-estado="`+objSolicitud.cabecera.estado+`" class="badge badge-`+objSolicitud.cabecera.estado_color+` label-lg">`+objSolicitud.cabecera.estado_rotulo+`</span>`).show();  

  nuevoArregloEventos = [];
  $.each(objSolicitud.eventos, function(i,o){
    nuevoArregloEventos.push({
      numero: o.numero_evento,
      tipo_equipo: {codigo: o.cod_tipo_equipo, texto: o.tipo_equipo},
      tipo_problema: {codigo: o.cod_tipo_problema, texto: o.tipo_problema},
      tipo_evento: o.tipo_evento,
      descripcion: o.descripcion
    });
  });

  DOM.tbl.html(this.tpl8.evento(nuevoArregloEventos));

  _ESTA_REVISADO = objSolicitud.cabecera.estado == "R";
  _ESTA_DEVUELTO =  objSolicitud.cabecera.estado_devuelto; 

  this.checkEstadoSolicitud();
};

app.revisarSolicitud = function(){
  var self = this,
      DOM = self.DOM,
      fn = function(xhr){
        var datos = xhr.datos;
        if (datos.rpt){
          swal("Exito", datos.msj, "success");
          if (_TEMPID  > 0){
            _ESTA_REVISADO = true;
            self.checkEstadoSolicitud();
          }
        } else {
          Util.alert(DOM.blkAlertSolicitud, {tipo: "e", "mensaje": datos.msj});
        } 
      };

  new Ajxur.Api({
    modelo: "Solicitud",
    metodo: "revisarSolicitudWeb",
    data_in :  {
      p_codSolicitud : _TEMPID
    }
  },fn);
};


app.devolverSolicitud = function(){
  /*ABRIR MODAL*/
  var DOM = this.DOM;
  DOM.mdlDevolucion.modal("show");
  DOM.frmGrabar[0].reset();
};

app.guardarDevolveSolicitud = function(){
  var self = this,
      DOM = self.DOM,
      fn = function(xhr){
        var datos = xhr.datos;
        if (datos.rpt){
          swal("Exito", datos.msj, "success");
          if (_TEMPID  > 0){
            _ESTA_DEVUELTO = true;
            self.checkEstadoSolicitud();
            DOM.mdlDevolucion.modal("hide");
          }
        } else {
          Util.alert(DOM.blkAlertModal, {tipo: "e", "mensaje": datos.msj});
        } 
      };

    new Ajxur.Api({
      modelo: "Solicitud",
      metodo: "devolverSolicitudWeb",
      data_in :  {
        p_codSolicitud : _TEMPID,
        p_observacionesDevolucion : DOM.txtMotivoDevolucion.val()
      }
    },fn);
};


app.checkEstadoSolicitud = function(){
  var DOM = this.DOM;
     if (_ESTA_REVISADO){
        DOM.btnGuardarSolictud.hide();
        DOM.btnRevisarSolicitud.hide();
        DOM.btnDevolverSolicitud.hide();
        DOM.lblAccionEvento.hide();
        DOM.blkRegistrarEvento.hide();
        DOM.tbl.find("button").remove();
        DOM.blkEstado.html(`<label class="control-label">Estado</label><br>
                      <span class="badge badge-info label-lg">REVISADO</span>`).show();  

     } else {
        DOM.btnGuardarSolictud.show();
        DOM.btnRevisarSolicitud.show();
        DOM.lblAccionEvento.show();
        DOM.blkRegistrarEvento.show();
        if (_ESTA_DEVUELTO){
          DOM.btnDevolverSolicitud.hide();
          DOM.lblDevuelto.show();
        } else {
          DOM.lblDevuelto.hide();
          DOM.btnDevolverSolicitud.show();  
        }
     }
};

$(document).ready(function(){
  app.init();
});

