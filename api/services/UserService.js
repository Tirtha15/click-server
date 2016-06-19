module.exports = {
 create: function(params, cb){
 	if(!params.name)
 		return cb({ code: 'BAD_REQUEST', message: 'name not provided.'});
 	if(!params.ip)
 		return cb ({code:'BAD_REQUEST', message: 'ip not provided'});
 	User.create({
 		ip: params.ip,
 		name: params.name
 	}).exec(function(err, createdUser){
 		if(err)
 			return cb(err);
 		return cb(null, createdUser);
 	});
 },
 find: function(params, cb){
 	var user = {};
 	if(params.id)
 		user.id = params.id;
 	else if(params.name)
 		user.name = params.name;
 	else if(params.ip)
 		user.ip = user.ip;
 	else
 		return cb({code: 'BAD_REQUEST', message: 'no identifier specified'});
 	User.findOne(user).populate('games').exec(cb);
 }
}