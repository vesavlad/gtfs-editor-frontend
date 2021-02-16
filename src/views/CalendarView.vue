<template>
  <div>
    <EditableTable :fields="fields" :url="url" :updateMethod="updateCalendar" :deleteMethod="removeCalendar"
                   :createMethod="createCalendar" :downloadURL="downloadURL" :uploadCSV="uploadCSV" :infoURL="infoURL">
      <template slot="information">
        Calendars are amazing!!!
      </template>
    </EditableTable>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import calendarAPI from '@/api/calendar.api';

export default {
  components: {
    EditableTable,
  },
  data() {
    return {
      downloadURL: calendarAPI.calendarAPI.getDownloadURL(this.$route.params.projectid),
      url: calendarAPI.calendarAPI.getFullBaseURL(this.$route.params.projectid),
      infoURL: "https://developers.google.com/transit/gtfs/reference#calendartxt",
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      fields: [
        'actions',
        {
          name: 'service_id',
          sortField: 'service_id',
          title: 'Service ID',
          required: true,
        },
        {
          name: 'start_date',
          sortField: 'start_date',
          data_type: 'date',
          remember_creation_value: true,
          title: 'Start Date',
          required: true,
        },
        {
          name: 'end_date',
          sortField: 'end_date',
          data_type: 'date',
          remember_creation_value: true,
          title: 'End Date',
          required: true,
        },
        {
          name: 'monday',
          title: 'Monday',
          data_type: 'checkbox',
          required: true,
        },
        {
          name: 'tuesday',
          title: 'Tuesday',
          data_type: 'checkbox',
          required: true,
        },
        {
          name: 'wednesday',
          title: 'Wednesday',
          data_type: 'checkbox',
          required: true,
        },
        {
          name: 'thursday',
          title: 'Thursday',
          data_type: 'checkbox',
          required: true,
        },
        {
          name: 'friday',
          title: 'Friday',
          data_type: 'checkbox',
          required: true,
        },
        {
          name: 'saturday',
          title: 'Saturday',
          data_type: 'checkbox',
          required: true,
        },
        {
          name: 'sunday',
          title: 'Sunday',
          data_type: 'checkbox',
          required: true,
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