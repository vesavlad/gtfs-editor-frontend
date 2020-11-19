<template>
  <div class="TransportModeTable">
    <div>
      <template v-if="searchable">
        <form class="form-inline d-flex mx-1 justify-content-end" @submit.stop.prevent="doSearch"
          style="min-width:500px; max-width:50%">
          <div class="input-group">
            <input v-model="quickSearch" type="search" placeholder="Quick search">
            <button type="submit" class="btn btn-outline-secondary">
              <i class="mdi mdi-magnify" /> Go
            </button>
          </div>
        </form>
      </template>
      <button class="btn icon" @click="informationModal.visible=true">
        <span class="material-icons">info</span>
      </button>
      <div>
        <vuetable ref="vuetable" :api-url="url" :multi-sort="true" :fields="fields" data-path="results"
          pagination-path="pagination" @vuetable:pagination-data="onPaginationData" :query-params="makeQueryParams">
          <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope" :print="log($scopedSlots)" />
          </template>
          <div slot="actions" slot-scope="props">
            <button class="btn icon" @click="beginDeleteRow(props.rowData)">
              <span class="material-icons">delete</span>
            </button>
          </div>
          <!-- This is where the fields are converted into inputs to make the table editable -->
          <div :key="index" v-for="(field, index) in fields.filter(field=>getName(field)!=='actions')"
            :slot="getName(field)" slot-scope="properties">
            <!-- Foreign key -->
            <FKSelect v-if="field.foreignKey" :properties="properties"
              @change="log($event); properties.rowData[field.id_field]=$event.val; changeHandler(properties, this);">
            </FKSelect>
            <!-- Options -->
            <SimpleSelect v-else-if="field.options" :properties="properties"
              @change="log($event); properties.rowData[field.name]=$event.val; changeHandler(properties, this);">
            </SimpleSelect>
            <!-- Default -->
            <input v-else :type="field.data_type" v-model="properties.rowData[getName(field)]"
              :checked="properties.rowData[getName(field)]" @change="changeHandler(properties)">
          </div>
        </vuetable>
        <div style="display: flex;">
          <VuetablePagination ref="pagination" @vuetable-pagination:change-page="onChangePage">
          </VuetablePagination>
          <VuetablePaginationDropDown ref="paginationDropDown" @vuetable-pagination:change-page="onChangePage">
          </VuetablePaginationDropDown>
        </div>
      </div>
      <div style="display: flex;">
        <button class="btn btn-outline-secondary" @click="saveChanges">
          Save
        </button>
        <form method="get" :action="downloadURL"> <button class="btn btn-outline-secondary" type="submit">
            Download CSV
          </button>
        </form>
        <button class="btn btn-outline-secondary" @click="uploadModal.visible=true">
          Upload CSV
        </button>
        <button class="btn btn-outline-secondary" @click="log(createModal.data); createModal.visible=true">
          Add row
        </button>
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
        <form ref="createForm">
          <div :key="index" v-for="(field, index) in fields.filter(field=>getName(field)!=='actions')">
            <!-- Foreign key -->
            <label> {{getTitle(field)}} </label>
            <select :class="'create-select data ' + getName(field)" v-if="field.foreignKey">
              <option>Unselected</option>
            </select>
            <!-- Options -->
            <select :class="'create-select options ' + getName(field)" v-else-if="field.options">
              <option v-if="field.blankable"></option>
              <option v-for="(option, key) in field.options" :key="key" :value="option">{{key}}</option>
            </select>
            <!-- Default -->
            <input v-else :type="field.data_type" v-model="createModal.data[getName(field)]">
          </div>
        </form>
        <div ref="errorDiv" v-html="errorModal.message" />
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
          {{deleteModal.message}}
        </span>
      </template>
      <template slot="close-button-name">Delete</template>
    </Modal>
    <Modal v-if="informationModal.visible" @ok="informationModal.visible = false"
      @close="informationModal.visible = false" @cancel="informationModal.visible = false">
      <template slot="title">
        <h2>Table information</h2>
      </template>
      <template slot="content">
        <span>
          <slot name="information">Table Information Not Available</slot>
        </span>
      </template>
    </Modal>
  </div>

