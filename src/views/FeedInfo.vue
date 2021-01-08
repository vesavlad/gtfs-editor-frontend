<template>
  <div>
      <div v-for="field in fields" v-bind:key="field.name">
        <label>{{field.title}}{{field.required?"*":""}}</label>
        <span style="color:red;">
          <div v-for="error in error_data[field.name]" v-bind:key="error">
            <br>
          {{error}}
          </div>
        </span>
        <input :type="field.type" v-model="feedInfo[field.name]">
      </div>
      <button class="btn btn-outline-secondary" @click="save">
        Save and return
      </button>
  </div>
</template>

<script>
  import feedInfoAPI from '@/api/feedinfo.api';
  export default {
    data() {
      return {
        feedInfo: false,
        error_data: {},
        fields: [{
            title: "Publisher Name",
            name: "feed_publisher_name",
            type: "text",
            required: true,
          },
          {
            title: "Publisher URL",
            name: "feed_publisher_url",
            type: "url",
            required: true,
          },
          {
            title: "Language",
            name: "feed_lang",
            type: "text",
            required: true,
          },
          {
            title: "Start date",
            name: "feed_start_date",
            type: "date",
            required: true,
          },
          {
            title: "End Date",
            name: "feed_end_date",
            type: "date",
            required: true,
          },
          {
            title: "Version",
            name: "feed_version",
            type: "text",
            required: true,
          },
          {
            title: "ID",
            name: "feed_id",
            type: "text",
            required: true,
          },
        ]
      }
    },
    mounted() {
      feedInfoAPI.getFeedInfo(this.$route.params.projectid).then(response => {
        let results = response.data.results;
        this.feedInfo = results.length ? results[0] : {};
      }).catch(err => {
        console.log(err);
        window.alert("Error when attempting to load feed info.")
      });
    },
    methods: {
      save() {
        let method = this.feedInfo.id ? feedInfoAPI.update : feedInfoAPI.create;
        method(this.$route.params.projectid, this.feedInfo).then(() => {
          this.$router.push({name: 'projectoverview', params: this.$route.params})
        }).catch(err => {
          this.error_data = err.response.data;
        });
      }
    }
  }
</script>