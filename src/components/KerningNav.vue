<template>
  <div class="kerning-nav contextual-sidebar">
    <div class="editor panel">
      <div class="row">
        <h3>
          Kerning string editor
        </h3>
        <a target="_blank" href="/help#kerning" class="help-link">[ ? ]</a>
      </div>

      <transition-group name="fade">
        <div class="row" v-for="(segment, i) in segments" :key="segment.key" :id="segment.key">
          <UiTextbox
            v-model="segments[i].characters"
            autofocus
            spellcheck="false"
          />
          <UiIconButton @click="removeKerningSegment(i)" color="default">
            <img svg-inline src="@/assets/icons/remove.svg" />
          </UiIconButton>
        </div>

        <div class="row" key="select">
          <UiSelect
            v-model="selectedSegment"
            :options="builtInSegments"
            dropdownClass="kerning-segment-select"
            dropdownPosition="bottom-end"
            placeholder="select segment"
          >
            <template v-slot:option="props">
              <kbd>
                {{ props.option }}
              </kbd>
            </template>
          </UiSelect>
          <UiIconButton @click="addKerningSegment" color="primary">
            <img svg-inline src="@/assets/icons/add.svg" />
          </UiIconButton>
        </div>
      </transition-group>

      <div class="row">
        <span id="add-pattern-btn-wrapper">
          <UiButton
            @click="addKerningPattern"
            color="default"
            :disabled="inputInvalid"
          >
            Add pattern
          </UiButton>
          <UiTooltip v-if="inputInvalid" trigger="#add-pattern-btn-wrapper">
            {{ noSegments ? "Add at least two segments." : "Segments cannot be empty." }}
          </UiTooltip>
        </span>
      </div>
    </div>

    <div class="nav panel">
      <h3>Kerning patterns</h3>

      <transition-group name="fade">
        <div class="kerning-pattern" v-for="pattern in kerningPatterns" :key="pattern.id">
          <UiCheckbox
            :value="pattern.isVisible"
            @input="v => toggleKerningPattern(pattern.id, v)"
          >
          </UiCheckbox>
          <a :href="`#${pattern.id}`">
            <kbd v-html="formatPatternId(pattern.id)">
            </kbd>
          </a>
          <UiIconButton @click="removeKerningPattern(pattern.id)" color="default">
            <img svg-inline src="@/assets/icons/remove.svg" />
          </UiIconButton>
        </div>

        <div class="row" key="button">
          <UiButton @click="resetKerningPatterns" color="default">Revert</UiButton>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import kerningSegments from "@/models/kerningSegments";
import UiIconButton from "keen-ui/src/UiIconButton.vue";
import UiButton from "keen-ui/src/UiButton.vue";
import UiTextbox from "keen-ui/src/UiTextbox.vue";
import UiCheckbox from "keen-ui/src/UiCheckbox.vue";
import UiSelect from "@/components/UiSelect.vue";
import UiTooltip from "keen-ui/src/UiTooltip.vue";

export default {
  components: {
    UiIconButton,
    UiButton,
    UiTextbox,
    UiSelect,
    UiCheckbox,
    UiTooltip,
  },
  data() {
    return {
      segments: [],
      builtInSegments: kerningSegments,
      selectedSegment: "",
      key: 0,
    };
  },
  computed: {
    ...mapGetters(["kerningPatterns"]),
    inputInvalid() {
      return this.segments.length < 2 || this.segments.some(s => !s.characters);
    },
    emptySegment() {
      return this.segments.some(s => !s.characters);
    },
    noSegments() {
      return this.segments.length < 2;
    },
  },
  watch: {
    kerningPatterns(val, oldVal) {
      const newPatterns = val.filter(x => !oldVal.includes(x));
      const hash = decodeURI(window.location.hash);
      const current = val.find(p => "#" + decodeURI(p.id) === hash);
      if (hash && val.length) {
        if (!current) {
          window.location.hash = "#" + val[0].id;
        }
        else {
          window.location = hash;
        }
      }
      else if (newPatterns.length === 1) {
        window.location.hash = "#" + newPatterns[0].id;
      }
    },
  },
  methods: {
    getKey() {
      return this.key++;
    },
    addKerningSegment() {
      this.segments.push({ key: this.getKey(), characters: this.selectedSegment });
      this.selectedSegment = "";
    },
    removeKerningSegment(i) {
      this.segments.splice(i, 1);
    },
    addKerningPattern() {
      this.$store.dispatch("addKerningPattern", { segments: this.segments.map(s => s.characters) });
    },
    removeKerningPattern(id) {
      this.$store.dispatch("removeKerningPattern", { id });
    },
    toggleKerningPattern(id, v) {
      this.$store.dispatch("toggleKerningPattern", { id, on: v });
    },
    resetKerningPatterns() {
      this.$store.dispatch("resetKerningPatterns");
    },
    formatPatternId(id) {
      return id
        .replace(/×/g, '<wbr>×')
        .replace(/-/g, '&#x2011;');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/mixins";
@import "keen-ui/src/styles/imports";

.row {
  .ui-icon-button {
    align-self: center;
  }
  .ui-button {
    margin: 5px 0;
  }
}

.right {
  flex: 0 0 auto;
  margin-left: auto;
}
.editor {
  .ui-textbox,
  .ui-select ::v-deep .ui-select__display-value:not(.is-placeholder) {
    font-family: $monospaced;
    font-size: $monospaced-font-size;
  }
}

.kerning-pattern {
  flex: 1;
  display: flex;
  align-items: center;
  > .ui-checkbox {
    margin: 0 0.5rem 0 0;
  }
  > a {
    flex: 1;
    width: 100%;
    height: 100%;
    display: block;
    text-decoration: none;
  }
  > * {
    margin-right: 0.5rem;
  }
  > .ui-icon-button {
    height: 1.75rem;
    width: 1.75rem;
    margin: 2px 0;
  }
}

.ui-icon-button.small {
  border: none;
  &, & svg {
    height: 1rem;
    width: 1rem;
  }
}
#add-pattern-btn-wrapper {
  outline: none;
  display: flex;
  .ui-button {
    flex: 1;
  }
}
</style>
