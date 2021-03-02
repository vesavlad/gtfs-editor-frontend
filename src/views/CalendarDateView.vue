<template>
  <div class="calendar-dates container">
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
import calendarDatesAPI from '@/api/calendardates.api';
import TableHeader from "@/components/vuetable/TableHeader";
import Enums from "@/utils/enums";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Calendar dates',
      infoURL: "https://developers.google.com/transit/gtfs/reference#calendar_datestxt",
      downloadURL: calendarDatesAPI.calendarDatesAPI.getDownloadURL(this.$route.params.projectid),
      url: calendarDatesAPI.calendarDatesAPI.getFullBaseURL(this.$route.params.projectid),
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions')
        },
        {
          name: 'service_id',
          sortField: 'service_id',
          title: 'Service ID',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'date',
          sortField: 'date',
          title: 'Date',
          required: true,
          type: Enums.InputType.DATE
        },
        {
          name: 'exception_type',
          title: 'Exception Type',
          required: true,
          type: Enums.InputType.SIMPLE_SELECT,
          options: [
            {name: 'Service Added', value: 1},
            {name: 'Service Removed', value: 2},
          ],
        },
      ],
    };
  },
  methods: {
    update(data) {
      return calendarDatesAPI.calendarDatesAPI.update(this.$route.params.projectid, data);
    },
    create(data) {
      return calendarDatesAPI.calendarDatesAPI.create(this.$route.params.projectid, data);
    },
    remove(data) {
      return calendarDatesAPI.calendarDatesAPI.remove(this.$route.params.projectid, data);
    },
    uploadCSV(file) {
      return calendarDatesAPI.calendarDatesAPI.uploadCSV(this.$route.params.projectid, file);
    },
    log(out) {
      console.log(out);
    },
  },
};
</script>
