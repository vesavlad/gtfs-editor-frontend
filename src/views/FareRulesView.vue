<template>
  <div>
    <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
      :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
    </EditableTable>
  </div>
</template>

<script>
  import EditableTable from "@/components/EditableTable.vue";
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
        fields: [
          'actions',
          {
            name: 'fare_id',
            title: 'Fare ID',
            sortField: 'fare_id',
            foreignKey: true,
            id_field: 'fare_attribute',
            ajax_params: {
              url: fareAttributesAPI.fareAttributesAPI.getFullBaseURL(this.$route.params.projectid),
            }
          },
          {
            name: 'route_id',
            title: 'Route',
            sortField: 'route_id',
            foreignKey: true,
            id_field: 'route',
            ajax_params: {
              url: routesAPI.routesAPI.getFullBaseURL(this.$route.params.projectid),
            }
          },
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