<?php

    include '../datos/local_config_web.php';
    if( isset($_SESSION["usuario"])){
        header("location:principal.vista.php");
    }   

    $usuario = "";
    $recordar = false;

    if (isset($_COOKIE["usuario"])){
        $usuario = $_COOKIE["usuario"];
        $recordar = true;
    }
?>
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta charset="utf-8" />
        <title>Iniciar Sesión</title>

        <meta name="description" content="User login page" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />

        <!-- bootstrap & fontawesome -->
        <?php 
          include '_css/bootstrap.css.php';
        ?>
        <!--[if lte IE 9]>
          <link rel="stylesheet" href="../assets/css/ace-ie.min.css" />
        <![endif]-->

        <!-- HTML5shiv and Respond.js for IE8 to support HTML5 elements and media queries -->

        <!--[if lte IE 8]>
        <script src="../assets/js/html5shiv.min.js"></script>
        <script src="../assets/js/respond.min.js"></script>
        <![endif]-->
        <link rel="stylesheet" href="css/estilos.css" />
    </head>

    <style type="text/css">

    body{
        background: #f1f1f1;
    }

    header{
         background: white;
    }

    .login-container{
        margin-top: 50px;
        margin-bottom: 50px;
    }
    .login-form{
        background: #b4ddb4; /* Old browsers */
        background: -moz-linear-gradient(top, #b4ddb4 0%, #83c783 17%, #52b152 33%, #008a00 67%, #005700 83%, #002400 100%); /* FF3.6-15 */
        background: -webkit-linear-gradient(top, #b4ddb4 0%,#83c783 17%,#52b152 33%,#008a00 67%,#005700 83%,#002400 100%); /* Chrome10-25,Safari5.1-6 */
        background: linear-gradient(to bottom, #b4ddb4 0%,#83c783 17%,#52b152 33%,#008a00 67%,#005700 83%,#002400 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b4ddb4', endColorstr='#002400',GradientType=0 ); /* IE6-9 */
        box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 9px 26px 0 rgba(0, 0, 0, 0.19);
        background-image: url(../imagenes/Header.jpg);
        background-repeat: no-repeat;
        background-position: left bottom;
    }
    .login-form h3{
        text-align: center;
    }
    .login-container form{
        padding: 10%;
    }
    .btnSubmit
    {
        width: 50%;
        border-radius: 1rem;
        padding: 1.5%;
        border: none;
        cursor: pointer;
    }
    .login-form .btnSubmit{
        font-weight: 600;
        width: 100%;
        border: solid 2px #2a81bf;
        font-weight: bold;
        text-align: center;
        color: #fff;
        background-color: #326ae8;
        padding: 10px 20px;
        text-transform: uppercase;
    }
    .login-form .ForgetPwd{
        color: #fff;
        font-weight: 600;
        text-decoration: none;
    }
    .color-white{
        color: white;
    }

</style>

    <body>
        <header>
            <div class="row navbar-0">
              <div class="col-sm-6">
                <img src="../imagenes/logo-izq.jpg" class="img-logo-izq">
              </div>
            </div>
           <div id="navbar" class="navbar-collapse collapse navbar-1">
             <ul class="nav navbar-nav">
                <li><a>&nbsp;</a></li>
            </ul>
           </div>
        </header>
        <main role="main" class="container login-container">
            <div class="row">
                <div class="col-xs-12 col-md-offset-4 col-md-4 login-form">
                    <h3>Control Labores</h3>
                    <form>
                        <div class="form-group">
                            <input type="text" id="txtusuario" name="txtusuario" class="form-control" placeholder="Usuario" value="<?php echo $usuario; ?>" />
                        </div>
                        <div class="form-group">
                            <input type="password" id="txtclave" name="txtclave" class="form-control" placeholder="Contraseña" value="" />
                        </div>
                        <div class="form-group">
                            <div >
                                <input type="checkbox" id="chkrecordar"  <?php echo $recordar ? "checked" : "" ?>>
                                <label class="color-white" for="chkrecordar">Recordar</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <input type="submit" class="btnSubmit" value="ACCEDER" />
                        </div>
                    </form>
                </div>
            </div>
        </main>
          <?php include 'pie.vista.php'; ?>
        <?php 
          include '_js/jquery.js.php'; 
          include '_js/bootstrap.js.php'; 
        ?>
        <script src="../util/Ajxur.js" type="text/javascript"></script>
        <script src="js/login.js" type="text/javascript"></script>
    </body>
</html>
