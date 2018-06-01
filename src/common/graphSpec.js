import _ from 'lodash';

export default function graphSpec(specSet) {
  const types = {};

  _.forEach(_.isArray(specSet) ? specSet : [specSet], _spec => {
    let spec = _spec;
    if (_.isString(spec)) spec = { type: spec };
    if (!spec.type) return;
    if (!_.has(types, spec.type)) {
      _.set(types, spec.type, { ids: [], props: [] });
    }
    if (spec.id) {
      const ids = _.isArray(spec.id) ? spec.id : [spec.id];
      types[spec.type].ids = _.union(types[spec.type].ids, ids);
    }
    if (spec.properties) {
      const props = _.isArray(spec.properties)
        ? spec.properties
        : [spec.properties];
      types[spec.type].props = _.union(types[spec.type].props, props);
    }
  });

  return _.map(types, (obj, type) => {
    return {
      type,
      id: obj.ids,
      properties: obj.props,
    };
  });
}
