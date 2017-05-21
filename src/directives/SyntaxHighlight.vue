<script type="text/babel">
  import Prism from 'prismjs'

  export default {
    bind (el, binding) {
      el.innerHTML = Prism.highlight(binding.value, Prism.languages.javascript)
    },
    update (el, binding) {
      el.innerHTML = Prism.highlight(binding.value, Prism.languages.javascript)
    }
  }
</script>
