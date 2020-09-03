<?php 
	
	require_once '../negocio/Personal.clase.php';
	require_once '../plugin/phpqrcode/qrlib.php';
    
	$arregloIdPost =  isset($_POST["p_ids"]) ? $_POST["p_ids"] : '[]';
	$arregloId = json_decode($arregloIdPost);
	
	if (!count($arregloId)){
		var_dump("No hay registros ingresados para imprimir.");
		exit;
	}

	$objP = new Personal();

	$dataPersonal = $objP->obtenerPersonalImprimirQR($arregloId);

	if (!$dataPersonal["rpt"]){
		var_dump($dataPersonal["msj"]);
		exit;
	}
	
	$dataPersonal = $dataPersonal["data"];
	$cantidadCards = count($dataPersonal);

	$maxCardsXHoja = 9;

	$pageHTML = "";

	foreach ($dataPersonal as $key => $value) {
		$creaPagina = ($key % $maxCardsXHoja) == 0;
		if ($creaPagina){
			if ($key > 0){
				$pageHTML .= '</div>';
			}
			
			$pageHTML .= '<div class="page">';
		}

	    // how to save PNG codes to server
	    $tempDir = '../imagenes/qr/';
	    $fileName = 'qr_'.md5($value["dni"]).'.png';
	    
	    $pngAbsoluteFilePath = $tempDir.$fileName;
	    $urlRelativeFilePath = $tempDir.$fileName;
	    
	    // generating
	    if (!file_exists($pngAbsoluteFilePath)) {
	        QRcode::png($value["dni"], $pngAbsoluteFilePath,  QR_ECLEVEL_L, 3, 1);
	    }
	    
		$pageHTML .= '<div class="qrcard">
				        	<div  class="logo">
				        		<img src="../imagenes/logo-agricasa.png">
				        	</div>
				        	<div class="nombres">'.$value["nombres_apellidos"].'</div>
				        	<div class="cargo">'.$value["cargo"].'</div>
				        	<div class="qr">
				        		<img src="'.$urlRelativeFilePath.'" />
				        	</div>
				        	<div class="dni">'.$value["dni"].'</div>
				    	</div>';
	}
 ?>

<html lang="es">
<head>
	<title>Imprimir QR Tarjetas</title>


	<style type="text/css">
		body {
	        width: 100%;
	        height: 100%;
	        margin: 0;
	        padding: 0;
	        background-color: #FAFAFA;
	        font: 12pt "Tahoma";
	    }
	    * {
	        box-sizing: border-box;
	        -moz-box-sizing: border-box;
	    }
	    .page {
	        width: 210mm;
	        min-height: 297mm;
	        padding: 20mm;
	        margin: 10mm auto;
	        border: 1px #D3D3D3 solid;
	        border-radius: 5px;
	        background: white;
	        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
	    }
	    .subpage {
	        padding: 1cm;
	        border: 5px red solid;
	        height: 257mm;
	        outline: 2cm #FFEAEA solid;
	    }
	    
	    @page {
	        size: A4;
	        margin: 0;
	    }


	    @media print {
	        html, body {
	            width: 210mm;
	            height: 297mm;        
	        }
	        .page {
	            margin: 0;
	            border: initial;
	            border-radius: initial;
	            width: initial;
	            min-height: initial;
	            box-shadow: initial;
	            background: initial;
	            page-break-after: always;
	        }

	        .btnimprimir{
	        	display: none;
	        }
 
	    }


	    .btnimprimir{
	       position: absolute;
	       right: 30em;
	       top: 4em;
	    }

	    .qrcard{
	    	/*
			width: 53.98mm;
		   	height: 85.6mm;
		   	*/
		   	width: 53.98mm;
    		height: 85mm;
		    margin: .35mm 1.25mm;
		    display: inline-block;
		    border: 1px solid gray;
		    text-transform: uppercase;
		    text-align: center;
		    position: relative;
	    }

	    .logo{
	    	width: 100%;
    		padding: 10px 15px;
	    }

	    .logo img{
	    	width: inherit;
	    }

	    .nombres{
		   	font-size: .85em;
		    padding: 10px;
		    height: 15mm;
    		max-height: 15mm;
	    }

	    .cargo{
    		font-size: 16px;
		    font-weight: bold;
		    margin-bottom: 1mm;
	    }

	    .qr	{
	  		position: absolute;
		    width: 33mm;
		    height: 33mm;
		    border: 1px solid gray;
		    bottom: 3.5mm;
		    left: 10mm;
		}

		.dni{
			font-size: 2mm;
		    position: absolute;
		    writing-mode: vertical-rl;
		    text-orientation: upright;
		    bottom: 10mm;
		    right: 7mm;
		}

		.qr img {
			width: 100%;
		}
	</style>
</head>
<body>
	<div class="book">
		<a href="#" class="btnimprimir" onclick="print();">Imprimir</a>
	    <?php 

	    echo $pageHTML;

	     ?>
	</div>

	<?php 
	  include '_js/jquery.js.php'; 
	?>
  	<script src="../assets/js/handlebars.min.js"></script>
</body>
</html>