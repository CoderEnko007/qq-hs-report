<template>
<div class="search-bar">
  <div class="search-bar-form">
    <div class="serach-bar-box">
      <div class="zan-icon zan-icon-search"></div>
      <input type="text" :placeholder="placeholder" @input="handleInput" @confirm="handleConfirm">
    </div>
  </div>
</div>
</template>
<script>
export default {
  name: 'SearchBar',
  props: ["placeholder"],
  methods: {
    handleConfirm(e) {
      this.$emit('handleConfirm', e.mp.detail.value)
    },
    handleInput(e) {
      this.$emit('update:search', e.mp.detail.value.trim())
    }
  },
}
</script>
<style lang="scss" scoped>
.search-bar {
  display: flex;
  /*padding: 20rpx 30rpx;*/
  .search-bar-form {
    position: relative;
    background-color: #f8f8f8;
    flex: auto;
    /*border: 1rpx solid #4f4f4f;*/
    border-radius: 34rpx;
    .serach-bar-box {
      padding-left: 72rpx;
      font-size: 14px;
      color: #999;
      .zan-icon {
        position: absolute;
        left: 32rpx;
        top: 50%;
        transform: translateY(-50%);
      }
      input {
        height: 68rpx;
        line-height: 68rpx;
      }
    }
  }
}
</style>
