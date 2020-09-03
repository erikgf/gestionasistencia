var app = {},
	vars = {
		SIEMBRAS : [],
		CAMPAÑAS : []
	};

app.init = function(){
	this.setTemplates();
	this.cargarDatosBase();
	this.setEventos();
	//this.cargarRegiones();
	//this.setVariables();
};

app.setTemplates = function(){
	var tpl8 = {};
	tpl8.combo = Handlebars.compile($("#tpl8Combo").html());

	this.tpl8 = tpl8;
};

app.cargarDatosBase = function(){
	var self = this,
      fn = function (xhr){
          if (xhr.rpt) {
            var datos = xhr.data;
            $("#cbocampo").html(self.tpl8.combo(datos.campos)).selectpicker();
           	$("#cbocultivo").html(self.tpl8.combo(datos.cultivos));
           	if (codP){
				app.cargarParcela(codP);	
			}
          }else{
            console.error(xhr.msj);
          }
      };

	new Ajxur.Api({
	    modelo: "Parcela",
	    metodo: "obtenerDatosBase"
	  },fn);
};

app.cargarDatosCampo  = function(codCampo, leerEditarData){
	/*
		- siembra
			* riego
			* cultivo
			* variedad
				- campañas
				* finicio
				* ffin
				* area

	*/
	var self = this,
	  $cbo,
	  tpl8Combo = self.tpl8.combo,
	  $cboSiembra = $("#cbosiembra"),
      $cboCampaña = $("#cbocampaña"),
      fn = function (xhr){
          if (xhr.rpt) {
            var datos = xhr.data,
            	dataSiembras  = datos.siembras,
            	dataCampañas = [];
            //datos.cabecera, datos.siembras, datoas.campañas, datos.cosechas
            vars.SIEMBRAS = dataSiembras;

            if (leerEditarData){
            	$cboSiembra.html(tpl8Combo(dataSiembras));
				$cboSiembra.val(leerEditarData.cod_siembra);
				dataCampañas = self.obtenerCampañas(leerEditarData.cod_siembra);
				$cboCampaña.html(tpl8Combo(dataCampañas));
				$cboCampaña.val(leerEditarData.cod_campaña);
            } else {
            	$cboSiembra.html(tpl8Combo(dataSiembras));
				$cboSiembra.val(datos.last_cod_siembra);

				dataCampañas = self.obtenerCampañas(datos.last_cod_siembra);
				$cboCampaña.html(tpl8Combo(dataCampañas));
				$cboCampaña.val(datos.last_cod_campaña);

				self.setSiembra(datos.last_cod_siembra);
				self.setCampaña(datos.last_cod_campaña);
            }

			$cboSiembra = null;
			$cboCampaña = null;
			tpl8Combo = null;

          }else{
            console.error(xhr.msj);
          }
      };

     if (leerEditarData == undefined){
     	leerEditarData = null;
     }

	 if (codCampo == ""){
	 	$cboSiembra.html(tpl8Combo([]));
		$cboSiembra.val("").change();

		$cboSiembra = null;
		tpl8Combo = null;
	  	return;
	 }

	new Ajxur.Api({
	    modelo: "Campo",
	    metodo: "obtenerDatosCampoParcela",
	    data_in: {
	    	p_codCampo : codCampo
    	}
  },fn);
};

app.obtenerSiembra = function(codSiembra){
	var _siembras = vars.SIEMBRAS;

	for (var i = 0; i < _siembras.length; i++) {
		var obj = _siembras[i];
		if (obj.cod_siembra = codSiembra){
			return obj;
		}
	};

	return null;
};

app.obtenerCampañas = function(codSiembra) {
	var arCampañas = [],	
		_siembras = vars.SIEMBRAS;

	if (codSiembra == null || codSiembra == ""){
		return arCampañas;
	}

	var objSiembra = app.obtenerSiembra(codSiembra);
	if  (objSiembra != null){
		arCampañas = objSiembra.campañas;
	}

	vars.CAMPAÑAS = arCampañas;
	return arCampañas;
};

app.obtenerCampaña = function(codCampaña) {
	var _campañas = vars.CAMPAÑAS;

	for (var i = 0; i < _campañas.length; i++) {
		var obj = _campañas[i];
		if (obj.cod_campaña = codCampaña){
			return obj;
		}	
	};

	return null;
};

