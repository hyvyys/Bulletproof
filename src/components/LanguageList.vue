<template>
  <div class="language-list">
    <span
      v-for="l in languages"
      :key="l.language +'-'+ l.script"
      :lang="l.htmlCode"
    >
      <UiButton :class="`language-button support-${Math.min(4, Math.ceil((l.missingCharacters || []).length / 5)) || 'full'}`"
        @click="$emit('select-language', l)"
      >
        <div>
          {{ l.language }}
        </div>
        <div v-if="fields.indexOf('coverage') > -1" class="goals">
          {{ l.includedCharacters.length }}/{{ l.requiredCharacters.length }}
        </div>
        <div class="gotcha-warning-icon" v-if="l.gotchas.length">
          <img svg-inline src="@/assets/icons/error.svg" class="help-icon" />
        </div>
      </UiButton>
    </span>

    <UiButton @click="copyList">copy list</UiButton>
    <textarea
      style="position: absolute;left:-9999px"
      ref="list"
      :value="languages.map(l => l.language).join(', ')"
    />
  </div>
</template>

<script>
import UiButton from "keen-ui/src/UiButton";

export default {
  components: {
    UiButton,
  },
  props: {
    languages: Array,
    fields: { type: Array, default: () => [] },
  },
  methods: {
    copyList() {
      this.$refs.list.select();
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
    },
  },
}
</script>


<style lang="scss" scoped>
.language-button.ui-button {
  padding-left: 0.2em;
  padding-right: 0.2em;
  border-radius: 2px;
  font-weight: 500;
  text-transform: none;

  ::v-deep .ui-button__content > * {
    margin: 0 0.2em;
  }
}
.goals {
  opacity: 0.45;
}

.gotcha-warning-icon {
  border-radius: 50%;
  color: #eee;
  opacity: 0.75;
  font-weight: bold;
  width: 1.2em;
  height: 1.2em;
  line-height: 1.2;
}
</style>
