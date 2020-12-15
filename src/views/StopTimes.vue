<template>
  <div>
    <div style="display: flex; flex-direction: row;" v-if="!editing">
      <div>
        <StopTimesTable ref="table" :project="$route.params.projectid" @focus-st="displayTrip"
          @edit-st="openEditingModal" @delete-st="beginDeleteST"></StopTimesTable>
        <button class="btn btn-outline-secondary" @click="beginCreation">
          New stop-times
        </button>
      </div>
      <StopTimesMap ref="map" :project="$route.params.projectid" @range="beginEditing('range', $event)"></StopTimesMap>
    </div>
    <StopTimesEditor v-else :trip="editingModal.trip" v-on:close="finishEditing" :project="$route.params.projectid" :mode="mode">
    </StopTimesEditor>
    <Modal v-if="editingModal.visible" @close="editingModal.visible = false" @cancel="editingModal.visible = false"
      :showCancelButton="true" :showBase="false">
      <template slot="title">
        <h2>Select editing mode for trip {{editingModal.trip.trip_id}}</h2>
      </template>
      <template slot="content">
        <button class="btn btn-outline-secondary" @click="beginEditing('all')">
          Edit StopTimes
        </button>
        <button class="btn btn-outline-secondary" @click="beginEditing('duplicate')">
          Duplicate StopTimes
        </button>
      </template>
    </Modal>
    <Modal v-if="deleteModal.visible" @ok="deleteST" @close="deleteModal.visible = false"
      @cancel="deleteModal.visible = false" :showCancelButton="true">
      <template slot="title">
        <h2>Are you sure you want to delete the stop-times for trip "{{deleteModal.trip.trip_id}}"?</h2>
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
  import StopTimesTable from "@/components/StopTimesTable.vue";
  import StopTimesMap from "@/components/StopTimesMap.vue";
  import StopTimesEditor from "@/components/StopTimesEditor.vue";
  import Modal from "@/components/Modal.vue";
  // import shapesAPI from "@/api/shapes.api";
  export default {
    components: {
      StopTimesTable,
      StopTimesMap,
      StopTimesEditor,
      Modal,
    },
    data() {
      return {
        editing: false,
        range: false,
        editingModal: {
          trip: false,
          visible: false,
        },
        deleteModal: {
          trip: null,
          visible: false,
          message: "",
        },
        mode: "",
      };
    },
    methods: {
      deleteST() {
        // shapesAPI.shapesAPI.remove(this.$route.params.projectid, this.deleteModal.shape).then(response => {
        //   console.log(response);
        //   this.deleteModal = {
        //     shape: null,
        //     visible: false,
        //     message: "",
        //   }
        //   this.$refs.table.refresh();
        // }).catch(err => {
        //   console.log(err.response);
        //   this.deleteModal.message = err.response.data.message;
        // })
      },
      beginCreation() {
        this.shape = false;
        this.editing = true;
      },
      openEditingModal(trip) {
        this.editingModal.trip = trip
        this.editingModal.visible = true;
      },
      beginDeleteST(trip) {
        console.log(trip);
        this.deleteModal.message = "";
        this.deleteModal.visible = true;
        this.deleteModal.trip = trip;
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
        this.$refs.map.beginPointSelection();
        this.editingModal.visible = false;
      },
      finishEditing() {
        this.editing = false;
        this.editingModal.trip = false;
        this.range = false;
      },
      displayTrip(shape) {
        this.$refs.map.displayTrip(shape);
      }
    },
  };
</script>