/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-11 09:48:59
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-11 10:27:21
 */
module.exports = {
    "root": true,
    "env": {
      "node": true,
      "jquery": true
    },
    "extends": ["plugin:vue/essential", "@vue/standard"],
    "rules": {
      "space-before-function-paren": "off"
    },
    "parserOptions": {
      "parser": "babel-eslint"
    }
  };