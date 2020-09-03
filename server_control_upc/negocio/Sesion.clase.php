<?php
require_once '../datos/Conexion.clase.php';

class Sesion extends Conexion {
    private $usuario;
    private $clave;
    private $recordar;
    
    public function getRecordar() {
        return $this->recordar;
    }

    public function setRecordar($recordar) {
        $this->recordar = $recordar;
    }

    public function getClave() {
        return $this->clave;
    }

    public function setClave($clave) {
        $this->clave = $clave;
    }

    public function getUsuario()
    {
        return $this->usuario;
    }
    
    public function setUsuario($usuario)
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function iniciarSesion()
    {
        try {            
            $sql = " SELECT dni, nombres_apellidos, clave
                        FROM usuario
                        WHERE usuario = :0 ";

            $res = $this->consultarFila($sql, $this->getUsuario());

            if ($res != false){
                    if ($res["clave"] == md5($this->getClave())){
                        $duracion = time() + (1000 * 3600 * 24);
                        if ($this->getRecordar() == "true"){
                            setcookie('usuario', $this->getUsuario(), $duracion, "/");
                        } else {
                            setcookie("usuario", "", $duracion,"/");
                        }
                        $dniUsuario = $res["dni"];
                        setcookie("codusuario",$dniUsuario, $duracion,"/");

                        $_SESSION["usuario"] =  array(
                                    "cod_usuario"=> $dniUsuario,
                                    "nombres_usuario"=> $res["nombres_apellidos"],
                                    "perfil"=>  " ADMIN",
                                    "cod_perfil"=>"1"
                                    );

                        return array("rpt"=>true, "msj"=>"Acceso permitido.",
                                    "usuario" => $_SESSION["usuario"]);
                    }    
                    return array("rpt"=>false, "msj"=>"Clave incorrecta.");
            }
            
            return array("rpt"=>false, "msj"=>"Usuario inexistente.");
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }

    public function cerrarSesion()
    {
        try {
            if (isset($_COOKIE["codusuario"]) && $_COOKIE["codusuario"] != null){
                setcookie("codusuario","",0,"/");
            }
            session_destroy();
            return array("rpt"=>true,"msj"=>"Sesión cerrada.");
        } catch (Exception $exc) {
            return array("rpt"=>false,"msj"=>$exc->getMessage());
        }
    }
        
}
