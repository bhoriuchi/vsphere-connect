<template lang="pug">
  #nav.container-fullwidth
    nav.navbar
      .container
        .navbar-header
          button.navbar-toggle.mobile-hamburger(type="button", data-toggle="collapse",
          data-target="#navbar", aria-expanded="true", aria-controls="navbar",
          @click="navCollapsed = !navCollapsed")
            span.sr-only Toggle Navigation
            span.icon-bar
            span.icon-bar
            span.icon-bar
          router-link.navbar-brand(to="/")
            img(src="../assets/vsphere-connect-logo-sm.png", style="display: inline-block; height: 30px;")
            span.mobile-hide &nbsp; vSphere Connect
        #navbar.navbar-collapse.collapse
          ul.nav.navbar-nav.navbar-right
            li
              router-link(to="/faq") faq
            li
              router-link(to="/docs") docs
            li
              router-link(to="/api") api
</template>

<script type="text/babel">
  import Hub from '../hub'
  export default {
    created () {
      Hub.$on('mobilenav.collapse', () => {
        this.navCollapsed = true
      })
    },
    data () {
      return {
        navCollapsed: true
      }
    },
    watch: {
      navCollapsed (val) {
        val
          ? document.body.classList.remove('body-slide-left')
          : document.body.classList.add('body-slide-left')
        if (!val) Hub.$emit('mobilenav.show')
      },
      $route () {
        this.navCollapsed = true
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

  button.navbar-toggle .icon-bar {
    background-color: #fdfdfd;
  }

  #nav .nav-search input {
    background-color: #ffffff;
    border-radius: 4px;
    padding: 5px 10px 5px 10px;
  }

</style>
