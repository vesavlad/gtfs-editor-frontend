<template>
  <div class="section stop-times" v-if="localTrip!==null">
    <div class="container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <StopTimesEditor :projectId="$route.params.projectId"
                     :trip="localTrip">
    </StopTimesEditor>
  </div>
</template>

<script>
import StopTimesEditor from "@/components/stoptimes/StopTimesEditor.vue";
import TableHeader from "@/components/vuetable/TableHeader";
import tripsAPI from "@/api/trips.api";

export default {
  name: 'StopTimesEditorView',
  components: {
    StopTimesEditor,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Stop times',
      infoURL: "https://developers.google.com/transit/gtfs/reference#stop_timestxt",
      localTrip: null
    };
  },
  methods: {
    setTrip() {
      tripsAPI.tripsAPI.detail(this.$route.params.projectId, this.$route.params.tripId).then(response => {
        this.localTrip = response.data;
      });
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => vm.setTrip());
  },
};
</script>
