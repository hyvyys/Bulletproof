<template>
  <div class="editable-list">
    <transition-group name="fade">
      <div class="row" key="header">
        <slot name="header" >
        </slot>
      </div>

      <div
        class="editable-list-item"
        v-for="(o, i) in options"
        :key="keys.key ? o[keys.key] : i"
      >
        <UiCheckbox v-if="keys.checked"
          :value="o[keys.checked]"
          @input="value => $emit('check', { key: o[keys.key], value })"
        >
        </UiCheckbox>

        <slot name="option" :option="o" :index="i">
          <!-- fallback if no slot provided -->
          {{ keys.label ? o[keys.label] : o }}
        </slot>

        <UiIconButton @click="$emit('remove', keys.key ? o[keys.key] : o)" color="default" size="small" class="border">
          <img svg-inline src="@/assets/icons/remove.svg" />
        </UiIconButton>
      </div>

      <div class="row" key="footer">
        <slot name="footer" >
        </slot>
      </div>
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>
</style>

<script>
import UiIconButton from "keen-ui/src/UiIconButton.vue";
import UiCheckbox from "keen-ui/src/UiCheckbox.vue";

export default {
  components: {
    UiIconButton,
    UiCheckbox,
  },
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    keys: {
      type: Object,
      default: () => ({
        key: '',
        label: '',
        checked: '',
      }),
    },
  },
}
</script>

<style lang="scss" scoped>
.editable-list-item {
  display: flex;
  align-items: center;
  .ui-button {
    flex: 1;
    margin: 2px 0;
  }
  > :last-child {
    margin-left: 0.25em;
  }
}
</style>
