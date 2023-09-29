import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
import { useSelectorQuery } from '@tuniao/tnui-vue3-uniapp/hooks'
import { debugWarn, generateId } from '@tuniao/tnui-vue3-uniapp/utils'
import type { ToRefs } from 'vue'
import type { ImageCropProps } from '../types'

type Point = {
  x: number
  y: number
}

type Vector = {
  x: number
  y: number
}

type RectInfoType = {
  width: number
  height: number
  left: number
  top: number
}

type PreviewImageRectInfoType = {
  width: number
  height: number
  left: number
  top: number
  centerPoint: Point
  translate: Point
  scale: number
  angle: number
}

export const useTouchImageHandle = (props: ToRefs<ImageCropProps>) => {
  const instance = getCurrentInstance()

  const cropContainerId = `ticc-${generateId()}`

  const { getSelectorNodeInfo } = useSelectorQuery(instance)

  // 裁剪容器的布局信息
  const cropRect = reactive<RectInfoType>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  })

  // 预览图片容器信息
  const previewImageRect = reactive<PreviewImageRectInfoType>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    centerPoint: {
      x: 0,
      y: 0,
    },
    translate: {
      x: 0,
      y: 0,
    },
    scale: 1,
    angle: 0,
  })
  // 图片宽高比
  let imageRatio = 0
  const imageOriginWidth = ref(0)
  const imageOriginHeight = ref(0)

  // 图片加载失败
  const loadImageErrorHandle = (event: any) => {
    const errMsg = event.detail.errMsg || '加载图片失败'
    debugWarn('[TnImageCrop]', errMsg)
  }
  // 图片加载完成
  const loadImageFinishHandle = (event: any) => {
    const { width = 0, height = 0 } = event.detail
    imageOriginWidth.value = width
    imageOriginHeight.value = height
    // 计算图片的宽高比
    imageRatio = width / height
    if (!cropRect.width || !cropRect.height) {
      nextTick(() => {
        setTimeout(() => {
          getContainerRectInfo().then(() => {
            initPreviewImageContainerInfo()
          })
        }, 300)
      })
    } else {
      nextTick(() => {
        initPreviewImageContainerInfo()
      })
    }
  }

  // 初始化预览图片容器相关信息
  const initPreviewImageContainerInfo = () => {
    const { width, height } = cropRect
    if (!width || !height) {
      setTimeout(() => {
        initPreviewImageContainerInfo()
      }, 150)
      return
    }
    if (imageRatio > 1) {
      // 图片宽度大于高度
      previewImageRect.height = cropRect.height
      previewImageRect.width = cropRect.height * imageRatio
      previewImageRect.left =
        cropRect.left - (previewImageRect.width - cropRect.width) / 2
      previewImageRect.top = cropRect.top
    } else {
      // 图片高度大于宽度
      previewImageRect.width = cropRect.width
      previewImageRect.height = cropRect.width / imageRatio
      previewImageRect.left = cropRect.left
      previewImageRect.top =
        cropRect.top - (previewImageRect.height - cropRect.height) / 2
    }

    calculateImageCenterPoint()
  }

  /* 图片触摸事件 */
  // 开始触摸标记
  let touchStartStatus = false
  // 记录触摸点，由于需要实现双指缩放和旋转，所以需要记录两个触摸点
  const touchPoint: [Point, Point] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]
  const beforeTranslatePoint: Point = {
    x: 0,
    y: 0,
  }
  // 两点之间的距离
  let hypotenuseLength = 0
  // 记录旋转角度点
  const angleStartPoint: Point = {
    x: 0,
    y: 0,
  }
  const angleEndPoint: Point = {
    x: 0,
    y: 0,
  }

  // 图片触摸开始
  const imageTouchStartHandle = (event: TouchEvent) => {
    const touches = event.touches || event.changedTouches
    touchStartStatus = true
    // 判断是单指拖动还是双指缩放和旋转
    if (touches.length === 1) {
      touchPoint[0].x = touches[0].pageX
      touchPoint[0].y = touches[0].pageY

      beforeTranslatePoint.x = previewImageRect.translate.x
      beforeTranslatePoint.y = previewImageRect.translate.y
    } else {
      touchPoint[0].x = touches[0].pageX
      touchPoint[0].y = touches[0].pageY
      touchPoint[1].x = touches[1].pageX
      touchPoint[1].y = touches[1].pageY

      // 计算两点之间的距离
      hypotenuseLength = Math.sqrt(
        Math.pow(touchPoint[0].x - touchPoint[1].x, 2) +
          Math.pow(touchPoint[0].y - touchPoint[1].y, 2)
      )

      // 记录旋转角度点
      angleStartPoint.x = touches[0].pageX
      angleStartPoint.y = touches[0].pageY
      angleEndPoint.x = touches[1].pageX
      angleEndPoint.y = touches[1].pageY
    }
  }

  // 图片触摸移动
  const imageTouchMoveHandle = (event: TouchEvent) => {
    if (!touchStartStatus) return
    const touches = event.touches || event.changedTouches

    // 判断是单指拖动还是双指缩放和旋转
    if (touches.length === 1) {
      const translateX = touches[0].pageX - touchPoint[0].x
      const translateY = touches[0].pageY - touchPoint[0].y

      // q: 如何修复由于旋转后中心点的变化导致的拖动不准确的问题
      // a: 旋转后的拖动，需要计算旋转后的坐标
      const { x, y } = _calcRotationPoint(
        {
          x: translateX,
          y: translateY,
        },
        -previewImageRect.angle
      )
      previewImageRect.translate.x = beforeTranslatePoint.x + x
      previewImageRect.translate.y = beforeTranslatePoint.y + y

      // 边缘检测
      // _imgPositionEdgeDetection(
      //   beforeTranslatePoint.x + x,
      //   beforeTranslatePoint.y + y
      // )
    } else {
      // 计算放大缩小比例
      const newHypotenuseLength = Math.sqrt(
        Math.pow(touches[0].pageX - touches[1].pageX, 2) +
          Math.pow(touches[0].pageY - touches[1].pageY, 2)
      )
      let scale =
        previewImageRect.scale * (newHypotenuseLength / hypotenuseLength)
      // 控制缩放比例
      if (scale < props.minScale.value) scale = props.minScale.value
      if (scale > props.maxScale.value) scale = props.maxScale.value
      previewImageRect.scale = scale

      // 重新记录两点之间的距离
      hypotenuseLength = newHypotenuseLength

      // 计算旋转角度
      const currentAnglePoint: Point = {
        x: touches[1].pageX,
        y: touches[1].pageY,
      }
      const rotateV1 = _getPointVector(angleEndPoint, angleStartPoint)
      const rotateV2 = _getPointVector(currentAnglePoint, angleStartPoint)
      const rotate = _getAngle(rotateV1, rotateV2)
      angleEndPoint.x = currentAnglePoint.x
      angleEndPoint.y = currentAnglePoint.y
      previewImageRect.angle += rotate
      // if (rotate > 0) {
      //   previewImageRect.angle = 90
      // }

      // _imgScaleEdgeDetection(
      //   previewImageRect.translate.x,
      //   previewImageRect.translate.y
      // )
    }
    // 重新计算图片中间点
    calculateImageCenterPoint()
  }

  // 图片触摸结束
  const imageTouchEndHandle = () => {
    if (!touchStartStatus) return
    touchStartStatus = false
  }

  // 计算图片相较于裁剪框的中间点，考虑缩放和旋转
  const calculateImageCenterPoint = () => {
    const { width, height, translate } = previewImageRect
    previewImageRect.centerPoint.x = width / 2 - translate.x
    previewImageRect.centerPoint.y = height / 2 - translate.y
  }

  // 图片渲染 - 缩放情况检测
  const _imgScaleEdgeDetection = (x: number, y: number) => {
    let scale = previewImageRect.scale
    let width = previewImageRect.width
    let height = previewImageRect.height

    // 如果旋转角度为90度或者270度，需要交换宽高
    if (Math.abs(previewImageRect.angle) % 180 === 90) {
      width = previewImageRect.height
      height = previewImageRect.width
    }

    // 判断缩放比例是否比裁剪框小
    if (width * scale < cropRect.width) {
      scale = cropRect.width / width
    }
    if (height * scale < cropRect.height) {
      scale = cropRect.height / height
    }

    _imgPositionEdgeDetection(x, y, scale)
  }

  // 图片渲染 - 边缘情况检测
  const _imgPositionEdgeDetection = (x: number, y: number, scale?: number) => {
    let width = previewImageRect.width
    let height = previewImageRect.height

    scale = scale || previewImageRect.scale

    // 如果旋转角度为90度或者270度，需要交换宽高
    if (Math.abs(previewImageRect.angle) % 180 === 90) {
      width = previewImageRect.height
      height = previewImageRect.width
    }

    // 边缘检测
    const scaleWidth = width * scale
    const scaleHeight = height * scale
    let xLeftLimit = (scaleWidth - cropRect.width) / 2 / scale
    let xRightLimit = -(scaleWidth - cropRect.width) / 2 / scale
    let yTopLimit = (scaleHeight - cropRect.height) / 2 / scale
    let yBottomLimit = -(scaleHeight - cropRect.height) / 2 / scale
    // console.log(scaleWidth, scaleHeight, cropRect.width, cropRect.height)
    // console.log(width, scale)
    // console.log(xLeftLimit, xRightLimit)
    // console.log('-----------------------------------------')

    // 旋转后的边缘检测
    if (previewImageRect.angle !== 0) {
      // 计算旋转的角度跟css的旋转角度是相反的
      const angle = -(previewImageRect.angle % 90)
      const x1 = -xLeftLimit,
        y1 = yTopLimit,
        x2 = xRightLimit,
        y2 = yBottomLimit
      const leftTopPoint = _calcRotationPoint({ x: x1, y: y1 }, angle)
      const rightTopPoint = _calcRotationPoint({ x: x2, y: y1 }, angle)
      const leftBottomPoint = _calcRotationPoint({ x: x1, y: y2 }, angle)
      const rightBottomPoint = _calcRotationPoint({ x: x2, y: y2 }, angle)

      if (previewImageRect.angle < 0) {
        // 逆时针旋转
        xLeftLimit += leftTopPoint.x - x1
        xRightLimit += rightBottomPoint.x - x2
        yTopLimit -= rightTopPoint.y - y1
        yBottomLimit -= leftBottomPoint.y - y2
      } else {
        // 顺时针旋转
        xLeftLimit += leftBottomPoint.x - x1
        xRightLimit += rightTopPoint.x - x2
        yTopLimit -= leftTopPoint.y - y1
        yBottomLimit -= rightBottomPoint.y - y2
      }
    }

    // 左边缘
    x = x >= xLeftLimit ? xLeftLimit : x
    x = x <= xRightLimit ? xRightLimit : x
    // 上边缘
    y = y >= yTopLimit ? yTopLimit : y
    y = y <= yBottomLimit ? yBottomLimit : y

    previewImageRect.translate.x = x
    previewImageRect.translate.y = y
    previewImageRect.scale = scale
  }

  const _getPointVector = (p1: Point, p2: Point): Vector => {
    return {
      x: Math.round(p1.x - p2.x),
      y: Math.round(p1.y - p2.y),
    }
  }

  // 获取点坐标向量模
  const _getVectorLength = (v: Vector): number => {
    return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2))
  }

  // 获取旋转角度
  const _getAngle = (v1: Vector, v2: Vector): number => {
    // 判断旋转方向(1 顺时针 -1 逆时针)
    const direction = v1.x * v2.y - v2.x * v1.y > 0 ? 1 : -1
    // 两个向量的模
    const len1 = _getVectorLength(v1),
      len2 = _getVectorLength(v2),
      mr = len1 * len2

    if (mr === 0) return 0
    // 通过数量积公式可以推导出:
    // cos = (x1 * x2 + y1 * y2)/(|a| * |b|)
    const dot = v1.x * v2.x + v1.y * v2.y
    let r = dot / mr
    if (r > 1) r = 1
    if (r < -1) r = -1

    // 转换为角度值
    return (Math.acos(r) * direction * 180) / Math.PI
  }

  // 计算旋转后坐标的值
  const _calcRotationPoint = (originPoint: Point, rotation: number): Point => {
    const { x, y } = originPoint
    const xAbs = Math.abs(x)
    const yAbs = Math.abs(y)
    const radius = Math.sqrt(x * x + y * y)

    let originAlpha = 0
    if (x > 0 && y >= 0) {
      // 第一象限 + (radius, 0)
      originAlpha = Math.atan(yAbs / xAbs)
    } else if (x <= 0 && y > 0) {
      // 第2象限 + (0, radius)
      originAlpha = Math.atan(xAbs / yAbs) + Math.PI / 2
    } else if (x < 0 && y <= 0) {
      // 第3象限 + (-radius, 0)
      originAlpha = Math.atan(yAbs / xAbs) + Math.PI
    } else if (x >= 0 && y < 0) {
      // 第4象限 + (0, -radius)
      originAlpha = Math.atan(xAbs / yAbs) + (Math.PI * 3) / 2
    }

    const radian = _conversionRadian(originAlpha + (rotation * Math.PI) / 180)
    return _calcPointWithRadiusAndAngle(radius, radian)
  }

  // 将弧度转换成角度0~2π
  const _conversionRadian = (radian: number): number => {
    let result = radian
    while (result < 0) {
      result = result + Math.PI * 2
    }
    while (result >= Math.PI * 2) {
      result = result - Math.PI * 2
    }
    return result
  }

  // 根据半径和弧度求坐标
  const _calcPointWithRadiusAndAngle = (
    radius: number,
    radian: number
  ): Point => {
    const PI = Math.PI
    const PI2 = PI / 2
    let x = 0
    let y = 0

    if (radian >= 0 && radian < PI2) {
      // 第一象限
      x = Math.cos(radian) * radius
      y = Math.sin(radian) * radius
    } else if (radian >= PI2 && radian < PI) {
      // 第二象限
      radian = radian - PI2
      x = -Math.sin(radian) * radius
      y = Math.cos(radian) * radius
    } else if (radian >= PI && radian < PI2 * 3) {
      // 第三象限
      radian = radian - PI
      x = -Math.cos(radian) * radius
      y = -Math.sin(radian) * radius
    } else if (radian >= PI2 * 3 && radian < PI * 2) {
      // 第四象限
      radian = radian - PI2 * 3
      x = Math.sin(radian) * radius
      y = -Math.cos(radian) * radius
    }

    return { x, y }
  }

  // 获取裁剪容器的布局信息
  let initCount = 0
  const getContainerRectInfo = async () => {
    try {
      const cropRectInfo = await getSelectorNodeInfo(`#${cropContainerId}`)
      cropRect.width = cropRectInfo.width || 0
      cropRect.height = cropRectInfo.height || 0
      cropRect.left = cropRectInfo.left || 0
      cropRect.top = cropRectInfo.top || 0
    } catch (err) {
      if (initCount > 10) {
        debugWarn('[TnImageCrop]', `获取裁剪容器布局信息失败: ${err}`)
        initCount = 0
        return
      }
      setTimeout(() => {
        getContainerRectInfo()
        initCount++
      }, 250)
    }
  }

  return {
    cropContainerId,
    cropRect,
    previewImageRect,
    operationImageWidth: imageOriginWidth,
    operationImageHeight: imageOriginHeight,
    getContainerRectInfo,
    loadImageErrorHandle,
    loadImageFinishHandle,
    imageTouchStartHandle,
    imageTouchMoveHandle,
    imageTouchEndHandle,
  }
}
