/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-10 16:34:09
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-11 10:59:20
 */
import { createStore } from 'vuex'

const defaultState = {
  count: 0
}
export default createStore({
  state() {
    return {
      count: 10
    }
  },
  mutations: {
    increment (state) {
      state.count ++
    }
  },
  actions: {
  },
  modules: {
  }
})
