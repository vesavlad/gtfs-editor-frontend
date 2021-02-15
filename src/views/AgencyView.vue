<template>
  <div class="agency container">
    <div class="header">
      <div class="grid center">
        <h1>{{ $t('Agencies')}}</h1>
        <button class="btn icon flat" alt="Go to GTFS specification.">
          <span class="material-icons">info</span>
        </button>
      </div>
    </div>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="updateAgency" :deleteMethod="removeAgency"
                     :createMethod="createAgency" :downloadURL="downloadURL" :uploadCSV="uploadCSV" :infoURL="infoURL">
      </EditableTable>
    </section>
  </div>
</template>

<script>
  import EditableTable from "@/components/EditableTable.vue";
  import agenciesAPI from '@/api/agencies.api';
  import timezones from '@/api/timezones'
  export default {
    components: {
      EditableTable,
    },
    data() {
      return {
        downloadURL: agenciesAPI.agenciesAPI.getDownloadURL(this.$route.params.projectid),
        url: agenciesAPI.agenciesAPI.getFullBaseURL(this.$route.params.projectid),
        infoURL: "https://developers.google.com/transit/gtfs/reference#agencytxt",
        fields: [
          'actions',
          {
            name: 'agency_id',
            sortField: 'agency_id',
            title: 'Agency ID',
            required: true,
          },
          {
            name: 'agency_name',
            sortField: 'agency_name',
            title: 'Name',
            required: true,
          },
          {
            name: 'agency_url',
            sortField: 'agency_url',
            title: 'URL',
            required: true,
          },
          {
            name: 'agency_timezone',
            remember_creation_value: true,
            sortField: 'agency_timezone',
            title: 'Timezone',
            type: "select-simple",
            options: timezones.timezones.reduce((o, k) => Object.assign(o, {
              [k]: k
            }), {}),
            required: true,
          },
          {
            name: 'agency_lang',
            title: 'Language',
          },
          {
            name: 'agency_phone',
            title: 'Phone',
          },
          {
            name: 'agency_fare_url',
            title: 'Fare URL',
          },
          {
            name: 'agency_email',
            title: 'E-Mail',
          },
        ],
      };
    },
    methods: {
      updateAgency(data) {
        return agenciesAPI.agenciesAPI.update(this.$route.params.projectid, data);
      },
      createAgency(data) {
        return agenciesAPI.agenciesAPI.create(this.$route.params.projectid, data);
      },
      removeAgency(data) {
        return agenciesAPI.agenciesAPI.remove(this.$route.params.projectid, data);
      },
      uploadCSV(file) {
        return agenciesAPI.agenciesAPI.uploadCSV(this.$route.params.projectid, file);
      },
      log(out) {
        console.log(out);
      },
    },
  };
</script>
