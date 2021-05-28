<template>
  <div class="trips container">
    <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="updateTrip" :deleteMethod="removeTrip"
                     :createMethod="createTrip" :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
        <template slot="additional-buttons">
          <button class="btn btn-outline-secondary" @click="$router.push({ name: 'Shapes', params: $router.params })">
            Edit Shapes
          </button>
        </template>
      </EditableTable>
    </section>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import tripsAPI from '@/api/trips.api';
import routesAPI from '@/api/routes.api';
import shapesAPI from '@/api/shapes.api';
import servicesAPI from '@/api/services.api';
import TableHeader from "@/components/vuetable/TableHeader";
import Enums from "@/utils/enums";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Trips',
      infoURL: "https://developers.google.com/transit/gtfs/reference#tripstxt",
      url: tripsAPI.tripsAPI.getFullBaseURL(this.$route.params.projectId),
      downloadURL: tripsAPI.tripsAPI.getDownloadURL(this.$route.params.projectId),
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
        {
          name: 'trip_id',
          title: 'Trip',
          sortField: 'trip_id',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'route_id',
          title: 'Route',
          sortField: 'route_id',
          foreignKey: true,
          id_field: 'route',
          required: true,
          ajax_params: {
            url: routesAPI.routesAPI.getFullBaseURL(this.$route.params.projectId),
          },
          type: Enums.InputType.FK_SELECT
        },
        {
          name: 'shape_id',
          title: 'Shape',
          sortField: 'shape',
          foreignKey: true,
          nullable: true,
          id_field: 'shape',
          ajax_params: {
            url: shapesAPI.shapesAPI.getFullBaseURL(this.$route.params.projectId),
          },
          type: Enums.InputType.FK_SELECT
        },
        {
          name: 'service_id',
          title: 'Service',
          foreignKey: true,
          id_field: 'service_id',
          ajax_params: {
            url: servicesAPI.servicesAPI.getFullBaseURL(this.$route.params.projectId),
          },
          type: Enums.InputType.FK_SELECT
        },
        {
          name: 'trip_headsign',
          title: 'Headsign',
          type: Enums.InputType.INPUT
        },
        {
          name: "direction_id",
          title: "Direction",
          type: Enums.InputType.SIMPLE_SELECT,
          options: [
            {name: 'N/A', value: null},
            {name: 'Going', value: 0},
            {name: 'Back', value: 1}
          ],
        },
        {
          name: "trip_short_name",
          title: "Short Name",
          type: Enums.InputType.INPUT
        },
        {
          name: "block_id",
          title: "Block",
          type: Enums.InputType.INPUT
        },
        {
          name: "wheelchair_accessible",
          title: "Wheelchair Accessible",
          type: Enums.InputType.SIMPLE_SELECT,
          options: [
            {name: 'No Info', value: null},
            {name: 'Yes', value: 1},
            {name: 'No', value: 2},
          ],
        },
        {
          name: "bikes_allowed",
          title: "Bikes Allowed",
          type: Enums.InputType.SIMPLE_SELECT,
          options: [
            {name: 'No Info', value: null},
            {name: 'Yes', value: 1},
            {name: 'No', value: 2},
          ],
        },
      ],
    };
  },
  methods: {
    updateTrip(data) {
      return tripsAPI.tripsAPI.update(this.$route.params.projectId, data);
    },
    createTrip(data) {
      return tripsAPI.tripsAPI.create(this.$route.params.projectId, data);
    },
    removeTrip(data) {
      return tripsAPI.tripsAPI.remove(this.$route.params.projectId, data);
    },
    uploadCSV(file) {
      return tripsAPI.tripsAPI.uploadCSV(this.$route.params.projectId, file);
    },
  },
};
</script>
