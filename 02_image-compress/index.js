// 全局对象
const globalObject = {
  imageWidth: 0,
  imageHeight: 0,
  imageSize: 0
}

// 全局代理对象
const GOProxy = new Proxy(globalObject, {
  set(target, p, value) {
    switch(p) {
      case "imageWidth":
        document.querySelector(".img-width").value = value
        break
      case "imageHeight":
        document.querySelector(".img-height").value = value
        break
      case "imageSize":
        document.querySelector(".img-size").innerText = getMemoryInfo(value)
        break
    }
  }
})


// 图片压缩
function imageCompress(file, config = {}) {
  // 文件读取
  const reader = new FileReader()
  // 设置默认文件类型
  const fileType = file?.type || "image/png"
  // img对象
  const imgObj = new Image()

  return new Promise((resolve, reject) => {

    // 监听图片加载过程
    imgObj.addEventListener("load", () => {

      // 计算原始图像的宽高比
      const originImageRatio = imgObj.width / imgObj.height
      let targetImageWidth = imgObj.width
      let targetImageHeight = imgObj.height

      /**
       * 判断宽高指定情况:
       * 1、宽高都指定，输出图像宽高按照指定宽高输出
       * 2、只指定宽度，输出图像宽度为指定宽度，高度根据原始图像宽高比等比扩缩
       * 3、只指定高度，输出图像高度为指定高度，宽度根据原始图像宽高比等比扩缩
       */

      if (config.width && config.height) {
        targetImageWidth = config.width
        targetImageHeight = config.height
      } else if (config.width || config.height) {
        if (config.width) {
          targetImageWidth = config.width
          targetImageHeight = targetImageWidth / originImageRatio
        } else {
          targetImageHeight = config.height
          targetImageWidth = targetImageHeight * originImageRatio
        }
      }

      // 创建canvas元素
      const canvasEl = document.createElement("canvas")
      canvasEl.width = targetImageWidth
      canvasEl.height = targetImageHeight
      const ctx = canvasEl.getContext("2d")
      ctx.clearRect(0, 0, targetImageWidth, targetImageHeight)
      ctx.drawImage(imgObj, 0, 0, targetImageWidth, targetImageHeight)

      // 输出不同类型数据
      if (config.dataType === "blob") {
        canvasEl.toBlob((blob) => {
          resolve(blob)
        }, fileType, config.quality || 0.6)
      } else {
        const base64 = canvasEl.toDataURL(fileType, config.quality || 0.6)
        resolve(base64)
      }
    })

    reader.addEventListener("load", () => {
      if (reader.readyState === 2) {
        imgObj.src = reader.result
      }
    })

    reader.readAsDataURL(file)
  })
}

// 计算内存
function calcMemory(size, unit, targetUnit) {
  const rule = {
    b: 1,
    B: 8,
    KB: 8 * 1024,
    MB: 8 * 1024 * 1024,
    GB: 8 * 1024 * 1024 * 1024
  }
  const units = Object.keys(rule)
  // 错误处理
  if (!units.includes(targetUnit)) {
    throw new Error("TargetUnit Only 'b','B','KB','MB','GB' are supported.")
  }
  if (!units.includes(unit)) {
    throw new Error("Unit Only 'b','B','KB','MB','GB' are supported.")
  }
  const res = size * rule[unit] / rule[targetUnit]
  return res
}

function getMemoryInfo(size) {
  let index = 0
  const units = ["B", "KB", "MB", "GB"]

  while (size >= 1024) {
    size = calcMemory(size, units[index], units[++index])
  }
  const res = size.toFixed(2) + units[index]
  return res
}