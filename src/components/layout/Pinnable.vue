<template>
  <div
    v-show="!forceInvisible && isVisible"
    :class="`
      pinnable ${pinned ? 'pinned' : ''}
      ${!footerVisible && sticky ? 'sticky' : ''}
      ${footerNear ? 'footer-near' : ''}
      ${footerNearer ? 'footer-nearer' : ''}
      ${triggerHover ? 'trigger-hover' : ''}
    `"
  >
      <div class="titlebar" v-if="title">
        <h2>{{ title }}</h2>
        <UiIconButton size="small" @click="togglePinPanel" :class="`pin ${pinned ? 'active' : ''}`">
          <img svg-inline src="@/assets/icons/pin.svg" />
        </UiIconButton>
      </div>
      <div class="content" v-bar>
        <div
          ref="scrolled"
          @wheel="onWheel"
          :class="`scrolled ${disableOverscroll ? 'disable-overscroll' : ''}`"
        >
          <slot></slot>
        </div>
      </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import UiIconButton from "keen-ui/src/UiIconButton";

function closestLike(el, predicate, depth = 3) {
  let i = 0;
  var node = el;
  while (node != null && i <= depth) {
    if (predicate(node)) {
      return node;
    }
    node = node.parentNode;
    i++;
  }
  return null;
}

export default {
  name: "Pinnable",
  components: {
    UiIconButton,
  },
  props: {
    title: {
      type: String,
    },
    isPinned: {
      type: Boolean,
      default: true,
    },
    side: {
      type: String,
      default: 'left',
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    disableOverscroll: {
      type: Boolean,
      default: true,
    },
    trigger: String,
    forceInvisible: {
      type: Boolean,
      default: false,
    },
    scrollSyncStartEvent: {
      type: String,
      default: "scrollSyncStart",
    },
    scrollSyncEndEvent: {
      type: String,
      default: "scrollSyncEnd",
    },
  },
  data() {
    return {
      storedScrollPosition: 0,
      pinned: this.isPinned,
      lastHeight: 0,
      width: null,
      triggerHover: false,
    };
  },
  computed: {
    ...mapState({
     sticky: state => state.layout.sticky,
     footerVisible: state => state.layout.footerVisible,
     footerSentinelVisibleRatio: state => state.layout.footerSentinelVisibleRatio,
   }),
   footerNear() { return this.footerSentinelVisibleRatio > 0 },
   footerNearer() { return this.footerSentinelVisibleRatio > 0.5 },
  },
  mounted() {
    this.init();
  },
  destroyed() {
    this.cleanup();
  },

  methods: {
    init() {
      this.getTriggerElement().addEventListener("mouseenter", this.onTriggerMouseEnter);
      this.getTriggerElement().addEventListener("mouseleave", this.onTriggerMouseLeave);
    },
    cleanup() {
      this.getTriggerElement().removeEventListener("mouseenter", this.onTriggerMouseEnter);
      this.getTriggerElement().removeEventListener("mouseleave", this.onTriggerMouseLeave);
    },
    onTriggerMouseEnter() {
      this.triggerHover = true;
    },
    onTriggerMouseLeave() {
      this.triggerHover = false;
    },
    onWheel(e) {
      if (this.disableOverscroll) {
        e.stopPropagation();
      }
    },
    toggle() {
      this.$emit("toggle");
    },
    hide() {
      this.$emit("hide");
    },
    getTriggerElement() {
      return document.querySelector(this.trigger);
    },
    mysteriousClick(event) {
      const clickedTrigger = this.getTriggerElement().contains(event.target);
      if (
        !this.pinned &&
        this.isVisible &&
        !clickedTrigger
      ) {
        const el = event.target;
        const anchor = closestLike(el, node => node.tagName === "A", 3);
        const isNavigationAnchor = anchor ? anchor.getAttribute("href").startsWith("#") : false;
        if (!this.$el.contains(event.target) || isNavigationAnchor) {
          this.hide();
        }
      }
    },
    initScrollSync() {
      this.$on(this.scrollSyncStartEvent, () => {
        this.storedScrollPosition = this.$refs.scrolled.scrollTop;
      });
      this.$on(this.scrollSyncEndEvent, () => {
        this.$refs.scrolled.scrollTop = this.storedScrollPosition;
      });
    },
    togglePinPanel() {
      this.pinned = !this.pinned;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/variables";
@import "@/scss/mixins";

.pinnable {
  position: sticky;
  top: $header-height;
  align-self: flex-start;

  position: sticky;
  top: $header-height;
  max-height: 100vh;
  transition: transform 0.2s, max-height 0.1s;
  transform: translateY(-$header-height);
  &.sticky {
    transform: translateY(0);
    max-height: calc(100vh - #{$header-height});
  }
  &.footer-near {
    margin-bottom: -$footer-height;
    transition: none;
  }
  &.footer-nearer {
    max-height: calc(100vh - #{$footer-height});
  }

  $c: rgba(0, 0, 0, 0.14);
  &.pinned {
    background: rgba($light, 1);
  }
  &:not(.pinned) {
    box-shadow: 7px 0 6px -5px $c, -7px 0 6px -5px $c;
    position: fixed;
    background: rgba($light, 0.93);
    transition: opacity 0.25s;
    &:not(:hover):not(.trigger-hover) {
      transition: opacity 0.25s 0.1s;
      opacity: 0;
    }
  }
  display: flex;
  flex-direction: column;
  .titlebar {
    flex: 0;
  }
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    @include pseudo;

    &::before, &::after {
      height: 1em;
      width: 100%;
      background: linear-gradient($light, #0000);
      z-index: 4;
      pointer-events: none;
    }
    &::after {
      top: unset;
      background: linear-gradient(0deg, $light, #0000);
    }
  }
}

.scrolled.disable-overscroll {
  overscroll-behavior: none;
  height: 100%;
}

.titlebar {
  display: flex;
  align-items: center;
  padding: 2px;
  h2 {
    padding: 0 8px;
    flex: 1;
    font-size: 1.2rem;
    color: mix($brand-primary-color, #444);
    margin: 0;
  }
  .ui-icon-button.pin {
    color: mix($brand-primary-color, #444);
    width: 24px;
    height: 24px;
    svg {
      transform: rotate(35deg);
    }
    opacity: 0.65;
    &.active {
      opacity: 1;
      svg {
        transform: rotate(20deg);
      }
    }
  }
}
</style>