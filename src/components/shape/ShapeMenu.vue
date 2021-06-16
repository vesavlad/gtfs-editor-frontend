<template>
  <BaseMenu :placement="placement" :options="options" v-on="$listeners"></BaseMenu>
</template>

<script>
import BaseMenu from '@/components/BaseMenu.vue'
import Enums from '@/utils/enums.js'

export default {
  name: 'ShapeMenu',
  components: {
    BaseMenu
  },
  props: {
    placement: {
      type: String,
      default: Enums.MenuBoxPlacement.UPPER_LEFT
    }
  },
  data() {
    return {
      options: [
        {
          icon: 'edit',
          label: 'shape.menu.editShapeDirectly',
          eventName: 'edit',
          isDisabled: false,
          classes: []
        },
        {
          icon: 'timeline',
          label: 'shape.menu.editSectionOfShape',
          eventName: 'editRange',
          isDisabled: false,
          classes: []
        },
        {
          icon: 'content_copy',
          label: 'shape.menu.duplicateShape',
          eventName: 'duplicate',
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
