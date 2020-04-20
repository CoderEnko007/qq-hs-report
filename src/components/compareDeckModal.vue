<template>
  <div class="compare-container">
    <div class="modalMask" :class="{'maskFadeIn': changeModel, 'maskFadeOut': !changeModel && isModel}"></div>
    <div class="modalDialog" :class="{'fadeIn': changeModel, 'fadeOut': !changeModel && isModel}">
      <!--<div class="modalHeader">-->
        <!--<p class="title"></p>-->
      <!--</div>-->
      <div class="modalContent">
        <div class="contentLine">
          <div class="text">
            <span class="title">卡组1：</span>
            <input type="text" class="deckCode" :value="deck1Code" disabled="true">
          </div>
          <div class="btn-group">
            <div class="btn" :class="{'de-active': currentBtnDeActive}" @click="addCurrentDeck1">加入当前卡组</div>
            <div class="btn" @click="addClipDeck1">加入剪切板卡组</div>
          </div>
        </div>
        <div class="separator"></div>
        <div class="contentLine">
          <div class="text">
            <span class="title">卡组2：</span>
            <input type="text" class="deckCode" :value="deck2Code" disabled="true">
          </div>
          <div class="btn-group">
            <div class="btn" :class="{'de-active': currentBtnDeActive}" @click="addCurrentDeck2">加入当前卡组</div>
            <div class="btn" @click="addClipDeck2">加入剪切板卡组</div>
          </div>
        </div>
      </div>
      <div class="modalFooter">
        <div class="modalBtn btnCancel" @tap="tapCancel">{{cancelBtnText}}</div>
        <div class="modalBtn btnClear" @tap="tapClear">清空</div>
        <div class="modalBtn btnConfirm" :class="{'btnConfirmDisable': disableCompare, 'btnConfirmEnable': !disableCompare}" @tap="confirmSend">开始对比</div>
      </div>
    </div>
  </div>
</template>
<script>
import utils from '@/utils'
import { mapGetters } from 'vuex'
import {getDeckCardList} from '@/api/dbapi'

