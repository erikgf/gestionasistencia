var AgriServicioFrm = function() {
    var _db;

    this.initialize = function(db) {
        var deferred = $.Deferred();        
        _db = db;
        deferred.resolve();
        return deferred.promise();
    };


    this.validarAperturaDia = function(fechaHoy, idpuntoacceso) {
        return _db.selectData("SELECT count(id) as existe, strftime('%d-%m-%Y', fecha_dia) as fecha_dia, strftime('%d-%m-%Y',date('now','localtime')) as fecha_hoy, date('now','localtime') as fecha_hoy_raw FROM registro_dia WHERE fecha_dia = ? AND idpuntoacceso = ?",
                    [fechaHoy, idpuntoacceso]);
    };

    this.registrarAperturaDia  = function(nombreUsuario, fechaDia, idpuntoacceso){
        var objRegistro = {
            usuario : nombreUsuario,
            fecha_dia : fechaDia,
            idpuntoacceso : idpuntoacceso
        };
        return _db.insertarDatos("registro_dia",  
                                    ["usuario","fecha_dia", "idpuntoacceso"],
                                        [objRegistro]);
    };


    this.obtenerTurnos = function(fechaDia, idcultivo) {
        return _db.selectData("SELECT rdt.idturno, t.descripcion, (CASE estado_cierre WHEN '0' THEN 1 ELSE 0 END) as turno_no_cerrado, "+ 
                               "0 as registros_totales, "+//"(SELECT COUNT(rdtd.id) FROM registro_dia_turno_detalle rdtd WHERE rdtd.fecha_dia = rdt.fecha_dia AND rdtd.idturno = rdt.idturno AND rdtd.idpuntoacceso = rdt.idpuntoacceso) as registros_totales, "+
                               "0 as registros_pendientes "+//"(SELECT COUNT(rdtd.id) FROM registro_dia_turno_detalle rdtd WHERE rdtd.fecha_dia = rdt.fecha_dia AND rdtd.idturno = rdt.idturno AND rdtd.idpuntoacceso = rdt.idpuntoacceso AND estado_envio >= 2) as registros_pendientes "+
                               "FROM registro_dia_turno rdt "+
                               "LEFT JOIN turno t ON t.idturno = rdt.idturno "+
                               "WHERE rdt.fecha_dia = ? AND rdt.idcultivo = ? ORDER BY t.idturno",
                    [fechaDia, idcultivo]);

    };

    this.obtenerNombreCultivo = function(idcultivo) {
        return _db.selectData("SELECT descripcion FROM cultivo WHERE idcultivo = ?",
                    [idcultivo]);

    };

    /*
    this.obtenerCultivos = function(fechaDia, dniUsuario) {
        return _db.selectData("SELECT idcultivo, descripcion FROM cultivo WHERE dni_responsable = ? AND idcultivo < 900 ORDER BY descripcion",
                    [dniUsuario]);

    };
    */
    this.obtenerCultivos = function(fechaDia, dniUsuario) {
        return _db.selectData("SELECT cu.idcultivo, c.descripcion FROM cultivo c INNER JOIN cultivo_usuario cu ON cu.idcultivo = c.idcultivo WHERE cu.dni_responsable = ? AND cu.idcultivo < 900 ORDER BY descripcion",
                    [dniUsuario]);

    };

    this.obtenerAreas = function(fechaDia, dniUsuario) {
        return _db.selectData("SELECT cu.idcultivo, c.descripcion FROM cultivo c INNER JOIN cultivo_usuario cu ON cu.idcultivo = c.idcultivo WHERE cu.dni_responsable = ? AND cu.idcultivo >= 900 ORDER BY descripcion",
                    [dniUsuario]);

    };

    this.obtenerCampos = function(idcultivo) {
        return _db.selectData("SELECT distinct(l.idcampo), ca.descripcion  "+
                               "FROM lote l  "+
                               "JOIN campo ca ON ca.idcampo = l.idcampo WHERE l.idcultivo =  ? "+
                               "ORDER BY ca.descripcion ",
                    [idcultivo]);

    };

    this.obtenerLotes = function(fechaDia, idcampo, idcultivo) {
        var sql,
            sqlWhere = " l.idcampo = ? ",
            params = [idcampo];

        if (!idcampo || idcampo == ""){
            sqlWhere = " true ";
            params = [];
        } else if (idcampo == "-1"){
            params  = [''];
        }

        if (idcultivo >= 900){
            sqlWhere = " l.idcampo = ? ";
            params  = [''];
        }

        params.push(idcultivo);
        sql = "SELECT distinct l.idlote, descripcion "+ 
                               "FROM lote l "+
                               "WHERE "+sqlWhere+
                               " AND l.idcultivo = ? "+
                               " ORDER BY l.descripcion";

        return _db.selectData(sql, params);

    };
   
    this.consultarTurno = function(idturno) {
        return _db.selectData("SELECT descripcion, hora_entrada, hora_salida FROM turno WHERE idturno = ?",
                    [idturno]);
    };

    this.consultarLote = function(idlote) {
        return _db.selectData("SELECT descripcion FROM lote WHERE idlote = ? ",
                    [idlote]);
    };

    this.consultarLabores = function(idcultivo) {
        return _db.selectData("SELECT idlabor, descripcion FROM labor WHERE idcultivo = ? ORDER BY descripcion",
                    [idcultivo]);
    };

    this.buscarRegistroPersonalControl = function(objControl) {
         var sql = "SELECT time(rlp.hora_registro) as hora, "+
                  " rlp.idlote, p.dni, p.nombres_apellidos,"+
                  " lt.descripcion as lote,"+
                  " l.descripcion as labor, "+
                  " l.idlabor as idlabor, "+
                  " rlp.tipo_acceso, "+
                  " rlp.idturno as idturno, "+
                  " rlp.idcultivo as idcultivo, "+
                  " (SELECT descripcion FROM labor WHERE idlabor = ?) as labor_forzado, "+
                  " COALESCE(numero_acceso,0) as numero_acceso "+
                  " FROM personal p "+
                  " LEFT JOIN registro_dia_cultivo_lote_personal rlp ON p.dni = rlp.dni_personal AND rlp.fecha_dia = date(?) AND rlp.idcultivo = ?"+
                  " LEFT JOIN labor l ON l.idlabor = rlp.idlabor AND rlp.idcultivo = l.idcultivo "+
                  " LEFT JOIN lote lt ON lt.idlote = rlp.idlote "+
                  " WHERE p.dni = ? ORDER BY rlp.hora_registro DESC LIMIT 1";

        return _db.selectData(sql,
                        [objControl.idlabor, objControl.fechaDia,  objControl.idcultivo,  objControl.numeroDNI ]);
    };

    this.registrarControl  = function(objRegistro){
        return _db.insertarDatos("registro_dia_cultivo_lote_personal",  
                                    ["dni_personal","idlabor","idlote","idturno","fecha_dia","idcultivo","tipo_acceso","numero_acceso","estado_envio"],
                                    [objRegistro]);
    };

    this.reemplazarControlEntrada = function (objRegistro) {
        return _db.actualizarDatos("registro_dia_cultivo_lote_personal",                                      
                                    ["idlabor"],
                                    [objRegistro.idlabor],
                                    ["fecha_dia","idlote","dni_personal","numero_acceso","tipo_acceso"],
                                    [objRegistro.fecha_dia, objRegistro.idlote, objRegistro.dni_personal,objRegistro.numero_acceso,"E"]);
    };

    this.eliminarControl  = function(objRegistro){
        return _db.eliminarDatos("registro_dia_cultivo_lote_personal",  
                                    ["dni_personal", "fecha_dia","idlabor","idlote", "numero_acceso", "tipo_acceso"],
                                    [objRegistro.dni_personal, objRegistro.fecha_dia, objRegistro.idlabor,  objRegistro.idlote, objRegistro.numero_acceso, "E"]);
    };

    /*
    this.obtenerRegistrosTurno = function(fechaDia, codTurno, idpuntoacceso){
        return _db.selectData(
                    "SELECT dni_personal, hora_registro, dni_usuario_envio FROM registro_dia_cultivo_lote_personal  WHERE fecha_dia = ? AND idturno = ? AND idpuntoacceso = ? AND estado_envio < 2 ORDER BY hora_registro",
                    [fechaDia, codTurno, idpuntoacceso]);
    };
    */

    this.listarControles = function(fechaDia, idcultivo, idlote) {
        return _db.selectData("SELECT p.nombres_apellidos, rd.dni_personal as dni,  "+
                                "   l.descripcion as labor, l.idlabor, (CASE idturno WHEN 'D' THEN 'DIURNO' ELSE 'NOCTURNO' END) as turno, "+
                                "   strftime('%H:%M:%S',hora_registro) as hora, estado_envio, numero_acceso"+
                                "   FROM registro_dia_cultivo_lote_personal rd "+
                                "   INNER JOIN personal p ON p.dni = rd.dni_personal "+
                                "   INNER JOIN labor l ON l.idlabor= rd.idlabor AND l.idcultivo = rd.idcultivo "+
                                "   WHERE rd.fecha_dia = date(?) AND rd.idcultivo = ? AND rd.idlote = ? AND rd.tipo_acceso = 'E' ORDER BY hora_registro DESC",
                    [fechaDia, idcultivo, idlote]);

    };


    this.obtenerRegistrosCultivo = function(fechaDia, idcultivo){
          return _db.selectData("SELECT dni_personal, hora_registro, idlote, idlabor, idturno FROM registro_dia_cultivo_lote_personal  "+
                            " WHERE fecha_dia = ? AND idcultivo = ? AND estado_envio = 1 ORDER BY hora_registro",
                    [fechaDia, idcultivo]);
    };

    this.marcarRegistroParaEnvio  = function(objRegistro){
        return _db.ejecutarSQL("UPDATE registro_dia_turno_detalle SET estado_envio = estado_envio + 1 WHERE dni_asistencia = ? AND cod_turno = ? AND  fecha_dia = ? AND idpuntoacceso = ?",
                                [objRegistro.dni_asistencia,objRegistro.cod_turno, objRegistro.fecha_dia, objRegistro.idpuntoacceso]);
    };

    this.existenRegistrosTurno = function(fechaDia, codTurno, idpuntoacceso){
        return _db.selectData(
                    "SELECT COUNT(id) as cantidad FROM registro_dia_turno_detalle WHERE fecha_dia = ? AND cod_turno = ? AND idpuntoacceso = ? AND estado_envio < 3",
                    [fechaDia, codTurno, idpuntoacceso]);
    };

    this.eliminarDia = function (fechaDia, idcultivo) {
        return _db.eliminarDatos("registro_dia",  
                                    ["fecha_dia","idcultivo"],
                                    [fechaDia, idcultivo]);
    };

    this.listarSalidas = function(fechaDia) {
        return _db.selectData("SELECT p.nombres_apellidos, rd.dni_personal as dni,  "+
                                "   rd.idlabor, rd.idlote, l.descripcion as labor, (CASE idturno WHEN 'D' THEN 'DIURNO' ELSE 'NOCTURNO' END) as turno, "+
                                "   strftime('%H:%M:%S',hora_registro) as hora, estado_envio , rd.tipo_acceso, modo_trabajo, numero_acceso "+
                                "   FROM registro_dia_cultivo_lote_personal rd "+
                                "   INNER JOIN personal p ON p.dni = rd.dni_personal "+
                                "   LEFT JOIN labor l ON l.idlabor= rd.idlabor AND l.idcultivo = rd.idcultivo "+
                                "   WHERE rd.fecha_dia = date(?) AND rd.tipo_acceso = 'S' ORDER BY hora_registro DESC",
                    [fechaDia]);

    };

    this.registrarSalida  = function(objRegistro){
        return _db.insertarDatos("registro_dia_cultivo_lote_personal",  
                                    ["dni_personal","idlabor","idlote","idturno","fecha_dia","idcultivo","tipo_acceso","hora_extra","numero_acceso","modo_trabajo","estado_envio"],
                                    [objRegistro]);
    };


    this.existePersonal = function(numeroDNI) {
        /*ULTIMO REGISTRO, VALIDO*/
        var sql = "SELECT COUNT(p.dni) as existe_usuario FROM personal p WHERE p.dni = ?";

        return _db.selectData(sql,[numeroDNI ]);
    };


    this.buscarRegistroPersonalSalida = function(fechaDia, numeroDNI) {
        /*ULTIMO REGISTRO, VALIDO*/
        var sql = "SELECT  time(rlp.hora_registro) as hora, "+
                  " rlp.idlote, p.dni, p.nombres_apellidos,"+
                  " lt.descripcion as lote,"+
                  " l.descripcion as labor, "+
                  " l.idlabor as idlabor, "+
                  " rlp.idturno as idturno, "+
                  " rlp.idcultivo as idcultivo, "+
                  " rlp.tipo_acceso, "+
                  " numero_acceso "+
                  " FROM personal p "+
                  " LEFT JOIN registro_dia_cultivo_lote_personal rlp ON p.dni = rlp.dni_personal AND rlp.fecha_dia = date(?)"+
                  " LEFT JOIN labor l ON l.idlabor = rlp.idlabor AND rlp.idcultivo = l.idcultivo "+
                  " LEFT JOIN lote lt ON lt.idlote = rlp.idlote "+
                  " WHERE p.dni = ? ORDER BY rlp.hora_registro DESC LIMIT 1";

        return _db.selectData(sql,
                        [fechaDia,  numeroDNI ]);
    };


    this.eliminarRegistroSalida  = function(objRegistro){
        return _db.eliminarDatos("registro_dia_cultivo_lote_personal",  
                                    ["dni_personal", "fecha_dia", "numero_acceso", "tipo_acceso"],
                                    [objRegistro.dni_personal, objRegistro.fecha_dia, objRegistro.numero_acceso, "S"]);
    };

    this.obtenerRegistros = function(fechaDia){
        return _db.selectData("SELECT dni_personal, hora_registro,  idcultivo, idlote, idlabor, idturno, tipo_acceso, hora_extra, numero_acceso, modo_trabajo "+
                            " FROM registro_dia_cultivo_lote_personal  "+
                            " WHERE fecha_dia = ? AND estado_envio = 1 ORDER BY idcultivo, hora_registro",
                    [fechaDia]);
    };

    this.eliminarRegistrosEnviados = function (fechaDia) {
        var estadoEnviado = "2", estadoPorEnviar = "1";
        return _db.actualizarDatos("registro_dia_cultivo_lote_personal",  
                                    ["estado_envio"],
                                    [estadoEnviado],
                                    ["fecha_dia","estado_envio"],
                                    [fechaDia, estadoPorEnviar]);
    };

    this.actualizarPareadoSalida = function (objRegistro) {
        var estadoPareado = "1";
        return _db.actualizarDatos("registro_dia_cultivo_lote_personal",  
                                    ["pareado"],
                                    [estadoPareado],
                                    ["fecha_dia","dni_personal","numero_acceso"],
                                    [objRegistro.fecha_dia, objRegistro.dni_personal, objRegistro.numero_acceso]);
    };
    

};