<template>
  <MyMultiselect v-if="!readonly" v-model="val" :options="options" :loading="isLoading" :searchable="true"
                 :internal-search="false"
                 track-by="value" label="name" :showLabels="false" @open="onOpen" @input="onChange"
                 @search-change="asyncFind" :class="{error: hasErrors}" :placeholder="$t('general.select')"
                 v-tooltip="{ theme: 'error-tooltip', content: hasErrors?localErrors[0]:'', shown: hasErrors }">
  </MyMultiselect>
  <span v-else>{{ selectedOption ? selectedOption.name : '' }}</span>
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
    errors: {
      type: Array,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      val: null,
      options: [],
      selectedOption: null,
      isLoading: false,
      page: 1,
      localErrors: []
    }
  },
  watch: {
    value() {
      this.setOption();
    },
    errors() {
      this.localErrors = [...this.errors];
    }
  },
  mounted() {
    this.setOption();
  },
  computed: {
    hasErrors() {
      return Boolean(this.localErrors.length);
    }
  },
  methods: {
    setOption() {
      if (this.data[this.field.id_field]) {
        let option = {
          name: this.data[this.field.name],
          value: this.data[this.field.id_field]
        };
        this.selectedOption = option;
        if (!this.options.find(opt => opt.value === option.value)) {
          this.options.push(option);
          this.val = option;
        }
      }
    },
    onChange(option) {
      this.$emit("input", option ? option.value : null);
    },
    onOpen() {
      if (this.options.length < 2) {
        this.asyncFind('');
      }
      this.localErrors = [];
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
          return {
            name: result[name],
            value: result.id
          };
        });
        options.concat([this.selectedOption]);
        this.options = options;
        this.isLoading = false;
      });
    }
  },
}
</script>
