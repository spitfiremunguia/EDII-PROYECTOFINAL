

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
var Chat = require('./routes/ChatModel')
var formidable = require('formidable');
var fileUpload = require("express-fileupload");
var localStorage = require('localStorage');
var moment = require('moment');
var jwt = require('jwt-simple');
var jwt_decode = require('jwt-decode');
var edge = require('edge');

var onlineUsers = {};
var sockets = {};

String.prototype.replaceAll = function(search, replacement){
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const fileStorage=multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/chatUploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload = multer({ storage: storage });
var upload1=multer({storage:fileStorage});
var md5 = require('md5')


//Conexión a mongo
var db = "mongodb://localhost:27017/proyectoFinal/Users";//Por el momento esta local
var db = mongoose.connect(db, function (err) {
  if (err) {
    console.log("Ocurrió un error al intentar conectar a la base de datos.");
    console.log("Intente montar la base de datos de manera local.");
  }
});
var jwt_decode = require('jwt-decode');
function crearToken(usuario) {
  console.log(usuario);
  const payload =
    {
      Username: usuario.Username,
      Contraseña: usuario.Contraseña,
      Ini: moment().unix(),
      Exp: moment().add(10, 'm').unix()
    }
  var token = jwt.encode(payload, 'ESTRUCTURAS');
  console.log(token);
  localStorage.setItem('jwt', JSON.stringify(token));
  return;
}

function validar(token) {
  var validacion = JSON.stringify(jwt_decode(token));
  console.log('El token decodificado  es: ' + validacion);
  var date = moment().unix();
  var tokenDate = JSON.parse(validacion).Exp;
  console.log('La fecha actual es: ' + date);
  console.log('La fecha del token es: ' + tokenDate);
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
  console.log( "\x1b[0m",'Server is up');
});
//Llamar a la función de crear usuarios
app.get('/create', function (req, res) {
  console.log("Creando usuario...");
  //Le mando la base de datos para verificar
  res.render(__dirname + '/views/create.ejs',{alert:false,msg:''});
});

var Cipher = edge.func({
  assemblyFile: "lib/DLL Proyecto Final.dll",
  typeName: "DLL_Proyecto_Final.RLE",
  methodName: "CipherD"
});
var Decipher = edge.func({
  assemblyFile: "lib/DLL Proyecto Final.dll",
  typeName: "DLL_Proyecto_Final.RLE",
  methodName: "DecipherD"
});
var Compress = edge.func({
  assemblyFile: "lib/Compressor.dll",
  typeName: "Compressor.Huffman",
  methodName: "HuffmanCompression"
});
var Decompress = edge.func({
  assemblyFile: "lib/Compressor.dll",
  typeName: "Compressor.Huffman",
  methodName: "HuffmanDecompression"
});
var Delete = edge.func({
  assemblyFile: "lib/Compressor.dll",
  typeName: "Compressor.Huffman",
  methodName: "DeleteFile"
});

var upload1=multer({storage:fileStorage}); 


var upload1=multer({storage:fileStorage}); 
app.post('/UploadFile',upload1.single('myfile'),function(req,res){ 
  console.log("Input: "+ __dirname+"\\"+req.file.path);
  console.log("Output: " + __dirname+"\\public\\chatUploads");
  var payload = {
    FilePath: __dirname+"\\"+req.file.path,
    OutputPath: __dirname+"\\public\\chatUploads"
  }
  Compress(payload, function(err, res){
    if(err) console.log(errr);
    else{
      console.log(res);
    }
  });


  var cipheredMessage = "";
  Cipher("<a href='/download"+ req.file.filename+">"+req.file.filename+"'</a>", function (error, result) {
    if (error) throw error;
    cipheredMessage = result;
  });
  var newMsg = new Chat({
    emisor: req.body.emisor,
    receptor: req.body.destinatario,
    msg: cipheredMessage
  });  
  newMsg.save();
  users[req.body.emisor].emit('whisper', {
    nick: req.body.emisor,
    msg: "<a href='/download"+ req.file.filename+"'>"+req.file.filename+"</a>",
    side: "right"
  });  
  users[req.body.destinatario].emit('whisper', {
    nick: req.body.emisor,
    msg: "<a href='/download"+ req.file.filename+"'>"+req.file.filename+"</a>",
    side: "left"
  });
});
//verificar y crear al usuario

app.get('/download:id', function(req, res){
  var a = req.params.id;
  
  var payload = {
    FilePath: __dirname + "/public/chatUploads/" + a+".h.comp",
    OutputPath: __dirname + "/public/chatUploads"  
  }
  console.log("FilePath: " + payload.FilePath);
  console.log("OutputPath: " + payload.OutputPath);
  Decompress(payload, function(err, res){
    if(err) console.log(err);
    else console.log(res);
  });
  var file = __dirname + "/public/chatUploads/" + req.params.id;
  res.download(file, function(err){
    if(err) throw err;
    Delete((__dirname + "/public/chatUploads/" + req.params.id), function(err, res){
      if(!err)
        console.log("File was succesfully deleted");
    });
  });
});

