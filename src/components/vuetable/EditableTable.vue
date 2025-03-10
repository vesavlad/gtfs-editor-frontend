<template>
  <div>
    <div class="table-container card">
      <div class="table-header">
        <form v-if="searchable" class="search" @submit.stop.prevent="doSearch">
          <div class="input-group">
            <input v-model="quickSearch" type="search" :placeholder="$t('vuetable.quickSearch')" v-on:input="doSearch">
          </div>
        </form>
        <div class="table-total-rows"><span>{{ totalDataInTable }} {{ $t('vuetable.rows') }}</span></div>
        <div class="table-option-buttons">
          <form method="get" :action="downloadURL">
            <button class="btn flat" type="submit">
              {{ $t('vuetable.downloadCSV') }}
            </button>
          </form>
          <button class="btn flat" @click="uploadModal.visible=true;uploadModal.error='';">
            {{ $t('vuetable.uploadCSV') }}
          </button>
          <button class="btn icon flat" @click="settings.show=true">
            <i class="material-icons">settings</i>
          </button>
        </div>
      </div>
      <div class="table-content">
        <vuetable ref="vuetable" :api-url="url" :multi-sort="true"
                  :fields="getFieldsWithVisibility()" data-path="results"
                  pagination-path="pagination" @vuetable:pagination-data="onPaginationData"
                  :perPage=30 
                  :query-params="makeQueryParams" :row-class="getRowClass" :transform="transformData" :css="css"
                  @vuetable:load-success="updateTotalDataLabel">
          <template slot="tableHeader">
            <VuetableRowHeader></VuetableRowHeader>
          </template>
          <div slot="actions" slot-scope="props" class="grid min center">
            <button class="btn icon flat warning" @click="setActiveRow(props.rowData)">
              <span class="material-icons">edit</span>
            </button>
            <button class="btn icon flat error" @click="beginDeleteRow(props.rowData)">
              <span class="material-icons">delete</span>
            </button>
            <slot name="additional-actions" v-bind:rowData="props.rowData" v-bind:rowField="props.rowField"
                  v-bind:rowIndex="props.rowIndex"></slot>
          </div>
          <!-- This is where the fields are converted into inputs to make the table editable.
               We build slots for every field and inside change html with input and logic -->
          <template v-for="(field, index) in cleanFields" :slot="field.name" slot-scope="properties">
            <GeneralizedInput :readonly="vuetable.activeRow.id!==properties.rowData.id" :key="index"
                              :data="properties.rowData" :field="properties.rowField"
                              v-model="properties.rowData[getFieldID(properties.rowField)]"
                              v-on:input="changeHandler(properties)"
                              :errors="$refs.vuetable.tableData[properties.rowIndex].errors">
            </GeneralizedInput>
          </template>
        </vuetable>
      </div>
      <div class="table-footer">
        <div class="grid-pagination">
          <VuetablePagination ref="pagination" @vuetable-pagination:change-page="onChangePage">
          </VuetablePagination>
          <VuetablePaginationDropDown ref="paginationDropDown" :pageText="$t('vuetable.page')"
                                      @vuetable-pagination:change-page="onChangePage">
          </VuetablePaginationDropDown>
        </div>
        <div class="table-errors">aquí poner error global</div>
        <div class="table-footer-buttons">
          <button class="btn green" @click="saveChanges"><span>{{ $t('vuetable.save') }}</span></button>
          <slot name="additional-buttons"></slot>
          <button class="btn" @click="createModal.visible=true"><span>{{ $t('vuetable.addRow') }}</span><i
              class="material-icons">add</i>
          </button>
        </div>
      </div>
    </div>
    <BaseModal :show="uploadModal.visible" @close="uploadModal.visible = false">
      <template v-slot:m-content>
        <div class="m-header">
          <h2>Upload CSV</h2>
        </div>
        <div class="m-content">
          <span>Upload CSV file.</span><br/>
          <span v-if="uploadModal.error" class="error">{{ uploadModal.error }}</span>
          <FileReader @load="uploadCSVFile($event)"></FileReader>
        </div>
      </template>
    </BaseModal>
    <InputDataModal :show="createModal.visible" :title="$t('vuetable.newEntityTitle')" :initialData="createModal.data"
                    :errors="createModal.errors" :fields="cleanFields" @save="createEntry"
                    @close="createModal.visible=false" @cancel="createModal.visible=false">
    </InputDataModal>
    <MessageModal :show="deleteModal.visible" @ok="deleteRow" @cancel="deleteModal.visible = false"
                  @close="deleteModal.visible = false" :showCancelButton="true" :okButtonLabel="$t('general.delete')"
                  :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>Are you sure you want to delete this row?</h2>
      </template>
      <template v-slot:m-content>
        <span>
          {{ deleteModal.message }}
        </span>
      </template>
    </MessageModal>
    <VuetableSettingsModal :show="settings.show" @close="settings.show=false" :fields="fields"></VuetableSettingsModal>
  </div>
