import 'bootstrap/dist/js/bootstrap.bundle';
window.bootstrap = require("bootstrap");

import '@/styles/index.scss'

import(/* webpackChunkName: "js/base" */ './base.js').then(home => {
  home.initHome();
});