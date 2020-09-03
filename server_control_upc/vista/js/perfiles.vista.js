var app = {},
	vars = {};

app.init = function(){
	this.setTemplates();
	this.setEventos();
	this.listar();
};

app.setTemplates = function(){
	var tpl8 = {};
	tpl8.perfiles = Handlebars.compile($("#tpl8Perfiles").html());

	this.tpl8 = tpl8;
};

app.listar = function(){
	/*Perfiles*/
 	var self = this,
      fn = function (xhr){
      	var txtBuscar = $("#txtbuscar").val();
          if (xhr.rpt) {
            $("#tblbody").html(self.tpl8.perfiles(xhr.data));

            if (txtBuscar.length > 0){
            	self.filtrar(txtBuscar);
            }
          }else{
            console.error(xhr.msj);
          }
      };

  new Ajxur.Api({
    modelo: "Perfil",
    metodo: "listar"
  },fn);
};

app.nuevoPerfil = function(){
	var $mdl = $("#mdlPerfil"),
		$header = $mdl.find(".modal-header h3"),
		$frm = $mdl.find("form");

	$header.html("Nuevo Perfil");
	$("#txtperfilaccion").val("");
	$frm[0].reset();
	$mdl.modal("show");

	$header = null;
	$frm = null;
	$mdl = null;
};

app.leerEditarPerfil = function(codPerfil){
 	var fn;

 	if (codPerfil == null || codPerfil == ""){
 		alert("¡Debe seleccionar un perfil!");
 		return;
 	}

 	fn = function (xhr){
          if (xhr.rpt) {
            var perfil = xhr.data,
            	$mdl = $("#mdlPerfil"),
				$header = $mdl.find(".modal-header h3");

			$("#txtperfilaccion").val(codPerfil);
            $("#txtdescripcion").val(perfil.descripcion);
            $("#cboacceso").val(perfil.estado_acceso);

            $header.html("Editar Perfil: "+perfil.descripcion);
			$mdl.modal("show");

			$mdl = null;
			$header = null;

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Perfil",
	    metodo: "leerEditar",
	    data_in: {
	    	p_codPerfil : codPerfil
    	}
  	},fn);
};

app.darBajaPerfil = function(codPerfil){
 	var self = this,
 		fn;

 	if (codPerfil == null || codPerfil == ""){
 		alert("¡Debe seleccionar un perfil!");
 		return;
 	}

 	if (!confirm("¿Desea dar de baja a este perfil?")){
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
	    modelo: "Perfil",
	    metodo: "darBaja",
	    data_in: {
	    	p_codPerfil : codPerfil
    	}
  	},fn);
};

app.grabarPerfil = function(){
	var self = this,
		fn = function (xhr){
          var msj = xhr.msj;
          if (xhr.rpt) {
          	self.listar();
            $("#mdlPerfil").modal("hide");            
          }else{
            console.error(xhr.msj);
          }
          alert(msj);
     	},
     	codPerfil = $("#txtperfilaccion").val(),
     	accion =  codPerfil == "" ? "agregar" : "editar";

    if (!confirm("¿Desea guardar el registro?")){
 		return;
 	};

 	if (codPerfil == null){
 		alert("Problema al obtener código del perfil.")
 		return;
 	}

	new Ajxur.Api({
	    modelo: "Perfil",
	    metodo: accion,
	    data_in: {
	    	p_codPerfil : codPerfil,
			p_descripcion : $("#txtdescripcion").val(),
			p_estadoAcceso : $("#cboacceso").val()
    	}
  	},fn);
};

app.setEventos =function(){
	var self = this,
		txtBuscar  = $("#txtbuscar"),
		frmPerfil = $("#mdlPerfil").find("form");

	txtBuscar.on("keyup", function(e){
		e.preventDefault();
		self.filtrar(this.value);
	});

	frmPerfil.on("submit", function(e){
		e.preventDefault();
		self.grabarPerfil();
	});

	txtBuscar = null;
	frmPerfil = null;
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

