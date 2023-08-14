import * as Cesium from 'cesium';
class ImageryThemeGL {
    /**
     *
     * @param {{
     *  name: string
     *  bgColor?: Cesium.Color
     *  alpha?: number
     *  invert?: boolean
     *  preMultiplyAlpha?: boolean
     * }} options
     */
    constructor(options) {
        // super(options);
        const params = options,
            { defaultValue, Color } = Cesium;
        this.bgColor = defaultValue(params.bgColor, Color.TRANSPARENT);
        this.alpha = defaultValue(params.alpha, 1);
        this.invert = defaultValue(params.invert, false);
        this.preMultiplyAlpha = defaultValue(params.preMultiplyAlpha, true);

        var scope = this;
        this.shaders = {
            // bgFS: '这里贴背景处理的shader代码',
            // mainFS: `这里贴处理瓦片图像的shader代码`,
            bgFS: `uniform sampler2D u_map;
            uniform vec4 u_bgColor;
            out vec4 fragColor;    
            in vec2 v_textureCoordinates;
            void main(){
                vec2 uv = v_textureCoordinates;
                vec4 bgColor = u_bgColor;
                vec4 color = texture( u_map , uv );
                if( color.a > 0. ){
                    fragColor = bgColor;
                }
            }`,
            mainFS: `uniform sampler2D u_map;
            uniform bool u_invert;
            uniform float u_alpha;
            out vec4 fragColor;
            in vec2 v_textureCoordinates;
            void main(){
                vec2 uv = v_textureCoordinates;
                vec4 color = texture( u_map , uv );
                //计算灰度
                float grayVal =( color.r + color.g + color.b ) / 3.;、
                //灰度反转
                if(u_invert){
                    grayVal = 1. - grayVal;
                }
                //应用前景透明度，以便和背景混合
                float alpha = color.a * u_alpha;
                fragColor=vec4( vec3( grayVal ) , alpha );
            }`,
            uniformMap: {
                u_invert() {
                    return this.invert;
                },
                u_alpha() {
                    return this.alpha;
                },
                u_bgColor() {
                    return this.bgColor;
                },
            },
        };
    }

    /**
     *
     * @param {Cesium.Context} context
     * @param {Cesium.Texture} texture
     * @returns {Cesium.Texture}
     */
    processTexture(context, texture) {
        const { params, shaders } = this;
        const sampler = texture.sampler;
        const {
            Texture,
            PixelFormat,
            PixelDatatype,
            WebGLConstants,
            Framebuffer,
            RenderState,
            BlendingState,
            Color,
            defined,
        } = Cesium;

        //创建处理后的瓦片贴图，作为RTT的目标纹理
        var textureProcessed = new Texture({
            context: context,
            pixelFormat: PixelFormat.RGBA,
            pixelDatatype: PixelDatatype.UNSIGNED_BYTE,
            sampler: sampler,
            width: texture.width,
            height: texture.height,
            flipY: texture.flipY,
            target: WebGLConstants.TEXTURE_2D,
            // preMultiplyAlpha: params.preMultiplyAlpha,
            preMultiplyAlpha: this.preMultiplyAlpha,
        });
        var framebuffer = new Framebuffer({
            context: context,
            colorTextures: [textureProcessed],
            destroyAttachments: false,
        });
        const renderState = RenderState.fromCache({
            depthTest: {
                enabled: false,
            },
            // blending: params.preMultiplyAlpha
            //     ? BlendingState.PRE_MULTIPLIED_ALPHA_BLEND
            //     : BlendingState.ALPHA_BLEND,
            blending: this.preMultiplyAlpha
                ? BlendingState.PRE_MULTIPLIED_ALPHA_BLEND
                : BlendingState.ALPHA_BLEND,
            viewport: {
                x: 0,
                y: 0,
                width: texture.width,
                height: texture.height,
            },
        });

        //传递原始瓦片贴图
        shaders.uniformMap.u_map = function () {
            return texture;
        };

        //画背景
        if (!Color.equals(this.bgColor, Color.TRANSPARENT)) {
            var bgCommand = context.createViewportQuadCommand(shaders.bgFS, {
                framebuffer: framebuffer,
                renderState: renderState,
                uniformMap: shaders.uniformMap,
            });
            bgCommand.execute(context);
        }

        //瓦片加工
        var mainCommand = context.createViewportQuadCommand(shaders.mainFS, {
            framebuffer: framebuffer,
            renderState: renderState,
            uniformMap: shaders.uniformMap,
        });
        mainCommand.execute(context);

        framebuffer.destroy();
        texture.destroy();

        return textureProcessed;
    }
}

export default ImageryThemeGL;