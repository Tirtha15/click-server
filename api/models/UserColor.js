/**
 * UserColor.js
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
    game:{
      model: 'game'
    },
    user:{
      model: 'user'
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
    values.id = utils.uuid();
    next();
  }
};

