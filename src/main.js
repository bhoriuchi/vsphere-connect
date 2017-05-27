// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import * as VueDeepSet from 'vue-deepset'
import router from './router'
import store from './store'
import '../node_modules/prismjs/themes/prism.css'
import '../static/css/StyleSheet.css'

Vue.config.productionTip = false
Vue.use(VueDeepSet)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})
