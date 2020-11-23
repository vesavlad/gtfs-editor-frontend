<template>
  <div>
    <div :key="`popup-${getFieldName(field)}`" v-for="field in getProperFields(fields)">
      <label>{{getFieldName(field)}}</label>
      <GeneralizedInput :data="newData" :field="field" :value="newData[getFieldName(field)]"
        v-model="newData[getFieldID(field)]">
      </GeneralizedInput>
    </div>
  </div>
</template>


<script>
  import $ from 'jquery';
  import 'select2';
  import fieldMixin from "@/mixins/fieldMixin.js";
  import GeneralizedInput from "@/components/GeneralizedInput.vue";
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
      data: {
        type: Object,
        required: true
      }
    },
    data() {
      console.log(this.fields);
      return {
        newData: {
          changed: false,
        }
      }
    },
    watch: {
      data(newData) {
        this.newData = newData;
        $("select.popup-select").select2("destroy");
        this.$nextTick(this.datafy);
      }
    },
    methods: {
      log() {
        console.log(...arguments);
      },
      getData() {
        return this.newData;
      }
    },
    mounted() {}
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>