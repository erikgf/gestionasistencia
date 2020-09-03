var app = {},
	vars = {};

app.init = function(){
	this.setTemplates();
	this.cargarDatosBase();
	this.cargarRegiones();
	this.setEventos();
	this.setVariables();
};

app.setTemplates = function(){
	var tpl8 = {};
	tpl8.combo = Handlebars.compile($("#tpl8Combo").html());
	tpl8.cabeceraCampo = Handlebars.compile($("#tpl8CabeceraCampo").html());
	tpl8.tblSiembra = Handlebars.compile($("#tpl8Siembras").html());
	tpl8.tblCampana = Handlebars.compile($("#tpl8Campanas").html());
	tpl8.tblParcela = Handlebars.compile($("#tpl8Parcelas").html());

	this.tpl8 = tpl8;
};

app.cargarRegiones = function(){
	/*Regiones*/
 	var self = this,
      fn = function (xhr){
          if (xhr.rpt) {
            var datos = xhr.data,
            	$cbo = $("#cboregion");

            $cbo.html(self.tpl8.combo(datos));
            $cbo.selectpicker();
            $("#cbocampo").selectpicker();
          }else{
            console.error(xhr.msj);
          }
      };

  new Ajxur.Api({
    modelo: "Region",
    metodo: "obtenerRegiones"
  },fn);
};

app.cargarDatosBase = function(){
	var self = this,
      fn = function (xhr){
          if (xhr.rpt) {
            var datos = xhr.data;

            $("#cbocamporegion").html(self.tpl8.combo(datos.regiones));
			$("#cbosiembracultivo").html(self.tpl8.combo(datos.cultivos));

          }else{
            console.error(xhr.msj);
          }
      };

	new Ajxur.Api({
	    modelo: "Region",
	    metodo: "obtenerDatosBase"
	  },fn);
};

app.cargarCampos = function(codRegion){
	var self = this,
      $cbo = $("#cbocampo"),	
      fn = function (xhr){
          if (xhr.rpt) {
            var datos = xhr.data;
            $cbo.html(self.tpl8.combo(datos));
            $cbo.selectpicker("refresh");
            $cbo = null;
          }else{
            console.error(xhr.msj);
          }
      };

  if (codRegion == ""){
  	$cbo.empty();
  	$cbo.selectpicker("refresh");
  	$cbo = null;
  	return;
  }

  new Ajxur.Api({
    modelo: "Campo",
    metodo: "obtenerCampos",
    data_in: {
    	p_codRegion : codRegion
    }
  },fn);
};


app.cargarDatosCampo  = function(codCampo){
	/*
		- cabecera___
		- siembras
		- campañas
		- cosechas	
	*/
	var self = this,
	  $cbo,
      fn = function (xhr){
          if (xhr.rpt) {
            var datos = xhr.data;
            //datos.cabecera, datos.siembras, datoas.campañas, datos.cosechas
            $("#blkcamposeleccionado").html(self.tpl8.cabeceraCampo(datos.cabecera));

            self.cargarSiembras(datos.siembras);
            self.cargarCampanas(datos.campanas);
            var dataSiembraCombo = [];
            for (var i = 0; i < datos.siembras.length; i++) {
            	var objSiembra = datos.siembras[i];
            	dataSiembraCombo.push({codigo: objSiembra.cod_siembra, descripcion: objSiembra.idsiembra});
            };
            $("#cbocampañasiembra").html(self.tpl8.combo(dataSiembraCombo));
            self.cargarParcelas([], false);

            vars.COD_CAMPO = codCampo;

          }else{
            console.error(xhr.msj);
          }
      };

	 if (codCampo == ""){
	 	this.deseleccionarCampo();
	  	return;
	 }

	new Ajxur.Api({
	    modelo: "Campo",
	    metodo: "obtenerDatosCampo",
	    data_in: {
	    	p_codCampo : codCampo
    	}
  },fn);
};

