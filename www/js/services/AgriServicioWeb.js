var AgriServicioWeb = function() {
    var url,
       IP = "http://"+VARS.SERVER+"/server_control_upo";

    this.initialize = function(serviceURL) {
        //url = serviceURL ? serviceURL : "http://localhost/cayalti_agri_web/controlador/";
        url = serviceURL ? serviceURL : IP+"/controlador/";
        var deferred = $.Deferred();
        deferred.resolve();
        return deferred.promise();
    };

    this.actualizarDatos = function() {
       return $.ajax({
                url: url,
                data: {modelo: "ActualizadorAppLabor", "metodo": "actualizarDatos"},
                type: "post"
              });
    };

    this.sincronizarDiarioDatos = function() {
       return $.ajax({
                url: url,
                data: {modelo: "ActualizadorAppLabor", "metodo": "sincronizarDiarioDatos"},
                type: "post"
              });
    };

    this.enviarDatos = function(JSONData) {
       return $.ajax({
                url: url,
                data: {modelo: "ActualizadorAppLabor", "metodo": "enviarDatos", data_out:[JSONData]},
                type: "post"
              });
    };

};