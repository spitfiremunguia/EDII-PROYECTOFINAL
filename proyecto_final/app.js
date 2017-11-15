var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate');
var mongoose = require('mongoose');
var Usuario=require('./routes/Usuario')
var index = require('./routes/index');
var users = require('./routes/users');
var multer=require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload=multer({storage:storage});
var md5=require('md5')


//Conexión a mongo
var db = "mongodb://localhost:27017/proyectoFinal/Users";//Por el momento esta local
var db = mongoose.connect(db, function(err){
	if(err){
		console.log("Ocurrió un error al intentar conectar a la base de datos.");
		console.log("Intente montar la base de datos de manera local.");
	}
});



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
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/images', express.static(path.join(__dirname, '/public/images')));
//app.use('/styles',express.static(__dirname + "/styles"));

app.use('/', index);
app.use('/users', users);
//Listen
app.listen(8000, function () {
  console.log('Server is up');
});
//Llamar a la función de crear usuarios
app.get('/create', function (req, res) {
  console.log("Creando usuario...");
  //Le mando la base de datos para verificar
  res.render(__dirname + '/views/create.ejs');
});
//verificar y crear al usuario
app.post('/createUser',  upload.single('Imagen'),  function (req, res) {
 
  console.log(req.file);
  req.body.Imagen=(req.file==undefined)?'/images/noUser.jpg':req.file.path;//Aqui se pueden comprimir supongo
  req.body.Contraseña=md5(req.body.Contraseña);//La contraseña se va a guardar en md5 en el servidor
  Usuario.create(req.body,function(err)
  {
    if(err){res.send(err);}
    else{
      console.log('Usuario añadido exitosamente');
      res.redirect('/');
    }
  });

});
//Login petition 
app.get('/Login',function(req,res)
{
  console.log('Entrando al Login');
  res.status(200).render(__dirname + '/views/Login.ejs');
});
//Login request
app.post('/Login',function(req,res)
{
  var UserCorreo=req.body.UserCorreo;
  var contraseña=md5(req.body.Contraseña);
  //Buscar en la base de datos

});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.jade');
});

module.exports = app;
