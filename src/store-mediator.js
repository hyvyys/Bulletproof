export default function configureMediator (store) {
  // listen to mutations
  // eslint-disable-next-line no-unused-vars
  store.subscribe(({ type, payload }, state) => {
    switch (type) {
      case 'updateSetting':
        if (state.animation.activeKeyframeId != null) {
          store.commit('updateKeyframe');
        }
    }
  })
}
