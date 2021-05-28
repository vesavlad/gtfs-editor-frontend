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
          <ShapesTable ref="table" :project="$route.params.projectid" @focus-shape="displayShape"
                       @select-range="beginRangeSelection"></ShapesTable>
        </div>
        <ShapesMap ref="map" :project="$route.params.projectid"
                   @selected-range="goToEditRange($event)"></ShapesMap>
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
      activeShape: null
    };
  },
  methods: {
    goToEditRange(range) {
      this.$router.push({
        name: 'editShape', params: {
          projectid: this.$route.params.projectid,
          shapeid: this.activeShape.id,
          editionMode: this.Enums.ShapeEditorEditionMode.RANGE,
          range: range
        }
      })
    },
    beginRangeSelection(shape) {
      this.activeShape = shape;
      this.$refs.map.displayShape(shape);
      this.$refs.map.beginRangeSelection();
    },
    displayShape(shape) {
      this.$refs.map.displayShape(shape);
    }
  }
};
</script>
