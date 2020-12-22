<template>
  <div>
    <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
      :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true" :infoURL="infoURL">
    </EditableTable>
  </div>
</template>

<script>
  import EditableTable from "@/components/EditableTable.vue";
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
            title: 'Level ID*',
          },
          {
            name: 'level_index',
            sortField: 'level_index',
            data_type: 'number',
            title: 'Index*',
          },
          {
            name: 'level_name',
            title: 'Name*',
            sortField: 'level_name',
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