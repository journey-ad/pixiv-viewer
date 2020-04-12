import Vue from 'vue'
import Vuex from 'vuex'
import { LocalStorage } from '@/utils/storage'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    themeColor: '#0196fa',
    galleryList: [],
    currentIndex: -1,
    $swiper: null,
    SETTING: {
      r18: false
    }
  },
  getters: {
    currentId: state => state.galleryList[state.currentIndex] ? state.galleryList[state.currentIndex].id : -1,
    isCensored: state => artwork => {
      if (artwork.x_restrict === 1) {
        return state.SETTING.r18 ? false : true;
      } else if (artwork.x_restrict === 2) {
        return state.SETTING.r18g ? false : true;
      } else {
        return false;
      }
    }
  },
  mutations: {
    setGalleryList(state, { list, id }) {
      state.galleryList = list
      id && this.commit('setCurrentIndex', id)
    },
    setCurrentIndex(state, id) {
      state.currentIndex = state.galleryList.findIndex(artwork => artwork.id === id)
    },
    setSwiper(state, obj) {
      state.$swiper = obj
    },
    SETTING(state, { key, val }) {
      state.settings[key] = val
      LocalStorage.set('__PIXIV_SETTING', state.SETTING)
    }
  },
  actions: {
    setGalleryList({ commit }, { list, id }) {
      commit('setGalleryList', { list, id })
    },
    setCurrentIndex({ commit }, value) {
      commit('setCurrentIndex', value)
    },
    setSwiper({ commit }, value) {
      commit('setSwiper', value)
    },
    SETTING({ commit }, { key, val }) {
      commit('SETTING', { key, val })
    }
  },
  modules: {
  }
})
