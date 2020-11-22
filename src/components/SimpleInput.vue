<template>
    <input ref="input" :type="field.data_type" v-model="val" @input="log($event); $emit('input', getValue($event.target))">
</template>

<script>
  import fieldMixin from "@/mixins/fieldMixin.js";
  export default {
    mixins: [
      fieldMixin,
    ],
    props: {
      field: {
        type: Object,
        required: true,
      },
      value: {
        required: true,
      },
    },
    data(){
      return {
        val: this.preProcessValue(this.value),
      };
    },
    watch:{
      value() {
        this.val = this.preProcessValue(this.value);
      }
    },
    methods: {
      preProcessValue(value){
        if(value){
          if(this.field.data_type === "color" && value.length === 6){
            value = "#" + value;
          }
        }
        return value;
      },
      getValue(input){
        if(this.field.data_type === "checkbox"){
          return input.checked;
        }
        let value = input.value;
        
        if(this.field.data_type === "color"){
          value = value.slice(1);
        }
        console.log(value);
        return value;
      },
      log(){
        console.log(...arguments);
      }
    },
  }
</script>