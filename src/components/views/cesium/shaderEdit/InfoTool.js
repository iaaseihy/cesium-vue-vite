// InfoTool.js

// ====================
// 引入模块
// ====================
// import Viewer from "cesium/Source/Widgets/Viewer/Viewer.js";
// import CesiumMath from "cesium/Source/Core/Math.js";
// import Cesium3DTileFeature from "cesium/Source/Scene/Cesium3DTileFeature.js";
// import Cartesian2 from "cesium/Source/Core/Cartesian2.js";
// import Cartesian3 from "cesium/Source/Core/Cartesian3.js";
// import Cartographic from "cesium/Source/Core/Cartographic.js";
// import SceneTransforms from "cesium/Source/Scene/SceneTransforms.js";
// import defined from "cesium/Source/Core/defined.js";
import { Viewer, Math, Cesium3DTileFeature, Cartesian2, Cartesian3, Cartographic, SceneTransforms, defined } from 'cesium';
import './info.css';
import * as util from './util.js'
// ====================
// 类
// ====================
/**
 * 信息工具。
 *
 * @author Helsing
 * @date 2019/12/22
 * @alias InfoTool
 * @constructor
 * @param {Viewer} viewer Cesium视窗。
 */
class InfoTool {
    /**
     * 创建一个动态实体弹窗。
     *
     * @param {Viewer} viewer Cesium视窗。
     * @param {Number} options 选项。
     * @param {Cartesian3} options.position 弹出位置。
     * @param {HTMLElement} options.element 弹出窗元素容器。
     * @param {Function} callback 回调函数。
     * @ignore
     */
    static #createInfoTool(viewer, options, callback = undefined) {
        const cartographic = Cartographic.fromCartesian(options.position);
        const lon = Math.toDegrees(cartographic.longitude); //.toFixed(5);
        const lat = Math.toDegrees(cartographic.latitude); //.toFixed(5);

        // 注意，这里不能使用hide()或者display，会导致元素一直重绘。
        util.setCss(options.element, "opacity", "0");
        util.setCss(options.element.querySelector("div:nth-child(1)"), "height", "0");
        util.setCss(options.element.querySelector("div:nth-child(2)"), "opacity", "0");
        util.setCss(options.element.querySelector("div:nth-child(3)"), "top", "100");

        // 回调
        callback();

