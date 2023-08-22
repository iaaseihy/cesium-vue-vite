/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-08-15 17:20:48
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-16 16:41:21
 */
import * as Cesium from 'cesium';
// import pyramidFrag from './pyramid.frag.glsl'
// import pyramidVert from './pyramid.vert.glsl'
export default class PyramidGeometry {
    constructor() {
        this.drawCommand = null;
        this.fragTexture = null;
        this._image = null;
    }

    // 创建 绘制命令
    createDrawCommand(context) {
        let vs = this.creaateVertexShader();
        let fs = this.createFragmentShader();
        let geometry = this.createAnPyramidGeometry()

        let vertexArray = Cesium.VertexArray.fromGeometry({
            context: context,
            geometry: geometry,
            attributeLocations: Cesium.GeometryPipeline.createAttributeLocations(geometry),
        });
        let vertexShaderSource = new Cesium.ShaderSource({
            sources: [vs]
        });
        let fragmentShaderSource = new Cesium.ShaderSource({
            sources: [fs]
        });
        let uniformMap = {
            wenli: () => {
                if (Cesium.defined(this.fragTexture)) {
                    return this.fragTexture;
                } else {
                    return context.defaultTexture;
                }
            }
        }

        // let uniformMap = {
        //     wenli() {
        //         return Cesium.Color.BISQUE
        //     }
        // }
        let shaderProgram = Cesium.ShaderProgram.fromCache({
            context: context,
            vertexShaderSource: vertexShaderSource,
            fragmentShaderSource: fragmentShaderSource,
            attributeLocations: Cesium.GeometryPipeline.createAttributeLocations(geometry),
        })

        // let uniformMap = {}

        let renderState = Cesium.RenderState.fromCache({
            depthTest: {
                flat: true,
            }
        })

        this.drawCommand = new Cesium.DrawCommand({
            vertexArray: vertexArray,
            shaderProgram: shaderProgram,
            uniformMap: uniformMap,
            renderState: renderState,
            pass: Cesium.Pass.OPAQUE
        })

    }
    //创建顶点着色器
    creaateVertexShader() {
        var vertexShader =
            `
        // attribute vec3 position3DHigh;
        // attribute vec3 position3DLow;
        // attribute float batchId;
        in vec3 position;
        in vec2 st;
        out vec2 v_st;
        out vec4 vFragColor;
        void main() {
            float upLimit = 0.3;
            float ty = abs(cos(czm_frameNumber * 0.03)) * upLimit;
            mat4 translateY = mat4(1, 0, 0, 0, 0, 1, 0, ty, 0, 0, 1, 0, 0, 0, 0, 1);
            v_st = st;
            gl_Position = czm_projection * czm_modelView * vec4(position, 1.0) * translateY;
        }
        `;
        return vertexShader;
    }
    //创建片源着色器
    createFragmentShader() {
        var fragmentShader =
            `
    in vec2 v_st; //纹理坐标 一般是从顶点着色器中传递过来
        out vec4 fragColor;
        uniform sampler2D wenli; // 声明sampler2D 的纹理数据常量
    void main(){
        // texture2D函数 意味着 在v_st的坐标上 对 wenli 图片进行采样（白话就是：读该位置的rgba值 同时返回）
        // fragColor = texture(wenli,v_st);
        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    `;
        return fragmentShader;
    }
    //创建纹理
    createTexture(context) {
        if (this._image == null) {
            this._image = new Image()
            this._image.src = '../../../../../public/static/texture/color3.png'
            let that = this
            this._image.onload = function (img) {
                let vTexture = new Cesium.Texture({
                    context: context,
                    source: img
                });
                that.fragTexture = vTexture
            }
        }
    }

    // 生成一个四棱锥的geometry
    createAnPyramidGeometry() {
        //  处理 顶点数据
        let positions = []
        let indices = []
        let st = [
            0.5, 0.5,
            0.0, 1.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 0.0
        ]
        let __GROUND_HEIGHT = 600
        let __BASE_HEIGHT = 900
        let center = [104.0752, 30.6077]
        let point1 = vector2Add(center, [-0.002, 0.002])
        let point2 = vector2Add(center, [0.002, 0.002])
        let point3 = vector2Add(center, [-0.002, -0.002])
        let point4 = vector2Add(center, [0.002, -0.002])

        // this.centerPos = new Float32Array(...transformPos(center, __GROUND_HEIGHT))

        positions.push(...transformPos(center, __GROUND_HEIGHT), ...transformPos(point1, __BASE_HEIGHT), ...transformPos(point2, __BASE_HEIGHT), ...transformPos(point3, __BASE_HEIGHT), ...transformPos(point4, __BASE_HEIGHT))
        console.log('positions: ', positions);
        this.leftTopPos = new Cesium.Cartesian3(...transformPos(point1, __BASE_HEIGHT));

        indices = [
            0, 1, 2,
            0, 1, 3,
            0, 3, 4,
            0, 2, 4,
            1, 2, 3,
            2, 3, 4
        ]

        function vector2Add(vec1, vec2) {
            return [vec1[0] + vec2[0], vec1[1] + vec2[1]]
        }

        // 经纬度高转换为世界坐标
        function transformPos(lonlat, height) {
            let pos = Cesium.Cartesian3.fromDegrees(lonlat[0], lonlat[1], height)
            return [pos.x, pos.y, pos.z]
        }

        //  必要明确的告诉 框架 去怎么样 处理 你提供进去的数据.
        let geometry = new Cesium.Geometry({
            //  告诉cesium 你需要怎样读 数组里面的内容
            attributes: {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: new Float32Array(positions)
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: new Float32Array(st)
                })
            },
            indices: indices,
            boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
        })
        return geometry
    }
    update(frameState) {
        if (this.drawCommand === null) {
            this.createDrawCommand(frameState.context)
        }
        if (this.fragTexture === null) {
            this.createTexture(frameState.context)
        }
        frameState.commandList.push(this.drawCommand);
    }
}


