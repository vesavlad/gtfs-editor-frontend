<template>
  <div class="frequencies container">
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
import frequenciesAPI from '@/api/frequencies.api';
import tripsAPI from '@/api/trips.api';
import TableHeader from "@/components/vuetable/TableHeader";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Frequencies',
      infoURL: "https://developers.google.com/transit/gtfs/reference#frequenciestxt",
      downloadURL: frequenciesAPI.frequenciesAPI.getDownloadURL(this.$route.params.projectid),
      url: frequenciesAPI.frequenciesAPI.getFullBaseURL(this.$route.params.projectid),
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions')
        },
        {
          name: 'trip_id',
          title: 'Trip',
          sortField: 'trip_id',
          required: true,
          foreignKey: true,
          id_field: 'trip',
          ajax_params: {
            url: tripsAPI.tripsAPI.getFullBaseURL(this.$route.params.projectid),
          }
        },
        {
          name: 'start_time',
          sortField: 'start_time',
          data_type: 'time',
          title: 'Start Time',
          required: true,
        },
        {
          name: 'end_time',
          sortField: 'end_time',
          data_type: 'time',
          title: 'End Time',
          required: true,
        },
        {
          name: 'headway_secs',
          title: 'Headway Seconds',
          required: true,
        },
        {
          name: 'exact_times',
          title: 'Exact Times',
          required: true,
          type: "select-simple",
          options: [
            {name: 'Yes', value: 1},
            {name: 'No', value: 0},
          ],
        },
      ],
    };
  },
  methods: {
    update(data) {
      return frequenciesAPI.frequenciesAPI.update(this.$route.params.projectid, data);
    },
    create(data) {
      return frequenciesAPI.frequenciesAPI.create(this.$route.params.projectid, data);
    },
    remove(data) {
      return frequenciesAPI.frequenciesAPI.remove(this.$route.params.projectid, data);
    },
    uploadCSV(file) {
      return frequenciesAPI.frequenciesAPI.uploadCSV(this.$route.params.projectid, file);
    },
    log(out) {
      console.log(out);
    },
  },
};
</script>
