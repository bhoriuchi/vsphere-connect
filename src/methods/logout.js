export default function logout () {
  return this.method('Logout', {
    _this: this.serviceContent.sessionManager
  })
    .then(() => {
      this.loggedIn = false
      return { logout: true }
    })
}