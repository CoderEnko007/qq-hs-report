import { getSetting, getArenaConfig } from "../../api/dbapi";

const settings = {
  state: {
    navHeight: null,
    tabHeight: null,
    isIphoneX: false,
    winWidth: null,
    winHeight: null,
    showBubble: true,
    fbiVersion: null,
    fbiKey: null,
    fbiFlag: true,
    arenaTableID: 70488,
    card_resource: null,
    ifanr_arena_card_resource: false,
    adsOpenFlag: true,
  },
  mutations: {
    setAdsOpenFlag: (state, val) => {
      state.adsOpenFlag = val
    },
    setShowBubbleFlag: (state, val) => {
      state.showBubble = val
    },
    SET_NAV_HEIGHT: (state, navHeight) => {
      state.navHeight = navHeight
    },
    SET_TAB_HEIGHT: (state, val) => {
      state.tabHeight = val
    },
    IS_IPHONE_X: (state) => {
      state.isIphoneX = true
    },
    SET_WIN_WIDTH: (state, val) => {
      state.winWidth = val
    },
    SET_WIN_HEIGHT: (state, val) => {
      state.winHeight = val
    },
    SET_FBI_VERSION: (state, val) => {
      state.fbiVersion = val
    },
    SET_FBI_KEY: (state, val) => {
      state.fbiKey = val
    },
    SET_FBI_FLAG: (state, val) => {
      state.fbiFlag = val
    },
    SET_CARD_RESOURCE: (state, val) => {
      state.card_resource = val
    },
    SET_ARENA_TABLEID: (state, val) => {
      state.arenaTableID = val
    },
    SET_IFANR_ARENA_CARD_RESOURCE: (state, val) => {
      state.ifanr_arena_card_resource = val
    }
  },
  actions: {
    setNavHeight({commit, state}) {
      return new Promise((resolve, reject) => {
        uni.getSystemInfo({
          success: res => {
            //导航高度
            let navHeight = res.statusBarHeight + 46;
            // let navHeight = res.statusBarHeight*2+25
            commit('SET_NAV_HEIGHT', navHeight)
            if (res.model === 'iPhone X') {
              commit('IS_IPHONE_X')
            }
            resolve(navHeight)
          }, fail(err) {
            console.log(err);
            reject(err)
          }
        })
      })
    },
    setWinWidthHeight({commit, state}) {
      return new Promise((resolve, reject) => {
        uni.getSystemInfo({
          success: res => {
            commit('SET_WIN_WIDTH', res.windowWidth)
            commit('SET_WIN_HEIGHT', res.windowHeight)
            commit('SET_TAB_HEIGHT', res.screenHeight-res.windowHeight)
            resolve()
          }, fail(err) {
            console.log(err)
            reject(err)
          }
        })
      })
    },
    setSystemSetting({commit, state}) {
      return new Promise((resolve, reject) => {
        getSetting().then(res => {
          if (res.objects.length > 0) {
            commit('SET_FBI_VERSION', res.objects[0].fbi_version)
            commit('SET_FBI_KEY', res.objects[0].fbi_key)
            commit('SET_FBI_FLAG', res.objects[0].fbi_card_switch)
            commit('SET_CARD_RESOURCE', res.objects[0].card_resource)
            commit('SET_ARENA_TABLEID', res.objects[0].arena_table_id)
            commit('SET_IFANR_ARENA_CARD_RESOURCE', res.objects[0].ifanr_arena_card_resource)
          }
          resolve(res.objects)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      })
    },
  }
}

export default settings
