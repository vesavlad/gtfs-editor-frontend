<template>
  <div class="section stops">
    <div class="grid container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
      <div class="tab">
        <button class="tablinks" @click="switchTab('table')"><span>Table view</span><i class="material-icons">view_headline</i></button>
        <button class="tablinks" @click="switchTab('map')"><span>Map view</span><i class="material-icons">map</i></button>
      </div>
    </div>
    <div v-show="tab==='map'" class="map-container">
      <InteractiveMap ref="map" :project="$route.params.projectid" :stopFields="fields">
      </InteractiveMap>
    </div>
    <div v-show="tab==='table'" class="table-container container">
      <EditableTable ref='table' :fields="fields" :url="url" :updateMethod="updateTrip" :deleteMethod="removeTrip"
                     :createMethod="createTrip" :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true"
                     @update="onUpdate" :infoURL="infoURL">
        <template slot="additional-actions" slot-scope="props">
          <button class="btn icon" @click="focusStop(props)" alt="Focus Stop on interactive map.">
            <span class="material-icons">map</span>
          </button>
        </template>
      </EditableTable>
    </div>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import InteractiveMap from "@/components/InteractiveMap.vue";
import stopsAPI from '@/api/stops.api';
import stopsMixin from '@/mixins/stopsMixin.js';
import TableHeader from "@/components/vuetable/TableHeader";

export default {
  components: {
    EditableTable,
    InteractiveMap,
    TableHeader
  },
  mixins: [
    stopsMixin
  ],
  data() {
    return {
      tableTitle: 'Stops',
      infoURL: "https://developers.google.com/transit/gtfs/reference#stopstxt",
      tab: "map",
      url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectid),
      downloadURL: stopsAPI.stopsAPI.getDownloadURL(this.$route.params.projectid),
    };
  },
  methods: {
    log() {
      console.log(...arguments);
    },
    switchTab(tab) {
      if (tab === "map") {
        if (this.$refs.table.hasUnsavedChanges()) {
          let answer = window.confirm("There are unsaved changes, are you sure you want to proceed?");
          if (!answer) {
            return;
          }
        }
        this.tab = tab;
        this.$nextTick(this.$refs.map.resize);
      } else if (tab === "table") {
        this.tab = tab;
        this.$refs.table.reloadTable();
      }
    },
    focusStop(props) {
      this.switchTab("map");
      this.$refs.map.focusStop(props.rowData);
    },
    updateTrip(data) {
      return stopsAPI.stopsAPI.update(this.$route.params.projectid, data);
    },
    createTrip(data) {
      return stopsAPI.stopsAPI.create(this.$route.params.projectid, data);
    },
    removeTrip(data) {
      return stopsAPI.stopsAPI.remove(this.$route.params.projectid, data);
    },
    uploadCSV(file) {
      return stopsAPI.stopsAPI.uploadCSV(this.$route.params.projectid, file);
    },
    onUpdate(stop) {
      this.$refs.map.updateStopData(stop);
    }
  },
};
</script>
