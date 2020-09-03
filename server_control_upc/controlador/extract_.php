<?php 

require_once '../datos/local_config_web.php';
require_once MODELO_FUNCIONES;


$modelo  = "Campaña";
require_once MODELO . "/".utf8_decode($modelo).".clase.php";
$obj = new $modelo;
$metodo = "generarUmdCampaña";
$data_in = isset($_POST["data_in"]) ? json_decode($_POST["data_in"]) : null; //parametros que son parte de la clase.
$data_out = isset($_POST["data_out"]) ? json_decode($_POST["data_out"]) : []; //parámetros q no son parte de la clase.

if(is_callable(array($obj, $metodo))){
	if ($data_in != null){
			//recorrer el arreglo y asignar todo lo posible.
			foreach ($data_in as $key=>$valor) {
				$str = "set".ucfirst(substr($key, 2));
                    $obj->$str($valor);            
			}
	}

	$archivo = "D://08-ENERO.csv";

	$handle = fopen($archivo, "r");
			if ($handle) {
				$indexLine = 0;
				$camposArreglo = [];
				$tempCampo = null;
				$nombreCampoAnterior = null;
				$nombreCampoNuevo = null;

			    while (($linea = fgets($handle)) !== false) {
			    	$itemLinea =  explode(";",$linea);			    	
			    	if ($indexLine == 0){
			    		// $coordenadaCampo = explode(",",$itemLinea[0]);			    		
			    	} else{

			    		/*campo:1, 6 modulo(jiron,7 turno ,8 valvula/cuartel 9.area
			    			id_evaluador = 3*/
			    		$nombreCampoNuevo = strtoupper(utf8_encode($itemLinea[1]));

			    		if ($nombreCampoAnterior == null){
			    			$tempCampo = ["nombre"=> $nombreCampoNuevo,
			    							"umd" => []];
			    		} else if ($nombreCampoAnterior != $nombreCampoNuevo){
			    			array_push($camposArreglo, $tempCampo);
			    			$tempCampo = ["nombre" => $nombreCampoNuevo,
			    							"umd"=> []];
			    		}

			    		if ($itemLinea[7]== "" || $itemLinea[7] == "-"){
			    			$turno_cuartel = $itemLinea[8];
			    			$valvula = null;
			    		} else {
			    			$valvula = $itemLinea[8];
			    			$turno_cuartel = $itemLinea[7];
			    		}

			    		array_push($tempCampo["umd"], 
						    						["nivel_uno"=>trim($itemLinea[6]),
						    		 				"nivel_dos"=>trim($turno_cuartel),
						    		 				"nivel_tres"=>trim($valvula),  
						    		 				"hectarea"=>trim($itemLinea[9])
						    		 				]);

			    		$nombreCampoAnterior = $nombreCampoNuevo;

			    	}
			        
					$indexLine++;
			    }
			    array_push($camposArreglo,$tempCampo);

			    fclose($handle);
			    array_push($data_out, json_encode($camposArreglo));

			} else {
			    var_dump("Error en archivo");
			} 


	$rpta = call_user_func_array(
	    array($obj, $metodo), $data_out == null ? array() : $data_out
	);

	Funciones::imprimeJSON(200,"OK",$rpta);
}else{
	Funciones::imprimeJSON(500, "El método $metodo de la clase $modelo no existe.", "");
}

?>