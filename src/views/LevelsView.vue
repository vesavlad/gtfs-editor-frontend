<template>
  <div>
    <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
      :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
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
        fields: [
          'actions',
          {
            name: 'level_id',
            sortField: 'level_id',
            title: 'Level',
          },
          {
            name: 'level_index',
            sortField: 'level_index',
            data_type: 'number',
            title: 'Index',
          },
          {
            name: 'headway_secs',
            title: 'Headway Seconds',
          },
          {
            name: 'level_name',
            title: 'Name',
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