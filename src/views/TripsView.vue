<template>
  <div class="trips container">
    <div class="header">
      <div class="grid v-center">
        <h1>Trips</h1>
        <button class="btn icon flat" alt="Go to GTFS specification.">
          <span class="material-icons">info</span>
        </button>
      </div>
    </div>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="updateTrip" :deleteMethod="removeTrip"
                     :createMethod="createTrip" :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true"
                     :infoURL="infoURL">
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

export default {
  components: {
    EditableTable,
  },
  data() {
    return {
      url: tripsAPI.tripsAPI.getFullBaseURL(this.$route.params.projectid),
      infoURL: "https://developers.google.com/transit/gtfs/reference#tripstxt",
      downloadURL: tripsAPI.tripsAPI.getDownloadURL(this.$route.params.projectid),
      fields: [
        'actions',
        {
          name: 'trip_id',
          title: 'Trip',
          sortField: 'trip_id',
          required: true,
        },
        {
          name: 'route_id',
          title: 'Route',
          sortField: 'route_id',
          foreignKey: true,
          id_field: 'route',
          required: true,
          ajax_params: {
            url: routesAPI.routesAPI.getFullBaseURL(this.$route.params.projectid),
          }
        },
        {
          name: 'shape_id',
          title: 'Shape',
          sortField: 'shape',
          foreignKey: true,
          nullable: true,
          id_field: 'shape',
          ajax_params: {
            url: shapesAPI.shapesAPI.getFullBaseURL(this.$route.params.projectid),
          }
        },
        {
          name: 'service_id',
          title: 'Service',
          foreignKey: true,
          id_field: 'service_id',
          ajax_params: {
            url: 'http://127.0.0.1:8000/api/projects/1/services/',
          }
        },
        {
          name: 'trip_headsign',
          title: 'Headsign',
        },
        {
          name: "direction_id",
          title: "Direction",
          type: "select-simple",
          options: {
            'N/A': null,
            'Going': false,
            'Back': true,
          },
        },
        {
          name: "trip_short_name",
          title: "Short Name",
        },
        {
          name: "block_id",
          title: "Block",
        },
        {
          name: "wheelchair_accessible",
          title: "Wheelchair Accessible",
          type: "select-simple",
          options: {
            'No Info': null,
            'Yes': 1,
            'No': 0,
          },
        },
        {
          name: "bikes_allowed",
          title: "Bikes Allowed",
          type: "select-simple",
          options: {
            'No Info': null,
            'Yes': 1,
            'No': 0,
          },
        },
      ],
    };
  },
  methods: {
    updateTrip(data) {
      return tripsAPI.tripsAPI.update(this.$route.params.projectid, data);
    },
    createTrip(data) {
      return tripsAPI.tripsAPI.create(this.$route.params.projectid, data);
    },
    removeTrip(data) {
      return tripsAPI.tripsAPI.remove(this.$route.params.projectid, data);
    },
    uploadCSV(file) {
      return tripsAPI.tripsAPI.uploadCSV(this.$route.params.projectid, file);
    },
  },
};
</script>
