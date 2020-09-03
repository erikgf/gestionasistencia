<?php

require_once '../datos/Conexion.clase.php';
date_default_timezone_set('America/Lima');

class ActualizadorAppLabor extends Conexion {

    public function actualizarDatos(){
        try {
            $contador_registros  = 0;

             $sql = "SELECT 
                    u.dni,
                    COALESCE(u.nombres_apellidos, p.nombres_apellidos, u.usuario) as nombres_apellidos,
                    u.usuario,
                    u.clave
                    FROM usuario u
                    LEFT JOIN personal p ON p.dni = u.dni
                    ";
            $usuarios =  $this->consultarFilas($sql);
            $contador_registros += count($usuarios);

            $sql = "SELECT 
                    idcultivo,
                    descripcion,
                    dni_responsable
                    FROM cultivo";
            $cultivos =  $this->consultarFilas($sql);
            $contador_registros += count($cultivos);

            $sql = "SELECT 
                    idcultivo,
                    dni_responsable
                    FROM cultivo_usuario";
            $cultivo_usuarios =  $this->consultarFilas($sql);
            $contador_registros += count($cultivo_usuarios);

            $sql = "SELECT 
                        dni,
                        nombres_apellidos
                        FROM personal
                        WHERE estado_mrcb";

            $personal =  $this->consultarFilas($sql);
            $contador_registros += count($personal);

            $sql = "SELECT 
                        idturno,
                        descripcion,
                        hora_entrada,
                        hora_salida
                        FROM turno";

            $turnos =  $this->consultarFilas($sql);
            $contador_registros += count($turnos);

            $sql = "SELECT 
                        idcampo,
                        descripcion
                        FROM campo";

            $campos =  $this->consultarFilas($sql);
            $contador_registros += count($campos);

            $sql = "SELECT 
                    idlote, descripcion, idcampo, idcultivo
                    FROM lote";
            $lotes =  $this->consultarFilas($sql);
            $contador_registros += count($lotes);

            $sql = "SELECT 
                    idlabor, descripcion, idcultivo
                    FROM labor";
            $labores =  $this->consultarFilas($sql);
            $contador_registros += count($labores);

            return array("rpt"=>true,"data"=>["usuarios"=>$usuarios,
                                                "campos"=>$campos,
                                                "lotes"=>$lotes,
                                                "labores"=>$labores,
                                                "turnos"=>$turnos,
                                                    "cultivos"=>$cultivos,
                                                    "cultivousuarios"=>$cultivo_usuarios,
                                                        "personal"=>$personal,
                                                            "contador_registros"=>$contador_registros]);

        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    } 

    public function sincronizarDiarioDatos(){
        try {
            $contador_registros  = 0;

             $sql = "SELECT 
                    rcc.fecha_dia,
                    rcc.idcultivo,
                    rcd.dni_personal,
                    rcd.idlote,
                    rcd.idlabor,
                    rcd.idturno,
                    'E' as tipo_acceso,
                    rcd.numero_acceso,
                    rcd.fecha_hora_registro as hora_registro,
                    '0' pareado,
                    '3' as estado_envio
                    FROM `registro_control_cabecera` rcc
                    LEFT JOIN registro_control_detalle rcd ON rcc.id_cabecera = rcd.id_cabecera
                    WHERE rcc.fecha_dia = current_date AND rcd.tipo_acceso = 'E' AND rcd.procesado_porcentaje = 0;
                    ";
            $registros_entradas =  $this->consultarFilas($sql);
            $contador_registros += count($registros_entradas);

            $sql = "SELECT 
                    rcd.dni_personal
                    FROM `registro_control_cabecera` rcc
                    LEFT JOIN registro_control_detalle rcd ON rcc.id_cabecera = rcd.id_cabecera
                    WHERE rcc.fecha_dia = current_date AND rcd.tipo_acceso = 'E' AND rcd.procesado_porcentaje = 0";
            $dnis = $this->consultarFilas($sql);

            $cadena_dni = "";
            
            if (count($dnis) > 0){
                 $cadena_dni = "(";
                foreach ($dnis as $key => $value) {
                    $cadena_dni .= "'".$value["dni_personal"]."',";
                }
                
                $cadena_dni = substr_replace($cadena_dni ,"", -1);  
               
                $cadena_dni .= ")";  
            }
           

            return array("rpt"=>true,"data"=>["registroentradas"=>$registros_entradas,
                                                    "cadena_dni"=>$cadena_dni,
                                                    "contador_registros"=>$contador_registros]);

        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    } 

    public function enviarDatos($JSONData){
        try {

            $objArreglosDatos = json_decode($JSONData);
            $this->beginTransaction();

            $idRegistroCabecera = $this->consultarValor("SELECT COALESCE(MAX(id_cabecera)+1, 1) FROM registro_control_cabecera");
            $idRegistroDetalle = $this->consultarValor("SELECT COALESCE(MAX(id_detalle)+1, 1) FROM registro_control_detalle");

            $sql = "";
            $objCabecera;



            foreach ($objArreglosDatos as $key => $objCultivo) {
                $objCabecera = $objCultivo->cabecera;
                $objDetalle = $objCultivo->detalle;

                    $campos_valores = [
                            "id_cabecera"=>$idRegistroCabecera,
                            "fecha_dia"=>$objCabecera->fecha_dia_envio,
                            "usuario_envio"=>$objCabecera->usuario_envio,
                            "idmovil"=>$objCabecera->idmovil,
                            "idcultivo"=> $objCabecera->idcultivo
                        ];

                    $this->insert("registro_control_cabecera", $campos_valores);

                    $sql .= " INSERT INTO registro_control_detalle(id_detalle, id_cabecera, dni_personal, idturno, fecha_hora_registro,idlote, idlabor, hora_extra, tipo_acceso, numero_acceso, modo_trabajo) VALUES ";

                    foreach ($objDetalle as $key => $detalle) {
                        $sql .= " ( ";
                        $sql .= $idRegistroDetalle.", ";
                        $sql .= $idRegistroCabecera.", ";
                        $sql .= "'".$detalle->dni_personal."', ";
                        $sql .= "'".$detalle->idturno."', ";
                        $sql .= "'".$detalle->hora_registro."', ";
                        $sql .= "'".$detalle->idlote."', ";
                        $sql .= "'".$detalle->idlabor."', ";
                        $sql .= ($detalle->hora_extra == "" ? 0 : $detalle->hora_extra).", ";
                        $sql .= "'".$detalle->tipo_acceso."', ";
                        $sql .= ($detalle->numero_acceso == "" ? 1 : $detalle->numero_acceso).", ";
                        $sql .= ($detalle->modo_trabajo == "" ? 'NULL' : "'".$detalle->modo_trabajo."'");
                        $sql .= "),";

                        $idRegistroDetalle++;
                    }


                $sql = substr_replace($sql ,";", -1);

                $idRegistroCabecera++;
            }


            $this->consulta_raw($sql);

            $sql = "SELECT t.dni_personal, t.id_cabecera, t.modo_trabajo, 
                            SUM(t.hora_extra) as hora_extra, 
                            GROUP_CONCAT(CONCAT(t.horas) SEPARATOR '_') as horas 
                            FROM 
                            (SELECT dni_personal, rcd.id_cabecera, numero_acceso, COUNT(dni_personal) as registros, GROUP_CONCAT(modo_trabajo) as modo_trabajo, 
                                sum(hora_extra) as hora_extra, 
                                GROUP_CONCAT(CONCAT(DATE_FORMAT(rcd.fecha_hora_registro, '%H:%i:%s'),'|', tipo_acceso) ORDER BY rcd.fecha_hora_registro) as horas 
                                FROM registro_control_detalle rcd 
                                LEFT JOIN registro_control_cabecera rcc ON rcd.id_cabecera = rcc.id_cabecera 
                                WHERE rcc.fecha_dia = :0
                                GROUP BY dni_personal, numero_acceso 
                                HAVING registros >= 2 
                                ORDER BY dni_personal, rcd.numero_acceso, rcd.fecha_hora_registro) t 
                            GROUP BY t.dni_personal";

            $registrosES = $this->consultarFilas($sql, [$objCabecera->fecha_dia_envio]);

            //var_dump($objCabecera->fecha_dia_envio, $sql);
            if (count($registrosES) > 0){
                $sqlUpdate = "";
                    foreach ($registrosES as $key => $value) {
                                $porcentaje = 0.00;
                                $acumuladoPorcentaje = 0.00;

                                $dni_personal = $value["dni_personal"];
                                $id_cabecera = $value["id_cabecera"];
                                $hora_extra = $value["hora_extra"];
                                $modo_trabajo_real = explode(",",$value["modo_trabajo"]);
                                $esJornal = false;

                                foreach ($modo_trabajo_real as $___k => $___v) {
                                    if ($___v == "J"){
                                        $esJornal = true;
                                        break;
                                    }
                                }

                                $horas = $value["horas"];
                                $n_accesos = explode("_", $horas);

                                $numero_acceso = 1;
                                $cantidadPareados = count($n_accesos);
                                $totalHorasTrabajadas = 0;

                                foreach ($n_accesos as $k_ => $v_) {/*conjunto de EYS EYS EYS*/
                                    $n_pareados  = explode(",",$v_);
                                    if ($esJornal){
                                        $ingreso; $salida;
                                        foreach ($n_pareados as $k__ => $v__) { /*EYS*/
                                            $n_registros = explode("|", $v__);
                                            if ($n_registros[1] == "E"){
                                                $ingreso = $n_registros[0];
                                            } else {
                                                $salida = $n_registros[0];
                                            }
                                        }

                                        $to_time = strtotime($ingreso);
                                        $from_time = strtotime($salida);
                                        $ms = $from_time - $to_time;
                                        $horasTrabajadas = round($ms / 3600,1); 

                                        //var_dump("horas: ",$horasTrabajadas,"\n");
                                        $totalHorasTrabajadas += $horasTrabajadas; 
                                        $porcentaje = round($horasTrabajadas / 8,3);

                                        $acumuladoPorcentaje += $porcentaje;

                                        if ($acumuladoPorcentaje >= 1){
                                            $porcentaje = (1 - ($acumuladoPorcentaje - $porcentaje));
                                        }

                                        //var_dump($dni_personal,$numero_acceso, $n_accesos,"___\n");
                                        //var_dump("K", $k_);
                                        /*
                                        if ($k_ >= ($cantidadPareados - 1)){
                                            $porcentaje = 1 - $acumuladoPorcentaje;
                                        }
                                        */
                                        //var_dump("%",$porcentaje);
                                        //var_dump("%ACUM",$acumuladoPorcentaje);

                                        //var_dump("JORNAL: ",$esJornal);

                                        $sqlUpdate .= " UPDATE registro_control_detalle SET procesado_porcentaje = procesado_porcentaje + 1, porcentaje = ".$porcentaje."
                                                            WHERE dni_personal = '".$dni_personal."' AND numero_acceso = ".$numero_acceso." AND DATE(fecha_hora_registro) = '".$objCabecera->fecha_dia_envio."';";    

                                    }

                                    if ($hora_extra == "1"){
                                        $cantidad_horas_extra = round($totalHorasTrabajadas - 8,1);
                                        $sqlUpdate .= " INSERT INTO registro_horas_extra(dni_personal, fecha_dia, cantidad_horas) 
                                                        VALUES ('".$dni_personal."','".$objCabecera->fecha_dia_envio."',".$cantidad_horas_extra."); ";
                                    }

                                }

                            if (!$esJornal){
                                $porcentaje = round(1 / $cantidadPareados,3);

                                $sqlUpdate .= " UPDATE registro_control_detalle SET procesado_porcentaje = procesado_porcentaje + 1, porcentaje = ".$porcentaje."
                                                        WHERE dni_personal = '".$dni_personal."' AND DATE(fecha_hora_registro) = '".$objCabecera->fecha_dia_envio."'; ";    
                            }
                        $numero_acceso++;
                    }

                $this->consulta_raw($sqlUpdate);
                      
            }

            
            $this->commit();
            return array("rpt"=>true,"msj"=>"Data recibida correctamente.");
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function masterKey(){
        try {
            $masterKey = md5('123456');
            return array("rpt"=>true,"data"=>$masterKey);

        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
        }
    }
}
