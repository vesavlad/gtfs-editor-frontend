<template>
  <div>
    <div style="display: flex; flex-direction: row;" v-if="!editing">
      <div>
        <ShapesTable ref="table" :project="$route.params.projectid" @focus-shape="displayShape" @edit-shape="beginEditing"></ShapesTable>
        <button class="btn btn-outline-secondary" @click="beginCreation">
          New shape
        </button>
      </div>
      <ShapesMap ref="map" :project="$route.params.projectid"></ShapesMap>
    </div>
    <ShapeEditor v-else :shape="shape" v-on:close="finishEditing" :project="$route.params.projectid" :range="{start:100,finish:200}">
    </ShapeEditor>
  </div>
</template>

<script>
  import ShapesTable from "@/components/ShapesTable.vue";
  import ShapesMap from "@/components/ShapesMap.vue";
  import ShapeEditor from "@/components/ShapeEditor.vue";
  export default {
    components: {
      ShapesTable,
      ShapesMap,
      ShapeEditor,
    },
    data() {
      return {
        editing: false,
        shape: false,
      };
    },
    methods: {
      beginCreation() {
        this.shape = false;
        this.editing = true;
      },
      beginEditing(data) {
        console.log(data)
        this.shape = {
          id: data.id,
          shape_id: data.shape_id,
        }
        this.editing = true;
      },
      finishEditing() {
        this.editing = false;
      },
      displayShape(shape) {
        this.$refs.map.displayShape(shape);
      }
    },
  };
</script>