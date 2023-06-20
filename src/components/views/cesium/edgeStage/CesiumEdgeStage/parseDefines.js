
export function parseDefines(shader) {
    let defines = [];
    for (const key in shader.defines) {
        if (shader.defines.hasOwnProperty(key)) {
            const val = shader.defines[key];
            defines.push('#define ' + key + ' ' + val)
        }
    }
    defines = defines.join('\n') + "\n"
    if (shader.fragmentShader) {
        shader.fragmentShader = defines + shader.fragmentShader;
    }
    if (shader.vertexShader) {
        shader.vertexShader = defines + shader.vertexShader;
    }
    return shader;
}