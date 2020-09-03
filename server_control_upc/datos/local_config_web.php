<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//SERVIDOR

 date_default_timezone_set('America/Lima');

 define("MODELO", "../negocio");
 define("MODELO_UTIL", MODELO."/util");
 define("MODELO_FUNCIONES",MODELO_UTIL."/Funciones.php");

 define("SW_NOMBRE","Agricasa");
 define("SW_NOMBRE_COMPLETO","Control UPC");
 define("SW_VERSION","2.5.0 BETA");

 define("MODO_PRODUCCION", 1);
 define("_SESION_","_control_upc_agricasa");

 //SESION
 session_name(_SESION_);
 session_start();

