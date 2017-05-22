<template lang="pug">
  div
    h4 Command: {{$route.params.command}}
    hr
    h4.section Command syntax
    p
      .command-params
        p.usage(v-for="usage in apiData.usage") {{usage}}
    h4.section Description
    p.regular-text(v-html="apiData.description")
    div(v-if="apiData.params")
      h4.section Parameters
      ul
        li(v-for="(param, paramName) in apiData.params")
          code {{param.optional === true ? '[' + paramName + ']' : paramName}}
          | { {{param.type}} } - &nbsp;
          span(v-html="param.description")
          ul(v-if="param.fields")
            li(v-for="(field, fieldName) in param.fields")
              code {{field.optional === true ? '[' + fieldName + ']' : fieldName}}
              | { {{field.type}} } - &nbsp;
              span(v-html="field.description")
    hr
    p.regular-text(v-if="apiData.example")
      strong Example:
      | &nbsp;{{apiData.example.description}}
      p
        pre(v-syntax-highlight="apiData.example.code")

</template>

<script type="text/babel">
  import SyntaxHighlight from '@/directives/SyntaxHighlight'
  import ApiData from '@/data/api/index'
  import * as _ from '../assets/js/utils'

  let commands = {}

  _.forEach(ApiData, section => {
    _.forEach(section.commands, (cmd, cmdName) => {
      commands[cmdName] = cmd
    })
  })

  export default {
    directives: {
      SyntaxHighlight
    },
    computed: {
      apiData () {
        return commands[this.$route.params.command]
      }
    }
  }
</script>

<style>
  p.regular-text {
    font-size: 1.2em;
  }

  h4.section {
    margin-top: 40px;
  }
</style>
