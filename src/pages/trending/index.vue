<template>
  <div class="container">
    <NavBar></NavBar>
    <div class="banner">
      <div class="meta">
        <h1>热门套牌</h1>
        <p class="date">{{updateDate}}</p>
        <p class="desc">最近48小时内热度持续上升的精选套牌</p>
      </div>
    </div>
    <div class="deck-list">
      <DeckList :list="deckList" @itemClick="handleDeckClick"></DeckList>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import utils from '@/utils'
import {getTrendingList} from "@/api/dbapi";
import DeckList from '@/components/DeckList';
import NavBar from '@/components/NavBar'

export default {
  components: {
    DeckList,
    NavBar,
  },
  data() {
    return {
      deckList: [],
      report_date: '',
      interstitialAd: null,
    }
  },
  computed: {
    ...mapGetters([
      'decksName',
      'navHeight'
    ]),
    updateDate() {
      if (this.report_date) {
        let formatDate = new Date(this.report_date)
        return formatDate.getMonth()+1 + '月' + formatDate.getDate() + '日更新'
      }
    },
    adsOpenFlag() {
      return utils.adsOpenFlag
    },
  },
  methods: {
    formatDeckList() {
      for (let item of this.deckList) {
        item.image = utils.faction[item.faction].image
        let temp = this.decksName.filter(val => {
          return val.ename === item.deck_name
        })
        if (temp[0] && temp[0].cname) {
          item.cname = temp[0].cname
        } else {
          item.cname = item.deck_name
        }
        item.win_rate = item.win_rate.toFixed(1)
      }
    },
    genTrendingList() {
      qq.showNavigationBarLoading();
      getTrendingList().then(res => {
        this.deckList = res.list
        this.formatDeckList()
        this.report_date = res.date
        qq.stopPullDownRefresh();
        qq.hideNavigationBarLoading()
      }).catch(err => {
        console.log(err)
        qq.stopPullDownRefresh();
        qq.hideNavigationBarLoading()
      })
    },
    handleDeckClick(item) {
      qq.navigateTo({
        url: `/pages/decks/deckDetail/index?id=${item.id}&trending=1`
      })
    }
  },
  mounted() {
    this.genTrendingList()
    if (this.interstitialAd) {
      this.interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
  },
  onLoad() {
    if (uni.createInterstitialAd) {
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-47f9875b7cdea202'
      })
    }
  },
  onPullDownRefresh() {
    this.genTrendingList()
  },
  onShareAppMessage(res) {
    return {
      title: '炉石传说情报站',
      path: '/pages/trending/index'
    }
  },
}
</script>
<style lang="scss" scoped>
@import '../../style/color';
.banner {
  position: relative;
  width: 100%;
  height: 325rpx;
  overflow: hidden;
  background: url("https://cloud-minapp-18282.cloud.ifanrusercontent.com/1gBxG4I1yASfPkMn.jpg") no-repeat 0 0;
  background-size: 100%;
  .meta {
    position: relative;
    width: 100%;
    height: 100%;
    padding-top: 64rpx;
    padding-left: 30rpx;
    color: #fff;
    box-sizing:border-box;
    h1 {
      height: 56rpx;
      line-height: 56rpx;
      font-size: 28px;
      font-weight: bold;
    }
    p.date {
      height: 44rpx;
      line-height: 44rpx;
      font-size: 13px;
      margin-top: 9rpx;
    }
    p.desc {
      position: absolute;
      height: 44rpx;
      right: 30rpx;
      bottom: 30rpx;
      font-size: 13px;
    }
  }
}
.deck-list {
  width: 100%;
  box-sizing:border-box;
  overflow: hidden;
  z-index: -1;
}
</style>
