<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2024-02-01 13:45:06
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2024-02-01 13:57:23
-->
<template>
    <cesium-container ref="cesiumContainer"> </cesium-container>
    <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
        <el-button @click="addLabelCovered()">添加标签遮盖</el-button>
    </div>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, ref, reactive } from "vue";
import CesiumContainer from "@/views/CesiumContainer.vue";
import { useStore } from "vuex";
import * as Cesium from "cesium";

export default defineComponent({
    components: { CesiumContainer },
    setup() {
        const store = useStore();
        const addLabelCovered = () => {
            const { viewer } = store.state;
            viewer.scene.globe.depthTestAgainstTerrain = true; // 开启地形深度探测

            const labelCol = viewer.scene.primitives.add(new Cesium.LabelCollection());
            let oneLabel = labelCol.add({
                position: Cesium.Cartesian3.fromDegrees(109.08, 30.94),
                text: "Philadelphia",
            });
            let rectangleCollisionCheck = new Cesium.RectangleCollisionChecker();
            //1、
//oneLabel的中心点，在屏幕坐标系下的坐标
//其中，默认中心点是在文字左下角
//可以通过horizontalOrigin、verticalOrigin这2个参数来改变中心点在文字的左下角还是右上角
let ssPos = oneLabel.computeScreenSpacePosition(viewer.scene);
 
 //2、
 //拿到label对象中所有文字，在屏幕坐标系中占据的矩形大小
 let boundingRectangle = Cesium.Label.getScreenSpaceBoundingBox(
 oneLabel,
  ssPos
 );
  
 //3、
 //boundingRectangle转换为Rectangle
 //此时计算的Rectangle，并不是真实的wgs84坐标系
 //其本质还是屏幕坐标系，只是在形式上转换为Rectangle类型
 //这样方便rectangleCollisionCheck类的使用
 let { x, y, width, height } = boundingRectangle;
 const west = x;
 const south = y;
 const east = x + width;
 const north = y + height;
 const rectangle = new Cesium.Rectangle(west, south, east, north);
 //判断步骤3中计算的矩形，与“矩形集合”中的其他矩形是否相交
let isCollide = rectangleCollisionCheck.collides(rectangle)
if (isCollide) {
  //和集合中的其他rectangle有交集    
  oneLabel.show = false;
  continue;
} else {
  //和集合中的其他rectangle没有交集
  oneLabel.show = true;
  rectangleCollisionCheck.insert(id, rectanglePretend);//当前rectangle添加进矩形集合
}

viewer.camera.moveEnd.addEventListener(function () {
    //rectangleCollisionCheck._tree.clear();
    //重新进行上述3、4、5的步骤
})
        };
        const handleClear = () => {
            const { viewer } = store.state;
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
            addLabelCovered,
        };
    }
});  
</script>