export default function errorHandler (err, callback, reject) {
  callback(err)
  return reject(err)
}