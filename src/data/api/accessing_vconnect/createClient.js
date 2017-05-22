export default {
  description: 'Returns the backend client',
  usage: ['v.createClient → Client'],
  example: {
    description: 'Access the backend client',
    code: `v.createClient().then(client => {
  return client.logout()
})`
  }
}
