<template lang="pug">
  transition(name="mobile-menu")
    #mobile-nav.container-fluid(v-show="show")
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
      div.sub-menu-section(v-if="$route.path.match('^/api')")
        div.search-form-container.inner-addon.right-addon
          i.glyphicon.glyphicon-search
          input(type="text", placeholder="search", v-model="search")
        div(v-for="section in apiSubMenuData")
          ul
            li
              a
                strong {{section.section}}
          ul.api-section
            li(v-for="(cmd, cmdName) in section.commands")
              router-link(:to="makeLink(cmdName)") {{cmdName}}
</template>

<script type="text/babel">
  import apiData from '@/data/api/index'
  import { forEach } from '@/assets/js/utils'
  import Hub from '../hub'
  export default {
    created () {
      Hub.$on('mobilenav.show', () => {
        this.show = true
      })
    },
    computed: {
      apiSubMenuData () {
        if (!this.search) return this.apiData
        let rx = new RegExp(this.search, 'i')
        let newData = []
        forEach(this.apiData, section => {
          let s = {
            section: section.section,
            commands: {}
          }
          forEach(section.commands, (cmd, cmdName) => {
            if (cmdName.toLowerCase().match(rx)) s.commands[cmdName] = cmd
          })
          if (Object.keys(s.commands).length) newData.push(s)
        })
        return newData
      }
    },
    methods: {
      collapseNav () {
        Hub.$emit('mobilenav.collapse')
        this.show = false
      },
      makeLink (name) {
        return !this.$route.path.match(/^\/.*\/.*/)
          ? `#about-${name}`
          : this.$route.path.replace(/^(\/.*)\/.*/, `$1/${name}`)
      }
    },
    data () {
      return {
        show: false,
        apiData,
        search: ''
      }
    },
    watch: {
      $route () {
        this.show = false
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
    overflow-y: auto;
  }

  #mobile-nav ul {
    list-style-type: none;
    padding: 0px;
    margin-bottom: 0px;
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

  #mobile-nav .search-form-container {
    padding: 10px;
  }

  #mobile-nav input[type=text] {
    width: 100%;
    padding: 8px 40px 8px 8px;
    font-size: 1.5em;
    border-radius: 4px;
  }

  #mobile-nav input[type=text]:focus {
    outline: none;
  }

  #mobile-nav .api-section {
    border-left: 6px solid #3040ad;
  }

  #mobile-nav .sub-menu-section {
    border-top: 3px solid #3040ad;
  }

  .mobile-menu-enter-active {
    transition: all .3s ease;
  }
  .mobile-menu-leave-active {
    transition: all .1s ease;
    transition-delay: .3s;
    -webkit-transition-delay: .3s;
  }
  .mobile-menu-enter {
    opacity: 1;
  }

  .mobile-menu-leave-to {
    opacity: 0;
  }
</style>
