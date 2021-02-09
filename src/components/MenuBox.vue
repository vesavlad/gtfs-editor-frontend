<template>
  <div class="menu-box card">
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
  name: 'MenuBox'
}
</script>
