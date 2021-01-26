<template>
  <div>
    <form class="form-inline d-flex mx-1 justify-content-end search" @submit.stop.prevent="doSearch">
      <div class="input-group">
        <input v-model="quickSearch" type="search" placeholder="Quick search" v-on:input="doSearch">
      </div>
    </form>
    <div>
      <Vuetable ref="vuetable" :fields="fields" :api-url="url" data-path="results" pagination-path="pagination"
        @vuetable:pagination-data="onPaginationData" :query-params="makeQueryParams">
        <div slot="actions" slot-scope="props" class="flex">
          <button class="btn icon" @click="$emit('delete-shape', props.rowData)" alt="Delete shape.">
            <span class="material-icons">delete</span>
          </button>
          <button class="btn icon" @click="$emit('edit-shape', props.rowData)" alt="Edit shape.">
            <span class="material-icons">edit</span>
          </button>
          <button class="btn icon" @click="$emit('focus-shape', props.rowData)" alt="Display shape.">
            <span class="material-icons">remove_red_eye</span>
          </button>
        </div>
      </Vuetable>
    </div>
    <VuetablePagination ref="pagination" @vuetable-pagination:change-page="onChangePage">
    </VuetablePagination>
    <VuetablePaginationDropDown ref="paginationDropDown" @vuetable-pagination:change-page="onChangePage">
    </VuetablePaginationDropDown>
  </div>

</template>




<script>
  import $ from 'jquery';
  import 'select2';
  let Vuetable = require('vuetable-2')
  import VuetablePagination from "@/components/VueTablePagination.vue";
  import shapesAPI from "@/api/shapes.api";
  import {
    debounce
  } from "debounce";
  export default {
    name: "ShapesTable",
    components: {
      Vuetable: Vuetable.Vuetable,
      VuetablePagination,
      VuetablePaginationDropDown: Vuetable.VuetablePaginationDropDown,
    },
    mixins: [],
    data: function () {
      return {
        quickSearch: "",
        doSearch: false,
        fields: [
          "actions",
          {
            name: "shape_id",
            title: "Shape ID",
          },
          {
            name: "point_count",
            title: "Point Count",
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
          this.$nextTick(() => {
            $(".vuetable-pagination-dropdown").val(this.current_page).trigger('change');
          });
        }
      },
      onChangePage(page) {
        if (page == this.current_page) {
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
      this.$nextTick(() => {
        $("select.vuetable-pagination-dropdown").select2({
          matcher(query, option) {
            if (query.term) {
              return String(option.id).startsWith(query.term) ? option : null;
            }
            return option;
          }
        }).on('change', (evt) => this.$refs.pagination.loadPage(evt.target.value));
      });
    },
  };
</script>
