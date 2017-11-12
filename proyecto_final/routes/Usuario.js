var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var UsuarioSchema = new Schema({
	Nombre: String,
	Apellido: String,
	Username: String,
	Correo: String,
    Contraseña: String,
    Imagen:String
	
});


module.exports = mongoose.model('Usuario', UsuarioSchema);