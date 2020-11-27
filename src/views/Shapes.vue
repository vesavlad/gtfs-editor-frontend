<template>
  <div style="display: flex; flex-direction: row;">
    <ShapesTable :project="$route.params.projectid"></ShapesTable>
    <ShapesMap :project="$route.params.projectid"></ShapesMap>
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
    methods: {},
  };
</script>