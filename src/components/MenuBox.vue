<template>
  <div class="menu-box card" :class="[boxClass]">
    <ul>
      <li class="menu-option">
        <i class="material-icons">edit</i>
        <span>Edit entire shape</span>
      </li>
      <li class="menu-option disabled">
        <i class="material-icons">timeline</i>
        <span>Edit entire shape</span>
      </li>
      <li class="menu-option">
        <i class="material-icons">content_copy</i>
        <span>Duplicate</span>
      </li>
      <li class="menu-option delete">
        <i class="material-icons">delete</i>
        <span>Delete</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'MenuBox',
  props:{
    placement: {
      type: String,
      default: 'upperLeft',
      validation(value) {
        return ['upperLeft', 'upperRight'].indexOf(value) !== -1;
      }
    }
  },
  computed: {
    boxClass(){
      if (this.placement==='upperLeft') {
        return 'upper-left';
      }else if (this.placement==='upperRight') {
        return  'upper-right';
      }
      return '';
    }
  }
}
</script>
