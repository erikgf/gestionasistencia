<?php

require_once '../datos/Conexion.clase.php';

class Personal extends Conexion {
    private $idpersonal;
    private $dni;
    private $nombres_apellidos;
    private $fecha_ingreso;
    private $fecha_nacimiento;
    private $cussp;
    private $direccion;
    private $idcargo;
    private $agricasa;
    private $estado_mrcb;

    public function getIdpersonal()
    {
        return $this->idpersonal;
    }
    
    
    public function setIdpersonal($idpersonal)
    {
        $this->idpersonal = $idpersonal;
        return $this;
    }

    public function getDni()
    {
        return $this->dni;
    }
    
    
    public function setDni($dni)
    {
        $this->dni = $dni;
        return $this;
    }

    public function getNombresApellidos()
    {
        return $this->nombres_apellidos;
    }
    
    
    public function setNombresApellidos($nombres_apellidos)
    {
        $this->nombres_apellidos = $nombres_apellidos;
        return $this;
    }

    public function getFechaIngreso()
    {
        return $this->fecha_ingreso;
    }
    
    
    public function setFechaIngreso($fecha_ingreso)
    {
        $this->fecha_ingreso = $fecha_ingreso;
        return $this;
    }

    public function getFechaNacimiento()
    {
        return $this->fecha_nacimiento;
    }
    
    
    public function setFechaNacimiento($fecha_nacimiento)
    {
        $this->fecha_nacimiento = $fecha_nacimiento;
        return $this;
    }

    public function getCussp()
    {
        return $this->cussp;
    }
    
    
    public function setCussp($cussp)
    {
        $this->cussp = $cussp;
        return $this;
    }

    public function getDireccion()
    {
        return $this->direccion;
    }
    
    
    public function setDireccion($direccion)
    {
        $this->direccion = $direccion;
        return $this;
    }

    public function getIdcargo()
    {
        return $this->idcargo;
    }
    
    
    public function setIdcargo($idcargo)
    {
        $this->idcargo = $idcargo;
        return $this;
    }

    public function getAgricasa()
    {
        return $this->agricasa;
    }
    
    
    public function setAgricasa($agricasa)
    {
        $this->agricasa = $agricasa;
        return $this;
    }

    public function getEstadoMrcb()
    {
        return $this->estado_mrcb;
    }
    
    
    public function setEstadoMrcb($estado_mrcb)
    {
        $this->estado_mrcb = $estado_mrcb;
        return $this;
    }

