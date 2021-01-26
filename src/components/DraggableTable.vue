<template>
  <ul v-draggable="{ value: rows, handle: 'handle' }" @change="onChange">
    <li v-for="(row, index) in rows" :key="getKey(row)">
      <span class="material-icons handle">drag_handle</span> {{index+1}} {{row.stop_id}}
    </li>
  </ul>
</template>

<script>
  let key = 0;
  import fieldMixin from "@/mixins/fieldMixin.js";
  import VDraggable from 'vue-sortable-list'
  import Vue from 'vue';
  Vue.use(VDraggable)
  export default {
    components: {},
    data() {
      return {
        rows: this.value,
      }
    },
    watch: {

    },
    props: {
      value: {},
    },
    mixins: [
      fieldMixin,
    ],
    methods: {
      onChange() {
        console.log(...arguments);
        this.$nextTick(() => this.$emit('input', this.rows));
      },
      getKey(row) {
        if(row.key){
          return row.key;
        }
        row.key = key++;
        return row.key;
      },
    }
  };
</script>
