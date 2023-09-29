<script lang="ts" setup>
import { imageCropProps } from './types'
import { useImageCrop, useImageCropCustomStyle } from './composables'

const props = defineProps(imageCropProps)

const {
  generateCanvasId,
  cropContainerId,
  previewImageRect,
  canvasRectInfo,
  loadImageErrorHandle,
  loadImageFinishHandle,
  imageTouchStartHandle,
  imageTouchMoveHandle,
  imageTouchEndHandle,
  saveImage,
} = useImageCrop(props)
const {
  ns,
  imageCropStyle,
  cropPreviewClass,
  cropPreviewStyle,
  cropPreviewBorderClass,
  cropPreviewBorderStyle,
  previewImageStyle,
} = useImageCropCustomStyle(props)

defineExpose({
  /**
   * @description: 保存图片
   */
  save: saveImage,
})
</script>

// #ifdef MP-WEIXIN
<script lang="ts">
export default {
  options: {
    // 在微信小程序中将组件节点渲染为虚拟节点，更加接近Vue组件的表现(不会出现shadow节点下再去创建元素)
    virtualHost: true,
  },
}
</script>
// #endif

<template>
  <view :class="[ns.b()]" :style="imageCropStyle">
    <view
      :class="[ns.e('image-preview')]"
      :style="{
        ...previewImageStyle,
        ...{
          width: previewImageRect?.width
            ? `${previewImageRect.width}px`
            : 'auto',
          height: previewImageRect?.height
            ? `${previewImageRect.height}px`
            : 'auto',
          left: previewImageRect?.left ? `${previewImageRect.left}px` : '0',
          top: previewImageRect?.top ? `${previewImageRect.top}px` : '0',
          transformOrigin: `${previewImageRect.centerPoint.x}px ${previewImageRect.centerPoint.y}px`,
          transform: `translate3d(${previewImageRect.translate.x}px, ${previewImageRect.translate.y}px, 0px) rotate(${previewImageRect.angle}deg) scale(${previewImageRect.scale})`,
        },
      }"
    >
      <!-- 显示测试居中点 -->
      <view
        :style="{
          position: 'absolute',
          zIndex: 1000,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          left: `${previewImageRect.centerPoint.x}px`,
          top: `${previewImageRect.centerPoint.y}px`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'blue',
        }"
      />
      <!-- 图片预览 -->
      <image
        class="tn-image"
        :src="src"
        @error="loadImageErrorHandle"
        @load="loadImageFinishHandle"
      />
    </view>
    <!-- 预览框 -->
    <view :class="[cropPreviewClass]" :style="cropPreviewStyle">
      <view :id="cropContainerId" :class="[ns.em('crop-preview', 'container')]">
        <view
          :class="[cropPreviewBorderClass]"
          :style="cropPreviewBorderStyle"
          @touchstart.stop.prevent="imageTouchStartHandle"
          @touchmove.stop.prevent="imageTouchMoveHandle"
          @touchend.stop.prevent="imageTouchEndHandle"
        />
      </view>
    </view>
  </view>

  <!-- 生成图片canvas容器 -->
  <canvas
    :id="generateCanvasId"
    :canvas-id="generateCanvasId"
    :class="[ns.e('generate-canvas')]"
    :style="{
      width: `${canvasRectInfo.width}px`,
      height: `${canvasRectInfo.height}px`,
    }"
  />
</template>

<style lang="scss" scoped>
@import './theme-chalk/index.scss';
</style>
