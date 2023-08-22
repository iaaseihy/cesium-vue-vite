attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute float batchId;
attribute vec3 position;
void main() {
    float upLimit = 0.3;
    float ty = abs(cos(czm_frameNumber * 0.03)) * upLimit;
    mat4 translateY = mat4(1, 0, 0, 0, 0, 1, 0, ty, 0, 0, 1, 0, 0, 0, 0, 1);
    gl_Position = czm_projection * czm_modelView * vec4(position, 1.0) * translateY;
}
