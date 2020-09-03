var SeleccionLoteView = function (fecha_dia, idcultivo, servicio_frm, cache, usuario) {

	var self = this,
		fechaOK = false,
        $content,
        $cboCampo,
        $listaLotes,
        seleccionLoteListView, 
        getHoy = _getHoy,      
        modalMensaje,
        formateoFecha = _formateoFecha,       
		rs2Array = resultSetToArray,
        ES_PROCESOS= idcultivo >= 900;

	this.initialize = function () {
        this.$el = $('<div/>');   
        seleccionLoteListView = new SeleccionLoteListView();    
        if (ACTUAL_PAGE != null && (typeof ACTUAL_PAGE.destroy == "function")){
            ACTUAL_PAGE.destroy();
        }
        ACTUAL_PAGE = this;
    };

    this.setEventos = function(){
        if (!ES_PROCESOS){
            this.$el.on("change",".cbocampo", this.listarLotes);      
        }
        this.$el.on("click",".lista-lotes li", this.seleccionarLote);    
     };

    this.render = function() {        
    	this.consultarUI();
	    return this;
	};

	var UIDone = function (res) {
            var uiCampos = rs2Array(res.UICampos.rows),
                uiLotes  = rs2Array(res.UILotes.rows),
                uiCultivo = res.UICultivo.rows[0],
                fechaRegistroActiva = fecha_dia,
                fechaRegistro;

            seleccionLoteListView.setLotes(uiLotes);

            if (fechaRegistroActiva != null && fechaRegistroActiva != ""){
            	fechaOK = true;
            	fechaRegistro = formateoFecha(fecha_dia);
            } else {
            	fechaOK = false;
                fechaRegistro = formateoFecha(getHoy());
            }

            self.$el.html(self.template({
                nombre_usuario: usuario.nombre_usuario,
                cultivo : uiCultivo.descripcion,
                fecha_registro : fechaRegistro,
                idcultivo : idcultivo
            })); 

           if (!ES_PROCESOS){
               $cboCampo = self.$el.find(".cbocampo"),
               $cboCampo.html(self.templateCampo(uiCampos));
               $cboCampo.val(cache.idcampo);
           }

           $content = self.$el.find(".content");
           $listaLotes = $content.find(".lista-lotes");
           $listaLotes.html(seleccionLoteListView.render().$el);

            /*ajustar parte del la zona de LOTES funcione el scroll correcatmnte.*/
            setTimeout(function(){
                var heightTop = 125,
                maxHeight = $content.eq(0).height() - heightTop;
                $listaLotes.css({"max-height": maxHeight+"px"});
            },300);

           self.setEventos();
        },
        UIFail = function (firstFail, name) {
            console.log('Fail for: ' + name);
            console.error(firstFail);
        },
        lotesDone = function(res){
            var uiLotes  = rs2Array(res.UILotes.rows);
            seleccionLoteListView.setLotes(uiLotes);
            $listaLotes.html(seleccionLoteListView.render().$el);

        },
        eliminarDone = function (res) {
            alert("Día eliminado.");
            history.back();
        };


	this.consultarUI = function(){
		/*consultamos LOS CAMPOS
            mostrat todos los lotes
            */
		var reqObj = {
              UICultivo : servicio_frm.obtenerNombreCultivo(idcultivo),
              UICampos: servicio_frm.obtenerCampos(idcultivo),
              UILotes : servicio_frm.obtenerLotes(fecha_dia, cache.idcampo, idcultivo)             
            };

        $.whenAll(reqObj)
          .done(UIDone)
          .fail(UIFail);
	};

    this.consultarLotes = function(idCampo){
        var reqObj = {
            UILotes : servicio_frm.obtenerLotes(fecha_dia, idCampo, idcultivo)
        };

        $.whenAll(reqObj)
          .done(lotesDone)
          .fail(UIFail);

    };

    this.templateCampo = function(listaCampos){
        var  html = "<option value=''>Todos los campos</option>";

        html += "<option value='-1'>Sin campo asignado</option>";

        for (var i = 0; i < listaCampos.length; i++) {
            var objCampo = listaCampos[i];
            html += "<option value='"+objCampo.idcampo+"'>"+objCampo.descripcion+"</option>";
        };

        return html;
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


    this.listarLotes = function(e){
        e.preventDefault();
        var idCampo = this.value;
        CACHE_VIEW.seleccion_lote.idcampo = idCampo;
        self.consultarLotes(idCampo);
    };


    this.seleccionarLote = function(e){
        e.preventDefault();
        var idLote = this.dataset.id;

        if (idLote == ""){
            alert("No hay LOTE seleccionado.");
            return;
        }

        if (!fechaOK){
            alert("No hay un día de registro habilitado.");
            return;
        }
        router.load("registro-labor/"+fecha_dia+"/"+idcultivo+"/"+idLote);
    };

    this.destroy = function(){
        $content = null;
        $cboCampo = null;
        $listaLotes = null;

        if (seleccionLoteListView){
            seleccionLoteListView.destroy();
            seleccionLoteListView = null;
        }

        if (!ES_PROCESOS){
            this.$el.off("change",".cbocampo", this.listarLotes);
        }
        this.$el.off("click",".lista-lotes li", this.seleccionarLote); 
        this.$el = null;

        if (modalMensaje){
            modalMensaje.destroy();
            modalMensaje = null;
        }
             
    };


    this.initialize();  
}
