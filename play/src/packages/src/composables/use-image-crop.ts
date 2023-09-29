import {
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  toRefs,
} from 'vue'
import { debugWarn, generateId } from '@tuniao/tnui-vue3-uniapp/utils'
import { useTouchImageHandle } from './use-touch-image-handle'

import type { GenerateImageOption, ImageCropProps } from '../types'

const defaultGenerateImageOption: GenerateImageOption = {
  base64: false,
  cropRatio: 1,
  quality: 1,
}

export const useImageCrop = (props: ImageCropProps) => {
  const instance = getCurrentInstance()

  const generateCanvasId = `ticgc-${generateId()}`
  let generateCanvasCtx: UniApp.CanvasContext | undefined

  // 生成canvas的容器信息
  const canvasRectInfo = reactive<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })

  const {
    cropContainerId,
    cropRect,
    previewImageRect,
    operationImageWidth,
    operationImageHeight,
    getContainerRectInfo,
    loadImageErrorHandle,
    loadImageFinishHandle,
    imageTouchStartHandle,
    imageTouchMoveHandle,
    imageTouchEndHandle,
  } = useTouchImageHandle(toRefs(props))

  // 判断图片是否存在
  const hasImage = computed<boolean>(() => !!props.src)
  if (!hasImage.value) {
    debugWarn('[TnImageCrop]', '图片地址不能为空')
  }

  // 实际图片与裁剪框的宽高比例
  const imageCropWidthRatio = computed<number>(
    () => previewImageRect.width / operationImageWidth.value
  )
  const imageCropHeightRatio = computed<number>(
    () => previewImageRect.height / operationImageHeight.value
  )

  // 保存裁剪后的图片
  const saveImage = (options?: GenerateImageOption): Promise<string> => {
    if (!props.src) {
      debugWarn('[TnImageCrop]', '图片地址不能为空')
      return Promise.reject('图片地址不能为空')
    }

    options = { ...defaultGenerateImageOption, ...options }

    const operationImageRatio =
      operationImageWidth.value / operationImageHeight.value
    const cropRatio = cropRect.width / cropRect.height

    // 计算生成图片的canvas的宽高
    if (cropRatio > operationImageRatio) {
      // 裁剪框宽高比例大于图片宽高比例
      canvasRectInfo.width =
        operationImageWidth.value * (options.cropRatio || 1)
      canvasRectInfo.height =
        (operationImageWidth.value * (options.cropRatio || 1)) / cropRatio
    } else {
      // 裁剪框宽高比例小于图片宽高比例
      canvasRectInfo.width =
        operationImageHeight.value * (options.cropRatio || 1) * cropRatio
      canvasRectInfo.height =
        operationImageHeight.value * (options.cropRatio || 1)
    }

    return _generateCropImage(props.src, options)
  }

  // 生成裁剪后的图片
  const _generateCropImage = async (
    url: string,
    options: GenerateImageOption
  ): Promise<string> => {
    if (~url.indexOf('https:')) {
      url = await _conversionToLocalImage(url)
    }
    const cropRatio = options.cropRatio || 1
    return new Promise((resolve, reject) => {
      try {
        // 图片移动的位置
        const x =
          -(previewImageRect.centerPoint.x - cropRect.width / 2) /
          imageCropWidthRatio.value
        const y =
          -(previewImageRect.centerPoint.y - cropRect.height / 2) /
          imageCropHeightRatio.value

        // 画布中心点
        const canvasCenterPoint = {
          x: canvasRectInfo.width / 2,
          y: canvasRectInfo.height / 2,
        }

        // 先对于画布的中心点进行旋转缩放
        generateCanvasCtx?.translate(canvasCenterPoint.x, canvasCenterPoint.y)
        generateCanvasCtx?.rotate((previewImageRect.angle * Math.PI) / 180)
        generateCanvasCtx?.scale(previewImageRect.scale, previewImageRect.scale)
        generateCanvasCtx?.translate(-canvasCenterPoint.x, -canvasCenterPoint.y)

        // 如果是圆形裁剪框，先裁剪出
        if (props.circle) {
          generateCanvasCtx?.beginPath()
          generateCanvasCtx?.arc(
            canvasRectInfo.width / 2,
            canvasRectInfo.height / 2,
            canvasRectInfo.width / 2,
            0,
            2 * Math.PI
          )
          generateCanvasCtx?.clip()
        }

        // 绘制图片
        generateCanvasCtx?.drawImage(
          url,
          x * cropRatio,
          y * cropRatio,
          operationImageWidth.value * cropRatio,
          operationImageHeight.value * cropRatio
        )

        // 清空后继续绘制
        generateCanvasCtx?.draw(false, () => {
          const drawParams = {
            width: canvasRectInfo.width,
            height: canvasRectInfo.height,
            destWidth: canvasRectInfo.width,
            destHeight: canvasRectInfo.height,
            fileType: 'png',
            quality: options.quality,
          }

          if (options.base64) {
            uni.canvasGetImageData(
              {
                canvasId: generateCanvasId,
                x: 0,
                y: 0,
                width: drawParams.width,
                height: drawParams.height,
                success: (res) => {
                  const arrayBuffer = new Uint8Array(res.data)
                  const base64 = uni.arrayBufferToBase64(arrayBuffer)
                  resolve(base64)
                },
                fail: (err) => {
                  debugWarn('[TnImageCrop]', err)
                  reject(err)
                },
              },
              instance
            )
          } else {
            uni.canvasToTempFilePath(
              {
                canvasId: generateCanvasId,
                ...drawParams,
                success: (res) => {
                  resolve(res.tempFilePath)
                },
                fail: (err) => {
                  debugWarn('[TnImageCrop]', err)
                  reject(err)
                },
              },
              instance
            )
          }
        })
      } catch (err) {
        debugWarn('[TnImageCrop]', `生成裁剪后的图片失败: ${err}`)
        reject(err)
      }
    })
  }

  // 将网络图片转换为本地图片
  const _conversionToLocalImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      uni.downloadFile({
        url,
        success: (res) => {
          resolve(res.tempFilePath)
        },
        fail: (err) => {
          debugWarn('[TnImageCrop]', `下载网络图片失败: ${err}`)
          reject(err)
        },
      })
    })
  }

  const initImageCrop = async () => {
    await getContainerRectInfo()
    generateCanvasCtx = uni.createCanvasContext(generateCanvasId, instance)
  }

  onMounted(() => {
    nextTick(() => {
      initImageCrop()
    })
  })

  return {
    cropContainerId,
    generateCanvasId,
    previewImageRect,
    canvasRectInfo,
    loadImageErrorHandle,
    loadImageFinishHandle,
    imageTouchStartHandle,
    imageTouchMoveHandle,
    imageTouchEndHandle,
    saveImage,
  }
}
