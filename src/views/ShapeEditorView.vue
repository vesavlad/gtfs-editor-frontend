<template>
  <div class="section shapes">
    <div class="grid container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <ShapeEditor :projectId="$route.params.projectid" :range="range" :shape="shape" :editMode="editMode">
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
    editMode: {
      type: String,
      required: true,
      validator: function (value) {
        if (Object.values(Enums.ShapeEditorEditionMode).indexOf(value) === -1) {
          console.error(`edit mode "${value}" is not valid`)
          return false;
        }
        return true;
      }
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
