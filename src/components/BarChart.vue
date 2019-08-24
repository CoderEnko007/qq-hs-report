<template>
	<view class="qiun-columns">
		<view class="qiun-charts" >
			<canvas canvas-id="canvasColumn" id="canvasColumn" class="charts" @touchstart="touchColumn"></canvas>
		</view>
	</view>
</template>

<script>
	import uCharts from '@/components/u-charts/u-charts.js';
	var _self;
	var canvaColumn=null;
	export default {
		data() {
			return {
				cWidth:'',
				cHeight:'',
				pixelRatio:1,
				textarea:''
			}
		},
		onLoad() {
			_self = this;
			this.cWidth=uni.upx2px(750);
			this.cHeight=uni.upx2px(300);
      let chartData = {
        categories: ["2012", "2013", "2014", "2015", "2016", "2017"],
        series: [{data: [0, 5, 8, 2, 1, 10], color: '#433E88'}],
        
      }
			this.showColumn("canvasColumn",chartData);
		},
		methods: {
			showColumn(canvasId,chartData){
        console.log(chartData)
				canvaColumn=new uCharts({
					$this:_self,
					canvasId: canvasId,
					type: 'column',
					legend:false,
					fontSize:11,
					background:'#FFFFFF',
					pixelRatio:_self.pixelRatio,
					animation: false,
					categories: chartData.categories,
					series: chartData.series,
          yAxis: {
            max: 10,
            disabled:true
          },
					width: _self.cWidth*_self.pixelRatio,
					height: _self.cHeight*_self.pixelRatio,
					extra: {
						column: {
							type:'group',
							width: _self.cWidth*_self.pixelRatio*0.45/chartData.categories.length
						}
					}
				});
				
			},
		}
	}
</script>

<style>
	/*样式的width和height一定要与定义的cWidth和cHeight相对应*/
	.qiun-charts {
		width: 750upx;
		height: 300upx;
		background-color: #FFFFFF;
	}
	
	.charts {
		width: 750upx;
		height: 300upx;
		background-color: #FFFFFF;
	}
</style>
