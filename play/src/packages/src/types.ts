import { buildProps } from '@tuniao/tnui-vue3-uniapp/utils'

import type { ExtractPropTypes } from 'vue'

export type GenerateImageOption = {
  /**
   * @description 返回base64格式的图片，H5端默认返回base64格式
   */
  base64?: boolean
  /**
   * @description 裁剪后的图片与原图片的比例
   */
  cropRatio?: number
  /**
   * @description 裁剪后图片的质量, 范围0 ~ 1
   */
  quality?: number
}

export const imageCropProps = buildProps({
  /**
   * @description 图片地址
   */
  src: {
    type: String,
    required: true,
  },
  /**
   * @description 圆形裁剪框
   */
  circle: {
    type: Boolean,
    default: false,
  },
  /**
   * @description 裁剪框边框颜色，以tn开头使用图鸟内置的颜色
   */
  borderColor: {
    type: String,
    default: '#fff',
  },
  /**
   * @description 容器背景颜色，以tn开头使用图鸟内置的颜色
   */
  bgColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.5)',
  },
  /**
   * @description zIndex
   */
  zIndex: {
    type: Number,
    default: 100,
  },
  /**
   * @description 最小缩放比例, 范围0 ~ 1
   */
  minScale: {
    type: Number,
    default: 0.5,
  },
  /**
   * @description 最大缩放比例, 范围 1 ~ 10
   */
  maxScale: {
    type: Number,
    default: 2,
  },
})

export type ImageCropProps = ExtractPropTypes<typeof imageCropProps>
