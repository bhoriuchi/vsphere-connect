<template lang="pug">
  #nav.container-fullwidth
    nav.navbar
      .container
        .navbar-header
          button.navbar-toggle.collapsed(type="button")
            span.sr-only Toggle Navigation
            span.icon-bar
            span.icon-bar
            span.icon-bar
          a.navbar-brand(href="#") vSphere Connect
        #navbar.navbar-collapse.collapse
          ul.nav.navbar-nav.navbar-right
            li
              router-link(to="FAQ") faq
            li
              router-link(to="Docs") docs
            li
              router-link(to="API") api
</template>

<script type="text/babel">
  export default {

  }
</script>

<style>
  #nav nav.navbar {
    padding: 8px;
    background-color: #234884;
    border-radius: 0px;
    box-shadow: none;
    margin: 0px;
  }

  #nav ul.nav li a {
    font-weight: bold;
    font-size: 1.4em;
    color: #fdfdfd !important;
  }

  #nav ul.nav li a:hover,
  #nav ul.nav li a:active,
  #nav ul.nav li a:focus {
    background-color: transparent;
  }

  #nav ul.nav li a:hover {
    color: #2196f3 !important;
  }

  #nav .navbar-brand {
    font-weight: bold;
    color: #fdfdfd !important;
  }

  #nav .router-link-active {
    text-decoration: none;
  }

  #nav .router-link-active:after {
    position: absolute;
    height: 1px;
    margin: 0 auto;
    content: '';
    left: 0;
    right: 0;
    width: 80%;
    opacity: 0.5;
    color: #000;
    background-color: #2196f3;
    left: 0;
    bottom: 15px; /* adjust this to move up and down. you may have to adjust the line height of the paragraph if you move it down a lot. */
  }

</style>
