<?php

require_once '../datos/Conexion.clase.php';

class Campaña extends Conexion {
    private $cod_campaña;
    private $cod_nisira;
    private $cod_siembra;
    private $area;
    private $descripcion;
    private $año;
    private $fecha_campaña_inicio;
    private $fecha_campaña_fin;

    private $tbl = "campaña";

    public function getCodSiembra()
    {
        return $this->cod_siembra;
    }
    
    
    public function setCodSiembra($cod_siembra)
    {
        $this->cod_siembra = $cod_siembra;
        return $this;
    }

    public function getCodCampaña()
    {
        return $this->cod_campaña;
    }
    
    
    public function setCodCampaña($cod_campaña)
    {
        $this->cod_campaña = $cod_campaña;
        return $this;
    }

    public function getCodNisira()
    {
        return $this->cod_nisira;
    }
    
    
    public function setCodNisira($cod_nisira)
    {
        $this->cod_nisira = $cod_nisira;
        return $this;
    }

    public function getArea()
    {
        return $this->area;
    }
    
    
    public function setArea($area)
    {
        $this->area = $area;
        return $this;
    }

    public function getDescripcion()
    {
        return $this->descripcion;
    }
    
    
    public function setDescripcion($descripcion)
    {
        $this->descripcion = $descripcion;
        return $this;
    }

    public function getAño()
    {
        return $this->año;
    }
    
    
    public function setAño($año)
    {
        $this->año = $año;
        return $this;
    }

    public function getFechaCampañaInicio()
    {
        return $this->fecha_campaña_inicio;
    }
    
    
    public function setFechaCampañaInicio($fecha_campaña_inicio)
    {
        $this->fecha_campaña_inicio = $fecha_campaña_inicio;
        return $this;
    }

    public function getFechaCampañaFin()
    {
        return $this->fecha_campaña_fin;
    }
    
    
    public function setFechaCampañaFin($fecha_campaña_fin)
    {
        $this->fecha_campaña_fin = $fecha_campaña_fin;
        return $this;
    }

    public function obtenerCampos(){
        try {
            $sql = "SELECT cod_campo, nombre_campo FROM campo WHERE estado_mrcb";
            $campos = $this->consultarFilas($sql);

            return array("rpt"=>true,"data"=>$campos);
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
        }
    }

    public function obtenerCampañasActivas(){
        try {
            
            $sql = "SELECT ca.cod_campaña, cp.nombre_campo, ca.numero_campaña, fecha_campaña_inicio , fecha_campaña_fin 
                        FROM campaña ca
                        INNER JOIN siembra si ON si.cod_siembra = ca.cod_siembra
                        INNER JOIN campo cp ON cp.cod_campo = si.cod_campo
                        WHERE ca.estado_activo";

            $campañas = $this->consultarFilas($sql);

            return array("rpt"=>true,"data"=>$campañas);
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
        }
    }

    public function obtenerParcelasParaLiberacionNuevo($fechaInicio, $fechaFin){
        try {
            
            $sql = "SELECT ca.cod_campaña, cp.nombre_campo, ca.numero_campaña, fecha_campaña_inicio , fecha_campaña_fin 
                        FROM campaña ca
                        INNER JOIN siembra si ON si.cod_siembra = ca.cod_siembra
                        INNER JOIN campo cp ON cp.cod_campo = si.cod_campo
                        WHERE ca.estado_activo = true";

            $campañas = $this->consultarFilas($sql);

            return array("rpt"=>true,"data"=>$campañas);
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
        }
    }

