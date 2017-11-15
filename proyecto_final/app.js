//import { Client } from '_debugger';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate');
var mongoose = require('mongoose');
var Usuario = require('./routes/Usuario')
var index = require('./routes/index');
var users = require('./routes/users');
var multer = require('multer');
var localStorage = require('localStorage');
var moment = require('moment');
var jwt=require('jwt-simple');

var onlineUsers = {};
var sockets = {};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage });
var md5 = require('md5')


//Conexión a mongo
var db = "mongodb://localhost:27017/proyectoFinal/Users";//Por el momento esta local
var db = mongoose.connect(db, function (err) {
  if (err) {
    console.log("Ocurrió un error al intentar conectar a la base de datos.");
    console.log("Intente montar la base de datos de manera local.");
  }
});
var jwt_decode=require('jwt-decode');
function crearToken(usuario) {
  console.log(usuario);
  const payload =
    {
      Username: usuario.Username,
      Contraseña: usuario.Contraseña,
      Ini: moment().unix(),
      Exp: moment().add(1,'m').unix()
    }
  var token = jwt.encode(payload, 'ESTRUCTURAS');
  console.log(token);
  localStorage.setItem('jwt', JSON.stringify(token));
  return;
}

function validar(token) {
  var validacion = JSON.stringify(jwt_decode(token));
  console.log('El token decodificado  es: '+validacion);
  var date = moment().unix();
  var tokenDate=JSON.parse(validacion).Exp;
  console.log('La fecha actual es: ' +date);
  console.log('La fecha del token es: '+tokenDate);
  if (date > tokenDate) {
    return false;
  }
  return true;

}










var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var q = 0;

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
server.listen(8000, function () {
  console.log('Server is up');
});
//Llamar a la función de crear usuarios
app.get('/create', function (req, res) {
  console.log("Creando usuario...");
  //Le mando la base de datos para verificar
  res.render(__dirname + '/views/create.ejs');
});
//verificar y crear al usuario
app.post('/createUser', upload.single('Imagen'), function (req, res) {

  console.log(req.file);
  req.body.Imagen = (req.file == undefined) ? '/images/noUser.jpg' : req.file.path;//Aqui se pueden comprimir supongo
  req.body.Contraseña = md5(req.body.Contraseña);//La contraseña se va a guardar en md5 en el servidor
  Usuario.count({ Username: req.body.Username }, function (err, c) {
    if (c == 0) {
      Usuario.create(req.body, function (err) {
        if (err) { res.send(err); }
        else {
          console.log('Usuario añadido exitosamente');
          Usuario.findOne({ Username: req.body.Username, Contraseña: req.body.Contraseña }).exec(function (err, usuario) {
            if(err)
            {
              res.status(500);
              console.log('Ha ocurrido un error')
            }
            else
            {
              crearToken(usuario);//Aqui es donde se crea el jwt
            }

          });
          res.status(201).redirect('/');
        }
      });
    } else {
      console.log("Usuario ya existe");
    }
  });
});
//Login petition 
app.get('/Login', function (req, res) {
  console.log('Entrando al Login');
  res.status(200).render(__dirname + '/views/Login.ejs');
});
//Login request
app.post('/Login', function (req, res, next) {
  var UserCorreo = req.body.Usuario;
  var contraseña = md5(req.body.Contraseña);
  Usuario.findOne({ Username: UserCorreo, Contraseña: contraseña }).exec(function (err, usuario) {
    if (err) {

      next(err);
      console.log('Not found');
      res.status(404);
    }
    else {
      console.log('---Obteniendo al usuario: ' + usuario.Username)
      console.log(usuario);
      crearToken(usuario);//Tambien se va a crear un token cuando se logee
      Usuario.find({}).exec(function (err, usuarios) {
        if (err) {
          console.log('Ha ocurrido un error');

        }
        else {
          //console.log(usuarios);
          res.status(200).render(__dirname + '/views/Chat.ejs', { user: usuario, data: usuarios });
        }
      });
    }
  });
  //Buscar en la base de datos

});
app.use(express.static(__dirname + '/public'));
io.sockets.on('connection', function (socket) {
  console.log("User connected");
  socket.nickname = "usuario " + (q++);
  sockets[socket.id] = socket;

  socket.on('send-message', function (data, callback) {
    var token=localStorage.getItem('jwt');
    console.log('El token actual es: '+token);
    if(!validar( token) )
    {
      var dest='/Login';
      io.emit('redirect',dest);
      
    }
    else
    {
      console.log('adelante we...');
    }

    console.log("sending a message...");
    io.emit('new-message', {
      nick: socket.nickname,
      msg: data,
      side: "left"
    });
  });
  function updateNickNames() {
    io.sockets.emit("usernames", Object.keys(users));
  }
  socket.on('new-user', function (data, callback) {
    if (data in users) {
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;
      updateNickNames();
    }
  });

  
  socket.on('disconnect', function (data) {
    console.log("Disconnected");
    if (!socket.nickname) return;
    delete users[socket.nickname];
    updateNickNames();
  });
 




});

app.get('/Chat', function (req, res) {
  res.render('chat.ejs');
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
