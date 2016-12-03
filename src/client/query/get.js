import _ from 'lodash'

export default function get (client, type, id, properties) {
  return client.retrieve({ type, id, properties })
    .then((result) => {
      return _.get(result, '[0]', null)
    })
    .catch(Promise.reject)
}