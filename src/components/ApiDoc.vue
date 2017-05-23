<template lang="pug">
  #apidoc.container.page-container
    .row
      #command-menu.col-md-3.mobile-hide
        .form-group
          .input-group
            input.form-control(type="text", placeholder="Filter commands", v-model="search")
            i.input-group-addon.glyphicon.glyphicon-filter
        div(v-for="section in filteredApi")
          span.menu-header.sm {{section.section}}
          ul.command-list
            li(v-for="(cmd, cmdName) in section.commands")
              router-link(:to="makeLink(cmdName)") {{cmdName}}
      #command-body.col-md-9(v-if="!$route.params.commands")
        router-view
</template>

<script type="text/babel">
  import apiData from '@/data/api/index'
  import { forEach } from '@/assets/js/utils'
  export default {
    computed: {
      filteredApi () {
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
      makeLink (name) {
        return this.$route.params.command
          ? `/api/${name}`
          : `#about-${name}`
      },
      scrollToSection (id) {
        document.getElementById(`about-${id}`).scrollIntoView()
      }
    },
    data () {
      return {
        apiData,
        search: ''
      }
    },
    watch: {
      $route (val) {
        if (val.path === '/api' && val.hash) {
          document.getElementById(val.hash.replace(/^#/, '')).scrollIntoView()
        }
      }
    }
  }
</script>

<style>
  #command-menu, #command-body {
    text-align: left;
  }

  #command-menu {
    margin-top: 10px;
  }

  span.menu-header {
    opacity: 0.7;
  }

  span.menu-header.sm {
    font-size: 1.1em;
    font-weight: 600;
  }

  span.menu-header.lg {
    font-size: 2em;
    font-weight: 500;
  }

  #command-menu ul.command-list {
    list-style-type: none;
    border-left: 1px solid #eee;
    margin: 0;
    padding-left: 1em;
  }

  div.command-params {
    border-left: 3px solid #eee;
    padding-left: 10px;
    font-size: 1.1em;
    color: #444;
    font-family: monospace;
  }

  a.read-more {
    border-bottom: 1px solid #dedede;
    font-size: 1.1em;
  }

  hr.command-split {
    margin-top: 30px;
  }

</style>
