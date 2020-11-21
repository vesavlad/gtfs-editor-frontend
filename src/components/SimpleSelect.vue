<template>
  <select class="select-simple" ref="select" v-model="val">
    <option v-for="(option, key) in field.options" :key="key" :value="option">{{key}}</option>
  </select>
</template>


<script>
  import fieldMixin from "@/mixins/fieldMixin.js";
  import $ from 'jquery';
  import 'select2';
  export default {
    mixins: [
      fieldMixin,
    ],
    props: {
      field: {
        type: Object,
        required: true,
      },
      value: {},
    },
    watch: {
      value() {
        this.changeEnabled = false;
        $(this.$refs.select).select2('destroy');
        this.val = this.value;
        this.$nextTick(this.datafy);
        this.changeEnabled = true;
      }
    },
    data() {
      return {
        changeEnabled: true,
        val: this.value,
        name: this.getFieldName(this.field),
      }
    },
    mounted() {
      this.datafy();
      $(this.$refs.select).on('change', this.onChange);
    },
    methods: {
      onChange(evt) {
        console.log(evt);
        this.val = evt.target.value;
        console.log(this.val);
        if (this.changeEnabled) {
          this.$emit("input", this.val);
        }
      },
      log(msg) {
        console.log(msg);
      },
      datafy() {
        let select = this.$refs.select;
        $(select).select2();
      },
    },
  }
</script>