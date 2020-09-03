<?php
header('Access-Control-Allow-Origin: *');
require_once '../datos/local_config.php';
require_once MODELO_FUNCIONES;

date_default_timezone_set('America/Lima');

/* Este controlador funciona dinamicamente a peticiones xhr desde el cliente
espera: 
	- metodo ; string. El nombre de la accipón asociada a la clase (método).
	- modelo ; string. El nombre de la clase descrita en nuestro modelo (Clase.php).
	- data_in; array. Conjunto de parámetros que se asignaran a la clase que vamos a usar. Usa de la sintaxis: $InstanciaClase->setAtributo($atributo);
	- data_out; array. Conjunto de parámetros que no se asignaran a la clase que vamos a usar, sino que se usarán como parámetros en el método a usar. Usa de la sintexis: $InstanciaClase->metodo($parametros).
	** Como una excepcion TEMPORAL $data_in y $data_out pueden tener el sigueinte comportamiento;
		*data_out; string: Se usa la palabra reservada "formulario".
		*data_in; string: Contiene el arreglo SERIALIZADO por la etiqueta <form> desde el cliente.
		O sea, cuando data_out = "formulario" => data_in = "cadena_serializada".
		Los elementos serializados deben tener el formato adecuado:
		Ejemplo: txtdireccion_principal 
		Donde, txt: son las 3 primeras letras obligatorias del tipo de elemento.
			 , direccion_principal es el atributo y la fila de la bbdd de nuestra clase y tabla respectivamente.
		Otros ejemplos: cboestado, radaccion, btnvalor_especial.

Finalmente el cntrolador devuelve datos propios del método pedido con formato JSON.
*/

if (! isset($_POST["metodo"]) ){
    Funciones::imprimeJSON(500, "Falta el método del API.", "");
    exit();
}

if (! isset($_POST["modelo"]) ){
    Funciones::imprimeJSON(500, "Falta el modelo para el API.", "");
    exit();
}

$modelo  = $_POST["modelo"];
require_once MODELO . "/".utf8_decode($modelo).".clase.php";
$obj = new $modelo;
$metodo = $_POST["metodo"];
$data_in = isset($_POST["data_in"]) ? $_POST["data_in"] : null; //parametros que son parte de la clase.
$data_out = isset($_POST["data_out"]) ? $_POST["data_out"] : null; //parámetros q no son parte de la clase.


if(is_callable(array($obj, $metodo))){

	if ($data_out == "formulario"){
		$data_out = null;		
		parse_str($data_in , $datosFormularioArray);		
		foreach ($datosFormularioArray as $key=>$valor) {
			$str = "set".ucfirst(substr($key, 3));
			if (method_exists($obj,$str)){
				$obj->$str($valor);
			}
		}
	} 
	else {
		if ($data_in != null){
			//recorrer el arreglo y asignar todo lo posible.
			foreach ($data_in as $key=>$valor) {
				$str = "set".ucfirst(substr($key, 2));
                    $obj->$str($valor);            
			}
		}
	}
        /*
        //debug	
	if ($metodo =="reporteBuscarDetalle"){
		var_dump($data_out); exit();
	}*/
    
	$rpta = call_user_func_array(
	    array($obj, $metodo), $data_out == null ? array() : $data_out
	);
	// $obj->$metodo($data_out);
	Funciones::imprimeJSON(200,"OK",$rpta);
}else{
	Funciones::imprimeJSON(500, "El método '$metodo' de la clase '$modelo' no existe.", "");
}
