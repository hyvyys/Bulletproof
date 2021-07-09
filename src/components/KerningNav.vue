<template>
  <div class="kerning-nav contextual-sidebar u-flex-v">
    <div>
      <div class="scrolled">
        <transition-group name="fade" class="fade-transition-group" tag="div">

          <KerningEditor key="pattern-editor"
            :segments="segments"
            @addKerningSegment="addKerningSegment"
            @removeKerningSegment="i => removeKerningSegment(i)"
            @updateKerningPattern="updateKerningPattern"
          />

          <div class="nav panel" key="pattern-list">
            <transition-group name="fade" class="fade-transition-group" tag="div">

              <div class="row" key="heading">
                <h3>Patterns</h3>
                <UiIconButton @click="addKerningPattern" color="primary" size="small">
                  <img svg-inline src="@/assets/icons/add.svg" />
                </UiIconButton>
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

                <!-- <div class="link" :href="`#${pattern.id}`" @click="selectPattern(pattern.id)" tabindex="0">
                  <kbd :title="pattern.id"
                  v-html="formatPatternId(pattern.name || 'new pattern')"></kbd>
                </div> -->

                <a class="link" :href="`#${pattern.id}`" @click="selectPattern(pattern.id)" tabindex="0">
                  <kbd :title="pattern.id"
                  v-html="formatPatternId(pattern.name || 'new pattern')"></kbd>
                </a>

                <UiIconButton @click="removeKerningPattern(pattern.id)" color="default" class="border" size="small">
                  <img svg-inline src="@/assets/icons/remove.svg" />
                </UiIconButton>
              </div>

              <div class="btn-group" key="revertBtn">
                <UiButton @click="revertKerningPatterns" color="default">Revert</UiButton>
                <UiButton @click="clearKerningPatterns" color="default" :disabled="kerningPatterns.length === 0">Clear</UiButton>
              </div>

            </transition-group>
          </div>

          <a key="help" target="_blank" rel="noopener noreferrer" href="/help/kerning" class="help-link">
            <img svg-inline src="@/assets/icons/info.svg" class="help-icon" />
            <span>
              Help
            </span>
          </a>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import scrollToHash from "@/utils/scrollToHash";
import UiIconButton from "keen-ui/src/UiIconButton.vue";
import UiButton from "keen-ui/src/UiButton.vue";
import UiCheckbox from "keen-ui/src/UiCheckbox.vue";
import KerningEditor from "@/components/KerningEditor.vue";

export default {
  components: {
    UiIconButton,
    UiButton,
    UiCheckbox,
    KerningEditor,
  },
  data() {
    return {
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
  mounted() {
    if (this.kerningPatterns.length && this.selectedPatternId == null) {
      this.selectPattern(this.kerningPatterns[0].id);
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

      // const scrolled = document.querySelector(this.scrolledParentSelector);
      // scrollToHash(null, scrolled, "#" + id);
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
        const newPattern = this.kerningPatterns[0];
        this.selectPattern(newPattern.id);
      });
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
    clearKerningPatterns() {
      this.requestVuebarFreeze(() => {
        this.$store.dispatch("clearKerningPatterns");
        document.querySelector(this.scrolledParentSelector).scrollTop = 0;
      });
    },
    revertKerningPatterns() {
      this.$store.dispatch("revertKerningPatterns");
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

.right {
  flex: 0 0 auto;
  margin-left: auto;
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
    > * {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  > :not(:last-child) {
    margin-right: 0.5rem;
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
