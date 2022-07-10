<template>
  <div class="agency container">
    <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="updateAgency" :deleteMethod="removeAgency"
                     :createMethod="createAgency" :downloadURL="downloadURL" :uploadCSV="uploadCSV">
      </EditableTable>
    </section>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import agenciesAPI from '@/api/agencies.api';
import timezones from '@/api/timezones';
import TableHeader from "@/components/vuetable/TableHeader";
import Enums from "@/utils/enums";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Agency',
      infoURL: "https://developers.google.com/transit/gtfs/reference#agencytxt",
      downloadURL: agenciesAPI.agenciesAPI.getDownloadURL(this.$route.params.projectId),
      url: agenciesAPI.agenciesAPI.getFullBaseURL(this.$route.params.projectId),
      fields: [
        {
          name: 'agency_id',
          sortField: 'agency_id',
          title: 'Agency ID',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'agency_name',
          sortField: 'agency_name',
          title: 'Name',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'agency_url',
          sortField: 'agency_url',
          title: 'URL',
          required: true,
          type: Enums.InputType.URL
        },
        {
          name: 'agency_timezone',
          remember_creation_value: true,
          sortField: 'agency_timezone',
          title: 'Timezone',
          type: Enums.InputType.SIMPLE_SELECT,
          options: timezones.timezones.map(tzName => {
            return {name: tzName, value: tzName};
          }),
          required: true,
        },
        {
          name: 'agency_lang',
          title: 'Language',
          type: Enums.InputType.INPUT
        },
        {
          name: 'agency_phone',
          title: 'Phone',
          type: Enums.InputType.INPUT
        },
        {
          name: 'agency_fare_url',
          title: 'Fare URL',
          type: Enums.InputType.URL
        },
        {
          name: 'agency_email',
          title: 'E-Mail',
          type: Enums.InputType.EMAIL
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
    updateAgency(data) {
      return agenciesAPI.agenciesAPI.update(this.$route.params.projectId, data);
    },
    createAgency(data) {
      return agenciesAPI.agenciesAPI.create(this.$route.params.projectId, data);
    },
    removeAgency(data) {
      return agenciesAPI.agenciesAPI.remove(this.$route.params.projectId, data);
    },
    uploadCSV(file) {
      return agenciesAPI.agenciesAPI.uploadCSV(this.$route.params.projectId, file);
    }
  },
};
</script>
