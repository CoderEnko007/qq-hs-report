<template>
<div class="container">
  <nav-bar :showCapsule="true" navTitle="我的收藏"></nav-bar>
  <div v-if="collectionList.length>0">
    <div class="deck-list" v-for="(item, index) in collectionList" :key="index">
      <div class="header"><p class="date">{{item.format_time}}</p></div>
      <DeckList :list="item.list" @itemClick="handleDeckClick"></DeckList>
    </div>
  </div>
  <div class="tips" v-else>
    <h1 class="noData">还没有收藏的卡组哦</h1>
  </div>
</div>
</template>
<script>
import utils from '@/utils'
import { mapGetters } from 'vuex'
import DeckList from '@/components/DeckList';
import NavBar from '@/components/NavBar'

export default {
  components: {
    DeckList,
    NavBar
  },
  data() {
    return {
      deckList: [],
      collectionList: []
    }
  },
  computed: {
    ...mapGetters([
      'collectedDecks',
      'navHeight',
      'userInfo',
      'decksName'
    ]),
  },
  methods: {
    formatDeckList() {
      this.collectionList = []
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

          temp = this.collectionList.filter(val => {
            return parseInt(item.created_at/10000) === parseInt(val.created_at/10000)
          })
          if (temp.length <= 0) {
            this.collectionList.push({
              created_at: item.created_at,
              format_time: utils.formatTime(new Date(item.created_at*1000)),
              list: [item]
            })
          } else {
            temp[0].list.push(item)
          }
      }
    },
    genUserCollection() {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.showNavigationBarLoading();
      this.$store.dispatch('getCollectedDecks', this.userInfo.id).then(res => {
        this.deckList = res.list.filter(val => {
          return !(!val || val === "");
        })
        this.formatDeckList()
        wx.hideLoading()
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh();
      }).catch(err => {
        console.log(err)
        wx.hideLoading()
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh();
      })
    },
    handleDeckClick(item) {
      wx.navigateTo({
        url: `/pages/decks/deckDetail/index?id=${item.id}&collected=1`
      })
    },
  },
  onShow() {
    this.genUserCollection()
  },
  onPullDownRefresh() {
    this.genUserCollection()
  },
}
</script>
<style lang="scss" scoped>
.container {
  .deck-list {
    box-sizing:border-box;
    .header {
      margin:0 30rpx;
      .date {
        height: 39rpx;
        font-size: 13px;
        color: #999999;
        margin: 20rpx 0;
      }
    }
  }
  .tips {
    position: relative;
    .noData {
      position: absolute;
      top: 120rpx;
      left:50%;
      transform:translateX(-50%);
      font-size: 16px;
      color: #ddd;
    }
  }
}
</style>
