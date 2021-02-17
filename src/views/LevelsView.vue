<template>
  <div class="levels container">
    <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
                     :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
      </EditableTable>
    </section>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import levelsAPI from '@/api/levels.api';
import TableHeader from "@/components/vuetable/TableHeader";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Levels',
      infoURL: "https://developers.google.com/transit/gtfs/reference#levelstxt",
      downloadURL: levelsAPI.levelsAPI.getDownloadURL(this.$route.params.projectid),
      url: levelsAPI.levelsAPI.getFullBaseURL(this.$route.params.projectid),
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions')
        },
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
