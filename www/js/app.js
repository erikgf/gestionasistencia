 var CACHE_VIEW = {
    login: {
        txt_usuario: null
    },
    inicio:{
    },
    seleccion_cultivo: {
    },
    seleccion_lote: {
    },
    registro_labor: {
    },
    registro_salida: {
    }
},
  ACTUAL_PAGE = null,
  router;

var DATA_NAV, DATA_NAV_JSON, 
    FECHA_TRABAJO; /*VARIABLE SUPER IMPORTANTE QUE NOS DICTA SI ES QUE HAY O NO DIA ACTIVO EN EL SISTEMA.*/

var onDeviceReady = function () {   
    /* ---------------------------------- Local Variables ---------------------------------- */
    DATA_NAV_JSON = localStorage.getItem(VARS.NOMBRE_STORAGE);

    if ( DATA_NAV_JSON != null){
      DATA_NAV = JSON.parse(DATA_NAV_JSON); 
    } else {
      DATA_NAV = {
        acceso: false,
        usuario : {dni: '00000000', usuario: 'admin', nombre_usuario: "ADMIN"}
      };
    }

    FECHA_TRABAJO = localStorage.getItem(VARS.NOMBRE_STORAGE_FECHA_TRABAJO);

    var VERSION = "1.3",
        slider = new PageSlider($('body')),
        //blockUI = new BlockUI(),
        db = new DBHandlerClase(VERSION),
        servicio = new AgriServicio(),
        servicio_web = new AgriServicioWeb(),
        servicio_frm = new AgriServicioFrm();
    
    XX = db;
    servicio_web.initialize();
    servicio_frm.initialize(db);
    servicio.initialize(db).then(function (htmlScriptTemplates) {
      try{
        procesarTemplates(htmlScriptTemplates);

          router.addRoute('', function() {
              slider.slidePage(new LoginView(servicio, servicio_web).render().$el);
          });

          router.addRoute('inicio', function() {
            if (DATA_NAV.acceso){
                slider.slidePage(new InicioView(DATA_NAV.usuario,servicio_web, servicio).render().$el);
            }
          });

          router.addRoute('seleccion-cultivo/:fechadia', function(fecha_dia) {
            if (DATA_NAV.acceso){
                slider.slidePage(new SeleccionCultivoView(fecha_dia, servicio_frm, servicio_web, CACHE_VIEW.seleccion_cultivo,DATA_NAV.usuario).render().$el);
            }
          });

          router.addRoute('seleccion-lote/:fechadia/:idcultivo', function(fecha_dia, idcultivo) {
            if (DATA_NAV.acceso){
                slider.slidePage(new SeleccionLoteView(fecha_dia, idcultivo, servicio_frm, CACHE_VIEW.seleccion_lote,DATA_NAV.usuario).render().$el);
            }
          });

          router.addRoute('registro-labor/:fechadia/:idcultivo/:idlote', function(fecha_dia, idcultivo,idlote) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroLaborView(servicio_frm, CACHE_VIEW.registro_labor, DATA_NAV.usuario, {fecha_dia: fecha_dia, idcultivo: idcultivo, idlote : idlote}).render().$el);
            }
          });

          router.addRoute('registro-salida/:fechadia', function(fecha_dia) {
            if (DATA_NAV.acceso){
                slider.slidePage(new FrmRegistroSalidaView(servicio_frm, CACHE_VIEW.registro_salida, DATA_NAV.usuario, {fecha_dia: fecha_dia}).render().$el);
            }
          });


        if (DATA_NAV.acceso){
          router.load("inicio");
        } else {
          router.load("");
        }

        router.start();

        checkActualizar();

      }catch(e){
        console.error(e)
      };
        console.log("Servicio inicializado.");
    });

    function procesarTemplates(htmlScriptTemplates){
        $("body").prepend(htmlScriptTemplates);


        var scripts = document.getElementsByTagName('script');

        for(var i = 0; i < scripts.length; i++) {
            var $el = scripts[i], id = $el.id;
            if ($el.type.toLowerCase() == "text/template"){
                window[id.slice(0,-4)].prototype.template = Handlebars.compile(document.getElementById(id).innerHTML);
            }
        }
    };
    
    FastClick.attach(document.body);
};

(function(){
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    if ( app ) {
      document.addEventListener("deviceready", onDeviceReady, false);
    } else {
      onDeviceReady();  // Web page
    } 
    setFX(app);
}());

    /*
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    if ( app ) {
      document.addEventListener("deviceready", onDeviceReady, false);
    } else {
      onDeviceReady();  // Web page
    } 
    */

function cerrarSesion(){
  localStorage.removeItem(VARS.NOMBRE_STORAGE);
  DATA_NAV = {
    acceso: false,
    usuario : null
  };

  location.href = "#";
 // router.load("inicio");
};
