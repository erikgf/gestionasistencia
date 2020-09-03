var app = {},
	vars = {};

app.init = function(){
	this.setTemplates();
	this.cargarDatosBase();
	this.setEventos();
	this.listar();
};


app.setTemplates = function(){
	var tpl8 = {};
	tpl8.colaboradores = Handlebars.compile($("#tpl8Colaboradores").html());
	tpl8.combo = Handlebars.compile($("#tpl8Combo").html());

	this.tpl8 = tpl8;
};

app.cargarDatosBase = function(){
	/*Colaboradores*/
 	var self = this,
      fn = function (xhr){
      	var txtBuscar = $("#txtbuscar").val();
          if (xhr.rpt) {
            $("#cboperfil").html(self.tpl8.combo(xhr.data));
          }else{
            console.error(xhr.msj);
          }
      };

  new Ajxur.Api({
    modelo: "Perfil",
    metodo: "obtenerPerfiles"
  },fn);
};

app.listar = function(){
	/*Colaboradores*/
 	var self = this,
      fn = function (xhr){
      	var txtBuscar = $("#txtbuscar").val();
          if (xhr.rpt) {
            $("#tblbody").html(self.tpl8.colaboradores(xhr.data));

            if (txtBuscar.length > 0){
            	self.filtrar(txtBuscar);
            }
          }else{
            console.error(xhr.msj);
          }
      };

  new Ajxur.Api({
    modelo: "Colaborador",
    metodo: "listar"
  },fn);
};

app.nuevoColaborador = function(){
	var $mdl = $("#mdlColaborador"),
		$header = $mdl.find(".modal-header h3"),
		$frm = $mdl.find("form");

	$header.html("Nuevo Colaborador");
	$("#txtcolaboradoraccion").val("");
	$frm[0].reset();
	$mdl.modal("show");

	$header = null;
	$frm = null;
	$mdl = null;
};

app.leerEditarColaborador = function(codColaborador){
 	var fn;

 	if (codColaborador == null || codColaborador == ""){
 		alert("¡Debe seleccionar un colaborador!");
 		return;
 	}

 	fn = function (xhr){
          if (xhr.rpt) {
            var colaborador = xhr.data,
            	$mdl = $("#mdlColaborador"),
				$header = $mdl.find(".modal-header h3");

			$("#txtcolaboradoraccion").val(codColaborador);
            $("#txtdni").val(colaborador.dni);
            $("#txtnombres").val(colaborador.nombres);
            $("#txtapellidos").val(colaborador.apellidos);
            $("#txtcorreo").val(colaborador.correo);
            $("#txtcelular").val(colaborador.celular);
            $("#txtusuario").val(colaborador.usuario);
            $("#cboperfil").val(colaborador.cod_perfil);
            $("#cboestado").val(colaborador.estado_baja);

            $header.html("Editar Colaborador: "+colaborador.apellidos+", "+colaborador.nombres);
			$mdl.modal("show");

			$mdl = null;
			$header = null;

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Colaborador",
	    metodo: "leerEditar",
	    data_in: {
	    	p_codColaborador : codColaborador
    	}
  	},fn);
};

app.darBajaColaborador = function(codColaborador){
 	var self = this,
 		fn;

 	if (codColaborador == null || codColaborador == ""){
 		alert("¡Debe seleccionar un colaborador!");
 		return;
 	}

 	if (!confirm("¿Desea dar de baja a este colaborador?")){
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
	    modelo: "Colaborador",
	    metodo: "darBaja",
	    data_in: {
	    	p_codColaborador : codColaborador
    	}
  	},fn);
};

