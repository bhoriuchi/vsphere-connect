export default function resultHandler (result, callback, resolve) {
  callback(null, result)
  return resolve(result)
}