/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create: function(req, res){
      sails.log.debug('create game API');

      if(!req.params.id)
      	return res.badRequest({code:'BAD_REQUEST', message: 'userId not specified'});
      if(!req.body.game)
      	return res.badRequest({code:'BAD_REQUEST', message: 'game params not specified'});
      if(!req.body.game.rows)
      	return res.badRequest({code: 'BAD_REQUEST', message: 'rows not specified'});
      if(!req.body.game.columns)
      	return res.badRequest({code: 'BAD_REQUEST', message: 'columns not specified'});
      if(!req.body.game.maxPlayers)
      	return res.badRequest({code: 'BAD_REQUEST', message: 'maxPlayers not specified'});
      if(!req.body.game.minPlayers)
      	return res.badRequest({code: 'BAD_REQUEST', message: 'minPlayers not specified'});
      if(!req.body.game.blockTime)
      	return res.badRequest({code: 'BAD_REQUEST', message: 'blockTime not specified'});

      async.auto({
        game: function(callback){
        	var gameToCreate = {
        	  rows: req.body.game.rows,
		      columns: req.body.game.columns,
		      maxPlayers: req.body.game.maxPlayers,
		      minPlayers: req.body.game.minPlayers,
		      blockTime: req.body.game.blockTime
        	};
        	GameService.create(gameToCreate, function(err, game){
	    		if(err)
	    		 return callback(err);
	    		return callback(null, game);
        	});
        },
        user: function(callback){
           UserService.find({id: req.params.id}, function(err, user){
              if(err)
              	return callback(err);
              if(!user)
              	return callback({code:'NOT_FOUND', message:'invalid user id'});
              return callback(null, user);
           });
        },
        registerUser:['game', 'user', function(callback, results){
          GameService.registerUser(results.game.id, results.user.id, callback);
        }]
      },function(err, results){
      	if(err){
          if(err.code){
            if(err.code === 'BAD_REQUEST')
              return res.badRequest(err);
            else if(err.code === 'NOT_FOUND')
              return res.notFound(err);
            else
              return res.serverError(err);
	  	  }
      	}
      	return res.json({status:'created', game: results.game});
      });
	},
	gameList: function(req, res){
	  sails.log.debug('list of games api');
	  Game.find().populate('players').exec(function(err, games){
	  	if(err)
	  	  return res.serverError(err);
	  	return res.json(games);
	  });
	},
	gameDetails: function(req, res){
	  sails.log.debug('Game details api');
	  if(!req.params.id)
	  	return res.badRequest({code:'BAD_REQUEST', message: 'game id not specified'});
	  Game.findOne({id: req.params.id}).populate('players').exec(function(err, game){
	  	if(err)
	  	  return res.serverError(err);
	  	res.json(game);
	  });
	},
	register: function(req, res){
      if(!req.params.id)
      	return res.badRequest({code: 'BAD_REQUEST', message: 'user id not specified'});
      if(!req.params.gid)
	  	return res.badRequest({code:'BAD_REQUEST', message: 'game id not specified'});
	  GameService.registerUser(req.params.gid, req.params.id, function(err, gamePlayer){
	  	if(err){
          if(err.code){
            if(err.code === 'BAD_REQUEST')
              return res.badRequest(err);
            else if(err.code === 'NOT_FOUND')
              return res.notFound(err);
            else
              return res.serverError(err);
	  	  }
	  	}
	  	return res.json({status:'user registered', user:gamePlayer.user, game: gamePlayer.game});
	  });
	}
};

