import anime from "animejs";
import Vue from "vue";
import Settings from "./models/Settings";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default {
  state: {
    animationKeyframes: [],
    activeKeyframeId: null,
    maxId: 0,
  },
  getters: {
    animationKeyframes: state => state.animationKeyframes,
    activeKeyframeId: state => state.activeKeyframeId,
  },
  mutations: {
    addAnimationKeyframe(state) {
      const id = ++state.maxId;
      state.activeKeyframeId = id;
      state.animationKeyframes.push({ id });
      this.commit("updateKeyframe");
    },
    removeAnimationKeyframe(state, { id }) {
      if (id == null)
        return;
      const index = state.animationKeyframes.findIndex(k => k.id === id);
      state.animationKeyframes.splice(index, 1);
    },
    activateKeyframe(state, { id }) {
      state.activeKeyframeId = id;
      const { snapshot } = state.animationKeyframes.find(k => k.id === id);
      this.commit("restoreSettings", { snapshot });
    },
    updateKeyframe(state) {
      const id = state.activeKeyframeId;
      if (id == null)
        return;
      const snapshot = clone(this.state.settings);
      const frame = Settings.getStyleFromSettings(this.state.settings);
      const index = state.animationKeyframes.findIndex(k => k.id === id);
      Vue.set(state.animationKeyframes, index, { id, snapshot, frame });
    },
    finishAnimateSettings() {
      this.commit("animateSettings", { settings: null });
    },
  },
  actions: {
    animateSettings(context, { style }) {
      const snapshot = clone(this.state.settings);
      Settings.mergeStyleOntoSettings(snapshot, style);
      this.commit("animateSettings", { settings: snapshot });
    },
  },
}
