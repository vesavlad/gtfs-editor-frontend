<template>
  <div class="calendar container">
    <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="updateCalendar" :deleteMethod="removeCalendar"
                     :createMethod="createCalendar" :downloadURL="downloadURL" :uploadCSV="uploadCSV">
        <template slot="information">
          Calendars are amazing!!!
        </template>
      </EditableTable>
    </section>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import calendarAPI from '@/api/calendar.api';
import TableHeader from "@/components/vuetable/TableHeader";
import Enums from "@/utils/enums";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Calendar',
      infoURL: "https://developers.google.com/transit/gtfs/reference#calendartxt",
      downloadURL: calendarAPI.calendarAPI.getDownloadURL(this.$route.params.projectid),
      url: calendarAPI.calendarAPI.getFullBaseURL(this.$route.params.projectid),
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
        {
          name: 'service_id',
          sortField: 'service_id',
          title: 'Service ID',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'start_date',
          sortField: 'start_date',
          type: Enums.InputType.DATE,
          remember_creation_value: true,
          title: 'Start Date',
          required: true,
        },
        {
          name: 'end_date',
          sortField: 'end_date',
          type: Enums.InputType.DATE,
          remember_creation_value: true,
          title: 'End Date',
          required: true,
        },
        {
          name: 'monday',
          title: 'Monday',
          type: Enums.InputType.CHECKBOX,
          required: true,
          inputConfig: {
            transformLabel: (title) => title.toLowerCase().substring(0,3)
          }
        },
        {
          name: 'tuesday',
          title: 'Tuesday',
          type: Enums.InputType.CHECKBOX,
          required: true,
          inputConfig: {
            transformLabel: (title) => title.toLowerCase().substring(0,3)
          }
        },
        {
          name: 'wednesday',
          title: 'Wednesday',
          type: Enums.InputType.CHECKBOX,
          required: true,
          inputConfig: {
            transformLabel: (title) => title.toLowerCase().substring(0,3)
          }
        },
        {
          name: 'thursday',
          title: 'Thursday',
          type: Enums.InputType.CHECKBOX,
          required: true,
          inputConfig: {
            transformLabel: (title) => title.toLowerCase().substring(0,3)
          }
        },
        {
          name: 'friday',
          title: 'Friday',
          type: Enums.InputType.CHECKBOX,
          required: true,
          inputConfig: {
            transformLabel: (title) => title.toLowerCase().substring(0,3)
          }
        },
        {
          name: 'saturday',
          title: 'Saturday',
          type: Enums.InputType.CHECKBOX,
          required: true,
          inputConfig: {
            transformLabel: (title) => title.toLowerCase().substring(0,3)
          }
        },
        {
          name: 'sunday',
          title: 'Sunday',
          type: Enums.InputType.CHECKBOX,
          required: true,
          inputConfig: {
            transformLabel: (title) => title.toLowerCase().substring(0,3)
          }
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
