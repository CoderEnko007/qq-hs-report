<template>
  <image
    :mode="node.attr.mode"
    :lazy-load="node.attr.lazyLoad"
    :class="node.classStr"
    :style="newStyleStr || node.styleStr"
    :data-src="node.attr.src"
    :src="node.attr.src"
    @tap="wxParseImgTap"
    @load="wxParseImgLoad"
    />
</template>

<script>
export default {
  name: 'wxParseImg',
  data() {
    return {
      newStyleStr: '',
      preview: true,
    };
  },
  props: {
    node: {
      type: Object,
      default() {
        return {};
      },
    },
    tdImgWidth: {
      type: Number,
      default() {
        return null
      }
    }
  },
  // watch: {
  //   node: {
  //     handler(val, oldVal) {
  //       console.log('bbb', val)
  //     },
  //     deep: true,
  //     immediate: true
  //   }
  // },
  methods: {
    wxParseImgTap(e) {
      if (!this.preview) return;
      const { src } = e.currentTarget.dataset;
      if (!src) return;
      let parent = this.$parent;
      while(!parent.preview || typeof parent.preview !== 'function') {// TODO 遍历获取父节点执行方法
      	parent = parent.$parent;
      }
      parent.preview(src, e);
    },
    // 图片视觉宽高计算函数区
    wxParseImgLoad(e) {
      const { src } = e.currentTarget.dataset;
      if (!src) return;
      const { width, height } = e.mp.detail;
      const recal = this.wxAutoImageCal(width, height);
      const { imageheight, imageWidth } = recal;
      // 图片容器有30rpx左右边距时需要对宽度进行处理，否则图片会超出边界
      // const tempWidth = (imageWidth>imageheight)&&imageWidth>=375?(imageWidth-30):imageWidth
      // const tempHeight = imageWidth>imageheight&&imageWidth>=375?(imageheight-20):imageheight
      // console.log('before', imageheight, imageWidth)
      let tempWidth = imageWidth;
      let tempHeight = imageheight;
      if (this.tdImgWidth) {
        tempWidth = uni.upx2px(this.tdImgWidth)
        tempHeight = tempWidth*imageheight/imageWidth
        if (tempHeight>500) {
          tempHeight = 500
        }
      }
      if (imageWidth>=375) {
        tempWidth = (imageWidth-30)
        tempHeight = 345*imageheight/imageWidth
      }
      //  let parent = this.$parent;
      //  console.log('aaa', parent)
      // if (tempHeight>500) {
      //   tempHeight = 500
      //   tempWidth = 500*tempWidth/imageheight
      // }
      const { padding, mode } = this.node.attr;
      const { styleStr } = this.node;
      const imageHeightStyle = mode === 'widthFix' ? '' : `height: ${tempHeight}px;`;
      this.newStyleStr = `${styleStr}; ${imageHeightStyle}; width: ${tempWidth}px; padding: 0 ${+padding}px;`;
      // console.log('after', imageWidth, imageheight, tempWidth, tempHeight)
    },
    // 计算视觉优先的图片宽高
    wxAutoImageCal(originalWidth, originalHeight) {
      // 获取图片的原始长宽
      const { padding } = this.node.attr;
      const windowWidth = this.node.$screen.width - (2 * padding);
      const results = {};

      if (originalWidth < 60 || originalHeight < 60) {
        const { src } = this.node.attr;
        let parent = this.$parent;
        while(!parent.preview || typeof parent.preview !== 'function') {
          parent = parent.$parent;
        }
        parent.removeImageUrl(src);
        this.preview = false;
      }

      // 判断按照那种方式进行缩放
      if (originalWidth > windowWidth) {
        // 在图片width大于手机屏幕width时候
        results.imageWidth = windowWidth;
        results.imageheight = windowWidth * (originalHeight / originalWidth);
      } else {
        // 否则展示原来的数据
        results.imageWidth = originalWidth;
        results.imageheight = originalHeight;
      }

      return results;
    },
  },
};
</script>
