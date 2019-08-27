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
  position: fixed;
  top: 0; bottom: 0; left: 0; right: 0;
  z-index: 1;
  background: yellow;

  &.hidden {
    display: none;
  }
}
</style>

<script>
export default {
  data( ) {
    return ({
      visible: false,
    });
  },
  mounted() {
    document.body.addEventListener("dragenter", this.handleBodyDragEnter);
  },
  methods: {
    showDrop() {
      this.visible = true;
    },
    hideDrop() {
      this.visible = false;
    },
    handleDragEnter(e) {
      e.preventDefault();
      this.showDrop();
    },
    handleDragLeave(e) {
      e.preventDefault();
      this.hideDrop();
    },
    handleDragOver(e) {
      e.preventDefault();
    },
    handleDrop(e) {
      e.preventDefault();
      this.hideDrop();
      // fetch FileList object
      var files = e.target.files || e.dataTransfer.files;
      this.$emit("files-dropped", files);
    },

    handleBodyDragEnter(e) {
      if (e.dataTransfer.types.indexOf("Files") > -1) {
        e.preventDefault();
        this.showDrop();
      }
    },
  }
};
</script>
