<template>
  <FKSelect v-if="field.type===inputType.FK_SELECT"
            v-model="val" :field="field" :data="data" :errors="fieldErrors" v-on="$listeners">
  </FKSelect>
  <SimpleSelect v-else-if="field.type===inputType.SIMPLE_SELECT"
                v-model="val" :field="field" :errors="fieldErrors" v-on="$listeners">
  </SimpleSelect>
  <SimpleCheckbox v-else-if="field.type===inputType.CHECKBOX"
                  v-model="val" :field="field" v-on="$listeners">
  </SimpleCheckbox>
  <ColorInput v-else-if="field.type===inputType.COLOR"
              v-model="val" :errors="fieldErrors" v-on="$listeners">
  </ColorInput>
  <!-- Default -->
  <SimpleInput v-else
               v-model="val" :field="field" :errors="fieldErrors" v-on="$listeners">
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
    errors: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      val: this.data[this.getFieldID(this.field)],
      inputType: Enums.InputType
    }
  },
  watch: {
    data() {
      this.val = this.data[this.getFieldID(this.field)]
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