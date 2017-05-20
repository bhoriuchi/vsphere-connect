<script type="text/babel">
  import Prism from 'prismjs'
  export default {
    bind (el) {
      let content = el.innerHTML
        .replace(/&lt;/gm, '<')
        .replace(/&gt;/gm, '>')
      el.innerHTML = Prism.highlight(content, Prism.languages.javascript)
    }
  }
</script>
