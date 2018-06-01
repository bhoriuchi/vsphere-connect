import _ from 'lodash';

export default function orderDoc(doc) {
  return {
    fields: _.keys(doc),
    directions: _.map(doc, dir => {
      return dir === 'desc' || dir === -1 ? 'desc' : 'asc';
    }),
  };
}
