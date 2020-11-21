<template>
  <div>
    <form ref="form">
      <div :key="index" v-for="(field, index) in fields.filter(field=>getFieldName(field)!=='actions')">
        <!-- Foreign key -->
        <label> {{getFieldTitle(field)}} </label>
        <select :class="'popup-select data ' + getFieldName(field)" v-if="field.foreignKey">
          <option>Unselected</option>
        </select>
        <!-- Options -->
        <select :class="'popup-select options ' + getFieldName(field)" v-else-if="field.options">
          <option v-if="field.blankable"></option>
          <option v-for="(option, key) in field.options" :key="key" :value="option">{{key}}</option>
        </select>
        <!-- Default -->
        <input v-else :type="field.data_type" v-model="newData[getFieldName(field)]">
      </div>
    </form>
  </div>
</template>


<script>
  import $ from 'jquery';
  import 'select2';
  import fieldMixin from "@/mixins/fieldMixin.js";
  export default {
    mixins: [
      fieldMixin,
    ],
    name: 'PopupContent',
    props: {
      fields: {
        type: Array,
        required: true
      },
      data: {
        type: Object,
        required: true
      }
    },
    data() {
      console.log(this.fields);
      return {
        newData: {
          changed: false,
        }
      }
    },
    watch: {
      data(newData) {
        this.newData = newData;
        $("select.popup-select").select2("destroy");
        this.$nextTick(this.datafy);
      }
    },
    methods: {
      log() {
        console.log(...arguments);
      },
      datafy() {

        $("select.popup-select.options").select2().on("change");
        this.fields.filter((f) => f.foreignKey).forEach((field) => {
          $(`select.popup-select.data.${this.getFieldName(field)}`).select2({
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
                console.log(field)
                console.log(data);
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
            this.newData[field.id_field] = evt.target.value;
          });
          this.fields.filter((f) => f.options).forEach((field) => {
            console.log(field);
            $(`.popup-select.options.${this.getFieldName(field)}`).val(this.newData[this.getFieldName(field)]).trigger("change").select2().on('change', (evt) => {
              this.newData[field.name] = evt.target.value;
            });
          });
        });
      },
      getData() {
        return this.newData;
      }
    },
    mounted() {
      this.datafy();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>