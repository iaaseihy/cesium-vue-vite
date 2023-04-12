/*
 * @Author: iaaseihy 774249302@qq.com
 * @Date: 2023-02-10 10:23:35
 * @LastEditors: iaaseihy 774249302@qq.com
 * @LastEditTime: 2023-02-10 10:25:24
 * @FilePath: \cesium-vue-master\src\components\commonJS\visibleBetweenTwoPoints.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as Cesium from 'cesium'
private sightline(startWorldPoint: Cesium.Cartesian3,
    endWorldPoint: Cesium.Cartesian3):Cesium.Cartesian3{
    let barrierPoint:Cesium.Cartesian3 = Cesium.Cartesian3.ZERO;
    // const startWorldPoint = pickCartesian(this.viewer,startPoint).cartesian;
    // const endWorlePoint = pickCartesian(this.viewer,endPoint).cartesian;
    // console.log("start:" +startWorldPoint )
    // console.log("end:" +endWorlePoint )
    const startPoint = convertCartesian3ToCartesian2(this.viewer,startWorldPoint);
    const endPoint = convertCartesian3ToCartesian2(this.viewer,endWorldPoint);
    const worldLength = calculateSpatialDistance(startWorldPoint,endWorldPoint);
    const windowLength = calculateWindowDistance(startPoint,endPoint);
    const worldInterval = worldLength/100.0;
    const windowInterval = windowLength/100.0;
    for(let i = 1; i< 100; i++){
      const tempWindowPoint = findWindowPositionByPixelInterval(startPoint,endPoint,windowInterval*i);
      const tempPoint = findCartesian3ByDistance(startWorldPoint,endWorldPoint,worldInterval * i);
      const surfacePoint = pickCartesian(this.viewer,tempWindowPoint);
 
      const tempRad = Cesium.Cartographic.fromCartesian(tempPoint);
      const surfaceRad = Cesium.Cartographic.fromCartesian(surfacePoint.cartesian);
               
      if(surfaceRad.height >  tempRad.height){
        barrierPoint = tempPoint;
        break;
      }
    }
    return barrierPoint;
  }
 
export function convertCartesian3ToCartesian2(viewer:Cesium.Viewer,position:Cesium.Cartesian3):Cesium.Cartesian2{
  return Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene,position)
}
 
export function calculateSpatialDistance(
  startPoint: Cesium.Cartesian3,
  endPoint: Cesium.Cartesian3
):number{
  return Math.sqrt(Math.pow(endPoint.x - startPoint.x,2) + Math.pow(endPoint.y - startPoint.y,2) +Math.pow(endPoint.z - startPoint.z,2) );
}
 
export function calculateWindowDistance(startPoint: Cesium.Cartesian2,endPoint: Cesium.Cartesian2):number{
  return Math.sqrt(Math.pow(endPoint.y - startPoint.y,2) + Math.pow(endPoint.x - startPoint.x,2));
}
 
export function findWindowPositionByPixelInterval(startPosition:Cesium.Cartesian2,endPosition:Cesium.Cartesian2,interval:number):Cesium.Cartesian2{
  const result = new Cesium.Cartesian2(0,0);
  const length = Math.sqrt(Math.pow(endPosition.x - startPosition.x,2) + Math.pow(endPosition.y - startPosition.y,2));
  if(length< interval){
    return result;
  }else{
    const x = (interval/length)*(endPosition.x - startPosition.x) + startPosition.x;
    //alert(interval/length)
    const y = (interval/length)*(endPosition.y - startPosition.y) + startPosition.y;
    result.x = x;
    result.y = y;
  }
  return result;
}
 
export function findCartesian3ByDistance(startPosition:Cesium.Cartesian3,endPosition:Cesium.Cartesian3,interval:number):Cesium.Cartesian3{
  const result = new Cesium.Cartesian3(0,0,0);
  const length = Math.sqrt(Math.pow(endPosition.z-startPosition.z,2)+Math.pow(endPosition.x - startPosition.x,2) + Math.pow(endPosition.y - startPosition.y,2));
  if(length< interval){
    return result;
  }else{
    const x = (interval/length)*(endPosition.x - startPosition.x) + startPosition.x;
    //alert(interval/length)
    const y = (interval/length)*(endPosition.y - startPosition.y) + startPosition.y;
    const z = (interval/length)*(endPosition.z - startPosition.z) + startPosition.z;
    result.x = x;
    result.y = y;
    result.z = z;
  }
  return result;
}
 
export function pickCartesian(viewer:Cesium.Viewer,windowPosition:Cesium.Cartesian2):PickResult{
  //根据窗口坐标，从场景的深度缓冲区中拾取相应的位置，返回笛卡尔坐标。
  const cartesianModel = viewer.scene.pickPosition(windowPosition); 
  //场景相机向指定的鼠标位置（屏幕坐标）发射射线
  const ray = viewer.camera.getPickRay(windowPosition);
  //获取射线与三维球相交的点（即该鼠标位置对应的三维球坐标点，因为模型不属于球面的物体，所以无法捕捉模型表面）
  const cartesianTerrain = viewer.scene.globe.pick(ray,viewer.scene);
 
  const result = new PickResult();
  if(typeof(cartesianModel) !== 'undefined' && typeof(cartesianTerrain) !== 'undefined'){
    result.cartesian = cartesianModel || cartesianTerrain;
    result.CartesianModel = cartesianModel;
    result.cartesianTerrain = cartesianTerrain as Cesium.Cartesian3;
    result.windowCoordinates = windowPosition.clone();
    //坐标不一致，证明是模型，采用绝对高度。否则是地形，用贴地模式。
    result.altitudeMode = cartesianModel.z.toFixed(0) !== cartesianTerrain!.z.toFixed(0) ? Cesium.HeightReference.NONE:Cesium.HeightReference.CLAMP_TO_GROUND;
  }
  return result;
}

function sightline(startWorldPoint: any, Cartesian3: typeof Cesium.Cartesian3, endWorldPoint: any, Cartesian3: typeof Cesium.Cartesian3) {
  throw new Error('Function not implemented.');
}


function startWorldPoint(startWorldPoint: any, Cartesian3: typeof Cesium.Cartesian3, endWorldPoint: any, Cartesian3: typeof Cesium.Cartesian3) {
  throw new Error('Function not implemented.');
}


function endWorldPoint(startWorldPoint: any, Cartesian3: typeof Cesium.Cartesian3, endWorldPoint: any, Cartesian3: typeof Cesium.Cartesian3) {
  throw new Error('Function not implemented.');
}
