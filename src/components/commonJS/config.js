/**
 * 系统配置文件：包含数据的分类、名称、文件路径等
 */
import { Cesium3DTileStyle } from 'cesium'
/**
 * 影像配置路径
 */
// 本地全球影像
// export const LOCAL_IMG_URL = 'http://localhost:6060/Data/BASE_DATA/bijiangquTileset/{z}/{x}/{y}.png'
export const LOCAL_IMG_URL = 'http://localhost:6060/Data/BASE_DATA/yuhuatai19/{z}/{x}/{y}.png'
// 在线谷歌影像
export const GOOGLE_IMG_URL = 'http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali'
// 在线天地图矢量影像
export const TDT_VEC_IMG_URL = 'http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=f5bb12c6cae196cd462140e3a1bccddd'
// 在线天地图标注
export const TDT_CVA_IMG_URL = 'http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=f5bb12c6cae196cd462140e3a1bccddd'
// 在线高德影像
export const GAODE_IMG_URL = 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
// 在线ARCGIS影像
export const ARCGIS_IMG_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
// 在线必应影像
export const BING_IMG_URL = 'https://dev.virtualearth.net'

/**
 * 地形配置路径
 */
export const LOCAL_TERRAIN_URL = 'http://localhost:6060/Data/TERRAIN'// 本地全球dem

// 倾斜摄影
export const DAYANTA3DTILES = 'http://localhost:6060/Data/dayanta3dtiles/tileset.json' // 大雁塔倾斜摄影

// 白膜
export const BAIMO3DTILES = 'http://localhost:6060/Data/BAIMO/building/tileset.json' // 白膜

/**
 * 默认分类单体模型样式设置
 */
export const DEFAULT_CLASSIF_MODEL_STYLE = new Cesium3DTileStyle({
  color: "color('green', 0.5)"
})
/**
 * 加载的分类单体数据路径
 */
export const CLASSIF_MODEL_URLS = [
  // 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0001/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0002/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0003/tileset.json',

  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0001/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0002/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0003/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0004/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0005/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0006/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0007/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0008/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0009/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0010/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0011/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0012/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0013/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0014/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0015/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0016/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0017/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0018/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0019/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0020/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0021/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0022/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0044/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0045/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0046/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0047/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0054/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0055/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0056/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0057/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0058/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0059/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0060/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0061/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0062/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0063/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0064/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0065/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0066/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0067/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0068/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0069/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0070/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0071/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0072/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0073/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0074/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0075/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0076/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0077/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0104/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0105/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0106/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0107/tileset.json',
  // 'http://192.168.100.159:8080/Data/SWDJ/320412/001013GB00858/FL/0108/tileset.json',
]
/**
 * 加载的分类单体数据户号字段
 */
export const FL_ROOMID_FIELD = 'roomid'
export const FL_FLOOR_FIELD = 'floor'// 分类单体模型查询楼层的字段
/**
 * 移动端显示户型路径
 */
export const MOBILE_URL = 'http://47.111.250.87:8080/demo0609/Household1.html?BDCBH=F00130105'
/**
 * 宿迁相关配置
 */
