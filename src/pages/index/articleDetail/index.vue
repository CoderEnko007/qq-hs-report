<template>
  <div class="container" v-show="detail">
    <nav-bar :showCapsule="true"></nav-bar>
    <div class="skeleton-mask" v-show="!dataReady">
      <ArticleSkeleton :showBanner="detail&&!detail.main_article"></ArticleSkeleton>
    </div>
    <div v-show="dataReady">
      <div class="banner" v-if="detail&&!detail.main_article">
        <img :src="detail&&detail.cover" mode="aspectFill">
      </div>
      <div class="article-detail">
        <div class="title">
          <div><span class="top" v-show="detail&&detail.top">[置顶]</span>{{detail&&detail.title}}</div>
        </div>
        <div class="meta">
          <div class="author">
            <img :src="detail&&detail.logo.path" mode="aspectFit">
            <span class="name">{{detail&&detail.author}}</span>
          </div>
          <div class="info">
            <div class="info-item">
              <span class="icon iconfont">&#xe678;</span>
              <span v-if="detail&&detail.visit_count">{{detail.visit_count}}</span>
              <span v-else>0</span>
            </div>
            <div class="info-item">
              <span class="icon iconfont">&#xe658;</span>
              <span>{{detail&&detail.date}}</span>
            </div>
          </div>
        </div>
        <div class="separator"></div>
        <div class="content">
          <u-parse :content="detail&&detail.content" @preview="preview" @navigate="navigate" :imageProp="{lazyLoad:'true', mode:'aspectFit'}" />
        </div>
        <div class="sub-article">
          <div class='sub-card' v-for="(item, index) in subList" :key="index" @click="handleSubArticleClick(item)">
            <img :src="item.cover" mode="aspectFit" v-if="item.cover">
            <p class="sub-title">{{item.title}}</p>
          </div>
        </div>
      </div>
      <div class="other-block" :style="{'padding-bottom': isIphoneX?155+'rpx':115+'rpx'}">
        <div class="notice" v-if="showAdNotice">
          <p>{{adNotice}}</p>
        </div>
        <!--<div class="video-ads" v-if="adsType==='video'">-->
          <!--<ad unit-id="adunit-658c5ed4c9982d96" ad-type="video" ad-theme="white"></ad>-->
        <!--</div>-->
        <!--<div class="ads" v-else>-->
          <!--<ad unit-id="adunit-2bb4a9cea22fa148"></ad>-->
          <!--&lt;!&ndash; <ad unit-id="adunit-658c5ed4c9982d96" ad-type="video" ad-theme="white"></ad> &ndash;&gt;-->
        <!--</div>-->
        <!--<div class="ads">-->
        <ad unit-id="be447157a96934fc3ce9995017182938" type="card"></ad>
        <!--</div>-->
        <copyRight></copyRight>
      </div>
      <div class="footer">
        <FooterMenu :link="detail.link"></FooterMenu>
      </div>
      <div class="float-btn" :style="{'bottom': isIphoneX?70+'px':50+'px'}">
        <floatBtnGroup @onCompare="openCompareDeckModal" :badgeCount="badgeCount" showCompare="true"></floatBtnGroup>
      </div>
      <compareDeckModal ref="cDeckModal" :currentBtnDeActive='true'></compareDeckModal>
    </div>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import { getArticleDetail, getArticleList, getSetting } from "../../../api/dbapi";
  import utils from '@/utils'
  import NavBar from '@/components/NavBar'
  import copyRight from '@/components/copyRight'
  import FooterMenu from '@/components/FooterMenu'
  import ArticleSkeleton from '@/components/ArticleSkeleton'
  import floatBtnGroup from '@/components/floatBtnGroup'
  import compareDeckModal from '@/components/compareDeckModal'
  import uParse from '@/components/gaoyia-parse/parse.vue'

  export default {
    name: 'articleDetail',
    components: {
      NavBar,
      uParse,
      copyRight,
      FooterMenu,
      ArticleSkeleton,
      floatBtnGroup,
      compareDeckModal
    },
    data() {
      return {
        contentID: null,
        groupID: null,
        detail: null,
        subList: null,
        mainArticleId: null,
        date: null,
        pageDelayFlag: false,
        showAdNotice: false,
        adsType: 'banner'
      }
    },
    computed: {
      ...mapGetters([
        'compareDeck1',
        'compareDeck2',
        'isIphoneX',
        'adNotice',
      ]),
      badgeCount() {
        let count = 0
        count += this.compareDeck1?1:0
        count += this.compareDeck2?1:0
        return count
      },
      dataReady() {
        return this.pageDelayFlag && this.detail
      }
    },
    methods: {
      openCompareDeckModal() {
        this.$refs.cDeckModal.showModal()
      },
      async genArticleDetal() {
        let params = {
          groupID: this.groupID,
          contentID: this.contentID
        }
        this.detail = await getArticleDetail(params)
        this.detail.date = utils.timesFun(this.detail.created_at*1000)
        this.mainArticleId = this.detail.id
      },
      async genSubArticle() {
        let params = {
          contentGroupID: 1533090852072321,
          groupID: this.groupID,
          contentID: this.contentID,
          mainArticleId: this.mainArticleId,
        }
        let orderBy = this.detail.sub_order?this.detail.sub_order:'created_at'
        let res = await getArticleList(params, 100, 0, orderBy)
        this.subList = res.objects
      },
      handleSubArticleClick(item) {
        wx.navigateTo({
          url: `/pages/index/articleDetail/index?group_id=${item.group_id}&id=${item.id}`
        })
      },
      preview(src, e) {
        console.log('preview', src, e)
      },
      navigate(href, e) {
        console.log(href)
        if (href.indexOf("http://AAE")===0) {
          wx.setClipboardData({
            data: href.replace('http://', ''),
            success: function(res) {
              wx.hideToast()
              wx.showToast({
                title: '卡组代码已复制',
                icon: 'none',
                duration: 1500,
              })
            }
          })
        } else {
          wx.setClipboardData({
            data: href,
            success: function(res) {
              wx.showToast({
                title: '不支持链接跳转，已复制到剪贴板',
                icon: 'none',
                duration: 1500,
              })
            }
          })
        }
      },
      async getIfanrSettings() {
        let res = await getSetting()
        this.showAdNotice = res.objects[0].show_ad_notice
        this.adsType = res.objects[0].article_ads_type
      }
    },
    async mounted() {
      setTimeout(() => {
        this.pageDelayFlag = true
      }, 1500)
      // this.contentID = 1561880472705483
      // this.groupID = 1533090852072321
      this.contentID = this.$root.$mp.query.id
      this.groupID = this.$root.$mp.query.group_id
      await this.genArticleDetal()
      await this.genSubArticle()
      await this.getIfanrSettings()
    },
    onShareAppMessage(res) {
      return {
        title: this.detail.title,
        path: `/pages/index/articleDetail/index?group_id=${this.groupID}&id=${this.contentID}`
      }
    },
  }
