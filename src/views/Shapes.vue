<template>
  <div class="section shapes">
    <div class="grid container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <div class="map-container">
      <div class="dynamic-map-container">
        <div class="top-map-bar">
          <div class="right-content">
            <button class="btn flat white"><span>{{ $t('general.howToUse') }}</span><i class="material-icons">help_outline</i></button>
          </div>
        </div>
        <div class="map-sidebar">
          <ShapesTable ref="table" :project="$route.params.projectid" @focus-shape="displayShape"
                       @edit-shape="openEditingModal" @delete-shape="beginDeleteShape"></ShapesTable>
        </div>
        <ShapesMap ref="map" :project="$route.params.projectid" @range="beginEditing('range', $event)"></ShapesMap>
      </div>
      <router-link :to="{name: 'createShape', params: {projectid: $route.params.projectid}}" class="btn floating">
        <i class="material-icons">add</i>
      </router-link>
    </div>
    <MessageModal :show="deleteModal.visible" :showCancelButton="true" :okButtonLabel="$t('general.delete')"
                  :type="Enums.MessageModalType.WARNING"
                  @ok="deleteShape" @cancel="deleteModal.visible = false" @close="deleteModal.visible = false">
      <template v-slot:m-title>
        <h2> {{ $t('shape.deleteModal.title', {name: deleteModal.shape.shape_id}) }}</h2>
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
import ShapesTable from "@/components/shape/ShapesTable.vue";
import ShapesMap from "@/components/shape/ShapesMap.vue";
import shapesAPI from "@/api/shapes.api";
import TableHeader from "@/components/vuetable/TableHeader";
import MessageModal from "@/components/modal/MessageModal";

export default {
  components: {
    MessageModal,
    ShapesTable,
    ShapesMap,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Shapes',
      infoURL: "https://developers.google.com/transit/gtfs/reference#shapestxt",
      shape: false,
      range: false,
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
    openEditingModal(shape) {
      this.shape = {
        id: shape.id,
        shape_id: shape.shape_id,
      }
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
    },
    beginPointSelection() {
      this.$refs.map.displayShape(this.shape);
      this.$refs.map.beginPointSelection();
    },
    displayShape(shape) {
      this.$refs.map.displayShape(shape);
    }
  },
};
</script>
