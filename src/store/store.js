import Vuex from "vuex";

const store = new Vuex.Store({
  state: {
    viewer: null,
    count: 10,
    cesiumDrawHandler: null
  },
  mutations: {
    initViewer(state, viewer) {
      state.viewer = viewer;
    },
    increment (state) {
        state.count ++
      }
  },
});

export default store;