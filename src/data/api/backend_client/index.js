import destroy from './destroy'
import login from './login'
import logout from './logout'
import method from './method'
import reload from './reload'
import rename from './rename'
import retrieve from './retrieve'

export default {
  'client.destroy': destroy,
  'client.login': login,
  'client.logout': logout,
  'client.method': method,
  'client.reload': reload,
  'client.rename': rename,
  'client.retrieve': retrieve
}