app.cargarSiembras = function(dataSiembras){
	var tblSiembra = $("#tblsiembratbody");
  	if (dataSiembras.length){
		tblSiembra.html(this.tpl8.tblSiembra(dataSiembras));	
	} else {
		tblSiembra.html('<tr class="tr-null"><td colspan="10" class="text-center"><i>No hay registros disponibles.</i></td></tr>');
	}
};

app.cargarCampanas = function(dataCampanas){
	var tblCampana = $("#tblcampanatbody");

	if (dataCampanas.length){
		tblCampana.html(this.tpl8.tblCampana(dataCampanas));	
	} else {
		tblCampana.html('<tr class="tr-null"><td colspan="10" class="text-center"><i>No hay registros disponibles.</i></td></tr>');
	}

	vars.TEMP_CAMPAÑA = null;
};

app.seleccionarCampañaParcelas = function($tr){
	var $$tr = $($tr),
		codCampaña = $tr.dataset.id,
		tblCampanaBody = $("#tblcampanatbody");

	if (codCampaña == ""){
		return;
	}

	tblCampanaBody.find("tr").removeClass("tr-seleccionado");
	$$tr.addClass("tr-seleccionado");
	this.cargaDatosParcelas(codCampaña);

	vars.TEMP_CAMPAÑA = codCampaña;
	tblCampanaBody = null;
	$$tr = null;
};

app.cargaDatosParcelas = function(codCampaña){
	var self = this,
      fn = function (xhr){
          if (xhr.rpt) {
            var parcelas = xhr.data;
            self.cargarParcelas(parcelas);

          }else{
            console.error(xhr.msj);
          }
      };

	 if (codCampaña == ""){
	  	self.cargarParcelas([]);
	  	return;
	 }

	new Ajxur.Api({
	    modelo: "campaña",
	    metodo: "obtenerParcelas",
	    data_in: {
	    	p_codCampaña : codCampaña
    	}
  },fn);
};

app.cargarParcelas = function(dataParcelas, pasarTab){
	var tblParcela = $("#tblparcelatbody");

	if (pasarTab == undefined){
		pasarTab = true;
	}

	if (dataParcelas.length){
		tblParcela.html(this.tpl8.tblParcela(dataParcelas));	
	} else {
		tblParcela.html('<tr class="tr-null"><td colspan="11" class="text-center"><i>No hay registros disponibles.</i></td></tr>');
	}

	if (pasarTab == true){
		$('.nav-tabs a[href="#tabparcelas"]').tab('show');	
	}
};

app.setVariables = function(){
};

app.nuevoCampo = function(){
	var $mdl = $("#mdlCampo"),
		$header = $mdl.find(".modal-header h3"),
		$frm = $mdl.find("form");

	$header.html("Nuevo Campo");
	$frm[0].reset();
	$mdl.modal("show");

	$header = null;
	$frm = null;
	$mdl = null;
};

app.leerEditarCampo = function(){
 	var codCampo = vars.COD_CAMPO,
 		fn;

 	if (codCampo == null || codCampo == ""){
 		alert("!Debe seleccionar un campo¡");
 		return;
 	}

 	fn = function (xhr){
          if (xhr.rpt) {
            var campo = xhr.data,
            	$mdl = $("#mdlCampo"),
				$header = $mdl.find(".modal-header h3");

			$("#txtcampoaccion").val(codCampo);
            $("#txtcampoconsumidor").val(campo.idconsumidor);
            $("#txtcampodescripcion").val(campo.descripcion);
            $("#cbocamporegion").val(campo.cod_region);
            $("#txtcampoarea").val(campo.area);

            $header.html("Editar Campo: "+campo.descripcion);
			$mdl.modal("show");

			$mdl = null;
			$header = null;

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Campo",
	    metodo: "leerEditar",
	    data_in: {
	    	p_codCampo : codCampo
    	}
  	},fn);
};

