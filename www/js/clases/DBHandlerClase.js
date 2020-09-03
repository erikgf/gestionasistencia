var DBHandlerClase = function(version) {
    /*
    1.- Crear la bbdd
    2.- Crear la estructura

    otros:
    3.- Limpiar informacion
    4.- Consulta y agregar informacion
    5.- Enviar informacion
    */
    //INSERT INTO registro_dia(fecha_dia, dni_usuario) values ('2019-05-13','00000000');
    //SELECT count(id), date('now','localtime') FROM registro_dia;
    //var url;
    var DB_NOMBRE = "bd_task_app_upo";
    var _tables = [
                   {  nombre: "usuario",
                      campos : [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "dni", tipo: "TEXT"},
                            { nombre: "nombres_apellidos", tipo: "TEXT"},
                            { nombre: "usuario", tipo: "TEXT"},
                            { nombre: "clave", tipo: "TEXT"}
                        ]},
                   {  nombre: "cultivo",
                      campos : [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "idcultivo", tipo: "TEXT"},
                            { nombre: "descripcion", tipo: "TEXT"},
                            { nombre: "dni_responsable", tipo: "TEXT"}
                        ]}, 
                    {  nombre: "cultivo_usuario",
                      campos : [
                            { nombre: "idcultivo", tipo: "TEXT"},
                            { nombre: "dni_responsable", tipo: "TEXT"}
                        ]}, 
                    {  nombre: "personal",
                      campos : [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "dni", tipo: "TEXT"},
                            { nombre: "nombres_apellidos", tipo: "TEXT"},
                            { nombre: "rol", tipo: "TEXT"}
                        ]},
                    {  nombre: "turno",
                      campos : [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "idturno", tipo: "TEXT"},
                            { nombre: "descripcion", tipo: "TEXT"},
                            { nombre: "hora_entrada", tipo: "TEXT"},
                            { nombre: "hora_salida", tipo: "TEXT"}
                        ]},   
                    {  nombre: "campo",
                      campos : [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "idcampo", tipo: "TEXT"},
                            { nombre: "descripcion", tipo: "TEXT"}
                        ]}, 
                    {  nombre: "lote",
                      campos : [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "idlote", tipo: "TEXT"},
                            { nombre: "descripcion", tipo: "TEXT"},
                            { nombre: "idcultivo", tipo: "TEXT"},
                            { nombre: "idcampo", tipo: "TEXT"}
                        ]},     
                    {  nombre: "labor",
                      campos : [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "idlabor", tipo: "TEXT"},
                            { nombre: "descripcion", tipo: "TEXT"},
                            { nombre: "idcultivo", tipo: "TEXT"}
                        ]},                           
                    {  nombre: "_variables_",
                        campos: [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "nombre_variable", tipo: "TEXT"},
                            { nombre: "valor", tipo: "TEXT"}
                        ]},
                    {  nombre: "registro_dia",
                        campos: [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "fecha_dia", tipo: "DATETIME"},
                            { nombre: "usuario", tipo: "TEXT"},
                            { nombre: "hora_apertura", default: "(datetime('now','localtime'))",  tipo: "TIMESTAMP"},
                            { nombre: "estado_cierre", tipo: "INTEGER", default: "0"}
                        ]},
                    {  nombre: "registro_dia_cultivo",
                        campos: [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "fecha_dia", tipo: "DATETIME"},
                            { nombre: "idcultivo", tipo: "TEXT"},
                            { nombre: "estado_cierre", tipo: "INTEGER", default: "0"} /*0: not complete, 1: complete (enviado y aceptado como cerrado)*/
                        ]},
                    {  nombre: "registro_dia_cultivo_lote_personal",
                        campos: [
                            { nombre: "id", tipo: "INTEGER",pk : true},
                            { nombre: "fecha_dia", tipo: "DATETIME"},
                            { nombre: "idcultivo", tipo: "TEXT"},
                            { nombre: "dni_personal", tipo: "TEXT"},
                            { nombre: "idlote", tipo: "TEXT"},
                            { nombre: "idlabor", tipo: "TEXT"},
                            { nombre: "idturno", tipo: "TEXT"},
                            { nombre: "tipo_acceso", tipo: "TEXT"}, /*E o S*/
                            { nombre: "numero_acceso", tipo: "INTEGER"}, /*correlativo de numero de pareado E/S, comenzando desde 0 a N*/
                            { nombre: "modo_trabajo", tipo: "TEXT", default : ""}, /*J: Por jornal. T: Por tarea asignada*/
                            { nombre: "hora_extra", tipo: "INTEGER", default : "0"}, /*0: Sin horas, 1: con horas*/
                            { nombre: "hora_registro", default: "(datetime('now','localtime'))", tipo: "TIMESTAMP"},
                            { nombre: "pareado", default: "0", tipo: "INTEGER"}, /*defalt 0, cuando hay un E y S (o sea registra un S al mismo numero_acceso, se vuelve 1*/
                            { nombre: "estado_envio", tipo: "INTEGER", default : "0"} /*0 noenviado, 1 enviado (inexistente porque el registro sera borrado), 2: traido del servidor*/
                        ]}                    
            ];        

    this.initialize = function(_version) {
        //url = serviceURL ? serviceURL : "http://localhost:5000/sessions";
        try { 
            if (!window.openDatabase) { 
              alert('Este dispositivo no soporta Base de Datos local.'); 
            } else { 
              var shortName = DB_NOMBRE,
                  version = _version == null  ? "1" : _version, //version actual
                  displayName = 'BD Task App UPO',
                  maxSize = 5*1024*1024, // in bytes 
                  fnCheckVersion = function(actualVersion, arregloVersiones){
                      var bol = false;

                      for (var i = arregloVersiones.length - 1; i >= 0; i--) {
                        var vers = arregloVersiones[i];
                        bol = parseFloat(vers) == parseFloat(actualVersion) || bol;
                        if (bol == true){
                          return bol;
                        }
                      };

                      return bol;
                  },
                  _disversion;

              this.mydb = openDatabase(shortName, "", displayName, maxSize);

              _disversion = this.mydb.version;

              /*todas las versiones liberadas*/
              var versionesLiberadas = ["1","1.3"];
              if (fnCheckVersion(_disversion, versionesLiberadas) && _disversion != version) {
                var self = this;
                this.mydb.changeVersion(_disversion, version, function(db){
                    sekf.limpiarEstructura();                  
                    self.crearEstructura();
                });
                return;
              }

              this.crearEstructura();            
             }
        } catch(e) { console.error(e); alert(e.message); }

        return this;
        /*
        var deferred = new Deferred();
        var session = null;
        var l = sessions.length;
        for (var i=0; i < l; i++) {
            if (sessions[i].id === id) {
                session = sessions[i];
                break;
            }
        }
        deferred.resolve(session);
        return deferred.promise;
        */
    };


    this.crearEstructura = function(){
       try {
            /*Aqui se va a crear la estructura de la BBDD
            usuario
            campos
            parcelas
            coordenadas_parcelas
            formularios
            */
            for (var i = _tables.length - 1; i >= 0; i--) {
                this.crearTabla(_tables[i]);
            };

       } 
       catch(e){ 
            console.error(e); 
        }
    };

    this.crearTabla = function(objTabla) {
       try {
            var campos = objTabla.campos, 
              l = campos.length,
              sql = "CREATE TABLE IF NOT EXISTS ";
              sql += objTabla.nombre + '('; 
              for (var i = 0; i < l; i++) {
                var objCampo = campos[i];        
                if (i > 0){
                  sql += ', ';
                }
                sql +=  objCampo.nombre+' '+objCampo.tipo+' '+
                        (objCampo.pk ? ' PRIMARY KEY AUTOINCREMENT ' : '' )+
                        (objCampo.notnull ? ' NOT NULL ' : ' NULL ')+
                        (objCampo.default ? (' DEFAULT '+objCampo.default) : '');
              }
              sql += ');';
              
              this.mydb.transaction(
                function(transaction) {
                  transaction.executeSql(sql, [], this.nullDataHandler, this.errorHandler);
                    /* transaction.executeSql(sql, [], 
                      function(transaction_, results_){
                        transaction_.executeSql("INSERT INTO usuario(cod_usuario, nombres_apellidos, cod_rol, usuario, clave) VALUES (-1,'ADMIN',0,'admin','"+md5('123456')+"')", [], this.nullDataHandler, this.errorHandler);
                      }, this.errorHandler); 
                   */
                  });
          } 
          catch(e) { 
            console.error(e); 
          }
    };

    this.dropEstructura = function(){
         try {
            /*Aqui se va a crear la estructura de la BBDD
            usuario
            campos
            parcelas
            coordenadas_parcelas
            formularios
            */
            for (var i = _tables.length - 1; i >= 0; i--) {
                this.dropTabla(_tables[i].nombre);
            };
       } 
       catch(e){ 
            console.error(e); 
        }
    };

    this.dropTabla = function(nombre_tabla) {
      try {
        this.mydb.transaction(
          function(transaction) {
            transaction.executeSql('DROP TABLE '+nombre_tabla, [], this.nullDataHandler, this.errorHandler);
            });
          } catch(e) {}
    };

    this.limpiarEstructura = function(){
         try {
            /*Aqui se va a crear la estructura de la BBDD
            usuario
            campos
            parcelas
            coordenadas_parcelas
            formularios
            */
            for (var i = _tables.length - 1; i >= 0; i--) {
                this.limpiarTabla(_tables[i].nombre);
            };
       } 
       catch(e){ 
            console.error(e); 
        }
    };

    this.limpiarTabla = function(nombre_tabla) {
      try {
        this.mydb.transaction(
          function(transaction) {
            transaction.executeSql('DELETE FROM '+nombre_tabla, [], this.nullDataHandler, this.errorHandler);
            });
        } catch(e) {
            console.error(e);
        }
    };

    this.errorHandler = function (transaction, error) { 
      console.error("Error procesando SQL: "+ error);
      return true;  
    }

    this.nullDataHandler = function (transaction, results) {        
    }

    this.selectData = function(sql, params){
       try {
          var _mydb = this.mydb;
          return $.Deferred(function (d) {
              _mydb.readTransaction(function (tx) {
                   tx.executeSql(sql,
                        params,
                        function(tx, data){ d.resolve(data);},                        
                        function(tx, error){ d.reject(error);}
                   );
              });
            });
        } catch(e) {
            alert("Error processing SQL: "+ e.message);
        }
    };

    this.insertarDatos = function(nombre_tabla, campos_insercion, data_usuarios, limpiarTabla){
      try{
           var _mydb = this.mydb;
           return $.Deferred(function (d) {
              _mydb.transaction(function (tx) {
                var fn = function(){
                    var len_campos = campos_insercion.length - 1,
                        sql = " INSERT INTO "+nombre_tabla+" ( ",
                        sqlQMark = " UNION ALL SELECT ",
                        len = data_usuarios.length - 1,
                        paramArray = [], 
                        tmpObj;

                    if (data_usuarios.length <= 0){
                      tx.executeSql("SELECT 1",
                        paramArray,
                        function(tx, data){ d.resolve(data);},                        
                        function(tx, error){ d.reject(error);}
                      );
                      return;
                    }

                    for (var i = len_campos; i >= 0; i--) {
                        sql += campos_insercion[i];
                        sqlQMark += "?";
                        if (i > 0){
                          sql += ", ";
                          sqlQMark += ", ";
                        }
                    };
                    sqlQMark += " ";

                    sql += ") ";

                    for (var i = len; i >= 0; i--) {
                      if (i == len){
                        sql += "SELECT ";
                        for (var j = len_campos; j >= 0; j--) {
                          sql += "? AS "+campos_insercion[j];
                          if (j > 0){
                            sql += ", ";
                          }
                        };
                      } else {
                        sql += sqlQMark;
                      }
                    };

                    for (var i = len; i >= 0; i--) {
                      tmpObj = data_usuarios[i];
                      for (var j = len_campos; j >= 0; j--) {
                        paramArray.push( tmpObj[campos_insercion[j]] );
                      };
                    };

                    sql +=";";

                    tx.executeSql(sql,
                      paramArray,
                      function(tx, data){ d.resolve(data);},                        
                      function(tx, error){ d.reject(error);}
                    );   
                  };
                if (limpiarTabla == true){
                  tx.executeSql("DELETE FROM "+nombre_tabla, [], 
                    fn, 
                      function(tx, error){
                        console.error(error);
                      }
                  );
                  return;
                }

                fn();
              });
            });
      } catch(e){
        console.error(e.message);
      }
    };

    this.actualizarDatos = function(nombre_tabla, campos_actualizacion, valores_actualizacion, campos_where, valores_where){
      try{
           var _mydb = this.mydb;
           return $.Deferred(function (d) {
              _mydb.transaction(function (tx) {
                var len_actualizar = campos_actualizacion.length,
                    len_campos = campos_where.length,
                    sql = "UPDATE  "+nombre_tabla+ " SET ",
                    sqlParams = "",
                    sqlWhere = "",
                    sqlArrayParams = [];

                if (len_actualizar > 0){
                  //Existe where.
                   for (var i = len_actualizar - 1; i >= 0; i--) {
                      sqlParams += campos_actualizacion[i]+" = ?";
                      sqlArrayParams.push(valores_actualizacion[i]);
                      if (i > 0 ){
                        sqlParams += ', ';
                      }
                    };
                }

                sql += sqlParams;

                if (len_campos > 0){
                  //Existe where.
                  sqlWhere += " WHERE ";
                   for (var i = len_campos - 1; i >= 0; i--) {
                      sqlWhere += campos_where[i]+" = ?";
                      sqlArrayParams.push(valores_where[i]);
                      if (i > 0 ){
                        sqlWhere += ' AND ';
                      }
                    };
                }

                sql += sqlWhere;

                tx.executeSql(sql,
                      sqlArrayParams,
                      function(tx, data){ d.resolve(data);},                        
                      function(tx, error){ d.reject(error);}
                ); 
              });
            });
      } catch(e){
        console.error(e.message);
      }
    };


    this.eliminarDatos = function(nombre_tabla, campos_where, valores_where){
      try{
           var _mydb = this.mydb;
           return $.Deferred(function (d) {
              _mydb.transaction(function (tx) {

                var len_campos = campos_where.length,
                    sql = "DELETE FROM "+nombre_tabla,
                    sqlWhere = "";

                if (len_campos > 0){
                  //Existe where.
                  sqlWhere += " WHERE ";
                   for (var i = 0; i < len_campos; i++) {
                      sqlWhere += campos_where[i]+" = ?";
                      if (i < len_campos - 1 ){
                        sqlWhere += ' AND ';
                      }
                    };
                }

                sql += sqlWhere;

                tx.executeSql(sql,
                      valores_where,
                      function(tx, data){ d.resolve(data);},                        
                      function(tx, error){ d.reject(error);}
                ); 

              });
            });
      } catch(e){
        console.error(e.message);
      }
    };

    this.ejecutarSQL = function(sql, params){
      try{
           var _mydb = this.mydb;
           return $.Deferred(function (d) {
              _mydb.transaction(function (tx) {

                tx.executeSql(sql,
                      params,
                      function(tx, data){ d.resolve(data);},                        
                      function(tx, error){ d.reject(error);}
                ); 

              });
            });
      } catch(e){
        console.error(e.message);
      }
    };

    this.insertarDiaRegistro = function(diaHoy, usuario){
      try{
           var _mydb = this.mydb;
           return $.Deferred(function (d) {
              _mydb.transaction(function (tx) {

                var sql = "INSERT INTO registro_dia(fecha_dia, usuario) VALUES (?,?)";

                tx.executeSql(sql,
                      [diaHoy, usuario],
                      function(tx, data){ d.resolve(data);},                        
                      function(tx, error){ d.reject(error);}
                ); 

              });
            });
      } catch(e){
        console.error(e.message);
      }
    };

    this.initialize(version);  
}


/*
XX.mydb.transaction(
                function(transaction) {
                  transaction.executeSql("ALTER TABLE registro_dia_cultivo_lote_personal ADD pareado INTEGER NOT NULL DEFAULT 1", [], null, null);
                  });*/