    public function obtenerParcelas(){
        try {
            $sql = "SELECT 
                        p.cod_parcela,
                        ca.cod_nisira as idconsumidor,
                        si.cod_nisira as idsiembra,
                        cp.cod_nisira as idcampaña,
                        rotulo_parcela,
                        p.area,
                        c.nombre as cultivo,
                        v.nombre  as variedad,
                        to_char(p.fecha_inicio_campaña,'DD-MM-YYYY') as inicio_campaña,
                        to_char(p.fecha_fin_campaña,'DD-MM-YYYY') as fin_campaña,
                        (CASE p.estado_activo WHEN true THEN 'ACTIVO' ELSE 'INACTIVO' END) as estado
                        FROM parcela p
                        LEFT JOIN campaña cp ON cp.cod_campaña = p.cod_campaña
                        LEFT JOIN siembra si ON si.cod_siembra = cp.cod_siembra
                        LEFT JOIN campo ca ON ca.cod_campo = si.cod_campo
                        LEFT JOIN variedad v ON v.cod_variedad  = p.cod_variedad
                        LEFT JOIN cultivo c ON c.cod_cultivo = v.cod_cultivo
                        WHERE cp.cod_campaña = :0 AND p.estado_mrcb
                        ORDER BY  
                            numero_nivel_1, 
                            numero_nivel_2,
                            NULLIF(regexp_replace(numero_nivel_3, '\D', '', 'g'), '')::integer";

            $data = $this->consultarFilas($sql, [$this->getCodCampaña()]);

            return array("rpt"=>true,"data"=>$data);
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
        }
    }

