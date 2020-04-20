<template>
  <div class="archetype-container">
    <div class="headline">
      <span class="title">职业形态</span>
      <div class="filter-picker">
        <picker mode="selector" :value="rangePicker.selectedItem" :range="rangePickerList" @change="handleRankRangeChange">
          <span class='selector-item'>标准模式 {{rangePicker.list[rangePicker.selectedItem].text}}</span>
          <span class="iconfont" :style="{'vertical-align': 'middle'}">&#xe668;</span>
        </picker>
      </div>
      <!-- <span class="right-meta">标准模式</span> -->
    </div>
    <div class="panel-faction">
      <HeroesPanel :dataList="factionIcons" :selected="selectedFaction.id" @itemClick="handleIconsClick"></HeroesPanel>
    </div>
    <div class="panel-block">
      <div class="filter-item">
        <div class="table-td table-name"><span>{{selectedFaction.name}}形态</span></div>
      </div>
      <div class="filter-item" v-for="(item, index) in orderFilter" :key="index" @click="handleOrderChange(item)">
        <div class="order-item">
          <span>{{item.name}}</span>
          <img v-if="orderBy && orderBy === item.id" :src="upOrder" mode="aspectFit">
          <img v-else-if="orderBy === '-'+item.id" :src="downOrder" mode="aspectFit">
          <img v-else :src="normalOrder" mode="aspectFit">
        </div>
      </div>
    </div>
    <div class="panel-list">
      <scroll-view scroll-y='true'
        @scrolltolower='scrollToBottom'
        @scrolltoupper="scrollToTop"
        :style="{height: winHeight-navHeight-194+'px'}">
        <div class="table">
          <div class="table-tr content" v-for="(item, index) in genTableData" :key="index" @click="handleItemClick(item)">
            <div class="table-td col-1st">
              <img :src="genFactionIcon" mode="aspectFit">
              <div class="deckName">
                <p class="cname">{{item.deckName}}</p>
                <p class="ename">{{item.ename}}</p>
              </div>
            </div>
            <div class="table-td text-center col-other"><span>{{item.games}}</span></div>
            <div class="table-td text-center col-other"><span>{{item.popularity}}%</span></div>
            <div class="table-td text-center col-other col-last color-green" :class="{'color-red': item.winrate<50}">
              <span :style="{'font-weight': 'bold'}">{{item.winrate}}%</span>
            </div>
          </div>
        </div>
        <load-more v-if="loading" :loading='true' />
        <load-more v-else :nomore='true' />
      </scroll-view>
    </div>
  </div>
