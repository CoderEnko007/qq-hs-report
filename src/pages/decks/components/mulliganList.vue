<template>
  <div class="container">
    <div class="mulligan-container">
      <div class="card-block">
        <div class="card-header order" @click="handleCardOrderClick()">
          <span>卡牌</span>
          <img v-if="orderBy && orderBy === 'card'" :src="upOrder" mode="aspectFit">
          <img v-else-if="orderBy === '-'+'card'" :src="downOrder" mode="aspectFit">
          <img v-else :src="normalOrder" mode="aspectFit">
        </div>
        <DeckCards :cards="formatClist" colNum="1" mulligan="true" @cardClick="handleCardClick"></DeckCards>
      </div>
      <scroll-view class="data" scroll-x="true">
        <div class="mulligan-header">
          <div class="table-tr header">
            <div class="table-td order"
                 v-for="(item, index) in tableTitle"
                 :key="index"
                 @click="handleOrderClick(item)">
              <span>{{item.name}}</span>
              <img v-if="orderBy && orderBy === item.id" :src="upOrder" mode="aspectFit">
              <img v-else-if="orderBy === '-'+item.id" :src="downOrder" mode="aspectFit">
              <img v-else :src="normalOrder" mode="aspectFit">
            </div>
          </div>
        </div>
        <div class="data-block" v-for="(item, index) in formatData" :key="index">
          <div class="data-item" :style="{'background':index%2?'#eee':'#fff'}" :class="{'color-green': item.opening_hand_winrate>=50, 'color-red': item.opening_hand_winrate<50}" >
            <span class='text'>{{item.opening_hand_winrate.toFixed(1)}}%</span>
            <span class="iconfont" v-if="item.times_in_opening_hand<100">&#xe69b;</span>
          </div>
          <div class="data-item" :style="{'background':index%2?'#eee':'#fff'}">
            <span class='text'>{{item.keep_percentage.toFixed(1)}}%</span>
          </div>
          <div class="data-item" :style="{'background':index%2?'#eee':'#fff'}" :class="{'color-green': item.winrate_when_drawn>=50, 'color-red': item.winrate_when_drawn<50}" >
            <span class='text'>{{item.winrate_when_drawn.toFixed(1)}}%</span>
          </div>
          <div class="data-item" :style="{'background':index%2?'#eee':'#fff'}" :class="{'color-green': item.winrate_when_played>=50, 'color-red': item.winrate_when_played<50}" >
            <span class='text'>{{item.winrate_when_played.toFixed(1)}}%</span>
          </div>
          <div class="data-item" :style="{'background':index%2?'#eee':'#fff'}">
            <span class='text'>{{item.avg_turns_in_hand.toFixed(1)}}</span>
            </div>
          <div class="data-item" :style="{'background':index%2?'#eee':'#fff'}">
            <span class='text'>{{item.avg_turn_played_on.toFixed(1)}}</span>
          </div>
        </div>
      </scroll-view>
    </div>
    <div class="info" @click="handleInfomation">
      <span class="iconfont">&#xe653;</span>
      <span class="text">各条目含义(</span>
      <span class="iconfont">"&#xe69b;"</span>
      <span class="text" style="margin-left: 0;">表示缺乏数据，胜率可能不准确)</span>
    </div>
    <x-modal :text='infomation' :no-cancel='true' :no-title='true' confirm-text='朕知道了' :hidden.sync='hideModal'></x-modal>
  </div>
</template>

