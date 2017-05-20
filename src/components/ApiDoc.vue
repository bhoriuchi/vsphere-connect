<template lang="pug">
  #apidoc.container.page-container
    .row
      #command-menu.col-md-3
        span.menu-header.sm Accessing vConnect
        ul.command-list
          li
            a VConnect
          li
            a v
          li
            a changes
      #command-body.col-md-9
        span.menu-header.lg vConnect command reference
        .alert.alert-soft
          strong Does this documentation look familiar?
          p It has been intentionally modeled after the RethinkDB documentation because the command structure was modeled after RethinkDB itself.

        span.menu-header.lg Accessing vConnect
        h4.txt-bold VConnect
        p
          .command-params
            | VConnect(viserver, options) → v
        p Create a new VConnect connection and return a top-level namespace.
        p
          strong Example: &nbsp;
          | Establish a client session.
        pre(v-syntax-highlight="").
          import VConnect from 'vsphere-connect'
          let v = VConnect('vcenter.mydomain.com', {
            username: 'administrator@vsphere.local'
            password: 'vmware100'
          })
        p
          a.read-more(href="#") Read more about this command →
        hr.command-split

        h4.txt-bold v
        p
          .command-params
            | v → v
        p The top-level vConnect namespace.
        p
          strong Example: &nbsp;
          | Establish a top-level namespace.
        pre(v-syntax-highlight="").
          let v = VConnect(options)
        hr
</template>

<script type="text/babel">
  import SyntaxHighlight from '@/directives/SyntaxHighlight'
  export default {
    directives: {
      SyntaxHighlight
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
    font-size: 1.2em;
    color: #444;
  }

  a.read-more {
    border-bottom: 1px solid #dedede;
    font-size: 1.1em;
  }

  hr.command-split {
    margin-top: 30px;
  }

</style>
