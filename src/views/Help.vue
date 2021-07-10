<template>
  <div class="help-topic">
    <div class="help">
      <div class="reading">
        <h2>Help pages</h2>
        <ol>
          <li>
            <router-link :to="`/help/animation`">Animation editor</router-link>
          </li>
          <li>
            <router-link :to="`/help/kerning`">Kerning string editor</router-link>
          </li>
          <li>
            <router-link :to="`/help/query-string`">Preloading custom fonts</router-link>
          </li>
        </ol>
      </div>
    </div>
    <div class="example"/>
  </div>
</template>
