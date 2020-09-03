<header><meta http-equiv="Content-Type" content="text/html; charset=gb18030">
        <div class="row navbar-0">
          <div class="col-sm-6">
            <img src="../imagenes/logo-izq.jpg" class="img-logo-izq">
          </div>
          <div class="col-sm-6 navbar-link-right">
            <a href="#"><?php echo $nombreUsuario.' ('.$perfil.')'; ?> </a>
            <a href="#" onclick="Util.cerrarSesion();">Cerrar Sesión</a>
          </div>
        </div>
       <div id="navbar" class="navbar-collapse collapse navbar-1">
              <ul class="nav navbar-nav">
                <li>
                  <a href="principal.vista.php">Inicio</a>
                </li>
                <li class="dropdown">
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Mantenimientos <span class="caret"></span></a>
                  <ul class="dropdown-menu dropdown-menu-cayalti">
                    <li><a href="personal.vista.php">Personal</a></li>
                  </ul>
                </li> 
                <li class="dropdown">
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Control de Labores <span class="caret"></span></a>
                  <ul class="dropdown-menu dropdown-menu-cayalti">
                    <li><a href="reportes.labores.fecha.vista.php">Reporte por Fechas</a></li>
                  </ul>
                </li>  
              </ul>
        </div>
</header>