export default {
  isPointInPolygon(point, ring) {
    // 基于射线法原理，判断交点数量
    let intersects = 0
    // 面的顶点数量
    const vert_count = ring.length
    for (let i = 1; i < vert_count; i++) {
      const segment = [ring[i - 1], ring[i]]
      // 点必须在以segment为对角线的面内，否则一定是和 线没有交点
      if (point[1] < Math.min(segment[0][1], segment[1][1])) { continue }
      if (point[1] > Math.max(segment[0][1], segment[1][1])) { continue }
      // 点如果在ring边界上，证明点不在ring内部
      if (this.segmentContains(segment[0], segment[1], point)) {
        return 0
      }
      // 边平行，既边是水平的，线段起点终点y坐标相等 特殊情况跳过
      if (segment[0][1] === segment[1][1]) { continue }
      // 求相交点x坐标 水平射线向右，y轴都相等，不用计算。
      const x = (point[1] - segment[0][1]) * (segment[1][0] - segment[0][0]) / (segment[1][1] - segment[0][1]) + segment[0][0]
      // 交点x坐标应该大于point射线起点的坐标，因为射线向右
      if (x <= point[0]) { continue }
      // 如果相交点如果与线段segment的起点重合
      if (x === segment[0][0] && point[1] === segment[0][1]) {
        if (point[1] > segment[1][1]) { intersects++ }
      }
      // 如果相交点如果与线段segment的终点重合
      else if (x === segment[1][0] && point[1] === segment[1][1]) {
        if (point[1] > segment[0][1]) { intersects++ }
      } else {
        intersects++
      }
    }
    // 穿越次数是奇数，点在面内
    if (intersects % 2 === 1) { return 1 }
    return 0
  },

  // 点在线段上算法，两点保证：1 c在ab的线上 2 c不在ab线的延长线上
  segmentContains(a, b, c) {
    var i
    // +() 强转数字，等同于Number()，意思是共线的时候，如果x轴相同，就仅仅将y的值参与计算，否则，仅仅比较x值就可以了
    i = +(a[0] === b[0])
    const p = a[i]
    return this.collinear(a, b, c) && this.within(p, c[i], b[i])
  },
  // 三点共线，保证点在线上
  collinear(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) === (c[0] - a[0]) * (b[1] - a[1])
  },

  // 保证点不在线的延长线上
  within(p, q, r) {
    return p <= q && q <= r || r <= q && q <= p
  }
}

// const ring = [
//   [118, 32],
//   [119, 32],
//   [119, 33],
//   [120, 33],
//   [120, 34],
//   [118, 34],
//   [118, 32]
// ]
// const A = [117, 33]; const B = [118.5, 33]; const C = [118.5, 33.5]; const D = [119, 32]; const E = [119, 32.5]
// // A点在左侧外部
// console.log(isPointInPolygon(A, ring)) // 0
// // B点在内部，穿过顶点，穿过边线延长线
// console.log(isPointInPolygon(B, ring)) // 1
// // C点在内部，正常
// console.log(isPointInPolygon(C, ring)) // 1
// // D点穿过顶点
// console.log(isPointInPolygon(D, ring)) // 0
// // E点在边线上
// console.log(isPointInPolygon(E, ring)) // 0
