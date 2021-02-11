<template>
  <div class="menu-box card" :class="[boxClass]" @click.stop.prevent v-on-clickaway="clickOutside">
    <ul>
      <li v-for="option in options" :key="option.name" class="menu-option" :class="option.classes.concat([option.isDisabled?'disabled':''])" @click="$emit(option.eventName)">
        <i class="material-icons">{{ option.icon }}</i>
        <span>{{ $t(option.label) }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import Enums from '@/utils/enums.js'
import { mixin as clickaway } from 'vue-clickaway';

export default {
  name: 'BaseMenu',
  mixins: [clickaway],
  props:{
    placement: {
      type: String,
      default: Enums.MenuBoxPlacement.UPPER_LEFT,
      validator(value) {
        return [Enums.MenuBoxPlacement.UPPER_LEFT, Enums.MenuBoxPlacement.UPPER_RIGHT].indexOf(value) !== -1;
      }
    },
    options: {
      type: Array,
      required: true,
      validator(value) {
        let properties = ['icon', 'label', 'eventName', 'isDisabled', 'classes'];
        for (let i = 0; i < properties.length; i++) {
          for (let j = 0; j < value.length; j++) {
            if (!Object.prototype.hasOwnProperty.call(value[j], properties[i])) {
              console.warn(`Property ${properties[i]} is not present in element ${j+1} of options prop`);
              return false;
            }
          }
        }
        return true;
      }
    }
  },
  computed: {
    boxClass() {
      if (this.placement===Enums.MenuBoxPlacement.UPPER_LEFT) {
        return 'upper-left';
      }else if (this.placement===Enums.MenuBoxPlacement.UPPER_RIGHT) {
        return  'upper-right';
      }
      return '';
    }
  },
  methods: {
    clickOutside() {
      this.$emit('close');
    }
  }
}
</script>
