import Vue from 'vue'
import Vuex from 'vuex'
import { extendMutation } from 'vue-deepset'

Vue.use(Vuex)

const state = {
  data: {
    mobileNavShow: false
  }
}

const mutations = extendMutation({})

const actions = {}

const getters = {}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
