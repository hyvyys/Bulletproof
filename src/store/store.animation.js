import Vue from "vue";
import Settings from "@/models/Settings";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default {
  state: {
    animatedProperties: Object.keys(Settings.definitions),
    animatableProperties: Object.keys(Settings.definitions),
    animationKeyframes: [],
    activeKeyframeId: null,
    maxId: 0,
  },
  getters: {
    animatedProperties: state => state.animatedProperties,
    animatableProperties: state => state.animatableProperties,
    animationKeyframes: state => state.animationKeyframes,
    activeKeyframeId: state => state.activeKeyframeId,
  },
  mutations: {
    setAnimatedProperties(state, { properties }) {
      state.animatedProperties = properties;
    },
    importAnimationKeyframes(state, { keyframes }) {
      try {
        state.animationKeyframes = JSON.parse(keyframes);
      }
      catch (e) {
        console.log(e);
      }
    },
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

      const settings = clone(this.state.settings);
      Object.keys(snapshot).filter(k => context.state.animatedProperties.indexOf(k) > -1).forEach(k => {
        settings[k] = snapshot[k];
      })
      this.commit("animateSettings", { settings });
    },
  },
}
