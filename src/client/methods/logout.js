export default function logout () {
  return this.method('Logout', { _this: this.serviceContent.sessionManager })
    .then(() => ({ logout: true }))
}