<template>
  <div class="fare-rules container">
    <div class="header">
      <div class="grid v-center">
        <h1>Fare rules</h1>
        <button class="btn icon flat" alt="Go to GTFS specification.">
          <span class="material-icons">info</span>
        </button>
      </div>
    </div>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
                     :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true" :infoURL="infoURL">
      </EditableTable>
    </section>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import fareRulesAPI from '@/api/farerules.api';
import fareAttributesAPI from '@/api/fareattributes.api';
import routesAPI from '@/api/routes.api';

export default {
  components: {
    EditableTable,
  },
  data() {
    return {
      downloadURL: fareRulesAPI.fareRulesAPI.getDownloadURL(this.$route.params.projectid),
      url: fareRulesAPI.fareRulesAPI.getFullBaseURL(this.$route.params.projectid),
      infoURL: "https://developers.google.com/transit/gtfs/reference#fare_rulestxt",
      fields: [
        'actions',
        {
          name: 'fare_id',
          title: 'Fare ID',
          sortField: 'fare_id',
          foreignKey: true,
          id_field: 'fare_attribute',
          required: true,
          ajax_params: {
            url: fareAttributesAPI.fareAttributesAPI.getFullBaseURL(this.$route.params.projectid),
          }
        },
        {
          name: 'route_id',
          title: 'Route',
          sortField: 'route_id',
          foreignKey: true,
          nullable: true,
          id_field: 'route',
          ajax_params: {
            url: routesAPI.routesAPI.getFullBaseURL(this.$route.params.projectid),
          }
        },
        {
          name: "origin_id",
          title: "Origin Zone",
        },
        {
          name: "destination_id",
          title: "Destination Zone",
        },
        {
          name: "contains_id",
          title: "Contained Zone",
        }
      ],
    };
  },
  methods: {
    update(data) {
      return fareRulesAPI.fareRulesAPI.update(this.$route.params.projectid, data);
    },
    create(data) {
      return fareRulesAPI.fareRulesAPI.create(this.$route.params.projectid, data);
    },
    remove(data) {
      return fareRulesAPI.fareRulesAPI.remove(this.$route.params.projectid, data);
    },
    uploadCSV(file) {
      return fareRulesAPI.fareRulesAPI.uploadCSV(this.$route.params.projectid, file);
    },
    log(out) {
      console.log(out);
    },
  },
};
</script>
