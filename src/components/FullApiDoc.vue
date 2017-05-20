<template lang="pug">
  div
    h4 {{$route.params.command}}
    hr
    h4 Command syntax
    p
      .command-params
        | {{apiData.usage}}
    h4 Description
    p.regular-text {{apiData.description}}
</template>

<script type="text/babel">
  import ApiData from '@/data/api/index'
  import * as _ from '../assets/js/utils'

  let commands = {}

  _.forEach(ApiData, section => {
    _.forEach(section.commands, (cmd, cmdName) => {
      commands[cmdName] = cmd
    })
  })

  export default {
    created () {
      this.apiData = commands[this.$route.params.command]
    },
    data () {
      return {
        apiData: {}
      }
    }

  }
</script>

<style>
  p.regular-text {
    font-size: 1.2em;
  }
</style>
