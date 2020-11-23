<template>
  <div>
    <div class="tab">
      <button class="tablinks" @click="switchTab('table')">Table</button>
      <button class="tablinks" @click="switchTab('map')">Map</button>
    </div>
    <div v-show="tab==='table'" class="table-container">
      <EditableTable :fields="fields" :url="url" :updateMethod="updateTrip" :deleteMethod="removeTrip"
        :createMethod="createTrip" :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
        <template slot="additional-actions" slot-scope="props">
          <button class="btn icon" @click="focusStop(props)">
            <span class="material-icons">map</span>
          </button>
        </template>
      </EditableTable>
    </div>
    <div v-show="tab==='map'" class="map-container">
      <InteractiveMap ref="map" :project="$route.params.projectid" :stopFields="fields">
      </InteractiveMap>
    </div>
  </div>
</template>

<script>
  import EditableTable from "@/components/EditableTable.vue";
  import InteractiveMap from "@/components/InteractiveMap.vue";
  import stopsAPI from '@/api/stops.api';
  import stopsMixin from '@/mixins/stopsMixin.js'


  export default {
    components: {
      EditableTable,
      InteractiveMap,
    },
    mixins: [
      stopsMixin
    ],
    data() {
      return {
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
        this.tab = tab;
        if (tab === "map") {
          this.$nextTick(this.$refs.map.resize);
        }
      },
      focusStop(props){
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
    },
  };
</script>

<style scoped>
  /* Style the tab */
  .tab {
    overflow: hidden;
    border: 1px solid #ccc;
    background-color: #f1f1f1;
  }

  /* Style the buttons that are used to open the tab content */
  .tab button {
    background-color: inherit;
    float: left;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 16px;
    transition: 0.3s;
  }

  /* Change background color of buttons on hover */
  .tab button:hover {
    background-color: #ddd;
  }

  /* Create an active/current tablink class */
  .tab button.active {
    background-color: #ccc;
  }

  /* Style the tab content */
  .tabcontent {
    display: none;
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-top: none;
  }

  .map-container {
    height: 100vh;
  }

  button.ui.button {
    padding: 8px 3px 8px 10px;
    margin-top: 1px;
    margin-bottom: 1px;
  }
</style>