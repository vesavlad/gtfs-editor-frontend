<template>
  <div class="levels container">
    <div class="header">
      <div class="grid v-center">
        <h1>Levels</h1>
        <button class="btn icon flat" alt="Go to GTFS specification.">
          <span class="material-icons">info</span>
        </button>
      </div>
    </div>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
                     :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true" :infoURL="infoURL">
      </EditableTable>
    </section>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import levelsAPI from '@/api/levels.api';

export default {
  components: {
    EditableTable,
  },
  data() {
    return {
      downloadURL: levelsAPI.levelsAPI.getDownloadURL(this.$route.params.projectid),
      url: levelsAPI.levelsAPI.getFullBaseURL(this.$route.params.projectid),
      infoURL: "https://developers.google.com/transit/gtfs/reference#levelstxt",
      fields: [
        'actions',
        {
          name: 'level_id',
          sortField: 'level_id',
          title: 'Level ID',
          required: true,
        },
        {
          name: 'level_index',
          sortField: 'level_index',
          data_type: 'number',
          title: 'Index',
          required: true,
        },
        {
          name: 'level_name',
          title: 'Name',
          sortField: 'level_name',
          required: true,
        },
      ],
    };
  },
  methods: {
    update(data) {
      return levelsAPI.levelsAPI.update(this.$route.params.projectid, data);
    },
    create(data) {
      return levelsAPI.levelsAPI.create(this.$route.params.projectid, data);
    },
    remove(data) {
      return levelsAPI.levelsAPI.remove(this.$route.params.projectid, data);
    },
    uploadCSV(file) {
      return levelsAPI.levelsAPI.uploadCSV(this.$route.params.projectid, file);
    },
    log(out) {
      console.log(out);
    },
  },
};
</script>
