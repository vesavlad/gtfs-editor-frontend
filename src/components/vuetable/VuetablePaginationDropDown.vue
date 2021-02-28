<template>
  <div :class="[$_css.wrapperClass]">
    <Multiselect :class="['vuetable-pagination-dropdown', $_css.dropdownClass]" :options="options" label="label"
                 track-by="value" v-model="value">
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
  computed: {
    options() {
      let options = [];
      for (let index = 0; index < this.totalPage; index++) {
        let option = {label: `${this.pageText} ${index + 1}`, value: index + this.firstPage};
        options.push(option);
      }
      return options;
    },
    value: {
      get() {
        let option = null;
        this.options.some(optionElement => {
          if (this.isCurrentPage(optionElement.value)) {
            option = optionElement;
            return true;
          }
          return false;
        });
        return option;
      },
      set(newOption) {
        if (newOption !== null) {
          this.loadPage(newOption.value);
        }
      }
    }
  }
};
</script>