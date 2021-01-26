<template>
  <div>
    <div class="flex" v-if="!editing">
      <div>
        <StopTimesTable ref="table" :project="$route.params.projectid" @focus-st="displayTrip"
          @edit-st="openEditingModal" @delete-st="beginDeleteST"></StopTimesTable>
      </div>
      <StopTimesMap ref="map" :project="$route.params.projectid" @range="beginEditing('range', $event)"></StopTimesMap>
    </div>
    <StopTimesEditor v-else :trip="editingModal.trip" v-on:close="finishEditing" :project="$route.params.projectid"
      :mode="mode">
    </StopTimesEditor>
    <Modal v-if="editingModal.visible" @close="editingModal.visible = false" @cancel="editingModal.visible = false"
      :showCancelButton="true" :showBase="false">
      <template slot="title">
        <h2>Select editing mode for trip {{editingModal.trip.trip_id}}</h2>
      </template>
      <template slot="content">
        <button class="btn btn-outline-secondary" @click="beginEditing('edit')">
          Edit StopTimes
        </button>
        <button class="btn btn-outline-secondary" @click="beginEditing('duplicate')">
          Duplicate Trip with StopTimes
        </button>
        <button class="btn btn-outline-secondary" @click="duplicateWithHeadway()">
          Duplicate Trip with StopTimes using headway
        </button>
      </template>
    </Modal>
    <Modal v-if="editingModal.duplicating" @ok="duplicateST" @close="editingModal.duplicating = false"
      @cancel="editingModal.duplicating = false" :showCancelButton="true">
      <template slot="title">
        <h2>Creating copy of trip {{editingModal.trip.trip_id}}</h2>
      </template>
      <template slot="content">
        Create copy of "{{editingModal.trip.trip_id}}" with a headway of <input v-model="editingModal.headway"
          type="number"> seconds with Trip ID <input v-model="editingModal.trip_id">
        <span>
          {{editingModal.error}}
        </span>
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
  import tripsAPI from "@/api/trips.api";
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
          duplicating: false,
          headway: 0,
          trip_id: "",
          error: "",
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
      timeToSeconds(timeString) {
        let times = timeString.split(":").map(t => parseInt(t));
        let seconds = 0;
        for (let i = 0; i < times.length; i++) {
          seconds *= 60;
          seconds += times[i];
        }
        return seconds;
      },
      secondsToTime(seconds) {
        return new Date(null, null, null, null, null, seconds).toTimeString().match(
          /\d{2}:\d{2}:\d{2}/)[0];
      },
      addHeadway(time, headway) {
        return this.secondsToTime(this.timeToSeconds(time) + headway);
      },
      duplicateST() {
        let trip = {
          ...this.editingModal.trip,
          trip_id: this.editingModal.trip_id,
        }
        let headway = parseInt(this.editingModal.headway);
        if (isNaN(headway)) {
          this.editingModal.error = "Headway is not a valid number";
          return;
        }
        trip.stop_times = trip.stop_times.map(st => {
          st = {
            ...st
          }
          if (st.arrival_time) {
            st.arrival_time = this.addHeadway(st.arrival_time, headway);
          }
          if (st.departure_time) {
            st.departure_time = this.addHeadway(st.departure_time, headway);
          }
          delete st.id;
          return st;
        });
        tripsAPI.tripsAPI.create(this.$route.params.projectid, trip).then(() => {
          this.editingModal.duplicating = false;
          this.$refs.table.refresh();
        }).catch(err => {
          console.log(err.response);
          this.editingModal.error = err.response.data.join("\n");
        });
      },
      openEditingModal(trip) {
        this.editingModal.trip = trip
        this.editingModal.visible = true;
        this.editingModal.error = "";
      },
      beginDeleteST(trip) {
        console.log(trip);
        this.deleteModal.message = "";
        this.deleteModal.visible = true;
        this.deleteModal.trip = trip;
      },
      duplicateWithHeadway() {
        this.editingModal.visible = false;
        this.editingModal.duplicating = true;
        this.editingModal.trip_id = this.editingModal.trip.trip_id;
      },
      deleteST() {
        console.log(this.deleteModal.trip)
        let data = {
          id: this.deleteModal.trip.id,
          stop_times: [],
        }
        tripsAPI.tripsAPI.update(this.$route.params.projectid, data).then(response => {
          console.log(response);
          this.deleteModal = {
            trip: null,
            visible: false,
            message: "",
          }
          this.$refs.table.refresh();
        }).catch(err => {
          console.log(err.response);
          this.deleteModal.message = err.response.data.message;
        })
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
      },
    },
  };
</script>