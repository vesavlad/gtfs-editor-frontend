<template>
  <div class="section stop-times">
    <div class="container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <div class="map-container">
      <div class="dynamic-map-container">
        <div class="top-map-bar">
          <div class="right-content grid center">
            <button class="btn flat white"><span>{{ $t('general.howToUse') }}</span><i class="material-icons">help_outline</i></button>
          </div>
        </div>
        <StopTimesTable ref="table" :project="$route.params.projectId" @focus-st="displayTrip"
                        @edit-st="openEditingModal" @delete-st="beginDeleteST"></StopTimesTable>
        <StopTimesMap ref="map" :project="$route.params.projectId"
                      @range="beginEditing('range', $event)"></StopTimesMap>
      </div>
    </div>
    <BaseModal :show="editingModal.visible" @close="editingModal.visible = false">
      <template v-slot:m-content>
        <div class="m-title">
          <h2>Select editing mode for trip {{ editingModal.trip.trip_id }}</h2>
        </div>
        <div class="m-content">
          <button class="btn btn-outline-secondary" @click="beginEditing('edit')">
            Edit StopTimes
          </button>
          <button class="btn btn-outline-secondary" @click="beginEditing('duplicate')">
            Duplicate Trip with StopTimes
          </button>
          <button class="btn btn-outline-secondary" @click="duplicateWithHeadway()">
            Duplicate Trip with StopTimes using headway
          </button>
        </div>
      </template>
    </BaseModal>
    <MessageModal v-if="editingModal.duplicating" @ok="duplicateST" @cancel="editingModal.duplicating = false"
                  @close="editingModal.duplicating = false" :showCancelButton="true"
                  :okButtonLabel="$t('general.duplicate')">
      <template v-slot:m-title>
        <h2>Creating copy of trip {{ editingModal.trip.trip_id }}</h2>
      </template>
      <template v-slot:m-content>
        Create copy of "{{ editingModal.trip.trip_id }}" with a headway of <input v-model="editingModal.headway"
                                                                                  type="number"> seconds with Trip ID
        <input v-model="editingModal.trip_id">
        <span>
          {{ editingModal.error }}
        </span>
      </template>
    </MessageModal>
    <MessageModal :show="deleteModal.visible" @ok="deleteST" @cancel="deleteModal.visible = false"
                  @close="deleteModal.visible = false" :showCancelButton="true" :okButtonLabel="$t('general.delete')"
                  :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>Are you sure you want to delete the stop-times for trip "{{ deleteModal.trip.trip_id }}"?</h2>
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
import StopTimesTable from "@/components/stoptimes/StopTimesTable.vue";
import StopTimesMap from "@/components/stoptimes/StopTimesMap.vue";
import tripsAPI from "@/api/trips.api";
import TableHeader from "@/components/vuetable/TableHeader";
import BaseModal from "@/components/modal/BaseModal";
import MessageModal from "@/components/modal/MessageModal";

export default {
  components: {
    MessageModal,
    BaseModal,
    StopTimesTable,
    StopTimesMap,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Stop times',
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
      infoURL: "https://developers.google.com/transit/gtfs/reference#stop_timestxt",
    };
  },
  methods: {
    openInfo() {
      window.open(this.infoURL);
    },
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
      tripsAPI.tripsAPI.create(this.$route.params.projectId, trip).then(() => {
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
      tripsAPI.tripsAPI.update(this.$route.params.projectId, data).then(response => {
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
      this.editingModal.visible = false;
    },
    beginPointSelection() {
      this.$refs.map.beginPointSelection();
      this.editingModal.visible = false;
    },
    finishEditing() {
      this.editingModal.trip = false;
      this.range = false;
    },
    displayTrip(shape) {
      this.$refs.map.displayTrip(shape);
    },
  },
};
</script>
