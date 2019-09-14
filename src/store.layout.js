export default {
  state: {
    scrolledParentSelector: ".app-content",
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
  },
}
