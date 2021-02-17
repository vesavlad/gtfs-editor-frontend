<template>
    <div class="pill-base" v-bind:class="pillClass">
      <i class="material-icons icon-error">error</i>
      <i class="material-icons icon-warning">warning</i>
      <i class="material-icons icon-loading rotating">autorenew</i>
      <span>{{pillText}}</span>
    </div>
</template>

<script>
export default {
  name: 'PillBase',
  props: ['pillClass','pillText'],
}
</script>
