<template>
  <h1 class="site-logo">
    <img class="logo" svg-inline src="../assets/images/logo.svg" />
    <div class="logotype">
      <span class="strong">Bulletproof</span>
      <span class="weak">Font Tester</span>
    </div>
  </h1>
</template>

<style lang="scss">
@import "@/scss/variables.scss";

h1.site-logo {
  font-weight: normal;
  font-size: 1.8em;
  @media (min-width: 1000px) {
    margin: 0 20px 0 0;
  }
  color: $light;
  display: flex;
  align-items: center;

  .logo {
    height: 2em;
    display: inline-block;
    margin: 0;
    position: relative;
    top: -3px;
    color: $light;
    path {
      fill: currentColor;
    }
  }
  .logotype {
    span {
      display: block;
    }
  }
  .strong {
    font-size: 1.035em;
    font-family: "Rywalka Bulletproof";
    line-height: 1;
  }
  .weak {
    opacity: 0.8;
    // font-family: "Alegreya Sans";
    font-weight: 500;
    font-size: 1rem;
    line-height: 1;
    text-align: center;
    letter-spacing: 1.4px;
  }
}
</style>
