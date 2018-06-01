import _ from 'lodash';
import Promise from 'bluebird';
import PropertyFilterSpec from '../objects/PropertyFilterSpec';
import graphSpec from '../common/graphSpec';
import convertRetrievedProperties from '../common/convertRetrievedProperties';
import orderDoc from '../common/orderDoc';

function getResults(result, objects, limit, skip, nth, orderBy, moRef, fn) {
  if (!result) return Promise.resolve(objects);
  let objs = _.union(objects, convertRetrievedProperties(result, moRef));
  const _this = this.serviceContent.propertyCollector;

  if (result.token) {
    return this.method('ContinueRetrievePropertiesEx', {
      _this,
      token: result.token,
    }).then(results => {
      return getResults.call(
        this,
        results,
        objs,
        limit,
        skip,
        nth,
        orderBy,
        moRef,
        fn,
      );
    });
  }

  objs = orderBy ? _.orderBy(objs, orderBy.fields, orderBy.directions) : objs;

  if (nth !== null) {
    return Promise.resolve(_.nth(objs, nth));
  }

  const results = _.slice(objs, skip || 0, limit || objs.length);
  return Promise.resolve(fn(results));
}

export default function retrieve(args, options) {
  const _args = _.isObject(args) ? _.cloneDeep(args) : {};
  const _options = _.isObject(options) ? _.cloneDeep(options) : {};

  let limit = _options.limit;
  const skip = _options.skip || 0;
  const nth = _.isNumber(_options.nth) ? Math.ceil(_options.nth) : null;
  const properties = _.get(_args, 'properties', []);
  const moRef = true;
  const orderBy = _options.orderBy ? orderDoc(_options.orderBy) : null;
  const fn = _.isFunction(_options.resultHandler)
    ? _options.resultHandler
    : result => result;
  _args.properties = _.without(
    properties,
    'moRef',
    'id',
    'moRef.value',
    'moRef.type',
  );

  if (_.isNumber(skip) && _.isNumber(limit)) limit += skip;

  const retrieveMethod = this._VimPort.RetrievePropertiesEx
    ? 'RetrievePropertiesEx'
    : 'RetrieveProperties';
  const specMap = _.map(
    graphSpec(_args),
    s => PropertyFilterSpec(s, this).spec,
  );
  const _this = this.serviceContent.propertyCollector;

  return Promise.all(specMap).then(specSet => {
    return this.method(retrieveMethod, { _this, specSet, options: {} }).then(
      result => {
        return getResults.call(
          this,
          result,
          [],
          limit,
          skip,
          nth,
          orderBy,
          moRef,
          fn,
        );
      },
    );
  });
}
