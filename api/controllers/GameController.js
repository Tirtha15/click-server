/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');

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
    async.auto({
      game: function(callback){
        Game.findOne({id: req.params.id}).populate('players').exec(function(err, game){
          if(err)
            return callback(err);
          if(!game)
            return callback({code:'BAD_REQUEST', message: 'Invalid game id'});
          return callback(null, game);
        });
      },
      color:['game', function(callback, results){
        var players = [];
        async.map(results.game.players, function(player, mapCb){
          UserColor.findOne({
            user: player.id,
            game: results.game.id
          }).exec(function(err,color){
            if(err)
              return mapCb(err);
            player.color = color;
            players.push(player);
            mapCb();
          });
        }, function(err, results){
            if(err)
              return callback(err);
            return callback(null, players);
        });
      }],
      score:['game', function(callback, results){
        var scores = [];
        async.map(results.game.players, function(player, mapCb){
          GameState.find({
            user: player.id,
            game: results.game.id
          }).exec(function(err, gs){
            if(err)
              return mapCb(err);
            player.score = gs;
            scores.push(gs);
            return mapCb();
          });
        }, function(err, results){
          if(err)
            return callback(err);
          callback(null, scores);
        });
      }],
      SquareColors: function(callback){
        GameState.find({game: req.params.id}).exec(function(err, gs){
          if(err)
            return callback(err);
          var transform = {};
          _.forEach(gs, function(g){
             transform[g.squareId] = g.color;
          });
          return callback(null, transform);
        });
      }
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
      var response = {
        game: results.game,
        state: results.SquareColors
      };
      res.json(response);
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
	},
  click: function(req, res){
    var userId = req.params.id;
    var gameId = req.params.gid;
    var sqId = req.body.sqId;

    async.auto({
      user: function(callback){
        User.findOne({id: userId}).exec(function(err, user){
          if(err)
            return callback(err);
          if(!user)
            return callback({code:'BAD_REQUEST', message: 'Invalid user id'});
          return callback(null, user);
        });
      },
      game: function(callback){
        Game.findOne({id: gameId}).populate('players').exec(function(err, game){
          if(err)
            return callback(err);
          if(!game)
            return callback({code:'BAD_REQUEST', message: 'Invalid game id'});
          var player = _.filter(game.players, function(player){
            return player.id == userId;
          });
          if (player.length != 1)
            return callback({code:'BAD_REQUEST', message: 'user not player of this game'});
          return callback(null, game);
        });
      },
      click:['user', 'game', function(callback, results){
        if (sqId < 0 || sqId > results.game.rows * results.game.columns)
          return callback({code:'BAD_REQUEST', message: 'Invalid square'});
        GameService.click(results.game.id, results.user.id, sqId, function(err, gamePos){
          if(err)
            return callback(err)
          return (null, callback);
        });
      }],
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
      return res.json({ok:1});
    });
  },
};

