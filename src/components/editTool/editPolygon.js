/**

 * 多边形自定义编辑类

 * author zk

 * date 2022-12-13

 */
 import * as Cesium from "cesium";

class EditPolygon {

    constructor(viewer, options) {

        this.viewer = viewer;

        // this.handler = new Cesium.ScreenSpaceEventHandler(xtdearth.czm.viewer.scene.canvas);

        this.options = options || {

            polygonColor: "#30dd1042", //编辑面颜色rgba

            pointColor: "#ff0000ee", //正式点面颜色rgba

            pointSize: 10, //正式点大小

            tmpPointColor: "#ffff0088", //临时点面颜色rgba

            tmpPointSize: 7, //临时点大小,

        };

        this.currentEntity = null;

        this.editCurrentEntity = null;

        this.isedit = false;

        this.editPolygons = null;

        this.editPoint = null;

        this.positions = null;

        this.editPointIndex = [];

    }

    /**

     *  启动编辑功能

     *  currentEntity 当前编辑的entity面对象 callback 回调返回数据

     * ************************/

    startEditEntity(currentEntity, callback) {

        var that = this;

        that.handler = new Cesium.ScreenSpaceEventHandler(that.viewer.scene.canvas);

        // that.viewer = xtdearth.czm.viewer

        that.editCurrentEntity = currentEntity;

        that.editCurrentEntity.show = false;

        that.positions = that.editCurrentEntity.polyline.positions._value;

        that.cleanEntityCollection("editTbEntityCollection");

        let entityCollection = new Cesium.CustomDataSource(

            "editTbEntityCollection"

        );

        entityCollection.key = that.editCurrentEntity.id;

        entityCollection.label = "图斑编辑";

        entityCollection.show = true;

        that.viewer.dataSources.add(entityCollection);

        //添加编辑点

        that.addPointByData(that.positions);

        //添加临时中点

        that.addTmpPoint(that.positions);

        var options = {

            id: "edit-tb-polygon",

            name: "edit-tb-polygon",

            polyline: {

                width: 10,

                positions: [],

                material: Cesium.Color.fromCssColorString(that.options.polygonColor),

                clampToGround: true

            },

        };

        options.polyline.positions = new Cesium.CallbackProperty(function () {

            return that.positions;

        }, false);

        entityCollection.entities.add(new Cesium.Entity(options));




        //操作事件监听

        that.handler.setInputAction((movement) => {

            var picks = that.viewer.scene.drillPick(movement.position);

            if (picks.length > 0) {

                var pick = picks[0];

                var entity = pick.id;

                //点击原有点

                if (entity.id.indexOf("edit-tb-point-") !== -1) {

                    that.editPointIndex = [];

                    var strs = entity.id.split("-");

                    if (strs.length == 5) {

                        that.editPointIndex.push(Number(strs[4]));

                    } else if (strs.length == 7) {

                        that.editPointIndex.push(Number(strs[4]));

                        that.editPointIndex.push(Number(strs[6]));

                    }

                    that.editPolygons = that.getEditTbItemById("edit-tb-polygon");

                    that.editPoint = entity;

                    that.isedit = true;

                }

                // 点击临时点

                if (entity.name.indexOf("edit-tb-tmp-point-") !== -1) {

                    that.editPointIndex = [];

                    var pindex = Number(entity.description._value);

                    pindex = pindex + 1;

                    that.editPointIndex.push(pindex);

                    that.positions.splice(pindex, 0, entity.position._value);

                    that.addPointByData(that.positions);

                    that.addTmpPoint(that.positions);

                    that.editPolygons = that.getEditTbItemById("edit-tb-polygon");

                    var tmp = that.viewer.dataSources.getByName(

                        "editTbPointEntityCollection"

                    )[0];

                    that.editPoint = tmp.entities.values[pindex];

                    that.isedit = true;

                }

                that.viewer.scene.screenSpaceCameraController.enableInputs = false;

            }

        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        //移动

        that.handler.setInputAction(function (movement) {

            if (that.isedit) {

                const ray = that.viewer.camera.getPickRay(movement.endPosition);

                var cartesian = that.viewer.scene.globe.pick(ray, that.viewer.scene);

                that.editPoint.position = cartesian;

                if ((that.editPointIndex.length = 1)) {



                    that.positions[that.editPointIndex[0]] = cartesian;

                    that.addTmpPoint(that.positions);

                }

            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        //右击取消 固定位置

        that.handler.setInputAction(function () {

            that.isedit = false;

            that.viewer.scene.screenSpaceCameraController.enableInputs = true;

        }, Cesium.ScreenSpaceEventType.LEFT_UP);




        that.handler.setInputAction(function (e) {

            let pick = that.viewer.scene.pick(e.position);

            if (!Cesium.defined(pick) && pick == undefined) {

                if (callback) {

                    callback(that.editExit())

                }

            }

        }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

    }







    //添加编辑点

    addPointByData(activeShapePoints1) {

        var that = this;

        this.cleanEntityCollection("editTbPointEntityCollection");

        let entityCollection = new Cesium.CustomDataSource(

            "editTbPointEntityCollection"

        );

        that.viewer.dataSources.add(entityCollection);

        for (let i = 0; i < activeShapePoints1.length; i++) {

            var entry = new Cesium.Entity({

                id: "edit-tb-point-position-" + i,

                name: "edit-tb-point-position-" + i,

                position: activeShapePoints1[i],

                point: {

                    show: true,

                    color: Cesium.Color.RED.withAlpha(1),

                    pixelSize: that.options.pointSize,

                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND

                },

                description: i,

            });

            entityCollection.entities.add(entry);

        }

    }

    //添加临时编辑点

    addTmpPoint(activeShapePoints1) {

        var that = this;

        var activeShapePoints = activeShapePoints1.slice(

            0,

            activeShapePoints1.length

        );

        this.cleanEntityCollection("editTbMidEntityCollection");

        let entityCollection = new Cesium.CustomDataSource(

            "editTbMidEntityCollection"

        );

        that.viewer.dataSources.add(entityCollection);

        var midposition;

        for (let i = 0; i < activeShapePoints.length; i++) {

            if (i + 1 === activeShapePoints.length) {

            } else {

                midposition = Cesium.Cartesian3.midpoint(

                    activeShapePoints[i],

                    activeShapePoints[i + 1],

                    new Cesium.Cartesian3()

                );

                var entry1 = new Cesium.Entity({

                    name: "edit-tb-tmp-point-position-" + i,

                    position: midposition,

                    point: {

                        show: true,

                        pixelSize: 10,

                        color: Cesium.Color.YELLOW.withAlpha(1),

                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND

                    },



                    description: i,

                });

                entityCollection.entities.add(entry1);

            }

        }

    }

    //获取编辑点

    getEditTbItemById(id) {

        var that = this;

        var ent = null;

        var tmp = that.viewer.dataSources.getByName("editTbEntityCollection");

        if (tmp.length > 0) {

            tmp.map((res) => {

                var entities = res.entities.values;

                entities.map((re) => {

                    if (re.id == id) {

                        ent = re;

                    }

                });

            });

        }

        return ent;

    }

    /********************  退出编辑功能  ************************/

    editExit() {

        var that = this;

        that.cleanEntityCollection("editTbEntityCollection");

        that.cleanEntityCollection("editTbMidEntityCollection");

        that.cleanEntityCollection("editTbPointEntityCollection");

        that.editCurrentEntity.show = true;

        var positions = that.positions;

        that.editCurrentEntity.polyline.positions = JSON.parse(

            JSON.stringify(positions)

        );

        that.editPolygons = null; //关闭操作事件

        if (that.handler != null) {

            that.handler.destroy();

        }

        //数据整理

        var tempPoints = "";

        var geom = "";

        positions.map((rr) => {

            var cartographic = Cesium.Cartographic.fromCartesian(rr);

            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);

            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);

            geom += longitudeString + "," + latitudeString + ",";

        });

        geom = geom.slice(0, geom.length - 1);

        if (positions.length > 0) {

            positions.map((res) => {

                res.positions.map((rr) => {

                    var cartographic = Cesium.Cartographic.fromCartesian(rr);

                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);

                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);

                    geom += longitudeString + "," + latitudeString + ",";

                });

                geom = geom.slice(0, geom.length - 1);

            });

        }

        tempPoints = { data: geom.split(','), type: 2 }

        //保存数据

        return tempPoints;

    }

    /** 清理资源 */

    cleanEntityCollection(key) {

        var that = this;

        var tmp = that.viewer.dataSources.getByName(key);

        if (tmp.length > 0) {

            tmp.map((res) => {

                that.viewer.dataSources.remove(res);

            });

        }

    }

}

export default EditPolygon