</template>




<script>
  let Vuetable = require('vuetable-2')
  import FKSelect from '@/components/FKSelect.vue';
  import SimpleSelect from '@/components/SimpleSelect.vue';
  import Modal from "@/components/Modal.vue";
  import FileReader from "@/components/FileReader.vue";
  import errorMessageMixin from "@/mixins/errorMessageMixin.js";
  import VuetablePagination from "@/components/VueTablePagination.vue";
  import $ from 'jquery';
  import 'select2';

  export default {
    name: "EditableTable",
    components: {
      Vuetable: Vuetable.Vuetable,
      VuetablePagination,
      VuetablePaginationDropDown: Vuetable.VuetablePaginationDropDown,
      Modal,
      FileReader,
      FKSelect,
      SimpleSelect,
    },
    mixins: [errorMessageMixin],
    data: function () {
      let created_data = {};
      this.fields.forEach((field) => this.setDefaultCreationValue(field, created_data));
      return {
        errorModal: {
          message: '',
        },
        informationModal: {
          visible: false,
        },
        deleteModal: {
          visible: false,
          data: {},
          message: ''
        },
        createModal: {
          data: created_data,
          visible: false,
        },
        uploadModal: {
          visible: false,
        },
        test: true,
        quickSearch: '',
        hasChanged: false,
        current_page: -1000,
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
          data[this.getName(field)] = "";
        }
      },
      printargs() {
        console.log(arguments);
      },
      changeHandler(props) {
        let table = $("table.vuetable");
        table.children("tbody:first").children().eq(props.rowIndex).addClass("edited");
        this.hasChanged = true;
        console.log(props.rowIndex, "Changed")
        props.rowData.changed = true;
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
              let fieldName = this.getName(field);

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
              console.log(response);
            }).catch(error => {
              window.error = error;
              let response = error.response;
              console.log(response.data);
              window.alert(`Error sending HTTP request\n${response.data.message}`);
            });
          }
        );
      },
      createModalCreated() {
        this.fields.filter((f) => f.foreignKey).forEach((field) => {
          $(`.create-select.data.${this.getName(field)}`).select2({
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
            console.log(this.getName(field), evt.target.value);
            this.createModal.data[field.id_field] = evt.target.value;
          });
        });
        this.fields.filter((f) => f.options).forEach((field) => {
          console.log(field);
          $(`.create-select.options.${this.getName(field)}`).select2().on('change', (evt) => {
            console.log(this.getName(field), evt.target.value);
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
          this.errorModal.message = "";
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
          this.errorModal.message = this.getErrorMessage(error.response.data);
        });
      },
      uploadCSVFile(file) {
        this.uploadCSV(file).then(response => {
          console.log(response);
          this.uploadModal.visible = false;
          this.reloadTable();
        }).catch(error => {
          console.log(error);
        });
      },
      log() {
        console.log(...arguments);
      },
      getTitle(field) {
        let title = this.getName(field);
        if (field instanceof Object && field.title) {
          title = field.title
        }
        return title;
      },
      getName(field) {
        if (typeof (field) == 'string') return field;
        return field.name;
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
        this.$nextTick(() => this.$refs.vuetable.$data.tableData.forEach(row => row.changed = false));
      },
      onPaginationData(paginationData) {
        if (paginationData.current_page !== this.current_page) {
          this.current_page = paginationData.current_page;
          this.$refs.pagination.setPaginationData(paginationData);
          this.$refs.paginationDropDown.setPaginationData(paginationData);
          this.$nextTick(() => {
            $(".vuetable-pagination-dropdown").val(this.current_page).trigger('change');
          });
        }
      },
      reloadTable() {
        this.$refs.vuetable.refresh();

      },
      doSearch() {
        this.reloadTable();
      },
      doSomethingAfterReload(data, table) {
        console.log(data)
        console.log(table)
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