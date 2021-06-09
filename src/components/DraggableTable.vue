<template>
  <ul class="table-body" v-draggable="{ value: rows, handle: 'handle' }" @change="onChange">
    <li class="table-row handle" v-for="(row, index) in rows" :key="getKey(row)">
      <div class="icon"><span class="material-icons">drag_indicator</span></div>
      <div class="number-position"><span>{{index+1}}</span></div>
      <div><span>{{row.stop_id}}</span></div>
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
