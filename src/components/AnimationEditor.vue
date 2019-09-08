<template>
  <div class="animation-editor panel">
    <h3>Animation editor</h3>

    <div class="row">
      <label class="row-label">Duration</label>
      <UiTextbox v-model="duration" />
    </div>

    <EditableList
      class="keyframes"
      :options="animationKeyframes"
      :keys="{key: 'id'}"
      @remove="key => removeAnimationKeyframe({ id: key })"
    >
      <template v-slot:option="{option: k, index: i}">
        <UiButton
          @click="activateKeyframe({ id: k.id })"
          :class="'keyframe' + (k.id === activeKeyframeId ? ' active' : '')"
          :id="`keyframe-btn-${k.id}`"
        >
          <div class="label">
            Keyframe {{ k.id }}
          </div>
          <UiProgressLinear
            :progress="keyframeProgress[i]"
            type="determinate"
          />
        </UiButton>
      </template>

      <template v-slot:footer >
        <UiButton
          @click="addAnimationKeyframe"
          color="primary"
        >
          Add
        </UiButton>
        <UiButton
          @click="play"
          color="primary"
          :loading="playing"
          :disabled="!canAnimate"
        >
          Play
        </UiButton>
      </template>
    </EditableList>

  </div>
</template>

<script>
import anime from "animejs";
import { mapGetters, mapMutations } from "vuex";

import UiTextbox from "keen-ui/src/UiTextbox.vue";
import UiButton from "keen-ui/src/UiButton.vue";
import UiProgressLinear from "keen-ui/src/UiProgressLinear.vue";
import EditableList from "@/components/EditableList.vue";

export default {
  components: {
    UiTextbox,
    UiButton,
    UiProgressLinear,
    EditableList,
  },
  data() {
    return {
      duration: 2000,
      playing: false,
      progress: 0,
      keyframeProgress: [],
    };
  },
  computed: {
    ...mapGetters([
      "animationKeyframes",
      "activeKeyframeId",
      ]),
    canAnimate() { return this.animationKeyframes.length >= 2; },
  },
  methods: {
    ...mapMutations([
      "addAnimationKeyframe",
      "removeAnimationKeyframe",
      "activateKeyframe",
    ]),
    updateKeyframeProgress() {
      this.animationKeyframes.forEach((k, i, arr) => {
        const chunk = 100 / arr.length;
        const start = chunk * i;
        const end = chunk * (i + 1);
        const progress = (this.progress - start) / (end - start) * 100;
        this.$set(this.keyframeProgress, i, Math.max(0, Math.min(100, progress)));
      });
    },
    play() {
      if (!this.canAnimate) return;

      // change each value to Array containing two copies of the value
      function duplicateValues(object) {
        Object.keys(object).forEach(k => {
          object[k] = [object[k], object[k]];
        });
      }

      // find props worth animating - those that differ between keyframes
      const keyframes = this.animationKeyframes.map(k => {
        // return k.frame;
        const frame = {};
        Object.keys(k.frame).forEach(key => {
          if (this.animationKeyframes.some(kf => kf.frame[key] !== k.frame[key])) {
            frame[key] = k.frame[key];
          }
        });
        return frame;
      });

      // split each keyframe into discrete and continuous props
      // so that steps easing can be applied to the former
      let discreteKeyframes = [], continuousKeyframes = [];

      keyframes.forEach((frame, i) => {
        let { fontFeatureSettings, ...continuousProps } = frame;


        if (fontFeatureSettings) {
          // tmp fix until Anime.JS is fixed
          // https://github.com/juliangarnier/anime/issues/609
          // strip property value of stylistic set subproperties
          fontFeatureSettings = fontFeatureSettings.replace(/['"](ss\d\d|aalt)['"]( (0|1))* *,* */g, "");
        }
        const continuousFrame = {
          ...continuousProps,
        };
        const discreteFrame = {
          fontFeatureSettings,
        };

        if (i === 0) {
          // force starting from values of first frame
          // duplicateValues(discreteFrame);
          // duplicateValues(continuousFrame);

          // or instead make first frame act as the initial state reset
          discreteFrame.duration = 0;
          continuousFrame.duration = 0;
        }

        discreteKeyframes.push(discreteFrame);
        continuousKeyframes.push(continuousFrame);
      });

      const sample = document.querySelector('.font-sample');

      const timeline = anime.timeline({
        targets: sample,
        duration: this.duration,
        // easing: 'easeOutElastic(1, .8)',
        // easing: 'linear',
        easing: 'easeOutQuad',
        autoplay: false,
        delay: 100,
        endDelay: 0,
      });

      timeline.add({
        keyframes: discreteKeyframes,
        easing: 'steps(1)', // using steps is crucial for discrete values to animate
      }, 0);

      timeline.add({
        keyframes: continuousKeyframes,
        update: (anim) => {
          const style = sample.style;
          // keep ui controls in sync with animejs animation
          const elapsed = (anim.progress - this.progress) / 100 * this.duration;
          if (elapsed > 48) {
            this.$store.dispatch("animateSettings", { style });
            this.progress = anim.progress;
          }
          // this.updateKeyframeProgress();
        },
        begin: () => {
          this.playing = true;
        },
        complete: () => {
          this.$store.commit("finishAnimateSettings");
          this.playing = false;
          this.progress = 0;
          this.activateKeyframe({ id: this.animationKeyframes.slice(-1)[0].id })
        },
      }, 0);

      this.activateKeyframe({ id: this.animationKeyframes[0].id })
      timeline.restart();
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/scss/mixins";
@import "keen-ui/src/styles/variables";

.keyframes {
  margin: 8px 0;
}

.keyframe {
  text-transform: none;
  font-weight: normal;
  padding: 0;
  flex-direction: column;
  align-items: stretch;

  /deep/ .ui-button__content {
    width: 100%;
    flex: 1;
    position: relative;

    .label {
      z-index: 1;
    }
    .ui-progress-linear {
      position: absolute;
      height: 105%;
      &.ui-progress-linear--color-primary {
        background: transparent !important;
        .ui-progress-linear__progress-bar {
          background: rgba($brand-primary-color, 0.2) !important;
          height: 100%;
        }
      }
    }
  }

  &.active {
    margin-left: 4px;
    font-weight: bold;
    border-color: rgba($brand-primary-color, 0.65) !important;
    @include pseudo;
    &::before {
      top: 50%;
      transform: translateY(-50%);
      border: solid;
      $w: $ui-input-height;
      border-width: $w * 0.5 $w * 0.45;
      $t: #0000;
      border-color: $t $t $t $brand-primary-color;
    }
  }
}

.ui-button {
  min-width: 4rem;
}
</style>
