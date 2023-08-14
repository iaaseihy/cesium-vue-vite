class ImageryTheme {
    constructor(options) {
      this.params = options;
    }
    //背景混合
    _drawBg(image) {
      const width = image.width,
        height = image.height;
      var cv = document.createElement("canvas");
      cv.width = width;
      cv.height = height;
      var ctx = cv.getContext("2d");
      ctx.fillStyle = this.params.bgColor;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0);
      return cv;
    }
    //处理瓦片图像
    processImage(image, layer) {
      const { width, height } = image;
      //新图像
      var cv = document.createElement("canvas");
      cv.width = width;
      cv.height = height;
      var ctx = cv.getContext("2d");
      //将原始图像绘制到新图像中，这是因为输入的图像可能是Image、Canvas或者ImageBitmap
      ctx.drawImage(image, 0, 0, width, height);
      //读取图像颜色
      const imgData = ctx.getImageData(0, 0, width, height),
        params = this.params,
        bgColor = params.bgColor,
        alpha = params.alpha;
      //扫描，对每个像素进行加工处理
      for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i],
          g = imgData.data[i + 1],
          b = imgData.data[i + 2],
          a = imgData.data[i + 3];
        //计算灰度
        var grayVal = (r + g + b) / 3;
        //灰度反转
        if (params.invert) {
          grayVal = 255 - grayVal;
        }
        //将灰度替换掉原始的颜色
        imgData.data[i] = grayVal;
        imgData.data[i + 1] = grayVal;
        imgData.data[i + 2] = grayVal;
        //设置一个前景透明度，以便和背景混合
        imgData.data[i + 3] = a * alpha;
      }
      //将处理后的像素写入新图像
      ctx.putImageData(imgData, 0, 0);
  
      if (bgColor && alpha > 0) {
        //与背景混合，并返回新图像
        return this._drawBg(cv);
      } else {
        //直接返回新图像
        return cv;
      }
    }
  }

export default ImageryTheme;