import { computed, toRef } from 'vue'
import { useComponentColor, useNamespace } from '@tuniao/tnui-vue3-uniapp/hooks'

import type { CSSProperties } from 'vue'
import type { ImageCropProps } from '../types'

export const useImageCropCustomStyle = (props: ImageCropProps) => {
  const ns = useNamespace('image-crop')

  // 解析颜色
  const [bgColorClass, bgColorStyle] = useComponentColor(
    toRef(props, 'bgColor'),
    'border'
  )
  const [borderColorClass, borderColorStyle] = useComponentColor(
    toRef(props, 'borderColor'),
    'border'
  )

  // imageCrop样式
  const imageCropStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}

    if (props.zIndex) style.zIndex = props.zIndex

    return style
  })

  // 裁剪预览框样式
  const cropPreviewClass = computed<string>(() => {
    const cls: string[] = [ns.e('crop-preview')]

    if (bgColorClass.value) cls.push(bgColorClass.value)

    return cls.join(' ')
  })
  const cropPreviewStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}

    if (bgColorStyle.value) style.borderColor = bgColorStyle.value
    if (props.zIndex) style.zIndex = props.zIndex
    if (props.circle) style.borderRadius = '50%'

    return style
  })
  const cropPreviewBorderClass = computed<string>(() => {
    const cls: string[] = [ns.em('crop-preview', 'border')]

    if (borderColorClass.value) cls.push(borderColorClass.value)

    return cls.join(' ')
  })
  const cropPreviewBorderStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}

    if (borderColorStyle.value) style.borderColor = borderColorStyle.value
    if (props.zIndex) style.zIndex = props.zIndex + 1
    if (props.circle) style.borderRadius = '50%'

    return style
  })

  //预览图片样式
  const previewImageStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}

    if (props.zIndex) style.zIndex = props.zIndex - 1

    return style
  })

  return {
    ns,
    imageCropStyle,
    cropPreviewClass,
    cropPreviewStyle,
    cropPreviewBorderClass,
    cropPreviewBorderStyle,
    previewImageStyle,
  }
}
