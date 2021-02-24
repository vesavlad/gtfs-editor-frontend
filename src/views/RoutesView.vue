<template>
  <div class="routes container">
    <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
                     :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
        <template slot="additional-actions" slot-scope="props">
          <button class="btn icon flat" @click="goToRoute(props)" alt="Go to trips">
            <span class="material-icons">map</span>
          </button>
        </template>
      </EditableTable>
    </section>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import routesAPI from '@/api/routes.api';
import agenciesAPI from '@/api/agencies.api'
import TableHeader from "@/components/vuetable/TableHeader";
import Enums from "@/utils/enums";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Routes',
      infoURL: "https://developers.google.com/transit/gtfs/reference#routestxt",
      url: routesAPI.routesAPI.getFullBaseURL(this.$route.params.projectid),
      downloadURL: routesAPI.routesAPI.getDownloadURL(this.$route.params.projectid),
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
        {
          name: 'route_id',
          title: 'Route ID',
          sortField: 'route_id',
          required: true,
          type: Enums.InputType.INPUT
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
          },
          type: Enums.InputType.FK_SELECT
        },
        {
          name: 'route_type',
          title: 'Type',
          required: true,
          options: [
            {name: 'Tram, Streetcar, Light rail', value: 0},
            {name: 'Subway, Metro', value: 1},
            {name: 'Rail', value: 2},
            {name: 'Bus', value: 3},
            {name: 'Ferry', value: 4},
            {name: 'Cable Tram', value: 5},
            {name: 'Aerial Lift', value: 6},
            {name: 'Funicular', value: 7},
            {name: 'Trolleybus', value: 11},
            {name: 'Monorail', value: 12},
          ],
          type: Enums.InputType.SIMPLE_SELECT
        },
        {
          name: 'route_short_name',
          title: 'Short Name',
          sortField: 'route_short_name',
          type: Enums.InputType.INPUT
        },
        {
          name: 'route_long_name',
          title: 'Long Name',
          sortField: 'route_long_name',
          type: Enums.InputType.INPUT
        },
        {
          name: 'route_desc',
          title: 'Description',
          type: Enums.InputType.INPUT
        },
        {
          name: 'route_url',
          title: 'URL',
          sortField: 'route_url',
          type: Enums.InputType.URL
        },
        {
          name: 'route_color',
          title: 'Route Color',
          remember_creation_value: true,
          sortField: 'route_color',
          type: Enums.InputType.COLOR
        },
        {
          name: 'route_text_color',
          title: 'Text Color',
          remember_creation_value: true,
          sortField: 'route_text_color',
          type: Enums.InputType.COLOR
        },
      ]
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
    }
  },
};
</script>
