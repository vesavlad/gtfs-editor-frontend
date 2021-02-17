<template>
  <div class="header">
    <div class="grid v-center">
      <h1>{{ title }}</h1>
      <button class="btn icon flat" alt="Go to GTFS specification." @click="openInfo">
        <span class="material-icons">info</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    infoURL: {
      type: String,
      required: true
    }
  },
  methods: {
    openInfo() {
      window.open(this.infoURL);
    },
  }
};
</script>
