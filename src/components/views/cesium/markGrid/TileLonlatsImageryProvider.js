import * as Cesium from 'cesium';
/**
    * An {@link ImageryProvider} that draws a box around every rendered tile in the tiling scheme, and draws
    * a label inside it indicating the X, Y, Level coordinates of the tile.  This is mostly useful for
    * debugging terrain and imagery rendering problems.
    *
    * @alias TileLonlatsImageryProvider
    * @constructor
    *
    * @param {Object} [options] Object with the following properties:
    * @param {TilingScheme} [options.tilingScheme=new GeographicTilingScheme()] The tiling scheme for which to draw tiles.
    * @param {Ellipsoid} [options.ellipsoid] The ellipsoid.  If the tilingScheme is specified,
    *                    this parameter is ignored and the tiling scheme's ellipsoid is used instead. If neither
    *                    parameter is specified, the WGS84 ellipsoid is used.
    * @param {Color} [options.color=Color.YELLOW] The color to draw the tile box and label.
    * @param {Number} [options.tileWidth=256] The width of the tile for level-of-detail selection purposes.
    * @param {Number} [options.tileHeight=256] The height of the tile for level-of-detail selection purposes.
    */

 var TileLonlatsImageryProvider = function TileLonlatsImageryProvider(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

    this._tilingScheme = Cesium.defined(options.tilingScheme) ? options.tilingScheme : new Cesium.GeographicTilingScheme({ ellipsoid: options.ellipsoid });
    this._color = Cesium.defaultValue(options.color, Cesium.Color.YELLOW);
    this._errorEvent = new Cesium.Event();
    this._tileWidth = Cesium.defaultValue(options.tileWidth, 256);
    this._tileHeight = Cesium.defaultValue(options.tileHeight, 256);
    this._readyPromise = Promise.resolve(true);
}

Object.defineProperties(TileLonlatsImageryProvider.prototype, {
    /**
     * Gets the proxy used by this provider.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Proxy}
     * @readonly
     */
    proxy : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets the width of each tile, in pixels. This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    tileWidth : {
        get : function() {
            return this._tileWidth;
        }
    },

    /**
     * Gets the height of each tile, in pixels.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    tileHeight: {
        get : function() {
            return this._tileHeight;
        }
    },

    /**
     * Gets the maximum level-of-detail that can be requested.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    maximumLevel : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets the minimum level-of-detail that can be requested.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    minimumLevel : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets the tiling scheme used by this provider.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {TilingScheme}
     * @readonly
     */
    tilingScheme : {
        get : function() {
            return this._tilingScheme;
        }
    },

    /**
     * Gets the rectangle, in radians, of the imagery provided by this instance.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Rectangle}
     * @readonly
     */
    rectangle : {
        get : function() {
            return this._tilingScheme.rectangle;
        }
    },

    /**
     * Gets the tile discard policy.  If not undefined, the discard policy is responsible
     * for filtering out "missing" tiles via its shouldDiscardImage function.  If this function
     * returns undefined, no tiles are filtered.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {TileDiscardPolicy}
     * @readonly
     */
    tileDiscardPolicy : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets an event that is raised when the imagery provider encounters an asynchronous error.  By subscribing
     * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
     * are passed an instance of {@link TileProviderError}.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Event}
     * @readonly
     */
    errorEvent : {
        get : function() {
            return this._errorEvent;
        }
    },

    /**
     * Gets a value indicating whether or not the provider is ready for use.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    ready : {
        get : function() {
            return true;
        }
    },

    /**
     * Gets a promise that resolves to true when the provider is ready for use.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Promise.<Boolean>}
     * @readonly
     */
    readyPromise : {
        get : function() {
            return this._readyPromise;
        }
    },

    /**
     * Gets the credit to display when this imagery provider is active.  Typically this is used to credit
     * the source of the imagery.  This function should not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Credit}
     * @readonly
     */
    credit : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets a value indicating whether or not the images provided by this imagery provider
     * include an alpha channel.  If this property is false, an alpha channel, if present, will
     * be ignored.  If this property is true, any images without an alpha channel will be treated
     * as if their alpha is 1.0 everywhere.  Setting this property to false reduces memory usage
     * and texture upload time.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    hasAlphaChannel : {
        get : function() {
            return true;
        }
    }
});

/**
 * Gets the credits to be displayed when a given tile is displayed.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level;
 * @returns {Credit[]} The credits to be displayed when the tile is displayed.
 *
 * @exception {DeveloperError} <code>getTileCredits</code> must not be called before the imagery provider is ready.
 */
TileLonlatsImageryProvider.prototype.getTileCredits = function (x, y, level) {
    return undefined;
};

/**
 * Requests the image for a given tile.  This function should
 * not be called before {@link TileLonlatsImageryProvider#ready} returns true.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @param {Request} [request] The request object. Intended for internal use only.
 * @returns {Promise.<Image|Canvas>|undefined} A promise for the image that will resolve when the image is available, or
 *          undefined if there are too many active requests to the server, and the request
 *          should be retried later.  The resolved image may be either an
 *          Image or a Canvas DOM object.
 */
TileLonlatsImageryProvider.prototype.requestImage = function (x, y, level, request) {
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

    return canvas;
};

/**
 * Picking features is not currently supported by this imagery provider, so this function simply returns
 * undefined.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @param {Number} longitude The longitude at which to pick features.
 * @param {Number} latitude  The latitude at which to pick features.
 * @return {Promise.<ImageryLayerFeatureInfo[]>|undefined} A promise for the picked features that will resolve when the asynchronous
 *                   picking completes.  The resolved value is an array of {@link ImageryLayerFeatureInfo}
 *                   instances.  The array may be empty if no features are found at the given location.
 *                   It may also be undefined if picking is not supported.
 */
TileLonlatsImageryProvider.prototype.pickFeatures = function (x, y, level, longitude, latitude) {
    return undefined;
};
// export default TileLonlatsImageryProvider;