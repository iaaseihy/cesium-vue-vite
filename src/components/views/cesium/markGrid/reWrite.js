import * as Cesium from 'cesium';
export default class CustomImageryProvider extends Cesium.ImageryProvider {
    constructor() {
        super();
        // options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        this._tilingScheme = new Cesium.GeographicTilingScheme();
        // this._color = Cesium.defaultValue(options.color, Cesium.Color.YELLOW);
        this._color = new Cesium.Color.YELLOW
        this._errorEvent = new Cesium.Event();
        // this._tileWidth = Cesium.defaultValue(options.tileWidth, 256);
        // this._tileHeight = Cesium.defaultValue(options.tileHeight, 256);
        this._tileWidth = 256;
        this._tileHeight = 256;
        this._readyPromise = Promise.resolve(true);
    }
    // 在这里添加你提供的其他方法和属性
    get proxy() {
        return undefined;
    }

    get tileWidth() {
        return this._tileWidth;
    }

    get tileHeight() {
        return this._tileHeight;
    }

    get maximumLevel() {
        return undefined;
    }

    get minimumLevel() {
        return undefined;
    }

    get tilingScheme() {
        return this._tilingScheme;
    }

    get rectangle() {
        return this._tilingScheme.rectangle;
    }

    get tileDiscardPolicy() {
        return undefined;
    }

    get errorEvent() {
        return this._errorEvent;
    }

    get ready() {
        return true;
    }

    get readyPromise() {
        return this._readyPromise;
    }

    get credit() {
        return undefined;
    }

    get hasAlphaChannel() {
        return true;
    }
    requestImage(x, y, level) {
        // 在这里写你的自定义逻辑
        var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var context = canvas.getContext('2d');
    var cssColor = this._color.toCssColorString();
    context.strokeStyle = cssColor;
    context.lineWidth = 2;
    context.strokeRect(1, 1, 255, 255);
    /*
    可以使用GeographicTilingScheme的tileXYToNativeRectangle接口获取对应关系，不需要自己算！
    */
    var interval = 180.0 / Math.pow(2, level);
    var lon = (x + 0.5) * interval-180;
    var lat = 90 - (y + 0.5) * interval;
    //var label = 'L-' + level + 'X-' + x + 'Y-' + y;
    var labelLevel = '';
    var labelLon = '';
    var labelLat = '';
    if (lon > 0) {
        if (lat > 0) {
            //label = 'L' + level + 'E' + lon + 'N' + lat;
            labelLevel = 'L' + level;
            labelLon = 'E' + lon;
            labelLat = 'N' + lat;
        } else {
            //label = 'L' + level + 'E' + lon + 'S' + (-lat);
            labelLevel = 'L' + level;
            labelLon = 'E' + lon;
            labelLat = 'S' + (-lat);
        }
    } else {
        if (lat > 0) {
            //label = 'L' + level + 'W' + (-lon) + 'N' + lat;
            labelLevel = 'L' + level;
            labelLon = 'W' + (-lon);
            labelLat = 'N' + lat;
        } else {
            //label = 'L' + level + 'W' + (-lon) + 'S' + (-lat);
            labelLevel = 'L' + level;
            labelLon = 'W' + (-lon);
            labelLat = 'S' + (-lat);
        }
    }
    context.textAlign = 'center';
    context.fillStyle = cssColor;
    if (level > 10) {
        context.font = 'bold 16px Arial';
        context.fillText(labelLevel, 124, 100);
        context.fillText(labelLon, 124, 124);
        context.fillText(labelLat, 124, 148);
    } else {
        context.font = 'bold 25px Arial';
        context.fillText(labelLevel, 124, 94);
        context.fillText(labelLon, 124, 124);
        context.fillText(labelLat, 124, 154);
    }  
    //context.textAlign = 'center';
    //context.fillStyle = 'black';//绘制阴影效果
    //context.fillText(label, 127, 127);
    //context.fillStyle = cssColor;
    //context.fillText(label, 124, 24);

    return Promise.resolve(canvas);
        // 然后调用父类的requestImage方法
        // return super.requestImage(x, y, level);
    };
    getTileCredits(x, y, level) {
        
        return undefined;
        // return super.getTileCredits(x, y, level);
    };
    pickFeatures(x, y, level, longitude, latitude) {
        return undefined;
        // return super.pickFeatures(x, y, level, longitude, latitude);
    };
}