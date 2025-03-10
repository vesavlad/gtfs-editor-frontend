<template>
  <div class="map-sidebar">
    <div class="side-table-header">
      <form class="search" @submit.stop.prevent="doSearch">
        <div class="input-group">
          <input v-model="quickSearch" type="search" :placeholder="$t('vuetable.quickSearch')" v-on:input="doSearch">
        </div>
      </form>
    </div>
    <div class="table-content">
      <Vuetable ref="vuetable" :fields="fields" :api-url="url" data-path="results" pagination-path="pagination"
                :perPage=30 
                @vuetable:pagination-data="onPaginationData" :query-params="makeQueryParams" :row-class="getRowClass">
        <div slot="actions" slot-scope="props" class="grid min center">
          <button class="btn icon btn-focus" @click="$emit('focus-shape', props.rowData);shapeWithFocus=props.rowData"
                  alt="Display shape.">
            <span class="material-icons">my_location</span>
          </button>
          <div class="btn icon flat">
            <i class="material-icons"
               @click="showMenu=!showMenu;activeShape=props.rowData">more_vert</i>
            <ShapeMenu v-if="showMenu && activeShape.id===props.rowData.id"
                       @edit="editShape()"
                       @edit-range="editRangeOfShape"
                       @duplicate="duplicateShape"
                       @delete="beginDeleteShape(props.rowData)"
                       @close="showMenu=false">
            </ShapeMenu>
          </div>
        </div>
      </Vuetable>
    </div>
    <div class="table-footer">
      <VuetablePagination ref="pagination" @vuetable-pagination:change-page="onChangePage">
      </VuetablePagination>
      <VuetablePaginationDropDown ref="paginationDropDown" @vuetable-pagination:change-page="onChangePage">
      </VuetablePaginationDropDown>
    </div>
    <MessageModal :show="deleteModal.visible" :showCancelButton="true" :okButtonLabel="$t('general.delete')"
                  :type="Enums.MessageModalType.WARNING"
                  @ok="deleteShape" @cancel="deleteModal.visible=false" @close="deleteModal.visible=false">
      <template v-slot:m-title>
        <h2> {{ $t('shape.deleteModal.title', {name: deleteModal.shape.shape_id}) }}</h2>
      </template>
      <template v-slot:m-content>
        <span>{{ deleteModal.message }}</span>
      </template>
    </MessageModal>
  </div>
</template>

<script>
import VuetablePagination from "@/components/vuetable/VueTablePagination.vue";
import VuetablePaginationDropDown from "@/components/vuetable/VuetablePaginationDropDown";
import shapesAPI from "@/api/shapes.api";
import {debounce} from "debounce";
import Enums from "@/utils/enums";
import ShapeMenu from "@/components/shape/ShapeMenu";
import MessageModal from "@/components/modal/MessageModal";

let Vuetable = require('vuetable-2')

export default {
  name: "ShapesTable",
  components: {
    MessageModal,
    ShapeMenu,
    Vuetable: Vuetable.Vuetable,
    VuetablePagination,
    VuetablePaginationDropDown
  },
  data() {
    return {
      quickSearch: "",
      doSearch: false,
      showMenu: false,
      activeShape: null,
      shapeWithFocus: {},
      deleteModal: {
        visible: false,
        message: '',
        shape: null
      },
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
      url: shapesAPI.shapesAPI.getFullBaseURL(this.projectId),
    };
  },
  props: {
    projectId: {
      required: true,
    }
  },
  methods: {
    getRowClass(rowData) {
      if (rowData.id === this.shapeWithFocus.id) {
        return 'focus';
      }
      return '';
    },
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
    beginDeleteShape(shape) {
      this.deleteModal.message = '';
      this.deleteModal.visible = true;
      this.deleteModal.shape = shape;
    },
    deleteShape() {
      shapesAPI.shapesAPI.remove(this.projectId, this.deleteModal.shape).then(() => {
        this.deleteModal = {
          shape: null,
          visible: false,
          message: "",
        }
        this.$refs.vuetable.refresh();
      }).catch(err => {
        console.log(err.response);
        this.deleteModal.message = err.response.data.message;
      })
    },
    editShape() {
      this.$router.push({
        name: 'editShape',
        params: {
          projectId: this.projectId,
          shapeId: this.activeShape.id,
          editionMode: this.Enums.ShapeEditorEditionMode.SIMPLE,
        }
      });
    },
    duplicateShape() {
      shapesAPI.shapesAPI.detail(this.projectId, this.activeShape.id).then(response => {
        let shape = response.data;
        this.$router.push({
          name: 'createShape',
          params: {
            projectId: this.projectId,
            shape: shape,
            editionMode: this.Enums.ShapeEditorEditionMode.DUPLICATE,
          }
        });
      });
    },
    editRangeOfShape() {
      this.$router.push({
        name: 'editShape',
        params: {
          projectId: this.projectId,
          shapeId: this.activeShape.id,
          editionMode: this.Enums.ShapeEditorEditionMode.SELECT_RANGE,
        }
      });
    }
  },
  mounted() {
    this.doSearch = debounce(this.refresh, 300);
  },
};
</script>
