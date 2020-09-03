var app = {},
	vars = {};

app.init = function(){
	this.setTemplates();
	this.setEventos();
	this.listar();
};


app.setTemplates = function(){
	var tpl8 = {};
	tpl8.regiones = Handlebars.compile($("#tpl8Regiones").html());

	this.tpl8 = tpl8;
};

app.listar = function(){
	/*Regiones*/
 	var self = this,
      fn = function (xhr){
      	  var txtBuscar = $("#txtbuscar").val();
          if (xhr.rpt) {
            $("#tblbody").html(self.tpl8.regiones(xhr.data));

            if (txtBuscar.length > 0){
            	self.filtrar(txtBuscar);
            }
          }else{
            console.error(xhr.msj);
          }
      };

  new Ajxur.Api({
    modelo: "Region",
    metodo: "listar"
  },fn);
};

app.nuevaRegion = function(){
	var $mdl = $("#mdlRegion"),
		$header = $mdl.find(".modal-header h3"),
		$frm = $mdl.find("form");

	$header.html("Nueva Región");
	$("#txtregionaccion").val("");
	$frm[0].reset();
	$mdl.modal("show");

	$header = null;
	$frm = null;
	$mdl = null;
};

app.leerEditarRegion = function(codRegion){
 	var fn;

 	if (codRegion == null || codRegion == ""){
 		alert("¡Debe seleccionar una region!");
 		return;
 	}

 	fn = function (xhr){
          if (xhr.rpt) {
            var region = xhr.data,
            	$mdl = $("#mdlRegion"),
				$header = $mdl.find(".modal-header h3");

			$("#txtregionaccion").val(codRegion);
            $("#txtregiondescripcion").val(region.descripcion);

            $header.html("Editar Región: "+region.descripcion);
			$mdl.modal("show");

			$mdl = null;
			$header = null;

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Region",
	    metodo: "leerEditar",
	    data_in: {
	    	p_codRegion : codRegion
    	}
  	},fn);
};

app.darBajaRegion = function(codRegion){
 	var self = this,
 		fn;

 	if (codRegion == null || codRegion == ""){
 		alert("¡Debe seleccionar una región!");
 		return;
 	}

 	if (!confirm("¿Desea dar de baja a esta región?")){
 		return;
 	};
 
 	fn = function (xhr){
          if (xhr.rpt) {
            var msj = xhr.msj;
            self.listar();
            alert(msj);

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Region",
	    metodo: "darBaja",
	    data_in: {
	    	p_codRegion : codRegion
    	}
  	},fn);
};

app.grabarRegion = function(){
	var self = this,
		fn = function (xhr){
          var msj = xhr.msj;
          if (xhr.rpt) {
          	self.listar();
            $("#mdlRegion").modal("hide");            
          }else{
            console.error(xhr.msj);
          }
          alert(msj);
     	},
     	codRegion = $("#txtregionaccion").val(),
     	accion =  codRegion == "" ? "agregar" : "editar";

    if (!confirm("¿Desea guardar el registro?")){
 		return;
 	};

 	if (codRegion == null){
 		alert("Problema al obtener código de la región.")
 		return;
 	}

	new Ajxur.Api({
	    modelo: "Region",
	    metodo: accion,
	    data_in: {
	    	p_codRegion : codRegion,
			p_descripcion : $("#txtregiondescripcion").val(),
    	}
  	},fn);
};

app.setEventos =function(){
	var self = this,
		txtBuscar  = $("#txtbuscar"),
		frmRegion = $("#mdlRegion").find("form");

	txtBuscar.on("keyup", function(e){
		e.preventDefault();
		self.filtrar(this.value);
	});

	frmRegion.on("submit", function(e){
		e.preventDefault();
		self.grabarRegion();
	});

	txtBuscar = null;
	frmRegion = null;
};

app.filtrar = function(valor){;
	var _valor = valor.toLowerCase();
	$($("#tblbody").find("tr")).each(function(){
		var dis = $(this);
        dis[dis.text().toLowerCase().indexOf(_valor) > -1 ? "show" : "hide"]();
   	});
};

$(document).ready(function(){
  app.init();
});

