var SeleccionLoteListView = function () {
    var lotes;

    this.initialize = function() {
        this.$el = $('<div/>');
        //this.render();
    };

    this.setLotes = function(list) {
        lotes = list;
    };

    this.render = function() {
        if(!lotes){
            lotes = [];
        }
        this.$el.html(this.template(lotes));
        return this;
    };

    this.getLotes = function(){
        return lotes;
    };

    this.destroy = function(){
        this.$el = null;
        lotes = null;
    };

    this.initialize();

};