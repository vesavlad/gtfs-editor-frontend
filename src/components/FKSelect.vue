<template>
  <select class="select-data" ref="select">
  </select>
</template>
<script>
  import $ from 'jquery';
  import 'select2';
  export default {
    props: {
      properties: {
        type: Object
      }
    },
    computed: {
      field() {
        return this.properties.rowField;
      },
      data() {
        return this.properties.rowData;
      },
      value() {
        return this.properties.rowData[this.properties.rowField.id_field]
      },
      name() {
        return this.properties.rowData[this.properties.rowField.name]
      },
      rowID() {
        return this.properties.rowData.id;
      }
    },
    watch: {
      rowID() {
        this.changeEnabled = false;
        $(this.$refs.select).select2('destroy');
        this.datafy();
        this.changeEnabled = true;
      }
    },
    data() {
      return {
        changeEnabled: true,
      }
    },
    mounted() {
      this.datafy();
      $(this.$refs.select).on('change', this.onChange);
    },
    methods: {
      onChange(evt) {
        if (this.changeEnabled) {
          this.$emit('change', {
            val: evt.target.value,
          });
        }
      },
      log(msg) {
        console.log(msg);
      },
      datafy() {
        let select = this.$refs.select;
        let field = this.field;
        // if Option already exists we select it
        if ($(select).find("option[value='" + this.value + "']").length) {
          $(select).val(this.value).trigger('change');
        } else {
          // Otherwise we create it and select it
          let name = this.name;
          let value= this.value;
          if(name===null){
            name="Unselected"
            value=null
          }
          var newOption = new Option(name, value, true, true);
          $(select).append(newOption).trigger('change');
        }
        console.log(this.field);
        $(select).select2({
          ajax: {
            url: this.field.ajax_params.url,
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
              if (field.name_field) {
                name_field = field.name_field
              }
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
              if(field.nullable && data.pagination.current_page===1){
                reply.results.unshift({
                  id: "",
                  text: "Unselected"
                })
              }
              return reply;
            },
          }
        });
      },
    },
  }
</script>