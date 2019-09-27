<template>
  <div class="kerning-nav contextual-sidebar u-flex-v">
    <div v-bar="{
          preventParentScroll: true,
        }" ref="vb">
      <div class="scrolled">

        <div class="editor panel" key="pattern-editor" v-if="selectedPatternId != null">
          <transition-group name="fade" class="fade-transition-group" tag="div">
            <div class="row" key="title">
              <h3>Pattern segments</h3>
              <a target="_blank" href="/help#kerning" class="help-link">[ ? ]</a>
            </div>

            <div class="row segment-row" v-for="(segment, i) in segments" :key="`segment-${segment.key}`">
              <UiSelect
                ref="segmentSelects"
                v-model="segments[i].characters"
                :options="builtInSegmentCharacters"
                dropdownClass="kerning-segment-select"
                dropdownPosition="bottom-end"
                placeholder="type or choose"
                :autocomplete="true"
                @input="updateKerningPattern"
              >
                <template v-slot:option="props">
                  <kbd>{{ props.option || "\xa0" }}</kbd>
                </template>
              </UiSelect>

              <UiIconButton key="btnAdd"
                v-if="i === segments.length - 1"
                @click="addKerningSegment"
                color="primary"
              >
                <img svg-inline src="@/assets/icons/add.svg" />
              </UiIconButton>

              <UiIconButton key="btnRemove" v-else @click="removeKerningSegment(i)" color="default">
                <img svg-inline src="@/assets/icons/remove.svg" />
              </UiIconButton>
            </div>
          </transition-group>
        </div>

        <div class="nav panel" key="pattern-list">
          <transition-group name="fade" class="fade-transition-group" tag="div">

            <h3 key="heading">Patterns</h3>

            <div class="btn-group" key="buttons">
              <UiButton @click="resetKerningPatterns" color="default">Revert</UiButton>
              <UiButton @click="addKerningPattern" color="default">Add</UiButton>
            </div>

            <div
              :class="`kerning-pattern ${selectedPatternId === pattern.id ? 'selected' : ''}`"
              v-for="pattern in kerningPatterns"
              :key="`pattern-${pattern.id}`"
            >
              <UiCheckbox
                :value="pattern.isVisible"
                @input="v => toggleKerningPattern(pattern.id, v)"
              ></UiCheckbox>
              <div class="link" :href="`#${pattern.id}`" @click="selectPattern(pattern.id)">
                <kbd v-html="formatPatternId(pattern.name || 'new pattern')"></kbd>
              </div>
              <UiIconButton @click="removeKerningPattern(pattern.id)" color="default">
                <img svg-inline src="@/assets/icons/remove.svg" />
              </UiIconButton>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import scrollToHash from "@/utils/scrollToHash";
import kerningSegments from "@/models/kerningSegments";
import UiIconButton from "keen-ui/src/UiIconButton.vue";
import UiButton from "keen-ui/src/UiButton.vue";
import UiCheckbox from "keen-ui/src/UiCheckbox.vue";
import UiSelect from "@/components/UiSelect.vue";

export default {
  components: {
    UiIconButton,
    UiButton,
    UiSelect,
    UiCheckbox,
  },
  data() {
    return {
      builtInSegmentCharacters: ["", ...kerningSegments],
      segments: [],
      key: 0, // last used incremental unique key
      selectedPatternId: null,
      activeElement: null,
    };
  },
  computed: {
    ...mapState({
      scrolledParentSelector: state => state.layout.scrolledParentSelector,
    }),
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
  updated() {
    if (this.activeElement) {
      this.activeElement.focus();
      this.activeElement = null;
    }
  },
  methods: {
    selectPattern(id) {
      this.selectedPatternId = id;
      const pattern = this.kerningPatterns.find(p => p.id === id);

      // replace segment content in-place to avoid unnecessary transitions
      this.segments.forEach((s, i) => {
        const segment = this.segments[i];
        segment.characters = pattern.segments[i];
        this.$set(this.segments, i, segment);
      });
      pattern.segments.slice(this.segments.length).forEach(s => {
        this.addKerningSegment(null, s);
      });
      this.segments.splice(pattern.segments.length);

      const scrolled = document.querySelector(this.scrolledParentSelector);
      scrollToHash(null, scrolled, "#" + id);
    },
    getKey() {
      return ++this.key;
    },
    addKerningSegment(event, characters = "") {
      this.segments.push({ key: this.getKey(), characters });
    },
    removeKerningSegment(i) {
      this.requestVuebarFreeze(() => {
        this.segments.splice(i, 1);
        this.updateKerningPattern();
      });
    },
    addKerningPattern() {
      this.$store.dispatch("addKerningPattern", {
        segments: [ "", "" ],
      });
      this.$nextTick(() => {
        // const newPattern = this.kerningPatterns[this.kerningPatterns.length - 1];
        const newPattern = this.kerningPatterns[0];
        this.selectPattern(newPattern.id);
        const select = this.$refs.segmentSelects && this.$refs.segmentSelects[0];
        select && select.focus();
      })
    },
    updateKerningPattern() {
      if (this.selectedPatternId != null) {
        this.activeElement = document.activeElement;
        this.$store.dispatch("updateKerningPattern", {
          id: this.selectedPatternId,
          segments: this.segments.map(s => s.characters),
        });
      }
    },
    removeKerningPattern(id) {
      this.requestVuebarFreeze(() =>
        this.$store.dispatch("removeKerningPattern", { id })
      );
    },
    toggleKerningPattern(id, v) {
      this.$store.dispatch("toggleKerningPattern", { id, on: v });
    },
    resetKerningPatterns() {
      this.$store.dispatch("resetKerningPatterns");
    },
    formatPatternId(id) {
      return id.replace(/×/g, "<wbr>×").replace(/-/g, "&#x2011;");
    },
    requestVuebarFreeze(callback) {
      this.$vuebar.freezeScrollbar(this.$refs.vb);
      this.$nextTick(() => {
        callback();
      });
      setTimeout(() => this.$vuebar.unfreezeScrollbar(this.$refs.vb), 250);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/mixins";
@import "keen-ui/src/styles/imports";


.scrolled {
  padding-bottom: 2em;
}

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

.contextual-sidebar {
  .ui-icon-button {
    &:focus:not(:hover) {
      border-color: $brand-primary-color;
    }
    &--color-primary:focus:not(:hover) {
      background: mix($brand-primary-color, white, 60%);
      border: 2px solid $brand-primary-color;
    }
  }
}

.kerning-pattern {
  &:hover {
    background: rgba(#aaa, 0.2);
  }
  &:focus {
    border-bottom: 2px solid $brand-primary-color;
  }
  &.selected {
    font-weight: bold;
    background: rgba($brand-primary-color, 0.2);
    border-radius: 4px;
  }

  flex: 1;
  display: flex;

  > .ui-checkbox {
    margin: 0 0.5rem 0 0;
  }
  > .link {
    color: $light-link;
    &:hover {
      color: $light-link-hover;
      cursor: pointer;
    }
    flex: 1;
    display: flex;
    align-items: center;

    text-decoration: none;
    min-width: 0;
    text-overflow: ellipsis;
    overflow: hidden;
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
  &,
  & svg {
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
