import Vue from "vue";

const scrolledParentSelector = ".app-content";
Vue.prototype.$scrollToTop = () => scrolledParentSelector.scrollTo(0,0);

export default {
  state: {
    scrolledParentSelector,
    sticky: true,
    footerVisible: 0,
    footerSentinelVisibleRatio: 0,
  },
  getters: {
    scrolledParentSelector: state => state.scrolledParentSelector,
  },
  mutations: {
    sticky(state, { value }) {
      state.sticky = value;
    },

    updateFooter(state, { visible, ratio }) {
      state.footerVisible = visible;
      state.footerSentinelVisibleRatio = ratio;
    },
    scrollToTop(state) {
      this.commit("sticky", { value: true });
      this.commit("updateFooter", { visible: false, ratio: 0 });
      const el = document.querySelector(state.scrolledParentSelector);
      el.scrollTop = 0;
    },
  },

  actions: {
  },
}
