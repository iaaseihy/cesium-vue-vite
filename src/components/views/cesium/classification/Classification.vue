<template>
  <div>
    <div id="cesiumDemo"></div>
    <!-- 楼栋信息弹框 -->
    <transition name="el-fade-in-linear">
      <div class="buildMessageBox messageBox" v-show="buildMessageBoxShow">
        <div class="topLine"></div>
        <div class="slantLine"></div>
        <div class="title">
          <span class="messageBoxTit">A6栋</span>
        </div>
        <div class="contList">
          <span class="messageBoxTit">电耗：</span
          ><span class="messageVal">25410kw-h</span>
        </div>
        <div class="contList">
          <span class="messageBoxTit">水耗：</span
          ><span class="messageVal">1149m³</span>
        </div>
        <div class="contList">
          <span class="messageBoxTit">已入住人口：</span
          ><span class="messageVal">56人</span>
        </div>
      </div>
    </transition>
  </div>
</template>
   
  <script>
import * as Cesium from "cesium";
let viewer;
let tilesModelObj;
let tilesFloodTest;
export default {
  name: "tilesMonomer",
  data() {
    return {
      buildMessageBoxShow: false,
      mapMouseDown: false,
      // 分层单体化反选数据
      layered: {
        first: {
          priipt1: 0,
          priipt2: 0,
          priipt3: 0,
          priipt4: 0,
          priipt5: 7,
          priipt6: 18.7,
          priipt7: 65,
          priipt8: 50,
          priipt9: 4,
          color: "#D22809",
        },
        second: {
          priipt1: 0,
          priipt2: 0,
          priipt3: 0,
          priipt4: 0,
          priipt5: 7,
          priipt6: 23,
          priipt7: 65,
          priipt8: 50,
          priipt9: 4,
          color: "#2932E1",
        },
        third: {
          priipt1: 0,
          priipt2: 0,
          priipt3: 0,
          priipt4: 0,
          priipt5: 7,
          priipt6: 27.3,
          priipt7: 65,
          priipt8: 50,
          priipt9: 4,
          color: "#40C057",
        },
        four: {
          priipt1: 0,
          priipt2: 0,
          priipt3: 0,
          priipt4: 0,
          priipt5: 7,
          priipt6: 31.7,
          priipt7: 65,
          priipt8: 50,
          priipt9: 4,
          color: "#FF6600",
        },
      },
      // 分层楼栋实体数据
      cylinders: {
        first: {
          cylinder1: 18.7,
          id: "first",
        },
        second: {
          cylinder1: 23,
          id: "second",
        },
        third: {
          cylinder1: 27.3,
          id: "third",
        },
        four: {
          cylinder1: 31.7,
          id: "four",
        },
      },
    };
  },
  created() {},
  mounted() {
    this.getCesiumDem();
  },
  destroyed() {},
  methods: {
    // 保利倾斜摄影
    set3Dtitle2() {
      let translation = Cesium.Cartesian3.fromArray([0, 0, -170]);
      let m = Cesium.Matrix4.fromTranslation(translation);
      let tileset2 = new Cesium.Cesium3DTileset({
        // url: 'http://127.0.0.1/data/3dtiles/b3dm/tileset.json',
        url: "http://localhost:6060/Data/Source/3DTiles/保利b3dm/tileset.json",
        modelMatrix: m,
        maximumScreenSpaceError: 64, // 默认16
      });
      viewer.scene.primitives.add(tileset2);
    },
    // 分层单体化
    layeredTilesModel(data) {
      let scene = viewer.scene;
      if (tilesFloodTest) {
        viewer.scene.primitives.remove(tilesFloodTest);
        // tilesFloodTest.destroy()
      }
      var center = new Cesium.Cartesian3(
        -2306846.095427444,
        5418737.767193025,
        2440539.2209737385
      );
      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
      var hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(
          Number(this.layered[data].priipt1),
          Number(this.layered[data].priipt2),
          Number(this.layered[data].priipt3)
        )
      );
      var hpr = Cesium.Matrix4.fromRotationTranslation(
        hprRotation,
        new Cesium.Cartesian3(
          Number(this.layered[data].priipt4),
          Number(this.layered[data].priipt5),
          Number(this.layered[data].priipt6)
        )
      );
      Cesium.Matrix4.multiply(modelMatrix, hpr, modelMatrix);

      tilesFloodTest = scene.primitives.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: Cesium.BoxGeometry.fromDimensions({
              vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
              dimensions: new Cesium.Cartesian3(
                Number(this.layered[data].priipt7),
                Number(this.layered[data].priipt8),
                Number(this.layered[data].priipt9)
              ),
            }),
            modelMatrix: modelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString(
                  this.layered[data].color
                ).withAlpha(0.5)
              ),
              show: new Cesium.ShowGeometryInstanceAttribute(true),
            },
            id: "volume 1",
          }),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        })
      );
    },
    // 楼栋单体化
    tilesModel() {
      let scene = viewer.scene;
      // 世界坐标 非经纬度
      var center = new Cesium.Cartesian3(
        -2306928.4726084634,
        5418717.874638036,
        2440505.7478268957
      );
      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
      // 第一个参数是y轴偏移角度，第二个参数是x轴偏移角度，第三个参数是z轴偏移角度
      var hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(0.4, 0, 0)
      );
      // 第一个参数是遮罩整体的横向定位，第二个参数是竖向定位，第三个参数是高度定位
      var hpr = Cesium.Matrix4.fromRotationTranslation(
        hprRotation,
        new Cesium.Cartesian3(-14, 17, 93.5)
      );
      Cesium.Matrix4.multiply(modelMatrix, hpr, modelMatrix);

      tilesModelObj = scene.primitives.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: Cesium.BoxGeometry.fromDimensions({
              vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
              // 第一个参数是遮罩的整体横向长度，第二个参数是竖向长度，第三个参数是整体高度
              dimensions: new Cesium.Cartesian3(
                Number(65),
                Number(50),
                Number(160)
              ),
            }),
            modelMatrix: modelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString("#F26419").withAlpha(0.5)
              ),
              show: new Cesium.ShowGeometryInstanceAttribute(true),
            },
            id: "volume 1",
          }),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        })
      );
    },
    // 楼栋柱体实体
    cylinderModel() {
      viewer.entities.add({
        id: "building1",
        name: '{"cesiumType": "cylinderBuilding"}',
        position: Cesium.Cartesian3.fromDegrees(
          113.06090721905448,
          22.645399902809583,
          45
        ),
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
          new Cesium.Cartesian3.fromDegrees(
            113.06090721905448,
            22.645399902809583,
            45
          ),
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(140),
            Cesium.Math.toRadians(0),
            Cesium.Math.toRadians(0)
          )
        ),
        cylinder: {
          length: 80, // 圆柱体高度
          topRadius: 23, // 圆柱体顶部半径
          bottomRadius: 23, // 圆柱体底部半径
          material: Cesium.Color.fromCssColorString(
            "rgba(255, 255, 255, 0.01)"
          ), // 材质
          // material: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 1)'), // 材质
          slices: 100, // 圆柱周围圆圈分段数
          numberOfVerticalLines: 100, // 圆柱垂直线分段数
        },
      });
    },
    // 楼栋分层实体
    boxFloodModel(data) {
      viewer.entities.add({
        id: this.cylinders[data].id,
        name: '{"cesiumType": "boxFlood"}',
        position: Cesium.Cartesian3.fromDegrees(
          113.06025929925363,
          22.645596984482292,
          this.cylinders[data].cylinder1
        ),
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
          new Cesium.Cartesian3.fromDegrees(
            113.06025929925363,
            22.645596984482292,
            this.cylinders[data].cylinder1
          ),
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(116),
            Cesium.Math.toRadians(0),
            Cesium.Math.toRadians(0)
          )
        ),
        box: {
          dimensions: new Cesium.Cartesian3(20.6, 47, 4),
          material: Cesium.Color.fromCssColorString(
            "rgba(255, 255, 255, 0.01)"
          ), // 材质
          // material: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 1)') // 材质
        },
      });
    },
    // 实例cesium
    getCesiumDem() {
      let self = this;
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZWFlYjAyYS0xN2JlLTQ0OTItOGNkOC05YWJlNGY0MjI2NmQiLCJpZCI6NDkyMjYsImlhdCI6MTYxNzM0NjA3N30.crkTg0Logk_JUA7BROy0r9RqTJWCi8NZpTyu4qI11Fo";
      viewer = new Cesium.Viewer("cesiumDemo", {
        animation: false, // 是否显示动画控件
        baseLayerPicker: false, // 是否显示图层选择控件
        geocoder: false, // 是否显示地名查找控件
        timeline: false, // 是否显示时间线控件
        sceneModePicker: false, // 是否显示投影方式控件
        navigationHelpButton: false, // 是否显示帮助信息控件
        infoBox: false, // 是否显示点击要素之后显示的信息
        fullscreenButton: false, // 是否显示全屏按钮
        selectionIndicator: false, // 是否显示选中指示框
        scene3DOnly: true,
        homeButton: false,
        terrainProvider: new Cesium.EllipsoidTerrainProvider({}),
      });
      // 显示帧率
      viewer.scene.debugShowFramesPerSecond = true;
      self.set3Dtitle2();
      self.cylinderModel();
      self.boxFloodModel("first");
      self.boxFloodModel("second");
      self.boxFloodModel("third");
      self.boxFloodModel("four");
      // 地图事件开始
      // 得到当前三维场景
      let scene = viewer.scene;
      // 得到当前三维场景的椭球体
      let ellipsoid = scene.globe.ellipsoid;
      let entity = viewer.entities.add({
        label: {
          show: false,
        },
      });
      let longitudeString = null;
      let latitudeString = null;
      let height = null;
      // 定义当前场景的画布元素的事件处理
      let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      // 设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
      handler.setInputAction(function (event) {
        if (self.mapMouseDown === true) {
          self.buildMessageBoxShow = false;
          if (tilesModelObj) {
            viewer.scene.primitives.remove(tilesModelObj);
            // tilesModelObj.destroy()
          }
          if (tilesFloodTest) {
            viewer.scene.primitives.remove(tilesFloodTest);
            // tilesFloodTest.destroy()
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      // 鼠标按下
      handler.setInputAction(function (movement) {
        self.mapMouseDown = true;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      // 鼠标弹起
      handler.setInputAction(function (movement) {
        self.mapMouseDown = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      //  设置鼠标点击事件
      handler.setInputAction(function (event) {
        let cartesian = viewer.camera.pickEllipsoid(event.position, ellipsoid);
        if (cartesian) {
          console.log(cartesian);
          // 将笛卡尔坐标转换为地理坐标
          let cartographic = ellipsoid.cartesianToCartographic(cartesian);
          // 将弧度转为度的十进制度表示
          longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
          latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
          // 获取相机高度
          height = Math.ceil(viewer.camera.positionCartographic.height);
          entity.position = cartesian;
          console.log(longitudeString);
          console.log(latitudeString);
          console.log(event);
          console.log(event.position);
          let pick = viewer.scene.pick(event.position);
          if (Cesium.defined(pick) && pick) {
            if (pick.id && pick.id.name) {
              let modelDataObj = JSON.parse(pick.id.name);
              // 检测点击楼栋实体
              if (modelDataObj.cesiumType === "cylinderBuilding") {
                self.buildMessageBoxShow = true;
                let winpos = viewer.scene.cartesianToCanvasCoordinates(
                  pick.id.position._value
                );
                // 计算弹框的位置
                setTimeout(() => {
                  let mainMessageBoxDom =
                    document.querySelector(".buildMessageBox");
                  let winposWihth = mainMessageBoxDom.offsetWidth;
                  let winposHeight = mainMessageBoxDom.offsetHeight;
                  mainMessageBoxDom.style.left =
                    Math.floor(winpos.x) - winposWihth / 2 + 230 + "px";
                  mainMessageBoxDom.style.top =
                    Math.floor(winpos.y) - winposHeight - 70 + "px";
                  self.tilesModel();
                }, 10);
                // 检测点击到分层实体
              } else if (modelDataObj.cesiumType === "boxFlood") {
                self.layeredTilesModel(pick.id.id);
              }
            } else {
              self.buildMessageBoxShow = false;
              if (tilesModelObj) {
                viewer.scene.primitives.remove(tilesModelObj);
                // tilesModelObj.destroy()
              }
              if (tilesFloodTest) {
                viewer.scene.primitives.remove(tilesFloodTest);
                // tilesFloodTest.destroy()
              }
            }
          } else {
            self.buildMessageBoxShow = false;
            if (tilesModelObj) {
              viewer.scene.primitives.remove(tilesModelObj);
              // tilesModelObj.destroy()
            }
            if (tilesFloodTest) {
              viewer.scene.primitives.remove(tilesFloodTest);
              // tilesFloodTest.destroy()
            }
          }
        } else {
          entity.label.show = false;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // 地图事件结束
      // 保利倾斜摄影
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(113.060458, 22.640675, 180),
        orientation: {
          heading: Cesium.Math.toRadians(20),
          pitch: Cesium.Math.toRadians(-20),
          roll: 0,
        },
      });
    },
  },
};
</script>
  <style scoped lang="scss">
#cesiumDemo {
  background: #000;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}
.ceshiIptBox {
  position: absolute;
  left: 50px;
  top: 20px;
  width: 300px;
  z-index: 9;
  color: white;
  font-size: 13px;
}
/* 隐藏cesium标志 */
.cesium-viewer .cesium-widget-credits {
  display: none;
}
.modeView {
  position: absolute;
  right: 10px;
  top: 7px;
  cursor: pointer;
}
.messageBoxTit {
  color: #ffffff;
}
.messageVal {
  color: #c7ff06;
}
.messageBox {
  position: absolute;
  left: -88px;
  top: -190px;
  /* border-radius: 5px; */
  background: rgba(41, 192, 183, 0.6);
  padding: 6px;
  box-shadow: 0 0 10px rgb(0, 110, 150);
  z-index: 8;
  color: #30fff5;
  /* box-shadow: 0 0 20px #30fff5 inset !important; */
  background-color: rgba(0, 54, 120, 0.7);
  width: 200px;
  border: 2px #1aabff solid;
  .title {
    font-size: 14px;
    font-weight: bold;
    margin-left: 4px;
    line-height: 22px;
  }
  .contList {
    font-size: 12px;
    font-weight: bold;
    margin-left: 10px;
    line-height: 23px;
    margin-right: 10px;
  }
  .topLine {
    border-top: 1px #30fff5 solid;
    position: absolute;
    left: -30px;
    top: 68px;
    width: 30px;
  }
  .slantLine {
    border-top: 1px #30fff5 solid;
    position: absolute;
    left: -136px;
    top: 118px;
    width: 129px;
    transform: rotateZ(-50deg);
  }
}
</style>