        // 添加div弹窗
        setTimeout(function () {
            InfoTool.#popup(viewer, options.element, lon, lat, cartographic.height)
        }, 100);
    }
    /**
     * 弹出HTML元素弹窗。
     *
     * @param {Viewer} viewer Cesium视窗。
     * @param {Element|HTMLElement} element 弹窗元素。
     * @param {Number} lon 经度。
     * @param {Number} lat 纬度。
     * @param {Number} height 高度。
     * @ignore
     */
    static #popup(viewer, element, lon, lat, height) {
        setTimeout(function () {
            // 设置元素效果
            util.setCss(element, "opacity", "1");
            util.setCss(element.querySelector("div:nth-child(1)"), "transition", "ease 1s");
            util.setCss(element.querySelector("div:nth-child(3)"), "transition", "ease 1s");
            util.setCss(element.querySelector("div:nth-child(2)"), "transition", "opacity 1s");
            util.setCss(element.querySelector("div:nth-child(3)"), "transition", "opacity 1s");
            util.setCss(element.querySelector("div:nth-child(1)"), "height", "80px");
            util.setCss(element.querySelector("div:nth-child(2)"), "pointer-events", "auto");
            window.setTimeout(function () {
                util.setCss(element.querySelector("div:nth-child(2)"), "opacity", "1");
                util.setCss(element.querySelector("div:nth-child(3)"), "opacity", "1");
            }, 500);
        }, 100);
        const divPosition = Cartesian3.fromDegrees(lon, lat, height);
        // InfoTool.#hookToGlobe(viewer, element, divPosition, [10, -(parseInt(util.setCss(element, "height")))], true);
        InfoTool.#hookToGlobe(viewer, element, divPosition, [170, -240], true);
        viewer.scene.requestRender();
    }
    /**
     * 将HTML弹窗挂接到地球上。
     *
     * @param {Viewer} viewer Cesium视窗。
     * @param {Element} element 弹窗元素。
     * @param {Cartesian3} position 地图坐标点。
     * @param {Array} offset 偏移。
     * @param {Boolean} hideOnBehindGlobe 当元素在地球背面会自动隐藏，以减轻判断计算压力。
     * @ignore
     */
    static #hookToGlobe(viewer, element, position, offset, hideOnBehindGlobe) {
        const scene = viewer.scene, camera = viewer.camera;
        const cartesian2 = new Cartesian2();
        scene.preRender.addEventListener(function () {
            const canvasPosition = scene.cartesianToCanvasCoordinates(position, cartesian2); // 笛卡尔坐标到画布坐标
            if (defined(canvasPosition)) {
                util.setCss(element, "left", parseInt(canvasPosition.x + offset[0]) + "px");
                util.setCss(element, "top", parseInt(canvasPosition.y + offset[1]) + "px");
                util.setCss(element, "z-index", parseInt(100));



                // 是否在地球背面隐藏
                if (hideOnBehindGlobe) {
                    const cameraPosition = camera.position;
                    let height = scene.globe.ellipsoid.cartesianToCartographic(cameraPosition).height;
                    height += scene.globe.ellipsoid.maximumRadius;
                    if (!(Cartesian3.distance(cameraPosition, position) > height)) {
                        util.setCss(element, "display", "flex");
                    } else {
                        util.setCss(element, "display", "none");
                    }
                }
            }
        });
    }

    #element;
    viewer;

    constructor(viewer) {
        this.viewer = viewer;

        // 在Cesium容器中添加元素
        this.#element = document.createElement("div");
        this.#element.id = "infoTool_" + util.getGuid(true);
        this.#element.name = "infoTool";
        this.#element.classList.add("helsing-three-plugins-infotool");
        this.#element.appendChild(document.createElement("div"));
        this.#element.appendChild(document.createElement("div"));
        this.#element.appendChild(document.createElement("div"));
        viewer.container.appendChild(this.#element);



    }

    /**
     * 添加。
     *
     * @author Helsing
     * @date 2019/12/22
     * @param {Object} options 选项。
     * @param {Element} options.element 弹窗元素。
     * @param {Cartesian2|Cartesian3} options.position 点击位置。
     * @param {Cesium3DTileFeature} [options.inputFeature] 模型要素。
     * @param {String} options.type 类型（默认值为default，即任意点击模式；如果设置为info，即信息模式，只有点击Feature才会响应）。
     * @param {String} options.content 内容（只有类型为default时才起作用）。
     * @param {Function} callback 回调函数。
     */
    add(options, callback = undefined) {
        // 判断参数为空返回
        if (!options) {
            return;
        }
        // 点
        let position, cartesian2d, cartesian3d, inputFeature;
        if (options instanceof Cesium3DTileFeature) {
            inputFeature = options;
            // options = {};
        } else {
            if (options instanceof Cartesian2 || options instanceof Cartesian3) {
                position = options;
                options = {};
            } else {
                position = options.position;
                inputFeature = options.inputFeature;
            }
            // 判断点位为空返回
            if (!position) {
                return;
            }
            if (position instanceof Cartesian2) { // 二维转三维
                // 如果支持拾取模型则取模型值
                cartesian3d = (this.viewer.scene.pickPositionSupported && defined(this.viewer.scene.pick(options.position))) ?
                    this.viewer.scene.pickPosition(position) : this.viewer.camera.pickEllipsoid(position, this.viewer.scene.globe.ellipsoid);
                cartesian2d = position;
            } else {
                cartesian3d = position;
                cartesian2d = SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartesian3d);
            }
            // 判断点位为空返回
            if (!cartesian3d) {
                return;
            }
        }

        const that = this;

        // 1.组织信息
        let info = '';
        if (options.type === "info") {
            // 拾取要素
            const feature = inputFeature || this.viewer.scene.pick(cartesian2d);
            // 判断拾取要素为空返回
            if (!defined(feature)) {
                this.remove();
                return;
            }

            if (feature instanceof Cesium3DTileFeature) { // 3dtiles
                let propertyNames = feature.getPropertyNames();
                let length = propertyNames.length;
                for (let i = 0; i < length; ++i) {
                    let propertyName = propertyNames[i];
                    info += '"' + (propertyName + '": "' + feature.getProperty(propertyName)) + '",\n';
                }
            } else if (feature.id) { // Entity
                const properties = feature.id.properties;
                if (properties) {
                    let propertyNames = properties._propertyNames;
                    let length = propertyNames.length;
                    for (let i = 0; i < length; ++i) {
                        let propertyName = propertyNames[i];
                        //console.log(propertyName + ': ' + properties[propertyName]._value);
                        info += '"' + (propertyName + '": "' + properties[propertyName]._value) + '",\n';
                    }
                }
            }
        } else {
            // options.content && (info = options.content);
            // options.content && (info = options.pos);
            let content = options.content;
            let featuresLength = content.featuresLength;
            console.log("要素数量为：");
            console.log(featuresLength);
            console.log("第一个要素属性为：");
            let feature = content.getFeature(0).getProperty("name");
            console.log(feature);
            if (feature) {
                info = feature;
            } else {
                info = options.pos
            }
        }

        // 2.生成特效
        // 添加之前先移除
        this.remove();

        if (!info) {
            return;
        }

        // options.position = cartesian3d;
        // options.position = Cartesian3.fromDegrees(108.957, 34.226, 386.4178);
        if (cartesian3d === null || cartesian3d === undefined) {
            options.position = options.pos;
        } else {
            options.position = cartesian3d;
        }
        console.log(options.position);
        options.element = options.element || this.#element;

        InfoTool.#createInfoTool(this.viewer, options, function () {
            util.setInnerText(that.#element.querySelector("div:nth-child(2)"), info);
            util.setInnerText(that.#element.querySelector("div:nth-child(3)"), 'X');
            typeof callback === "function" && callback();
        });
    }

    /**
     * 移除。
     *
     * @author Helsing
     * @date 2020/1/18
     */
    remove(entityId = undefined) {
        util.setCss(this.#element, "opacity", "0");
        util.setCss(this.#element.querySelector("div:nth-child(1)"), "transition", "");
        util.setCss(this.#element.querySelector("div:nth-child(2)"), "transition", "");
        util.setCss(this.#element.querySelector("div:nth-child(3)"), "transition", "");
        util.setCss(this.#element.querySelector("div:nth-child(1)"), "height", "0");
        util.setCss(this.#element.querySelector("div:nth-child(2)"), "pointer-events", "none");
    };

    removeElement(entityId = undefined) {
        util.setCss(this.#element, "opacity", "0");
        util.setCss(this.#element.querySelector("div:nth-child(1)"), "transition", "");
        util.setCss(this.#element.querySelector("div:nth-child(2)"), "transition", "");
        util.setCss(this.#element.querySelector("div:nth-child(3)"), "transition", "");
        util.setCss(this.#element.querySelector("div:nth-child(1)"), "height", "0");
        util.setCss(this.#element.querySelector("div:nth-child(2)"), "pointer-events", "none");
        let element = document.getElementsByClassName('helsing-three-plugins-infotool');
        if (element) {
            this.#element.classList.remove("helsing-three-plugins-infotool");
        }
    };
}

export default InfoTool;