var AgriServicio = function() {
	var _db;

    this.initialize = function(db) {
      //  var deferred = $.Deferred();        
        _db = db;
     //   deferred.resolve();
        return this.compilar();//deferred.promise();
    };

    this.compilar = function(){
      //return $.get("template.compiler.php");
      return $.get("template.master.hbs");
    };

    this.iniciarSesion = function(_login, _clave){
    	return _db.selectData(
    				"SELECT dni, nombres_apellidos as nombre_usuario, usuario FROM usuario WHERE lower(usuario) = lower(?) AND clave = ?",
    				[_login,_clave]);
    };

    this.insertarUsuarios = function(usuarios, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
    	return _db.insertarDatos("usuario",  
    								["dni","nombres_apellidos", "usuario", "clave"],
			    						usuarios, 
			    							cleanAll);
    };

    this.insertarCultivos = function(cultivos, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }

        return _db.insertarDatos("cultivo",  
                                    ["idcultivo","descripcion", "dni_responsable"],
                                        cultivos, 
                                            cleanAll);
    };

    this.insertarCultivoUsuarios = function(cultivos_usuarios, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }

        return _db.insertarDatos("cultivo_usuario",  
                                    ["idcultivo", "dni_responsable"],
                                        cultivos_usuarios, 
                                            cleanAll);
    };

    this.insertarPersonal = function(personal, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
        return _db.insertarDatos("personal",  
                                    ["dni","nombres_apellidos"],
                                        personal, 
                                            cleanAll);
    };

    this.insertarLotes = function(lotes, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
        return _db.insertarDatos("lote",  
                                    ["idlote", "descripcion", "idcampo","idcultivo"],
                                        lotes, 
                                            cleanAll);
    };

    this.insertarLabores = function(labores, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
        return _db.insertarDatos("labor",  
                                    ["idlabor", "descripcion","idcultivo"],
                                        labores, 
                                            cleanAll);
    };

    this.insertarCampos = function(campos, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
        return _db.insertarDatos("campo",  
                                    ["idcampo", "descripcion"],
                                        campos, 
                                            cleanAll);
    };

    this.insertarTurnos = function(usuarios, cleanAll){
        if (cleanAll == undefined){
            cleanAll = true;
        }
        return _db.insertarDatos("turno",  
                                    ["idturno", "descripcion", "hora_entrada", "hora_salida"],
                                        usuarios, 
                                            cleanAll);
    };

    this.insertarVariables = function(variables){
        return _db.insertarDatos("_variables_",  
                                    ["nombre_variable", "valor"],
                                        variables, 
                                            true);
    };

    this.insertarRegistroEntradas = function(registro_entradas){
        console.log("rE",registro_entradas);
        return _db.insertarDatos("registro_dia_cultivo_lote_personal",  
                                    ["fecha_dia", "idcultivo", "dni_personal", "idlote", "idlabor", "idturno", "tipo_acceso", "numero_acceso", "hora_registro", "pareado","estado_envio"],
                                        registro_entradas, 
                                            false);

    };


    this.existenTurnos = function() {
        return _db.selectData(
                    "SELECT COUNT(id) > 0 as existen_turnos FROM turno ORDER BY idturno",
                    []);
    };

    this.consultarDiasRegistro = function() { //por modificar
        return _db.selectData(
                    "SELECT strftime('%Y-%m-%d',(datetime('now','localtime'))) = fecha_dia as hoy, fecha_dia as fecha_dia_raw, strftime('%d-%m-%Y',fecha_dia) as fecha_dia, estado_cierre, "+
                        " (SELECT COUNT(idturno) FROM turno) as total_turnos FROM registro_dia  "+
                        " WHERE estado_cierre = 0 ORDER BY date(fecha_dia)",
                    []);
    };

    this.insertarDiaRegistro = function(diaHoy, nombreUsuario){
        return _db.insertarDiaRegistro(diaHoy, nombreUsuario);
    };

    this.insertarDiaRegistroTurno = function(diaHoy, idcultivo){
        return _db.insertarDiaRegistroTurno(diaHoy, idcultivo);

    };

    this.consultarExistenciaDia = function(diaHoy){
        return _db.selectData(
                    "SELECT COUNT(id) > 0 as existencia FROM registro_dia  "+
                        " WHERE estado_cierre = 0 AND fecha_dia = ?",
                    [diaHoy]);
    };

    this.cargarPuntosAcceso = function() {
        return _db.selectData(
                    "SELECT idcultivo, descripcion FROM cultivo ORDER BY descripcion DESC",
                    []);
    };

    this.limpiarDiasAnteriores = function () {
        return _db.ejecutarSQL("DELETE FROM registro_dia WHERE DATE(fecha_dia) < DATE('now');",  
                                    []);
    };

    this.limpiarDiasAnterioresRegistros = function () {
        return _db.ejecutarSQL("DELETE FROM registro_dia_cultivo_lote_personal WHERE DATE(fecha_dia) < DATE('now');",  
                                    []);
    };

    this.resetearBD = function(){
        return _db.dropEstructura();
    };  

    this.removerSincroEntradasPrevias = function(cadena_dni){
        var sql = "DELETE FROM registro_dia_cultivo_lote_personal WHERE DATE(hora_registro) = DATE('now') AND tipo_acceso = 'E' AND pareado = 0 AND dni_personal IN "+cadena_dni+";";
        return _db.ejecutarSQL(sql,[]);
    };

};

