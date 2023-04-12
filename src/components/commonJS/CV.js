/*
 * @Descripttion:
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 09:10:57
 * @LastEditors: iaaseihy 774249302@qq.com
 * @LastEditTime: 2023-02-10 16:56:43
 */
/**
 * @file CV
 * @version 1.0
 * CV API 入口
 * CV 提供一个等同于Cesium 的基类,提供实例化和加载资源
 * -- CV.ready();加载异步资源
 * -- new CV.Earth();提供实例化
 * */
import Earth from './commonTool/earth.js'
import CONFIG from './commonTool/config.js'
import CVTools from './commonTool/cvTool.js'
import { TAG } from './commonTool/tag.js'
import Layers from './commonTool/layers.js'
import HTML from './commonTool/html.js'
import handler from './commonTool/handler.js'
import Measure from './commonTool/measure.js'
import mouseManager from './commonTool/mouseManager.js'
import ModelManager from './commonTool/modelManager.js'
import Coordinate from './commonTool/Coordinate.js'
import entityFactory from './commonTool/entityFactory.js'
import Entitys from './commonTool/entitys.js'
import Primitives from './commonTool/primitives.js'
import dataManager from './commonTool/dataManager.js'
import satelliteTransit from './commonTool/satelliteTransit.js'
import Analyser from './commonTool/analyser.js'
import flyPath from './commonTool/flyPath.js'
import Roaming from './commonTool/roaming.js'
import OverViewMap from './commonTool/overView.js'
import SplitView from './commonTool/splitView.js'
import Draw from './commonTool/draw.js'
import Errors from './commonTool/errors.js'
import DrawDynamicTool from './commonTool/DrawDynamicTool.js'
import Plot from './commonTool/plot.js'
import Scene from './commonTool/scene.js'
import sceneTree from './commonTool/sceneTree.js'
import Camera from './commonTool/camera.js'
import Visual from './commonTool/visual.js'
import Winds from './commonTool/winds.js'
import Wind3D from './commonTool/wind3D.js'
import HeatMap from './commonTool/heatMap.js'
import Radar from './commonTool/radar.js'
import Visibility from './analyser/visibility.js'
import Submerged from './analyser/submerged.js'
import Slope from './analyser/slope.js'
import VisualField from './analyser/visualField.js'
import PointVisual from './analyser/pointVisual.js'
import LookAround from './analyser/lookAround.js'
import ViewShed3D from './analyser/ViewShed3D.js'
import ViewShed from './analyser/ViewShed.js'
import SplitScreen from './analyser/splitScreenAnalysis.js'
import ProFile from './analyser/profileAnalyse.js'
import Read from './3d/ready.js'
import RightMenu from './3d/rightMenu.js'
import PassAnalyze from './3d/passAnalyze.js'
import OrbitAnalyze from './3d/orbitAnalyze.js'

/**
 * 成员变量
 * @file CV
 */
var CV = {}
/**
 * version
 * @type Number
 */
CV.version = 1.0
/**
 * name
 * @type string
 */
CV.name = 'CV'
/**
 * TAG 标签类
 */
CV.TAG = TAG
/**
 * 操作常用配置
 */
CV.CONFIG = CONFIG
/**
 * 加载资源方法
 * @type function
 */
CV.load = function (use, call) {
  return new Read().load(use, call)
}
/**
 * 创建Earth
 * 所有地球操作
 * 视角 鼠标 绘制
 * @type obj
 */
CV.Earth = Earth
/**
 * core 核心类
 */
CV.CORE = null
/**
 * 场景
 */
CV.Scene = Scene
/**
 * 场景树
 */
CV.SceneTree = sceneTree
/**
 * 相机
 * 视野控制
 */
CV.Camera = Camera
/**
 * 创建layer类
 * 所有图层在这里操作
 */
CV.Layers = Layers
/**
 * HTML资源管理
 */
CV.HTML = HTML
/**
 * 工具
 */
CV.Tools = CVTools
/**
 * 异常封装
 */
CV.Errors = Errors
/**
 * 鼠标事件封装
 */
CV.Handler = handler
/**
 * 鼠标管理
 */
CV.MouseManager = mouseManager
/**
 * 模型管理
 */
CV.ModelManager = ModelManager
/**
 * 坐标辅助
 */
CV.Coordinate = Coordinate
/**
 * 实体封装
 */
CV.EntityFactory = entityFactory
/**
 * 量测
 */
CV.Measure = Measure
/**
 * 数据源管理
 */
CV.dataManager = dataManager
/**
 * 实体
 * 图形
 */
CV.Primitives = Primitives
CV.Entitys = Entitys
/**
 * 可视化类
 */
CV.Visual = Visual
/**
 * 三维效果
 */
CV.SatelliteTransit = satelliteTransit
CV.FlyPath = flyPath
CV.Winds = Winds
CV.Wind3D = Wind3D
CV.HeatMap = HeatMap
CV.Radar = Radar
CV.Roaming = Roaming
CV.OverViewMap = OverViewMap
CV.SplitView = SplitView
/**
 * 分析功能
 */
CV.Analyser = Analyser
CV.Visibility = Visibility
CV.Submerged = Submerged
CV.Slope = Slope
CV.VisualField = VisualField
CV.PointVisual = PointVisual
CV.LookAround = LookAround
CV.ViewShed3D = ViewShed3D
CV.ViewShed = ViewShed
CV.SplitScreen = SplitScreen
CV.ProFile = ProFile
CV.PassAnalyze = PassAnalyze
CV.OrbitAnalyze = OrbitAnalyze
/**
 * 绘制图形
 */
CV.Draw = Draw
CV.DrawDynamicTool = DrawDynamicTool
/**
 * 标绘
 */
CV.Plot = Plot
/**
 * 右键菜单
 */
CV.RightMenu = RightMenu
export { CV }
