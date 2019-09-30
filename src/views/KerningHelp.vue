<template>

  <div class="help-topic">

    <div class="help">
      <div class="reading">
        <h2 class="help-heading">
          <router-link :to="`/help`">Help / </router-link>Kerning string generator
        </h2>
        <Kerning />
      </div>
    </div>

    <div class="example">
      <h2>Try it out</h2>
      <transition-group name='fade'>
        <KerningEditor
          key="editor"
          :segments="segments"
          @addKerningSegment="addKerningSegment"
          @removeKerningSegment="i => removeKerningSegment(i)"
        />

        <div class="row" key="title">
          <h3>
            Output
          </h3>
        </div>

        <div key="string">
          <div v-for="(line, i) in kerningStringLines" :key="i">
            {{ line }}
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import KerningGenerator from "@/models/KerningGenerator";

import KerningEditor from "@/components/KerningEditor.vue";
import Kerning from "./Kerning.md";

export default {
  components: {
    Kerning,
    KerningEditor,
  },
  data() {
    return {
      segments: [],
      key: 0,
    }
  },
  computed: {
    kerningStringLines() {
      const segments = this.segments.map(s => s.characters);
      const { sets, closures } = KerningGenerator.sets(segments);
      const pattern = { segments, sets, closures };
      return KerningGenerator.kerningString(pattern);
    },
  },
  mounted() {
    this.addKerningSegment(null, "A-Z");
    this.addKerningSegment(null, "aeiou");
  },
  methods: {
    addKerningSegment(event, characters = "") {
      this.segments.push({ key: this.getKey(), characters });
    },
    getKey() {
      return ++this.key;
    },
    removeKerningSegment(i) {
      this.segments.splice(i, 1);
    },
  },
}
</script>

<style lang="scss" scoped>
@import "keen-ui/src/styles/imports";

.kerning-editor {
  margin-bottom: 0.5em;
}
</style>
