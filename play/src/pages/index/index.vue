<script setup lang="ts">
import { ref } from 'vue'
import TnButton from '@tuniao/tnui-vue3-uniapp/components/button/src/button.vue'
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import TnImageCrop from '../../packages/src/index.vue'
import type { TnImageCropInstance } from '../../packages/src'

// const image = 'https://resource.tuniaokj.com/images/content/rodion.jpg'
// const image = 'https://resource.tuniaokj.com/images/content/activity.jpg'
// const image = 'https://resource.tuniaokj.com/images/icon/1.jpg'
// const image = 'https://resource.tuniaokj.com/images/landscape/2022-new-year.png'
// const image = 'https://resource.tuniaokj.com/images/swiper/autumn.jpg'
const image = ref('')

const imageCropRef = ref<TnImageCropInstance>()
const imageData = ref<string>('')

const imageLoad = (event: any) => {
  console.log(event)
}

const showPopup = ref(false)
const openPopup = () => {
  image.value = 'https://resource.tuniaokj.com/images/content/rodion.jpg'
  showPopup.value = true
}

const generateImage = async () => {
  showPopup.value = false
  try {
    const data = await imageCropRef.value?.save({ cropRatio: 0.5 })
    console.log(data)
    imageData.value = data!
  } catch (err) {
    console.log(err)
  }
}
</script>

<template>
  <TnButton @click="openPopup">打开弹框</TnButton>
  <TnPopup
    v-model="showPopup"
    width="100vw"
    height="100vh"
    :overlay-closeable="false"
  >
    <view class="container">
      <view class="content">
        <TnImageCrop ref="imageCropRef" :src="image" circle :z-index="30000" />
      </view>
      <view class="button">
        <TnButton size="xl" @click="generateImage">保存图片</TnButton>
      </view>
    </view>
  </TnPopup>

  <!-- <view class="container">
    <view class="content">
      <TnImageCrop ref="imageCropRef" :src="image" circle :z-index="30000" />
    </view>
    <view class="button">
      <TnButton size="xl" @click="generateImage">保存图片</TnButton>
    </view>
  </view> -->

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
.container {
  position: relative;
  width: 100%;
  height: 100%;

  /* width: 100vw;
  height: 100vh; */

  .content {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .button {
    position: absolute;
    z-index: 300001;
    left: 50%;
    bottom: 50rpx;
    transform: translate(-50%, -50%);
  }
}
</style>