app.darBajaCampo = function(){
 	var self = this,
 		codCampo = vars.COD_CAMPO,
 		fn;

 	if (codCampo == null || codCampo == ""){
 		alert("!Debe seleccionar un campo¡");
 		return;
 	}

 	if (!confirm("¿Desea dar de baja a este campo?")){
 		return;
 	};
 
 	fn = function (xhr){
          if (xhr.rpt) {
            var msj = xhr.msj;
            self.deseleccionarCampo();
            self.cargarCampos($("#cboregion").val());

            alert(msj);

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Campo",
	    metodo: "darBaja",
	    data_in: {
	    	p_codCampo : codCampo
    	}
  	},fn);
};

app.grabarCampo = function(){
	var self = this,
		fn = function (xhr){
          var msj = xhr.msj;
          if (xhr.rpt) {

            self.cargarDatosCampo($("#cbocampo").val());
            self.cargarCampos($("#cboregion").val());

            $("#mdlCampo").modal("hide");            
          }else{
            console.error(xhr.msj);
          }
          alert(msj);
     	},
     	codCampo = $("#txtcampoaccion").val(),
     	accion =  codCampo == "" ? "agregar" : "editar";

    if (!confirm("¿Desea guardar el registro?")){
 		return;
 	};

 	if (codCampo == null){
 		alert("Problema al obtener código de campo.")
 		return;
 	}

	new Ajxur.Api({
	    modelo: "Campo",
	    metodo: accion,
	    data_in: {
	    	p_codCampo : codCampo,
	    	p_codNisira : $("#txtcampoconsumidor").val(),
			p_area : $("#txtcampoarea").val(),
			p_descripcion : $("#txtcampodescripcion").val(),
			p_codRegion : $("#cbocamporegion").val()
    	}
  	},fn);
};

app.nuevaSiembra = function(){
	if (vars.COD_CAMPO == null || vars.COD_CAMPO == ""){
		alert("¡Debe seleccionar un campo!");
		return;
	}

	if (vars.COD_CAMPO == null || vars.COD_CAMPO == ""){
		alert("¡Debe seleccionar un campo!");
		return;
	}

	var fn = function(xhr){
		if (xhr.rpt) {
         	 var $mdl = $("#mdlSiembra"),
				$header = $mdl.find(".modal-header h3"),
				$frm = $mdl.find("form"),
				data = xhr.data;

			$header.html("Nueva Siembra");
			$frm[0].reset();
			$mdl.modal("show");	

			$("#txtsiembraid").val(data.idsiembra_siguiente);
			$("#txtsiembraarea").val(data.area);
			
			$header = null;
			$frm = null;
			$mdl = null;
          }else{
            console.error(xhr.msj);
          }
	};



	new Ajxur.Api({
	    modelo: "Siembra",
	    metodo: "obtenerPreFormulario",
	    data_out: [vars.COD_CAMPO]
  	},fn);
};

app.leerEditarSiembra = function(codSiembra){
 	var fn, self = this;

 	if (codSiembra == null || codSiembra == ""){
 		alert("!Debe seleccionar un siembra");
 		return;
 	}

 	fn = function (xhr){
          if (xhr.rpt) {
            var siembra = xhr.data,
            	listaVariedad = xhr.lista_variedad,
            	$mdl = $("#mdlSiembra"),
				$header = $mdl.find(".modal-header h3");

			$("#txtsiembraaccion").val(codSiembra);

			$("#txtsiembraid").val(siembra.idsiembra);
			$("#txtsiembraarea").val(siembra.area);
			$("#txtsiembrafechainicio").val(siembra.inicio_siembra);
			$("#txtsiembrafechafin").val(siembra.fin_siembra);
			$("#cbosiembratiporiego").val(siembra.tipo_riego);
			$("#cbosiembracultivo").val(siembra.cod_cultivo);

			var cbosiembravariedad = $("#cbosiembravariedad");
			cbosiembravariedad.html(self.tpl8.combo(listaVariedad));
			$("#cbosiembravariedad").val(siembra.cod_variedad);

            $header.html("Editar Siembra: "+siembra.idsiembra);
			$mdl.modal("show");

			$mdl = null;
			$header = null;

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Siembra",
	    metodo: "leerEditar",
	    data_in: {
	    	p_codSiembra : codSiembra
    	}
  	},fn);
};

