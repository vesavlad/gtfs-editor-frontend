
  import stopsAPI from '@/api/stops.api';
  import levelsAPI from '@/api/levels.api';

let stopsMixin = {
  data() {
    return {
      fields: [
        'actions',
        {
          name: 'stop_id',
          title: 'Stop*',
          sortField: 'stop_id',
        },
        {
          name: 'stop_code',
          title: 'Code',
          sortField: 'stop_code',
        },
        {
          name: 'stop_name',
          title: 'Name*',
          sortField: 'stop_name',
        },
        {
          name: 'stop_lat',
          title: 'Lat*',
        },
        {
          name: 'stop_lon',
          title: 'Lon*',
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
          options: {
            'Unknown': null,
            'Yes': 1,
            'No': 0,
          },
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