var FrmRegistroLaborView = function (servicio_frm, cache, usuario, params) {
	var self, 
        fecha_dia,
        idlote,
        idcultivo,
        $content,
        $listado,
        $filtro,
        $resultado,
        $btnScan,
        _BLOQUEO_BUSQUEDA = false,
        TIEMPO_BLQOUEO = 1200,
        TOTAL_ASISTENTES_ACTUAL = 0,
        listaAsistenciaListView,
        busquedaResultadoComponente,
        getHoy = _getHoy,
        getHora = _getHora,
        formateoFecha = _formateoFecha,    
		rs2Array = resultSetToArray,
        ES_PROCESOS= params.idcultivo >= 900;

	this.initialize = function () {
        this.$el = $('<div/>');

        idcultivo  = params.idcultivo;
        fecha_dia  = params.fecha_dia;
        idlote  = params.idlote;

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
                fecha_registro : formateoFecha(fecha_dia),
                idcultivo : idcultivo
            }));

        $content = this.$el.find(".content");
        $filtro = this.$el.find("input[type=number]");
        $btnScan =  this.$el.find(".btn-scan");  
        $listado = $content.find(".content-listado");
        $resultado =  $content.find(".busqueda-resultado");
        $cbolabor = this.$el.find(".cbolabor");
     
        /*this.tictac();*/
        this.setEventos();
        this.consultarUI(); /*cultivo, lote,  labores*/
        this.listarControles();
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
            confirmar("¿Desea eliminar el registro de "+dataset.nombre+"?", function(){
                self.eliminarControl(dataset.dnipersonal, dataset.idlabor, dataset.numeroacceso);
            });
        };

    var UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
        };

    this.setEventos = function(){
        $filtro.on("keyup", __keyupinput);
        $filtro.on("keydown", __keydowninput);
        $btnScan.on("click", __click);
        $listado.on("click",".btn-eliminar", __clickEliminar);
    };

    this.consultarUI = function(){
        /*Función que manda el código de cultivo y devuele hora E,S y descripcion.*/
        var reqObj = {
            UICultivo : servicio_frm.obtenerNombreCultivo(idcultivo),
            UILote : servicio_frm.consultarLote(idlote),
            UILabores : servicio_frm.consultarLabores(idcultivo)
        };

        $.whenAll(reqObj)
          .done(function(res){
                var UICultivo  = res.UICultivo.rows.item(0),
                    UILote  = res.UILote.rows.item(0),
                    UILabores  = rs2Array(res.UILabores.rows);

                self.$el.find(".cultivo").html(UICultivo.descripcion);
                self.$el.find(".lote").html(UILote.descripcion);
                $cbolabor.html(self.templateLabor(UILabores));

                })
          .fail(UIFail);
    };

    this.templateLabor = function(lista){
        var  html = "<option value=''>Seleccionar</option>";

        for (var i = 0; i < lista.length; i++) {
            var obj = lista[i];
            html += "<option value='"+obj.idlabor+"'>"+obj.descripcion+"</option>";
        };

        return html;
    };

    this.listarControles = function(){
        /*Función que manda el código de cultivo y devuele hora E,S y descripcion.*/
        var self = this;
        $.when( servicio_frm.listarControles(fecha_dia, idcultivo, idlote)
                .done(function(resultado){
                    var arrAsistentes = rs2Array(resultado.rows);

                    TOTAL_ASISTENTES_ACTUAL = parseInt(arrAsistentes.length);

                    listaAsistenciaListView.setAsistentes(arrAsistentes);
                    $listado.html(listaAsistenciaListView.$el);                        
                })
                .fail(function(e){console.error(e);})
        );
    };

    this.preBusqueda = function(valor){
        if (valor.length < 8 || valor.length > 8 || _BLOQUEO_BUSQUEDA == true){
            return;
        }

        this.registrarControl(valor);
    }

    this.registrarControl = function(numeroDNI){     
        var self = this, objRQ,
             idlabor = $cbolabor.val();

        if (fecha_dia == null || fecha_dia == ""){
            alert("No se ha encontrado día de asistencia seleccionado.");
            $filtro.val("");
            return;
        }

        if (idlabor == ""){
            alert("Debe seleccionar una labor.");
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
            UIBuscarRegistroPersonalControl : servicio_frm.buscarRegistroPersonalControl({idlabor: idlabor, fechaDia: fecha_dia, idcultivo: idcultivo, numeroDNI : numeroDNI})
        };

        $.whenAll(objRQ)
            .done(function(res){
                var uiExistePersonal = res.UIExistePersonal.rows.item(0),
                    uiBuscarRegistroPersonalControl = res.UIBuscarRegistroPersonalControl.rows,
                    objBuscado, existeRegistro,
                    numeroAcceso = 0,
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

                    objBuscado = uiBuscarRegistroPersonalControl.item(0);
                    objBuscado.reemplazar = false;
                    ultimoRegistro = objBuscado.tipo_acceso;

                    var objRegistro = {
                            dni_personal : numeroDNI,
                            fecha_dia : fecha_dia,                                
                            idcultivo : idcultivo,
                            idlote : idlote,
                            idlabor : idlabor,
                            idturno : obtenerTurnoAcordeHora(),
                            tipo_acceso : 'E',
                            estado_envio: 1,
                            numero_acceso : parseInt(objBuscado.numero_acceso) + 1
                        };

                    if (ultimoRegistro == null || ultimoRegistro == "" || ultimoRegistro == "S"){
                        _fnRegistrarControl(objRegistro, objBuscado);
                        return;
                    }

                    if (numeroDNI == objBuscado.dni && idlote == objBuscado.idlote){ 
                        /*Dni, idlabor, idlote SON IDÉNTICOS*/
                        if (idlabor == objBuscado.idlabor){
                            alert("El personal "+objBuscado.nombres_apellidos+" actualmente se encuentra asignado a la misma LABOR en este mismo LOTE.")
                            resetFiltro();
                            return;
                        }

                        confirmar(objBuscado.nombres_apellidos+" existe en el lote "+objBuscado.lote+".\nSÍ: Para corregir el registro.\nNO: Realizar nuevo registro.", 
                                function(){
                                    objRegistro.numero_acceso = objBuscado.numero_acceso;
                                    objBuscado.reemplazar = true;
                                   _fnRegistrarControl(objRegistro, objBuscado);
                                }, function(){
                                   _fnRegistrarControlMasSalida(objRegistro, objBuscado);
                                });
                        return;    
                    }

                    _fnRegistrarControlMasSalida(objRegistro, objBuscado);
                    /*
                    Ultimo registro == Salida || ninguno
                        SI:
                            Registrar Entrada (Marcar E/S)? NONE porque
                        NO: 
                            Entrada DNI, es en el mismo lote
                                SI: 
                                    Se está tratando de registrar una laborar identica a la anterior.
                                        labor == oldlabor
                                        SI: 
                                          Error, el personal actualmente es´ta asignado a esa misma labor en este mismo lote.
                                        No:
                                          Desea reemplaza? 
                                            SI: RegistrarControl (editar labor (misma hora))
                                            NO:
                                                Solo está cambiando de labor en el mismo lote Ergo
                                                Registrar Salida Marcar(E/S)
                                                Registrar Entrada
                                NO: 
                                    Registrar Salida Marcar(E/S)
                                    Registrar Entrada
                        */

                })
            .fail(function (firstFail, name) {
                console.log('Fail for: ' + name);
                console.error(firstFail);
                _BLOQUEO_BUSQUEDA = false;
            });
    };

    var obtenerTurnoAcordeHora = function(){
        var momento = new Date(),
            minutos = momento.getMinutes(),
            horaMilitar;
            
            minutos = (minutos <= 9) ? ("0"+minutos) : minutos;
            horaMilitar = parseInt(momento.getHours()+""+minutos);

            if (horaMilitar > 1800){
                return 'N';
            }

            return 'D';
    };

    this.eliminarControl = function(numeroDNI, _idlabor, numero_acceso){        
        var self = this;

        if (  _idlabor == null || _idlabor == ""){
            alert("Debe seleccionar una labor.");
            return;
        }

        var objRegistro = {
             dni_personal : numeroDNI,
             fecha_dia : fecha_dia,
             idlote : idlote,
             idlabor : _idlabor,
             numero_acceso : numero_acceso
         };

        var reqObj = {
            RQEliminar : servicio_frm.eliminarControl(objRegistro)
        };

        $.whenAll(reqObj)
          .done(function(res){
                    alert("Registro eliminado");
                    self.listarControles();
                })
          .fail(function(e){
                console.error(e);    
            });
    };

    var _fnRegistrarControl = function(objRegistro, objBuscado){
        var reqObj = {},
            reemplazar = objBuscado.reemplazar;

        if (reemplazar == undefined){
            reemplazar = false;
        }

        if (reemplazar){
            var objReemplazar = {dni_personal: objRegistro.dni_personal,
                                                                fecha_dia: fecha_dia, idlote: objBuscado.idlote, 
                                                                idlabor: objRegistro.idlabor,
                                                                numero_acceso: objBuscado.numero_acceso};
            reqObj.RQReemplazar = servicio_frm.reemplazarControlEntrada(objReemplazar);
        } else {
            reqObj.RQRegistro = servicio_frm.registrarControl(objRegistro);
        }


        $.whenAll(reqObj)
          .done(function(res){
                    objBuscado.labor = (objBuscado.labor != null || objBuscado.labor == objBuscado.labor_forzado) ? objBuscado.labor : objBuscado.labor_forzado;
                    objBuscado.no_encontrado = false;
                    objBuscado.hora = getHora();
                    self.mostrarResultado(objBuscado);

                })
          .fail(function(e){
                _BLOQUEO_BUSQUEDA = false;
                console.error(e);    
            });
    };


    var _fnRegistrarControlMasSalida= function(objEntrada, objBuscado){
        var reqObj = {}, 
            objSalida = {
                dni_personal : objEntrada.dni_personal,
                fecha_dia : fecha_dia,                                
                idcultivo : objBuscado.idcultivo,
                idlote : objBuscado.idlote,
                idlabor : objBuscado.idlabor,
                idturno : objBuscado.idturno,
                tipo_acceso : 'S',
                estado_envio: 1,
                modo_trabajo: 'J',
                hora_extra: 0,
                numero_acceso : objBuscado.numero_acceso
            };

        reqObj.RQRegistroSalida = servicio_frm.registrarSalida(objSalida);
        reqObj.RQActualizarPareado = servicio_frm.actualizarPareadoSalida(objSalida)
        reqObj.RQRegistro = servicio_frm.registrarControl(objEntrada);


        $.whenAll(reqObj)
          .done(function(res){
                    objBuscado.labor = (objBuscado.labor != null || objBuscado.labor == objBuscado.labor_forzado) ? objBuscado.labor : objBuscado.labor_forzado;
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
                labor: objBuscado.labor_forzado,
                nombres_apellidos : objBuscado.nombres_apellidos,
                hora: objBuscado.hora,
                turno : objBuscado.idturno == "D" ? "DIURNO" : "NOCTURNO",
                idlabor : (objBuscado.idlabor ? objBuscado.idlabor : $cbolabor.val()),
                estado_envio : 1,
                numero_acceso : (objBuscado.reemplazar ? objBuscado.numero_acceso : parseInt(objBuscado.numero_acceso) + 1),
                tipo_acceso : "E"
            };

            if (objBuscado.reemplazar){
                /*remover de este arreglo DNI + numero_acceso*/
                listaAsistenciaListView.removerAsistente({dni: objBuscado.dni, numero_acceso: objBuscado.numero_acceso});
            }

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


    this.destroy = function(){
        $filtro.off("keyup", __keyupinput);
        $filtro.off("keydown", __keydowninput);
        $filtro = null;

        $btnScan.off("click", __click);
        $btnScan = null;

        $listado.off("click",".btn-eliminar", __clickEliminar);


        $cbolabor = null;
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