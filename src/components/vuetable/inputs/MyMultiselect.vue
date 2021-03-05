<script>
import Multiselect from 'vue-multiselect';

export default {
  name: 'MyMultiselect',
  extends: Multiselect,
  methods: {
    repositionDropDown() {
      const {top, width, height, left} = this.$el.getBoundingClientRect();
      document.documentElement.style.setProperty('--multiselect-width', width + 'px');
      const listEl = this.$refs.list;
      listEl.style.position = 'fixed';
      listEl.style.bottom = 'auto';
      listEl.style.top = `${top + height}px`;
      listEl.style.left = `${left}px`;
    }
  },
  mounted() {
    window.addEventListener('scroll', this.repositionDropDown);
    if (document.getElementsByClassName('table-content').length) {
      document.getElementsByClassName('table-content')[0].addEventListener('scroll', this.repositionDropDown);
    }
    this.$on('open', this.repositionDropDown);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.repositionDropDown);
    if (document.getElementsByClassName('table-content').length) {
      document.getElementsByClassName('table-content')[0].removeEventListener('scroll', this.repositionDropDown);
    }
    this.$off('open', this.repositionDropDown);
  },
};
</script>