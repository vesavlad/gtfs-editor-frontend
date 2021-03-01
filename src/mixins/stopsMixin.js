
  import stopsAPI from '@/api/stops.api';
  import levelsAPI from '@/api/levels.api';

let stopsMixin = {
  data() {
    return {
      fields: [
        'actions',
        {
          name: 'stop_id',
          title: 'Stop ID',
          sortField: 'stop_id',
          required: true,
        },
        {
          name: 'stop_code',
          title: 'Code',
          sortField: 'stop_code',
          required: true,
        },
        {
          name: 'stop_name',
          title: 'Name',
          sortField: 'stop_name',
          required: true,
        },
        {
          name: 'stop_lat',
          title: 'Lat',
          required: true,
        },
        {
          name: 'stop_lon',
          title: 'Lon',
          required: true,
        },
        {
          name: 'stop_url',
          title: 'URL',
        },
        {
          name: 'stop_desc',
          title: 'Description',
        },
        {
          name: 'zone_id',
          title: 'Zone',
        },
        {
          name: 'location_type',
          title: 'Location Type',
        },
        {
          name: 'parent_station_id',
          title: 'Parent Station',
          foreignKey: true,
          id_field: 'parent_station',
          fk_name: 'stop_id',
          nullable: true,
          ajax_params: {
            url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectid),
          }
        },
        {
          name: 'stop_timezone',
          title: 'Timezone',
        },
        {
          name: 'wheelchair_boarding',
          title: 'Wheelchair Boarding',
          options: [
            {name: 'No Info', value: null},
            {name: 'Yes', value: 1},
            {name: 'No', value: 0},
          ],
        },
        {
          name: 'platform_code',
          title: 'Platform Code',
        },
        {
          name: 'level_id',
          sortField: 'level_id',
          title: 'Level',
          foreignKey: true,
          id_field: 'level',
          nullable: true,
          ajax_params: {
            url: levelsAPI.levelsAPI.getFullBaseURL(this.$route.params.projectid),
          }
        },
      ],
    }
  }
}

export default stopsMixin;