app.darBajaSiembra = function(codSiembra){
 	var fn;

 	if (codSiembra == null || codSiembra == ""){
 		alert("!Debe seleccionar una siembra");
 		return;
 	}

 	if (!confirm("¿Desea dar de baja a esta siembra?")){
 		return;
 	};
 
 	fn = function (xhr){
          if (xhr.rpt) {
            var msj = xhr.msj,
            	siembras = xhr.data;

            alert(msj);
            self.cargarSiembras(siembras);

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Siembra",
	    metodo: "darBaja",
	    data_in: {
	    	p_codSiembra : codSiembra
    	}
  	},fn);
};

app.finalizarSiembra = function(codSiembra){
 	var fn;

 	if (codSiembra == null || codSiembra == ""){
 		alert("!Debe seleccionar una siembra");
 		return;
 	}

 	if (!confirm("¿Desea finalizar esta siembra?")){
 		return;
 	};
 
 	fn = function (xhr){
          if (xhr.rpt) {
            var msj = xhr.msj,
            	siembras = xhr.data;

            self.cargarSiembras(siembras);
            alert(msj);

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Siembra",
	    metodo: "finalizar",
	    data_in: {
	    	p_codSiembra : codSiembra
    	}
  	},fn);
};

app.grabarSiembra = function(){
	var self = this,
		fn = function (xhr){
			 var msj = xhr.msj;
	          if (xhr.rpt) {
	          	var siembras = xhr.data;

	            self.cargarSiembras(siembras);
	            $("#mdlSiembra").modal("hide");
	          }else{
	            console.error(xhr.msj);
	          }
			  
			  alert(msj);
     	},
     	codSiembra = $("#txtsiembraaccion").val(),
     	accion =  codSiembra == "" ? "agregar" : "editar";

    if (!confirm("¿Desea guardar el registro?")){
 		return;
 	};

 	if (vars.COD_CAMPO == null){
 		alert("No hay campo seleccionado.")
 		return;
 	}

 	if (codSiembra == null){
 		alert("Problema al obtener código de siembra.")
 		return;
 	}

	new Ajxur.Api({
	    modelo: "Siembra",
	    metodo: accion,
	    data_in: {
	    	p_codSiembra : codSiembra,
	    	p_codCampo : vars.COD_CAMPO,
	    	p_codNisira : $("#txtsiembraid").val(),
			p_area : $("#txtsiembraarea").val(),
			p_fechaInicioSiembra : $("#txtsiembrafechainicio").val(),
			p_fechaFinSiembra : $("#txtsiembrafechafin").val(),
			p_tipoRiego : $("#cbosiembratiporiego").val(),			
			p_codVariedad : $("#cbosiembravariedad").val()
    	}
  	},fn);
};

app.nuevaCampaña = function(){
	if (vars.COD_CAMPO == null || vars.COD_CAMPO == ""){
		alert("¡Debe seleccionar un campo!");
		return;
	}

	var fn = function(xhr){
		if (xhr.rpt) {
           var 	$mdl = $("#mdlCampaña"),
				$header = $mdl.find(".modal-header h3"),
				$frm = $mdl.find("form"),
				data = xhr.data;

			$header.html("Nueva Campaña");
			$frm[0].reset();
			$mdl.modal("show");	

			$("#txtcampañaconsumidor").val(data.idcampaña_siguiente);
			$("#cbocampañasiembra").val(data.cod_siembra);
			$("#txtcampañaarea").val(data.area);

			$header = null;
			$frm = null;
			$mdl = null;
          }else{
            console.error(xhr.msj);
          }
	};

	new Ajxur.Api({
	    modelo: "Campaña",
	    metodo: "obtenerPreFormulario",
	    data_out: [vars.COD_CAMPO]
  	},fn);
};

