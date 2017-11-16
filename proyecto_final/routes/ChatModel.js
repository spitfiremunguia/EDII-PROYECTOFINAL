var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var ChatSchema = new Schema({
    emisor: String,
    receptor: String,
    msg: String,
    created: {type: Date, default: Date.now}	
});


module.exports = mongoose.model('Chat', ChatSchema);