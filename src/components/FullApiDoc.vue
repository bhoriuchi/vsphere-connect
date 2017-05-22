<template lang="pug">
  div
    h4
      i.fa.fa-fw.fa-terminal
      | &nbsp;{{$route.params.command}}
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
          code {{formatParam(param, paramName)}}
          | { {{param.type}} } - &nbsp;
          span(v-html="param.description")
          ul(v-if="param.fields")
            li(v-for="(field, fieldName) in param.fields")
              code {{formatParam(field, fieldName)}}
              | { {{field.type}} } - &nbsp;
              span(v-html="field.description")
    hr
    p.regular-text.content-section(v-if="apiData.example")
      strong Example:
      | &nbsp;{{apiData.example.description}}
      p
        pre(v-syntax-highlight="apiData.example.code")
    div(v-for="content in apiData.content")

      div(v-if="content.type === 'example'")
        p.regular-text.content-section
          strong Example:
          | &nbsp;{{content.description}}
          p
            pre(v-syntax-highlight="content.code")

      div.content-section.regular-text(v-if="content.type === 'html'", v-html="content.html")

      div.content-section(v-if="content.type === 'code'")
        pre(v-syntax-highlight="content.code")
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
    mounted () {
      window.scrollTo(0, 0)
    },
    directives: {
      SyntaxHighlight
    },
    methods: {
      formatParam (param, paramName) {
        if (param.optional) {
          if (param.default !== undefined) {
            switch (typeof param.default) {
              case String:
                return `[${paramName}="${param.default}"]`
              case Object:
                return `[${paramName}="${JSON.stringify(param.default)}"]`
              default:
                return `[${paramName}=${param.default}]`
            }
          }
          return `[${paramName}]`
        }
        return paramName
      }
    },
    computed: {
      apiData () {
        return commands[this.$route.params.command]
      }
    }
  }
</script>

<style>
  .regular-text {
    font-size: 1.2em;
  }

  h4.section, .content-section {
    margin-top: 40px;
  }
</style>