app.grabarColaborador = function(){
	var self = this,
		fn = function (xhr){
          var msj = xhr.msj;
          if (xhr.rpt) {
          	self.listar();
            $("#mdlColaborador").modal("hide");            
          }else{
            console.error(xhr.msj);
          }
          alert(msj);
     	},
     	codColaborador = $("#txtcolaboradoraccion").val(),
     	accion =  codColaborador == "" ? "agregar" : "editar";

    if (!confirm("¿Desea guardar el registro?")){
 		return;
 	};

 	if (codColaborador == null){
 		alert("Problema al obtener código del colaborador.")
 		return;
 	}

	new Ajxur.Api({
	    modelo: "Colaborador",
	    metodo: accion,
	    data_in: {
	    	p_codColaborador : codColaborador,
			p_dni : $("#txtdni").val(),
			p_nombres : $("#txtnombres").val(),
			p_apellidos : $("#txtapellidos").val(),
			p_correo : $("#txtcorreo").val(),
			p_celular : $("#txtcelular").val(),
			p_usuario : $("#txtusuario").val(),
			p_codPerfil : $("#cboperfil").val(),
			p_estadoBaja : $("#cboestado").val()
    	}
  	},fn);
};

app.setEventos =function(){
	var self = this,
		txtBuscar  = $("#txtbuscar"),
		frmColaborador = $("#mdlColaborador").find("form"),
		frmClaveColaborador = $("#mdlClaveColaborador").find("form");

	txtBuscar.on("keyup", function(e){
		e.preventDefault();
		self.filtrar(this.value);
	});

	frmColaborador.on("submit", function(e){
		e.preventDefault();
		self.grabarColaborador();
	});

	frmClaveColaborador.on("submit", function(e){
		e.preventDefault();
		self.grabarClaveColaborador();
	});

	$(".verclave").on("mouseenter", function(e){
		e.preventDefault();
		console.log(this.dataset);
		$("#"+this.dataset.id)[0].type = "text";
	});

	$(".verclave").on("mouseleave", function(e){
		e.preventDefault();
		$("#"+this.dataset.id)[0].type = "password";
	});

	txtBuscar = null;
	frmColaborador = null;
};

app.filtrar = function(valor){;
	var _valor = valor.toLowerCase();
	$($("#tblbody").find("tr")).each(function(){
		var dis = $(this);
        dis[dis.text().toLowerCase().indexOf(_valor) > -1 ? "show" : "hide"]();
   	});
};

app.cambiarClave = function(codColaborador){
	var fn;

 	if (codColaborador == null || codColaborador == ""){
 		alert("¡Debe seleccionar un colaborador!");
 		return;
 	}

 	fn = function (xhr){
          if (xhr.rpt) {
            var colaborador = xhr.data,
            	$mdl = $("#mdlClaveColaborador");

            $("#txtclavecodcolaborador").val(codColaborador);
            $("#txtclavecolaborador").val((colaborador.dni ? colaborador.dni : "")+" - "+colaborador.apellidos+", "+colaborador.nombres);
			$mdl.modal("show");
			$mdl = null;

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Colaborador",
	    metodo: "leerEditar",
	    data_in: {
	    	p_codColaborador : codColaborador
    	}
  	},fn);
};

app.grabarClaveColaborador = function(){
	var self = this,
		$nuevaClave = $("#txtnuevaclave").val(),
		$confirmarClave = $("#txtconfirmarclave").val(),
		codColaborador = $("#txtclavecodcolaborador").val(),
		fn = function (xhr){
          var msj = xhr.msj;
          if (xhr.rpt) {
            $("#mdlClaveColaborador").modal("hide");            
          }else{
            console.error(xhr.msj);
          }
          alert(msj);
     	};

   
 	if ($nuevaClave != $confirmarClave){
 		alert("Las claves no coinciden.");
 		return;
 	}

 	if (codColaborador == null){
 		alert("Problema al obtener código del colaborador.")
 		return;
 	}

 	if (!confirm("¿Desea guardar la nueva clave?")){
 		return;
 	};

	new Ajxur.Api({
	    modelo: "Colaborador",
	    metodo: "cambiarClave",
	    data_in: {
	    	p_codColaborador : codColaborador
    	},
    	data_out: [$nuevaClave, $confirmarClave]
  	},fn);
};

$(document).ready(function(){
  app.init();
});

