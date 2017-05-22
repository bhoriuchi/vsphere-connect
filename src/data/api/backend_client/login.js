export default {
  description: 'Creates a session or sets the session to use a specific token. Login should be chained before any methods that interact with data in the viserver and should only be called once per client instance unless using to switch token credentials.',
  usage: [
    'client.login(username, password) → Session',
    'client.login(token) → Session'
  ],
  example: {
    description: 'Log in using a username and password',
    code: `let v = VConnect('vcenter01.mydomain.com')
  v.ceateClient().then(client => {
    return client.login('administrator@vsphere.local', 'vmware100')
  })`
  },
  params: {
    username: {
      type: 'String',
      description: 'User name for vSphere server',
      optional: false
    },
    password: {
      type: 'String',
      description: 'Password for vSphere server',
      optional: false
    },
    token: {
      type: 'String',
      description: 'Token for vSphere authentication. Must be obtained using <code>username</code> and <code>password</code> first. Use <code>token</code> command after login to retrieve',
      optional: false
    }
  }
}
