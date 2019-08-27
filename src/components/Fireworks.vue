<template>
  <div class="fireworks">
    <Firework v-for="f in fireworks" :key="f.key" :position="f.position" />
  </div>
</template>

<script>
import trackMousePosition from "@/utils/mousePosition";
import Firework from "./Firework";

export default {
  components: { Firework },
  props: {
    font: {
      type: String,
      default: "",
    },
    disable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      fireworks: [],
      position: { x: 0, y: 0 },
      keyCount: 0,
    };
  },
  mounted() {
    trackMousePosition(document, "dragover", pos => (this.position = pos));
    this.$on('event', this.add);
  },
  methods: {
    add() {
      this.fireworks.push({
        position: this.position,
        key: this.keyCount++,
      });
    },
  },
};
</script>
