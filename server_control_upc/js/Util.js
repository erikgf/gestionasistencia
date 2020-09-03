var Util = {
	TFloat : function (valor, digitos){
		return parseFloat(valor).toFixed(!digitos ? 2 : digitos);
	},
	alert: function($placer, opt){
		var html = '';

		if (!opt.tipo){
			opt.tipo = 'e';
		}

		switch(opt.tipo){
			case "s" : 
				strAlert  = "bg-green";
				break;
			case "w":
				strAlert = "alert-warning";
				break;
			case "e":
				strAlert = "bg-red";
				break;
		}

		html += '<div class="alert '+strAlert+' alert-dismissible" role="alert">';
		html += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>';
		html += (opt.titulo ? '<strong>'+opt.titulo+'</strong>': '')+' '+(opt.mensaje ? opt.mensaje : '')+' </div>';
		$placer.html(html);		
		$placer.focus();
		setTimeout(function(){
			$placer.empty();
		}, opt.tiempo || 3000)
	},
	notificacion: function(colorName, text, placementFrom, placementAlign, animateEnter, animateExit, delay){
	    if (colorName === null || colorName === '') { colorName = 'bg-black'; }
	    if (text === null || text === '') { text = 'Turning standard Bootstrap alerts'; }
	    if (animateEnter === null || animateEnter === '') { animateEnter = 'animated fadeInDown'; }
	    if (animateExit === null || animateExit === '') { animateExit = 'animated fadeOutUp'; }
	    if (delay === null || delay === '') { delay = 5000; }
	    var allowDismiss = true;

	    $.notify({
	        message: text
	    },
	        {
	            type: colorName,
	            allow_dismiss: allowDismiss,
	            newest_on_top: true,
	            timer: 1000,
	            delay: delay,
	            placement: {
	                from: placementFrom,
	                align: placementAlign
	            },
	            animate: {
	                enter: animateEnter,
	                exit: animateExit
	            },
	            template: '<div data-notify="container" class="bootstrap-notify-container alert alert-dismissible {0} ' + (allowDismiss ? "p-r-35" : "") + '" role="alert">' +
	            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
	            '<span data-notify="icon"></span> ' +
	            '<span data-notify="title">{1}</span> ' +
	            '<span data-notify="message">{2}</span>' +
	            '<div class="progress" data-notify="progressbar">' +
	            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
	            '</div>' +
	            '<a href="{3}" target="{4}" data-notify="url"></a>' +
	            '</div>'
	        });
	},
	cerrarSesion: function(){
		if (!confirm("¿Desea cerrar sesión?")){
			return ;
		}
		var fn = function(xhr){
			if (xhr.rpt == true){
				alert(xhr.msj);
				window.location.href = '../';
			}
		};

		new Ajxur.Api({
		    modelo: "Sesion",
		    metodo: "cerrarSesion"
		  },fn);
	},
	 soloNumeros: function (evento) {
        var tecla = (evento.which) ? evento.which : evento.keyCode;
        if ((tecla >= 48 && tecla <= 57)) {
            return true;
        }
        return false;
    },  
     soloNumerosDecimales: function (evento) {
        var tecla = (evento.which) ? evento.which : evento.keyCode;
        console.log(tecla);
        if (((tecla >= 48 && tecla <= 57) || tecla == 46)) {
            return true;
        }
        return false;
    }, 
    soloDecimal: function(evento, cadena,mostrar){
        var tecla = (evento.which) ? evento.which : evento.keyCode;
        var key = cadena.length;
        var posicion = cadena.indexOf('.');
        var contador = 0;
        var numero = cadena.split(".");
        var resultado1 = numero[0];
        var suma = resultado1.length+mostrar; 

        while (posicion != -1) { 
            contador++;             
            posicion = cadena.indexOf('.', posicion + 1);

        }

        if ( (tecla>=48 && tecla<=57) || (tecla==46) ) {    
            if ( key == 0 &&  tecla == 46 ) { // SOLO PERMITE ENTRE 0 AL 9
                return false;
            }
            
            if (contador != 0 && tecla == 46) { //NO SE REPITA EL PUNTO                
                return false;
            }

            if ( cadena == '0') { // EL SIGUIENTE ES PUNTO   
                if ( tecla>=48 && tecla<=57 ) {
                    return false;
                }
                return true;                
            }      
            
            if (!(key <= suma)) {
                return false;
            }
            return true;            
        }
        return false;
    },
    soloLetras: function (evento, espacio=null) {
        var tecla = (evento.which) ? evento.which : evento.keyCode;
        if ( espacio != null ) {
            if ((tecla >= 65 && tecla <= 90) || (tecla >= 97 && tecla <= 122) || (tecla==241) || (tecla==209) ) {
                return true;
            }    
        }else{
            if ((tecla >= 65 && tecla <= 90) || (tecla >= 97 && tecla <= 122) || (tecla==241) || (tecla==209) || (tecla==32) ) {
                return true;
            } 
        }
        return false;
    },
    soloNumeros: function (evento) {
        var tecla = (evento.which) ? evento.which : evento.keyCode;
        if ((tecla >= 48 && tecla <= 57)) {
            return true;
        }
        return false;
    },
    confirm : function (fnAccion, titulo, texto, isHTML){
    	swal({
	        title: (titulo  || "¿Está seguro de completar esta acción?"),
	        html : isHTML || false,
	        text : texto || "",
	        type: "warning",
	        showCancelButton: true,
	        confirmButtonColor: "#4CAF50 ",
	        confirmButtonText: "Sí",
	        cancelButtonText: "No",
	        closeOnConfirm: true
	    }, fnAccion);
    },
	Templater : function(scriptDOM){
	    var objTpl8 = {};
	    $.each(scriptDOM, function(i,o){
	        var id = o.id, idName = id.substr(5);
	        if (id.length > 0){
	            objTpl8[idName] = Handlebars.compile(o.innerHTML);
	        }
	    });
	    return objTpl8;
	},
	XHR : function(objXHR, fn){
	   new Ajxur.Api(objXHR, function(xhr){
	        if (xhr.estado = 200){
	            fn(xhr.datos);
	        }
	   });
	},
	getHTML : function ( url, callback ) {

		// Feature detection
		if ( !window.XMLHttpRequest ) return;

		// Create new request
		var xhr = new XMLHttpRequest();

		// Setup callback
		xhr.onload = function() {
			if ( callback && typeof( callback ) === 'function' ) {
				callback( this.responseXML );
			}
		}

		// Get the HTML
		xhr.open( 'GET', url );
		xhr.responseType = 'document';
		xhr.send();
	}
};




