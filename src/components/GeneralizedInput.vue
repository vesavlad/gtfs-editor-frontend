<template>
  <input v-if="false">
  <!-- Foreign key -->
  <!-- <FKSelect v-if="field.foreignKey" :properties="properties"
    @change="log($event); properties.rowData[field.id_field]=$event.val; changeHandler(properties, this);">
  </FKSelect> -->
  <FKSelect v-else-if="field.foreignKey" :field="field" :data="data" v-model="val" @input="$emit('input', $event)">
  </FKSelect>
  <!-- Options -->
  <SimpleSelect v-else-if="field.options" :field="field" v-model="val" @input="$emit('input', $event)">
  </SimpleSelect>
  <!-- Default -->
  <SimpleInput v-else :field="field" v-model="val" @input="$emit('input', $event)">
  </SimpleInput>

</template>
<script>
  import fieldMixin from "@/mixins/fieldMixin.js";
  import SimpleInput from './SimpleInput.vue';
  import SimpleSelect from './SimpleSelect.vue';
  import FKSelect from './FKSelect.vue';
  export default {
    components: {
      SimpleInput,
      SimpleSelect,
      FKSelect,
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
    },
    data() {
      let name = this.getFieldName(this.field);
      return {
        name,
        val: this.data[name],
      }
    },
    mounted() {},
    methods: {
      log() {
        console.log(...arguments);
      }
    },
  }
</script>