<template>
  <div class="section shapes">
    <div class="grid container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <div class="map-container" v-if="!editing">
      <div class="dynamic-map-container">
        <div class="top-map-bar">
          <div class="right-content">
            <button class="btn flat white"><span>How to use</span><i class="material-icons">help_outline</i></button>
          </div>
        </div>
        <div class="map-sidebar">
          <ShapesTable ref="table" :project="$route.params.projectid" @focus-shape="displayShape"
                       @edit-shape="openEditingModal" @delete-shape="beginDeleteShape"></ShapesTable>
        </div>
        <ShapesMap ref="map" :project="$route.params.projectid" @range="beginEditing('range', $event)"></ShapesMap>
      </div>
      <button class="btn floating" @click="beginCreation"><i class="material-icons">add</i></button>
    </div>
    <ShapeEditor v-else :shape="shape" v-on:close="finishEditing" :project="$route.params.projectid" :range="range"
                 :mode="mode">
    </ShapeEditor>
    <BaseModal :show="editingModal.visible" @close="editingModal.visible=false">
      <template v-slot:m-content>
        <div class="m-header">
          <h2>Select editing mode for shape {{ shape.shape_id }}</h2>
        </div>
        <div class="m-content">
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
        </div>
      </template>
    </BaseModal>
    <MessageModal :show="deleteModal.visible" :showCancelButton="true" :okButtonLabel="$t('general.delete')"
                  :type="Enums.MessageModalType.WARNING"
                  @ok="deleteShape" @cancel="deleteModal.visible = false" @close="deleteModal.visible = false">
      <template v-slot:m-title>
        <h2>Are you sure you want to delete shape {{ deleteModal.shape.shape_id }}?</h2>
      </template>
      <template v-slot:m-content>
        <span>
          {{ deleteModal.message }}
        </span>
      </template>
    </MessageModal>
  </div>
</template>

<script>
import ShapesTable from "@/components/ShapesTable.vue";
import ShapesMap from "@/components/ShapesMap.vue";
import ShapeEditor from "@/components/ShapeEditor.vue";
import shapesAPI from "@/api/shapes.api";
import TableHeader from "@/components/vuetable/TableHeader";
import BaseModal from "@/components/modal/BaseModal";
import MessageModal from "@/components/modal/MessageModal";

export default {
  components: {
    MessageModal,
    BaseModal,
    ShapesTable,
    ShapesMap,
    ShapeEditor,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Shapes',
      infoURL: "https://developers.google.com/transit/gtfs/reference#shapestxt",
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
