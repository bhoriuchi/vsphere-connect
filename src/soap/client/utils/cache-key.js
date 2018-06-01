/*
 * The purpose of this library is to allow the developer to specify
 * or provide a function that can be used to identify the key to store
 * the metadata cache in localstorage
 * when using a function, the done callback should provide the key
 */
import _ from 'lodash';
import request from 'request';
import xmldom from 'xmldom';
import xmlbuilder from 'xmlbuilder';

const tools = {
  lodash: _,
  request,
  xmldom,
  xmlbuilder,
};

export default function cacheKey(key, wsdl, done) {
  if (_.isString(key)) return done(null, key);
  else if (_.isFunction(key)) return key(tools, wsdl, done);
  return done();
}
