<template>
  <div class="stop-input-details">
    <div :key="`popup-${field.name}`" v-for="field in getProperFields(fields)">
      <label>{{ field.name }}</label>
      <div class="error-message" v-for="error in errors[field.name]" v-bind:key="error">{{ error }}</div>
      <GeneralizedInput :data="newData" :field="field" :value="newData[field.name]"
                        v-model="newData[getFieldID(field)]" v-on:input="$emit('input',newData)">
      </GeneralizedInput>
    </div>
  </div>
</template>


<script>
import fieldMixin from "@/mixins/fieldMixin.js";
import GeneralizedInput from "@/components/vuetable/inputs/GeneralizedInput.vue";

export default {
  components: {
    GeneralizedInput
  },
  mixins: [
    fieldMixin,
  ],
  name: 'PopupContent',
  props: {
    fields: {
      type: Array,
      required: true
    },
    value: {
      type: Object,
      required: true
    },
    errors: {
      type: Object,
      default: () => new Object(),
    },
  },
  data() {
    return {
      newData: {
        ...this.value,
        changed: false,
      },
    }
  },
  watch: {
    value: {
      handler(newData) {
        this.newData = newData;
      },
      deep: true,
    },
  },
  methods: {
    log() {
      console.log(...arguments);
    },
    getData() {
      return this.newData;
    }
  },
  mounted() {
  }
}
</script>

