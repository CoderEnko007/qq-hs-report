<template>
  <div class="container">
    <div class="banner pulse" v-show="showBanner"></div>
    <div class="article">
      <div class="title-line1 pulse"></div>
      <div class="title-line2 pulse"></div>
      <div class="meta">
        <div class="author">
          <span class="author-img pulse"></span>
          <span class="author-name pulse"></span>
        </div>
        <div class="date pulse"></div>
      </div>
      <div class="sep pulse"></div>
      <div class="content">
        <div class="block" v-for="(item, index) in 4" :key=index>
          <div class="line1 pulse"></div>
          <div class="line2 pulse"></div>
          <div class="line2 pulse"></div>
          <div class="line2 pulse"></div>
          <div class="line3 pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ArticleSkeleton',
    props: ['showBanner'],
    data() {
      return {
        
      }
    }
  }
</script>

<style lang="scss" scoped>
.pulse {
  $from: #f5f5f5;
  $to: scale-color($from, $lightness: -10%);

  height: 100%;
  width: 100%;
  background: linear-gradient(-90deg, #efefef 0%, #fcfcfc 50%, #efefef 100%);
  background-size: 400% 400%;
  background-color: #f5f5f5;
  animation: pulse 1.2s ease-in-out infinite;

  @keyframes pulse {
    0% {
      background-position: 0% 0%
    }

    100% {
      background-position: -135% 0%
    }
  }
}
.banner {
  width: 100%;
  height: 335upx;
}
.article {
  padding:20rpx 30rpx 80rpx;
  .title-line1{
    height: 38upx;
    width: 100%;
    margin-bottom:6upx;
  }
  .title-line2 {
    height: 38upx;
    width: 70%;
  }
  .meta {
    display:flex;
    align-items:center;
    justify-content:space-between;
    flex-wrap:nowrap;
    width:100%;
    margin-top: 20upx;
    .author {
      display: flex;
      align-items:center;
      height: 40upx;
      width: 350upx;
      .author-img {
        display: inline-block;
        width: 40upx;
        height: 40upx;
        border-radius: 50%;
      }
      .author-name {
        display: inline-block;
        margin-left: 15upx;
        height: 35upx;
        width: 220upx;
      }
    }
    .date {
      width: 160upx;
      height: 35upx;
    }
  }
  .sep {
    width: 100%;
    height: 1upx;
    margin-top: 15upx;
  }
  .content {
    padding: 20upx 0 0;
  }
  .block {
    margin: 0 0 1em;
    overflow:hidden;
    .line1, .line2, .line3 {
      height: 32upx;
      margin-bottom:15rpx;
    }
    .line1 {
      margin-left: 2em;
    }
    .line2 {
      width: 100%;
    }
    .line3 {
      width: 65%;
    }
  }
}
</style>
