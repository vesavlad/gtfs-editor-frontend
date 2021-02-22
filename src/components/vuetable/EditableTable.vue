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
                  :query-params="makeQueryParams" :row-class="getRowClass" :transform="transformData" :css="css"
                  @vuetable:load-success="updateTotalDataLabel">
          <template slot="tableHeader">
            <VuetableRowHeader></VuetableRowHeader>
          </template>
          <div slot="actions" slot-scope="props" class="grid min center">
            <button class="btn icon flat error" @click="beginDeleteRow(props.rowData)" alt="Delete entry.">
              <span class="material-icons">delete</span>
            </button>
            <slot name="additional-actions" v-bind:rowData="props.rowData" v-bind:rowField="props.rowField"
                  v-bind:rowIndex="props.rowIndex"></slot>
          </div>
          <!-- This is where the fields are converted into inputs to make the table editable -->
          <GeneralizedInput :key="index" v-for="(field, index) in getProperFields(fields)" :slot="getFieldName(field)"
                            slot-scope="properties" :data="properties.rowData" :field="properties.rowField"
                            v-model="properties.rowData[getFieldID(properties.rowField)]"
                            v-on:input="changeHandler(properties)"
                            :errors="$refs.vuetable.tableData[properties.rowIndex].errors">
          </GeneralizedInput>
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
        <div class="table-errors">a</div>
        <div class="table-footer-buttons">
          <button class="btn green" @click="saveChanges"><span>{{ $t('vuetable.save') }}</span></button>
          <slot name="additional-buttons"></slot>
          <button class="btn" @click="createModal.visible=true"><span>{{ $t('vuetable.addRow') }}</span><i
              class="material-icons">add</i>
          </button>
        </div>
      </div>
    </div>
    <Modal v-if="uploadModal.visible" @close="uploadModal.visible = false" :showCancelButton="true">
      <template slot="title">
        <h2>Upload CSV</h2>
      </template>
      <template slot="content">
        <span>
          Upload CSV file.
        </span>
        <br>
        <span v-if="uploadModal.error" class="error">{{ uploadModal.error }}</span>
      </template>
      <template slot="base">
        <FileReader @load="uploadCSVFile($event)"></FileReader>
      </template>
      <template slot="close-button-name">Upload</template>
    </Modal>
    <Modal v-if="createModal.visible" @ok="createEntry" @close="createModal.visible = false"
           @cancel="createModal.visible = false" :showCancelButton="true" @mounted="createModalCreated()">
      <template slot="title">
        <h2>Create new</h2>
      </template>
      <template slot="content">
        <div :key="`create-${getFieldName(field)}`" v-for="field in getProperFields(fields)">
          <label>{{ getFieldTitle(field) }}</label>
          <GeneralizedInput :data="createModal.data" :field="field" :value="createModal.data[getFieldName(field)]"
                            v-model="createModal.data[getFieldID(field)]"
                            :errors="createModal.errors[getFieldName(field)]">
          </GeneralizedInput>
          <span v-for="(error) in createModal.errors[getFieldName(field)]" v-bind:key="error" class="error">
            {{ error }}
          </span>
        </div>
      </template>
      <template slot="close-button-name">Create Entry</template>
    </Modal>
    <Modal v-if="deleteModal.visible" @ok="deleteRow" @close="deleteModal.visible = false"
           @cancel="deleteModal.visible = false" :showCancelButton="true">
      <template slot="title">
        <h2>Are you sure you want to delete this row?</h2>
      </template>
      <template slot="content">
        <span>
          {{ deleteModal.message }}
        </span>
      </template>
      <template slot="close-button-name">Delete</template>
    </Modal>
    <FieldVisibilityModal :show="settings.show" @close="settings.show=false" :fields="fields"></FieldVisibilityModal>
  </div>
</template>


<script>
let Vuetable = require('vuetable-2')
import Modal from "@/components/Modal.vue";
import FileReader from "@/components/FileReader.vue";
import errorMessageMixin from "@/mixins/errorMessageMixin.js";
import fieldMixin from "@/mixins/fieldMixin.js";
import VuetablePagination from "@/components/vuetable/VueTablePagination.vue";
import GeneralizedInput from "@/components/vuetable/GeneralizedInput.vue";
import VuetableRowHeader from "@/components/vuetable/VuetableRowHeader.vue";
import VuetablePaginationDropDown from "@/components/vuetable/VuetablePaginationDropDown.vue";
import FieldVisibilityModal from '@/components/vuetable/FieldVisibilityModal.vue';

import $ from 'jquery';
import 'select2';
import {debounce} from "debounce";

