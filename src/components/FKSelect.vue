<template>
  <select class="select-data" ref="select" v-model="val">
  </select>
</template>


<script>
  import fieldMixin from "@/mixins/fieldMixin.js";
  import $ from 'jquery';
  import 'select2';
  export default {
    mixins: [
      fieldMixin,
    ],
    props: {
      field: {
        type: Object,
        required: true,
      },
      data: {
        type: Object,
        required: true,
      },
      value: {},
    },
    watch: {
      value() {
        this.changeEnabled = false;
        this.val = this.value;
        this.selectDefault(this.getFKText(this.field, this.data), this.value);
      }
    },
    data() {
      return {
        changeEnabled: true,
        val: this.value,
        name: this.getFieldName(this.field),
      }
    },
    mounted() {
      this.datafy();
      $(this.$refs.select).on('change', this.onChange);
    },
    methods: {
      onChange(evt) {
        this.val = evt.target.value;
        if (this.changeEnabled) {
          this.$emit("input", this.val);
        }
      },
      log(msg) {
        console.log(msg);
      },
      selectDefault(defaultText, defaultValue) {
        let select = this.$refs.select;
        // if Option already exists we select it
        if (defaultValue == null) {
          defaultText = "Unselected";
          defaultValue = "";
        }
        if ($(select).find("option[value='" + defaultValue + "']").length) {
          $(select).val(defaultValue).trigger('change');
        } else {
          // Otherwise we create it and select it
          var newOption = new Option(defaultText, defaultValue, true, true);
          $(select).append(newOption).trigger('change');
        }
        this.changeEnabled = true;
      },
      datafy() {
        let select = this.$refs.select;
        let field = this.field;
        let defaultText = this.getFKText(field, this.data);
        let defaultValue = this.value;
        let self = this;
        this.selectDefault(defaultText, defaultValue);
        $(select).select2({
          ajax: {
            url: self.field.ajax_params.url,
            data: function (params) {
              let query = {
                search: params.term,
                per_page: 50,
                page: params.page,
              }
              return query
            },
            processResults(data) {
              let name = self.getFKName(field);
              let reply = {
                results: data.results.map(result => {
                  let res = {
                    id: result.id,
                    text: result[name]
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
        }).on('change', this.onChange);
      },
    },
  }
</script>

<style>
  span.select2-selection {
    min-width: 80px;
  }
</style>