    public function agregar() {
        $this->beginTransaction();
        try {            

            /*Validar dni*/
            $repetido = $this->consultarValor("SELECT COUNT(*) > 0 FROM personal WHERE estado_mrcb AND dni = :0", [$this->getDni()]);

            if ($repetido == true){
                return array("rpt"=>false,"msj"=>"El DNI ingresado ya EXISTE.");    
            }

            $campos_valores = 
            array(  "dni"=>$this->getDni(),
                    "nombres_apellidos"=>$this->getNombresApellidos(),
                    "fecha_ingreso"=>$this->getFechaIngreso(),
                    "fecha_nacimiento"=>$this->getFechaNacimiento(),
                    "cussp"=>$this->getCussp(),
                    "direccion"=>$this->getDireccion(),
                    "idcargo"=>$this->getIdcargo(),
                    "agricasa"=>$this->getAgricasa()
                    );    

            $this->insert("personal", $campos_valores);

            $this->commit();
            return array("rpt"=>true,"msj"=>"Se ha agregado exitosamente");
        } catch (Exception $exc) {
           return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function editar() {
        $this->beginTransaction();
        try { 

            $repetido = 
            $this->consultarValor("SELECT COUNT(*) > 0 FROM personal WHERE estado_mrcb AND dni = :0 AND idpersonal <> :1", [$this->getDni(), $this->getId_personal()]);

            if ($repetido == true){
                return array("rpt"=>false,"msj"=>"El DNI ingresado ya EXISTE.");    
            }

            $campos_valores = 
            array(  "dni"=>$this->getDni(),
                    "nombres_apellidos"=>$this->getNombresApellidos(),
                    "fecha_ingreso"=>$this->getFechaIngreso(),
                    "fecha_nacimiento"=>$this->getFechaNacimiento(),
                    "cussp"=>$this->getCussp(),
                    "direccion"=>$this->getDireccion(),
                    "idcargo"=>$this->getIdcargo(),
                    "agricasa"=>$this->getAgricasa());    

            $campos_valores_where = array("idpersonal"=>$this->getId_personal());

            $this->update("personal", $campos_valores,$campos_valores_where);

            $this->commit();
            return array("rpt"=>true,"msj"=>"Se ha actualizado correctamente");
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function listar(){
        try {
            $sql = "SELECT
                    p.idpersonal,
                    p.dni,
                    p.nombres_apellidos,
                    DATE_FORMAT(p.fecha_ingreso,'%d-%m-%Y') as fecha_ingreso,
                    DATE_FORMAT(p.fecha_nacimiento,'%d-%m-%Y') as fecha_nacimiento,
                    p.cussp,
                    p.direccion,
                    c.descripcion as cargo,
                    p.agricasa
                    FROM personal p 
                    LEFT JOIN cargo c ON c.idcargo = p.idcargo
                    WHERE p.estado_mrcb
                    ORDER BY nombres_apellidos";

            $resultado = $this->consultarFilas($sql);
            return array("rpt"=>true,"data"=>$resultado);
        } catch (Exception $exc) {
           return array("rpt"=>false,"msj"=>$exc->getMessage());   
        }
    }

    public function leerDatos(){
        try {
            $sql = "SELECT idpersonal, dni, nombres_apellidos, fecha_ingreso, fecha_nacimiento, cussp, direccion, idcargo, agricasa 
                    FROM personal WHERE idpersonal = :0 AND estado_mrcb";
            $resultado = $this->consultarFila($sql,array($this->getIdpersonal()));
            return array("rpt"=>true,"data"=>$resultado);
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function darBaja($JSONArrayId) {
        $this->beginTransaction();
        try {            

            $arrayId = json_decode($JSONArrayId);

            $maxL = count($arrayId);
            $strWhere = "";
            foreach ($arrayId as $key => $value) {
                $strWhere .= $value;
                if ($key + 1 < $maxL){
                   $strWhere .= ",";
                }
            }


            $sql = "UPDATE personal SET estado_mrcb = 0 WHERE idpersonal IN (".$strWhere.")";

            $this->consultarFN($sql);
            $this->commit();
            return array("rpt"=>true,"msj"=>"Se ha dado de baja correctamente");
        } catch (Exception $exc) {
           return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function obtenerPersonalImprimirQR($arrayId) {
        try {            

            $maxL = count($arrayId);
            $strWhere = "";
            foreach ($arrayId as $key => $value) {
                $strWhere .= $value;
                if ($key + 1 < $maxL){
                   $strWhere .= ",";
                }
            }

            $sql = "SELECT dni, nombres_apellidos, c.descripcion as cargo
                    FROM personal p
                    LEFT JOIN cargo c ON c.idcargo = p.idcargo
                    WHERE p.estado_mrcb AND p.idpersonal IN (".$strWhere.")
                    ORDER BY nombres_apellidos";

            $data = $this->consultarFilas($sql);

            return array("rpt"=>true,"data"=>$data);
        } catch (Exception $exc) {
           return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function obtenerCargosCombo() {
        try {            

            $sql = "SELECT idcargo as codigo, descripcion
                    FROM cargo
                    ORDER BY descripcion";

            $data = $this->consultarFilas($sql);

            return array("rpt"=>true,"data"=>$data);
        } catch (Exception $exc) {
           return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    

}