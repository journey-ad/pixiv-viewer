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
    searchHistory: LocalStorage.get('__PIXIV_searchHistory', []),
    SETTING: LocalStorage.get('__PIXIV_SETTING', {
      r18: false,
      r18g: false
    })
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
    setSearchHistory(state, obj) {
      if (obj === null) {
        state.searchHistory = []
        LocalStorage.remove('__PIXIV_searchHistory')
      } else {
        if (state.searchHistory.includes(obj)) return false
        if (state.searchHistory.length >= 20) state.searchHistory.shift()
        state.searchHistory.push(obj)
        LocalStorage.set('__PIXIV_searchHistory', state.searchHistory)
      }
    },
    saveSETTING(state, obj) {
      state.SETTING = obj
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
    setSearchHistory({ commit }, value) {
      commit('setSearchHistory', value)
    },
    saveSETTING({ commit }, value) {
      commit('saveSETTING', value)
    }
  },
  modules: {
  }
})
