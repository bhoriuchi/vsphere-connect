export default function logout (callback = () => false) {
  return new Promise((resolve, reject) => {
    return this.method('Logout', { _this: this.serviceContent.sessionManager }, (err, result) => {
      let res = { logout: true }
      callback(null, res)
      return resolve(res)
    })
  })
}