/*
 * @Descripttion: 
 * @version: 
 * @Author: xiongz
 * @Date: 2022-05-12 11:31:46
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-16 12:43:07
 */
///
// 模块描述:房屋模型移动拆分
/// 
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/_base/fx",
    'jimu/BaseWidget',
], function (
    declare,
    lang,
    html,
    fx,
    BaseWidget
) {
    return declare("jimu.widget.ModelSplit", [BaseWidget], {
        baseClass: "jimu-widget-ModelSplit",
        name: 'ModelSplit',
        models: [],
        point: null,
        timers: [],
        floorCount: 6,
        floorScale: 1,
        floorHeight: 3, // 不缩放情况下楼层高度
        point: {
            lng: 115.91455928461914,
            lat: 28.665192693562243,
            height: 0
        },
        postCreate: function () {
            this.inherited(arguments);
 
        },
        destroy: function () {
 
            this.inherited(arguments);
        },
 
        startup: function () {
            this.inherited(arguments);
            topic.subscribe("runMap3DWidget", lang.hitch(this, function (name) {
                if (name == this.name) {
                    this.initModel();
                    $(`.${this.baseClass}`).show()
                }
            }));
            topic.subscribe("clearMap3DWidget", lang.hitch(this, function(name){
                if(name!=this.name){
                    this.clearAll()
                }
            }));
 
            let that = this;
            $('.floorWhole >button').on('click', function () {
                let index = $(this).index();
                // 全部展开
                if (index == 0) {
                    that.opeAll(4, 3000, 100)
                }
                // 全部合并
                else if (index == 1) {
                    that.unionAll(4, 3000, 100)
                }
                // 全部还原
                else if (index == 2) {
                    that.resetAll()
                }
            })
            $('.floorSingle >button').on('click', function () {
                let index = $(this).index();
                let maxHeight = that.point.height + (that.floorCount + 1) * that.floorScale
                // 楼层查看
                that.openFloorModel(maxHeight, index + 1)
            })
            $('.modelfile-th .xx').on('click',function(){
                that.clearAll();
            })
        },
        initModel:function(){
            let model = null;
            let floorCount = this.floorCount; // 房屋总楼层数，不含楼顶
            let floorScale = this.floorScale; // 房屋缩放比例，默认一般1
            let floorHeight = this.floorHeight; // 每层的高度
            let point = this.point;
            for (let i = 0; i <= floorCount; i++) {
                if (i < floorCount) {
                    // 底楼
                    let height = point.height + i * floorHeight * floorScale;
                    model = this.addModePrimitive({
                        position: [point.lng, point.lat, height],
                        url: './widgets/ModelSplit/data/floor.glb',
                        name: 'fw',
                        scale: floorScale
                    })
                    model.option = {
                        oriHeight: height,
                        scale: floorScale,
                        currentHeight:height
                    }
                    this.models.push(model)
                } else {
                    // 顶楼
                    let height = point.height + i * floorHeight * floorScale;
                    model = this.addModePrimitive({
                        position: [point.lng, point.lat, height],
                        url: './widgets/ModelSplit/data/top.glb',
                        name: 'fw',
                        scale: floorScale
                    })
                    model.option = {
                        oriHeight: height,
                        scale: floorScale,
                        currentHeight:height
                    }
                    this.models.push(model)
                }
            }
            window.viewer.camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(115.91326536913103, 28.66495725572756, 55.24826616710503,),
                orientation : {
                    heading : Cesium.Math.toRadians(78.06653423571397),
                    pitch : Cesium.Math.toRadians(-15.156766587402164),
                    roll : 0
                }
            });
        },
        clearAll:function(){
            if(this.models.length>0){
                this.models.forEach(m=>{
                    window.viewer.scene.primitives.remove(m)
                })
            }
            $('.jimu-widget-ModelSplit').hide()
        },
        opeAll: function (height, time = 4000, interval = 100) {
            this.resetAll();
            let point = this.point; //楼栋位置
            this.clearFloorTimers()
            for (let i = 0; i < this.models.length; i++) {
                let model = this.models[i]
                let changeRate = Number((i * height * model.option.scale)) * (interval / time)
                // let alt = i * height * model.option.scale + model.option.oriHeight;
                if (i != 0) {
                    // model.position = new Cesium.CallbackProperty(function () {
                    //     let height = model.option.oriHeight + (i * height * model.option.scale) / time
                    //     if (height < alt) {
                    //         return Cesium.Cartesian3(model.position[0], model.position[1], height)
                    //     } else {
                    //         return Cesium.Cartesian3(model.position[0], model.position[1], alt)
                    //     }
                    // }, false)
                    let count = 1;
                    let timer = setInterval(function () {
                        let add = model.option.oriHeight + changeRate * (count++)
                        var origin = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, add);
                        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                        model.modelMatrix = modelMatrix;
                        if (count >= (time / interval)) {
                            model.option.currentHeight=add;
                            clearInterval(timer)
                            timer = null;
                        }
                        // console.log(count)
                    }, interval)
                    this.timers.push(timer)
                }
            }
        },
        unionAll: function (height, time = 4000, interval = 100) {
            let point = this.point; //楼栋位置
            this.clearFloorTimers()
            for (let i = 0; i < this.models.length; i++) {
                let model = this.models[i];
                // 如果是初始位置，代表已经为合并状态。
                if(model.option.currentHeight==model.option.oriHeight){
                    continue;
                }
                let currentHeight = model.option.oriHeight + (i * height * model.option.scale);
                let changeRate = Number((i * height * model.option.scale)) * (interval / time)
                model.show = true;
                let count = 1;
                let timer = setInterval(function () {
                    let add = currentHeight - changeRate * (count++)
                    var origin = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, add);
                    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                    model.modelMatrix = modelMatrix;
                    if (count >= (time / interval)) {
                        var origin = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, model.option.oriHeight);
                        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                        model.modelMatrix = modelMatrix;
                        model.option.currentHeight=model.option.oriHeight
                        clearInterval(timer)
                    }
                }, interval)
                this.timers.push(timer)
            }
        },
        resetAll: function () {
            this.clearFloorTimers()
            let point = this.point; //楼栋位置
            for (let i = 0; i < this.models.length; i++) {
                let model = this.models[i];
                var origin = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, model.option.oriHeight);
                var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                model.option.currentHeight=model.option.oriHeight
                model.modelMatrix = modelMatrix;
                model.show = true;
            }
        },
        /**
         * 显示指定楼层
         *
         * @param {Number} maxHeight 指定从顶部落下的高度
         * @param {Number} floorNum 指定显示的楼层，第1层开始
         * @param {Number} [time=1000] 楼层下落需要时间,单位:毫秒
         * @param {Number} [interval=100] 楼层下落触发间隔时间,单位:毫秒
         * @return {void}  无
         */
        openFloorModel: function (maxHeight = 120, floorNum, time = 1000, interval = 100) {
            this.clearFloorTimers();
            floorNum--;
            let point = this.point; //楼栋位置
            for (let i = floorNum; i < this.models.length; i++) {
                let model = this.models[i];
                var origin = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, model.option.oriHeight + maxHeight);
                var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                model.modelMatrix = modelMatrix;
                model.show = false;
                model.option.currentHeight=model.option.oriHeight + maxHeight
            }
            for (let j = 0; j <= floorNum; j++) {
                let model = this.models[j];
                 // 如果是初始位置，代表已经为合并状态。
                 model.show = true;
                 if(model.option.currentHeight==model.option.oriHeight&&j!=floorNum){
                    continue;
                }
                
                let currentHeight = model.option.oriHeight + maxHeight;
                let changeRate = maxHeight * (interval / time)
                let count = 1;
                let timer = setInterval(function () {
                    let add = currentHeight - changeRate * (count++)
                    var origin = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, add);
                    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                    model.modelMatrix = modelMatrix;
                    if (count >= (time / interval)) {
                        var origin = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, model.option.oriHeight);
                        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
                        model.modelMatrix = modelMatrix;
                        model.option.currentHeight=model.option.oriHeight
                        clearInterval(timer)
                    }
                }, interval)
                this.timers.push(timer)
            }
 
        },
        clearFloorTimers: function () {
            if (this.timers.length > 0) {
                this.timers.forEach(t => {
                    if (t) {
                        clearInterval(t)
                    }
                })
            }
            this.timers = [];
        },
        // 3d模型
        addModePrimitive: function (option) {
            var origin = Cesium.Cartesian3.fromDegrees(option.position[0], option.position[1], option.position[2]);
            var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
            var modelPrimitive = null;
            modelPrimitive = window.viewer.scene.primitives.add(Cesium.Model.fromGltf({
                url: option.url,
                modelMatrix: modelMatrix,
                show: true, // default
                scale: option.scale || 1, // double size
                // minimumPixelSize : 128,          // never smaller than 128 pixels
                maximumScale: 20000, // never larger than 20000 * model size (overrides minimumPixelSize)
                allowPicking: true,
                // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                scene: viewer.scene
            }));
            modelPrimitive.name = option.name;
            modelPrimitive.type = "model"
            if (option.rotationz) {
                var mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(option.rotationz));
                var rotationz = Cesium.Matrix4.fromRotationTranslation(mz);
                //旋转、平移矩阵相乘
                Cesium.Matrix4.multiply(modelMatrix, rotationz, modelMatrix);
                modelPrimitive.modelMatrix = modelMatrix
            }
 
 
            modelPrimitive.readyPromise.then(function (model) {
                // Play all animations when the model is ready to render
                model.activeAnimations.addAll({
                    speedup: 0.5,
                    loop: Cesium.ModelAnimationLoop.REPEAT
                });
            });
            return modelPrimitive;
        }
    });
});