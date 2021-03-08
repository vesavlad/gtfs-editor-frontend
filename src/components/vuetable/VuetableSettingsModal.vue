<template>
  <InputDataModal :show="show" :initialData="initialData" :fields="checkboxFields" @cancel="$emit('close')"
                  @close="$emit('close')" @save="setVisibilityColumn" :title="$t('vuetable.settings')"
                  :errors="{}"></InputDataModal>
</template>

<script>
import InputDataModal from "@/components/modal/InputDataModal.vue";
import Enums from "@/utils/enums";

export default {
  name: 'FieldVisibilityModal',
  components: {
    InputDataModal
  },
  data() {
    return {
      initialData: {}
    }
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    fields: {
      type: Array,
      required: true
    }
  },
  computed: {
    optionalFields() {
      let fieldsWithIndex = this.fields.map((el, index) => {
        return {...el, ...{index}};
      });
      return fieldsWithIndex.filter(field => !field.required && field.name !== 'actions');
    },
    checkboxFields() {
      return this.optionalFields.map(field => {
        return {
          name: field.name,
          title: field.title,
          required: false,
          type: Enums.InputType.CHECKBOX
        }
      });
    }
  },
  methods: {
    setVisibilityColumn(data) {
      for (let propertyName in data) {
        if (Object.prototype.hasOwnProperty.call(data, propertyName)) {
          window.localStorage.setItem(propertyName, JSON.stringify(data[propertyName]));
        }
      }
      this.$emit('visibility-column-change');
      this.$emit('close');
    }
  },
  watch: {
    show(newValue) {
      if (newValue) {
        this.optionalFields.map(field => {
          let storageValue = JSON.parse(window.localStorage.getItem(field.name));
          this.initialData[field.name] = storageValue === null ? true : storageValue;
        });
      }
    }
  }
}
</script>