<script>
import utils from '@/utils'
import DeckCards from '@/components/DeckCards'
import xModal from "@/components/x-modal/x-modal"
export default {
  name: 'mulliganList',
  props: ['cList', 'mData'],
  components: {
    DeckCards,
    xModal
  },
  data() {
    return {
      formatData: [],
      formatClist: [],
      tableTitle: [
        {id: 'opening_hand_winrate', name: '起手胜率'},
        {id: 'keep_percentage', name: '保留率'},
        {id: 'winrate_when_drawn', name: '抽到胜率'},
        {id: 'winrate_when_played', name: '打出胜率'},
        {id: 'avg_turns_in_hand', name: '持有回合'},
        {id: 'avg_turn_played_on', name: '打出回合'},
      ],
      orderBy: 'card',
      normalOrder: '/static/icons-v2/rank-normal.png',
      upOrder: '/static/icons-v2/rank-up.png',
      downOrder: '/static/icons-v2/rank-down.png',
      hideModal: true,
      infomation: "<b>起手胜率：</b>起手最终剩下的卡牌的平均胜率。<br/><b>保留率：</b>出现在调度界面的卡牌被保留的频率百分比。<br/><b>抽到胜率：</b>在游戏结束前能抽到这张牌时平均胜率（即使没有打出）。<br/><b>打出胜率：</b>在任何时刻打出的卡牌的平均胜率。<br/><b>持有回合：</b>手牌留在手中的平均回合数。<br/><b>打出回合：</b>卡牌打出的平均回合。"
    }
  },
  methods: {
    compareFunction(key) {
      return function(obj1, obj2) {
        let formatKey = key.replace('-', '')
        if (key.indexOf('-') !== -1) {
          return obj2[formatKey]-obj1[formatKey]
        } else {
          return obj1[formatKey]-obj2[formatKey]
        }
      }
    },
    sortFunc(propName, referArr) {
      return (prev, next) => {
        return referArr.indexOf(prev[propName]) - referArr.indexOf(next[propName])
      }
    },
    formatMulliganData() {
      if (this.mData) {
        if (typeof this.mData === 'string') {
          this.formatData = JSON.parse(this.mData)
        } else {
          this.formatData = this.mData
        }
      }
      
      if (this.formatClist.length===0) {
        if (typeof this.cList === 'string') {
          this.formatClist = JSON.parse(this.cList)
        } else {
          this.formatClist = utils.deepCopy(this.cList)
        }
      }
      let cListArray = this.formatClist.map(v => {
        return v.dbfId
      })
      this.formatData.sort((prev, next) => {
        return cListArray.indexOf(prev.dbf_id)-cListArray.indexOf(next.dbf_id)
      })
    },
    handleCardClick(item) {
      wx.navigateTo({
        url: `/pages/cards/cardDetail/index?id=${item.dbfId}`
      })
    },
    handleOrderClick(item) {
      // 数据部分排序
      if (this.orderBy.indexOf(item.id)>=0) {
        this.orderBy = this.orderBy.split('')[0]==='-'?item.id:'-'+item.id
      } else {
        this.orderBy = '-'+item.id
      }
      this.formatData.sort(this.compareFunction(this.orderBy))
      
      // 卡牌部分排序
      let formatDataArray = this.formatData.map(v => {
        return v.dbf_id
      })
      this.formatClist.sort((prev, next) => {
        return formatDataArray.indexOf(prev.dbfId)-formatDataArray.indexOf(next.dbfId)
      })
    },
    handleCardOrderClick() {
      // 卡牌部分排序
      if (this.orderBy.indexOf('card')>=0) {
        this.orderBy = this.orderBy.split('')[0]==='-'?'card':'-'+'card'
      } else {
        this.orderBy = 'card'
      }
      let tempArray = this.cList
      if (this.cList && typeof this.cList === 'string') {
        tempArray = JSON.parse(this.cList)
      }
      if (this.orderBy === '-card') {
        this.formatClist = tempArray.reverse()
      } else {
        this.formatClist = tempArray
      }
      // 数据部分排序
      let formatClistArray = this.formatClist.map(v => {
        return v.dbfId
      })
      this.formatData.sort((prev, next) => {
        return formatClistArray.indexOf(prev.dbf_id)-formatClistArray.indexOf(next.dbf_id)
      })
    },
    handleInfomation() {
      this.hideModal = false
    }
  },
  mounted() {
    this.formatMulliganData()
    // if (this.formatClist.length===0) {
    //   if (typeof this.cList === 'string') {
    //     this.formatClist = JSON.parse(this.cList)
    //   } else {
    //     this.formatClist = utils.deepCopy(this.cList)
    //   }
    // }
  },
  watch: {
    // mData: {
    //   handler(newValue, oldValue) {
    //     this.formatMulliganData()
    //   },
    //   deep: true,
    //   immediate:true
    // },
    // cList: {
    //   handler(newValue, oldValue) {
    //     if (this.formatClist.length===0) {
    //       if (typeof newValue === 'string') {
    //         this.formatClist = JSON.parse(newValue)
    //       } else {
    //         this.formatClist = utils.deepCopy(newValue)
    //       }
    //     }
    //   },
    //   deep: true,
    //   immediate:true
    // }
  }
}
</script>

<style scoped lang="scss">
@import '../../../style/color';
.mulligan-container {
  display:flex;
  flex-wrap: nowrap;
  margin: 5rpx 0 0 30rpx;
  box-sizing: border-box;
  overflow: hidden;
  .card-block {
    width: 302rpx;
    .card-header {
      width: 100%;
      line-height: 29px;
      text-align: center;
      color: #333;
      font-size: 15px;
    }
  }
  .data {
    display: flex;
    white-space: nowrap;
    text-align: center;
    font-size: 14px;
    width: 410rpx;
  }
  .table-tr {
    width: 100%;
    font-size: 13px;
    .table-td {
      display: inline-block;
      text-align: center;
      width: 165rpx;
      span {
        height: 60rpx;
        line-height: 60rpx;
      }
    }
  }
  .data-block {
    height: 58rpx;
    margin-top: 4rpx;
    .data-item {
      display: inline-block;
      width: 165rpx;
      line-height: 58rpx;
      font-size: 25rpx;
      font-weight: bold;
      text-align: center;
      .iconfont {
        margin-left: 5rpx;
        font-size: 13px;
      }
    }
  }
}
.text-center {
  text-align: center;
}
.float-right {
  float: right;
  margin-right: 20px;
}
.header {
  width: 100%;
  line-height: 58rpx;
  border-bottom: 1rpx solid #eee;
  .table-name {
    width: 265rpx;
    color: #333;
    box-sizing: border-box;
    padding-left: 33rpx;
  }
}
.order {
  position: relative;
  font-size: 13px;
  color: #333;
  img {
    position:absolute;
    width: 22rpx;
    height: 36rpx;
    line-height:26rpx;
    top:50%;
    transform:translateY(-50%);
  }
}
.info {
  height: 58rpx;
  line-height: 58rpx;
  margin: 10rpx 30rpx 0;
  font-size: 14px;
  text-align: left;
  color: $palette-blue;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  .text {
    margin-left: 10rpx;
  }
}
</style>
