<template>
  <div>
    <div style="display: flex; flex-direction: row;" v-if="!editing">
      <div>
        <ShapesTable ref="table" :project="$route.params.projectid" @focus-shape="displayShape"
          @edit-shape="openEditingModal" @delete-shape="beginDeleteShape"></ShapesTable>
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
          Replace entire Shape
        </button>
        <button class="btn btn-outline-secondary" @click="beginEditing('simple')">
          Edit Shape directly
        </button>
        <button class="btn btn-outline-secondary" @click="beginPointSelection">
          Select point range on map
        </button>
        <button class="btn btn-outline-secondary" @click="beginEditing('duplicate')">
          Duplicate Shape
        </button>
      </template>
    </Modal>
    <Modal v-if="deleteModal.visible" @ok="deleteShape" @close="deleteModal.visible = false"
      @cancel="deleteModal.visible = false" :showCancelButton="true">
      <template slot="title">
        <h2>Are you sure you want to delete shape {{deleteModal.shape.shape_id}}?</h2>
      </template>
      <template slot="content">
        <span>
          {{deleteModal.message}}
        </span>
      </template>
      <template slot="close-button-name">Delete</template>
    </Modal>
  </div>
</template>

<script>
  import ShapesTable from "@/components/ShapesTable.vue";
  import ShapesMap from "@/components/ShapesMap.vue";
  import ShapeEditor from "@/components/ShapeEditor.vue";
  import Modal from "@/components/Modal.vue";
  import shapesAPI from "@/api/shapes.api";
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
        deleteModal: {
          shape: null,
          visible: false,
          message: "",
        },
        mode: "",
      };
    },
    methods: {
      deleteShape() {
        shapesAPI.shapesAPI.remove(this.$route.params.projectid, this.deleteModal.shape).then(response => {
          console.log(response);
          this.deleteModal = {
            shape: null,
            visible: false,
            message: "",
          }
          this.$refs.table.refresh();
        }).catch(err => {
          console.log(err.response);
          this.deleteModal.message = err.response.data.message;
        })
      },
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
      beginDeleteShape(shape) {
        console.log(shape);
        this.deleteModal.message = "";
        this.deleteModal.visible = true;
        this.deleteModal.shape = shape;
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