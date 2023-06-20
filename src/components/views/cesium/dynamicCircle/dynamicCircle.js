const DynamicCircle = `
uniform sampler2D colorTexture;    //颜色纹理
uniform sampler2D depthTexture;    //深度纹理
in vec2 v_textureCoordinates; //纹理坐标
out vec4 fragColor;
uniform vec4 u_scanCenterEC;       //扫描中心
uniform vec3 u_scanPlaneNormalEC;  //扫描平面法向量
uniform float u_radius;            //扫描半径
uniform vec4 u_scanColor;          //扫描颜色

// 根据二维向量和深度值 计算距离camera的向量
vec4 toEye(in vec2 uv, in float depth) {
    vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));
    // 看看源码中关于此函数的解释是，cesium系统自动生成的4*4的反投影变换矩阵
    // 从clip坐标转为眼睛坐标，clip坐标是指顶点着色器的坐标系统gl_position输出的
    vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
    posInCamera = posInCamera / posInCamera.w; //将视角坐标除深度分量
    return posInCamera;
}

// 点在平面上的投影，输入参数为 平面法向量，平面起始点，测试点
vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point) {
    // 计算测试点与平面起始点的向量
    vec3 v01 = point - planeOrigin;
    // 平面法向量与 测试点与平面上的点 点积  点积的几何意义，b在a上的投影长度，
    // 即v01在平面法向量上的长度
    float d = dot(planeNormal, v01);
    // planeNormal * d 即为v01在平面法向量上的投影向量
    // 根据三角形向量相加为0的原则 即可得点在平面上的投影
    return (point - planeNormal * d);
}

// 获取深度值，根据纹理坐标获取深度值
float getDepth(in vec4 depth) {
    float z_window = czm_unpackDepth(depth);  //源码解释将一个vec4向量还原到0，1内的一个数
    z_window = czm_reverseLogDepth(z_window); // czm_reverseLogDepth解开深度
    float n_range = czm_depthRange.near;      //
    float f_range = czm_depthRange.far;
    return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
}

void main() {
    fragColor = texture(colorTexture, v_textureCoordinates);          //片元颜色
    float depth = getDepth(texture(depthTexture, v_textureCoordinates)); //根据纹理获取深度值
    vec4 viewPos = toEye(v_textureCoordinates, depth);                     //根据纹理坐标和深度值获取视点坐标
    // 点在平面上的投影，平面法向量，平面中心，视点坐标
    vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
    // 计算投影坐标到视点中心的距离
    float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
    // 如果在扫描半径内，则重新赋值片元颜色
    if (dis < u_radius) {
        // 计算与扫描中心的距离并归一化
        float f = dis / u_radius;
        // 原博客如下，实际上可简化为上式子
        // float f = 1.0 -abs(u_radius - dis) / u_radius;
        // 四次方
        f = pow(f, 2.0);
        // mix(x, y, a): x, y的线性混叠， x(1-a)  y*a;,
        // 效果解释：在越接近扫描中心时，f越小，则片元的颜色越接近原来的，相反则越红
        fragColor = mix(fragColor, u_scanColor, f);
    }
}
`

export function createDynamicCircleStage(viewer, Cesium, cartographicCenter, maxRadius, scanColor, duration) {
    // 中心点
    var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
    var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

    // 中心点垂直高度上升500m的坐标点，目的是为了计算平面的法向量
    var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
    var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
    var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

    // 当前时间
    var _time = (new Date()).getTime();

    // 转换成相机参考系后的中心点，上升高度后的中心点以及平面法向量
    var _scratchCartesian4Center = new Cesium.Cartesian4();
    var _scratchCartesian4Center1 = new Cesium.Cartesian4();
    var _scratchCartesian3Normal = new Cesium.Cartesian3();

    // 自定义PostProcessStage
    var dynamicCircle = new Cesium.PostProcessStage({
        fragmentShader: DynamicCircle,
        uniforms: {
            // 将中心点坐标转化到相机参考系
            u_scanCenterEC: function () {
                return Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
            },
            // 计算相机参考系下的平面法向量
            u_scanPlaneNormalEC: function () {
                var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                _scratchCartesian3Normal.x = temp1.x - temp.x;
                _scratchCartesian3Normal.y = temp1.y - temp.y;
                _scratchCartesian3Normal.z = temp1.z - temp.z;

                Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                return _scratchCartesian3Normal;
            },
            // 动态半径
            u_radius: function () {
                return maxRadius * (((new Date()).getTime() - _time) % duration) / duration;
            },
            u_scanColor: scanColor
        }
    });
    return dynamicCircle;
}