export default {
  name: 'compareDeckModal',
  props: ['deckDetail', 'currentBtnDeActive'],
  data() {
    return {
      changeModel: false,
      isModel: false,
      deckCode1: '',
      deckCode2: '',
    };
  },
  computed: {
    ...mapGetters([
      'compareDeck1',
      'compareDeck2'
    ]),
    deck1Code() {
      return this.compareDeck1?this.compareDeck1.deck_code:""
    },
    deck2Code() {
      return this.compareDeck2?this.compareDeck2.deck_code:""
    },
    disableCompare() {
      return this.compareDeck1 === null || this.compareDeck2 === null;
    },
    cancelBtnText() {
      return '确定'
    }
  },
  methods: {
    sortFunction() {
      return function(a, b) {
        if(a.cost===b.cost) {
          if (a.name>=b.name) {
            return 1
          } else {
            return -1
          }
        } else {
          return a.cost-b.cost
        }
      }
    },
    //  弹框取消
    tapCancel() {
      this.changeModel = false;
    },
    tapClear() {
      console.log('tabClear')
      this.$store.commit('clearDecks')
    },
    //  确认
    confirmSend() {
      if (!this.disableCompare) {
        this.changeModel = false;
        wx.navigateTo({
          url: `/pages/decks/compareDeck/index`
        })
      }
    },
    showModal() {
      this.changeModel = true;
      this.isModel = true;
    },
    addCurrentDeck1() {
      if (!this.currentBtnDeActive) {
        this.$store.commit('setFirstDeck', this.deckDetail)
      }
    },
    addClipDeck1() {
      wx.getClipboardData({
        success: result => {
          let code = result.data.trim()
          code = code.match(/AAE.*/i)
          console.log(code)
          let decoded
          try{
            decoded = this.$deckstrings.decode(code);
          }catch(e){
            //TODO handle the exception
            console.log(e)
            wx.showToast({
              title: '你怕是复制了一个假卡组!（或者没有复制卡组代码）',
              icon: 'none',
              duration: 2000
            })
            return
          }
          let faction = null
          for (let key in utils.heroesID) {
            if (utils.heroesID.hasOwnProperty(key)) {
              if (utils.heroesID[key].indexOf(decoded.heroes[0])>=0) {
                faction = key
              }
            }
          }
          let cardList = decoded.cards.map(v => {
            return v[0]
          })
          getDeckCardList({list: cardList}).then(res => {
            let formatList = res.objects.map(v => {
              return {
                name: v.ename,
                cname: v.name,
                cost: v.cost,
                count: decoded.cards.filter(card => {
                  return card[0] === v.dbfId
                })[0][1],
                card_hsid: v.hsId,
                dbfId: v.dbfId,
                rarity: v.rarity,
              }
            })
            formatList.sort(this.sortFunction())
            this.$store.commit('setFirstDeck', {faction: faction, deck_code: code, card_list: formatList})
          }).catch(err => {
            console.log(err)
          })
        }
      })
    },
    addCurrentDeck2() {
      if (!this.currentBtnDeActive) {
        this.$store.commit('setSecondDeck', this.deckDetail)
      }
    },
    addClipDeck2() {
      wx.getClipboardData({
        success: result => {
          // this.$emit('addCompareDeck2', {mode: 'clipboard', code: res.data})
          let code = result.data.trim()
          code = code.match(/AAE.*/i)
          let decoded
          try{
            decoded = this.$deckstrings.decode(code);
          }catch(e){
            //TODO handle the exception
            console.log(e)
            wx.showToast({
              title: '你怕是复制了一个假卡组（或者没有复制卡组代码）!',
              icon: 'none',
              duration: 2000
            })
            return
          }
          let faction = null
          for (let key in utils.heroesID) {
            if (utils.heroesID.hasOwnProperty(key)) {
              if (utils.heroesID[key].indexOf(decoded.heroes[0])>=0) {
                faction = key
              }
            }
          }
          let cardList = decoded.cards.map(v => {
            return v[0]
          })
          getDeckCardList({list: cardList}).then(res => {
            let formatList = res.objects.map(v => {
              return {
                name: v.ename,
                cname: v.name,
                cost: v.cost,
                count: decoded.cards.filter(card => {
                  return card[0] === v.dbfId
                })[0][1],
                card_hsid: v.hsId,
                dbfId: v.dbfId,
                rarity: v.rarity,
              }
            })
            formatList.sort(this.sortFunction())
            this.$store.commit('setSecondDeck', {faction: faction, deck_code: code, card_list: formatList})
          }).catch(err => {
            console.log(err)
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
/* 弹窗开始 */
.modalMask {
  display: none;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: #000;
  opacity: 0.5;
  overflow: hidden;
  z-index: 9000;
  color: #fff;
}
.modalDialog {
  display: none;
  box-sizing: border-box;
  width: 580rpx;
  overflow: hidden;
  position: fixed;
  top: 50%;
  left: 0;
  z-index: 9999;
  background: #fff;
  margin: -180rpx 95rpx;
  border-radius: 8rpx;
}
.modalContent {
  box-sizing: border-box;
  display: flex;
  // padding: 50rpx 20rpx 0;
  padding: 20rpx; 
  font-size: 32rpx;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .separator {
    width: 100%;
    box-sizing: border-box;
    border-bottom: 1rpx solid #eee;
    margin: 20rpx 0;
  }
  .contentLine {
    // margin-bottom: 50rpx;
    margin: 20rpx 0;
    width: 100%;
    .text {
      display: flex;
      flex-wrap: nowrap;
      .title {
        width: 120rpx;
      }
      .deckCode {
        width:80%;
        height: 100%;
        line-height: 60rpx;
        border-radius:16rpx;
        padding:0 10rpx;
        font-size: 28rpx;
        color: #666;
        background-color: #f8f8f8;
        border:1rpx solid #eee;
        box-sizing:border-box;
      }
    }
    .btn-group {
      display: flex;
      justify-content: space-between;
      margin-top: 20rpx;
      .btn {
        height: 100%;
        line-height: 60rpx;
        margin: 0 20rpx;
        box-sizing:border-box;
        text-align:center;
        border-radius:16rpx;
        font-size:12px;
        background-color:#433e88;
        color:#fff;
        padding:0 25rpx;
        border: 1rpx solid #ccc;
      }
      .de-active {
        background: rgba(67, 62, 136, .2);
        color: rgba(67, 62, 136, .5);
        border: 1rpx solid rgba(67, 62, 136, .5);
      }
    }
  }
}
.contentTip {
  text-align: center;
  font-size: 36rpx;
  color: #333333;
}
.modalFooter {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  height: 80rpx;
  border-top: 1px solid #e5e5e5;
  font-size: 32rpx;
  line-height: 80rpx;
}
.modalBtn {
  font-size: 32rpx;
  width: 33%;
  color: #333;
  text-align: center;
}
.btnClear {
  border-left: 1px solid #e5e5e5;
  border-right: 1px solid #e5e5e5;
}
.btnConfirmDisable {
  color: #aaa;
}
.btnConfirmEnable {
  color: #508cee;
}
.fadeOut {
  display: block;
  animation: fadeOut .5s forwards;
}
.fadeIn {
  display: block;
  animation:fadeIn .5s forwards;
}
.maskFadeOut {
  display: block;
  animation: maskFadeOut .5s forwards;
}
.maskFadeIn {
  display: block;
  animation:maskFadeIn .5s forwards;
}
@keyframes fadeIn {
  0%    {opacity: 0}
  100%  {opacity: 1; display: block;}
}
@keyframes fadeOut {
  0%    {opacity: 1}
  100%  {opacity: 0; visibility: hidden}
}
@keyframes maskFadeIn {
  0%    {opacity: 0}
  100%  {opacity: 0.5; display: block;}
}
@keyframes maskFadeOut {
  0%    {opacity: 0.5}
  100%  {opacity: 0; visibility: hidden}
}
/* 弹窗结束 */
</style>
