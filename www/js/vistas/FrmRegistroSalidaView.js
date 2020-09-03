var FrmRegistroSalidaView = function (servicio_frm, cache, usuario, params) {
	var self, 
        fecha_dia,
        $content,
        $listado,
        $filtro,
        $resultado,
        $btnScan,
        $chkTareado,
        _BLOQUEO_BUSQUEDA = false,
        TIEMPO_BLQOUEO = 1200,
        TOTAL_SALIDAS_ACTUAL = 0,
        MODO_TAREADO = "J",
        MODO_HORAS_EXTRA = "0",
        horaLimiteExtra = 1730,
        listaAsistenciaListView,
        busquedaResultadoComponente,
        getHoy = _getHoy,       
        formateoFecha = _formateoFecha,    
		rs2Array = resultSetToArray,
        getHora = _getHora;

	this.initialize = function () {
        this.$el = $('<div/>');

        fecha_dia  = params.fecha_dia;

        listaAsistenciaListView = new ListaAsistenciaListView(this);
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
        self = this;

    };
 
    this.render = function() {
	    this.$el.html(this.template({
                nombre_usuario: usuario.nombre_usuario,
                fecha_registro : formateoFecha(fecha_dia)
            }));

        $content = this.$el.find(".content");
        $filtro = this.$el.find("input[type=number]");
        $btnScan =  this.$el.find(".btn-scan");  
        $chkTareado  = this.$el.find(".modo-tareado");
        $chkHExtra  = this.$el.find(".modo-horasextras");

        if (verificarHoraLimite()){
            $chkHExtra[0].classList.add("active");
            MODO_HORAS_EXTRA = "1";
        }

        $listado = $content.find(".content-listado");
        $resultado =  $content.find(".busqueda-resultado");

        this.setEventos();
        this.listarSalidas();
	    return this;
	};

    var __keyupinput = function(e){
            var valor = this.value;
            self.preBusqueda(valor);            
        },
        __keydowninput = function(e){
            var valor = this.value;
            if (valor.length >= 8){
                e.preventDefault();
                return false;
            }
        },
        __click = function(e){
            e.preventDefault();
            self.mostrarLector();
        },
        __clickEliminar = function(e){
            e.preventDefault();
            var dataset = this.dataset;
            confirmar("¿Desea eliminar el registro salida de "+dataset.nombre+"?", function(){
                self.eliminarRegistroSalida(dataset.dnipersonal, dataset.numeroacceso);
            });
        },
        __cambiarTareado = function(e){
            e.preventDefault();
            var $ = this,
                esActive = $.classList.contains("active");

            if (esActive){
                $.classList.remove("active");
                MODO_TAREADO = "T";
            } else {
                $.classList.add("active");
                MODO_TAREADO = "J";
            }
        },
        __cambiarHExtras = function(e){
            e.preventDefault();
            var $ = this,
                esActive = $.classList.contains("active");

            if (esActive){
                $.classList.remove("active");
                MODO_HORAS_EXTRA = "0";
            } else {
                $.classList.add("active");
                MODO_HORAS_EXTRA = "1";
            }

            console.log("HORS EXTRAS "+(MODO_HORAS_EXTRA == "1" ? "sÍ": "NO"));
        };

    var UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
        };

    this.setEventos = function(){
        $filtro.on("keyup", __keyupinput);
        $filtro.on("keydown", __keydowninput);
        $btnScan.on("click", __click);
        $chkTareado.on("click", __cambiarTareado);
        $chkHExtra.on("click", __cambiarHExtras);
        $listado.on("click",".btn-eliminar", __clickEliminar);
    };

    this.listarSalidas = function(){
        /*Función que manda el código de cultivo y devuele LISTADO DE ASISTENTES (SUS SALIDAS)*/
        var self = this;
        $.when( servicio_frm.listarSalidas(fecha_dia)
                .done(function(resultado){
                    var arrAsistentes = rs2Array(resultado.rows);

                    TOTAL_SALIDAS_ACTUAL = parseInt(arrAsistentes.length);

                    listaAsistenciaListView.setAsistentes(arrAsistentes);
                    $listado.html(listaAsistenciaListView.$el);                        
                })
                .fail(function(e){console.error(e);})
        );
    };

    this.preBusqueda = function(posibleDNI){
        if (posibleDNI.length < 8 || posibleDNI.length > 8 || _BLOQUEO_BUSQUEDA == true){
            return;
        }

        this.registrarSalida(posibleDNI);
    }

	this.registrarSalida = function(numeroDNI){		
		var self = this, objRQ;

        if (fecha_dia == null || fecha_dia == ""){
            alert("No se ha encontrado día de asistencia seleccionado.");
            $filtro.val("");
            return;
        }

        _BLOQUEO_BUSQUEDA = true;

        /*
            verificar si existe, si o no
            buscar ultimo registro
            Busca un registro (ultimo)
            tipo coger idlabor, idcultivo + labor + cultivo + hora_entraada

            Si No existe
                ERROR(NO hay entrada )
            Si E
               reigstrar S(idlabor,idcultivo, fecha hora, S, dni)     
               if (hora mayor que 5,15) 
            Si S
                ERROR( DOble salida)
        */

        objRQ = {
            UIExistePersonal : servicio_frm.existePersonal(numeroDNI),
            UIBuscarRegistroPersonalSalida : servicio_frm.buscarRegistroPersonalSalida(fecha_dia, numeroDNI)
        };

        $.whenAll(objRQ)
            .done(function(res){
                var uiExistePersonal = res.UIExistePersonal.rows.item(0),
                    uiBuscarRegistroPersonalSalida = res.UIBuscarRegistroPersonalSalida.rows,
                    objBuscado, existeRegistro,
                    resetFiltro = function(){
                        $filtro.val("");
                        _BLOQUEO_BUSQUEDA = false;    
                    };

                    if (uiExistePersonal.existe_usuario <= 0){
                        self.mostrarResultado({
                            no_encontrado : true,
                            dni : numeroDNI
                        });
                        return;
                    }

                    objBuscado = uiBuscarRegistroPersonalSalida.item(0);
                    existeRegistro = (objBuscado.tipo_acceso != "" && objBuscado.tipo_acceso != null);

                    if (existeRegistro){
                        if (objBuscado.tipo_acceso == "S"){
                             resetFiltro();
                             alert("Se está registrando otra SALIDA del personal: "+objBuscado.nombres_apellidos);
                             return;
                        }

                        var objRegistro = {
                                    dni_personal : numeroDNI,
                                    fecha_dia : fecha_dia,                                
                                    idcultivo : objBuscado.idcultivo,
                                    idlote : objBuscado.idlote,
                                    idlabor : objBuscado.idlabor,
                                    idturno : objBuscado.idturno,
                                    tipo_acceso : 'S',
                                    estado_envio: 1,
                                    modo_trabajo: MODO_TAREADO,
                                    hora_extra: 0,
                                    numero_acceso : objBuscado.numero_acceso
                                };

                        if (MODO_HORAS_EXTRA != "0"){
                            objRegistro.hora_extra  = (verificarHoraLimite() ? "1" : "0"); 
                         }

                         _fnRegistrarSalida(objRegistro, objBuscado);

                    } else{
                        resetFiltro();
                        alert("No hay un registro de ENTRADA previa del personal: "+objBuscado.nombres_apellidos);
                        return;
                    }
                   
                })
            .fail(function (firstFail, name) {
                console.log('Fail for: ' + name);
                console.error(firstFail);
                _BLOQUEO_BUSQUEDA = false;
            });
	};

    this.eliminarRegistroSalida = function(numeroDNI, numeroAcceso){        
        var self = this;

        var objRegistro = {
             dni_personal : numeroDNI,
             fecha_dia : fecha_dia,
             numero_acceso : numeroAcceso
         };
                                
        var reqObj = {
            RQEliminar : servicio_frm.eliminarRegistroSalida(objRegistro)
        };

        $.whenAll(reqObj)
          .done(function(res){
                    alert("Registro eliminado");
                    self.listarSalidas();
                })
          .fail(function(e){
                console.error(e);    
            });
    };

    var _fnRegistrarSalida = function(objRegistro, objBuscado){
        var reqObj = {
                RQRegistro : servicio_frm.registrarSalida(objRegistro),
                RQActualizarPareado : servicio_frm.actualizarPareadoSalida(objRegistro)
            };

        $.whenAll(reqObj)
          .done(function(res){
                    objBuscado.no_encontrado = false;
                    objBuscado.hora = getHora();
                    
                    self.mostrarResultado(objBuscado);
                })
          .fail(function(e){
                _BLOQUEO_BUSQUEDA = false;
                console.error(e);    
            });
    };

    this.mostrarResultado = function(objBuscado){
        var objAsistente;
        busquedaResultadoComponente = new BusquedaResultadoComponente(objBuscado);
        $resultado.html(busquedaResultadoComponente.render().$el);
 
        setTimeout(function(){
                $filtro.val("");
                busquedaResultadoComponente.destroy();
                busquedaResultadoComponente =  null;
                _BLOQUEO_BUSQUEDA = false;
            }, objBuscado.tiempo ? objBuscado.tiempo : TIEMPO_BLQOUEO);


        if (objBuscado.no_encontrado == false){
            objAsistente = {
                dni : objBuscado.dni,
                labor: objBuscado.labor,
                nombres_apellidos : objBuscado.nombres_apellidos,
                hora: objBuscado.hora,
                turno : objBuscado.idturno == "D" ? "DIURNO" : "NOCTURNO",
                tipo_acceso : "S",
                modo_trabajo : MODO_TAREADO,
                numero_acceso : objBuscado.numero_acceso,
                estado_envio : 1
            };

            listaAsistenciaListView.agregarAsistente(objAsistente);
        }
    };

    this.mostrarLector = function(){
        /*muestra lector*/
        var fnOK = function(result){
            if (result.cancelled == false){
                var textoEncontrado = result.text;
                $filtro.val(textoEncontrado);
                self.preBusqueda(textoEncontrado);
            }
        };
        barcodeScan(fnOK);
    };

    var verificarHoraLimite = function(){
         var momento = new Date(),
            minutos = momento.getMinutes(),
            hora;

            minutos = (minutos <= 9) ? ("0"+minutos) : minutos;
            hora = parseInt(momento.getHours() + ""+ minutos);
        return hora >= horaLimiteExtra;
    };

    this.destroy = function(){
        $filtro.off("keyup", __keyupinput);
        $filtro.off("keydown", __keydowninput);
        $filtro = null;

        $btnScan.off("click", __click);
        $btnScan = null;

        $listado.off("click",".btn-eliminar", __clickEliminar);
        $chkTareado.off("click", __cambiarTareado);
        $chkHExtra.off("click", __cambiarHExtras);

        $chkHExtra = null;
        $chkTareado = null;
        $content = null;
        $listado =  null;
        $resultado = null;

        fecha_dia = null;

        if(busquedaResultadoComponente){
            busquedaResultadoComponente.destroy();
            busquedaResultadoComponente = null;
        }

        if (listaAsistenciaListView){
            listaAsistenciaListView.destroy();
            listaAsistenciaListView = null;
        }

        this.$el = null;
    };

    this.initialize();  
}