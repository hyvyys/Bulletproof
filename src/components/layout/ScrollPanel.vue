<template>
  <div>
    <div v-bar="{ preventParentScroll: true }">
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>
