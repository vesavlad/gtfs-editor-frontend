<template>
  <MyMultiselect v-model="val" :options="options" :loading="isLoading" :searchable="true" :internal-search="false"
                 track-by="value" label="name" :showLabels="false" @open="onOpen" @input="onChange"
                 @search-change="asyncFind" :class="{error: hasErrors}" :placeholder="$t('general.select')"
                 v-tooltip="{ theme: 'error-tooltip', content: errors.length?errors[0]:'', shown: Boolean(errors.length) }">
  </MyMultiselect>
</template>

<script>
import fieldMixin from "@/mixins/fieldMixin.js";
import httpClient from "@/api/httpClient";
import MyMultiselect from "@/components/vuetable/inputs/MyMultiselect";

export default {
  name: 'FKSelect',
  mixins: [
    fieldMixin,
  ],
  components: {
    MyMultiselect
  },
  props: {
    field: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    value: {
      required: true
    },
    hasErrors: {
      type: Boolean,
      default: false,
    },
    errors: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      val: null,
      options: [],
      selectedOption: null,
      isLoading: false,
      page: 1
    }
  },
  watch: {
    value() {
      this.setOption();
    }
  },
  mounted() {
    this.setOption();
  },
  methods: {
    setOption() {
      if (this.data[this.field.id_field]) {
        let option = {
          name: this.data[this.field.name],
          value: this.data[this.field.id_field]
        };
        this.selectedOption = option;
        this.options.push(option);
        this.val = option;
      }
    },
    onChange(option) {
      this.$emit("input", option ? option.value : null);
    },
    onOpen() {
      if (this.options.length < 2) {
        this.asyncFind('');
      }
    },
    asyncFind(query) {
      this.isLoading = true;
      let params = {
        search: query,
        per_page: 50,
        page: this.page
      };
      httpClient.get(this.field.ajax_params.url, params).then(response => {
        // process results
        let name = this.field.name;
        if (this.field.fk_name) {
          name = this.field.fk_name;
        }
        let options = response.data.results.map(result => {
          let option = {
            name: result[name],
            value: result.id
          };
          return option;
        });
        options.concat([this.selectedOption]);
        this.options = options;
        this.isLoading = false;
      });
    }
  },
}
</script>