app.leerEditarCampaña = function(codCampaña){
 	var fn, self = this;

 	if (codCampaña == null || codCampaña == ""){
 		alert("!Debe seleccionar un siembra");
 		return;
 	}

 	fn = function (xhr){
          if (xhr.rpt) {
            var siembra = xhr.data,
            	listaVariedad = xhr.lista_variedad,
            	$mdl = $("#mdlCampaña"),
				$header = $mdl.find(".modal-header h3");

			$("#txtcampañaaccion").val(codCampaña);

			$("#txtcampañaconsumidor").val(siembra.idcampaña);
			$("#cbocampañasiembra").val(siembra.cod_siembra);
			$("#txtcampañadescripcion").val(siembra.descripcion);
			$("#txtcampañaaño").val(siembra.año);
			$("#txtcampañaarea").val(siembra.area);
			$("#txtcampañafechainicio").val(siembra.fecha_inicio);
			$("#txtcampañafechafin").val(siembra.fecha_fin);

            $header.html("Editar Campaña: "+siembra.idsiembra+" - "+siembra.idcampaña);
			$mdl.modal("show");

			$mdl = null;
			$header = null;

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Campaña",
	    metodo: "leerEditar",
	    data_in: {
	    	p_codCampaña : codCampaña
    	}
  	},fn);
};

app.darBajaCampaña = function(codCampaña){
 	var fn;

 	if (codCampaña == null || codCampaña == ""){
 		alert("!Debe seleccionar una campaña");
 		return;
 	}

 	if (!confirm("¿Desea dar de baja a esta campaña?")){
 		return;
 	};
 
 	fn = function (xhr){
          if (xhr.rpt) {
            var msj = xhr.msj,
            	siembras = xhr.data;

            alert(msj);
            self.cargarCampanas(siembras);

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Campaña",
	    metodo: "darBaja",
	    data_in: {
	    	p_codCampaña : codCampaña
    	}
  	},fn);
};

app.finalizarCampaña = function(codCampaña){
 	var fn;

 	if (codCampaña == null || codCampaña == ""){
 		alert("!Debe seleccionar una campaña");
 		return;
 	}

 	if (!confirm("¿Desea finalizar esta campaña?")){
 		return;
 	};
 
 	fn = function (xhr){
          if (xhr.rpt) {
            var msj = xhr.msj,
            	campañas = xhr.data;

            self.cargarCampanas(campañas);
            alert(msj);

          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Campaña",
	    metodo: "finalizar",
	    data_in: {
	    	p_codCampaña : codCampaña
    	}
  	},fn);
};

app.grabarCampaña = function(){
	var self = this,
		fn = function (xhr){
			 var msj = xhr.msj;
	          if (xhr.rpt) {
	          	var campañas = xhr.data;

	            self.cargarCampanas(campañas);
	            $("#mdlCampaña").modal("hide");
	          }else{
	            console.error(xhr.msj);
	          }
			  
			  alert(msj);
     	},
     	codCampaña = $("#txtcampañaaccion").val(),
     	accion =  codCampaña == "" ? "agregar" : "editar";

    if (!confirm("¿Desea guardar el registro?")){
 		return;
 	};

 	if (vars.COD_CAMPO == null){
 		alert("No hay campo seleccionado.")
 		return;
 	}

 	if (codCampaña == null){
 		alert("Problema al obtener código de campaña.")
 		return;
 	}

	new Ajxur.Api({
	    modelo: "Campaña",
	    metodo: accion,
	    data_in: {
	    	p_codCampaña : codCampaña,
	    	p_codSiembra : $("#cbocampañasiembra").val(),
	    	p_codNisira : $("#txtcampañaconsumidor").val(),
			p_area : $("#txtcampañaarea").val(),
			p_descripcion : $("#txtcampañadescripcion").val(),
			p_año : $("#txtcampañaaño").val(),
			p_fechaCampañaInicio : $("#txtcampañafechainicio").val(),
			p_fechaCampañaFin : $("#txtcampañafechafin").val()
    	}
  	},fn);
};

