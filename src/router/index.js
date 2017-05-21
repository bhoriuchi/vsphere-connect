import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import ApiDoc from '@/components/ApiDoc'
import DocDoc from '@/components/DocDoc'
import FaqDoc from '@/components/FaqDoc'
import FullApiDoc from '@/components/FullApiDoc'
import SummaryApiDoc from '@/components/SummaryApiDoc'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/vsphere-connect/',
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main
    },
    {
      path: '/api',
      component: ApiDoc,
      children: [
        {
          path: '',
          component: SummaryApiDoc
        },
        {
          path: '/api/:command',
          component: FullApiDoc
        }
      ]
    },
    {
      path: '/docs',
      name: 'docs',
      component: DocDoc
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqDoc
    },
    {
      path: '*',
      redirect: '/'
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
      }
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  }
})
