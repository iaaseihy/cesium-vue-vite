<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2024-09-25 17:31:24
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="addDynamicCloud()">添加动态云层</el-button>
    <el-button @click="add3Dtiles()">添加倾斜摄影</el-button>
    <el-button @click="addBillboard()">添加billboard点位</el-button>
    <el-button @click="add3DtilesQiantong()">添加倾斜摄影原始</el-button>
    <el-button @click="add3DtilesTest()">添加倾斜摄影测试</el-button>
    <el-button @click="add3DtilesSnow()">添加倾斜摄影积雪效果</el-button>
    <el-button @click="add3DtilesSnow2()">添加倾斜摄影积雪效果2</el-button>
    <el-button @click="close3DtilesSnow2()">关闭倾斜摄影积雪效果2</el-button>
    <el-button @click="add3DtilesSnow3()">添加倾斜摄影积雪效果3</el-button>
    <el-button @click="close3DtilesSnow3()">关闭倾斜摄影积雪效果3</el-button>
    <el-button @click="close3DtilesSnow()">关闭倾斜摄影积雪效果</el-button>
    <el-button @click="addHeightFog()">添加高度雾效果</el-button>
    <el-button @click="closeHeightFog()">关闭高度雾效果</el-button>
  </div>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, ref, reactive } from "vue";
