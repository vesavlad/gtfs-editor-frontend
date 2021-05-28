<template>
  <div class="pathways container">
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
import pathwaysAPI from '@/api/pathways.api';
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
      tableTitle: 'Pathways',
      infoURL: "https://developers.google.com/transit/gtfs/reference#pathwaystxt",
      url: pathwaysAPI.pathwaysAPI.getFullBaseURL(this.$route.params.projectId),
      downloadURL: pathwaysAPI.pathwaysAPI.getDownloadURL(this.$route.params.projectId),
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
        {
          name: "pathway_id",
          title: "Pathway ID",
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'pathway_mode',
          title: 'Mode',
          type: Enums.InputType.SIMPLE_SELECT,
          required: true,
          options: [
            {name: 'walkway', value: 1},
            {name: 'stairs', value: 2},
            {name: 'moving sidewalk/travelator', value: 3},
            {name: 'escalator', value: 4},
            {name: 'elevator', value: 5},
            {name: 'fare gate (or payment gate)', value: 6},
            {name: 'exit gate', value: 7},
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
          name: "is_bidirectional",
          title: "Bidirectional",
          type: Enums.InputType.CHECKBOX,
          required: true,
        },
      ],
    };
  },
  methods: {
    update(data) {
      return pathwaysAPI.pathwaysAPI.update(this.$route.params.projectId, data);
    },
    create(data) {
      return pathwaysAPI.pathwaysAPI.create(this.$route.params.projectId, data);
    },
    remove(data) {
      return pathwaysAPI.pathwaysAPI.remove(this.$route.params.projectId, data);
    },
    uploadCSV(file) {
      return pathwaysAPI.pathwaysAPI.uploadCSV(this.$route.params.projectId, file);
    },
  },
};
</script>
