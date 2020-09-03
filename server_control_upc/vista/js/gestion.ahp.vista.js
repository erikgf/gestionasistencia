var app = {},
  _CLASE = "AhpCriterio";

app.init = function(){
  this.cambiosMatriz = {};
  this.setDOM();
  this.setEventos();
  this.setTemplate();

  this.listarAhpCriterios();
  this.llenarAhpData();
};

app.setDOM = function(){
  var DOM = {};

  DOM.tblCriterios = $("#tbl-criterios");
  DOM.tblMatriz = $("#tbl-matriz");
  DOM.btnRestaurarMatriz = $("#btn-restaurar-matriz");
  DOM.btnGuardarMatriz = $("#btn-guardar-matriz");
  DOM.blkAlert = $("#blkalert");
  DOM.inputAhp;
//  DOM.frmGrabar = $("#frmgrabar");

  this.DOM = DOM;
};

app.setEventos  = function(){
  var self = this,
      DOM  = self.DOM;

  DOM.tblCriterios.on("change", "input[type=checkbox]", function(e){
    var $el = this;
    self.cambiarEstadoActivacion($el.dataset.id, $el.checked);
  });

  DOM.btnRestaurarMatriz.on("click", function(e){
    self.restaurarMatriz();
  });

   DOM.btnGuardarMatriz.on("click", function(e){
    self.guardarMatriz();
  });
};

app.setTemplate = function(){
  var tpl8 = {};
  tpl8.criterios = Handlebars.compile($("#tpl8Criterios").html());
  tpl8.matriz = Handlebars.compile($("#tpl8Matriz").html());

  this.tpl8 = tpl8;
};

app.cambiarEstadoActivacion = function(codAhpCriterio, estadoActivado){
  var DOM = this.DOM,
      fn = function(xhr){
        var datos = xhr.datos;
        if (datos.rpt){
          console.log(datos.msj);
        } else {
          swal("Error", datos.msj, "error");
        } 
      };

  new Ajxur.Api({
    modelo: _CLASE,
    metodo: "cambiarEstadoActivado",
    data_in :  {
      p_codAhpCriterio : codAhpCriterio,
      p_estadoActivado : estadoActivado,
    }
  },fn);
};

app.guardarMatriz = function(){
  var DOM = this.DOM,
      fn = function(xhr){
        var datos = xhr.datos;
        if (datos.rpt){
          Util.alert(DOM.blkAlert, {tipo: "s", mensaje: datos.msj});
        } else {
          swal("Error", datos.msj, "error");
        } 
      };

  var matrizGuardar = [], rpt = true;
  $.each(this.DOM.inputAhp, function(i,o){
    if(o.classList.contains("ahp-modificado")){
      if (o.value.length < 1){
        o.classList.add("matriz-efecto-error");
          setTimeout(function(){
              o.classList.remove("matriz-efecto-error");
          },1000);
        rpt = false;
      } else {
       var coor = o.dataset.d.split("-");
        matrizGuardar.push({
          valor :  o.value,
          x : coor[0],
          y : coor[1]
        });
      }
     
    }
  });

  if (rpt == false){
    Util.alert(DOM.blkAlert, {tipo: "e", mensaje: "No se permiten valores vacíos."});
    return;
  }

  if (matrizGuardar.length > 0){
     new Ajxur.Api({
      modelo: _CLASE,
      metodo: "guardarMatriz",
      data_out : [JSON.stringify(matrizGuardar)]
    },fn);
  } else {
    Util.alert(DOM.blkAlert, {tipo: "e", mensaje: "Nada que guardar."});
  }

 
};

app.listarAhpCriterios = function(){
  var DOM = this.DOM,
      tpl8 = this.tpl8.criterios;
  var fn = function (xhr){
    var datos = xhr.datos;
      if (datos.rpt) {
        DOM.tblCriterios.html(tpl8(datos.data));
      }else{
        console.error(datos.msj);
      }
  };

  new Ajxur.Api({
    modelo: _CLASE,
    metodo: "listar"
  },fn);
};

app.llenarAhpData = function(){
  var DOM = this.DOM,
      tpl8 = this.tpl8.matriz,
      self = this;
  var fn = function (xhr){
    var datos = xhr.datos;
      if (datos.rpt) {
        DOM.tblMatriz.html(tpl8(datos.data)); 
        DOM.inputAhp = $(".ahp-valor");
        DOM.inputAhp.on("keypress", function(e){ return Util.soloNumeros(e);});
        DOM.inputAhp.on("change", function(e){ console.log(this); self.procesarInputAhp(this);});

      }else{
        console.error(datos.msj);
      }
  };

  new Ajxur.Api({
    modelo: _CLASE,
    metodo: "obtenerMatriz"
  },fn);
};

app.procesarInputAhp = function(input){
  var self = this,
      tmpArreglo = input.dataset.d.split("-"),
      criterioX = tmpArreglo[0],
      criterioY = tmpArreglo[1],
      valor = input.value,
      valorEspejo;

    if (valor.length < 1){
      valorEspejo = "";
    } else {
      valor = parseInt(valor);
      if (valor < 1 || valor > 9){
        valor = "";
        valorEspejo = "";
        input.value = valor;
      } else{
        valorEspejo = parseFloat(1 / valor).toFixed(3);
      }
    }

    $.each(this.DOM.inputAhp, function(i,o){
      var coordenadaCriterio = criterioY+"-"+criterioX;
      if (o.dataset.d == coordenadaCriterio ){
        o.value = valorEspejo;
        o.classList.add("ahp-modificado");
        o.classList.add("matriz-efecto-sel");
        setTimeout(function(){
            o.classList.remove("matriz-efecto-sel");
        },1000);
      }
    });

    input.classList.add("ahp-modificado");
    if (valorEspejo != ""){
      input.value = parseFloat(valor).toFixed(3);
    }
    /*Reglar:si valor (pasado a entero) es menor q 1 y mayor que 9, cambiar a ""*/
    /*Reglar: Si x,y es afectado, y,x es afectado con su inverso.*/
};

app.restaurarMatriz = function(){
  $.each(this.DOM.inputAhp, function(i,o){
    if(o.classList.contains("ahp-modificado")){
      o.value = o.dataset.default;
      o.classList.add("matriz-efecto-sel");
          setTimeout(function(){
              o.classList.remove("matriz-efecto-sel");
          },1000);
    }
  });
};

$(document).ready(function(){
  app.init();
});

