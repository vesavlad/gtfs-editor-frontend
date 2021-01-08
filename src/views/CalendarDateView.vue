<template>
  <div>
    <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
      :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true" :infoURL="infoURL">
    </EditableTable>
  </div>
</template>

<script>
  import EditableTable from "@/components/EditableTable.vue";
  import calendarDatesAPI from '@/api/calendardates.api';

  export default {
    components: {
      EditableTable,
    },
    data() {
      return {
        downloadURL: calendarDatesAPI.calendarDatesAPI.getDownloadURL(this.$route.params.projectid),
        url: calendarDatesAPI.calendarDatesAPI.getFullBaseURL(this.$route.params.projectid),
        infoURL: "https://developers.google.com/transit/gtfs/reference#calendar_datestxt",
        fields: [
          'actions',
          {
            name: 'service_id',
            sortField: 'service_id',
            title: 'Service ID',
            required: true,
          },
          {
            name: 'date',
            sortField: 'date',
            data_type: 'date',
            title: 'Date',
            required: true,
          },
          {
            name: 'exception_type',
            title: 'Exception Type',
            required: true,
            type: "select-simple",
            options: {
              'Service Added': 1,
              'Service Removed': 2,
            },
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