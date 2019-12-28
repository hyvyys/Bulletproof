<template>
  <div
    class="language-sidebar contextual-sidebar"
    @keydown.down.capture="nextAnchor"
    @keydown.up.capture="previousAnchor"
    @keydown.enter="goToAnchor"
  >
    <div class="row row-filter">
      <label class="row-label" style="min-width: 0;">Search</label>
      <UiTextbox
        ref="filterTextbox"
        v-model="languageFilter"
        :class="languageFilter ? 'filter-textbox' : ''"
      />
      <UiIconButton
        v-show="languageFilter"
        @click="clearFilter"
        color="primary"
        class="btn-clear"
        @keydown.enter.stop
      >
        <img svg-inline src="@/assets/icons/clear.svg" />
      </UiIconButton>
    </div>

    <div class="row row-filter">
      <UiCheckbox
        :value="anySelected"
        @input="v => selectDeselectAll(v)"
      >
      </UiCheckbox>
    </div>

    <div class="language-list" v-bar="{
        preventParentScroll: true,
      }" ref="vb">
      <div class="scrolled" ref="scrolled"
        @keydown.down.capture.prevent
        @keydown.up.capture.prevent
        tabindex="-1"
      >
        <div v-for="(language, i) in languages" :key="i" class="language-item">
          <UiCheckbox
            :value="language.isSelected"
            @input="v => toggleLanguage(language.id, v)"
            tabindex="-1"
          >
          </UiCheckbox>
          <a :class="`language-link ${language.isSelected ? '' : 'disabled'}`"
            :href="`#${language.language}-${language.id}`"
            :tabindex="i > 0 ? -1 : 0"
            @focus="e => i === 0 ? highlightAnchor(e) : ''"
            @keydown.space.prevent="toggleLanguage(language.id, !language.isSelected)"
          >
            {{ language.language }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import scrollIntoView from "scroll-into-view-if-needed";
import fireEvent from "@/utils/fireEvent";
import { mapGetters } from "vuex";

import UiCheckbox from "keen-ui/src/UiCheckbox";
import UiTextbox from "keen-ui/src/UiTextbox";
import UiIconButton from "keen-ui/src/UiIconButton";

export default {
  components: {
    UiCheckbox,
    UiTextbox,
    UiIconButton,
  },
  props: {},
  computed: {
    ...mapGetters(["visibleLanguages"]),
    languages() {
      const search = this.languageFilter.toLowerCase();
      const exactStartMatches = this.visibleLanguages.filter(l =>
        l.language.toLowerCase().startsWith(search)
      );
      const otherMatches = this.visibleLanguages.filter(
        l =>
          ~l.language.toLowerCase().indexOf(search) &&
          !exactStartMatches.includes(l)
      );
      return [...exactStartMatches, ...otherMatches];
    },
    highlightedAnchor() {
      return this.anchors.length && this.highlightedAnchorIndex != null
        ? this.anchors[this.highlightedAnchorIndex]
        : null;
    },
    anySelected() {
      return this.visibleLanguages.some(l => l.isSelected);
    },
  },
  data() {
    return {
      languageFilter: "",
      highlightedAnchorIndex: null,
      anchors: [],
    };
  },
  watch: {
    languageFilter() {
      this.$nextTick(() => {
        this.anchors = this.$el.querySelectorAll(".language-link");
        this.highlightedAnchorIndex = null;
      });
    },
    highlightedAnchorIndex(val, oldVal) {
      this.$nextTick(() => {
        if (this.highlightedAnchorIndex != null) {
          oldVal != null && this.anchors[oldVal].classList.remove("highlighted");
          val != null && this.anchors[val].classList.add("highlighted");
          this.scrollAnchorIntoView();
          setTimeout(() => this.highlightedAnchor.focus(), 18);
        }
      });
    },
    anchors() {
      this.anchors.forEach((a) => {
        a.removeEventListener("click", this.highlightAnchor);
        a.addEventListener("click", this.highlightAnchor);
      })
    },
  },
  mounted() {
    this.anchors = this.$el.querySelectorAll(".language-link");
  },
  destroyed() {},
  methods: {
    clearFilter() {
      this.languageFilter = '';
      this.$refs.filterTextbox.focus();
    },
    toggleLanguage(id, checked) {
      this.$store.dispatch("selectLanguage", { id, checked });
    },
    highlightAnchor(e) {
      this.highlightedAnchorIndex = Array.from(this.anchors).indexOf(e.target);
    },
    nextAnchor() {
      if (this.anchors.length) {
        if (this.highlightedAnchorIndex == null)
          this.highlightedAnchorIndex = 0;
        else {
          const i = this.highlightedAnchorIndex + 1;
          if (i === this.anchors.length) {
            this.$refs.filterTextbox.focus();
            this.highlightedAnchorIndex = null;
          }
          else {
            this.highlightedAnchorIndex = i % this.anchors.length;
          }
        }
      }
    },
    previousAnchor() {
      if (this.anchors.length) {
        if (this.highlightedAnchorIndex == null)
          this.highlightedAnchorIndex = this.anchors.length - 1;
        else {
          const i = this.highlightedAnchorIndex - 1;
          if (i === -1) {
            this.$refs.filterTextbox.focus();
            this.highlightedAnchorIndex = null;
          }
          else {
            this.highlightedAnchorIndex = (i + this.anchors.length) % this.anchors.length;
          }
        }
      }
    },
    scrollAnchorIntoView() {
      if (this.highlightedAnchor) {
        const target = this.highlightedAnchor;
        const targetRect = target.getBoundingClientRect();
        const scrolled = this.$refs.scrolled;
        const scrolledRect = scrolled.getBoundingClientRect();
        const top = targetRect.top - scrolledRect.top;
        const bottom = -targetRect.bottom + scrolledRect.bottom;
        const padding = 10;
        const margin = 36;
        if (top < padding) {
          // scroll a bit up
          scrolled.scrollTop += top - margin;
        }
        else if (bottom < padding) {
          // scroll a full page up
          scrolled.scrollTop += top - margin;
        }
      }
        // scrollIntoView(this.highlightedAnchor, {
        //   scrollMode: "if-needed",
        //   block: "center",
        //   inline: "nearest",
        //   behavior: "smooth",
        // });
    },
    goToAnchor() {
      if (this.highlightedAnchor != null) {
        fireEvent(this.highlightedAnchor, "click");
        setTimeout(() => this.highlightedAnchor && this.highlightedAnchor.focus(), 18);

        // this.$refs.filterTextbox.focus();
      }
    },

    selectDeselectAll(checked) {
      this.$store.commit("selectDeselectAllLanguages", { checked });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/mixins";
@import "@/scss/variables";

.language-sidebar {
}

.language-list {
  overflow: hidden;
  flex: 1;
  @include scroll-veil;
}

.language-item {
  display: flex;
  .language-link {
    margin-left: 0.4em;
    &.disabled {
      text-decoration: none;
      color: unset;
    }
    &:focus {
      color: $brand-primary-color;
    }
  }
}

.ui-checkbox {
  display: inline-flex;
}

$btn-small-size: 20px;
$btn-small-margin: 2px;
$btn-small-size-inner: $btn-small-size - $btn-small-margin;

.row-filter {
  margin-bottom: 0.5em;
}

.filter-textbox {
  margin-right: -$btn-small-size;
  .ui-textbox__content {
    padding-right: $btn-small-size;
  }
}

.ui-icon-button.btn-clear {
  color: $light;
  margin: $btn-small-margin;
  width: $btn-small-size-inner;
  height: $btn-small-size-inner;
  opacity: 0.8;

  &:not(:hover):not(:focus) {
    background: #aaa;
  }

  svg {
    margin: 1px;
    width: $btn-small-size-inner;
    height: $btn-small-size-inner;
  }
}
</style>
