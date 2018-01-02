
var roomModel   = require('../database').models.room;
var User 		= require('../models/user');

var create = function (data, callback){
	var newRoom = new roomModel(data);
	newRoom.save(callback);
};

var find = function (data, callback){
	roomModel.find(data, callback);
}

var findOne = function (data, callback){
	roomModel.findOne(data, callback);
}

var findById = function (id, callback){
	roomModel.findById(id, callback);
}

var findByIdAndUpdate = function(id, data, callback){
	roomModel.findByIdAndUpdate(id, data, { new: true }, callback);
}

var addUser = function(room, socket, callback){
	
	// Retourne l'id de l'utilisateur actuel
	var userId = socket.request.session.passport.user;
	
	var conn = { userId: userId, socketId: socket.id};
	room.connections.push(conn);
	room.save(callback);
}

var getUsers = function(room, socket, callback){

	var users = [], vis = {}, cunt = 0;
	var userId = socket.request.session.passport.user;

	// Boucle sur chaque connexion
	room.connections.forEach(function(conn){

		// Compter le nombre de connexions de l'utilisateur actuel
		if(conn.userId === userId){
			cunt++;
		}

		// Création d'un tableau qui contient les id des utilisateurs
		if(!vis[conn.userId]){
			users.push(conn.userId);
		}
		vis[conn.userId] = true;
	});

	users.forEach(function(userId, i){
		User.findById(userId, function(err, user){
			if (err) { return callback(err); }
			users[i] = user;
			if(i + 1 === users.length){
				return callback(null, users, cunt);
			}
		});
	});
}

var removeUser = function(socket, callback){

	// Retourne l'id de l'utilisateur actuel
	var userId = socket.request.session.passport.user;

	find(function(err, rooms){
		if(err) { return callback(err); }

		// Boucle sur chaque canal
		rooms.every(function(room){
			var pass = true, cunt = 0, target = 0;

			// Compter le nombre de connexions pour l'utilisateur actuel
			room.connections.forEach(function(conn, i){
				if(conn.userId === userId){
					cunt++;
				}
				if(conn.socketId === socket.id){
					pass = false, target = i;
				}
			});

			// Vérifier si le canal actuel à un statut deconnecté dans le socket 
			if(!pass) {
				room.connections.id(room.connections[target]._id).remove();
				room.save(function(err){
					callback(err, room, userId, cunt);
				});
			}

			return pass;
		});
	});
}

module.exports = { 
	create, 
	find, 
	findOne, 
	findById, 
	addUser, 
	getUsers, 
	removeUser 
};