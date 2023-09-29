import { withNoopInstall } from '@tuniao/tnui-vue3-uniapp/utils'
import ImageCrop from './index.vue'

export const TnImageCrop = withNoopInstall(ImageCrop)
export default TnImageCrop

export * from './types'
export type { TnImageCropInstance } from './instance'
