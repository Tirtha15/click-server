var uuid = require('node-uuid');
var moment = require('moment');
/**
 * Return a uuid v4 string based on Section 4.4 of RFC4122 [ http://www.ietf.org/rfc/rfc4122.txt ]
 *
 *     utils.uuid();
 *     // => "109156be-c4fb-41ea-b1b4-efe1671c5826"
 *
 * @param
 * @return {String}
 */
exports.uuid = function() {
    return uuid.v4();
  }
  /**
   * Return true/false based on whether or not the passed string is a valid uuid v4 string based on Section 4.4 of RFC4122 [ http://www.ietf.org/rfc/rfc4122.txt ]
   *
   *     utils.isuuid("109156be-c4fb-41ea-b1b4-efe1671c5826");
   *     // => true
   *
   * @param {String} str
   * @return {Boolean}
   */
exports.isuuid = function(str) {
    var regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    return regex.test(str);
  }
  /**
   * Return a unique identifier with the given `len`.
   *
   *     utils.uid(10);
   *     // => "FDaS435D2z"
   *
   * @param {Number} len
   * @return {String}
   */
exports.uid = function(len) {
  var buf = [],
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    charlen = chars.length;
  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }
  return buf.join('');
};
/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uidLight(10);
 *     // => "GHAS4F5D24"
 *
 * @param {Number} len
 * @return {String}
 */
exports.uidLight = function(len) {
  var buf = [],
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    charlen = chars.length;
  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }
  return buf.join('');
};
