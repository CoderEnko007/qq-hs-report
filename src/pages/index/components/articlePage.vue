<template>
<div class="container">
  <articleList :list="dataList"
               @scrollToBottom="scrollToBottom"
               :loading="more"
               :nodata="nodata"></articleList>
</div>
</template>
<script>
import { getArticleList } from "../../../api/dbapi";
import articleList from './articleList'
import utils from '@/utils'

export default {
  name: 'articlePage',
  components: {
    articleList
  },
  data() {
    return {
      dataList: [],
      more: true,
      page: 0,
      test: false,
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
        'mainArticle': true
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
    scrollToBottom() {
      if (!this.more) return false
      this.page += 1
      this.genDataList(false)
    }
  },
  mounted() {
    this.genDataList(true)
  },
  scrollToBottom() {
    if (!this.more) return false
    this.page += 1
    this.genDataList(false)
  },
}
</script>
<style lang="scss" scoped>

</style>
