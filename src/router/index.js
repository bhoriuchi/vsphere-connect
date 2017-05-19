import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import ApiDoc from '@/components/ApiDoc'
import DocDoc from '@/components/DocDoc'
import FaqDoc from '@/components/FaqDoc'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Main',
      component: Main
    },
    {
      path: '/api',
      name: 'API',
      component: ApiDoc
    },
    {
      path: '/docs',
      name: 'Docs',
      component: DocDoc
    },
    {
      path: '/faq',
      name: 'FAQ',
      component: FaqDoc
    }
  ]
})
