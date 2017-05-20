<template lang="pug">
  #nav.container-fullwidth
    nav.navbar
      .container
        .navbar-header
          button.navbar-toggle.mobile-hamburger(type="button", data-toggle="collapse",
          data-target="#navbar", aria-expanded="true", aria-controls="navbar",
          :class="{ collapsed: navCollapsed }", @click="navCollapsed = !navCollapsed")
            span.sr-only Toggle Navigation
            span.icon-bar
            span.icon-bar
            span.icon-bar
          router-link.navbar-brand(to="main") vSphere Connect
        #navbar.navbar-collapse.collapse(:class="{ in: !navCollapsed }")
          ul.nav.navbar-nav.navbar-right
            li
              router-link(to="/faq") faq
            li
              router-link(to="/docs") docs
            li
              router-link(to="/api") api
</template>

<script type="text/babel">
  export default {
    data () {
      return {
        navCollapsed: true
      }
    }
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
    bottom: 0; /* adjust this to move up and down. you may have to adjust the line height of the paragraph if you move it down a lot. */
  }

  .mobile-hamburger {
    background-color: #fdfdfd;
  }

  .mobile-hamburger .icon-bar {
    background-color: #666;
  }

</style>
