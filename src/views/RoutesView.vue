<template>
  <div>
    <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
      :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true" :infoURL="infoURL">
      <template slot="additional-actions" slot-scope="props">
        <button class="btn icon flat" @click="goToRoute(props)" alt="Go to trips">
          <span class="material-icons">map</span>
        </button>
      </template>
    </EditableTable>
  </div>
</template>

<script>
  import EditableTable from "@/components/EditableTable.vue";
  import routesAPI from '@/api/routes.api';
  import agenciesAPI from '@/api/agencies.api'
  export default {
    components: {
      EditableTable,
    },
    data() {
      return {
        url: routesAPI.routesAPI.getFullBaseURL(this.$route.params.projectid),
        infoURL: "https://developers.google.com/transit/gtfs/reference#routestxt",
        downloadURL: routesAPI.routesAPI.getDownloadURL(this.$route.params.projectid),
        fields: [
          'actions',
          {
            name: 'route_id',
            title: 'hola',
            sortField: 'route_id',
            required: true,
          },
          {
            name: 'agency_id',
            title: 'Agency',
            sortField: 'agency_id',
            foreignKey: true,
            id_field: 'agency',
            required: true,
            ajax_params: {
              url: agenciesAPI.agenciesAPI.getFullBaseURL(this.$route.params.projectid),
            }
          },
          {
            name: 'route_type',
            title: 'Type',
            type: "select-simple",
            required: true,
            options: {
              'Tram, Streetcar, Light rail': 0,
              'Subway, Metro': 1,
              'Rail': 2,
              'Bus': 3,
              'Ferry': 4,
              'Cable Tram': 5,
              'Aerial Lift': 6,
              'Funicular': 7,
              'Trolleybus': 11,
              'Monorail': 12,
            },
          },
          {
            name: 'route_short_name',
            title: 'Short Name',
            sortField: 'route_short_name',
          },
          {
            name: 'route_long_name',
            title: 'Long Name',
            sortField: 'route_long_name',
          },
          {
            name: 'route_desc',
            title: 'Description',
          },
          {
            name: 'route_url',
            title: 'URL',
            sortField: 'route_url',
          },
          {
            name: 'route_color',
            title: 'Route Color',
            remember_creation_value: true,
            sortField: 'route_color',
          },
          {
            name: 'route_text_color',
            title: 'Text Color',
            remember_creation_value: true,
            sortField: 'route_text_color',
          },
        ],
      };
    },
    methods: {
      goToRoute(params) {
        this.$router.push({
          path: 'trips',
          params,
          query: {
            search: params.rowData.route_id,
          }
        })
      },
      update(data) {
        return routesAPI.routesAPI.update(this.$route.params.projectid, data);
      },
      create(data) {
        return routesAPI.routesAPI.create(this.$route.params.projectid, data);
      },
      remove(data) {
        return routesAPI.routesAPI.remove(this.$route.params.projectid, data);
      },
      uploadCSV(file) {
        return routesAPI.routesAPI.uploadCSV(this.$route.params.projectid, file);
      },
    },
  };
</script>
