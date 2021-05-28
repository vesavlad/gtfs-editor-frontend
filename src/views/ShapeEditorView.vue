<template>
  <div class="section shapes">
    <div class="grid container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <ShapeEditor :projectId="$route.params.projectid" :range="range" :shape="shape" :editionMode="editionMode" mode="">
    </ShapeEditor>
  </div>
</template>

<script>
import shapesAPI from "@/api/shapes.api";
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
    editionMode: {
      type: String,
      default: Enums.ShapeEditorEditionMode.SIMPLE,
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
      infoURL: "https://developers.google.com/transit/gtfs/reference#shapestxt"
    };
  },
  methods: {
    initData() {
      if (this.$route.params.shapeid) {
        shapesAPI.shapesAPI.detail(this.$route.params.projectid, this.$route.params.shapeid).then(response => {
          console.log(response.data);
          this.shape = response.data;
        });
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => vm.initData());
  },
};
</script>