</script>
<style lang="scss" scoped>
  @import '../../../style/color';
  .banner {
    width: 100%;
    height: 335rpx;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .article-detail {
    padding: 20rpx 30rpx 0;
    .title {
      font-size: 16px;
      font-weight: bold;
      .top {
        color: red;
        margin-right: 5upx
      }
    }
    .meta {
      display: flex;
      justify-content: space-between;
      flex-wrap: nowrap;
      width: 100%;
      margin: 20rpx 2rpx 0;
      .author {
        position: relative;
        height: 40rpx;
        width: 200rpx;
        img {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: inline-block;
          width: 40rpx;
          height: 40rpx;
        }
        .name {
          position: absolute;
          left: 50rpx;
          width: 220rpx;
          line-height: 40rpx;
          font-size: 10px;
          color: #000;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .info {
        line-height: 40rpx;
        font-size: 10px;
        color: $palette-text-gray;
        .icon {
          margin-right: 10upx;
        }
        .info-item {
          display: inline-block;
          margin-left: 20upx;
        }
      }
    }
    .content {
      padding: 20rpx 0 0;
    }
    .sub-article {
      color: #0e67fa;
      font-size: 16px;
      text-decoration: underline;
      margin: 25rpx 0 0 0;
      .sub-card {
        min-height: 60rpx;
        margin-bottom: 25rpx;
        img {
          display: inline-block;
          width: 60rpx;
          height: 60rpx;
          vertical-align: middle;
          margin-right: 10rpx;
        }
        .sub-title {
          line-height: 60rpx;
          display: inline-block;
          vertical-align: middle;
        }
      }
    }
  }
  .separator {
    width: 100%;
    height: 1rpx;
    margin-top: 15rpx;
    background-color: #eee;
  }
  .other-block {
    padding-bottom: 100rpx;
  }
  .footer {
    position: fixed;
    bottom: 0;
    z-index: 999;
  }
  .skeleton-mask {
    position: absolute;
    width: 100%;
    background: white;
    // z-index: 1;
  }
  .float-btn {
    position: fixed;
    bottom: 50px;
    right: 20px;
    z-index: 999;
  }
  .notice {
    font-family: Helvetica, sans-serif;
    font-size: 14px;
    color: #666;
    line-height: 1.8;
    margin: 0 30rpx;
  }
  .video-ads {
    margin: 10rpx 0;
  }
</style>
