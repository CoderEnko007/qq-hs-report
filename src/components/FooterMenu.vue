<template>
  <div class="footer-menu" :style="{'height':isIphoneX?124+'rpx':90+'rpx'}">
    <button open-type="share" class="share">
      <span class="icon iconfont">&#xe63b;</span>
      <span>分享给好友</span>
    </button>
    <div class="separator" v-if="showExportBtn"></div>
    <button v-if="showExportBtn" @click="handleExportBtn">
      <span class="icon iconfont">&#xe69c;</span>
      <span>导出套牌</span>
    </button>
    <div class="separator" v-if="showCollectBtn"></div>
    <button class="like" v-if="showCollectBtn" @click="handleCollect">
      <span class="active icon iconfont" v-if="collected">&#xe601;</span>
      <span class="icon iconfont" v-else>&#xe603;</span>
      <span>收藏套牌</span>
    </button>
    <div class="separator" v-if="link"></div>
    <button v-if="link" @click="handleCopyLink">
      <span class="icon iconfont">&#xe789;</span>
      <span>复制网页地址</span>
    </button>
  </div>
</template>
<script>
import { mapGetters } from 'vuex' 
export default {
  name: 'FooterMenu',
  props: ['showCollectBtn', 'showExportBtn', 'collected', 'link'],
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters([
      'isIphoneX'
    ]),
  },
  methods: {
    handleCopyLink() {
      console.log('copy', this.link)
      wx.setClipboardData({
        data: this.link,
        success: function(res) {
          wx.showToast({
            icon: 'none',
            title: '网页已复制到剪贴板'
          })
        }
      })
    },
    handleExportBtn() {
      this.$emit('exportClick')
    },
    handleCollect() {
      this.$emit('collectClick')
    },
    activeCollectIcon() {
      this.collected = true
    },
    deactiveCollectIcon() {
      this.collected = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../style/color";
.footer-menu {
  position: relative;
  display: flex;
  justify-content: space-around;
  flex-wrap: nowrap;
  width: 750rpx;
  border-top: 1rpx solid $palette-bg-gray;
  background-color: #fff;
  border-bottom:1rpx solid $palette-bg-gray;
  box-shadow:0px 0px 4px #c0c0c0;
  .like-block {
    height: 90rpx;
    width: 240rpx;
  }
  button {
    width: 240rpx;
    height: 90rpx;
    line-height: 90rpx;
    padding: 0;
    display: inline-block;
    background-color: white;
    border-radius: 0;
    font-size: 13px;
    .icon {
      font-size: 16px;
      color: $palette-blue;
      margin-right: 20rpx;
    }
    .active {
      color: red;
    }
    &:after {
      border: none;
      border-radius: 0;
    }
  }
  .separator {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 40rpx;
    border-left: 1rpx solid $palette-bg-gray;
    z-index: 1;
  }
}
</style>
