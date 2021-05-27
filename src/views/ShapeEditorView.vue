<template>
  <div class="section shapes">
    <div class="grid container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <ShapeEditor :shape="shape" :projectId="$route.params.projectid" :range="range"
                 :editMode="mode">
    </ShapeEditor>
  </div>
</template>

<script>
import ShapeEditor from "@/components/shape/ShapeEditor.vue";
import TableHeader from "@/components/vuetable/TableHeader";
import Enums from '@/utils/enums.js'

export default {
  name: 'ShapeEditorView',
  components: {
    ShapeEditor,
    TableHeader
  },
  props: {
    shape: {
      type: Object,
      default: null
    },
    range: {
      type: Object,
    },
    mode: {
      type: String,
      default: Enums.ShapeEditorEditionMode.SIMPLE
    }
  },
  data() {
    return {
      tableTitle: 'Shapes',
      infoURL: "https://developers.google.com/transit/gtfs/reference#shapestxt",
    };
  }
};
</script>
