<script type="text/babel">
  import Prism from 'prismjs'
  export default {
    bind (el) {
      el.innerHTML = Prism.highlight(el.innerHTML, Prism.languages.javascript)
    }
  }
</script>
