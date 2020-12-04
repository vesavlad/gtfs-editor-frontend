<template>
  <div>
    <div style="display: flex; flex-direction: row;" v-if="!editing">
      <div>
        <ShapesTable ref="table" :project="$route.params.projectid" @focus-shape="displayShape"
          @edit-shape="openEditingModal"></ShapesTable>
        <button class="btn btn-outline-secondary" @click="beginCreation">
          New shape
        </button>
      </div>
      <ShapesMap ref="map" :project="$route.params.projectid" @range="beginEditing('range', $event)"></ShapesMap>
    </div>
    <ShapeEditor v-else :shape="shape" v-on:close="finishEditing" :project="$route.params.projectid" :range="range" :mode="mode">
    </ShapeEditor>
    <Modal v-if="editingModal.visible" @close="editingModal.visible = false" @cancel="editingModal.visible = false"
      :showCancelButton="true" :showBase="false">
      <template slot="title">
        <h2>Select editing mode for shape {{shape.shape_id}}</h2>
      </template>
      <template slot="content">
        <button class="btn btn-outline-secondary" @click="beginEditing('all')">
          Replace entire shape
        </button>
        <button class="btn btn-outline-secondary" @click="beginEditing('simple')">
          Edit shape directly
        </button>
        <button class="btn btn-outline-secondary" @click="beginPointSelection">
          Select points on map
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
  import ShapesTable from "@/components/ShapesTable.vue";
  import ShapesMap from "@/components/ShapesMap.vue";
  import ShapeEditor from "@/components/ShapeEditor.vue";
  import Modal from "@/components/Modal.vue";
  export default {
    components: {
      ShapesTable,
      ShapesMap,
      ShapeEditor,
      Modal,
    },
    data() {
      return {
        editing: false,
        shape: false,
        range: false,
        editingModal: {
          visible: false,
        },
        mode: "",
      };
    },
    methods: {
      beginCreation() {
        this.shape = false;
        this.editing = true;
      },
      openEditingModal(shape) {
        this.shape = {
          id: shape.id,
          shape_id: shape.shape_id,
        }
        this.editingModal.visible = true;
      },
      beginEditing(mode, range) {
        this.mode = mode;
        if (mode === "range") {
          this.range = range;
        }
        this.editing = true;
        this.editingModal.visible = false;
      },
      beginPointSelection() {
        this.$refs.map.displayShape(this.shape);
        this.$refs.map.beginPointSelection();
        this.editingModal.visible = false;
      },
      finishEditing() {
        this.editing = false;
        this.shape = false;
        this.range = false;
      },
      displayShape(shape) {
        this.$refs.map.displayShape(shape);
      }
    },
  };
</script>