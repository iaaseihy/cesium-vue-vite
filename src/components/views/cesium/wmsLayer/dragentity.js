/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-08-03 16:09:11
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-04 14:13:02
 */
/**
 * @param {Viewer} viewer
 * 
*/


import * as Cesium from 'cesium';

export default class DragEntity {
    constructor(val) {
        this.viewer = val.viewer;
    }

    addEntity1(value) {
        let pinBuilder = new Cesium.PinBuilder();
        let poin = this.viewer.entities.add({
            id:value.id,
            name: value.name,
            position: Cesium.Cartesian3.fromDegrees(value.position.x, value.position.y),
            billboard: {
              image: pinBuilder.fromText(value.text,Cesium.Color.ROYALBLUE, 48).toDataURL(),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
            monitoItems:{
                    data:value
                },
        });

        // Additional logic for the addEntity method if needed

        return poin;
    }
    addEntity(value) {
        let pinBuilder = new Cesium.PinBuilder();
        let poin = this.viewer.entities.add({
            id:value.id,
            name: value.geometry_name,
            position: Cesium.Cartesian3.fromDegrees(value.geometry.coordinates[0][0][0][0], value.geometry.coordinates[0][0][0][1]),
            billboard: {
              image: pinBuilder.fromText(value.properties.name,Cesium.Color.ROYALBLUE, 48).toDataURL(),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
            monitoItems:{
                    data:value
                },
        });

        // Additional logic for the addEntity method if needed

        return poin;
    }
}
