<template>
  <div>
  </div>
</template>


<script>
export default {
  name: 'InfoButton',
  data(){
    let processed_info = (info instanceof Array)?info:[info];
    return {
      processed_info,
    }
  },
  props: {
    info: {
      default: ""
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
