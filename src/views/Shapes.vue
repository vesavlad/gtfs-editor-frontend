<template>
  <div style="display: flex; flex-direction: row;">
    <ShapesTable ref="table" :project="$route.params.projectid" @focus-shape="displayShape"></ShapesTable>
    <ShapesMap ref="map" :project="$route.params.projectid"></ShapesMap>
  </div>
</template>

<script>
  import ShapesTable from "@/components/ShapesTable.vue";
  import ShapesMap from "@/components/ShapesMap.vue";
  export default {
    components: {
      ShapesTable,
      ShapesMap,
    },
    data() {
      return {};
    },
    methods: {
      displayShape(shape){
        this.$refs.map.displayShape(shape);
      }
    },
  };
</script>