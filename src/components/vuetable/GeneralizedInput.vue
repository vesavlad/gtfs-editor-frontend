<template>
  <FKSelect v-if="field.type===inputType.FK_SELECT" :field="field" :data="data" v-model="val" @input="onInput"
            :hasErrors="has_errors">
  </FKSelect>
  <SimpleSelect v-else-if="field.type===inputType.SIMPLE_SELECT" :field="field" v-model="val" @input="onInput"
                :hasErrors="has_errors">
  </SimpleSelect>
  <SimpleCheckbox v-else-if="field.type===inputType.CHECKBOX" :field="field" v-model="val"
                  @input="onInput"></SimpleCheckbox>
  <ColorInput v-else-if="field.type===inputType.COLOR" v-model="val" @input="onInput"
              :hasErrors="has_errors" :errors="field_errors"></ColorInput>
  <!-- Default -->
  <SimpleInput v-else :field="field" v-model="val" @input="onInput" :hasErrors="has_errors" :errors="field_errors">
  </SimpleInput>
</template>

<script>
import fieldMixin from "@/mixins/fieldMixin.js";
import SimpleInput from './SimpleInput.vue';
import ColorInput from "@/components/vuetable/ColorInput";
import SimpleSelect from './SimpleSelect.vue';
import FKSelect from './FKSelect.vue';
import SimpleCheckbox from "@/components/vuetable/SimpleCheckbox";
import Enums from "@/utils/enums";

export default {
  name: 'GeneralizedInput',
  components: {
    SimpleCheckbox,
    SimpleInput,
    SimpleSelect,
    FKSelect,
    ColorInput
  },
  mixins: [
    fieldMixin,
    SimpleInput,
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
    errors: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    let name = this.getFieldName(this.field);
    return {
      name,
      val: this.data[this.getFieldID(this.field)],
      inputType: Enums.InputType
    }
  },
  computed: {
    has_errors() {
      if (this.name in this.errors) {
        let errors = this.errors[this.name];
        if (errors instanceof Array) {
          if (this.data.error)
            return errors.length > 0;
        }
      }
      return false;
    },
    field_errors() {
      if (this.name in this.errors) {
        return this.errors[this.name];
      }
      return [];
    },
  },
  methods: {
    onInput(event) {
      this.$emit('input', event);
    }
  },
}
</script>