
var config 		= require('../config');
var Mongoose 	= require('mongoose');
var logger 		= require('../logger');

var dbURI = "mongodb://127.0.0.1:27017/Tchat"
Mongoose.connect(dbURI);

// Retourne une erreur si la connexion échoue
Mongoose.connection.on('error', function(err) {
	if(err) throw err;
});

Mongoose.Promise = global.Promise;

module.exports = { Mongoose, 
	models: {
		user: require('./schemas/user.js'),
		room: require('./schemas/room.js')
	}
};