export default function testRetrieve () {
  describe('Test retrieve method', () => {
    it('Should retrieve some vm results', done => {
      vclient.type('vm').pluck('name')
        .run()
        .then(res => {
          console.log(res)
          return vclient.logout().run().then(() => { done() }, done)
        }, done)
    })
  })
}