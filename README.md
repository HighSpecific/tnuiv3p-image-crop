# 图鸟 UI vue3 uniapp Plugins - 图片裁剪

![TuniaoUI vue3 uniapp](https://resource.tuniaokj.com/images/vue3/market/vue3-banner-min.jpg 'TuniaoUI vue3 uniapp')

[Tuniao UI vue3官方仓库](https://github.com/tuniaoTech/tuniaoui-rc-vue3-uniapp)

该组件适用于用户选择图片之后，对图片进行裁剪，裁剪完成之后，返回裁剪后的图片临时地址或者base64的数据

## 组件安装

```bash
npm i tnuiv3p-tn-image-crop
```

## 组件位置

```typescript
import TnImageCrop from 'tnuiv3p-tn-image-crop/index.vue'
```

## 平台差异说明

| App(vue) | H5  | 微信小程序 | 支付宝小程序 |  ...   |
| :------: | :-: | :--------: | :----------: | :----: |
|    √     |  √  |     √      |      √       | 适配中 |

## 基础使用

该组件默认取用户设置的容器的宽高，然后根据宽高的比例设置裁剪框的尺寸，组件并不是全屏的，所以需要用户自己设置容器的宽高

- 通过`src`传递待裁剪的图片地址
- 设置`circle`设置是否裁剪后的图片为圆形

```vue
<script setup lang="ts">
const image = 'https://resource.tuniaokj.com/images/content/rodion.jpg'
</script>

<template>
  <view class="content">
    <TnImageCrop :src="image" />
  </view>
</template>

<style>
.content {
  position: relative;
  width: 100%;
  height: 100vh;
}
</style>
```

## 获取裁剪后的图片

- 通过调用组件的`save`方法，可以获取裁剪后的图片的临时地址或者base64的数据

`save`方法传递一个`options`参数来设置对应生成图片的参数

#### options属性说明

| 属性名称  | 属性说明                                     | 属性类型 | 默认值 |
| --------- | -------------------------------------------- | -------- | ------ |
| base64    | 返回base64格式的图片，H5端默认返回base64格式 | boolean  | false  |
| cropRatio | 裁剪后的图片与原图片的比例, 范围0 ~ 1        | number   | 1      |
| quality   | 裁剪后图片的质量, 范围0 ~ 1                  | number   | 1      |

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TnButton from '@tuniao/tnui-vue3-uniapp/components/button/src/button.vue'
import type { TnImageCropInstance } from 'tnuiv3p-tn-image-crop'

const imageCropRef = ref<TnImageCropInstance>()

const image = 'https://resource.tuniaokj.com/images/content/rodion.jpg'

// 获取裁剪后的图片
const saveImage = async () => {
  const imageData = await imageCropRef.value?.save({
    base64: false,
  })
  // eslint-disable-next-line no-console
  console.log(imageData)
}
</script>

<template>
  <view class="content">
    <TnImageCrop :src="image" />
  </view>
  <view class="button">
    <TnButton size="xl" @click="saveImage">保存图片</TnButton>
  </view>
</template>

<style>
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
```

## API

### Props

| 属性名       | 说明                                       | 类型    | 默认值               | 可选值                                                       |
| ------------ | ------------------------------------------ | ------- | -------------------- | ------------------------------------------------------------ |
| src          | 图片地址                                   | String  | -                    | -                                                            |
| circle       | 圆形裁剪框                                 | Boolean | `false`              | `true`                                                       |
| border-color | 裁剪框边框颜色，以tn开头使用图鸟内置的颜色 | String  | `#fff`               | [边框颜色](https://vue3.tuniaokj.com/zh-CN/guide/style/border.html) |
| bg-color     | 容器背景颜色，以tn开头使用图鸟内置的颜色   | String  | `rgba(0, 0, 0, 0.5)` | [背景颜色](https://vue3.tuniaokj.com/zh-CN/guide/style/border.html) |
| z-index      | zIndex                                     | Number  | 100                  | -                                                            |
| min-scale    | 最小缩放系数                               | Number  | 0.5                  | -                                                            |
| max-scale    | 最大缩放系数                               | Number  | 2                    | -                                                            |



### Expose

| 函数名 | 函数说明 | 函数类型                                             |
| ------ | -------- | ---------------------------------------------------- |
| save   | 保存图片 | `(options?: GenerateImageOption) => Promise<string>` |



#### GenerateImageOption

| 属性名称  | 属性说明                                     | 属性类型 | 默认值 |
| --------- | -------------------------------------------- | -------- | ------ |
| base64    | 返回base64格式的图片，H5端默认返回base64格式 | boolean  | false  |
| cropRatio | 裁剪后的图片与原图片的比例, 范围0 ~ 1        | number   | 1      |
| quality   | 裁剪后图片的质量, 范围0 ~ 1                  | number   | 1      |
