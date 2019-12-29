<template>
  <div class='header-flex'>
    <h3 :id="header.langId">{{ header.topic }}</h3>
    <UiButton color="none" class="btn" v-if="header.description">
      <img svg-inline src="@/assets/icons/info.svg" height="18" class="help-icon" />
      <UiTooltip openOn="click" :interactive="true" v-html="header.description || '(no description)'" class="description-tooltip" />
    </UiButton>
    <div class="tags">
      <span v-for="(t, i) in header.tags" :key="i">{{ t }}</span>
    </div>
    <h3 :id="header.langId">{{ header.language }}</h3>
    <div v-if="header.opentypeTag">
      <span class="light">OT code: </span><code>{{ header.opentypeTag.padEnd(4, ' ') }}</code>
      <span class="light">HTML code: </span><code>{{ header.htmlTag.padEnd(4, ' ') }}</code>
    </div>
    <div>{{ fNum(header.speakers) }} speakers</div>
  </div>
</template>

<script>
// import UiTooltip from "keen-ui/src/UiTooltip";
import UiTooltip from "@/components/UiTooltip";
import UiButton from "keen-ui/src/UiButton";

export default {
  components: {
    UiTooltip,
    UiButton,
  },
  props: {
    header: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    fNum(n) { return n > 1000000 ? n/1000000 + 'M' : n/1000 + 'K'; },
  },
}
</script>

<style lang="scss" scoped>
@import "@/scss/dark";

.description-tooltip {
  user-select: text;
  font-size: 1rem;
  text-align: left;
}
.btn {
  border: 0;
  background: transparent;
  &:hover {
    background: rgba(#fff, 0.2);
  }
  &, &:active {
    padding: 0;
    min-width: unset;
    height: 1.6em !important;
  }
}
.tags {
  flex: 1;
  span {
    @include dark;
    padding: 2px 4px;
    margin: 0 2px;
  }
}
</style>
