<script>
	export default {
	    methods: {
            Login() {
                this.$store.dispatch('Login').then(res => {
                    console.log('success', res)
                    this.$store.dispatch('getCollectedDecks', res.result.data.id).then(res => {
                        // console.log('aaa', res)
                    })
                }).catch(err => {
                    console.log('fail', err)
                })
            },
            initDecksName() {
                this.$store.dispatch('getDecksName').then(res => {
                    // console.log('decksname', res)
                })
            },
            initCardSeries() {
                this.$store.dispatch('getSeriesData').then(res => {
                    // console.log('series', res)
                })
            },
            setNavHeight() {
                this.$store.dispatch('setNavHeight').then(res => {
                    // console.log(res)
                })
            },
            setWinWidthHeight() {
                this.$store.dispatch('setWinWidthHeight').then(res => {
                    // console.log(res)
                })
            },
            initSystemSetting() {
                this.$store.dispatch('setSystemSetting').then(res => {
                    // console.log('setSystemSetting', res)
                })
            },
            setNotice() {
                this.$store.dispatch('getNotice').then(res => {
                    // console.log('setNotice', res)
                })
            }
        },
		onLaunch: function() {
			console.log('App Launch')
            require('./utils/sdk-qq.2.3.0')
            let clientID = 'ec59002ba0fc4c74bf50'
            qq.BaaS.init(clientID)

            // 业务逻辑代码
            this.initSystemSetting()
            this.initDecksName()
            this.initCardSeries()
            this.setNavHeight()
            this.setWinWidthHeight()
            this.setNotice()
            this.Login()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
@import url("/components/gaoyia-parse/parse.css");
@import "style/zanui.wxss";
@import "style/color";
/*每个页面公共css */
.container {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}
* {
  transition: width 2s;
  -moz-transition: width 2s;
  -webkit-transition: width 2s;
  -o-transition: width 2s;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
.m-30 {
  margin: 0 30rpx;
}
.p-30 {
  padding: 0 30rpx;
}
.pr-30 {
  padding-right: 30rpx;
}
.color-green {
  color: $palette-green;
}
.color-light-green {
  color: $palette-light-green;
}
.color-red {
  color: $palette-orange;
}
.float-left {
  float: left;
}
.float-right {
  float: right;
}
.font-bold {
  font-weight: 700;
}
.clear {
  &:after {
    content:"";
    display:block;
    clear: both;
  }
}
.ads {
  ad {
    transform: scale(0.9) !important;
  }
}
.header-title {
  width: 100%;
  height: 30px;
  line-height: 30px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  border-radius: 5px;
  margin: 5px 0;
  padding-left: 14px;
  .header-btn {
    float: right;
    height:100%;
    line-height:60rpx;
    margin-right: 15px;
    border-radius:10px;
  }
}
.headline {
  position: relative;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  .head-picker {
    display: inline-block;
    height: 24rpx;
    line-height: 24rpx;
    margin-left:8px;
    font-size: 19rpx;
    color: #7e7e7e;
    border: 1rpx solid #ddd;
    border-radius: 12px;
    padding: 3rpx 10rpx;
    // background: $palette-blue;
    // color: #fff;
    // font-weight: normal;
    // border: 1rpx solid $palette-blue;
  }
  .right-meta {
    float: right;
    height:100%;
    line-height:96rpx;
    font-size:28rpx;
    color: $palette-blue;
  }
}
.c-button {
  background-color: white;
  border-radius: 0;
  margin: 0;
  padding: 0;
  &:after {
    border: none;
  }
}
.grad-header-light-blue {
  background: linear-gradient(65deg,#1d3657,#bed6ff calc(100% - 120px),rgba(49,49,49,0) calc(100% - 50px),rgba(49,49,49,0));
}
.grad-header-gray {
  background: linear-gradient(65deg,#555,#eee calc(100% - 120px),rgba(49,49,49,0) calc(100% - 50px),rgba(49,49,49,0));
}
.loading {
  width: 100%;
  text-align: center;
  font-size: 13px;
  color: #ddd;
}
.notice-bar {
  position: absolute;
  width:100%;
  margin-top: 0;
  z-index:2;
  background: rgba(0,0,0,.3);
  &:after {
    border: none;
  }
}
::-webkit-scrollbar{
  width: 0;
  height: 0;
  color: transparent;
}
</style>

