<template>
  <div class="section stop-times">
    <div class="container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <StopTimesEditor :projectId="$route.params.projectId"
                     :trip="trip"
                     :mode="mode">
    </StopTimesEditor>
  </div>
</template>

<script>
import StopTimesEditor from "@/components/stoptimes/StopTimesEditor.vue";
import TableHeader from "@/components/vuetable/TableHeader";
import Enums from "@/utils/enums";

export default {
  name: 'StopTimesEditorView',
  components: {
    StopTimesEditor,
    TableHeader
  },
  props: {
    trip: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      required: true,
      validator: function (value) {
        if (Object.values(Enums.StopTimesEditorMode).indexOf(value) === -1) {
          console.error(`stop times editor mode "${value}" is not valid`)
          return false;
        }
        return true;
      }
    },
  },
  data() {
    return {
      tableTitle: 'Stop times',
      infoURL: "https://developers.google.com/transit/gtfs/reference#stop_timestxt"
    };
  }
};
</script>
