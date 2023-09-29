<script setup lang="ts">
import { ref } from 'vue'
import TnButton from '@tuniao/tnui-vue3-uniapp/components/button/src/button.vue'
import TnImageCrop from '../../packages/src/index.vue'
import type { TnImageCropInstance } from '../../packages/src'

const image = 'https://resource.tuniaokj.com/images/content/rodion.jpg'
// const image = 'https://resource.tuniaokj.com/images/content/activity.jpg'
// const image = 'https://resource.tuniaokj.com/images/icon/1.jpg'
// const image = 'https://resource.tuniaokj.com/images/landscape/2022-new-year.png'

const imageCropRef = ref<TnImageCropInstance>()
const imageData = ref<string>('')

const generateImage = async () => {
  const data = await imageCropRef.value?.save({ cropRatio: 0.5 })
  imageData.value = data!
  console.log('data', data)
}

const imageLoad = (event: any) => {
  console.log(event)
}
</script>

<template>
  <view class="content">
    <TnImageCrop ref="imageCropRef" :src="image" circle />
  </view>
  <view class="button">
    <TnButton size="xl" @click="generateImage">保存图片</TnButton>
  </view>
  <view style="width: auto; height: auto">
    <image
      style="width: auto; height: auto"
      :src="imageData"
      mode="aspectFit"
      @load="imageLoad"
    />
  </view>
</template>

<style lang="scss" scoped>
.content {
  position: relative;
  width: 100%;
  height: 100vh;
}

.button {
  position: fixed;
  z-index: 1000;
  left: 50%;
  bottom: 50rpx;
  transform: translate(-50%, -50%);
}
</style>
