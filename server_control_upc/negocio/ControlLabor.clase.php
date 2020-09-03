<?php

require_once '../datos/Conexion.clase.php';

class ControlLabor extends Conexion {

    public function listarFechas($fechaInicio, $fechaFin){
        try {
            
            $sql = "SELECT 
            distinct(fecha_dia) as fecha_raw, 
            DATE_FORMAT(fecha_dia,'%d-%m-%Y') as fecha,
            (SELECT COUNT(*) > 0 FROM registro_horas_extra rhex
              INNER JOIN personal p ON p.dni_personal = rhex.dni_personal
              WHERE rhex.fecha_dia = rcc.fecha_dia AND p.fundo = 'SA') as sa_horas_extras,
            (SELECT COUNT(*) > 0 FROM registro_horas_extra rhey
              INNER JOIN personal p ON p.dni_personal = rhey.dni_personal
              WHERE rhey.fecha_dia = rcc.fecha_dia AND p.fundo = 'SM') as sm_horas_extras
            FROM registro_control_cabecera rcc
            WHERE fecha_dia >= :0 AND fecha_dia <= :1
            ORDER BY fecha_dia;";
            $listaFechas = $this->consultarFilas($sql, [$fechaInicio, $fechaFin]);

            return array("rpt"=>true,"data"=>$listaFechas);

        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
        }
    }  


    public function listarFechasDetalle($fundo, $fecha, $fechaInicio, $fechaFin){
        try {
            /*con la fecha enviar el formato pertinente
    FECHA   LABOR   TURNO   DNI CENTRO DE COSTO CANTIDAD    %   OBSERVACION     LOTE    APELLIDOS Y NOMBRES CULTIVO DESCRIPCION DE LABOR
            */
          $params = [];

            if ($fecha == "*"){
              $params = [$fechaInicio, $fechaFin];
              $sqlFecha = " (cab.fecha_dia >= :0 AND cab.fecha_dia <= :1) ";
            } else {
              $params = [$fecha];
              $sqlFecha = " cab.fecha_dia = :0 ";
            }

           $sql = "SELECT
                   DATE_FORMAT(t_.fecha_dia,'%d/%m/%Y') as fecha,
                   t_.fecha_dia as fecha_raw,
                   l.idlabor as labor,
                   t_.idturno as turno,
                   t_.dni_personal as dni,
                   lot.cod_ceco as centro_costo,
                   '0' as cantidad,
                   t_.porcentaje,
                   lot.descripcion as observacion,
                   lot.descripcion as lote,
                   p.nombres_apellidos as apellidos_nombres,
                   cul.descripcion as cultivo,
                   l.descripcion as descripcion_labor
                    FROM
                    (SELECT
                        cab.fecha_dia, cab.idcultivo, det.dni_personal, det.idturno, det.idlabor, det.idlote, det.porcentaje, COUNT(tipo_acceso) as numero_accesos
                        FROM registro_control_detalle det
                        LEFT JOIN registro_control_cabecera cab ON cab.id_cabecera = det.id_cabecera
                        LEFT JOIN personal p_ ON p_.dni_personal = det.dni_personal
                        WHERE ".$sqlFecha." AND p.fundo = '".$fundo."'
                        GROUP BY cab.fecha_dia, det.dni_personal, det.numero_acceso
                        HAVING numero_accesos >= 1
                        ORDER BY cab.fecha_dia, det.dni_personal, det.numero_acceso) t_
                       LEFT JOIN lote lot ON lot.idlote = t_.idlote AND lot.idcultivo = t_.idcultivo
                       LEFT JOIN labor l ON l.idlabor = t_.idlabor AND l.idcultivo = t_.idcultivo
                       LEFT JOIN cultivo cul ON cul.idcultivo = lot.idcultivo
                       LEFT JOIN personal p ON p.dni = t_.dni_personal
                   ORDER BY fecha_raw, dni";
            $lista = $this->consultarFilas($sql, $params);
            
            return array("rpt"=>true,"data"=>$lista);

        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
        }
    }  

    public function listarFechasHorasExtra($fundo, $fecha, $fechaInicio, $fechaFin){
        try {
            /*con la fecha enviar el formato pertinente
        DNI   CECO  FECHA   HORAS
            */
            $params = [];

            if ($fecha == "*"){
              $params = [$fechaInicio, $fechaFin];
              $sqlFecha = " (rcc.fecha_dia >= :0 AND rcc.fecha_dia <= :1) ";
            } else {
              $params = [$fecha];
              $sqlFecha = " rcc.fecha_dia = :0 ";
            }

          $sql = "SELECT 
                    DATE_FORMAT(rhe.fecha_dia,'%d/%m/%Y') as fecha_dia,
                    rhe.fecha_dia as fecha_raw, rhe.dni_personal, rhe.cantidad_horas as horas_extra, l.cod_ceco as centro_costo
                    FROM registro_horas_extra rhe 
                    LEFT JOIN registro_control_cabecera rcc ON rcc.fecha_dia = rhe.fecha_dia
                    LEFT JOIN registro_control_detalle rcd ON rcc.id_cabecera = rcd.id_cabecera AND rhe.dni_personal = rcd.dni_personal
                    LEFT JOIN lote l ON l.idlote = rcd.idlote
                    LEFT JOIN personal p ON p.dni_personal = rcd.dni_personal
                    WHERE p.fundo = '".$fundo."' rcd.hora_extra = 1 AND ".$sqlFecha."
                   ORDER BY fecha_raw, dni_personal";
          $lista = $this->consultarFilas($sql, $params);
            
          return array("rpt"=>true,"data"=>$lista);
        } catch (Exception $exc) {
          return array("rpt"=>false,"msj"=>$exc);
        }
    }  



    public function generarCultivosUsuarios(){
        try {
          
           $sql = "SELECT idcultivo FROM cultivo";
           $cultivos_full = $this->consultarFilas($sql);

           $usuarios_full = ['48018866','70472143','73318073','16800448'];
           $usuarios_riego = ['47061817'];
           $usuarios_banano = ['46176706'];
           $usuarios_otros = ['41845531','43915253'];

           $cultivos_riego =  ['901'];
           $cultivos_banano = ['001','999'];
           $cultivos_otros = ['002','003','004','005','999'];

           $this->beginTransaction();

           $this->delete("cultivo_usuario", null);

           $sqlI = "INSERT INTO cultivo_usuario(idcultivo, dni_responsable) VALUES (:0,:1); ";

           foreach ($usuarios_full as $key => $value) {
             foreach ($cultivos_full as $key_ => $value_) {
                $this->consultarFN($sqlI,[$value_["idcultivo"], $value]);
             }
           }

           foreach ($usuarios_riego as $key => $value) {
             foreach ($cultivos_riego as $key_ => $value_) {
                $this->consultarFN($sqlI,[$value_, $value]);
             }
           }

           foreach ($usuarios_banano as $key => $value) {
             foreach ($cultivos_banano as $key_ => $value_) {
                $this->consultarFN($sqlI,[$value_, $value]);
             }
           }

           foreach ($usuarios_otros as $key => $value) {
             foreach ($cultivos_otros as $key_ => $value_) {
                $this->consultarFN($sqlI,[$value_, $value]);
             }
           }

           $this->commit();
           return array("rpt"=>true);

        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
        }
    }  
 
}
