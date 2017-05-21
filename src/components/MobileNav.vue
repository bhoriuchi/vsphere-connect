<template lang="pug">
  #mobile-nav.container-fluid
    ul
      li
        a(@click="collapseNav()")
          i.fa.fa-fw.fa-times
          span close
      li
        router-link(to="/faq")
          i.fa.fa-fw.fa-question
          span faq
      li
        router-link(to="/docs")
          i.fa.fa-fw.fa-book
          span docs
      li
        router-link(to="/api")
          i.fa.fa-fw.fa-cogs
          span api
</template>

<script type="text/babel">
  import Hub from '../hub'
  export default {
    methods: {
      collapseNav () {
        Hub.$emit('mobilenav.collapse')
      }
    }
  }
</script>

<style>
  #mobile-nav {
    position: absolute;
    top: 0px;
    padding: 10px 0px 0px 0px;
    right: -80%;
    width: 80%;
    bottom: 0px;
    text-align: left;
    background-color: #182756;
  }

  #mobile-nav ul {
    list-style-type: none;
    padding: 0px;
  }

  #mobile-nav li {
    padding: 10px 10px 10px 20px;
    border-bottom: 1px solid #3040ad;
  }

  #mobile-nav li span {
    margin-left: 10px;
  }

  #mobile-nav ul a {
    font-size: 1.5em;
  }
</style>