import CesiumContainer from "@/views/CesiumContainer.vue";
import { useStore } from "vuex";
import * as Cesium from "cesium";
import CloudEffectMaterialProperty from "./cloud.js";
import SnowCoverStageEffect from "./SnowCoverStageEffect.js";
import SnowCover from "./SnowCover.js";
import SnowCoverEffect from "./SnowCoverEffect.js";
import HeightFogEffect from "./HeightFogEffect.js";
import {
  LOCAL_IMG_URL,
  LOCAL_TERRAIN_URL,
  QIANTONG3DTILES,
  DAYANTA3DTILES,
  BAIMO3DTILES,
  GAODE_IMG_URL,
  SOURCE3DTILES,
} from "../../../commonJS/config";
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let entities;
    let entityDrag;
    let imageryProvider;
    let layer;
    let handler;
    let tilesetBaimo = ref < Cesium.Cesium3DTileset > null;
    let pickEntity;
    let activeShapePoints = [];
    let floatingPoint = undefined;
    let activeShape = undefined;
    let isDraw = ref < Boolean > false;
    let maxWaterHeight = 3000;
    let minWaterHeight = 0;
    let warningWaterHeight = 100; // 预警高度
    let waterHeight = 0;
    let waterHeightShow = ref < Boolean > false;
    let speed = "1";
    let waterHeightTimeer = 0;
    let waterPrimitive = undefined;
    let tempEntities = [];
    let heightFog;
    let snowEffect;
    let snowEffect2;
    let snowEffect3;
    const state = reactive({
      dragtool: null,
    });
    let tileset1;

    //     const boundingSphere = BoundingSphere.fromPoints(positions);
    // viewer.camera.flyToBoundingSphere(boundingSphere)

    const addDynamicCloud = () => {
      const { viewer } = store.state;
      viewer.scene.globe.depthTestAgainstTerrain = true; // 开启地形深度探测

      const entities = viewer.entities;

      // 云层图片
      const image = "https://openlayers.vip/examples/resources/earth_cloud.png";

      // 云层颜色,一般设置为白色
      const color = new Cesium.Color(1.0, 1.0, 1.0, 1);

      // 用于计算云层速度
      const time = 20;

      // 图片材质
      const imageMaterial = new Cesium.ImageMaterialProperty({
        image: image,
      });

      function CloudEffectMaterialProperty() {
        this._definitionChanged = new Cesium.Event();

        this.speed = 200;
        this.color = color;
        this._image = image;
        this.time = time;

        const durationDefault = 100000;
        this.duration = (100 / this.speed) * durationDefault;

        this._time = new Date().getTime();
      }

      Object.defineProperties(CloudEffectMaterialProperty.prototype, {
        isConstant: {
          get: function () {
            return false;
          },
        },
        definitionChanged: {
          get: function () {
            return this._definitionChanged;
          },
        },
        color: Cesium.createPropertyDescriptor("color"),
      });
      CloudEffectMaterialProperty.prototype.getType = function (time) {
        return "CloudEffect";
      };
      CloudEffectMaterialProperty.prototype.getValue = function (time, result) {
        if (!Cesium.defined(result)) {
          result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(
          this._color,
          time,
          Cesium.Color.WHITE,
          result.color
        );
        result.time =
          ((new Date().getTime() - this._time) % this.duration) / this.duration;
        return result;
      };
      CloudEffectMaterialProperty.prototype.equals = function (other) {
        return (
          this === other ||
          (other instanceof CloudEffectMaterialProperty &&
            Cesium.Property.equals(this._color, other._color) &&
            Cesium.Property.equals(this.speed, other.speed))
        );
      };
      Cesium.Material.CloudEffectType = "CloudEffect";
      Cesium.Material.CloudEffectImage = image;
      Cesium.Material.CloudEffectColor = color;
      Cesium.Material.CloudEffectSource = `
czm_material czm_getMaterial(czm_materialInput materialInput)
              {
                   czm_material material = czm_getDefaultMaterial(materialInput);
                   vec2 st = materialInput.st;
                   vec4 colorImage = texture(image, vec2(fract(st.s + time),st.t));
                   material.alpha = colorImage.a * color.a  ;
                   material.diffuse = color.rgb  ;
                   return material;
}
`;

      Cesium.Material._materialCache.addMaterial(
        Cesium.Material.CloudEffectType,
        {
          fabric: {
            type: Cesium.Material.CloudEffectType,
            uniforms: {
              color: Cesium.Material.CloudEffectColor,
              image: Cesium.Material.CloudEffectImage,
              time: time,
            },
            source: Cesium.Material.CloudEffectSource,
          },
          translucent: function (material) {
            return true;
          },
        }
      );

      // 创建矩形实体
      const entity = entities.add({
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
          material: imageMaterial,
        },
      });

      let options = {
        time: time,
        color: color,
        image: image,
      };
      // 开启动态云层
      entity.rectangle.height = 0;
      entity.rectangle.extrudedHeight = 100000;
      entity.rectangle.material = new CloudEffectMaterialProperty(options);

      window.viewer = viewer;
      var terrainProviderMars = new Cesium.CesiumTerrainProvider({
        url: "http://data.marsgis.cn/terrain",
        requestWaterMask: true, // 请求水波纹效果
        requestVertexNormals: true,
      });

      viewer.terrainProvider._layers[1] = terrainProviderMars;
      console.log(viewer.terrainProvider);
      // 定位至云层对象
      viewer.zoomTo(viewer.entities);
    };

    const addBillboard = () => {
      const { viewer } = store.state;
      let oldArr = [
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653126000005.0",
            OBJ_NAME: "江卡渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [77.2671111111111, 37.7469166666666],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653125000018.0",
            OBJ_NAME: "荒地分水节制闸",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653125000022.0",
            OBJ_NAME: "勿甫渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [77.0861666666666, 38.1545277777778],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653125000025.0",
            OBJ_NAME: "依干其渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [77.4458333333332, 38.3774999999999],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653130000035.0",
            OBJ_NAME: "依干其水库节制分水闸",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653125000017.0",
            OBJ_NAME: "艾里克塔木渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [78.577736111111, 39.5597833333333],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653127000010.0",
            OBJ_NAME: "中游渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [77.3616666666666, 38.6347222222222],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652927000010.0",
            OBJ_NAME: "跃进渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [78.9096388888889, 41.0696111111111],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652901000030.0",
            OBJ_NAME: "艾里西引水枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [80.1688888888889, 41.1277777777778],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652901000040.0",
            OBJ_NAME: "西大桥引水枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [80.2118583333332, 41.1140972222221],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652901000050.0",
            OBJ_NAME: "多浪渠引水渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [80.0974999999999, 41.2394444444444],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652901000060.0",
            OBJ_NAME: "柯柯牙河引水龙口",
          },
          geometry: {
            type: "Point",
            coordinates: [80.2888888888889, 41.4877777777778],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652927000040.0",
            OBJ_NAME: "秋格尔引水渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [79.1019444444443, 41.2063888888889],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652927000050.0",
            OBJ_NAME: "联合渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [79.4652777777778, 41.3169444444444],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652823000050.0",
            OBJ_NAME: "大西海子枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [87.5590277777778, 40.588],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653224000010.0",
            OBJ_NAME: "玉河渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [79.8912166666666, 36.9140666666666],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652823000020.0",
            OBJ_NAME: "阿其克枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [86.0010972222221, 41.0574944444444],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652922000010.0",
            OBJ_NAME: "协合拉渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [79.6488888888889, 41.5584444444443],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652927000020.0",
            OBJ_NAME: "秋格尔枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [79.0993333333333, 41.205611111111],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652927000030.0",
            OBJ_NAME: "联合渠引水枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [79.4675277777778, 41.3203055555555],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652901000020.0",
            OBJ_NAME: "塔里木拦河闸",
          },
          geometry: {
            type: "Point",
            coordinates: [80.4950555555555, 40.7264444444443],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653125000010.0",
            OBJ_NAME: "喀群枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [76.8757777777777, 37.9766666666667],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653130000010.0",
            OBJ_NAME: "民生渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [77.7116666666667, 39.1722222222222],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652823000030.0",
            OBJ_NAME: "东河滩枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [86.5563666666667, 41.0775666666666],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652801000040.0",
            OBJ_NAME: "希尼尔水库枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652924000010.0",
            OBJ_NAME: "大寨生态闸",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652924000020.0",
            OBJ_NAME: "吐皮塔西提闸",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652823000010.0",
            OBJ_NAME: "乌斯满枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [85.4494444444444, 40.9841666666667],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652823000040.0",
            OBJ_NAME: "恰拉分水枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [86.7066944444444, 40.9673333333333],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653222000010.0",
            OBJ_NAME: "喀拉喀什渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [79.7321833333332, 37.0115333333332],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653125000015.0",
            OBJ_NAME: "西岸大渠克洛瓦提节制分水闸",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653125000016.0",
            OBJ_NAME: "西岸大渠托克斯买提节制分水闸",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653125000020.0",
            OBJ_NAME: "苏库恰克水库枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [77.2513888888888, 38.7508333333332],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653124000010.0",
            OBJ_NAME: "东岸大渠亚斯墩节制分水闸",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653126000010.0",
            OBJ_NAME: "红卫渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [77.435861111111, 38.1656388888889],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653126000020.0",
            OBJ_NAME: "萨依引水闸",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653126000030.0",
            OBJ_NAME: "黑孜阿瓦提渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [77.5128527777777, 38.4995416666667],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653127000020.0",
            OBJ_NAME: "汗克尔渠首",
          },
          geometry: {
            type: "Point",
            coordinates: [77.5498055555555, 38.7120222222222],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "653023000010.0",
            OBJ_NAME: "玉山古西河枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          type: "Feature",
          properties: {
            UserID: 0,
            OBJ_CODE: "652901000010.0",
            OBJ_NAME: "阿克苏河西大桥分水枢纽",
          },
          geometry: {
            type: "Point",
            coordinates: [80.2116944444444, 41.1139444444444],
          },
        },
      ];
      oldArr.forEach((element) => {
        if (
          element.geometry.coordinates[0] !== 0 &&
          element.geometry.coordinates[1] !== 0
        ) {
          var name = element.properties.OBJ_NAME;
          var position = Cesium.Cartesian3.fromDegrees(
            element.geometry.coordinates[0],
            element.geometry.coordinates[1],
            1100
          );

          // 切换点位的显示/隐藏状态
          let HingeOldData = addPoint3(
            position,
            "/static/texture/枢纽.png",
            "gate",
            viewer,
            name
          );

          //存入集合
          //   HingeOldList.push(HingeOldData);
        }
      });

      let viewTarget = {
        lon: 77.2671111111111,
        lat: 37.7469166666666,
        alt: 3000,
        heading: -90.0, // east, default value is 0.0 (north)
        pitch: -20, // default value (looking down)
        roll: 0.0, // default value
      };
      //设置相机位置
      setView(viewer, viewTarget);
    };

    const addPoint3 = (position, image, name, viewer, label) => {
      // 获取当前地图视图范围内的聚合点位
      var billboards = new Cesium.BillboardCollection({
        scene: viewer.scene,
      });

      billboards.add({
        mapName: label,
        position: position,
        image: "/static/texture/3.png",
        width: 194,
        height: 38,
        color: new Cesium.Color(1.0, 1.0, 1.0, 0.5),
        // 可以显示的距离
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 将点位贴在高程上
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        alignedAxis: Cesium.Cartesian3.ZERO,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        eyeOffset: new Cesium.Cartesian3(0, 0, -100),
        pixelOffset: new Cesium.Cartesian2(0, -45),
        clampToGround: true, // 将图标点贴地
        // visible: false, // 设置图片为不可见
      });

      billboards.add({
        mapName: label,
        position: position,
        image: image,
        width: 16 * 1.5,
        height: 24 * 1.5,
        show: true, // 初始状态为显示
        // 可以显示的距离
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 30000),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 将点位贴在高程上
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        alignedAxis: Cesium.Cartesian3.ZERO,
        // eyeOffset:new Cesium.Cartesian3(0,0,-5),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        clampToGround: true, // 将图标点贴地
      });
      viewer.scene.primitives.add(billboards);

      var labelCollection = viewer.scene.primitives.add(
        new Cesium.LabelCollection({
          scene: viewer.scene,
        })
      );

      labelCollection.add({
        position: position,
        text: label,
        font: "italic bold 18px sharp",
        fillColor: Cesium.Color.fromCssColorString("#ffffff"),
        showBackground: false,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 将点位贴在高程上
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: new Cesium.Cartesian2(0, -55),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // eyeOffset:new Cesium.Cartesian3(0,0,-5),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        alignedAxis: Cesium.Cartesian3.ZERO,
        // 可以显示的距离
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000),
      });
      //返回值用于控制点位展示和隐藏
      var obj = [
        {
          billboards: billboards,
          label: labelCollection,
        },
      ];
      //返回值用于控制点位展示和隐藏
      return obj;
    };
    const add3Dtiles = () => {
      const { viewer } = store.state;
      const customShader = new Cesium.CustomShader({
        uniforms: {
          // 判断是否开启压平
          v_if: {
            type: Cesium.UniformType.BOOL,
            value: false,
          },
          // 压平值
          v_z: {
            type: Cesium.UniformType.FLOAT,
            value: 0.0,
          },
        },
        varyings: {
          // 压平区域
          v_area: Cesium.VaryingType.VEC3,
        },
        // 局部压平通过vsInput.attributes.positionMC.x<10.0 &&vsInput.attributes.positionMC.y<10.0实现（模型内部坐标筛选），可传入varyings使用
        vertexShaderText: `
				 void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
		 	if(v_if&& vsInput.attributes.positionMC.x<10.0 &&vsInput.attributes.positionMC.y<10.0){
		 		vsOutput.positionMC = vec3(vsInput.attributes.positionMC.x, vsInput.attributes.positionMC.y, v_z);
		 	}else{
		 		vsOutput.positionMC = vec3(vsInput.attributes.positionMC.x, vsInput.attributes.positionMC.y, vsInput.attributes.positionMC.z);
		 	}
		 }`,

        fragmentShaderText: `
		 void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
			
		  }`,
      });
      const translation = Cesium.Cartesian3.fromArray([0, 0, 0]);
      const m = Cesium.Matrix4.fromTranslation(translation);
      const tilesetJson = {
        url: QIANTONG3DTILES,
        minimumPixelSize: 128,
        customShader: customShader,
        enableModelExperimental: true,
        modelMatrix: m,
        // show: true, // 是否显示图块集(默认true)
        skipLevelOfDetail: true, // --- 优化选项。确定是否应在遍历期间应用详细级别跳过(默认false)
        baseScreenSpaceError: 1024, // --- When skipLevelOfDetailis true，在跳过详细级别之前必须达到的屏幕空间错误(默认1024)
        maximumScreenSpaceError: 32, // 数值加大，能让最终成像变模糊---用于驱动细节细化级别的最大屏幕空间误差(默认16)原128
        skipScreenSpaceErrorFactor: 16, // --- 何时skipLevelOfDetail是true，定义要跳过的最小屏幕空间错误的乘数。与 一起使用skipLevels来确定要加载哪些图块(默认16)
        skipLevels: 1, // --- WhenskipLevelOfDetail是true一个常量，定义了加载图块时要跳过的最小级别数。为 0 时，不跳过任何级别。与 一起使用skipScreenSpaceErrorFactor来确定要加载哪些图块。(默认1)
        immediatelyLoadDesiredLevelOfDetail: false, // --- 当skipLevelOfDetail是时true，只会下载满足最大屏幕空间错误的图块。忽略跳过因素，只加载所需的图块(默认false)
        loadSiblings: false, // 如果为true则不会在已加载完概况房屋后，自动从中心开始超清化房屋 --- 何时确定在遍历期间skipLevelOfDetail是否true始终下载可见瓦片的兄弟姐妹(默认false)
        cullWithChildrenBounds: false, // ---优化选项。是否使用子边界体积的并集来剔除瓦片（默认true）
        cullRequestsWhileMoving: false, // ---优化选项。不要请求由于相机移动而在返回时可能未使用的图块。这种优化只适用于静止的瓦片集(默认true)
        cullRequestsWhileMovingMultiplier: 10, // 值越小能够更快的剔除 ---优化选项。移动时用于剔除请求的乘数。较大的是更积极的剔除，较小的较不积极的剔除(默认60)原10
        preloadWhenHidden: true, // ---tileset.show时 预加载瓷砖false。加载图块，就好像图块集可见但不渲染它们(默认false)
        preloadFlightDestinations: true, // ---优化选项。在相机飞行时在相机的飞行目的地预加载图块(默认true)
        preferLeaves: true, // ---优化选项。最好先装载叶子(默认false)
        maximumMemoryUsage: 2048, // 内存分配变小有利于倾斜摄影数据回收，提升性能体验---瓦片集可以使用的最大内存量（以 MB 为单位）(默认512)原512 4096
        progressiveResolutionHeightFraction: 0.5, // 数值偏于0能够让初始加载变得模糊 --- 这有助于在继续加载全分辨率图块的同时快速放下图块层(默认0.3)
        dynamicScreenSpaceErrorDensity: 10, // 数值加大，能让周边加载变快 --- 用于调整动态屏幕空间误差的密度，类似于雾密度(默认0.00278)
        dynamicScreenSpaceErrorFactor: 1, // 不知道起了什么作用没，反正放着吧先 --- 用于增加计算的动态屏幕空间误差的因素(默认4.0)
        dynamicScreenSpaceErrorHeightFalloff: 0.25, // --- 密度开始下降的瓦片集高度的比率(默认0.25)
        foveatedScreenSpaceError: true, // --- 优化选项。通过暂时提高屏幕边缘周围图块的屏幕空间错误，优先加载屏幕中心的图块。一旦Cesium3DTileset#foveatedConeSize加载确定的屏幕中心的所有图块，屏幕空间错误就会恢复正常。(默认true)
        foveatedConeSize: 0.1, // --- 优化选项。当Cesium3DTileset#foveatedScreenSpaceError为 true 时使用来控制决定延迟哪些图块的锥体大小。立即加载此圆锥内的瓷砖。圆锥外的瓷砖可能会根据它们在圆锥外的距离及其屏幕空间误差而延迟。这是由Cesium3DTileset#foveatedInterpolationCallback和控制的Cesium3DTileset#foveatedMinimumScreenSpaceErrorRelaxation。将此设置为 0.0 意味着圆锥将是由相机位置及其视图方向形成的线。将此设置为 1.0 意味着锥体包含相机的整个视野,禁用效果(默认0.1)
        foveatedMinimumScreenSpaceErrorRelaxation: 0.0, // --- 优化选项。当Cesium3DTileset#foveatedScreenSpaceError为 true 时使用以控制中央凹锥之外的图块的起始屏幕空间误差松弛。屏幕空间错误将从 tileset 值开始Cesium3DTileset#maximumScreenSpaceError根据提供的Cesium3DTileset#foveatedInterpolationCallback.(默认0.0)
        // foveatedTimeDelay: 0.2, // ---优化选项。使用 whenCesium3DTileset#foveatedScreenSpaceError为 true 来控制在相机停止移动后延迟瓷砖开始加载之前等待的时间（以秒为单位）。此时间延迟可防止在相机移动时请求屏幕边缘周围的瓷砖。将此设置为 0.0 将立即请求任何给定视图中的所有图块。(默认0.2)
        luminanceAtZenith: 0.2, // --- 用于此模型的程序环境贴图的天顶处的太阳亮度（以千坎德拉每平方米为单位）(默认0.2)
        backFaceCulling: true, // --- 是否剔除背面几何体。当为 true 时，背面剔除由 glTF 材质的 doubleSided 属性确定；如果为 false，则禁用背面剔除(默认true)
        debugFreezeFrame: false, // --- 仅用于调试。确定是否应仅使用最后一帧的图块进行渲染(默认false)
        debugColorizeTiles: false, // --- 仅用于调试。如果为 true，则为每个图块分配随机颜色(默认false)
        debugWireframe: false, // --- 仅用于调试。如果为 true，则将每个图块的内容渲染为线框(默认false)
        debugShowBoundingVolume: false, // --- 仅用于调试。如果为 true，则为每个图块渲染边界体积(默认false)
        debugShowContentBoundingVolume: false, // --- 仅用于调试。如果为 true，则为每个图块的内容渲染边界体积(默认false)
        debugShowViewerRequestVolume: false, // --- 仅用于调试。如果为 true，则呈现每个图块的查看器请求量(默认false)
        debugShowGeometricError: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块的几何误差(默认false)
        debugShowRenderingStatistics: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块的命令、点、三角形和特征的数量(默认false)
        debugShowMemoryUsage: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块使用的纹理和几何内存（以兆字节为单位）(默认false)
        debugShowUrl: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块的 url(默认false)
        dynamicScreenSpaceError: true, // 根据测试，有了这个后，会在真正的全屏加载完之后才清晰化房屋 --- 优化选项。减少距离相机较远的图块的屏幕空间错误(默认false)
      };
      tileset1 = new Cesium.Cesium3DTileset(tilesetJson);
      // 非异步加载
      // viewer.scene.primitives.add(tileset1)
      // 异步加载
      // tileset1.readyPromise
      //   .then(function (tileset) {
      //     viewer.scene.primitives.add(tileset);
      //   })
      //   .catch(function (error) {
      //     console.log(error);
      //   });
      const height = 0;
      tileset1.readyPromise
        .then(function (currentModel) {
          const that = this;
          var scene = viewer.scene;
          var globe = scene.globe;
          viewer.scene.screenSpaceCameraController.enableCollisionDetection = true; //相机与地形的碰撞检测
          //开启地下可视化
          // scene.screenSpaceCameraController.enableCollisionDetection = false;
          // globe.translucency.frontFaceAlphaByDistance =
          //   new Cesium.NearFarScalar(1000.0, 0.0, 2000.0, 1.0);
          globe.translucency.enabled = true;
          window.tileModel = currentModel;
          scene.globe.depthTestAgainstTerrain = true;
          // viewer.zoomTo(
          //   currentModel,
          //   new Cesium.HeadingPitchRange(-0.5, -0.5, 800)
          // );
          viewer.scene.primitives.add(currentModel);
          console.log(currentModel);

          // 倾斜高度调整
          var boundingSphere = currentModel.boundingSphere;
          var cartographic = Cesium.Cartographic.fromCartesian(
            boundingSphere.center
          );
          var surface = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            0.0
          );
          var offset = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            height
          );
          const translation = Cesium.Cartesian3.subtract(
            offset,
            surface,
            new Cesium.Cartesian3()
          );
          currentModel.modelMatrix =
            Cesium.Matrix4.fromTranslation(translation);

          //获取模型中心点经纬度坐标
          // that.tileModelTool.longitude =
          //   (cartographic.longitude / Math.PI) * 180;
          // that.tileModelTool.latitude = (cartographic.latitude / Math.PI) * 180;
          // that.tileModelTool.height = cartographic.height;

          // //修改3dtiles位置，input，range组件的change事件绑定此函数
          // that.update3dtilesMaxtrix();

          //模型点击事件
          // attachTileset(viewer, currentModel);
          // that.tileModelToolVisiable = true; //显示3dtiles调整工具
        })
        .catch(function (error) {
          console.error("倾斜摄影模型加载失败：", error);
        });

      viewer.flyTo(tileset1);
      // viewerEye.flyTo(tileset1)
      // console.log('tileset1: ', tileset1)
      tileset1.allTilesLoaded.addEventListener(function () {
        console.log("模型已经全部加载完成");
      });
    };

    const add3DtilesQiantong = () => {
      const { viewer } = store.state;
      var tileset = new Cesium.Cesium3DTileset({
        url: "//data.mars3d.cn/3dtiles/qx-shequ/tileset.json",
      });

      viewer.scene.primitives.add(tileset);

      viewer.zoomTo(tileset);
    };
    const add3DtilesTest = () => {
  // let tileset1;
  // const translation = Cesium.Cartesian3.fromArray([0, 0, 0]);
  // const m = Cesium.Matrix4.fromTranslation(translation);
  // const tilesetJson = {
  //   url: url,
  //   minimumPixelSize: 128,
  //   // enableModelExperimental: true,
  //   modelMatrix: m,
  //   // show: true,
  //   skipLevelOfDetail: true,
  //   baseScreenSpaceError: 1024,
  //   maximumScreenSpaceError: 32,
  //   skipScreenSpaceErrorFactor: 16,
  //   skipLevels: 1,
  //   immediatelyLoadDesiredLevelOfDetail: false,
  //   loadSiblings: false,
  //   cullWithChildrenBounds: false,
  //   cullRequestsWhileMoving: false,
  //   cullRequestsWhileMovingMultiplier: 10,
  //   preloadWhenHidden: true,
  //   preloadFlightDestinations: true,
  //   preferLeaves: true,
  //   maximumMemoryUsage: 2048,
  //   progressiveResolutionHeightFraction: 0.5,
  //   dynamicScreenSpaceErrorDensity: 10,
  //   dynamicScreenSpaceErrorFactor: 1,
  //   dynamicScreenSpaceErrorHeightFalloff: 0.25,
  //   foveatedScreenSpaceError: true,
  //   foveatedConeSize: 0.1,
  //   foveatedMinimumScreenSpaceErrorRelaxation: 0.0,
  //   // foveatedTimeDelay: 0.2,
  //   luminanceAtZenith: 0.2,
  //   backFaceCulling: true,
  //   debugFreezeFrame: false,
  //   debugColorizeTiles: false,
  //   debugWireframe: false,
  //   debugShowBoundingVolume: false,
  //   debugShowContentBoundingVolume: false,
  //   debugShowViewerRequestVolume: false,
  //   debugShowGeometricError: false,
  //   debugShowRenderingStatistics: false,
  //   debugShowMemoryUsage: false,
  //   debugShowUrl: false,
  //   dynamicScreenSpaceError: true,
  // };
  // tileset1 = new Cesium.Cesium3DTileset(tilesetJson);
  // var tileset = viewer.scene.primitives.add(tileset1);
  //
  // tileset.readyPromise.then(function (currentModel) {
  //     viewer.scene.screenSpaceCameraController.enableCollisionDetection = false; //相机与地形的碰撞检测
  //     viewer.flyTo(tileset1);
  //
  //     // var heightOffset = 6.0; // 要调整的高度值（米）
  //     // var boundingSphere = currentModel.boundingSphere;
  //     // var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
  //     // var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
  //     // var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
  //     // var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
  //     // currentModel.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
  //   })
  const { viewer } = store.state;
  var tileset = new Cesium.Cesium3DTileset({
    url: "//data.mars3d.cn/3dtiles/qx-shequ/tileset.json",
    minimumPixelSize: 128,
    // modelMatrix: m,
    skipLevelOfDetail: true,
    baseScreenSpaceError: 1024,
    maximumScreenSpaceError: 64,
    skipScreenSpaceErrorFactor: 16,
    skipLevels: 1,
    immediatelyLoadDesiredLevelOfDetail: false,
    loadSiblings: false,
    cullWithChildrenBounds: false,
    cullRequestsWhileMoving: false,
    cullRequestsWhileMovingMultiplier: 10,
    preloadWhenHidden: true,
    preloadFlightDestinations: true,
    preferLeaves: true,
    maximumMemoryUsage: 2048,
    progressiveResolutionHeightFraction: 0.5,
    dynamicScreenSpaceErrorDensity: 10,
    dynamicScreenSpaceErrorFactor: 1,
    dynamicScreenSpaceErrorHeightFalloff: 0.25,
    foveatedScreenSpaceError: true,
    foveatedConeSize: 0.1,
    foveatedMinimumScreenSpaceErrorRelaxation: 0.0,
    luminanceAtZenith: 0.2,
    backFaceCulling: true,
    debugFreezeFrame: false,
    debugColorizeTiles: false,
    debugWireframe: false,
    debugShowBoundingVolume: false,
    debugShowContentBoundingVolume: false,
    debugShowViewerRequestVolume: false,
    debugShowGeometricError: false,
    debugShowRenderingStatistics: false,
    debugShowMemoryUsage: false,
    debugShowUrl: false,
    dynamicScreenSpaceError: true,
  })
  

  tileset.readyPromise.then(function (tile) {
    viewer.scene.primitives.add(tile, 1);
    viewer.zoomTo(tile);
    // var boundingSphere = tileset.boundingSphere;
    // viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius));
    // viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

    // var heightOffset = -58.0; // 要调整的高度值（米）
    // var boundingSphere = currentModel.boundingSphere;
    // var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
    // var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
    // var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
    // var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    // currentModel.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
  }).catch(function (error) {
    throw(error);
  });
};
    const add3DtilesSnow = () => {
      const { viewer } = store.state;
      add3DtilesQiantong();
      snowEffect = new SnowCoverStageEffect(viewer, {
        alpha: 0.9,  // 设置积雪透明度
        snowCoverage: 0.6  // 设置积雪覆盖率
      });

      // 调整积雪覆盖率
      snowEffect.changeSnowCoverage(0.8);

      // 显示或隐藏积雪效果
      snowEffect.show(true);

      // 动态修改透明度
      snowEffect.changeAlpha(1.0);

    };

    const close3DtilesSnow = () => {
      snowEffect && snowEffect.destroy();
      snowEffect = null;
    };

    const add3DtilesSnow2 = () => {
      const { viewer } = store.state;
      add3DtilesQiantong();
      snowEffect2 = new SnowCover(viewer)
    };

    const close3DtilesSnow2 = () => {
      snowEffect2 && snowEffect2.clearSnowCover();
      snowEffect2 = null;
    };

    const add3DtilesSnow3 = () => {
      const { viewer } = store.state;
      add3DtilesQiantong();
      // 创建积雪效果实例
      snowEffect3 = new SnowCoverEffect(viewer, {
        snowColor: Cesium.Color.WHITE, // 可以传入自定义颜色
      });

      // 启用积雪效果
      snowEffect3.show(true);

      // 动态更改积雪颜色
      // snowEffect3.changeSnowColor(Cesium.Color.LIGHTBLUE);

      // // 关闭积雪效果
      // snowEffect3.show(false);

      // // 销毁积雪效果
      // snowEffect3.destroy();
    };

    const close3DtilesSnow3 = () => {
      // 销毁积雪效果
      snowEffect3 && snowEffect3.destroy();
      snowEffect3 = null;
    };

    const addHeightFog = () => {
      const { viewer } = store.state;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      const cartographic = Cesium.Cartographic.fromDegrees(109.08, 30.94); // 获取河流地形高度
      // const cartographic = Cesium.Cartographic.fromDegrees(119.4789507, 28.4416882); // 获取mars3d线上模型地形高度
      const terrainHeight = viewer.scene.globe.getHeight(cartographic);

      // 根据地形高度设置雾的高度
      heightFog = new HeightFogEffect(viewer, {
        height: terrainHeight + 100,  // 在地形高度基础上稍微增加一些
        fogColor: Cesium.Color.WHITE.withAlpha(0.5),
        alpha: 0.88
      });
    };
    
    const closeHeightFog = () => {
      heightFog && heightFog.destroy();
      heightFog = null;
    };

    /**
     * @author:
     * @Date: 2022-04-11 16:44:42
     * @note: 注意事项
     * @description: 清除当前页面所有数据
     */
    const clearAllEntities = () => {
      const { viewer } = store.state;
      if (waterHeightTimeer) {
        clearInterval(waterHeightTimeer);
      }
      let positions = [];
      const length = tempEntities.length;
      for (let f = 0; f < length; f++) {
        viewer.entities.remove(tempEntities[f]);
      }
      tempEntities = [];
      waterHeightShow = false;
      activeShapePoints = [];
      warningWaterHeight = 0;
      isDraw = !isDraw;
      floatingPoint = undefined;
      activeShape = undefined;
      if (handler) {
        handler.destroy(); // 关闭事件句柄
        handler = undefined;
      }
    };
    const setView = (viewer, param) => {
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          param.lon,
          param.lat,
          param.alt
        ),
        orientation: {
          heading: Cesium.Math.toRadians(param.heading), // east, default value is 0.0 (north)
          pitch: Cesium.Math.toRadians(param.pitch), // default value (looking down)
          roll: Cesium.Math.toRadians(param.roll), // default value
        },
      });
    };
    const handleClear = () => {
      const { viewer } = store.state;
    };
    onMounted(() => {
      const { viewer } = store.state;
      let viewTarget = {
        lon: 109.08,
        lat: 30.94,
        alt: 3000,
        heading: -90.0, // east, default value is 0.0 (north)
        pitch: -20, // default value (looking down)
        roll: 0.0, // default value
      };
      //设置相机位置
      setView(viewer, viewTarget);
      // outlineView();
      // addTiandituMap();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      addDynamicCloud,
      add3Dtiles,
      add3DtilesQiantong,
      add3DtilesTest,
      add3DtilesSnow,
      close3DtilesSnow,
      add3DtilesSnow2,
      close3DtilesSnow2,
      add3DtilesSnow3,
      close3DtilesSnow3,
      addHeightFog,
      closeHeightFog,
      addBillboard,
      clearAllEntities,
    };
  },
});
</script>

<style scoped>
/* @bgc:#000; */
#cesiumContainer {
  background: #000;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}
.cesiumContainerRight {
  width: 30%;
  height: 69%;
  position: absolute;
  bottom: 0;
  right: 0;
}
:deep(.cesium-viewer-cesium3DTilesInspectorContainer) {
  right: 400px;
  top: 200px;
}
.slider {
  position: absolute;
  left: 50%;
  top: 0px;
  background-color: #d3d3d3;
  width: 4px;
  height: 100%;
  z-index: 9999;
}
.slider:hover {
  cursor: ew-resize;
}
#creditContainer {
  display: none;
}
</style>
