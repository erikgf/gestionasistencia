var SeleccionCultivoView = function (fecha_dia, servicio_frm, servicio_web, cache, usuario) {

	var self = this,
		fechaOK = false,
        $content,
        $fecha,
        $actualTab, $actualContainer,
        modalMensaje,
        getHoy = _getHoy,
		rs2Array = resultSetToArray;

	this.initialize = function () {
        this.$el = $('<div/>');       
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
    };

    this.setEventos = function(){
     	this.$el.on("click",".btncultivo", this.irCultivo);        
        this.$el.on("click",".control-item", this.swapTab);     
        this.$el.on("click",".enviar-datos", this.procesarEnviarDatos);              

     };

    this.render = function() {
    	this.consultarUI();
	    return this;
	};

	var UIDone = function (res) {
            var uiCultivos = rs2Array(res.UICultivos.rows),
                uiAreas = rs2Array(res.UIAreas.rows),
                fechaRegistroActiva = fecha_dia;   

            if (fechaRegistroActiva != null && fechaRegistroActiva != ""){
            	/*fechaOK*/
            	fechaOK = true;
            	fechaRegistro = formateoFecha(fecha_dia);
            } else {
            	fechaOK = false;
                fechaRegistro = formateoFecha(getHoy());
            }

            self.$el.html(self.template({
                nombre_usuario: usuario.nombre_usuario,
            	fecha_registro: fechaRegistro,
                fecha_registro_raw : fecha_dia,
            	cultivos : uiCultivos,
                areas : uiAreas
            })); 

            $content = self.$el.find(".content");
            $fecha  = $content.find(".fecha");

            $actualTab = $content.find(".control-item.active")[0];
            $actualContainer = $content.find(".blk.blkactive")[0];

            /*ajustar parte del blk para que se pueda usar el scroll correcatmnte.*/
            setTimeout(function(){
                var heightTop = 110, heightBottom = 130, heightPadd = 30,
                maxHeight = $content.eq(0).height() - heightTop - heightBottom - heightPadd;

                $content.find(".blk").css({"max-height": maxHeight+"px"});

            },330);
            
            self.setEventos();
        },
        UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
        },
        eliminarDone = function (res) {
            alert("Día eliminado.");
            history.back();
        };

	this.consultarUI = function(){
		/*consultamos cultivos (de este usuario*/
		var reqObj = {
              UICultivos: servicio_frm.obtenerCultivos(fecha_dia, usuario.dni),
              UIAreas: servicio_frm.obtenerAreas(fecha_dia, usuario.dni)
            };

        $.whenAll(reqObj)
          .done(UIDone)
          .fail(UIFail);
	};

	var getHoy = function(){
		var d = new Date(),
			anio = d.getYear()+1900,
			mes = d.getMonth()+1,
			dia = d.getDate();

			mes = (mes >= 10)  ? mes : ('0'+mes);

		return anio+"-"+mes+"-"+dia;
	};

    var formateoFecha = function(fechaFormateoYanqui){
        var arrTemp;

        if (fechaFormateoYanqui == "" || fechaFormateoYanqui == null){
            return "";
        }

        arrTemp = fechaFormateoYanqui.split("-");
        return arrTemp[2]+"-"+arrTemp[1]+"-"+arrTemp[0];
    };

    this.irCultivo = function(e){
        e.preventDefault();
        var idcultivo = this.dataset.id;
        if (idcultivo == ""){
            return;
        }

        if (!fechaOK){
            alert("No hay un día de registro habilitado.");
            return;
        }

        router.load("seleccion-lote/"+fecha_dia+"/"+idcultivo);
    };

    this.eliminarDia = function(e){
        e.preventDefault();
            var fnConfirmar = function(){
                var fechaTrabajo = fecha_dia,
                    reqObj = {
                      eliminarDia: servicio_frm.eliminarDia(fechaTrabajo, usuario.usuario)
                    };

                $.whenAll(reqObj)
                  .done(eliminarDone)
                  .fail(UIFail);

                fechaTrabajo = null;
            };
        confirmar("¿Desea eliminar el día de asistencia? Esta acción es irreversible", fnConfirmar);        
    };

    this.swapTab = function(e){
        var blk_nombre = this.dataset.blk,
            esActivo = false,
            $tab = this,
            $container = self.$el.find("#blk"+blk_nombre)[0];
        e.preventDefault();

        var esActivo = $tab.classList.contains("active");
        if (esActivo){ return; }

        $actualContainer.classList.remove("blkactive");
        $actualTab.classList.remove("active");

        $tab.classList.add("active");
        $container.classList.add("blkactive");

        $actualContainer = $container;
        $actualTab = $tab;

        $container = null;
        $tab = null;
    };

    var checkFechaTrabajoVariable = function(){
        if (fechaOK == true){
            $fecha.removeClass("color-rojo");
            $fecha.addClass("color-verde"); 
        }  else{
            $fecha.removeClass("color-verde");
            $fecha.addClass("color-rojo");
        }
    };

    this.procesarEnviarDatos = function(){
        /*  obtener todos los registros de todos los lotes asociados a esta fecha [ya no mas a este cultivo]*/
        var reqObj = {
              datos: servicio_frm.obtenerRegistros(fecha_dia)
            };

        $.whenAll(reqObj)
          .done(function (res) {
            var datos = rs2Array(res.datos.rows);

            if (!datos.length){
               alert("No hay registros para enviar.");
               return;
            }
          
            try{
                var datosProcesados = procesarDatos(datos);
                enviarDatos(JSON.stringify(datosProcesados) );
            } catch(e){
                console.error("JSON|", e);
            } 
          })
          .fail(function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
          });
    };

    var procesarDatos = function(datos){
        var usuario_envio = usuario.usuario,
            arregloObjEnvioFrm = [],
            objEnvioCultivo = null,
            objCabecera,
            idCultivoActual = null,
            idCultivoAnterior = null,
            idmovil = getDevice();

        for (var i = 0; i < datos.length; i++) {
            var o = datos[i],
                objCultivo = {
                    dni_personal: o.dni_personal,
                    idlote: o.idlote,
                    idlabor: o.idlabor,
                    tipo_acceso: o.tipo_acceso,
                    hora_extra:  o.hora_extra,
                    modo_trabajo: o.modo_trabajo,
                    hora_registro: o.hora_registro,
                    idturno: o.idturno,
                    numero_acceso: o.numero_acceso
                };

            idCultivoActual = o.idcultivo;

            if (idCultivoActual != idCultivoAnterior){
                if (objEnvioCultivo != null){
                    arregloObjEnvioFrm.push(objEnvioCultivo);    
                }

                objEnvioCultivo = {
                    detalle : [objCultivo],
                    cabecera : {
                        usuario_envio : usuario_envio,
                        fecha_dia_envio : fecha_dia,
                        idcultivo : idCultivoActual,
                        idmovil : idmovil
                    }
                };
            } else {
                objEnvioCultivo.detalle.push(objCultivo);
            }
            idCultivoAnterior = idCultivoActual;
        };

        arregloObjEnvioFrm.push(objEnvioCultivo);

        return arregloObjEnvioFrm;
    };

    var enviarDatos = function(JSONData){

        if (modalMensaje){
            modalMensaje.destroy();
        }
        modalMensaje = new ModalMensajeComponente().initRender({titulo: "Enviando datos...", texto_informacion: "Enviando información al servidor. Espere."});
        modalMensaje.mostrar();

        $.when( servicio_web.enviarDatos(JSONData)
                .done( function(r){                 
                    if (r.rpt){ 
                        modalMensaje.esconder();
                        modalMensaje.destroy();
                        modalMensaje = null;        
                        //eliminar todos los registros de este usuario.
                        self.eliminarRegistrosEnviados();
                        history.back();
                    } else {
                        try {
                            modalMensaje.mostrarError(r.msj.errorInfo[2]);    
                        } catch(e){
                            modalMensaje.mostrarError("Error");
                        }
                        
                    }
                })
                .fail(function(error){
                    modalMensaje.mostrarError(error.message);
                })
            );
    };

    this.eliminarRegistrosEnviados = function(){
        /*eliminar data idcultivo + fecha  ponerles estados de OK*/
        var dni_usuario = usuario.dni_usuario,
            reqObj = {
              eliminar_registros: servicio_frm.eliminarRegistrosEnviados(fecha_dia)              
            },
            self = this;

        $.whenAll(reqObj)
          .done(function (res) {
            var eliminarRegistros = res.eliminar_registros.rowsAffected;
           alert(eliminarRegistros+ " registros enviados.");

          })
          .fail(function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
          });
    };


    this.destroy = function(){
        $fecha = null;
        $content = null;

        $actualContainer = null;
        $actualTab = null;

        this.$el.off("click",".btnturno", this.irCultivo);     
        this.$el.off("click",".control-item", this.swapTab);     
        this.$el.off("click",".enviar-datos", this.procesarEnviarDatos);     

        this.$el = null;
    };


    this.initialize();  
}
