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
  background: rgba($light, 0.5);
  box-shadow: inset 0 0 20vh $light;

    transition: opacity 0.5s;
  &.hidden {
  transition: opacity 2.5s;
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
  methods: {
    showDrop() {
      this.visible = true;
    },
    hideDrop() {
      this.visible = false;
      this.toggleBodyScroll(true);
    },
    handleDragEnter(e) {
      this.showDrop();
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
      this.hideDrop();
      // fetch FileList object
      var files = Array.from(e.target.files || e.dataTransfer.files);
      this.$emit("files-dropped", files);
    },

    handleBodyDragEnter(e) {
      this.toggleBodyScroll(false);
      if (e.dataTransfer.types.indexOf("Files") > -1) {
        e.preventDefault();
        this.showDrop();
      }
    },

    preventScroll() {
      this.scrolledParent.scrollTop = this.scrolledParentTop;
    },

    toggleBodyScroll(on) {
      this.scrolledParentTop = this.scrolledParent.scrollTop;
      if (on) {
        this.scrolledParent.removeEventListener(
          "scroll",
          this.preventScroll
        );
      } else {
        this.scrolledParent.addEventListener("scroll", this.preventScroll);
      }
    },
  },
};
</script>
