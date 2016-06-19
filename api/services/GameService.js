module.exports = {
	create : function(params, cb){
      if(!params.rows)
      	return cb({code: 'BAD_REQUEST', message: 'rows not specified'});
      if(!params.columns)
      	return cb({code: 'BAD_REQUEST', message: 'columns not specified'});
      if(!params.maxPlayers)
      	return cb({code: 'BAD_REQUEST', message: 'maxPlayers not specified'});
      if(!params.minPlayers)
      	return cb({code: 'BAD_REQUEST', message: 'minPlayers not specified'});
      if(!params.blockTime)
      	return cb({code: 'BAD_REQUEST', message: 'blockTime not specified'});

      var game = {
      	rows: params.rows,
      	columns: params.columns,
      	maxPlayers: params.maxPlayers,
      	minPlayers: params.minPlayers,
      	blockTime: params.blockTime
      };

      Game.create(game).exec(cb);
	},
	registerUser: function(gameId, userId, cb){
		if(!gameId)
		  return cb({code:'BAD_REQUEST', message: 'game id not defined'});
		if(!userId)
		  return cb({code:'BAD_REQUEST', message: 'user id not defined'});
		async.auto({
			game: function(callback){
				Game.findOne({id: gameId}).exec(function(err, game){
					if(err)
					  return callback(err);
					if(!game)
					  return callback({code: 'NOT_FOUND', message: 'invalid game id'});
					return callback(null, game);
				});
			},
			user: function(callback){
				User.findOne({id: userId}).exec(function(err, user){
					if(err)
					  return callback(err);
					if(!user)
					  return callback({code: 'NOT_FOUND', message: 'invalid user id'});
					return callback(null, user);
				});
			},
			register:['game', 'user', function(callback, results){
				results.game.players.add(results.user.id);
				results.game.save(function(err, regPlayer){
					if(err)
					  return callback(err);
                    return callback(null, regPlayer);
				});
			}]
		}, cb);
	}
};