    public function listarCampañas(){
        try {
              $sql = "SELECT s.cod_siembra, 
                        c.cod_nisira as idcampaña,
                        s.cod_nisira as idsiembra,
                        cp.cod_nisira as idconsumidor,
                        to_char(fecha_campaña_inicio,'DD/MM/YYYY')  as inicio_campaña,
                        to_char(fecha_campaña_fin,'DD/MM/YYYY') as  fin_campaña,
                        año,
                        descripcion,
                        c.area,
                        (CASE c.estado_activo WHEN true THEN 'ACTIVO' ELSE 'INACTIVO' END) as estado
                        FROM campaña c
                        INNER JOIN siembra s ON c.cod_siembra = s.cod_siembra
                        INNER JOIN campo cp ON cp.cod_campo = s.cod_campo
                        WHERE s.estado_mrcb AND c.cod_siembra = :0
                        ORDER BY s.cod_siembra";

            $data = $this->consultarFilas($sql, $this->getCodSiembra());
            return ["rpt"=>true, "data"=>$data];
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function darBaja(){
        try {

            $campos_valores = ["estado_mrcb"=>"false"];
            $campos_valores_where = ["cod_siembra"=>$this->getCodSiembra()];
            $this->update("siembra", $campos_valores, $campos_valores_where);

            $obj = obtenerCodYListar();
            if ($obj["rpt"] == false){
                return $obj;
            }
            $campañas = $obj["data"];

            return ["rpt"=>true, "msj"=>"Registro dado de baja correctamente.", "data"=>$campañas];
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function finalizar(){
        try {

            $campos_valores = ["estado_activo"=>"false"];
            $campos_valores_where = ["cod_campaña"=>$this->getCodCampaña()];

            $this->update("campaña", $campos_valores, $campos_valores_where);

            $obj = obtenerCodYListar();
            if ($obj["rpt"] == false){
                return $obj;
            }
            $campañas = $obj["data"];

            return ["rpt"=>true, "msj"=>"Registro dado de baja correctamente.", "data"=>$campañas];
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function leerEditar(){
        try {
             $sql = "SELECT 
                        c.cod_campaña,
                        c.cod_nisira as idcampaña,
                        s.cod_nisira as idsiembra,
                        c.cod_siembra, 
                        año,
                        c.area,
                        descripcion,
                        fecha_campaña_inicio as fecha_inicio,
                        fecha_campaña_fin as fecha_fin,
                        (CASE c.estado_activo WHEN true THEN 'ACTIVO' ELSE 'INACTIVO' END) as estado
                        FROM campaña c
                        INNER JOIN siembra s ON s.cod_siembra = c.cod_siembra
                        WHERE c.estado_mrcb AND c.cod_campaña = :0";
            $data = $this->consultarFila($sql, $this->getCodCampaña());

            return ["rpt"=>true, "data"=>$data];
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    private function seter($tipoAccion){
        //TipoAccion => + agregar, * editar, - eliminar
        $campos_valores = []; 
        $campos_valores_where = [];

        if ($tipoAccion != "-"){

            $campos_valores = [ "cod_nisira"=>$this->getCodNisira(),
                                "cod_siembra"=>$this->getCodSiembra(),
                                "año"=>$this->getAño(),
                                "descripcion"=>$this->getDescripcion(),
                                "area"=>$this->getArea(),
                                "fecha_campaña_inicio"=>$this->getFechaCampañaInicio(),
                                "fecha_campaña_fin"=>$this->getFechaCampañaFin()
                                ];      

            if ($tipoAccion == "+"){
                $campos_valores["cod_campaña"] = $this->getCodCampaña();
            }
        }

        if ($tipoAccion != "+"){
            $campos_valores_where = ["cod_campaña"=>$this->getCodCampaña()];

            if ($tipoAccion == "-"){
                $campos_valores = ["estado_mrcb"=>"false"];
            }
        }

        $campos = ["valores"=>$campos_valores,"valores_where"=>$campos_valores_where];
        return $campos;
    }

    public function agregar() {
        try {     
            $this->beginTransaction();

            $objVerificar = $this->verificarRepetidoAgregar(); 
            if (!$objVerificar["r"]){
                return $objVerificar;
            }

            $this->setCodCampaña($this->consultarValor("SELECT COALESCE(MAX(cod_campaña)+1, 1) FROM campaña"));

            $campos = $this->seter("+");

            $this->insert($this->tbl, $campos["valores"]);

            $this->commit();

            $obj = $this->obtenerCodYListar();
            if ($obj["rpt"] == false){
                return $obj;
            }
            $campañas = $obj["data"];
            return array("rpt"=>true,"msj"=>"Se ha registrado exitosamente", "data"=>$campañas);
        } catch (Exception $exc) {
            $this->rollBack();
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function editar() {
        try { 
            $this->beginTransaction();

            $objVerificar = $this->verificarRepetidoEditar(); 
            if (!$objVerificar["r"]){
                return $objVerificar;
            }
        
            $campos = $this->seter("*");
            $this->update($this->tbl, $campos["valores"], $campos["valores_where"]);

            $this->commit();

            $obj = $this->obtenerCodYListar();
            if ($obj["rpt"] == false){
                return $obj;
            }
            $campañas = $obj["data"];

            return array("rpt"=>true,"msj"=>"Se ha editado exitosamente", "data"=>$campañas);
        } catch (Exception $exc) {
            $this->rollBack();
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    private function verificarRepetidoAgregar(){
        if ($this->getCodNisira() != NULL && $this->getCodNisira() != ""){
            $sql = "SELECT COUNT(cod_nisira) > 0 FROM ".$this->tbl." WHERE cod_nisira = :0 AND cod_siembra = :1 AND estado_mrcb";
            $repetido = $this->consultarValor($sql, [$this->getCodNisira(), $this->getCodSiembra()]);

            if ($repetido){
                return ["r"=>false, "msj"=>"ID Campaña ya existente."];
            }
        }

        /*VERIFICAR QEU LAA FECHA ESTE EN EL RANGO ADECUADO mayor igual y si hay fecha fin, neor igual.*/
        $sql = "SELECT DATE(fecha_inicio_siembra) <= :0 FROM siembra WHERE cod_siembra = :1";
        $fechaSiembraDentro = $this->consultarValor($sql, [$this->getFechaCampañaInicio(), $this->getCodSiembra()]);
        if ($fechaSiembraDentro == false){
         return ["r"=>false, "msj"=>"La fecha de inicio de CAMPAÑA debe ser MAYOR que la fecha de SIEMBRA."];
        }

        if ($this->getFechaCampañaFin() != NULL){
            $sql = "SELECT DATE(fecha_fin_siembra) >= :0 FROM siembra WHERE cod_siembra = :1";
            $fechaSiembraDentro = $this->consultarValor($sql, [$this->getFechaCampañaFin(), $this->getCodSiembra()]);
            if ($fechaSiembraDentro == false){
                return ["r"=>false, "msj"=>"La fecha de fin de CAMPAÑA debe ser MENOR que la fecha de SIEMBRA."];
            }

            $rangoFechaCorrecta = $this->consultarValor("SELECT DATE(:0) <= DATE(:1)", [$this->getFechaCampañaInicio(), $this->getFechaCampañaFin()]);
            if ($rangoFechaCorrecta == false){
                  return ["r"=>false, "msj"=>"La fecha final debe ser MENOR que la fecha inicio."];
            }
        }

        return ["r"=>true, "msj"=>""];
    }

    private function verificarRepetidoEditar(){

        if ($this->getCodNisira() != NULL && $this->getCodNisira() != ""){
            $sql = "SELECT COUNT(cod_nisira) > 0 FROM ".$this->tbl." WHERE cod_nisira = :0  AND cod_siembra = :1 AND cod_campaña <>:2 AND estado_mrcb";
            $repetido = $this->consultarValor($sql, [$this->getCodNisira(), $this->getCodSiembra(), $this->getCodCampaña()]);

            if ($repetido){
                return ["r"=>false, "msj"=>"ID Campaña ya existente."];
            }
        }
    
        /*VERIFICAR QEU LAA FECHA ESTE EN EL RANGO ADECUADO mayor igual y si hay fecha fin, neor igual.*/
        $sql = "SELECT DATE(fecha_inicio_siembra) <= :0 FROM siembra WHERE cod_siembra = :1";
        $fechaSiembraDentro = $this->consultarValor($sql, [$this->getFechaCampañaInicio(), $this->getCodSiembra()]);
        if ($fechaSiembraDentro == false){
                  return ["r"=>false, "msj"=>"La fecha de inicio de CAMPAÑA debe ser MAYOR que la fecha de SIEMBRA."];
        }

        if ($this->getFechaCampañaFin() != NULL){
            $sql = "SELECT DATE(fecha_fin_siembra) >= :0 FROM siembra WHERE cod_siembra = :1";
            $fechaSiembraDentro = $this->consultarValor($sql, [$this->getFechaCampañaFin(), $this->getCodSiembra()]);
            if ($fechaSiembraDentro == false){
                return ["r"=>false, "msj"=>"La fecha de fin de CAMPAÑA debe ser MENOR que la fecha de SIEMBRA."];
            }

            $rangoFechaCorrecta = $this->consultarValor("SELECT DATE(:0) <= DATE(:1)", [$this->getFechaCampañaInicio(), $this->getFechaCampañaFin()]);
            if ($rangoFechaCorrecta == false){
                  return ["r"=>false, "msj"=>"La fecha final debe ser MENOR que la fecha inicio."];
            }
        }

        return ["r"=>true, "msj"=>""];
    }

    private function obtenerCodYListar(){
        $cod  = $this->consultarValor("SELECT cod_siembra FROM campaña WHERE cod_campaña = :0", [$this->getCodCampaña()]);
        $this->setCodSiembra($cod);

        return $this->listarCampañas();
    }

    public function obtenerPreFormulario($codCampo) {
        try { 
            /*ultima siembra, ultima campaña de esa siembra y ultima rea de esa campaña*/
             $sql  = "SELECT  si.cod_siembra, ca.area
                        FROM campo ca 
                        LEFT JOIN  siembra si ON ca.cod_campo = si.cod_campo
                        WHERE ca.cod_campo = :0
                        LIMIT 1";

             $dataSiembra = $this->consultarFila($sql, $codCampo);
             $data = [];

             if ($dataSiembra["cod_siembra"] == NULL){
                $data["cod_siembra"] = $dataSiembra["cod_siembra"];
                $data["idcampaña_siguiente"] = $dataSiembra["idcampaña_siguiente"];
                $data["area"] = $dataSiembra["area"];
             } else {
                $sql = "SELECT LPAD((cod_nisira::integer + 1)::text,3,'0') as idcampaña_siguiente, area, cod_siembra
                        FROM 
                        campaña 
                        WHERE cod_siembra = :0
                        LIMIT 1";                    
                $dataCampaña = $this->consultarFila($sql, $dataSiembra["cod_siembra"]);

                if ($dataCampaña["idcampaña_siguiente"] == NULL){
                    $data["area"] = $dataSiembra["area"];
                    $data["idcampaña_siguiente"] = "001";
                    $data["cod_siembra"] = $dataSiembra["cod_siembra"];
                }
             }

            return ["rpt"=>true, "data"=>$data];
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
        }
    }
    
}

    