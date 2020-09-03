var LoginView = function(servicio, servicio_web, cache) {
    var self = this,
        _CLICKS = 0,
        progressBar,
        modalMensaje,
        SEGUNDOS_VERIFICAR_SINCRO = 2,
        objSincronizador,
        getHoy = _getHoy,
        rs2Array = resultSetToArray;

     this.initialize = function() {
         this.$el = $('<div/>');
         this.setEventos();
         setTimeout(function(){
            self.verificarSincronizacionUltimaAuto();
         }, SEGUNDOS_VERIFICAR_SINCRO * 1000);
     };

     this.setEventos = function(){
        this.$el.on("submit","form", this.iniciarSesion);
        this.$el.on("click","img", this.resetearBD);
        this.$el.on("click","#btn-sincronizar", this.verificarSincronizacionUltimaManual);
     };

     this.render = function() {
         this.$el.html(this.template({nombre_app: VARS.NOMBRE_APP}));
         return this;
     };

     this.iniciarSesion = function(e){
        e.preventDefault();
        
        var $form = $(this),
            _login = $form.find("#txt-login").val(), 
            _clave = $form.find("#txt-clave").val();

        /*
        if (_login == "admin" && _clave == "admin"){
            DATA_NAV.acceso = true;
            DATA_NAV.usuario = {usuario: 'admin', dni: '00000000', nombre_usuario: "ADMIN"};
            window.location.hash = "inicio";
            return;
        }
        */

        $.when( servicio.iniciarSesion(_login, md5(_clave)) )
            .done( function( resultado ){
                var rows = resultado.rows;
                if (rows.length > 0){
                    DATA_NAV.acceso = true;
                    DATA_NAV.usuario = rows.item(0);
                    localStorage.setItem(VARS.NOMBRE_STORAGE, JSON.stringify(DATA_NAV));
                    consultarDiasRegistro();
                } else {
                    alert("Usuario no válido.");
                }
        }); //EndWhen
     };

     var consultarDiasRegistro = function(){       
        var diaHoy = getHoy(),
            reqObj = {
             consultar_existencia_dia: servicio.consultarExistenciaDia(diaHoy)
            };

        $.whenAll(reqObj)
          .done(function (res) {
            var rowConsultarExistencia = res.consultar_existencia_dia.rows.item(0);
            
            if (rowConsultarExistencia.existencia == 0){
                insertarDiaRegistro(diaHoy);
                return;
            }

            window.location.hash = "inicio";
          })
          .fail(function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
          });
    };

    var insertarDiaRegistro = function(diaHoy){          
        var nombreUsuario = DATA_NAV.usuario.usuario,
            reqObj = {
              insertar_dia: servicio.insertarDiaRegistro(diaHoy, nombreUsuario)
            };

        $.whenAll(reqObj)
          .done(function (res) {
            window.location.hash = "inicio";
          })
          .fail(function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
          });
    };

    this.resetearBD = function(e){
        e.preventDefault();
        _CLICKS++;
        if (_CLICKS > 5){
            alert("Se eliminará BD, resetee app en 5 segundos.");
            servicio.resetearBD();
            _CLICKS = 0;
        }
        
     };

    var verificarSincronizacionUltima = function(forzar){
        /*consulta si hay un valor de fecha guardado 
            si no hay, o no es la fecha acual
                FORCE SINCRO
            si hay DO NOTHING*/
        var fechaUltima, hoy;
            objSincronizador = new SincronizadorClase(servicio, servicio_web, 
                    ["Usuarios", "Cultivos", "CultivoUsuarios", "Personal", "Lotes", "Labores","Campos","Turnos"]);;

        if (forzar == true){
            objSincronizador.actualizarDatos();
            return;
        }

        fechaUltima = localStorage.getItem(VARS.NOMBRE_STORAGE+"_FECHA");
        hoy = getHoy();

        if (fechaUltima == null || hoy != fechaUltima){
            objSincronizador.actualizarDatos();
        }  else {
            objSincronizador.destroy();
        }
    };

    this.verificarSincronizacionUltimaManual = function(){
        verificarSincronizacionUltima(true);
    };

    this.verificarSincronizacionUltimaAuto = function(){
        if (checkConexion().online){
            verificarSincronizacionUltima(false);
        } else {
            alert("No se ha detectado ninguna RED disponsible para hacer sincronización automática.");
        }
    };

    this.destroy = function(){
        if (objSincronizador){
            objSincronizador.destroy();
            objSincronizador = null;
        }

        this.$el.off("submit","form", this.iniciarSesion);
        this.$el.off("click","img", this.resetearBD);
        this.$el.off("click","#btn-sincronizar", this.verificarSincronizacionUltimaManual);

        this.$el = null;
        self = null;
    };

     this.initialize();
};