app.post('/createUser', upload.single('Imagen'), function (req, res) {
  console.log(req.file);
  req.body.Imagen = (req.file == undefined) ? '/images/noUser.jpg' : req.file.path;//Aqui se pueden comprimir supongo
  req.body.Contraseña = md5(req.body.Contraseña);//La contraseña se va a guardar en md5 en el servidor
  Usuario.count({ Username: req.body.Username }, function (err, c) {
    if (c == 0) {
      Usuario.create(req.body, function (err, c) {
        if (err) {
          res.send(err);
        }
        else {
          console.log("\x1b[42m", "Usuario añadido exitosamente");
          Usuario.count({ Username: req.body.Username }, function (err, c) {
            console.log(c);
          });
          Usuario.findOne({ Username: req.body.Username, Contraseña: req.body.Contraseña }, function (err, usuario) {
            if (err) {
              res.status(500);
              console.log("ha ocurrido un error");
            }
            else {
              console.log(usuario);
              crearToken(usuario);
            }
          });
          //Aqui se llega a agregar de manera correcta
          res.status(201).redirect('/');
        }
      });
    }
    else {
      console.log("\x1b[43m", "Usuario y existente");
      res.render(__dirname + '/views/create.ejs',{alert:true,msg:'El usuario ya existe!'});//Mandarlo de nuevo a que cree el usuario o algo asi
    }
  });
});
//Login petition 
app.get('/Login', function (req, res) {
  console.log("\x1b[42m", 'Entrando al Login');
  res.status(200).render(__dirname + '/views/Login.ejs');
});
//Login request 
app.post('/Login', function (req, res, next) {
  var UserCorreo = req.body.Usuario;
  var contraseña = md5(req.body.Contraseña);
  Usuario.count({ Username: UserCorreo, Contraseña: contraseña }, function (err, c) {
    if (err) {
      res.status(500);
      console.log("\x1b[31m", 'Error en el Login');
    }
    else {
      if (c == 1) {
        Usuario.findOne({ Username: UserCorreo, Contraseña: contraseña }).exec(function (err, usuario) {
          if (err) {

            next(err);
            console.log('Not found');

            //alert('Usuario o contraseña incorrectos');
            res.status(404).redirect('/Login');
          }
          else {
            console.log('---Obteniendo al usuario: ' + usuario.Username)
            console.log(usuario);
            crearToken(usuario);//Tambien se va a crear un token cuando se logee
            Usuario.find({}).exec(function (err, usuarios) {
              if (err) {
                console.log("\x1b[31m", 'Ha ocurrido un error en la busqueda del usuario: ' + UserCorreo);

              }
              else {
                //console.log(usuarios);
                res.status(200).render(__dirname + '/views/Chat.ejs', { user: usuario, data: usuarios });
              }
            });
          }
        });
      }
      else {
        console.log("\x1b[43m", 'Usuario o contraseña incorrectos');
        res.redirect('/Login');
      }


    }
  });

  //Subir un archivo
  app.post('/chatUpload', function (req, res) {

  });

});
app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
 
  

  socket.nickname = socket
  sockets[socket.id] = socket;


  
  socket.on('send-message', function (data, callback) {
    console.log("Data: " + data);
    var token = localStorage.getItem('jwt');
    console.log('El token actual es: ' + token);
    if (!validar(token)) {
      var dest = '/Login';
      users[data.destinatario].emit('redirect', dest);
    } else {
      console.log(data.destinatario);
      var cipheredMessage = "";
      Cipher(data.message, function (error, result) {
        if (error) throw error;
        cipheredMessage = result;
      });
      if (data.destinatario) {
        var newMsg = new Chat({
          emisor: socket.nickname,
          receptor: data.destinatario,
          msg: cipheredMessage
        });
        newMsg.save(function (err) {
          if (err) console.log(err);
          else {
            users[data.destinatario].emit('whisper', {
              nick: socket.nickname,
              msg: data.message,
              side: "left"
            });
          }
        });
        users[socket.nickname].emit('whisper', {
          nick: socket.nickname,
          msg: data.message,
          side: "right"
        });
      } else {
        console.log("sending a message...");
        io.emit('new-message', {
          nick: socket.nickname,
          msg: data.message,
          side: "left"
        });
      }
    }
  });
  function updateNickNames() {
    io.sockets.emit("usernames", Object.keys(users));
  }
  socket.on('new-user', function (data, callback) {
    console.log("newusermethod");
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

  socket.on('req-load-messages', function (data) {
    console.log("res-load-messages");
    var query = Chat.find({});
    query.sort('-created').exec(function (err, docs) {
      if (err) throw err;
      for (var i = 0; i < docs.length; i++) {
        console.log(docs[i].msg);
        if (docs[i].msg)
          Decipher(docs[i].msg, function (error, result) {
            if (error) throw error;
            docs[i].msg = result;
          });
      }
      socket.emit('res-load-messages', docs);
      console.log(docs);
    });
  });
  socket.on('query-request', function(data){
    
    console.log("Query: " + data.query);
    var outputQuery=[];
    var query=Chat.find({}).sort("-created").exec(function(err, docs){
      for(var i = 0; i < docs.length; i++){
        var tmp = "";
        Decipher(docs[i].msg, function(err, res){
         tmp = res;
        });
        if(tmp.toLowerCase().includes(data.query.toLowerCase())){
          if(docs[i].emisor == data.user || docs[i].receptor == data.user)
            Decipher(docs[i].msg, function(err, res){
              docs[i].msg = res.replaceAll(data.query, "<b>"+data.query+"</b>");
            });
            outputQuery.push(docs[i]);         
        }
      }
      console.log(outputQuery);
      users[data.user].emit('query-response', outputQuery);
    });
    
    

    
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