// 界址点、界址线json路径
export const SUQIAN_JZD_JSONURL = [
  'http://192.168.100.159:8080/Data/SWDJ/321302/ZD/JSON/001013GB00858_JZD_up.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/ZD/JSON/001013GB00858_JZD_surface.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/ZD/JSON/001013GB00858_JZD_down.json'
]
export const SUQIAN_JZX_JSONURL = [
  'http://192.168.100.159:8080/Data/SWDJ/321302/ZD/JSON/001013GB00858_JZX_up.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/ZD/JSON/001013GB00858_JZX_surface.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/ZD/JSON/001013GB00858_JZX_down.json'
]
// 界址点、界址线文件名
export const SUQIAN_JZD_NAME = [
  '001013GB00858_JZD_up.json',
  '001013GB00858_JZD_surface.json',
  '001013GB00858_JZD_down.json'
]
export const SUQIAN_JZX_NAME = [
  '001013GB00858_JZX_up.json',
  '001013GB00858_JZX_surface.json',
  '001013GB00858_JZX_down.json'
]
// 界址点表格
export const SUQIAN_JZD_HTMLURL = 'http://192.168.100.159:8080/Data/SWDJ/321302/tem/table.html'
// 宿迁分类单体模型路径
export const SUQIAN_CLASSIF_MODEL_URLS = [
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0001/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0002/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0003/tileset.json'
  // 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0004/tileset.json'
]
// 宿迁分类单体模型样式(包括颜色、字段配置)
export const SUQIAN_CLASSIF_MODEL_STYLE_COLOR = [
  'rgba(255, 0, 0,0.6)',
  'rgba(255, 190, 190, 0.6)',
  'rgba(0, 0, 255, 0.6)'
]
export const SUQIAN_CLASSIF_MODEL_STYLE_FIELDS = [
  '${type} >= 3',
  '${type} >= 2',
  '${type} >= 1'
]
export const SUQIAN_CLASSIF_MODEL_STYLE = new Cesium3DTileStyle({
  color: {
    conditions: [
      [SUQIAN_CLASSIF_MODEL_STYLE_FIELDS[0], SUQIAN_CLASSIF_MODEL_STYLE_COLOR[0]], // 已备案
      [SUQIAN_CLASSIF_MODEL_STYLE_FIELDS[1], SUQIAN_CLASSIF_MODEL_STYLE_COLOR[1]], // 已签约
      [SUQIAN_CLASSIF_MODEL_STYLE_FIELDS[2], SUQIAN_CLASSIF_MODEL_STYLE_COLOR[2]], // 已登记
      // ['${type} >= 0', 'rgba(155, 0, 0,0.6)'],
      ['true', 'rgb(255, 0, 255)']
    ]
  }
})
// 宿迁产权模型路径
export const SUQIAN_CQ_MODEL_URLS = [
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0001/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0002/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0003/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0004/tileset.json'
]
// 宿迁实体模型路径
export const SUQIAN_ST_MODEL_URLS = [
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0001/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0002/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0003/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0004/tileset.json'
]
// 实体模型id集合
export const SUQIAN_ST_MODEL_ID = [
  'eastSide', 'middle', 'westSide', 'underground'
]
// 宿迁查询属性数据库地址和字段
export const SUQIAN_FL_ATTRIBUTE_FIELD = 'roomid'
export const SUQIAN_CQ_ATTRIBUTE_FIELD = 'name'
export const SUQIAN_FL_ATTRIBUTE_FLOOR_FIELD = 'floor'// 分类单体模型查询楼层的字段
export const SUQIAN_CQ_ATTRIBUTE_FLOOR_FIELD = 'IfcSpatialContainer'// 产权模型查询楼层的字段
export const SUQIAN_ST_ATTRIBUTE_FLOOR_FIELD = 'Floor'// 实体模型查询楼层的字段
export const SUQIAN_ATTRIBUTE_URL = 'http://192.168.100.162:5061/api/RealEstate/GetRealEstate?'
// 宿迁产权模型路径与实体模型路径对应表
export const SUQIAN_CQ_TO_ST_URLS = {
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0001/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0001/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0002/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0002/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0003/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0003/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0004/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0004/tileset.json'
}
// 宿迁分类模型路径与实体模型路径对应表
export const SUQIAN_FL_TO_ST_URLS = {
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0001/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0001/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0002/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0002/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0003/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0003/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0004/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0004/tileset.json'
}
// 宿迁分类模型路径与产权模型路径对应表
export const SUQIAN_FL_TO_CQ_URLS = {
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0001/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0001/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0002/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0002/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0003/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0003/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/FL/0004/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0004/tileset.json'
}
// 宿迁实体模型路径与产权模型路径对应表
export const SUQIAN_ST_TO_CQ_URLS = {
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0001/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0001/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0002/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0002/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0003/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0003/tileset.json',
  'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/ST/0004/tileset.json': 'http://192.168.100.159:8080/Data/SWDJ/321302/001013GB00858/CQ/0004/tileset.json'
}
/**
 * 昆山相关配置
 */
// 昆山分类单体模型路径
export const KUNSHAN_CLASSIF_MODEL_URLS = [
  'http://192.168.100.159:8080/Data/KunShan/KCGC_CQ_3/tileset.json'
]
// 昆山分类单体模型样式
export const KUNSHAN_CLASSIF_MODEL_STYLE = new Cesium3DTileStyle({
  color: {
    conditions: [
      ['${type} >= 3', 'rgba(255, 0, 0, 0.6)'], // 已备案
      ['${type} >= 2', 'rgba(0, 0, 255, 0.6)'], // 已签约
      ['${type} >= 1', 'rgba(255, 190, 190, 0.6)'], // 已登记
      // ['${type} >= 0', 'rgba(155, 0, 0,0.6)'],
      ['true', 'rgb(255, 0, 255)']
    ]
  }
})
// 昆山产权模型路径
export const KUNSHAN_CQ_MODEL_URLS = [
  'http://192.168.100.159:8080/Data/KunShan/KCGC_class_1/tileset.json',
  'http://192.168.100.159:8080/Data/KunShan/KCGC_class_2/tileset.json',
  'http://192.168.100.159:8080/Data/KunShan/KCGC_class_3/tileset.json',
  'http://192.168.100.159:8080/Data/KunShan/KCGC_class_4/tileset.json'
]
/**
 * 新沂相关配置
 */
// 新沂不动产分类单体地上模型路径
export const XINYI_CLASSIF_MODEL_UP_URL = 'http://192.168.100.159:8080/Data/BDC/singClassifModel_up/tileset.json'
// 新沂不动产分类单体地下模型路径
export const XINYI_CLASSIF_MODEL_DOWN_URL = 'http://192.168.100.159:8080/Data/BDC/singClassifModel_down/tileset.json'
// 新沂不动产分类单体模型样式设置
export const XINYI_CLASSIF_MODEL_STYLE = new Cesium3DTileStyle({
  color: {
    conditions: [
      ['${type} >= 9', 'rgba(255, 255, 0, 0.6)'], // 特殊限制
      ['${type} >= 8', 'rgba(168, 56, 0, 0.6)'], // 查封
      ['${type} >= 7', 'rgba(255, 255, 255, 0.6)'], // 初始状态
      ['${type} >= 6', 'rgba(76, 0, 115, 0.6)'], // 抵押
      ['${type} >= 5', 'rgba(76, 230,0, 0.6)'], // 可售
      ['${type} >= 4', 'rgba(0, 255, 197, 0.6)'], // 已认购
      ['${type} >= 3', 'rgba(255, 0, 0, 0.6)'], // 已备案
      ['${type} >= 2', 'rgba(0, 0, 255, 0.6)'], // 已签约
      ['${type} >= 1', 'rgba(255, 190, 190, 0.6)'], // 已登记
      ['${type} >= 0', 'rgba(255, 0, 0,0.6)'],
      ['true', 'rgb(255, 0, 255)']
    ]
  }
})
