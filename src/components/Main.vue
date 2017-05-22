<template lang="pug">
  #main.container-fullwidth
    #jumbo.jumbotron
      h2 A modern vSphere client
      h3 Inspired by RethinkDB
      a.btn.btn-lg.btn-primary(id="gitbutton", href="https://github.com/bhoriuchi/vsphere-connect")
        i.fa.fa-lg.fa-code
        span &nbsp;Code on GitHub
</template>

<script type="text/babel">
  export default {

  }
</script>

<style>
  #main {
    top: -2px;
    position: relative;
  }

  #jumbo {
    color: #fdfdfd;
    background-color: #234884;
  }

  #jumbo h2 {
    color: #fdfdfd;
    font-weight: bold;
  }

  #jumbo h3 {
    color: #fdfdfd;
  }

  #gitbutton {
    margin-top: 40px;
    margin-bottom: 40px;
    background-color: #4ba2b9;
    font-weight: bold;
    padding: 15px;
  }

  #gitbutton span {
    vertical-align: middle;
    display: inline-block;
  }
</style>
