<template>
  <div>
    <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
      :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true" :infoURL="infoURL">
    </EditableTable>
  </div>
</template>

<script>
  import EditableTable from "@/components/EditableTable.vue";
  import fareAttributesAPI from '@/api/fareattributes.api';
  import agenciesAPI from '@/api/agencies.api';
  export default {
    components: {
      EditableTable,
    },
    data() {
      return {
        downloadURL: fareAttributesAPI.fareAttributesAPI.getDownloadURL(this.$route.params.projectid),
        url: fareAttributesAPI.fareAttributesAPI.getFullBaseURL(this.$route.params.projectid),
        infoURL: "https://developers.google.com/transit/gtfs/reference#fare_attributestxt",
        fields: [
          'actions',
          {
            name: 'fare_id',
            sortField: 'fare_id',
            title: 'Fare ID*',
          },
          {
            name: 'price',
            sortField: 'price',
            data_type: 'number',
            title: 'Price*',
          },
          {
            name: 'currency_type',
            title: 'Currency Code*',
          },
          {
            name: 'payment_method',
            title: 'Payment Method',
            options: {
              'Before Boarding': 1,
              'On Board': 0,
            },
          },
          {
            name: 'transfers',
            title: 'Transfers',
            options: {
              0:0,
              1:1,
              2:2,
              'Unlimited': null,
            },
          },
          {
            name: 'agency_id',
            title: 'Agency*',
            sortField: 'agency_id',
            foreignKey: true,
            id_field: 'agency',
            ajax_params: {
              url: agenciesAPI.agenciesAPI.getFullBaseURL(this.$route.params.projectid),
            }
          },
          {
            name: 'transfer_duration',
            title: 'Duration [s]*',
            data_type: 'number',
          },
        ],
      };
    },
    methods: {
      update(data) {
        return fareAttributesAPI.fareAttributesAPI.update(this.$route.params.projectid, data);
      },
      create(data) {
        return fareAttributesAPI.fareAttributesAPI.create(this.$route.params.projectid, data);
      },
      remove(data) {
        return fareAttributesAPI.fareAttributesAPI.remove(this.$route.params.projectid, data);
      },
      uploadCSV(file) {
        return fareAttributesAPI.fareAttributesAPI.uploadCSV(this.$route.params.projectid, file);
      },
      log(out) {
        console.log(out);
      },
    },
  };
</script>