<template>
  <div>
    <EditableTable :fields="fields" :url="url" :updateMethod="updateCalendar" :deleteMethod="removeCalendar"
      :createMethod="createCalendar" :downloadURL="downloadURL" :uploadCSV="uploadCSV">
    </EditableTable>
  </div>
</template>

<script>
  import EditableTable from "@/components/EditableTable.vue";
  import calendarAPI from '@/api/calendar.api';

  export default {
    components: {
      EditableTable,
    },
    data() {
      console.log(calendarAPI.calendarAPI.getDownloadURL(this.$route.params.projectid));
      return {
        downloadURL: calendarAPI.calendarAPI.getDownloadURL(this.$route.params.projectid),
        url: calendarAPI.calendarAPI.getFullBaseURL(this.$route.params.projectid),
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        fields: [
          'actions',
          {
            name: 'service_id',
            sortField: 'service_id',
            title: 'Service ID*',
          },
          {
            name: 'start_date',
            sortField: 'start_date',
            data_type: 'date',
            title: 'Start Date*',
          },
          {
            name: 'end_date',
            sortField: 'end_date',
            data_type: 'date',
            title: 'End Date*',
          },
          {
            name: 'monday',
            data_type: 'checkbox',
          },
          {
            name: 'tuesday',
            data_type: 'checkbox',
          },
          {
            name: 'wednesday',
            data_type: 'checkbox',
          },
          {
            name: 'thursday',
            data_type: 'checkbox',
          },
          {
            name: 'friday',
            data_type: 'checkbox',
          },
          {
            name: 'saturday',
            data_type: 'checkbox',
          },
          {
            name: 'sunday',
            data_type: 'checkbox',
          },
        ],
      };
    },
    methods: {
      updateCalendar(data) {
        return calendarAPI.calendarAPI.update(this.$route.params.projectid, data);
      },
      createCalendar(data) {
        return calendarAPI.calendarAPI.create(this.$route.params.projectid, data);
      },
      removeCalendar(data) {
        return calendarAPI.calendarAPI.remove(this.$route.params.projectid, data);
      },
      uploadCSV(file) {
        return calendarAPI.calendarAPI.uploadCSV(this.$route.params.projectid, file);
      },
      log(out) {
        console.log(out);
      },
    },
  };
</script>