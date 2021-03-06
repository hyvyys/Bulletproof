<template>
  <div
    :class="`file-drop ${this.visible ? '' : 'hidden'}`"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  ></div>
</template>

<style lang="scss" scoped>
.file-drop {
  z-index: 1;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: rgba($light, 0.5);
  box-shadow: inset 0 0 20vh $light;

  transition: opacity 0.3s;
  &.hidden {
    transition: opacity 0.8s;
    opacity: 0;
    pointer-events: none;
  }
}
</style>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["scrolledParentSelector"]),
  },
  data() {
    return {
      visible: false,
      scrolledParent: null,
    };
  },
  mounted() {
    this.scrolledParent = document.querySelector(this.scrolledParentSelector);
    this.scrolledParent.addEventListener("dragenter", this.handleBodyDragEnter);
  },
  destroyed() {
    this.scrolledParent.removeEventListener("dragenter", this.handleBodyDragEnter);
    this.scrolledParent.removeEventListener("scroll", this.preventScroll);
  },
  methods: {
    showDrop() {
      this.visible = true;
      this.toggleBodyScroll(false);
    },
    hideDrop() {
      this.visible = false;
      this.toggleBodyScroll(true);
    },
    handleDragEnter(e) {
      e.preventDefault();
    },
    handleDragLeave(e) {
      this.hideDrop();
      e.preventDefault();
    },
    handleDragOver(e) {
      e.preventDefault();
    },
    handleDrop(e) {
      e.preventDefault();
      // fetch FileList object
      var files = e.target.files || e.dataTransfer.files;
      if (files) {
        this.$emit("filesDropped", files);
      }
      this.hideDrop();
    },

    handleBodyDragEnter(e) {
      if (e.dataTransfer.types.indexOf("Files") > -1) {
        e.preventDefault();
        this.showDrop();
      }
    },

    preventScroll() {
      this.scrolledParent.scrollTop = this.scrolledParentTop;
    },

    disableScroll() {
      this.scrolledParent.addEventListener("scroll", this.preventScroll);
      setTimeout(this.enableScroll, 500);
    },

    enableScroll() {
      this.scrolledParent.removeEventListener("scroll", this.preventScroll);
    },

    toggleBodyScroll(on) {
      this.scrolledParentTop = this.scrolledParent.scrollTop;
      if (on) {
        this.enableScroll();
      } else {
        this.disableScroll();
      }
    },
  },
};
</script>
