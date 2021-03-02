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
import Enums from "@/utils/enums";

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
          },
          type: Enums.InputType.FK_SELECT
        },
        {
          name: 'start_time',
          sortField: 'start_time',
          title: 'Start Time',
          required: true,
          type: Enums.InputType.TIME
        },
        {
          name: 'end_time',
          sortField: 'end_time',
          title: 'End Time',
          required: true,
          type: Enums.InputType.TIME
        },
        {
          name: 'headway_secs',
          title: 'Headway Seconds',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'exact_times',
          title: 'Exact Times',
          required: true,
          type: Enums.InputType.SIMPLE_SELECT,
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
