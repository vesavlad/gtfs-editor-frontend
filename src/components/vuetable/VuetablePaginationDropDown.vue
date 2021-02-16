<template>
  <div :class="[$_css.wrapperClass]">
    <select :class="['vuetable-pagination-dropdown', $_css.dropdownClass]" @change="loadPage($event.target.selectedIndex+firstPage)">
      <option v-for="(n, i) in totalPage" :key="n" :class="[$_css.pageClass]" :value="i+firstPage" :selected="isCurrentPage(i+firstPage)">
        {{pageText}} {{n}}
      </option>
    </select>
  </div>
</template>

<script>
import VuetablePaginationDropdown from "vuetable-2/src/components/VuetablePaginationDropdown.vue";

export default {
  name: 'VuetablePaginationDropdown',
  extends: VuetablePaginationDropdown,
};
</script>