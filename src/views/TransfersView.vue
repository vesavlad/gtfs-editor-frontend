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
import Enums from "@/utils/enums";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Transfers',
      infoURL: "https://developers.google.com/transit/gtfs/reference#transferstxt",
      url: transfersAPI.transfersAPI.getFullBaseURL(this.$route.params.projectId),
      downloadURL: transfersAPI.transfersAPI.getDownloadURL(this.$route.params.projectId),
      fields: [
        {
          name: 'type',
          title: 'Type',
          required: true,
          type: Enums.InputType.SIMPLE_SELECT,
          options: [
            {name: 'Recommended transfer point', value: 0},
            {name: 'Timed transfer', value: 1},
            {name: 'Requires minimum time', value: 2},
            {name: 'Transfer not possible', value: 3},
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
            url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectId),
          },
          type: Enums.InputType.FK_SELECT
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
            url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectId),
          },
          type: Enums.InputType.FK_SELECT
        },
        {
          name: 'min_transfer_time',
          title: 'Min Transfer Time',
          type: Enums.InputType.NUMBER
        },
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
      ],
    };
  },
  methods: {
    update(data) {
      return transfersAPI.transfersAPI.update(this.$route.params.projectId, data);
    },
    create(data) {
      return transfersAPI.transfersAPI.create(this.$route.params.projectId, data);
    },
    remove(data) {
      return transfersAPI.transfersAPI.remove(this.$route.params.projectId, data);
    },
    uploadCSV(file) {
      return transfersAPI.transfersAPI.uploadCSV(this.$route.params.projectId, file);
    },
  },
};
</script>
