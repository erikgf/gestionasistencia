var ListaAsistenciaListView = function () {
    var asistentes;

    this.initialize = function() {
        this.$el = $('<div/>');
        this.render();
    };

    this.setAsistentes = function(list) {
        asistentes = list;
        this.render();
    };

    this.agregarAsistente =function(asistente){
        asistentes.unshift(asistente);   
        this.$el.html(this.template({asistentes: asistentes, total: asistentes.length}));   
    };

    this.templateUno = function(asistente){
        return '<li class="table-view-cell cell-'+(asistente.tipo_acceso ? "entrada" : "salida")+'">'+
                    '<div class="nombre">('+asistente.indice+') '+asistente.dni+' - '+asistente.nombres_apellidos+'</div>'+
                    '<div class="labor">'+asistente.labor+'</div>'+
                    '<div class="tipo-registro">'+asistente.tipo_registro+': '+asistente.hora+'</div>'+
                '</li> ';
    };

    this.render = function() {
        if(!asistentes){
            asistentes = [];
        }
        this.$el.html(this.template({asistentes: asistentes, total: asistentes.length}));
        return this;
    };

    this.getAsistentes = function(){
        return asistentes;
    };


    this.removerAsistente = function(objRemover){
        var nuevoAsistentesYaRemovido = [];
        for (var i = 0; i < asistentes.length; i++) {
            var obj = asistentes[i];
            if (obj.dni != objRemover.dni || obj.numero_acceso != objRemover.numero_acceso){
                nuevoAsistentesYaRemovido.push(asistentes[i]);
            }
        };        
        asistentes = nuevoAsistentesYaRemovido;
        return nuevoAsistentesYaRemovido;
    };

    this.destroy = function(){
        this.$el = null;
        asistentes = null;
    };

    this.initialize();

};