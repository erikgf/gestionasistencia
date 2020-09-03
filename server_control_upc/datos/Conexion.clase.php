<?php

require_once 'configuracion.php';

class Conexion{
    protected $dblink;
    private $estado = FALSE;
    
    public function __construct() {
        $this->abrirConexion();
    }
    
    public function __destruct() {
        $this->dblink = NULL;
        $this->estado = FALSE;
        //echo "Conexión cerrada";
    }
    
    protected function abrirConexion(){
        $servidor = TIPO_BD == "postgres" ?
                         "pgsql:host=".SERVIDOR_BD.";port=".PUERTO_BD.";dbname=".NOMBRE_BD : //PGSQL
                         'mysql:host='.SERVIDOR_BD.';port='.PUERTO_BD.';dbname='.NOMBRE_BD; //MYSQL
        

        $usuario = USUARIO_BD;
        $clave = CLAVE_BD;
        
        try {
            $this->dblink = TIPO_BD == "postgres" ?
                            new PDO($servidor, $usuario, $clave) : //PGSQL
                            new PDO($servidor, $usuario, $clave,array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8")); //MYSQL

            $this->dblink->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->estado = TRUE;   
        } catch (Exception $exc) {
            $this->estado = FALSE;     
            header('Content-Type: application/json');
            $response["rpt"] = false;
            $response["msj"] = utf8_encode($exc->getMessage());
            echo json_encode($response);
            exit;      
        }
        
        return $this->dblink;
    }

    public function beginTransaction()
    {
        $this->dblink->beginTransaction();
    }
    
    public function commit()
    {
        $this->dblink->commit();
    }
    
    public function rollBack()
    {
        $this->dblink->rollBack();
    }
    
    public function consulta($p_consulta)
    {
        $consulta = $this->dblink->prepare($p_consulta);
        $consulta->execute();
        return $consulta->fetchAll(PDO::FETCH_ASSOC);
    }

    public function consulta_raw($p_consulta)
    {
        $consulta = $this->dblink->prepare($p_consulta);
        return $consulta->execute();
    }

    /*
    public function insert($p_nombre_tabla, $p_campos, $p_valores)
    {
        $sql_campos = implode(",", $p_campos);
        $sql_valores = $this->sentenciaPreparada($p_campos);
        
        $consulta = $this->dblink->prepare("INSERT INTO $p_nombre_tabla ($sql_campos) VALUES ($sql_valores)");
        
        for ($i = 0; $i < count($p_campos); $i++) {
            $consulta->bindParam(':'.$p_campos[$i], $p_valores[$i]);
        }
        
        return $consulta->execute();
    }*/

    private function reformatEne($key){
        $r = str_replace("ñ","n",$key);
        return $r;
    }
    
    protected function insert($p_nombre_tabla, $p_campos_valores)
    {
        $p_campos = array_keys($p_campos_valores);
        $p_valores = array_values($p_campos_valores);

        $sql_campos = implode(",", $p_campos);
        $sql_valores = $this->sentenciaPreparada($p_campos);
        
        $consulta = $this->dblink->prepare("INSERT INTO $p_nombre_tabla ($sql_campos) VALUES ($sql_valores)");
        
        for ($i = 0; $i < count($p_campos); $i++) {
            $consulta->bindParam(':'.$this->reformatEne($p_campos[$i]), $p_valores[$i]);
        }
        
        return $consulta->execute();
    }

    protected function update($p_nombre_tabla, $p_campos_valores, $p_campos_valores_where = null)
    {
        $p_campos = array_keys($p_campos_valores);
        $p_valores = array_values($p_campos_valores);
        $p_campos_where = isset($p_campos_valores_where) ? array_keys($p_campos_valores_where) : null;
        $p_valores_where = isset($p_campos_valores_where) ? array_values($p_campos_valores_where) : null;

        $sql_campos = $this->sentenciaPreparadaUpdate($p_campos);

        if (isset($p_campos_where)){
            $sql_campos_where = $this->sentenciaPreparadaAND($p_campos_where);
        } else {
            $sql_campos_where = true;
        }

        $sql = "UPDATE $p_nombre_tabla SET $sql_campos WHERE $sql_campos_where";
                
        $consulta = $this->dblink->prepare($sql);
        
        for ($i = 0; $i < count($p_campos); $i++) {
            $consulta->bindParam(':'.$this->reformatEne($p_campos[$i]), $p_valores[$i]);
        }

        
        if (isset($p_valores_where)){
            for ($i = 0; $i < count($p_campos_where); $i++) {
                $consulta->bindParam(':'.$this->reformatEne($p_campos_where[$i]), $p_valores_where[$i]);
            }
        } 
        
        return $consulta->execute();
    }

    public function delete($p_nombre_tabla, $p_campos_valores_where)
    {
        $p_campos_where = isset($p_campos_valores_where) ? array_keys($p_campos_valores_where) : null;
        $p_valores_where = isset($p_campos_valores_where) ? array_values($p_campos_valores_where) : null;

        if (isset($p_campos_where)){
            $sql_campos_where = $this->sentenciaPreparadaAND($p_campos_where);
        } else {
            $sql_campos_where = true;
        }

        $consulta = $this->dblink->prepare("DELETE FROM $p_nombre_tabla WHERE $sql_campos_where");
        
        if (isset($p_valores_where)){
            for ($i = 0; $i < count($p_campos_where); $i++) {                
                
                $consulta->bindParam(':'.$this->reformatEne($p_campos_where[$i]), $p_valores_where[$i]);
            }
        } 
        
        return $consulta->execute();
    }
    
    private function sentenciaPreparadaUpdate($array)
    {
        $sql_temp = "";
        for ($i = 0; $i < count($array); $i++) {
            if ($i == count($array)-1)
            {
                $sql_temp = $sql_temp . $array[$i] . "=:" .$this->reformatEne($array[$i]);
            } else{
                $sql_temp = $sql_temp . $array[$i] . "=:" .$this->reformatEne($array[$i]) . ", ";
            }
        }
        return $sql_temp;
    }
    
    private function sentenciaPreparadaAND($array)
    {
        $sql_temp = "";
        for ($i = 0; $i < count($array); $i++) {
            if ($i == count($array)-1)
            {
                $sql_temp = $sql_temp . $array[$i] . "=:" .$this->reformatEne($array[$i]);
            } else{
                $sql_temp = $sql_temp . $array[$i] . "=:" .$this->reformatEne($array[$i]) . " AND ";
            }
        }
        return $sql_temp;
    }
    
    private function sentenciaPreparada($array)
    {
        $sql_temp = "";
        for ($i = 0; $i < count($array); $i++) {
            if ($i == count($array)-1)
            {
                $sql_temp = $sql_temp . ":" .$this->reformatEne($array[$i]);
            } else{
                $sql_temp = $sql_temp . ":" .$this->reformatEne($array[$i]) . ", ";
            }
        }
        return $sql_temp;
    }

    private function consulta_x($sql,$valores,$tipo,$fech = null)
    {
        $consulta = $this->dblink->prepare($sql);

        if ($valores != null){
            $valores = is_array($valores) ? $valores : [$valores];
            for ($i = 0; $i < count($valores); $i++){
                $consulta->bindParam(":".$i, $valores[$i]);
            }
        }

        $consulta->execute();

        switch($tipo){
            case "*":
                return $consulta->fetchAll(PDO::FETCH_ASSOC);
            case "1*":
                return $consulta->fetch(PDO::FETCH_ASSOC);
            case "1":
                return $consulta->fetch(PDO::FETCH_NUM)[0];
        }

        return false;
    }

    protected function consultarValor($p_sql, $p_valores = null)
    {
        return $this->consulta_x($p_sql, $p_valores,"1");
    }

    protected function consultarFila($p_sql, $p_valores = null)
    {
        return $this->consulta_x($p_sql, $p_valores,"1*");
    }

    protected function consultarFilas($p_sql, $p_valores = null)
    {
        return $this->consulta_x($p_sql, $p_valores,"*");
    }

    protected function consultarExiste($tabla, $campo_valor)
    {
        $campo = key($campo_valor); $valor = $campo_valor[key($campo_valor)];
        $sql = "SELECT COUNT(".$campo.") > 0 FROM ".$tabla." WHERE ".$campo." = :0";
        return $this->consultarValor($sql, array($valor));
    }

    
}