app.mostrarSiembraData = function(objSiembra){
	var self = this,
         tpl8Combo = self.tpl8.combo,	
		fn = function (xhr){
          if (xhr.rpt) {
            var datos = xhr.data,
            	$cboVariedad = $("#cbovariedad");

            $cboVariedad.html(self.tpl8.combo(datos));
            $cboVariedad.val(objSiembra.cod_variedad);

            $cboVariedad = null;
          }else{
            console.error(xhr.msj);
          }
      };

	if (objSiembra == null){
		$("#cbotiporiego").val("0");
		$("#cbocultivo").val("").change();
		$("#cbocampaña").empty();
		self.setCampaña(null);
		return;
	}

	$("#cbotiporiego").val(objSiembra.tipo_riego ? objSiembra.tipo_riego : "0");
	$("#cbocultivo").val(objSiembra.cod_cultivo);

	var cps = objSiembra.campañas,
		$cboCampaña = $("#cbocampaña");

	$cboCampaña.html(tpl8Combo(cps));
	if (cps.length > 0){
		$cboCampaña.val(cps[cps.length-1].cod_campaña);
	}
	$cboCampaña =  null;

	self.formatoRotulo(objSiembra.tipo_riego);

	if (objSiembra.cod_cultivo == null || objSiembra.cod_cultivo == ""){
		$("#cbovariedad").empty();	
		return;
	}

	new Ajxur.Api({
	    modelo: "Cultivo",
	    metodo: "obtenerVariedad",
	    data_in: {
	    	p_codCultivo : objSiembra.cod_cultivo
    	}
  	},fn);
};

app.mostrarCampañaData = function(objCampaña){
	/*
		fechaI, fechaF,  area, blks
	*/
	if (objCampaña == null){
		$("#txtfechainicio").val("");
		$("#txtfechafin").val("");
		return;
	}

	$("#txtfechainicio").val(objCampaña.fecha_inicio);
	$("#txtfechafin").val(objCampaña.fecha_fin);
};

app.formatoRotulo = function(tipo_riego){
	var $blk = $("#blkturno"),
		$nn2 = $("#txtnn2");

	if(tipo_riego == "0"){
		$blk.hide();
		$nn2.attr("required", false);
	} else {
		$blk.show();
		$nn2.attr("required", true);
	}

	$blk = null;
	$nn2 = null;
};

app.setSiembra = function(codSiembra){
	this.mostrarSiembraData(this.obtenerSiembra(codSiembra));
};	

app.setCampaña = function(codCampaña){
	this.mostrarCampañaData(this.obtenerCampaña(codCampaña));
};

app.setVariedad = function(codCultivo, leerEditarData){
	var self = this,
		$cboVariedad = $("#cbovariedad"), 
		fn = function (xhr){
	          if (xhr.rpt) {
	            var datos = xhr.data,
	            	tpl8Combo = self.tpl8.combo;

	            $cboVariedad.html(tpl8Combo(datos));
	            if (leerEditarData){
	            	$cboVariedad.val(leerEditarData.cod_variedad);
	            }
	            $cboVariedad = null;
	          }else{
	            console.error(xhr.msj);
	          }
	      };

	if (codCultivo == null || codCultivo == ""){
		$cboVariedad.empty();
		return;	
	}

	if (leerEditarData == undefined){
		leerEditarData = null;
	}
	
	new Ajxur.Api({
	    modelo: "Cultivo",
	    metodo: "obtenerVariedad",
	    data_in: {
	    	p_codCultivo : codCultivo
    	}
  	},fn);
}

app.setEventos =function(){
	var self = this,
		$cboCampo = $("#cbocampo"),
		$cboSiembra = $("#cbosiembra"),
      	$cboCampaña = $("#cbocampaña"),
      	$cbocultivo = $("#cbocultivo")
      	$cboTipoRiego = $("#cbotiporiego");

	$cboCampo.on("change", function(e){
		e.preventDefault();
		self.cargarDatosCampo(this.value);
	});

	$cboSiembra.on("change", function(e){
		e.preventDefault();
		self.setSiembra(this.value);
	});

	$cboCampaña.on("change", function(e){
		e.preventDefault();
		self.setCampaña(this.value);
	});

	$cbocultivo.on("change", function (e) {
		e.preventDefault();
		self.setVariedad(this.value);

	});

	$cboTipoRiego.on("change", function (e) {
		e.preventDefault();
		self.formatoRotulo(this.value);
		self.setRotulo();
	});

	$(".txtnn").on("change", function(e){
		self.setRotulo();
	});

	$("form").on("submit", function(e){
		e.preventDefault();
		if (!confirm("¿Desea registrar estos datos. Esta acción es irreversible")){
			return;
		}
		self.grabarParcela();
	})

	$cboCampo = null;
	$cboSiembra = null;
	$cboCampaña = null;
	$cbocultivo = null;
	$cboTipoRiego = null;
};

