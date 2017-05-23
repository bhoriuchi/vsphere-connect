<template lang="pug">
  div
    span.menu-header.lg vConnect command reference
    .alert.alert-soft
      strong Does this documentation look familiar?
      p It has been intentionally modeled after the RethinkDB documentation because the command structure was modeled after RethinkDB itself.

    div(v-for="section in apiData")
      span.menu-header.lg {{section.section}}
      p(v-if="section.description", v-html="section.description")
      div(v-for="(cmd, cmdName) in section.commands")
        h4.txt-bold(:id="'about-' + cmdName") {{cmdName}}
        p
          .command-params
            p.usage(v-for="usage in cmd.usage") {{usage}}
        p(v-html="cmd.description").
        p
          strong Example: &nbsp;
          | {{cmd.example.description}}.
        pre(v-syntax-highlight="cmd.example.code")
        p
          router-link.read-more(:to="'api/' + cmdName") Read more about this command →
        hr.command-split
</template>

<script type="text/babel">
  import SyntaxHighlight from '@/directives/SyntaxHighlight'
  import apiData from '@/data/api/index'
  export default {
    directives: {
      SyntaxHighlight
    },
    data () {
      return {
        apiData
      }
    }
  }
</script>
