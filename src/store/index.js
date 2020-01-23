import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    pond: null,
  },
  getters: {
    selectedPond: state => {
      return state.pond;
    },
    hasSelectedPond: state => {
      return state.pond !== null;
    }
  },
  mutations: {
    setPond(state, pond) {
      state.pond = pond;
    }
  },
  actions: {
  },
  modules: {
  }
})
