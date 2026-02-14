<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>API Modelo de Negocio</title>
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">

	<!-- JS, Popper.js, and jQuery -->
	<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
	<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js" integrity="sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI" crossorigin="anonymous"></script>
</head>
<body class="text-justify">
<div class="container-fluid">
	<div class="row">
		<h1 class="col-xl-12 text-center">API Modelo de Negocio</h1>
		<h2 class="col-xl-12 text-center">Desarrolla aplicaciones con nosotros</h2>
		<h3 class="col-xl-12 text-center">Accede a nuestros servicios</h3>
		<div class="row col-xl-10 offset-1 alert alert-light">
			Bienvenidos, la presente plataforma contiene la API desarrollada para el modelo de negocio. La API permite el acceso directo al trabajo con la información de nuestra base de datos desde tu aplicación. Usa una interfaz RESTful y retorna los datos en formato JSON. La información invocadas a través de la API proveen un acceso estándar online a datos contenidos en páginas HTML y otros archivos similares disponibles en Internet. Registre sus datos y consiga la autorización para trabajar en nuestra plataforma, ya que requiere de datos de autorización, la puedes solicitar a través del siguiente formulario:
					
		</div>
		<?php if($_SERVER["REQUEST_METHOD"] == "POST") : ?>
		<div class="row col-xl-12 my-6">
        		<div class="row col-xl-8 offset-2 bg-dark text-white font-weight-bold py-2">        			
					<?php print "Token de accesso"     ?>
				</div>
        		<div class="row col-xl-8 offset-2 bg-success text-white font-weight-bold py-2">
					<?php  ?>
				</div>
        		
        	</div>
    	<?php endif ?>
		<div class="row col-xl-10 offset-1">
			<h3>Solicitud de Acceso a Datos</h3>				
				<form method="post" class="col-xl-8" >
					<div class="form-group">
					<input type="text" name="nombres" placeholder="Nombres" class="form-control" required >
					</div>
					<div class="form-group">
					<input type="text" name="apellidos" placeholder="Apellidos" class="form-control" required>
					</div>
					<div class="form-group">
					<input type="email" name="email" placeholder="E-mail" class="form-control" required>
					</div>
					<button type="submit" class="btn btn-success registrar">Registrar</button>
				</form>
		</div>
	</div>

</div>
</body>
</html>