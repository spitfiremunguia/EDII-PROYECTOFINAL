var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate');

var index = require('./routes/index');
var users = require('./routes/users');

//Mongo connection


var app = express();

// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public',express.static(path.join(__dirname, '/public')));
app.use('/images',express.static(path.join(__dirname, '/public/images')));
//app.use('/styles',express.static(__dirname + "/styles"));

app.use('/', index);
app.use('/users', users);
//Listen
app.listen(8000,function()
{
  console.log('Server is up');
});
//Llamar a la función de crear usuarios
app.get('/create',function(req,res)
{
  console.log("Creando usuario...");
  res.render(__dirname+'/views/create.ejs');
});
//verificar y crear al usuario
app.post('/createUser',function(req, res)
{
  var Nombre=req.body.nombre;
  var Apellido=req.body.appellido;
  var Usuario=req.body.usuario;
  var Correo=req.body.correo;
  var Contraseña=req.body.contraseña;//Encriptarla
  var imgPath=req.body.fileInput;
  var nuevoUsuario={
    nombre:Nombre,
    apellido:Apellido,
    usuario:Usuario,
    correo:Correo,
    contraseña:Contraseña,
    imagenpath:imgPath,
    amigos:[]
    
  };
  //Guardar al usuario
 console.log(nuevoUsuario);
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.jade');
});

module.exports = app;
