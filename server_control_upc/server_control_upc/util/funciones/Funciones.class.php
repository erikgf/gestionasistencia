<?php

class Funciones {
    public static $DIRECTORIO_PRINCIPAL = "comercial";
        
    public static function generarHTMLReporte($htmlDatos) {
        $html = '
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <link rel="stylesheet" href="'.$_SERVER["HTTP_ORIGIN"].'/'.Funciones::$DIRECTORIO_PRINCIPAL.'/vista/css/reporte.css"/>
                        </head>
                        <body>';

        $html .= $htmlDatos;
        $html .= "</body>";
        $html .= "</html>";

        return $html;
    }
    
    public static function generaPDF($file='', $html='', $paper='a4', $download=false) {
        require_once '../util/dompdf/dompdf_config.inc.php';

        $dompdf = new DOMPDF();
        $dompdf->set_paper($paper);
        $dompdf->load_html( utf8_decode($html));
        ini_set("memory_limit","32M");
        $dompdf->render();
        file_put_contents($file, $dompdf->output());

        if ($download){
            $dompdf->stream($file);
        }
    }

    public static function generarReporte($html_reporte, $tipo_reporte, $nombre_archivo="reporte"){
        if ($tipo_reporte == 1){
            echo $html_reporte;
        }else if ( $tipo_reporte == 2 ){
            $archivo_pdf = "../reportes/".$nombre_archivo.".pdf";
            Funciones::generaPDF($archivo_pdf, $html_reporte);
            header("location:".$archivo_pdf);
        }else{
            header("Content-type: application/vnd.ms-excel; name='excel'");
            header("Content-Disposition: filename=".$nombre_archivo.".xls");
            header("Pragma: no-cache");
            header("Expires: 0");

            echo $html_reporte;
        }
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
}
