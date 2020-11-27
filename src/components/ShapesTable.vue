<template>
  <div>
    <div>
      <Vuetable ref="vuetable" :fields="fields" :api-url="url" data-path="results" pagination-path="pagination"
        @vuetable:pagination-data="onPaginationData">
        <div slot="actions" slot-scope="props" style="display: flex; flex-direction: row;">
          <button class="btn icon" @click="beginDeleteRow(props.rowData)" alt="Delete entry.">
            <span class="material-icons">delete</span>
          </button>
          <button class="btn icon" @click="beginDeleteRow(props.rowData)" alt="Delete entry.">
            <span class="material-icons">edit</span>
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
    },
    mounted() {
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

<style>
  button.ui.button {
    padding: 8px 3px 8px 10px;
    margin-top: 1px;
    margin-bottom: 1px;
  }

  div.pagination {
    width: 160px;
  }

  tr.edited {
    background: yellow !important;
    color: #ffff7d !important;
  }

  @import "../../node_modules/select2/dist/css/select2.min.css";
</style>