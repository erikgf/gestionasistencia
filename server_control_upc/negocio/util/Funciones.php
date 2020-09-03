<?php

class Funciones {

    public static function getTimeStamp(){
         date_default_timezone_set('America/Lima');
         return date('Y-m-d H:i:s');
    }          

    public static function generarHTMLReporte($htmlDatos) {
        $html = '
                    <html>
                        <head>
                            <meta charset="utf-8">
                        </head>
                        <body>';

        $html .= $htmlDatos;
        $html .= "</body>";
        $html .= "</html>";

        return $html;
    }
    
    public static function generarReporte($html_reporte, $tipo_reporte, $nombre_archivo="reporte"){
        if ($tipo_reporte == 1){
            //Genera el reporte en HTML
            echo $html_reporte;
        }else if ( $tipo_reporte == 2 ){
            //Genera el reporte en PDF
            $archivo_pdf = "../almacen_facturas/".$nombre_archivo.".pdf";
            Funciones::generaPDF($archivo_pdf, $html_reporte,'a4','',true);
            header("location:".$archivo_pdf);
        }else{
            //Genera el reporte en Excel
            header("Content-type: application/vnd.ms-excel; name='excel'");
            header("Content-Disposition: filename=".$nombre_archivo.".xls");
            header("Pragma: no-cache");
            header("Expires: 0");

            echo $html_reporte;
        }
    }
 
    public static function fechaFormateada($fecha,$hora){        
        
    $dia = substr($fecha,8,2);
    $mes = substr($fecha,5,2);
    $año = substr($fecha,0,4);
    //jddayofweek($fecha);
    return Funciones::nombreDiaSemana(date('w', strtotime($fecha)))." ".$dia.'/'.$mes.'/'.$año.',a las '. Funciones::formatoHora($hora);        
    }
    
    public static function nombreDiaSemana($numDia){
        switch ($numDia){
            case 0:
                return "DOMINGO";
            case 1:
                return "LUNES";
            case 2:
                return "MARTES";
            case 3:
                return "MIERCOLES";
            case 4:
                return "JUEVES";
            case 5:
                return "VIERNES";
            case 6:
                return "SABADO";                           
        }
    }
    
    public static function formatoHora($hora){
       $hrs = substr($hora,0,2);
       $mins = substr($hora,3,4);
       $miem = "AM";
       if ($hrs > 12 ){
           $miem = "PM";
           $hrs = $hrs - 12;
           if ($hrs<10){
               $hrs = '0'.$hrs;
           }
       }
       
       return $hrs.':'.$mins.' '.$miem;
    }

   public static function fechear($fecha){
       if (!isset($fecha) || $fecha == ""){
           return "";
       }
       $ar = preg_split("/\/|-/",$fecha);  
       return $ar[2]."-".$ar[1]."-".$ar[0];
   }
    
