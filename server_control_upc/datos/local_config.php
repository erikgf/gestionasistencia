<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//SERVIDOR
 define("MODELO", "../negocio");
 define("MODELO_UTIL", MODELO."/util");
 define("MODELO_FUNCIONES",MODELO_UTIL."/Funciones.php");
 define("MODELO_VISTA","../../modelo/Util/Vista.php");
 
 //SESION
 define("_SESION_","_control_upc_movil_");
 session_name(_SESION_);
 session_start();
