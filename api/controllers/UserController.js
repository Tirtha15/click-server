/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create: function(req, res){
	  sails.log.debug("User create Api");
      if(!req.ip)
        return res.badRequest('ip not found');
      if(!req.body.name)
      	return res.badRequest('name not provided.');
      async.auto({
      	checkUser: function(callback){
          User.findOne({
          	name: req.body.name
          }).exec(function(err, user){
           if(err)
           	return callback(err);
           if(user)
           	return callback({code: 'BAD_REQUEST', message: 'name already exist'});
           return callback();
          });
      	},
      	createUser:['checkUser', function(callback, results){
          var user = {
          	ip: req.ip,
          	name: req.body.name
          };
          UserService.create(user, function(err, user){
          	if(err)
          	  return callback(err);
          	return callback(null, user);
          });
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
        return res.json({status: 'user created', user: results.createUser});
      });    
	},
	find: function(req,res){
     sails.log.debug('Get user api');
     UserService.find({
     	id: req.params.id
     }, function(err, user){
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
     	res.json(user);
     });
	}
};

