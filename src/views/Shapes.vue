<template>
  <div class="section shapes">
    <div class="grid container">
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
        <div class="map-sidebar">
          <ShapesTable ref="table" :project="$route.params.projectid" @focus-shape="displayShape"></ShapesTable>
        </div>
        <ShapesMap ref="map" :project="$route.params.projectid" @range="beginEditing('range', $event)"></ShapesMap>
      </div>
      <router-link :to="{name: 'createShape', params: {projectid: $route.params.projectid}}" class="btn floating">
        <i class="material-icons">add</i>
      </router-link>
    </div>
  </div>
</template>

<script>
import ShapesTable from "@/components/shape/ShapesTable.vue";
import ShapesMap from "@/components/shape/ShapesMap.vue";
import TableHeader from "@/components/vuetable/TableHeader";

export default {
  components: {
    ShapesTable,
    ShapesMap,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Shapes',
      infoURL: "https://developers.google.com/transit/gtfs/reference#shapestxt",
      shape: false,
      range: false,
      mode: "",
    };
  },
  methods: {
    beginEditing(mode, range) {
      this.mode = mode;
      if (mode === "range") {
        this.range = range;
      }
      this.editing = true;
    },
    beginPointSelection() {
      this.$refs.map.displayShape(this.shape);
      this.$refs.map.beginPointSelection();
    },
    displayShape(shape) {
      this.$refs.map.displayShape(shape);
    }
  },
};
</script>
