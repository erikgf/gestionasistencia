var Ajxur = {
   // var self = this;
   URL : "../controlador/index-web.php" ,
   $Ld : $('.loader'),
    Loader : {  
        numAPIs: 0,     
        c  : 0, // contador de peticiones activas.        
        timer : 2000,
        esMostrado :function(){
          //return !(Ajxur.$Ld[0].style.display == "none")
        },
        quitar : function(){
          //Ajxur.$Ld.removeClass(".on");
        },
        mostrar : function(){
          //Ajxur.$Ld.addClass(".on");
        }
    },
    Api : function (params, callbackFunction, callbackFunctionError){    
            var self = this, data_frm;
            this.tracer = false;
            this.loader = true;
            this.needParseJSON = 0; 
            this.url = Ajxur.URL;

            if (params.data_files){ 
               data_frm  = new FormData();
               data_frm.append("modelo",params.modelo);
               data_frm.append("metodo",params.metodo);
               if (params.formulario){
                 data_frm.append("formulario",params.formulario);
               }
               if (params.data_in){
                 data_frm.append("data_in",params.data_in);
               }
               if (params.data_out){
                 data_frm.append("data_out",params.data_out);
               }

               if (params.data_files && params.data_files != undefined){
                $.each(params.data_files, function(key,value){
                  if (value)
                    data_frm.append(key,value);   
                })
               }
               
               this.ajax = $.ajax({                
                url: self.url,
                cache: false,
                contentType: false,
                processData: false,
                data: data_frm,
                type: "get"
              });
            } else{
              this.ajax = $.ajax({
                url: self.url,
                data: params,
                type: "get"
              });
            }

            Ajxur.Loader.c++;
            this.id =  ++Ajxur.Loader.numAPIs;

            if(self.tracer) console.log("INICIO PETICIÓN. ID:",self.id); 
        
            if (typeof callbackFunction != "function"){
              if (callbackFunction == "deferred"){
                return this.ajax;
              }
            }

            this.ajax
            .done( function(r){
                self.successCallback(r);
            })
            .fail( function(e){
                self.failCallback(e);
            });
               
            setTimeout(function(){
              if(self.tracer) {
                console.log("PETICIONES ACTIVAS ", Ajxur.Loader.c);
                console.log("Verificador de DELAY: Estado de ID:",self.id); 
                }
                if (self.ajax.readyState != 4){
                  if(self.tracer) console.log("DATA aún no ha llegado.:");
                  if (self.loader) Ajxur.Loader.mostrar();
                  return;
                }
              if(self.tracer) console.log("DATA ya había llegado. ");
            },Ajxur.Loader.timer);
            
            this.back = function(){
                if (self.tracer) console.log("DATA llegó. ID: ", self.id);
                Ajxur.Loader.c--;
                if (self.tracer) console.log("PETICIONES ACTIVAS ", Ajxur.Loader.c);
                if (Ajxur.Loader.esMostrado()){
                    if (self.tracer) console.log("CARGANDO... Está en pantalla.");
                    if (Ajxur.Loader.c <= 0){
                        if (self.tracer) console.log("No hay peticiones.");
                        if (self.loader) Ajxur.Loader.quitar();
                        return;
                    }    
                    return;
                }      
                if (self.tracer)  console.log("CARGANDO... Está fuera de pantalla");  
            };


            this.successCallback = function(success){
                self.back();
                if (  self.needParseJSON  == 1){
                  success = JSON.parse(success);    
                }
                callbackFunction(success);    
            }

            this.failCallback = function(error){
                if (self.loader) Ajxur.Loader.quitar();

                if (self.needParseJSON == 1){
                    error = JSON.parse(error);            
                }

                if (typeof callbackFunctionError != "function"){
                    callbackFunctionError(error.responseText);
                } else {                                      
                    var datosJSON = JSON.parse(error.responseText);
                    console.error(datosJSON.mensaje);
                    alert(datosJSON.mensaje);                    
                    //swal("Error", datosJSON.mensaje, "error");    
                }   
            }
        }
};