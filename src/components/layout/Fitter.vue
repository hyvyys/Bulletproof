<template>
  <transition name="fade">
    <div :class="`fitter ${pinned ? 'pinned' : ''}`" v-show="!forceInvisible && isVisible">
      <div
        ref="positioned"
        :class="`positioned ui-popover is-raised ${pinned ? 'pinned' : ''}`"
        :style="`position: ${position}; width: ${width}px; top: ${top}px; max-height: ${maxHeight}px; `"
      >
        <div class="titlebar" v-if="title">
          <h2>{{ title }}</h2>
          <UiIconButton size="small" @click="togglePinPanel" :class="pinned ? 'active' : ''">
            <img svg-inline src="@/assets/icons/pin.svg" />
          </UiIconButton>
        </div>
        <div v-bar>
          <div
            ref="scrolled"
            :class="`scrolled ${disableOverscroll ? 'disable-overscroll' : ''}`"
            @wheel="onWheel"
          >
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// import throttle from "lodash.throttle";
import viewport from "@/utils/viewport";
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
  name: "Fitter",
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
    isVisible: {
      type: Boolean,
      default: true,
    },
    topSelector: {
      type: String,
      default: "header",
    },
    bottomSelector: {
      type: String,
      default: "footer",
    },
    scrolledParentSelector: {
      type: String,
      default: "body",
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
      top: 0,
      maxHeight: null,
      position: "fixed",
      width: null,
      storedScrollPosition: 0,
      pinned: this.isPinned,
    };
  },
  watch: {
    $route() {
      this.updatePosition();
    },
  },
  mounted() {
    this.init();
    this.initScrollSync();
    this.initPinnable();
  },
  destroyed() {
    this.cleanup();
  },

  methods: {
    init() {
      this.parent = document.querySelector(this.scrolledParentSelector);
      this.header = window.document.querySelector(this.topSelector);
      this.footer = window.document.querySelector(this.bottomSelector);

      this.size();
      window.addEventListener("resize", this.resize);

      if (this.header && this.footer) {
        this.updatePosition();
        this.parent.addEventListener("scroll", this.updatePosition);
        window.addEventListener("resize", this.updatePosition);
      } else {
        // eslint-disable-next-line no-console
        console.error(
          `Fitter didn't find element ${this.topSelector} or element ${this.bottomSelector}.`
        );
      }
    },
    initPinnable() {
      window.addEventListener("click", this.mysteriousClick);
      // window.addEventListener("scroll", this.mysteriousClick);
    },
    cleanup() {
      window.removeEventListener("resize", this.resize);
      this.parent.removeEventListener("scroll", this.updatePosition);
      window.removeEventListener("resize", this.updatePosition);
      window.removeEventListener("click", this.mysteriousClick);
      // window.removeEventListener("scroll", this.mysteriousClick);
    },
    updatePosition() {
      this.top = Math.max(0, this.header.getBoundingClientRect().bottom);
      this.maxHeight =
        Math.min(this.height, this.footer.getBoundingClientRect().top) -
        this.top;
      // this.position = this.top > 0 ? "static" : "fixed";
    },
    size() {
      this.height = viewport.height;
      let width = parseInt(getComputedStyle(this.$el).width);
      if (!width) {
        ({ width } = this.$refs.positioned.getBoundingClientRect());
      }
      // will be 0 if element has currently display: none
      if (width) this.width = width;
    },
    resize() {
      this.height = viewport.height;
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
.positioned {
  display: flex;
  flex-direction: column;
  height: 100%;
  z-index: 1;

  .vb {
    display: flex;
    flex-direction: column;
    height: 100%;
    &.vb-visible .vb-content {
      box-sizing: border-box !important;
    }
  }
  transition: box-shadow 0.15s;
  &.pinned {
    // box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
    box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14);
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
  .ui-icon-button {
    color: mix($brand-primary-color, #444);
    width: 24px;
    height: 24px;
    transform: translateX(3px) rotate(45deg);
    opacity: 0.65;
    &.active {
      opacity: 1;
      transform: rotate(5deg);
    }
  }
}

.fitter:not(.pinned) {
  width: 0;
}
</style>