export default {
  name: "EditableTable",
  components: {
    Vuetable: Vuetable.Vuetable,
    VuetablePagination,
    VuetablePaginationDropDown,
    Modal,
    FileReader,
    GeneralizedInput,
    VuetableRowHeader,
    FieldVisibilityModal
  },
  mixins: [
    errorMessageMixin,
    fieldMixin
  ],
  data() {
    let created_data = {};
    this.fields.forEach((field) => this.setDefaultCreationValue(field, created_data));
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
  methods: {
    updateTotalDataLabel(response) {
      this.totalDataInTable = response.data.pagination.total;
    },
    getFieldsWithVisibility() {
      return this.fields.map(field => {
        let value = JSON.parse(window.localStorage.getItem(field.name));
        let visible = value === null ? true : value;
        return {...field, ...{visible}};
      });
    },
    setDefaultCreationValue(field, data = this.createModal.data) {
      if (field === "actions") {
        return;
      }
      if (field.foreignKey) {
        data[field.name] = null;
      } else if (field.options) {
        data[field.name] = Object.values(field.options)[0];
      } else if (field.data_type) {
        let def = "";
        if (field.data_type === "checkbox") {
          def = false;
        } else if (field.data_type === 'color') {
          def = "#000000"
        }
        data[field.name] = def;
      } else {
        data[this.getFieldName(field)] = "";
      }
    },
    printargs() {
      console.log(arguments);
    },
    changeHandler(props) {
      this.hasChanged = true;
      props.rowData.changed = true;
      props.rowData.error = false;
    },
    getOption(value, options) {
      for (const [k, v] of Object.entries(options)) {
        if (v === value) {
          return k;
        }
      }
      return undefined;
    },
    async saveChanges() {
      let data = this.$refs.vuetable.tableData;

      data.filter(row => row.changed).map(
          (row) => {
            for (let i = 0; i < this.fields.length; i++) {
              let field = this.fields[i];
              let fieldName = this.getFieldName(field);

              if (row[fieldName] === '') {
                row[fieldName] = null;
              }
              if (field.data_type === 'color') {
                if (row[fieldName].charAt(0) === '#') {
                  row[fieldName] = row[fieldName].slice(0, 1)
                }
              }
            }
            console.log("Updating Row")
            console.log(row);
            this.updateMethod(row).then(response => {
              row.changed = false;
              row.error = false;
              row.errors = {};
              this.$emit('update', response.data);
              this.reRender();
            }).catch(error => {
              let response = error.response;
              row.error = true;
              row.errors = response.data;
              this.reRender();
            });
          }
      );
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
    createModalCreated() {
      this.fields.filter((f) => f.foreignKey).forEach((field) => {
        $(`.create-select.data.${this.getFieldName(field)}`).select2({
          ajax: {
            url: field.ajax_params.url,
            data: function (params) {
              let query = {
                search: params.term,
                per_page: 50,
                page: params.page,
              }
              return query
            },
            processResults(data) {
              let name_field = field.name;
              if (field.fk_name) {
                name_field = field.fk_name
              }
              console.log(name_field)
              let reply = {
                results: data.results.map(result => {
                  let res = {
                    id: result.id,
                    text: result[name_field]
                  };
                  return res;
                }),
                pagination: {
                  more: data.pagination.current_page !== data.pagination.last_page,
                },
              }
              if (field.nullable && data.pagination.current_page === 1) {
                reply.results.unshift({
                  id: "",
                  text: "Unselected"
                })
              }
              return reply;
            },
          }
        }).on('change', (evt) => {
          console.log(this.getFieldName(field), evt.target.value);
          this.createModal.data[field.id_field] = evt.target.value;
        });
      });
      this.fields.filter((f) => f.options).forEach((field) => {
        $(`.create-select.options.${this.getFieldName(field)}`).select2().on('change', (evt) => {
          console.log(this.getFieldName(field), evt.target.value);
          this.createModal.data[field.name] = evt.target.value;
        });
      })
    },
    getInputvalue(input, field) {
      let data_type = field.data_type;
      if (data_type === 'checkbox')
        return input.checked;
      return input.value;
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
    createEntry() {
      let data = {
        ...this.createModal.data
      }
      this.fields.forEach(field => {
        if (data[field.name] === "") {
          data[field.name] = null;
        }
        if (field.data_type === 'color') {
          if (data[field.name].charAt(0) === '#') {
            data[field.name] = data[field.name].slice(1, 7)
          }
        }
      });
      console.log(data);
      this.createMethod(data).then(response => {
        console.log(response);
        this.createModal.visible = false;
        this.reloadTable();
        this.createModal.errors = {};
        this.fields.filter(field => field !== "actions").forEach(field => {
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
    log() {
      console.log(...arguments);
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
      if (data.error) return "error";
      if (data.changed) return "changed";
      return "";
    },
    onChangePage(page) {
      if (page == this.current_page) {
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
        this.$nextTick(() => {
          $(".vuetable-pagination-dropdown").val(this.current_page).trigger('change');
        });
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
    },
    onActionClicked(action, data) {
      console.log("slot actions: on-click", data);
    },
  },
  created() {
    this.doSearch = debounce(this.reloadTable, 300);
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
