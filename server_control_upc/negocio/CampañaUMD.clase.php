<?php

require_once '../datos/Conexion.clase.php';

class CampañaUMD extends Conexion {
    private $idCampaña;

    public function getIdCampaña()
    {
        return $this->idCampaña;
    }
    
    
    public function setIdCampaña($idCampaña)
    {
        $this->idCampaña = $idCampaña;
        return $this;
    }

    public function verDetalle()
    {
        try {

            $sql = "SELECT * FROM fn_ver_campaña(:0)";
            $JSONCampo = $this->consultarValor($sql, [$this->getIdCampaña()]); 

            return array("rpt"=>true,"data"=>$JSONCampo);
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
            throw $exc;
        }
    }

    public function cargarTurnos($nModulo)
    {
        try {

            $sql = "SELECT * FROM fn_obtener_turnos_x_campaña(:0,:1)";
            $JSONTurnos = $this->consultarValor($sql, [$this->getIdCampaña(),$nModulo]); 

            return array("rpt"=>true,"data"=>$JSONTurnos);
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
            throw $exc;
        }
    }
    

    public function cargarUmdAsignacion($jiron_turno, $modulo = "")
    {
        try {

            $sql = "SELECT * FROM fn_obtener_umd_x_campaña(:0,:1,:2)";
            $JSONUmds = $this->consultarValor($sql, [$this->getIdCampaña(),$jiron_turno,$modulo]); 

            return array("rpt"=>true,"data"=>$JSONUmds);
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
            throw $exc;
        }
    }

    public function cargarUmdAsignacionLiberacion($idEvaluacion, $idLiberacion, $jiron_turno)
    {
        try {

            $sql = "SELECT * FROM fn_obtener_umd_x_campaña_liberacion(:0,:1,:2,:3)";
            $JSONUmds = $this->consultarValor($sql, [$this->getIdCampaña(),$idEvaluacion, $idLiberacion, $jiron_turno]); 

            return array("rpt"=>true,"data"=>$JSONUmds);
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc);
            throw $exc;
        }
    }
    
    
}

    