app.cargarVariedadCultivo = function(codCultivo){
	var self = this,
		$cboSiembra = $("#cbosiembravariedad"),
		fn = function (xhr){
          if (xhr.rpt) {
            var dataVariedades = xhr.data;
			$cboSiembra.html(self.tpl8.combo(dataVariedades));
			$cboSiembra = null;
          }else{
            console.error(xhr.msj);
          }
     	};

	if (codCultivo == ""){
		$cboSiembra.empty();
		$cboSiembra = null;
		return;
	}

	new Ajxur.Api({
	    modelo: "Cultivo",
	    metodo: "obtenerVariedad",
	    data_in: {
	    	p_codCultivo : codCultivo
    	}
  	},fn);
};

app.deseleccionarCampo = function(){
	vars.COD_CAMPO = null;
	$("#blkcamposeleccionado").empty();
	this.cargarSiembras([]);
	this.cargarCampanas([]);
	this.cargarParcelas([], false);
};

app.opParcela = function(codParcela, verbo){
	var fn,
		self = this,
		accion = verbo == "finalizar" ? verbo : "darBaja";

 	if (codParcela == null || codParcela == ""){
 		alert("!Debe seleccionar una parcela");
 		return;
 	}

 	if (!confirm("¿Desea "+verbo+" esta parcela?")){
 		return;
 	};
 
 	fn = function (xhr){
          if (xhr.rpt) {
            var msj = xhr.msj;

            self.cargaDatosParcelas(vars.TEMP_CAMPAÑA);
            alert(msj);
          }else{
            console.error(xhr.msj);
          }
     	};

	new Ajxur.Api({
	    modelo: "Parcela",
	    metodo:  accion,
	    data_in: {
	    	p_codParcela : codParcela
    	}
  	},fn);
};

app.darBajaParcela = function(codParcela){
 	this.opParcela(codParcela, "dar de baja");
};

app.finalizarParcela = function(codParcela){
 	this.opParcela(codParcela, "finalizar");
};

app.openParcela = function(codParcela){
	var str = "gestion.parcelas.vista.php";
	if (codParcela){
		str += "?cp="+codParcela;
	}
	window.open(str);
};

app.leerEditarParcela = function(codParcela){
	this.openParcela(codParcela);
};

app.nuevaParcela = function(){
	this.openParcela();
};

app.setEventos =function(){
	var self = this,
		cboRegion  = $("#cboregion"),
		cboCampo = $("#cbocampo"),
		tblCampanaBody = $("#tblcampanatbody"),
		frmCampo = $("#mdlCampo").find("form"),
		frmSiembra = $("#mdlSiembra").find("form"),
		frmCampaña = $("#mdlCampaña").find("form");

	cboRegion.on("change", function(e){
		e.preventDefault();
		self.cargarCampos(this.value);
	});

	cboCampo.on("change", function(e){
		e.preventDefault();
		self.cargarDatosCampo(this.value);
	});

	tblCampanaBody.on("dblclick","tr", function(e){
		e.preventDefault();
		self.seleccionarCampañaParcelas(this);
	});

	$("#cbosiembracultivo").on("change", function(e){
		e.preventDefault();
		self.cargarVariedadCultivo(this.value);
	});

	frmCampo.on("submit", function(e){
		e.preventDefault();
		self.grabarCampo();
	});

	frmSiembra.on("submit", function(e){
		e.preventDefault();
		self.grabarSiembra();
	});

	frmCampaña.on("submit", function(e){
		e.preventDefault();
		self.grabarCampaña();
	});

	cboRegion = null;
	cboCampaña = null;
	tblCampanaBody = null;
};

$(document).ready(function(){
  app.init();

  $(".nav-tabs a[data-toggle=tab]").on("click", function(e) {
      if ($(this).hasClass("disabled")) {
        e.preventDefault();
        return false;
      }
   });
});

