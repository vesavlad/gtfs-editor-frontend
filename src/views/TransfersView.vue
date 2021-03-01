<template>
  <div class="transfers container">
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
import transfersAPI from '@/api/transfers.api';
import stopsAPI from '@/api/stops.api'
import TableHeader from "@/components/vuetable/TableHeader";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Transfers',
      infoURL: "https://developers.google.com/transit/gtfs/reference#transferstxt",
      url: transfersAPI.transfersAPI.getFullBaseURL(this.$route.params.projectid),
      downloadURL: transfersAPI.transfersAPI.getDownloadURL(this.$route.params.projectid),
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions')
        },
        {
          name: 'type',
          title: 'Type',
          required: true,
          type: "select-simple",
          options: [
            {name: 'Recommended transfer point', value: 0},
            {name: 'Timed transfer', value: 1},
            {name: 'Requires minimum time', value: 2},
            {name: 'Transfer not possible',value: 3},
          ],
        },
        {
          name: 'from_stop_id',
          title: 'From Stop',
          sortField: 'from_stop_id',
          foreignKey: true,
          name_field: 'stop_id',
          id_field: 'from_stop',
          required: true,
          ajax_params: {
            url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectid),
          }
        },
        {
          name: 'to_stop_id',
          title: 'To Stop',
          sortField: 'to_stop_id',
          foreignKey: true,
          name_field: 'stop_id',
          id_field: 'to_stop',
          required: true,
          ajax_params: {
            url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectid),
          }
        },
        {
          name: 'min_transfer_time',
          title: 'Min Transfer Time',
        },
      ],
    };
  },
  methods: {
    update(data) {
      return transfersAPI.transfersAPI.update(this.$route.params.projectid, data);
    },
    create(data) {
      return transfersAPI.transfersAPI.create(this.$route.params.projectid, data);
    },
    remove(data) {
      return transfersAPI.transfersAPI.remove(this.$route.params.projectid, data);
    },
    uploadCSV(file) {
      return transfersAPI.transfersAPI.uploadCSV(this.$route.params.projectid, file);
    },
  },
};
</script>
