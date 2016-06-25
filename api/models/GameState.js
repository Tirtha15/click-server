/**
 * GameState.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id:{
      type: 'string',
      size: 36,
      primaryKey: true,
      unique: true,
    },
    squareId: 'integer',
    user:{
      model: 'user'
    },
    game:{
      model: 'game'
    },
    color:{
    	type: 'string'
    }
  },
  beforeCreate: function(values, next) {
    if (values.id) {
      delete values.id;
    }
    if (values.createdAt) {
      delete values.createdAt;
    }
    if (values.updatedAt) {
      delete values.updatedAt;
    }
    if (values.color) {
      delete values.color;
    }
    values.id = utils.uuid();
    UserColor.findOne({
    	game: values.game,
    	user: values.user
    }).exec(function(err, uc){
    	if(err)
    		return next(err)
    	values.color = uc.color;
    	Game.update({id: values.game}, {lastClick: new Date()}).exec(next);
    });
  }
};

