<template>
  <div class="section stop-times">
    <div class="container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <div class="map-container">
      <div class="dynamic-map-container">
        <div class="top-map-bar">
          <div class="right-content">
            <button class="btn flat white"><span>{{ $t('general.howToUse') }}</span><i class="material-icons">help_outline</i>
            </button>
          </div>
        </div>
        <StopTimesTable ref="table" :projectId="$route.params.projectId"
                        @focus-st="displayTrip"></StopTimesTable>
        <StopTimesMap ref="map" :projectId="$route.params.projectId"></StopTimesMap>
      </div>
    </div>
  </div>
</template>

<script>
import StopTimesTable from "@/components/stoptimes/StopTimesTable.vue";
import StopTimesMap from "@/components/stoptimes/StopTimesMap.vue";
import TableHeader from "@/components/vuetable/TableHeader";

export default {
  components: {
    StopTimesTable,
    StopTimesMap,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Stop times',
      infoURL: "https://developers.google.com/transit/gtfs/reference#stop_timestxt"
    };
  },
  methods: {
    displayTrip(shape) {
      this.$refs.map.displayTrip(shape);
    }
  },
};
</script>
