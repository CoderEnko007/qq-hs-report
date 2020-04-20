<template>
<div class="container">
  <div class="search-bar">
    <SearchBar :search.sync="search" @handleConfirm="handleSearch" placeholder="搜索"></SearchBar>
  </div>
  <div class="article-list">
    <articleList :list="dataList"
                 @scrollToBottom="scrollToBottom"
                 @scrollToTop="scrollToTop"
                 :loading="more"
                 :nodata="nodata"></articleList>
  </div>
</div>
</template>
<script>
import { getArticleList } from "../../../api/dbapi";
import articleList from './articleList'
import SearchBar from '@/components/SearchBar'
import utils from '@/utils'

export default {
  name: 'articlePage',
  components: {
    articleList,
    SearchBar
  },
  data() {
    return {
      dataList: [],
      more: true,
      page: 0,
      search: null
    }
  },
  computed: {
    nodata() {
      return this.dataList.length<=0
    }
  },
  methods: {
    genDataList(init) {
      if (init) {
        this.page = 0
        this.more = true
      }
      let params = {
        contentGroupID: 1533090852072321,
        // 'categoryID': 1561556504434236,
        'mainArticle': true,
        'search': this.search
      }
      getArticleList(params, 10, this.page).then(res => {
        if (init) {
          this.dataList = res.objects
        } else {
          this.dataList = this.dataList.concat(res.objects)
        }
        for (let index in this.dataList) {
          if (this.dataList.hasOwnProperty(index)) {
            this.dataList[index].date = utils.timesFun(this.dataList[index].created_at*1000)
          }
        }
        if (this.dataList.length >= res.meta.total_count) {
          this.more = false
        }
      }).catch(err => {
        console.log(err)
      })
    },
    handleSearch() {
      this.dataList = []
      this.more = true
      this.page = 0
      this.genDataList(true)
    },
    scrollToBottom() {
      if (!this.more) return false
      this.page += 1
      this.genDataList(false)
    },
    scrollToTop() {
      // this.genDataList(true)
    }
  },
}
</script>
<style lang="scss" scoped>
.container {
  position: relative;
  background: #eff3f4;
  .search-bar {
    position: relative;
    width: 100%;
    background: #FFFFFF;
    padding: 20rpx 30rpx;
    margin-top: -10rpx;
    box-shadow: 0 2px 2px 0 rgba(207,216,221,.7);
    z-index: 999;
    box-sizing: border-box;
  }
  // .article-list {
  //   padding-top: 50px;
  // }
}
</style>
