<template>
  <div class="side-panel">
    <div class="side-table-header">
      <form class="search" @submit.stop.prevent="doSearch">
        <div class="input-group">
          <input v-model="quickSearch" type="search" placeholder="Quick search" v-on:input="doSearch">
        </div>
      </form>
    </div>
    <div class="table-content">
      <Vuetable ref="vuetable" :fields="fields" :api-url="url" data-path="results" pagination-path="pagination"
                @vuetable:pagination-data="onPaginationData" :query-params="makeQueryParams">
        <div slot="actions" slot-scope="props" class="flex">
          <button class="btn icon flat error" @click="$emit('delete-shape', props.rowData)" alt="Delete shape.">
            <span class="material-icons">delete</span>
          </button>
          <button class="btn icon flat" @click="$emit('edit-shape', props.rowData)" alt="Edit shape.">
            <span class="material-icons">edit</span>
          </button>
          <button class="btn icon flat" @click="$emit('focus-shape', props.rowData)" alt="Display shape.">
            <span class="material-icons">remove_red_eye</span>
          </button>
        </div>
      </Vuetable>
    </div>
    <div class="table-footer">
      <div class="grid-pagination">
        <VuetablePagination ref="pagination" @vuetable-pagination:change-page="onChangePage">
        </VuetablePagination>
        <VuetablePaginationDropDown ref="paginationDropDown" @vuetable-pagination:change-page="onChangePage">
        </VuetablePaginationDropDown>
      </div>
    </div>
  </div>
</template>

<script>
import VuetablePagination from "@/components/vuetable/VueTablePagination.vue";
import VuetablePaginationDropDown from "@/components/vuetable/VuetablePaginationDropDown";
import shapesAPI from "@/api/shapes.api";
import {debounce} from "debounce";
import Enums from "@/utils/enums";

let Vuetable = require('vuetable-2')

export default {
  name: "ShapesTable",
  components: {
    Vuetable: Vuetable.Vuetable,
    VuetablePagination,
    VuetablePaginationDropDown
  },
  data: function () {
    return {
      quickSearch: "",
      doSearch: false,
      infoURL: "https://developers.google.com/transit/gtfs/reference#shapestxt",
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
        {
          name: "shape_id",
          title: "Shape ID",
          type: Enums.InputType.INPUT
        },
        {
          name: "point_count",
          title: "Point Count",
          type: Enums.InputType.INPUT
        },
      ],
      url: shapesAPI.shapesAPI.getFullBaseURL(this.project),
    };
  },
  props: {
    project: {
      required: true,
    }
  },
  methods: {
    onPaginationData(paginationData) {
      if (paginationData.current_page !== this.current_page || paginationData.last_page !== this.last_page) {
        this.current_page = paginationData.current_page;
        this.last_page = paginationData.last_page;
        this.$refs.pagination.setPaginationData(paginationData);
        this.$refs.paginationDropDown.setPaginationData(paginationData);
      }
    },
    onChangePage(page) {
      if (page === this.current_page) {
        return;
      }
      this.$refs.vuetable.changePage(page);
    },
    refresh() {
      this.$refs.vuetable.refresh();
    },
    makeQueryParams(sortOrder, currentPage, perPage) {
      let sorting = ""
      if (sortOrder.length > 0) {
        sorting = sortOrder[0].sortField + "|" + sortOrder[0].direction;
      }
      return {
        sort: sorting,
        page: currentPage,
        per_page: perPage,
        search: this.quickSearch,
      }
    },
  },
  mounted() {
    this.doSearch = debounce(this.refresh, 300);
  },
};
</script>
