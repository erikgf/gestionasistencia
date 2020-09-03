<?php 

/** Incluye PHPExcel */
require_once '../plugin/Classes/PHPExcel.php';
require_once '../datos/local_config_web.php';
require_once MODELO. '/util/Funciones.php';           
require_once MODELO . '/ControlLabor.clase.php';

function indiceALetra ($indice){
   	$colText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   	$colTextLimite = strlen($colText);
	$extraColText = ['AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO'];
	
	return ($indice >= $colTextLimite) ? $extraColText[$indice - $colTextLimite] : $colText[$indice];
}

	if (isset($_GET['p_f'])) {  
   	 try {
			// Crear nuevo objeto PHPExcel
			$f = $_GET['p_f'];
			$fi = $_GET['p_fi'];
			$ff = $_GET['p_ff'];
			$fundo = $_GET['p_fun'];

			$NOMBRE_FUNDO = $fundo == 'SM' ? 'SANTA MARTA' : 'SAN AGUSTIN';

   	 		$CREADOR = "AyphuTEC";
			$NOMBRE_EXCEL = 'reporte-upc-'.strtolower($fundo).'-fechas-'.date('dmYHis').'.xlsx';
			$TITULO = "Reporte Control UPC ".$NOMBRE_FUNDO." por Fecha";
			$EMPRESA = "AGRICASA";
			$MODIFICADO_POR = $EMPRESA;
			$DIA = date('d-m-Y');
			$HORA = date('H:i:s');

			$objPHPExcel = new PHPExcel();    
			$objReporteador = new ControlLabor();

			$objReporte = $objReporteador->listarFechasDetalle($fundo, $f, $fi, $ff);

			if ($objReporte["rpt"] == false){
				print($objReporte["msj"]);
				exit;
			}

			$dataReporte = $objReporte["data"];

	        //$rango_fecha = $dataReporte["rango_fecha_desc"];
	        //$cuerpo = $dataReporte["data_egresos"];
			$objPHPExcel->getProperties()->setCreator($CREADOR)
										 ->setTitle($TITULO)
										 ->setSubject($TITULO)
										 ->setLastModifiedBy($MODIFICADO_POR);

			
			$cabeceraEstilo =  array('font' => array('bold'=>true),'alignment' => array('horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
																										'vertical' => PHPExcel_Style_Alignment::VERTICAL_CENTER));
			
			/*	INICIO SHEET 0 */

			$objPHPExcel->setActiveSheetIndex(0);
			$actualSheet = $objPHPExcel->getActiveSheet();
							 
			//Inicio tabla CABECERA: A3-D3
			$filaI = 1;
			$columnas = [
				//nombre coklumna => ancho
				'FECHA'=>12,
		 		'LABOR'=>10,
		 		'TURNO'=>8,
		 		'DNI'=>18,
		 		'CENTRO DE COSTO'=>18,
		 		'CANTIDAD'=>16,
		 		'%'=>8,
		 		'OBSERVACION'=>33,
		 		'LOTE'=>22,
		 		'LOTE DESC'=>22,
		 		'APELLIDOS Y NOMBRES'=>50,
		 		'CULTIVO'=>16,
		 		'DESCRIPCION DE LABOR'=>35
			];

			$i = 0;
			foreach ($columnas as $nombreColumna => $anchoColumna) {
				$letra = indiceALetra($i);
				$actualSheet->setCellValue($letra.$filaI, $nombreColumna);
				$actualSheet->getColumnDimension($letra)->setWidth($anchoColumna);
				$i++;
			}

			$rangoColumnas = 'A'.$filaI.':'.$letra.$filaI;
			$celdaFilaFinal = $letra;

			$actualSheet->getStyle($rangoColumnas)->applyFromArray($cabeceraEstilo);
			$actualSheet->getStyle($rangoColumnas)->applyFromArray($cabeceraEstilo);

			//$colorRiesgo= ["ALTA"=>["B22222","FFFFFF"], "LEVE"=>["FFD700","000000"],"ERROR"=>["FFFFFF","008000"]];

			$filaInit = $filaI + 1;
			//$MINUTOS_TARDANZA_LEVE = 5;
			//$MINUTOS_TARDANZA_ALTA = 15;


			$format = 'dd/mm/yyyy';
			if (count($dataReporte) > 0){
				foreach ($dataReporte as $_ => $value) {
					/*INIT */
					$filaI++;
					$indice = 0;
					$actualSheet
								->setCellValue(indiceALetra($indice++).$filaI,PHPExcel_Shared_Date::PHPToExcel($value["fecha"]))
								->setCellValue(indiceALetra($indice++).$filaI, $value["labor"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["turno"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["dni"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["centro_costo"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["cantidad"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["porcentaje"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["observacion"])
								->setCellValue(indiceALetra($indice++).$filaI, "")
								->setCellValue(indiceALetra($indice++).$filaI, $value["lote"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["apellidos_nombres"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["cultivo"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["descripcion_labor"]);

					//$actualSheet->getStyleByColumnAndRow(0, $i)->getNumberFormat()->setFormatCode($format);
				/*
					$actualSheet			
								->setCellValue($ingreso.$filaI, $value["ingreso"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["salida"]);

					$idPuntoAcceso = indiceALetra($indice++);

					$actualSheet			
								->setCellValue($idPuntoAcceso.$filaI, $value["idpuntoacceso"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["puntoacceso"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["idresponsable"])
								->setCellValue(indiceALetra($indice++).$filaI, $value["responsable"]);
					*/
				}

			//	$actualSheet->getStyle($idPuntoAcceso.$filaInit.':'.$idPuntoAcceso.$filaI)->getNumberFormat()->setFormatCode(PHPExcel_Style_NumberFormat::FORMAT_TEXT);
			}

			$objPHPExcel->getActiveSheet()->getStyle('A'.$filaInit.':A'.$filaI)->getNumberFormat()->setFormatCode($format);/*FECHA*/
			$objPHPExcel->getActiveSheet()->getStyle('D'.$filaInit.':D'.$filaI)->getNumberFormat()->setFormatCode(PHPExcel_Style_NumberFormat::FORMAT_TEXT);/*DNI*/

			$actualSheet->setTitle('UPC - '.$NOMBRE_FUNDO);

			/**FIN SHEET 0. */
		 	
			// Set active sheet index to the first sheet, so Excel opens this as the first sheet
			$objPHPExcel->setActiveSheetIndex(0);
			// Redirect output to a client’s web browser (Excel2007)
			header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			header('Content-Disposition: attachment;filename="'.$NOMBRE_EXCEL.'"');
			header('Cache-Control: max-age=0');
			// If you're serving to IE 9, then the following may be needed
			header('Cache-Control: max-age=1');
			// If you're serving to IE over SSL, then the following may be needed
			header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
			header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); // always modified
			header ('Cache-Control: cache, must-revalidate'); // HTTP/1.1
			header ('Pragma: public'); // HTTP/1.0
			$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
			$objWriter->save('php://output');
			exit;

	    } catch (Exception $exc) {
	    	print($exc->getMessage());
	    }   
	} else {
		print("Faltan parametros en el reporte");
	}

