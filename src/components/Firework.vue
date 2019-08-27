<template>
  <div :class="`firework firework-${$vnode.key}`" :style="`font-family: ${font};`">
    <div
      v-for="(letter, i) in letterSoup"
      :key="i"
      :class="`letter letter-${i}`"
      :style="`font-size: ${3 + 0.5 * (i % 6)}em`"
    >{{ letter }}</div>
  </div>
</template>

<script>
import anime from "animejs/lib/anime.es.js";

function genCharArray(charA, charZ) {
  var a = [],
    i = charA.charCodeAt(0),
    j = charZ.charCodeAt(0);
  for (; i <= j; ++i) {
    a.push(String.fromCharCode(i));
  }
  return a;
}

function getLetters() {
  return [
    ...genCharArray("a", "z"),
    ...genCharArray("A", "Z"),
    ...genCharArray("0", "9"),
  ];
}

export default {
  props: {
    font: {
      type: String,
      default: "",
    },
    position: {
      type: Object,
      default: () => ({ x: 700, y: 300 }),
    },
  },
  data() {
    return {
      letterSoup: getLetters(),
    };
  },
  mounted() {
    this.firework();
  },
  methods: {
    firework() {
      this.$el.style.left = this.position.x + "px";
      this.$el.style.top = this.position.y + "px";
      this.$el.style.opacity = 0;

      const fadeIn = 1500;
      const animationDuration = 1800;
      const timeline = anime.timeline({
        duration: animationDuration,
      });

      timeline.add(
        {
          targets: this.$el,
          scale: [{ value: 0.1, duration: 0 }, { value: 1, duration: fadeIn }],
          opacity: [
            { value: 0.85, duration: 200 },
            { value: 0, duration: animationDuration },
          ],
          easing: "linear",
        },
        0
      );

      this.letterSoup.forEach((letter, i) => {
        let id = `.firework-${this.$vnode.key} .letter-${i}`;
        document.querySelector(id).style.transform = "translate(-50%, -50%)";

        let alpha = Math.random() * 2 * Math.PI;
        let c = 100 * (1 + Math.random());

        const dx = Math.cos(alpha) * c + "vw";
        const dy = Math.sin(alpha) * c + "vw";

        timeline.add(
          {
            targets: id,
            translateX: `+=${dx}`,
            translateY: `+=${dy}`,
            duration: animationDuration,
            easing: "easeInSine",
            delay: Math.random() * 300,
          },
          0
        );
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.firework {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  opacity: 0;
}

.letter {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>
