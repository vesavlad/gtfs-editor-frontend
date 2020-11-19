<template>
  <div>
    <div class="tab">
      <button class="tablinks" @click="switchTab('table')">Table</button>
      <button class="tablinks" @click="switchTab('map')">Map</button>
    </div>
    <div v-show="tab==='table'" class="table-container">
      <EditableTable :fields="fields" :url="url" :updateMethod="updateTrip" :deleteMethod="removeTrip"
        :createMethod="createTrip" :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
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
  import levelsAPI from '@/api/levels.api';


  export default {
    components: {
      EditableTable,
      InteractiveMap,
    },
    data() {
      return {
        tab: "map",
        url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectid),
        downloadURL: stopsAPI.stopsAPI.getDownloadURL(this.$route.params.projectid),
        fields: [
          'actions',
          {
            name: 'stop_id',
            title: 'Stop*',
            sortField: 'stop_id',
          },
          {
            name: 'stop_code',
            title: 'Code',
            sortField: 'stop_code',
          },
          {
            name: 'stop_name',
            title: 'Name*',
            sortField: 'stop_name',
          },
          {
            name: 'stop_lat',
            title: 'Lat*',
          },
          {
            name: 'stop_lon',
            title: 'Lon*',
          },
          {
            name: 'stop_url',
            title: 'URL',
          },
          {
            name: 'stop_desc',
            title: 'Description',
          },
          {
            name: 'zone_id',
            title: 'Zone',
          },
          {
            name: 'location_type',
            title: 'Location Type',
          },
          {
            name: 'parent_station_id',
            title: 'Parent Station',
            foreignKey: true,
            id_field: 'parent_station',
            fk_name: 'stop_id',
            nullable: true,
            ajax_params: {
              url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectid),
            }
          },
          {
            name: 'stop_timezone',
            title: 'Timezone',
          },
          {
            name: 'wheelchair_boarding',
            title: 'Wheelchair Boarding',
            options: {
              'Unknown': null,
              'Yes': 1,
              'No': 0,
            },
          },
          {
            name: 'platform_code',
            title: 'Platform Code',
          },
          {
            name: 'level_id',
            sortField: 'level_id',
            title: 'Level',
            foreignKey: true,
            id_field: 'level',
            nullable: true,
            ajax_params: {
              url: levelsAPI.levelsAPI.getFullBaseURL(this.$route.params.projectid),
            }
          },
        ],
      };
    },
    methods: {
      switchTab(tab){
        this.tab = tab;
        if (tab === "map"){
          this.$nextTick(this.$refs.map.resize);
        }
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
  .map-container{
    height: 100vh;
  }
</style>