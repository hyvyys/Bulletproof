<template>
  <div class="scroll-panel">
    <div v-bar="{ preventParentScroll: true }">
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>