    public static function randomString($length=7,$uc=TRUE,$n=TRUE,$sc=FALSE)
        {
        $source = 'abcdefghijklmnopqrstuvwxyz';
        if($uc==1) {$source .= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';}
        if($n==1) {$source .= '1234567890';}
            if($sc==1) {$source .= '|@#~$%()=^*+[]{}-_';}
        if($length>0){
            $rstr = "";
            $source = str_split($source,1);
            for($i=1; $i<=$length; $i++){
                mt_srand((double)microtime() * 1000000);
                $num = mt_rand(1,count($source));
                $rstr .= $source[$num-1];
            }

        }
        return $rstr;
    }
       
     public static function formatearCeros($numero,$cantDigitos){
         $temp = '00000000000000000000000000000';
         $temp = $temp.$numero;
         $cut =  strlen($temp) - $cantDigitos;
         return substr($temp, $cut, $cut);         
     }   
     
     
    public static function get_string_between($string, $start, $end){
            $string = ' ' . $string;
            $ini = strpos($string, $start);
            if ($ini == 0) return '';
            $ini += strlen($start);
            $len = strpos($string, $end, $ini) - $ini;
            return substr($string, $ini, $len);
    }


//------    CONVERTIR NUMEROS A LETRAS         ---------------
//------    Máxima cifra soportada: 18 dígitos con 2 decimales
//------    999,999,999,999,999,999.99
// NOVECIENTOS NOVENTA Y NUEVE MIL NOVECIENTOS NOVENTA Y NUEVE BILLONES
// NOVECIENTOS NOVENTA Y NUEVE MIL NOVECIENTOS NOVENTA Y NUEVE MILLONES
// NOVECIENTOS NOVENTA Y NUEVE MIL NOVECIENTOS NOVENTA Y NUEVE PESOS 99/100 M.N.
//------    Creada por:                        ---------------
//------             ULTIMINIO RAMOS GALÁN     ---------------
//------            uramos@gmail.com           ---------------
//------    10 de junio de 2009. México, D.F.  ---------------
//------    PHP Version 4.3.1 o mayores (aunque podría funcionar en versiones anteriores, tendrías que probar)
       public static function numtoletras($xcifra)
        {
            $xarray = array(0 => "Cero",
                1 => "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
                "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE",
                "VEINTI", 30 => "TREINTA", 40 => "CUARENTA", 50 => "CINCUENTA", 60 => "SESENTA", 70 => "SETENTA", 80 => "OCHENTA", 90 => "NOVENTA",
                100 => "CIENTO", 200 => "DOSCIENTOS", 300 => "TRESCIENTOS", 400 => "CUATROCIENTOS", 500 => "QUINIENTOS", 600 => "SEISCIENTOS", 700 => "SETECIENTOS", 800 => "OCHOCIENTOS", 900 => "NOVECIENTOS"
            );
        //
            $xcifra = trim($xcifra);
            $xlength = strlen($xcifra);
            $xpos_punto = strpos($xcifra, ".");
            $xaux_int = $xcifra;
            $xdecimales = "00";
            if (!($xpos_punto === false)) {
                if ($xpos_punto == 0) {
                    $xcifra = "0" . $xcifra;
                    $xpos_punto = strpos($xcifra, ".");
                }
                $xaux_int = substr($xcifra, 0, $xpos_punto); // obtengo el entero de la cifra a covertir
                $xdecimales = substr($xcifra . "00", $xpos_punto + 1, 2); // obtengo los valores decimales
            }
         
            $XAUX = str_pad($xaux_int, 18, " ", STR_PAD_LEFT); // ajusto la longitud de la cifra, para que sea divisible por centenas de miles (grupos de 6)
            $xcadena = "";
            for ($xz = 0; $xz < 3; $xz++) {
                $xaux = substr($XAUX, $xz * 6, 6);
                $xi = 0;
                $xlimite = 6; // inicializo el contador de centenas xi y establezco el límite a 6 dígitos en la parte entera
                $xexit = true; // bandera para controlar el ciclo del While
                while ($xexit) {
                    if ($xi == $xlimite) { // si ya llegó al límite máximo de enteros
                        break; // termina el ciclo
                    }
         
                    $x3digitos = ($xlimite - $xi) * -1; // comienzo con los tres primeros digitos de la cifra, comenzando por la izquierda
                    $xaux = substr($xaux, $x3digitos, abs($x3digitos)); // obtengo la centena (los tres dígitos)
                    for ($xy = 1; $xy < 4; $xy++) { // ciclo para revisar centenas, decenas y unidades, en ese orden
                        switch ($xy) {
                            case 1: // checa las centenas
                                if (substr($xaux, 0, 3) < 100) { // si el grupo de tres dígitos es menor a una centena ( < 99) no hace nada y pasa a revisar las decenas
                                     
                                } else {
                                    $key = (int) substr($xaux, 0, 3);
                                    if (TRUE === array_key_exists($key, $xarray)){  // busco si la centena es número redondo (100, 200, 300, 400, etc..)
                                        $xseek = $xarray[$key];
                                        $xsub = Funciones::subfijo($xaux); // devuelve el subfijo correspondiente (Millón, Millones, Mil o nada)
                                        if (substr($xaux, 0, 3) == 100)
                                            $xcadena = " " . $xcadena . " CIEN " . $xsub;
                                        else
                                            $xcadena = " " . $xcadena . " " . $xseek . " " . $xsub;
                                        $xy = 3; // la centena fue redonda, entonces termino el ciclo del for y ya no reviso decenas ni unidades
                                    }
                                    else { // entra aquí si la centena no fue numero redondo (101, 253, 120, 980, etc.)
                                        $key = (int) substr($xaux, 0, 1) * 100;
                                        $xseek = $xarray[$key]; // toma el primer caracter de la centena y lo multiplica por cien y lo busca en el arreglo (para que busque 100,200,300, etc)
                                        $xcadena = " " . $xcadena . " " . $xseek;
                                    } // ENDIF ($xseek)
                                } // ENDIF (substr($xaux, 0, 3) < 100)
                                break;
                            case 2: // checa las decenas (con la misma lógica que las centenas)
                                if (substr($xaux, 1, 2) < 10) {
                                     
                                } else {
                                    $key = (int) substr($xaux, 1, 2);
                                    if (TRUE === array_key_exists($key, $xarray)) {
                                        $xseek = $xarray[$key];
                                        $xsub = Funciones::subfijo($xaux);
                                        if (substr($xaux, 1, 2) == 20)
                                            $xcadena = " " . $xcadena . " VEINTE " . $xsub;
                                        else
                                            $xcadena = " " . $xcadena . " " . $xseek . " " . $xsub;
                                        $xy = 3;
                                    }
                                    else {
                                        $key = (int) substr($xaux, 1, 1) * 10;
                                        $xseek = $xarray[$key];
                                        if (20 == substr($xaux, 1, 1) * 10)
                                            $xcadena = " " . $xcadena . " " . $xseek;
                                        else
                                            $xcadena = " " . $xcadena . " " . $xseek . " Y ";
                                    } // ENDIF ($xseek)
                                } // ENDIF (substr($xaux, 1, 2) < 10)
                                break;
                            case 3: // checa las unidades
                                if (substr($xaux, 2, 1) < 1) { // si la unidad es cero, ya no hace nada
                                     
                                } else {
                                    $key = (int) substr($xaux, 2, 1);
                                    $xseek = $xarray[$key]; // obtengo directamente el valor de la unidad (del uno al nueve)
                                    $xsub = Funciones::subfijo($xaux);
                                    $xcadena = " " . $xcadena . " " . $xseek . " " . $xsub;
                                } // ENDIF (substr($xaux, 2, 1) < 1)
                                break;
                        } // END SWITCH
                    } // END FOR
                    $xi = $xi + 3;
                } // ENDDO
         
                if (substr(trim($xcadena), -5, 5) == "ILLON") // si la cadena obtenida termina en MILLON o BILLON, entonces le agrega al final la conjuncion DE
                    $xcadena.= " DE";
         
                if (substr(trim($xcadena), -7, 7) == "ILLONES") // si la cadena obtenida en MILLONES o BILLONES, entoncea le agrega al final la conjuncion DE
                    $xcadena.= " DE";
         
                // ----------- esta línea la puedes cambiar de acuerdo a tus necesidades o a tu país -------
                if (trim($xaux) != "") {
                    switch ($xz) {
                        case 0:
                            if (trim(substr($XAUX, $xz * 6, 6)) == "1")
                                $xcadena.= "UN BILLON ";
                            else
                                $xcadena.= " BILLONES ";
                            break;
                        case 1:
                            if (trim(substr($XAUX, $xz * 6, 6)) == "1")
                                $xcadena.= "UN MILLON ";
                            else
                                $xcadena.= " MILLONES ";
                            break;
                        case 2:
                            if ($xcifra < 1) {
                                $xcadena = "CERO Y $xdecimales/100 SOLES";
                            }
                            if ($xcifra >= 1 && $xcifra < 2) {
                                $xcadena = "UN Y $xdecimales/100 SOLES ";
                            }
                            if ($xcifra >= 2) {
                                $xcadena.= " Y $xdecimales/100 SOLES "; //
                            }
                            break;
                    } // endswitch ($xz)
                } // ENDIF (trim($xaux) != "")
                // ------------------      en este caso, para México se usa esta leyenda     ----------------
                $xcadena = str_replace("VEINTI ", "VEINTI", $xcadena); // quito el espacio para el VEINTI, para que quede: VEINTICUATRO, VEINTIUN, VEINTIDOS, etc
                $xcadena = str_replace("  ", " ", $xcadena); // quito espacios dobles
                $xcadena = str_replace("UN UN", "UN", $xcadena); // quito la duplicidad
                $xcadena = str_replace("  ", " ", $xcadena); // quito espacios dobles
                $xcadena = str_replace("BILLON DE MILLONES", "BILLON DE", $xcadena); // corrigo la leyenda
                $xcadena = str_replace("BILLONES DE MILLONES", "BILLONES DE", $xcadena); // corrigo la leyenda
                $xcadena = str_replace("DE UN", "UN", $xcadena); // corrigo la leyenda
            } // ENDFOR ($xz)
            return trim($xcadena);
        }
 
// END FUNCTION
 
    public static function subfijo($xx)
    { // esta función regresa un subfijo para la cifra
        $xx = trim($xx);
        $xstrlen = strlen($xx);
        if ($xstrlen == 1 || $xstrlen == 2 || $xstrlen == 3)
            $xsub = "";
        //
        if ($xstrlen == 4 || $xstrlen == 5 || $xstrlen == 6)
            $xsub = "MIL";
        //
        return $xsub;
    }


    public static function imprimeJSON($estado, $mensaje, $datos){
        //header("HTTP/1.1 ".$estado." ".$mensaje);
        header("HTTP/1.1 ".$estado);
        header('Content-Type: application/json');
       // $response["estado"] = $estado;
        //$response["mensaje"]   = $mensaje;
       // $response["datos"]  = $datos;
    
        echo json_encode($datos);
    }

     public static function mensaje($mensaje, $tipo, $archivoDestino="", $tiempo=0) {
            $estiloMensaje = "";
            
            if ($archivoDestino==""){
                $destino = "javascript:window.history.back();";
            }else{
                $destino = $archivoDestino;
            }
            
            $menuEntendido = '<div><a href="'.$destino.'">Entendido</a></div>';
            
            
            if ($tiempo==0){
                $tiempoRefrescar = 5;
            }else{
                $tiempoRefrescar = $tiempo;
            }
            
            switch ($tipo) {
                case "s":
                    $estiloMensaje = "alert callout-success";
                    $titulo = "Hecho";
                    break;
                
                case "i":
                    $estiloMensaje = "callout-info";
                    $titulo = "Información";
                    break;
                
                case "a":
                    $estiloMensaje = "callout-warning";
                    $titulo = "Cuidado";
                    break;
                
                case "e":
                    $estiloMensaje = "callout-danger";
                    $titulo = "Error";
                    break;

                default:
                    $estiloMensaje = "callout-info";
                    $titulo = "Información";
                    break;
            }
            
            $html_mensaje = '
                    <html>
                        <head>
                            <title>Mensaje del sistema</title>
                            <meta charset="utf-8">
                            <meta http-equiv="refresh" content="'.$tiempoRefrescar.';'.$destino.'">
                                
                            <link href="../util/bootstrap/css/bootstrap.css" rel="stylesheet" type="text/css" />
                            <!-- Theme style -->
                            <link href="../util/lte/css/AdminLTE.css" rel="stylesheet" type="text/css" />
    
    
                        </head>
                        <body>
                            <div class="containter">
                                <section class="content">
                                    <div class="callout '.$estiloMensaje.'">
                                        <h4>'.$titulo.'!</h4>
                                        <p>'.$mensaje.'</p>
                                    </div>
                                    '.$menuEntendido.'
                                </section>
                        </body>
                    </html>
                ';
            
            echo $html_mensaje;
            
            exit;
            
    }

    public static function enviarCorreo($asunto,$cuerpo,$de,$para){                 
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-type: text/html; charset=utf-8\r\n";
            $headers .= "From: ".trim($de);   
            if (mail(trim($para),$asunto,$cuerpo,$headers)){
                $registros["estado"] = 200;  
                $registros["mensaje"] = 'Mensaje enviado';  
            } else {
                $registros["estado"] = 500;  
                $registros["mensaje"] = "Problema al enviar correo";  
                
            }
            return $registros;
   }



}      
  
 
