import * as Cesium from "cesium";
// function WaterPrimitive(options) {
//     const { positions, height, extrudedHeight, alpha, scene } = options;
//     this._positions = positions;
//     this._height = height;
//     this._extrudedHeight = extrudedHeight;
//     this._alpha = alpha;
//     this._scene = scene;
//     Object.defineProperty(this, "extrudedHeight", {
//         get() {
//             return this._extrudedHeight;
//         },
//         set(newVal) {
//             if (Object.prototype.toString.call(newVal) !== "[object Number]") return;
//             if (this._primitive) {
//                 this._primitive._state = 3;
//                 this._primitive._appearance = undefined;
//                 if(this._primitive.geometryInstances.geometry){
//                     this._primitive.geometryInstances.geometry=null;
//                 }
//                 this._extrudedHeight = newVal;
//                 this._primitive.geometryInstances.geometry = this.getGeometry();
              
//             }
//         }
//     });
//     this.init();
// }

// WaterPrimitive.prototype.getGeometry = function () {
//     return new Cesium.PolygonGeometry({
//         polygonHierarchy: new Cesium.PolygonHierarchy(this._positions),
//         height: this._height,
//         extrudedHeight: this._extrudedHeight,
//         vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
//     });
// };

// WaterPrimitive.prototype.update = function (context, frameState, commandList) {
//     if (this._primitive) {
//         let primitive = this._primitive;
//         primitive.update(context, frameState, commandList);
//     }
// };

// // WaterPrimitive.prototype.update = function (context) {
// //     let frameState = context.context;
// //     let commandList = context.commandList;
// //     if (this._primitive && frameState && commandList && commandList.length > 0) {
// //         let primitive = this._primitive;
// //         primitive.update(frameState, context, commandList);
// //     }
// // };

// WaterPrimitive.prototype.destroy = function () {
//     let primitive = this._primitive;
//     primitive.destroy()
// }

// WaterPrimitive.prototype.init = function () {
//     let geometry = this.getGeometry();
//     console.log(geometry);
//     if (!geometry) return;
//     this._primitive = new Cesium.Primitive({
//         releaseGeometryInstances: false,
//         geometryInstances: new Cesium.GeometryInstance({
//             geometry
//         }),
//         asynchronous: false,
//         appearance: new Cesium.EllipsoidSurfaceAppearance({
//             show: true,
//             aboveGround: false,
//             material: new Cesium.Material({
//                 fabric: {
//                     type: "Water",
//                     uniforms: {
//                         // normalMap:  '/src/assets/images/waterNormals.jpg',
//                         normalMap:  '../../src/assets/images/waterNormals.jpg',
//                         frequency: 1000.0,
//                         animationSpeed: 0.01,
//                         amplitude: 5.0
//                     }
//                 }
//             }),
// //                 fragmentShaderSource: `
// //     varying vec3 v_positionMC;
// //     varying vec3 v_positionEC;
// //     varying vec2 v_st;
// //     void main()
// //     {
// //       czm_materialInput materialInput;
// //      vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));
// //       #ifdef FACE_FORWARD
// //         normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
// //       #endif
// //       materialInput.s = v_st.s;
// //       materialInput.st = v_st;
// //       materialInput.str = vec3(v_st, 0.0);
// //       materialInput.normalEC = normalEC;
// //       materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);
// //       vec3 positionToEyeEC = -v_positionEC;
// //       materialInput.positionToEyeEC = positionToEyeEC;
// //       czm_material material = czm_getMaterial(materialInput);
// //       #ifdef FLAT
// //         gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
   
// //       #else
// //       #endif
// //     //     // gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
// //     //     gl_FragColor = czm_phong(normalize(positionToEyeEC), material);
// //     //     gl_FragColor.a = ${this._alpha};
// //     //   #endif  
// //     gl_FragColor = czm_phong(normalize(positionToEyeEC), material); 
// //     }
// //   `
//         })
//     });
// };

// export default WaterPrimitive

import waternormolsIMG from '../assets/images/waterNormals.jpg'
function WaterPrimitive(options) {
    const { positions, height, extrudedHeight, alpha } = options;
    this._positions = positions;
    this._height = height;
    this._extrudedHeight = extrudedHeight;
    this._alpha = alpha;
    Object.defineProperty(this, "extrudedHeight", {
        get() {
            return this._extrudedHeight;
        },
        set(newVal) {
            if (Object.prototype.toString.call(newVal) !== "[object Number]") return;
            if (this._primitive) {
                this._primitive._state = 3;
                this._primitive._appearance = undefined;
                if(this._primitive.geometryInstances.geometry){
                    this._primitive.geometryInstances.geometry=null;
                }
                this._extrudedHeight = newVal;
                this._primitive.geometryInstances.geometry = this.getGeometry();
              
            }
        }
    });
    this.init();
}

WaterPrimitive.prototype.getGeometry = function () {
    return new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(this._positions),
        height: this._height,
        extrudedHeight: this._extrudedHeight,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    });
};

WaterPrimitive.prototype.update = function (context, frameState, commandList) {
    if (this._primitive) {
        let primitive = this._primitive;
        primitive.update(context, frameState, commandList);
    }
};

WaterPrimitive.prototype.destroy = function () {
    let primitive = this._primitive;
    primitive.destroy()
}

WaterPrimitive.prototype.init = function () {
    let geometry = this.getGeometry();
    console.log(geometry);
    if (!geometry) return;
    this._primitive = new Cesium.Primitive({
        releaseGeometryInstances: false,
        geometryInstances: new Cesium.GeometryInstance({
            geometry
        }),
        asynchronous: false,
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            show: true,
            aboveGround: false,
            material: new Cesium.Material({
                fabric: {
                    type: "Water",
                    uniforms: {
                        baseWaterColor: new Cesium.Color(
                            64 / 255.0,
                            157 / 255.0,
                            253 / 255.0,
                            0.5
                        ),
                        // normalMap:  '/src/assets/images/waterNormals.jpg',
                        // normalMap:  '../assets/images/waterNormals.jpg',
                        normalMap: waternormolsIMG,
                        frequency: 1000.0, //波的数量
                        animationSpeed: 0.01, //水震动的速度
                        amplitude: 5.0 //振幅大小
                    }
                }
            }),
//                 fragmentShaderSource: `
//     varying vec3 v_positionMC;
//     varying vec3 v_positionEC;
//     varying vec2 v_st;
//     void main()
//     {
//       czm_materialInput materialInput;
//      vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));
//       #ifdef FACE_FORWARD
//         normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
//       #endif
//       materialInput.s = v_st.s;
//       materialInput.st = v_st;
//       materialInput.str = vec3(v_st, 0.0);
//       materialInput.normalEC = normalEC;
//       materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);
//       vec3 positionToEyeEC = -v_positionEC;
//       materialInput.positionToEyeEC = positionToEyeEC;
//       czm_material material = czm_getMaterial(materialInput);
//       #ifdef FLAT
//         gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
   
//       #else
//       #endif
//     //     // gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
//     //     gl_FragColor = czm_phong(normalize(positionToEyeEC), material);
//     //     gl_FragColor.a = ${this._alpha};
//     //   #endif  
//     gl_FragColor = czm_phong(normalize(positionToEyeEC), material); 
//     }
//   `
        })
    });
};

export default WaterPrimitive