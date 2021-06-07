<template>
  <BaseMenu :placement="placement" :options="options" v-on="$listeners"></BaseMenu>
</template>

<script>
import BaseMenu from '@/components/BaseMenu.vue'
import Enums from '@/utils/enums.js'

export default {
  name: 'StopTimesMenu',
  components: {
    BaseMenu
  },
  props: {
    placement: {
      type: String,
      default: Enums.MenuBoxPlacement.UPPER_LEFT,
    }
  },
  data() {
    return {
      options: [
        {
          icon: 'edit',
          label: 'stopTimes.menu.edit',
          eventName: 'edit',
          isDisabled: false,
          classes: []
        },
        {
          icon: 'content_copy',
          label: 'stopTimes.menu.duplicateExpedition',
          eventName: 'duplicate-trip',
          isDisabled: false,
          classes: []
        },
        {
          icon: 'content_copy',
          label: 'stopTimes.menu.duplicateExpeditionUsingHeadway',
          eventName: 'copy-trip-using-headway',
          isDisabled: false,
          classes: []
        },
        {
          icon: 'delete',
          label: 'general.delete',
          eventName: 'delete',
          isDisabled: false,
          classes: ['delete']
        }
      ]
    }
  }
}
</script>
