// varying vec2 v_st; //纹理坐标 一般是从顶点着色器中传递过来
// uniform sampler2D wenli; // 声明sampler2D 的纹理数据常量
// out vec4 glFragColor;
void main(){
	// texture2D函数 意味着 在v_st的坐标上 对 wenli 图片进行采样（白话就是：读该位置的rgba值 同时返回）
	// glFragColor = texture(wenli,v_st);
    gl_FragColor = vec4(1.0, 1.0, 0.0,1.0)
}