</template>


<script>
import Enums from "@/utils/enums";
import FileReader from "@/components/FileReader.vue";
import errorMessageMixin from "@/mixins/errorMessageMixin.js";
import fieldMixin from "@/mixins/fieldMixin.js";
import VuetablePagination from "@/components/vuetable/VueTablePagination.vue";
import GeneralizedInput from "@/components/vuetable/inputs/GeneralizedInput.vue";
import VuetableRowHeader from "@/components/vuetable/VuetableRowHeader.vue";
import VuetablePaginationDropDown from "@/components/vuetable/VuetablePaginationDropDown.vue";
import VuetableSettingsModal from '@/components/vuetable/VuetableSettingsModal.vue';
import InputDataModal from "@/components/modal/InputDataModal.vue";

import {debounce} from "debounce";
import BaseModal from "@/components/modal/BaseModal";
import MessageModal from "@/components/modal/MessageModal";

let Vuetable = require('vuetable-2')

export default {
  name: "EditableTable",
  components: {
    MessageModal,
    BaseModal,
    Vuetable: Vuetable.Vuetable,
    VuetablePagination,
    VuetablePaginationDropDown,
    FileReader,
    GeneralizedInput,
    VuetableRowHeader,
    VuetableSettingsModal,
    InputDataModal
  },
  mixins: [
    errorMessageMixin,
    fieldMixin
  ],
  data() {
    let created_data = {};
    if (this.cleanFields) {
      this.cleanFields.forEach(field => this.setDefaultCreationValue(field, created_data));
    }
    return {
      deleteModal: {
        visible: false,
        data: {},
        message: ''
      },
      createModal: {
        data: created_data,
        errors: {},
        visible: false,
      },
      uploadModal: {
        error: "",
        visible: false,
      },
      vuetable: {
        activeRow: {}
      },
      test: true,
      quickSearch: this.$route.query.search ? this.$route.query.search : '',
      hasChanged: false,
      current_page: -1000,
      last_page: -1000,
      doSearch: false,
      css: {
        ascendingIcon: 'expand_less',
        descendingIcon: 'expand_more',
        ascendingClass: 'active',
        sortableIcon: 'expand_more',
        renderIcon(classes) {
          return `<span class="material-icons">${classes[1]}</span>`
        }
      },
      totalDataInTable: 0,
      settings: {
        show: false
      }
    };
  },
  props: {
    fields: {
      type: Array,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    createMethod: {
      type: Function,
      required: true,
    },
    updateMethod: {
      type: Function,
      required: true,
    },
    deleteMethod: {
      type: Function,
      required: true,
    },
    uploadCSV: {
      type: Function,
      required: true,
    },
    downloadURL: {
      type: String,
      required: true,
    },
    searchable: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    cleanFields() {
      /* ignore all fields which type value is null, it is used to removed action column */
      return this.fields.filter(field => field.type !== null);
    }
  },
  methods: {
    setActiveRow(rowData) {
      this.vuetable.activeRow = rowData;
    },
    updateTotalDataLabel(response) {
      this.totalDataInTable = response.data.pagination.total.toLocaleString();
    },
    getFieldsWithVisibility() {
      return this.fields.map(field => {
        let value = JSON.parse(window.localStorage.getItem(field.name));
        let visible = value === null ? true : value;
        return {...field, ...{visible}};
      });
    },
    setDefaultCreationValue(field, data = this.createModal.data) {
      if (field.foreignKey) {
        data[field.name] = null;
      } else if (field.options) {
        data[field.name] = Object.values(field.options)[0];
      } else if (field.type) {
        let def = "";
        if (field.type === Enums.InputType.CHECKBOX) {
          def = false;
        } else if (field.type === Enums.InputType.COLOR) {
          def = "#000000"
        }
        data[field.name] = def;
      } else {
        data[field.name] = '';
      }
    },
    changeHandler(props) {
      this.hasChanged = true;
      props.rowData.changed = true;
      props.rowData.error = false;
    },
    async saveChanges() {
      let data = this.$refs.vuetable.tableData;

      data.filter(row => row.changed).map(row => {
        for (let i = 0; i < this.fields.length; i++) {
          let field = this.fields[i];
          let fieldName = field.name;

          if (row[fieldName] === '') {
            row[fieldName] = null;
          }
        }
        this.updateMethod(row).then(response => {
          row.changed = false;
          row.error = false;
          row.errors = {};
          this.$emit('update', response.data);
          this.reRender();
          this.vuetable.activeRow = {};
        }).catch(error => {
          let response = error.response;
          row.error = true;
          row.errors = response.data;
          this.reRender();
        });
      });
    },
    reRender() {
      this.$refs.vuetable.setData(
          [...this.$refs.vuetable.$data.tableData]
      );
    },
    transformData(data) {
      data.results = data.results.map(result => {
        return {
          error: false,
          errors: {},
          changed: false,
          ...result,
        }
      })
      return data;
    },
    beginDeleteRow(data) {
      this.deleteModal.visible = true;
      this.deleteModal.data = data;
    },
    deleteRow() {
      let data = this.deleteModal.data;
      this.deleteMethod(data).then(() => {
        this.reloadTable();
        this.deleteModal.visible = false;
        this.deleteModal.data = {};
        this.deleteModal.message = "";
      }).catch((err) => {
        let data = err.response.data;
        this.deleteModal.message = data.message;
      });
    },
    createEntry(data) {
      this.cleanFields.forEach(field => {
        if (data[field.name] === '') {
          data[field.name] = null;
        }
      });
      this.createMethod(data).then(response => {
        console.log(response);
        this.createModal.visible = false;
        this.reloadTable();
        this.createModal.errors = {};
        this.cleanFields.forEach(field => {
          if (field instanceof Object) {
            if (!field.remember_creation_value) {
              this.setDefaultCreationValue(field);
            }
          } else {
            this.setDefaultCreationValue(field);
          }
        });
      }).catch(error => {
        console.log(error.response.data);
        this.createModal.errors = error.response.data;
      });
    },
    uploadCSVFile(file) {
      this.uploadCSV(file).then(response => {
        console.log(response);
        this.uploadModal.visible = false;
        this.reloadTable();
      }).catch(error => {
        console.log(error.response);
        this.uploadModal.error = error.response.data;
      });
    },
    getSortParam(sortOrder) {
      let query = sortOrder.map(function (sort) {
        return sort.field + +sort.direction
      }).join('&');
      console.log(query);
      return query;
    },
    hasUnsavedChanges() {
      return this.$refs.vuetable.$data.tableData.reduce((changed, row) => row.changed || changed, false);
    },
    getRowClass(data) {
      if (data.error) return 'error';
      if (data.changed) return 'changed';
      return '';
    },
    onChangePage(page) {
      if (page === this.current_page) {
        return;
      }
      if (this.hasUnsavedChanges()) {
        let answer = window.confirm("There are unsaved changes, are you sure you want to proceed?");
        if (!answer) {
          return;
        }
      }
      this.$refs.vuetable.changePage(page);
      this.$nextTick(() => this.$refs.vuetable.$data.tableData.forEach(row => {
        row.changed = false;
        row.error = false;
      }));
    },
    onPaginationData(paginationData) {
      if (paginationData.current_page !== this.current_page || paginationData.last_page !== this.last_page) {
        this.current_page = paginationData.current_page;
        this.last_page = paginationData.last_page;
        this.$refs.pagination.setPaginationData(paginationData);
        this.$refs.paginationDropDown.setPaginationData(paginationData);
      }
    },
    reloadTable() {
      this.$refs.vuetable.reload();
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
    }
  },
  created() {
    this.doSearch = debounce(this.reloadTable, 300);
  },
};
</script>
