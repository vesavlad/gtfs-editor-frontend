import stopsAPI from '@/api/stops.api';
import levelsAPI from '@/api/levels.api';
import Enums from "@/utils/enums";

let stopsMixin = {
  data() {
    return {
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
        {
          name: 'stop_id',
          title: 'Stop ID',
          sortField: 'stop_id',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'stop_code',
          title: 'Code',
          sortField: 'stop_code',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'stop_name',
          title: 'Name',
          sortField: 'stop_name',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'stop_lat',
          title: 'Lat',
          required: true,
          type: Enums.InputType.NUMBER
        },
        {
          name: 'stop_lon',
          title: 'Lon',
          required: true,
          type: Enums.InputType.NUMBER
        },
        {
          name: 'stop_url',
          title: 'URL',
          type: Enums.InputType.URL
        },
        {
          name: 'stop_desc',
          title: 'Description',
          type: Enums.InputType.INPUT
        },
        {
          name: 'zone_id',
          title: 'Zone',
          type: Enums.InputType.INPUT
        },
        {
          name: 'location_type',
          title: 'Location Type',
          type: Enums.InputType.INPUT
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
          },
          type: Enums.InputType.FK_SELECT
        },
        {
          name: 'stop_timezone',
          title: 'Timezone',
          type: Enums.InputType.INPUT
        },
        {
          name: 'wheelchair_boarding',
          title: 'Wheelchair Boarding',
          options: [
            {name: 'No Info', value: null},
            {name: 'Yes', value: 1},
            {name: 'No', value: 0},
          ],
          type: Enums.InputType.SIMPLE_SELECT
        },
        {
          name: 'platform_code',
          title: 'Platform Code',
          type: Enums.InputType.INPUT
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
          },
          type: Enums.InputType.FK_SELECT
        },
      ],
    }
  }
}

export default stopsMixin;