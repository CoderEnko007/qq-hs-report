<template>
  <div class="container">
    <nav-bar></nav-bar>
    <div class="panel-tab">
      <block v-for="(item,index) in tabbar" :key="item.id">
        <div :id="index" :class="{'tab-item': true, 'tab-item-active': activeIndex==index}" @click="handleTabBarClick">
          {{item.text}}
        </div>
      </block>
    </div>
    <div class="tab-container">
      <swiper class="content" :easing-function="easeInOutCubic" :duration="100" :style="'height:'+contentHeight" @change="swiperChange"
       :current="currentTab">
        <swiper-item>
          <div class="swiper">
            <div class="notice-bar" v-show="noticeContent.display">
              <cmd-notice-bar scrollable :text="noticeText.text" mode="close" @click="handleNoticeClick"></cmd-notice-bar>
            </div>
            <SwiperBanner :banners="banners" :date="report_date" @swiperClick="handleBannerClick" v-if="banners"></SwiperBanner>
          </div>
          <div class="rank-panel">
            <div class="headline">
              <span class="title">职业排名</span>
              <div class="head-picker">
                <picker mode="selector" :value="modeFilter.selectedItem" :range="modePickerList" @change="handleModeChange">
                  <span class='selector-item'>{{modeFilter.list[modeFilter.selectedItem].text}}</span>
                  <span class="iconfont" :style="{'vertical-align': 'middle'}">&#xe668;</span>
                </picker>
              </div>
              <div class="btn-group">
                <div class="btn-block" v-for="(item, index) in rankMode" :key="item.name" @click="modeBtnClick(rankMode[index])">
                  <img class="btn-img" :src="selectedGameType===item.mode?item.active_icon:item.icon" mode="aspectFit">
                  <button class="c-button" :class="selectedGameType===item.mode?'btn-active':''">{{item.text}}</button>
                  <div class="separator" v-if="index !== 2">|</div>
                </div>
              </div>
            </div>
            <div class="content">
              <RankBoard :list="rankData[selectedGameType]" :mode="modeFilter.list[modeFilter.selectedItem].value"></RankBoard>
            </div>
            <!--<div class="data-vision" @click="handleHSVisionClick">-->
              <!--<img class="btn-img" src="/static/icons-v2/trending.png" mode="aspectFit">-->
              <!--<span class="text">职业强度趋势</span>-->
              <!--<span class="iconfont">&#xe600;</span>-->
            <!--</div>-->
          </div>
          <ad unit-id="0f0d628da3719f9bab62aef1e73d7980" type="feeds"></ad>
          <div class="tier-panel">
            <div class="headline">
              <span class="title">强度排行</span>
              <div class="head-picker">
                <picker mode="selector" :value="rangePicker.selectedItem" :range="rangePickerList" @change="handleRankRangeChange">
                  <span class='selector-item'>标准模式 {{rangePicker.list[rangePicker.selectedItem].text}}</span>
                  <span class="iconfont" :style="{'vertical-align': 'middle'}">&#xe668;</span>
                </picker>
              </div>
              <div class="head-btn" @click="handleExport">
                <span class="icon iconfont">&#xe69c;&nbsp;</span>
                <span>导出日报</span>
              </div>
            </div>
           <!-- <div class="data-vision" style="margin: 0 30rpx;" @click="handleHSVisionTierClick">
              <img class="btn-img" src="/static/icons-v2/trending.png" mode="aspectFit">
              <span class="text">环境结构分布</span>
              <span class="iconfont">&#xe600;</span>
            </div> -->
            <div class="tier-content">
              <div class="tier-block" v-for="(tier, index) in tierList" :key="tier.name">
                <TierList :tierData="tier" @itemClick="handleTierClick" @onCollapse="handleCollapse"></TierList>
              </div>
            </div>
          </div>
        </swiper-item>
        <swiper-item>
          <articlePage ref="articlePage"></articlePage>
        </swiper-item>
      </swiper>
    </div>
    <x-modal :text='noticeText.text' :no-cancel='true' :no-title='true' confirm-text='朕知道了' :hidden.sync='hideModal'></x-modal>
    <div style="position: fixed; top: 9999999999999px; overflow: hidden">
      <canvas :style="{width: canvasWidth+'px', height: canvasHeight+'px'}" canvas-id="dailyReport"></canvas>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import utils from '@/utils'
  import { gradientColor, formatNowTime, ShadeColor } from '@/utils'
  import { getRankData, getArchetypeList, getBanners, getNotice } from '@/api/dbapi.js'
  import NavBar from '@/components/NavBar.vue'
  import SwiperBanner from '@/components/SwiperBanner.vue'
  import cmdNoticeBar from "@/components/cmd-notice-bar/cmd-notice-bar.vue"
  import xModal from "@/components/x-modal/x-modal.vue"
  import RankBoard from '@/components/RankBoard'
  import TierList from '@/components/TierList'
  import articlePage from './components/articlePage'

  export default {
    components: {
      NavBar,
      SwiperBanner,
      cmdNoticeBar,
      xModal,
      RankBoard,
      TierList,
      articlePage
    },
    data() {
      return {
        hideModal: true,
        refreshFlag: 0,
        banners: [],
        report_date: '',
        noticeText: {
          text: '',
          animationData: []
        },
        // tab切换参数
        tabbar: [
          {id: 'report', text: '日报' },
          {id: 'article', text: '周报&资讯' }
        ],
        activeIndex: 0,
        currentTab: 0,
        // rank list参数
        rankMode: utils.gameMode,
        origRankList: [],
        rankData: {
          'standard': [],
          'wild': [],
          'arena': []
        },
        modeFilter: {
          selectedItem: 0,
          list: [
            {text: '按胜率', value: 'win_rate'},
            {text: '按热度', value: 'popularity'}
          ]
        },
        selectedGameType: 'standard',
        // tier list参数
        tierList: [
          {name: 'Tier 1', cname: '第1梯队', icon: '/static/icons-v2/tierlist-t1.png', list: []},
          {name: 'Tier 2', cname: '第2梯队', icon: '/static/icons-v2/tierlist-t2.png', list: []},
          {name: 'Tier 3', cname: '第3梯队', icon: '/static/icons-v2/tierlist-t3.png', list: []},
          {name: 'Tier 4', cname: '第4梯队', icon: '/static/icons-v2/tierlist-t4.png', list: []},
        ],
        tierListNum: 0,
        rangePicker: {
          selectedItem: 0,
          list: [
            {text: '全分段', rank_range: 'All'},
            {text: 'R10-R6分段', rank_range: 'Six_Through_Ten'},
            {text: 'R5-R1分段', rank_range: 'One_Through_Five'},
            {text: '传说分段', rank_range: 'Legend_Only'}
          ]
        },
        tempSelectedItem: 0,
        // canvas参数
        canvasWidth: 375,
        canvasHeight: 200,
        adHeight: 187,
        collapseHeight: 0,
        videoAd: null
      }
    },
    computed: {
      ...mapGetters([
        'winWidth',
        'winHeight',
        'navHeight',
        'noticeContent',
        'decksName',
        'barHeight'
      ]),
      contentHeight() {
        if (this.activeIndex == 0) {
          return 471 + this.adHeight + this.barHeight + 51 + 60 * this.tierListNum + 65 - this.collapseHeight + 'px'
          // return 471 + 150 + 51 + 60 * this.tierListNum + 25 + 'px'
        } else {
          return this.winHeight - this.navHeight - 41 + "px"
        }
      },
      modePickerList() {
        return this.modeFilter.list.map(item => {
          return item.text
        })
      },
      rangePickerList() {
        return this.rangePicker.list.map(item => {
          return item.text
        })
      },
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
              this.genArchetypeList()
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
            this.genArchetypeList()
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
                  this.genArchetypeList()
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
          this.genArchetypeList()
        }
      },
      handleAdError(e) {
        console.log('ad error', e)
        this.adHeight = 0
      },
      handleAdLoaded(e) {
        console.log('ad loaded', e)
        this.adHeight = 107*3+75
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
      initRankDataArray() {
        this.rankData = {
          'standard': [],
          'wild': [],
          'arena': []
        }
      },
      sortRankData(data) {
        for (let index in this.rankData) {
          if (this.rankData.hasOwnProperty(index)) {
            this.rankData[index] = data.filter(item => {
              return item.game_type.toLowerCase() === index.toLowerCase()
            })
            if (this.modeFilter.list[this.modeFilter.selectedItem].value === 'win_rate') {
              this.rankData[index].sort(this.compareFunction('-win_rate'))
            } else if (this.modeFilter.list[this.modeFilter.selectedItem].value === 'popularity') {
              this.rankData[index].sort(this.compareFunction('-popularity'))
            }
            this.rankData[index].map(val => {
              val.win_rate = parseFloat(val.win_rate).toFixed(1)
              val.popularity = parseFloat(val.popularity).toFixed(1)
            })
            this.rankData[index].push({})
          }
        }
      },
      stopPullDown(success) {
        if (success) {
          this.refreshFlag += 1;
          if (this.refreshFlag >= 2) {
            uni.stopPullDownRefresh();
            uni.hideNavigationBarLoading()
          }
        } else {
          uni.stopPullDownRefresh();
          uni.hideNavigationBarLoading()
        }
      },
      genBanners() {
        getBanners().then(res => {
          this.banners = res.objects
          this.stopPullDown(true)
        }).catch(err => {
          this.stopPullDown(false)
          console.log(err)
        })
      },
      genNotice() {
        if (this.noticeContent.hasOwnProperty('content') && this.noticeContent.content.length > 0) {
          this.noticeText.text = this.noticeContent.content
        } else {
          this.$store.dispatch('getNotice').then(res => {
            this.noticeText.text = res?res.content:null
          })
        }
      },
      genRankData() {
        let date = formatNowTime(new Date())
        getRankData(date, null, 27).then(res => {
          this.initRankDataArray()
          this.report_date = res.date
          this.origRankList = res.list
          this.sortRankData(this.origRankList)
          this.stopPullDown(true)
        }).catch(err => {
          this.stopPullDown(false)
          console.log(err)
        })
      },
      genArchetypeList() {
        this.tierListNum = 0
        let params = {rankRange: this.rangePicker.list[this.rangePicker.selectedItem].rank_range}
        getArchetypeList(params).then(res => {
          this.tierListNum = res.meta.total_count
          for (let index in this.tierList) {
            if (this.tierList.hasOwnProperty(index)) {
              this.tierList[index].list = res.objects.filter(item => {
                return item.tier === this.tierList[index].name
              })
            }
          }
          this.stopPullDown(true)
        }).catch(err => {
          console.log(err)
          this.stopPullDown(false)
        })
      },
      handleBannerClick(item) {
        if (item.articleID) {
          uni.navigateTo({
            url: `/pages/index/articleDetail/index?group_id=${item.articleGroupID}&id=${item.articleID}`
          })
        }
      },
      handleNoticeClick() {
        this.hideModal = false
      },
      handleTabBarClick(e) {
        this.activeIndex = e.currentTarget.id;
        this.currentTab = this.activeIndex;
      },
      swiperChange(e) {
        this.currentTab = e.mp.detail.current;
        this.activeIndex = this.currentTab;
      },
      handleModeChange(e) {
        this.modeFilter.selectedItem = e.mp.detail.value
        this.sortRankData(this.origRankList)
      },
      modeBtnClick(item) {
        this.selectedGameType = item.mode
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
              this.genArchetypeList()
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
            this.genArchetypeList()
          }
        } else {
          this.rangePicker.selectedItem = e.mp.detail.value
          this.genArchetypeList()
        }
      },
      handleHSVisionClick() {
        wx.navigateToMiniProgram({
          appId: 'wx010ca9734f850748',
          path: `/pages/rank/main`,
          success(res) {
            // 打开成功
            console.log(res)
          }
        })
      },
      handleHSVisionTierClick() {
        wx.navigateToMiniProgram({
          appId: 'wx010ca9734f850748',
          path: `/pages/structure/main`,
          success(res) {
            // 打开成功
            console.log(res)
          }
        })
      },
      handleExport() {
        console.log('handleExport')
        uni.showLoading({
          title: '日报生成中',
          mask: true
        })
        this.saveImageToPhotos()
      },
      handleTierClick(item) {
        uni.navigateTo({
          url: `/pages/decks/archetypeDetail/index?name=${item.archetype_name}`
        })
      },
      handleCollapse(obj) {
        if (!obj.show) {
          this.collapseHeight += obj.num*60
        } else {
          this.collapseHeight -= obj.num*60
        }
      },

      // canvas 绘图
      saveImageToPhotos () {
        let _this = this
        // 相册授权
        uni.getSetting({
          success(res) {
            // 进行授权检测，未授权则进行弹层授权
            if (!res.authSetting['scope.writePhotosAlbum']) {
              uni.authorize({
                scope: 'scope.writePhotosAlbum',
                success () {
                  _this.drawRankCanvas()
                },
                fail() {
                  uni.hideLoading()
                  uni.showModal({
                    content: '您尚未打开相册使用权限，是否去设置打开？',
                    confirmColor: '#433e88',
                    success (res) {
                      if (res.confirm) {
                        uni.openSetting({
                          success(res) {
                            console.log(res.authSetting)
                          }
                        })
                      }
                    }
                  })
                }
              })
            } else {
              // 已授权则直接进行保存图片
              console.log('PhotosAlbum已授权')
              _this.drawRankCanvas()
            }
          },
          fail(res) {
            uni.hideLoading()
            uni.showToast({
              title: '图片保存失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
      drawRankCanvas() {
        let ctx = uni.createCanvasContext('dailyReport')
        let canvasMargin = 0
        this.canvasWidth = 300+canvasMargin
        this.canvasHeight = 720
        let headHeight = 120
        ctx.save()
        ctx.setFillStyle('#fff')
        ctx.fillRect(0, 0, this.canvasWidth, headHeight)
        ctx.restore()
        ctx.save()
        ctx.font = 'normal bold 12px sans-serif';
        ctx.setFillStyle('#433e88')
        ctx.textAlign = 'center'
        ctx.fillText('QQ小程序：炉石传说情报站', this.canvasWidth/2, 20)
        ctx.setFillStyle('#000')
        ctx.font = 'normal bold 16px sans-serif';
        ctx.fillText('卡组强度排行', this.canvasWidth/2, 45)
        ctx.restore()
        let rankRange = this.rangePicker.list[this.rangePicker.selectedItem].text
        ctx.font = 'normal normal 12px sans-serif';
        ctx.textAlign = 'left'
        ctx.fillText('分段：', canvasMargin+30, 70)
        ctx.save()
        ctx.font = 'normal bold 13px sans-serif';
        ctx.setFillStyle('red')
        ctx.fillText(rankRange, canvasMargin+65, 70)
        ctx.restore()
        ctx.save()
        ctx.font = 'normal normal 12px sans-serif';
        ctx.setFillStyle('#000')
        ctx.textAlign = 'right'
        let date = new Date()
        ctx.fillText('时间：'+utils.formatNowTime(date), this.canvasWidth-canvasMargin-30, 70)
        ctx.restore()

        ctx.textAlign = 'center'
        ctx.font = 'normal normal 13px sans-serif';
        let colWidth = (this.canvasWidth-canvasMargin*2)/4
        ctx.fillText('强 度', colWidth/2+canvasMargin, 95)
        ctx.fillText('卡 组', colWidth+colWidth/2+canvasMargin, 95)
        ctx.fillText('胜 率', colWidth*2+colWidth/2+canvasMargin, 95)
        ctx.fillText('热 度', colWidth*3+colWidth/2+canvasMargin, 95)

        let rankPower = [
          {name: '第1梯队', height:0, num: 0},
          {name: '第2梯队', height:0, num: 0},
          {name: '第3梯队', height:0, num: 0},
          {name: '第4梯队', height:0, num: 0},
        ]
        let factionColor = {'Druid': '#f79647', 'Hunter': '#9bbb56', 'Mage': '#b8dee9', 'Paladin': '#e6b8b8',
                            'Priest': '#e5e5e5', 'Rogue': '#ffff01', 'Shaman': '#538dd6', 'Warlock': '#cdc0da', 'Warrior': '#c5bd98'}
        let listHeight = 0
        let itemHeight = 25
        let winrateGColor = gradientColor('#239c15', '#297607', this.tierList[0].list.length+this.tierList[1].list.length)
        let winrateRColor = gradientColor('#889400', '#ff5630', this.tierList[2].list.length+this.tierList[3].list.length)
        let winrateColor = [...winrateGColor, ...winrateRColor]
        let itemNums = 0
        for (let tierIndex in this.tierList) {
          if (this.tierList.hasOwnProperty(tierIndex)) {
            if (tierIndex === '__proto__') {
              continue
            }
            rankPower[tierIndex].height=this.tierList[tierIndex].list.length*itemHeight+1 // 每个梯队后面加1px的分割线
            rankPower[tierIndex].num = this.tierList[tierIndex].list.length
            let prevTierHeight = 0
            if (tierIndex > 0) {
              prevTierHeight =  listHeight
            }
            listHeight += rankPower[tierIndex].height
            ctx.save()
            ctx.setFillStyle('#fbf3e8')
            ctx.fillRect(canvasMargin, headHeight+prevTierHeight-17, colWidth, rankPower[tierIndex].height)
            ctx.restore()
            ctx.save()
            ctx.font = 'normal bold 12px sans-serif'
            ctx.setFillStyle('#34383b')
            ctx.fillText(rankPower[tierIndex].name, colWidth/2+canvasMargin, headHeight+prevTierHeight)
            ctx.restore()
            let list = this.tierList[tierIndex].list
            for (let itemIndex in list) {
              if (list.hasOwnProperty(itemIndex)) {
                if (itemIndex === '__proto__') {
                  continue
                }
                ctx.save()
                ctx.setFillStyle(factionColor[list[itemIndex].faction])
                ctx.fillRect(canvasMargin+colWidth, headHeight+prevTierHeight+itemIndex*itemHeight-17, colWidth, itemHeight)
                ctx.setFillStyle('#000')
                ctx.font = 'normal normal 12px sans-serif'
                let filterDeck = this.decksName.filter(v => {
                  return v.ename === list[itemIndex].archetype_name
                })
                let cname = filterDeck.length>0?filterDeck[0].cname:list[itemIndex].archetype_name
                ctx.fillText(cname, colWidth/2+canvasMargin+colWidth, headHeight+prevTierHeight+itemIndex*itemHeight)
                ctx.restore()
                ctx.save()
                if (itemNums%2 === 0) {
                  ctx.setFillStyle('#fff')
                } else {
                  ctx.setFillStyle('#faf8f9')
                }
                ctx.fillRect(canvasMargin+2*colWidth, headHeight+prevTierHeight+itemIndex*itemHeight-17, 2*colWidth, itemHeight)
                ctx.setFillStyle('#faf8f9')
                ctx.restore()
                ctx.save()
                ctx.font = 'normal bold 12px sans-serif'
                ctx.setFillStyle(winrateColor[itemNums++])
                ctx.fillText(list[itemIndex].win_rate+'%', colWidth/2+canvasMargin+colWidth*2, headHeight+prevTierHeight+itemIndex*itemHeight)
                ctx.restore()
                if (list[itemIndex].popularity1) {
                  ctx.fillText(list[itemIndex].popularity1.toFixed(1)+'%', colWidth/2+canvasMargin+colWidth*3, headHeight+prevTierHeight+itemIndex*itemHeight)
                } else {
                  ctx.fillText('暂无', colWidth/2+canvasMargin+colWidth*3, headHeight+prevTierHeight+itemIndex*itemHeight)
                }
              }
            }
            ctx.save()
            ctx.setStrokeStyle('#ccc')
            ctx.moveTo(canvasMargin, headHeight+prevTierHeight-17)
            ctx.lineTo(this.canvasWidth-canvasMargin, headHeight+prevTierHeight-17)
            ctx.stroke()
            ctx.restore()
          }
        }
        ctx.setStrokeStyle('#ccc')
        ctx.moveTo(canvasMargin, headHeight+listHeight-17)
        ctx.lineTo(this.canvasWidth-canvasMargin, headHeight+listHeight-17)
        ctx.stroke()
        ctx.save()
        ctx.setFillStyle('#fff')
        ctx.fillRect(0, headHeight+listHeight-17, this.canvasWidth, 30)
        ctx.setFillStyle('#433e88')
        ctx.font = 'normal bold 12px sans-serif';
        ctx.textAlign = 'right'
        ctx.fillText('数据源：HSReplay', this.canvasWidth-canvasMargin-10, headHeight+listHeight)
        ctx.restore()
        this.canvasHeight = headHeight+listHeight+10

        let _this = this
        ctx.draw(false, function(e) {
          setTimeout(function() {
            _this.saveCanvasImg()
          }, 1000)
        })
      },
      saveCanvasImg() {
        let pages = getCurrentPages();
        if (pages[pages.length-1].route !== 'pages/index/index') {
          return
        }
        let destWidth = this.canvasWidth//375 * 750 / uni.getSystemInfoSync().windowWidth
        let destHeight = this.canvasHeight//(this.canvasHeight * 375 / this.canvasWidth) * 750 / uni.getSystemInfoSync().windowWidth
        uni.canvasToTempFilePath({
          canvasId: 'dailyReport',
          destWidth: 3*destWidth,
          destHeight: 3*destHeight,
          fileType: 'jpg',
          quality: 1,
          success(res) {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                uni.hideLoading()
                uni.showToast({
                  title: '图片已保存到相簿',
                  duration: 2000
                })
              },
              fail(err) {
                uni.hideLoading()
                uni.showToast({
                  title: '图片保存失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          },
          fail(err) {
            console.log('error', err)
            uni.hideLoading()
            uni.showToast({
              title: '图片生成失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
    },
    onLoad() {
      this.genBanners()
      this.genRankData()
      this.genArchetypeList()
      this.genNotice()
      this.initVideoAds()
      // this.$refs.articlePage.genDataList(true)
    },
    onPullDownRefresh() {
      this.genBanners()
      this.genRankData()
      this.genArchetypeList()
      this.genNotice()
      this.$refs.articlePage.genDataList(true)
      this.$store.dispatch('getDecksName')
    },
    onShow() {
      this.$refs.articlePage.genDataList(true)
    },
    onShareAppMessage(res) {
      return {
        title: '炉石传说情报站',
        path: '/pages/index/index'
      }
    }
  }
</script>

<style scoped lang="scss">
@import '../../style/color';
.container {
  .panel-tab {
    position: fixed;
    width: 100%;
    height: 70rpx;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-around;
    background-color: #fff;
    border-bottom: 1rpx solid #eee;
    z-index: 2;
    .tab-item {
      position: relative;
      height: 100%;
      width: 232rpx;
      line-height: 70rpx;
      font-size: 15px;
      color: #666;
      text-align: center;
      &:after {
        display: none;
        content: '';
        position: absolute;
        width: 53rpx;
        height: 4rpx;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        background-color: $palette-blue;
      }
    }
    .tab-item-active {
      color: $palette-blue;
      font-weight: bold;
      &:after {
        display: block;
        animation: tabBottomIn .4s;
      }
    }
  }
  .tab-container {
    margin-top: 85rpx;
    width: 100%;
    z-index: 1;
  }
  .rank-panel {
    padding: 0 30rpx;
    .headline {
      height: 96rpx;
      .mode-filter {
        display: inline-block;
        height: 24rpx;
        line-height: 24rpx;
        margin-left: 8px;
        font-size: 19rpx;
        color: #999;
        border: 1rpx solid #ddd;
        border-radius: 12px;
        padding: 3rpx 10rpx;
      }
      .btn-group {
        position: absolute;
        height: 100%;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        display: flex;
        justify-content: space-between;
        flex-wrap: nowrap;
        .btn-block {
          position: relative;
          height: 100%;
          display: flex;
          justify-content: space-between;
          flex-wrap: nowrap;
          .btn-img {
            position: absolute;
            width: 32rpx;
            height: 32rpx;
            top: 50%;
            transform: translateY(-50%);
          }
          button {
            height: 100%;
            line-height: 96rpx;
            margin-left: 40rpx;
            font-size: 14px;
            font-weight: normal;
            color: #999;
          }
          .btn-active {
            color: $palette-blue;
            font-weight: bold;
          }
          .separator {
            width: 25rpx;
            height: 16px;
            line-height: 96rpx;
            text-align: center;
            font-size: 14px;
            color: #EEEEEE;
          }
        }
      }
    }
  }
  .tier-panel {
    padding: 10px 0;
    .headline {
      padding: 0 30rpx;
      .headline-meta {
        height: 24rpx;
        line-height: 24rpx;
        margin-left: 8px;
        font-size: 19rpx;
        color: #999;
        border: 1rpx solid #ddd;
        border-radius: 12px;
        padding: 3rpx 10rpx;
      }
    }
  }
  .data-vision {
   position: relative;
   margin-top: 10px;
   background: #FAFAFA;
   line-height: 45px;
   border-radius: 24rpx;
   img {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     margin-left: 10px;
     width: 52rpx;
     height: 52rpx;
   }
   .text {
     font-size: 16px;
     margin-left: 44px;
   }
   .iconfont {
     position: absolute;
     top: 50%;
     transform: translateY(-50%);
     right: 10px;
   }
  }
}
.head-btn {
  position: absolute;
  top: 50%;
  right: 55rpx;
  transform: translateY(-50%);
  line-height: 30px;
  font-size: 12px;
  color: $palette-blue;
}
@keyframes tabBottomIn {
  from {
    width: 100%;
    opacity: 0
  }

  to {
    width: 53rpx;
    opacity: 1
  }
}
</style>
