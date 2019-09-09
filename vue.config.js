module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",
  devServer: {
    // writeToDisk: true, // https://webpack.js.org/configuration/dev-server/#devserverwritetodisk-
  },
  // transpileDependencies: [
  //   /\bkeen-ui\b/
  // ],

  css: {
    loaderOptions: {
      sass: {
        data: `@import "~@/scss/variables.scss";`
      }
    }
  },

  parallel: false,

  configureWebpack: config => {
    config.node = {fs: "empty"};
  },

  chainWebpack: config => {
    config.resolve.symlinks(false);

    // config.module.rule('worker')
    //   .test(/\.worker\.js$/i)
    //   .use('worker-loader')
    //   .loader('worker-loader');

    const MarkdownIt = require("markdown-it");
    const md = new MarkdownIt();
    config.module
      .rule("md1")
      .test(/\.md/)
      .use("vue-loader")
      .loader("vue-loader")
      .end();

    config.module
      .rule("md2")
      .test(/\.md/)
      .use("ware-loader")
      .loader("ware-loader")
      // .enforce('pre')
      .options({
        raw: true,
        middleware(source) {
          return `<template><div>${md.render(source)}</div></template>`;
        }
      });

    config.module
      .rule("vue")
      .use("vue-svg-inline-loader")
      .loader("vue-svg-inline-loader")
      .options({});
  }
};