</template>
<script>
  import utils from '@/utils'
  import { mapGetters } from 'vuex'
  import HeroesPanel from '@/components/HeroesPanel'
  import DeckTable from '@/components/DeckTable'
  import { getWinRateData } from "@/api/dbapi";
  import loadMore from '@/components/load-more.vue'

  export default {
    name: 'ArchetypeList',
    props: ['listData'],
    components: {
      HeroesPanel,
      DeckTable,
      loadMore
    },
    data() {
      return {
        orderBy: '',
        normalOrder: '/static/icons-v2/rank-normal.png',
        upOrder: '/static/icons-v2/rank-up.png',
        downOrder: '/static/icons-v2/rank-down.png',
        factionIcons: [],
        selectedFaction: { id: 'Druid', name: '德鲁伊', data: [] },
        orderFilter: [
          { id: 'games', name: '对局数' },
          { id: 'popularity', name: '热度' },
          { id: 'winrate', name: '胜率' },
        ],
        rangePicker: {
          selectedItem: 0,
          list: [
            { text: '全分段', rank_range: 'All' },
            { text: 'R10-R6分段', rank_range: 'Six_Through_Ten' },
            { text: 'R5-R1分段', rank_range: 'One_Through_Five' },
            { text: '传说分段', rank_range: 'Legend_Only' }
          ]
        },
        tempSelectedItem: 0,
        loading: true,
        videoAd: null
      }
    },
    computed: {
      ...mapGetters([
        'decksName',
        'navHeight',
        'winWidth',
        'winHeight'
      ]),
      genTableData() {
        this.sortTableData()
        return this.selectedFaction.data
      },
      genFactionIcon() {
        return utils.faction[this.selectedFaction.id].image
      },
      rangePickerList() {
        return this.rangePicker.list.map(item => {
          return item.text
        })
      }
    },
    methods: {
      async initVideoAds() {
        if (qq.createRewardedVideoAd) {
          this.videoAd = qq.createRewardedVideoAd({
            adUnitId: 'de472ebbad6af5063148af11428da951'
          })
          this.videoAd.onClose(async (status) => {
            console.log('激励视频关闭', status)
            if (status && status.isEnded || status === undefined) {
              let now = new Date()
              try {
                wx.setStorageSync('ads_video_date', new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()/1000)
              } catch (e) {
                console.log(e)
              }
              this.rangePicker.selectedItem = this.tempSelectedItem
              this.genWinRateData()
            } else {
              wx.showToast({
                title: '没有完整播放视频哦，喵。。。',
                icon: 'none',
                duration: 2500
              })
            }
          })
          this.videoAd.onError((res) => {
            console.log('激励视频错误', res)
            this.rangePicker.selectedItem = this.tempSelectedItem
            this.genWinRateData()
            wx.showToast({
              title: '出了点小问题，无法播放激励视频',
              icon: 'none',
              duration: 2500
            })
          })
        }
      },
      async playVideoAds(index) {
        this.tempSelectedItem = index
        let videoAdUseable = true //wx.canIUse('createRewardedVideoAd')
        if (videoAdUseable) {
          if (this.videoAd) {
            this.videoAd.show().catch(() => {
              // 失败重试
              this.videoAd.load()
                .then(() => videoAd.show())
                .catch(err => {
                  console.log('激励视频 广告显示失败')
                  this.rangePicker.selectedItem = this.tempSelectedItem
                  this.genWinRateData()
                })
            })
          }
        } else {
          wx.showToast({
            title: '微信版本过低，无法播放激励视频',
            icon: 'none',
            duration: 2500
          })
          this.rangePicker.selectedItem = this.tempSelectedItem
          this.genWinRateData()
        }
      },
      compareFunction(key) {
        return function(obj1, obj2) {
          let formatKey = key.replace('-', '')
          if (key.indexOf('-') !== -1) {
            return obj2[formatKey] - obj1[formatKey]
          } else {
            return obj1[formatKey] - obj2[formatKey]
          }
        }
      },
      swapItems(arr, index) {
        arr.push(arr[index]);
        arr.splice(index, 1);
        return arr;
      },
      sortTableData() {
        if (this.orderBy) {
          this.selectedFaction.data.sort(this.compareFunction(this.orderBy))
          let dataList = this.selectedFaction.data
          let otherIndex = null
          for (let index in dataList) {
            if (dataList.hasOwnProperty(index)) {
              if (dataList[index].ename === 'Other') {
                otherIndex = index
              }
            }
          }
          if (otherIndex) {
            this.swapItems(this.selectedFaction.data, otherIndex)
          }
        }
      },
      genFactionIcons() {
        this.factionIcons = []
        for (let key in utils.faction) {
          if (utils.faction.hasOwnProperty(key)) {
            this.factionIcons.push({
              id: key,
              name: utils.faction[key].name,
              image: utils.faction[key].image
            })
          }
        }
      },
      genWinRateData() {
        wx.showNavigationBarLoading();
        let params = {
          faction: this.selectedFaction.id,
          rankRange: this.rangePicker.list[this.rangePicker.selectedItem].rank_range
        }
        getWinRateData(params).then(res => {
          let otherDeckIndex = null
          this.selectedFaction.data = []
          for (let index in res) {
            if (res.hasOwnProperty(index)) {
              let ename = res[index].archetype
              if (ename.toLowerCase() === 'other') {
                otherDeckIndex = index //记录other信息的序号，后面将其放置到最后
                ename = this.selectedFaction.id
              }
              let name = this.decksName.filter(item => {
                return item.ename === ename && item.faction === this.selectedFaction.id
              })[0]
              let formatData = {
                deckName: name ? name.cname : res[index].archetype,
                ename: res[index].archetype,
                games: res[index].games,
                winrate: res[index].winrate.toFixed(1),
                popularity: res[index].popularity.toFixed(1)
              }
              this.selectedFaction.data.push(formatData)
            }
          }
          // 默认排序下将'其他'放到最后
          if (otherDeckIndex) {
            let temp = this.selectedFaction.data[otherDeckIndex]
            temp.deckName = '其他'
            this.selectedFaction.data.splice(otherDeckIndex, 1)
            this.selectedFaction.data.push(temp)
          }
          this.loading = false
          wx.stopPullDownRefresh();
          wx.hideNavigationBarLoading()
        }).catch(err => {
          this.loading = false
          console.log(err)
          wx.stopPullDownRefresh();
          wx.hideNavigationBarLoading()
        })
      },
      handleIconsClick(item) {
        if (this.selectedFaction.id !== item.id) {
          this.selectedFaction = {
            id: item.id,
            name: item.name,
            data: []
          }
          this.genWinRateData()
        }
      },
      handleOrderChange(item) {
        if (this.orderBy.indexOf(item.id) >= 0) {
          this.orderBy = this.orderBy.split('')[0] === '-' ? item.id : '-' + item.id
        } else {
          this.orderBy = '-' + item.id
        }
        this.sortTableData()
      },
      handleItemClick(item) {
        if (item.ename === 'Other') {
          wx.showToast({
            title: '还没有套牌的详细数据。',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.navigateTo({
            url: `/pages/decks/archetypeDetail/index?name=${item.ename}`
          })
        }
      },
      handleRankRangeChange(e) {
        if (e.mp.detail.value!=='0' && e.mp.detail.value!==this.rangePicker.selectedItem) {
          try {
            let value = wx.getStorageSync('ads_video_date')
            let now = new Date()
            let today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()/1000
            if (today === value) {
              // Do something with return value
              this.rangePicker.selectedItem = e.mp.detail.value
              this.genWinRateData()
            } else {
              wx.showModal({
                title: '提示',
                content: '播放完整激励视频即可解锁该功能, 限当日。（默认会播放声音，建议降低手机音量）',
                success: res => {
                  if (res.confirm) {
                    this.playVideoAds(e.mp.detail.value)
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          } catch (e) {
            // Do something when catch error
            this.rangePicker.selectedItem = e.mp.detail.value
            this.genWinRateData()
          }
        } else {
          this.rangePicker.selectedItem = e.mp.detail.value
          this.genWinRateData()
        }
      },
      scrollToBottom() {
        // console.log('scrollToBottom')
      },
      scrollToTop() {
        // console.log('scrollToTop')
      }
    },
    mounted() {
      this.initVideoAds()
      this.genFactionIcons()
      this.genWinRateData()
    }
  }
</script>
<style lang="scss" scoped>
  @import '../../../style/color';
  .archetype-container {
    .headline {
      margin: 0 30rpx;
      .filter-picker {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        font-size: 10px;
        height: 16px;
        line-height: 16px;
        border-radius: 10px;
        text-align: center;
        padding: 1px 6px;
        background: $palette-blue;
        color: #fff;
        border: 1rpx solid $palette-blue;
        font-weight: normal;
      }
    }
    .panel-faction {
      margin: 0 30rpx 20rpx;
    }
    .panel-block {
      display: flex;
      justify-content: space-between;
      width: 100%;
      height: 86rpx;
      padding: 0 30rpx;
      /*box-shadow: 0 3px 2px -3px #000;*/
      border-bottom: 1rpx solid #eee;
      box-sizing: border-box;
      .filter-item {
        position: relative;
        height: 100%;
        line-height: 86rpx;
        font-size: 13px;
        .table-name {
          width: 265rpx;
          color: #999;
          box-sizing: border-box;
          padding-left: 33rpx;
        }
        .picker-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 25rpx;
          height: 25rpx;
          margin-left: 10rpx;
        }
        .selector-item {
          text-align: center;
          font-size: 13px;
          color: $palette-blue;
        }
        .order-item {
          position: relative;
          width: 134rpx;
          text-align: center;
          img {
            position: absolute;
            width: 22rpx;
            height: 36rpx;
            margin-left: 5rpx;
            top: 48%;
            transform: translateY(-50%);
          }
        }
      }
    }
    .panel-list {
      .table {
        display: table;
        width: 100%;
        border-collapse: collapse;
        .table-tr {
          display: table-row;
          width: 100%;
          font-size: 13px;
          .table-td {
            display: table-cell;
            span {
              height: 60rpx;
              line-height: 60rpx;
            }
          }
          .col-1st {
            position: relative;
            width: 265rpx;
            text-align: left;
            box-sizing: border-box;
            padding-left: 30rpx;
            img {
              position: absolute;
              width: 64rpx;
              height: 64rpx;
              top: 50%;
              transform: translateY(-50%);
            }
            .deckName {
              position: absolute;
              display: inline-block;
              top: 50%;
              transform: translateY(-50%);
              margin-left: 90rpx;
              p.cname {
                width: 180rpx;
                height: 37rpx;
                line-height: 37rpx;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
              }
              p.ename {
                width: 180rpx;
                height: 30rpx;
                line-height: 30rpx;
                font-size: 11px;
                color: #999;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }
          .col-last {
            padding-right: 30rpx;
          }
          .col-other {
            width: 120rpx;
          }
        }
        .header {
          height: 86rpx;
          line-height: 86rpx;
          border-bottom: 1rpx solid #eee;
          .table-name {
            width: 265rpx;
            color: #999;
            box-sizing: border-box;
            padding-left: 33rpx;
          }
          .order {
            position: relative;
            font-size: 13px;
            color: #333;
            img {
              position: absolute;
              width: 22rpx;
              height: 36rpx;
              line-height: 26rpx;
              margin-left: 5rpx;
              /*right:7rpx;*/
              top: 50%;
              transform: translateY(-50%);
            }
          }
        }
        .content {
          background-color: #fff;
          border-bottom: 1rpx solid #eee;
          &:active {
            background-color: #eee;
          }
          .table-td {
            height: 120rpx;
            line-height: 120rpx;
          }
        }
        .text-center {
          text-align: center;
        }
        .float-right {
          float: right;
          margin-right: 20px;
        }
      }
    }
  }
</style>
