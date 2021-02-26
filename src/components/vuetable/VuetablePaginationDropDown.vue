<template>
  <div :class="[$_css.wrapperClass]">
    <Multiselect :class="['vuetable-pagination-dropdown', $_css.dropdownClass]" :options="options" label="label"
                 track-by="value" v-model="value" @input="setPage">
    </Multiselect>
  </div>
</template>

<script>
import VuetablePaginationDropdown from "vuetable-2/src/components/VuetablePaginationDropdown.vue";
import Multiselect from 'vue-multiselect';

export default {
  name: 'VuetablePaginationDropdown',
  extends: VuetablePaginationDropdown,
  components: {
    Multiselect
  },
  methods: {
    setPage(option) {
      this.loadPage(option.value)
    },
    getOptions() {
      let options = [];
      for (let index = 0; index < this.totalPage; index++) {
        let option = {label: `${this.pageText} ${index + 1}`, value: index + this.firstPage};
        options.push(option);
        if (this.isCurrentPage(option.value)) {
          this.value = option;
        }
      }
      return options;
    }
  },
  data() {
    return {
      value: null,
      options: []
    }
  },
  watch: {
    totalPage() {
      this.options = this.getOptions();
    }
  }
};
</script>