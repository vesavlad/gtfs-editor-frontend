<template>
  <FKSelect v-if="field.type===inputType.FK_SELECT"
            :value="value" :field="field" :data="data" :errors="fieldErrors" :readonly="readonly" v-on="$listeners">
  </FKSelect>
  <SimpleSelect v-else-if="field.type===inputType.SIMPLE_SELECT"
                :value="value" :field="field" :errors="fieldErrors" :readonly="readonly" v-on="$listeners">
  </SimpleSelect>
  <SimpleCheckbox v-else-if="field.type===inputType.CHECKBOX"
                  :value="value" :field="field" :readonly="readonly" v-on="$listeners">
  </SimpleCheckbox>
  <ColorInput v-else-if="field.type===inputType.COLOR"
              :value="value" :errors="fieldErrors" :readonly="readonly" v-on="$listeners">
  </ColorInput>
  <!-- Default -->
  <SimpleInput v-else
               :value="value" :field="field" :errors="fieldErrors" :readonly="readonly" v-on="$listeners">
  </SimpleInput>
</template>

<script>
import fieldMixin from "@/mixins/fieldMixin.js";
import SimpleInput from '@/components/vuetable/inputs/SimpleInput.vue';
import ColorInput from "@/components/vuetable/inputs/ColorInput";
import SimpleSelect from '@/components/vuetable/inputs/SimpleSelect.vue';
import FKSelect from '@/components/vuetable/inputs/FKSelect.vue';
import SimpleCheckbox from "@/components/vuetable/inputs/SimpleCheckbox";
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
    fieldMixin
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
    errors: {
      type: Object,
      default: () => {
        return {};
      },
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputType: Enums.InputType
    }
  },
  computed: {
    fieldErrors() {
      let name = this.getFieldID(this.field);
      if (name in this.errors) {
        return this.errors[name];
      }
      return [];
    }
  }
}
</script>