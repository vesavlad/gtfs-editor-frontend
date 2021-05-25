<template>
  <div class="section stops">
    <div class="container">
      <TableHeader :title="tableTitle" :infoURL="infoURL">
        <template v-slot:right-section>
          <div class="tab">
            <button class="tablinks" :class="{active: activeTab===tabType.TABLE}" @click="switchTab(tabType.TABLE)">
              <span>Table view</span><i class="material-icons">view_headline</i>
            </button>
            <button class="tablinks" :class="{active: activeTab===tabType.MAP}" @click="switchTab(tabType.MAP)">
              <span>Map view</span><i class="material-icons">map</i>
            </button>
          </div>
        </template>
      </TableHeader>
    </div>
    <div v-show="activeTab===tabType.MAP" class="map-container">
      <InteractiveMap ref="map" :project="$route.params.projectid" :stopFields="fields">
      </InteractiveMap>
    </div>
    <div v-show="activeTab===tabType.TABLE" class="table-container container">
      <EditableTable ref='table' :fields="fields" :url="url" :updateMethod="updateStop" :deleteMethod="removeStop"
                     :createMethod="createStop" :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true"
                     @update="onUpdate">
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
      url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectid),
      downloadURL: stopsAPI.stopsAPI.getDownloadURL(this.$route.params.projectid),
      activeTab: 'map',
      tabType: {
        MAP: 'map',
        TABLE: 'table'
      }
    };
  },
  methods: {
    switchTab(newTab) {
      if (newTab === this.activeTab) {
        return;
      }
      if (newTab === this.tabType.MAP) {
        if (this.$refs.table.hasUnsavedChanges()) {
          let answer = window.confirm("There are unsaved changes, are you sure you want to proceed?");
          if (!answer) {
            return;
          }
        }
        this.activeTab = newTab;
        this.$nextTick(this.$refs.map.resize);
      } else if (newTab === this.tabType.TABLE) {
        this.activeTab = newTab;
        this.$refs.table.reloadTable();
      }
    },
    focusStop(props) {
      this.switchTab(this.tabType.MAP);
      this.$refs.map.focusStop(props.rowData);
    },
    updateStop(data) {
      return stopsAPI.stopsAPI.update(this.$route.params.projectid, data);
    },
    createStop(data) {
      return stopsAPI.stopsAPI.create(this.$route.params.projectid, data);
    },
    removeStop(data) {
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