app.setRotulo = function(){
	var $rotulo = $("#txtrotulo"),	
		tipo_riego = $("#cbotiporiego").val(),
		nn1 = $("#txtnn1").val(),
		nn2 = $("#txtnn2").val(),
		nn3 = $("#txtnn3").val();

		if (tipo_riego == ""){
			$rotulo.val("");
			return;
		}

		if (tipo_riego == "0"){
			if (nn1 != "" && nn3 != ""){
				$rotulo.val("J"+nn1+"-C"+nn3);
			} else {
				$rotulo.val("");
			}
		}

		if (tipo_riego == "1"){
			if (nn1 != "" && nn2 != "" && nn3 != ""){
				$rotulo.val("M"+nn1+"-T"+nn2+"-V"+nn3);
			} else {
				$rotulo.val("");
			}
		}
};

app.grabarParcela = function(){
	var self = this,
		fn = function (xhr){
			 var msj = xhr.msj;
	          if (!xhr.rpt) {
	            console.error(xhr.msj);
	          }
			  
			  alert(msj);
     	},
     	codParcela = $("#txtparcelaccion").val(),
     	accion =  codParcela == "" ? "agregar" : "editar";

 	if (!OBJ){
 		JSONCoords = "";
 	} else {
 		JSONCoords = JSON.stringify(OBJ);
 	}

	new Ajxur.Api({
	    modelo: "Parcela",
	    metodo: accion,
	    data_in: {
	    	p_codParcela : codParcela,
	    	p_codCampaña : $("#cbocampaña").val(),
	    	p_rotuloParcela : $("#txtrotulo").val(),
	    	p_fechaInicioCampaña : $("#txtfechainicio").val(),
	    	p_fechaFinCampaña : $("#txtfechafin").val(),
	    	p_tipoRiego : $("#cbotiporiego").val(),
	    	p_codVariedad : $("#cbovariedad").val(),
			p_area : $("#txtarea").val(),
			p_numeroNivel1 : $("#txtnn1").val(),
			p_numeroNivel2 : $("#txtnn2").val(),
			p_numeroNivel3 : $("#txtnn3").val(),
			p_coordenadas : JSONCoords,
			p_cambioCoordenadas : CHANGED_POLYGON
    	}
  	},fn);
};

app.cargarParcela  = function(codParcela){
	/*
		- siembra
			* riego
			* cultivo
			* variedad
				- campañas
				* finicio
				* ffin
				* area

	*/
	/*
	    0.- set txtaccionparcela = codparcela
		1. seleccionar campo,
		2.- seleccion siembra (obtenidas) + selected
		3.- seleccionar campaña (obtenidas) + selected
		4.- ingresar datos de parcela (from bbdd)
		5.- si existen grupos ed coordenadas, crear un poligono, obtener area
			si no existen grupos de coordenadas (3 o más)
			set estado nuevo
    */
	var self = this,
	  tpl8Combo = self.tpl8.combo,
      fn = function (xhr){
          if (xhr.rpt) {
            var datosParcela = xhr.data;
            $("#txtparcelaccion").val(codParcela);
            $("#cbocampo").val(datosParcela.cod_campo).selectpicker("refresh");
            self.cargarDatosCampo(datosParcela.cod_campo, {cod_siembra: datosParcela.cod_siembra, cod_campaña: datosParcela.cod_campaña});

            $("#txtfechainicio").val(datosParcela.fecha_inicio);
            $("#txtfechafin").val(datosParcela.fecha_fin);
            $("#cbotiporiego").val(datosParcela.tipo_riego);
            $("#cbocultivo").val(datosParcela.cod_cultivo);
            self.setVariedad(datosParcela.cod_cultivo, {cod_variedad: datosParcela.cod_variedad}); 

            $("#txtarea").val(datosParcela.area);
            $("#txtnn1").val(datosParcela.nn1);
			$("#txtnn2").val(datosParcela.nn2);
			$("#txtnn3").val(datosParcela.nn3);
            $("#txtrotulo").val(datosParcela.rotulo_parcela);
            self.formatoRotulo(datosParcela.tipo_riego);

            var cargado = false,
            	interval = setInterval(function(){
            	if (cargado == true){
            		clearTimeout(interval);
            		return;
            	}
            	if (GMAPS_CARGADO == true){
            		cargado = true;
            		if (datosParcela.coordenadas.length > 2){
		            	var arCoor = [];
		            	for (var i = 0; i < datosParcela.coordenadas.length; i++) {
		            		var obj = datosParcela.coordenadas[i];
		            		arCoor.push({lat: parseFloat(obj.lat), lng : parseFloat(obj.lng)});
		            	};
		            	crearPoligono(arCoor);
		            	arCoor = null;
		            }		
            	}
            },1000);
            
          }else{
            console.error(xhr.msj);
          }
      };

	if (codParcela == null || codParcela == ""){
	  	return;
	}

	new Ajxur.Api({
	    modelo: "Parcela",
	    metodo: "leerEditar",
	    data_in: {
	    	p_codParcela : codParcela
    	}
  },fn);
};

function gmapsLoaded(){
    GMAPS_CARGADO = true;
    crearMapa();	
    return true;
};


$(document).ready(function(){
  app.init();
});

