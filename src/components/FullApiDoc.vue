<template lang="pug">
  div
    h4 vConnect command: {{$route.params.command}}

    h5 Command syntax
    pre {{apiData}}
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
