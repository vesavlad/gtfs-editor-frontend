<template>
  <div class="card summary">
    <div class="card-title">
      <h4>{{ $t('projectDashboard.gtfsBuilder.title') }}</h4>
    </div>
    <div class="card-content">
      <div class="flex between">
        <div>
          <div class="small">{{ $t('projectDashboard.gtfsBuilder.lastBuild') }}</div>
          <div>{{ project.gtfs_file_updated_at ? lastBuildExecution : $t('general.never') }}</div>
        </div>
        <div>
          <button v-if="[status.FINISHED, status.CANCELED, status.ERROR].indexOf(project.gtfs_creation_status)>-1"
                  class="btn" @click="buildGTFS">
            <span>{{ $t('projectDashboard.gtfsBuilder.executeButtonLabel') }}</span>
          </button>
          <button v-else class="btn" @click="cancelBuildGTFS">
            <span><i class='material-icons'>sync</i> {{ $t('projectDashboard.gtfsBuilder.cancelButtonLabel') }}</span>
          </button>
        </div>
      </div>
    </div>
    <ul class="list-summary">
      <li>
        <span class="lsh">{{ $t('projectDashboard.gtfsBuilder.buildStatus') }}</span>
        <span class="lst">{{ project.gtfs_creation_status ? project.gtfs_creation_status : '' }}</span>
      </li>
      <li>
        <span class="lsh">{{ $t('projectDashboard.gtfsBuilder.buildDuration') }}</span>
        <span class="lst">{{ project.gtfs_creation_duration ? project.gtfs_creation_duration : '' }}</span>
      </li>
      <li>
        <span class="lsh">{{ $t('projectDashboard.gtfsBuilder.errors') }}</span>
        <span class="lst">{{ project.gtfs_validation_error_number ? project.gtfs_validation_error_number : '' }}</span>
      </li>
      <li>
        <span class="lsh">{{ $t('projectDashboard.gtfsBuilder.warnings') }}</span>
        <span class="lst">{{
            project.gtfs_validation_warning_number ? project.gtfs_validation_warning_number : ''
          }}</span>
      </li>
    </ul>
    <div class="card-content grid end">
      <button class="btn min warning"
              :disabled="!project.gtfs_validation_message"
              @click="showModal=true"><span>{{ $t('projectDashboard.gtfsBuilder.viewErrors') }}</span><i
          class="material-icons">error_outline</i></button>
      <button class="btn min green" @click="dowloadGTFS">
        <span>{{ $t('projectDashboard.gtfsBuilder.download') }}</span><i class="material-icons">save_alt</i></button>
    </div>
    <BaseModal v-if="showModal" @close="showModal=false">
      <template slot="m-content">
        <p v-html="project.gtfs_validation_message"></p>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import BaseModal from "@/components/BaseModal";
import projectsAPI from "@/api/projects.api";
import {DateTime} from "luxon";
import Enums from "@/utils/enums";

export default {
  name: 'BuildAndValidateGTFS',
  components: {BaseModal},
  props: {
    project: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      showModal: false,
      interval: null,
      status: Enums.BuildAndValidateGTFS
    }
  },
  computed: {
    lastBuildExecution() {
      return DateTime.fromISO(this.project.gtfs_file_updated_at).toRelative({locale: this.$i18n.locale});
    }
  },
  methods: {
    dowloadGTFS() {
      projectsAPI.downloadGTFS(this.project.project_id).then(response => {
        let blob = new Blob([response.data], {
          type: response.headers['content-type']
        });
        let url = window.URL.createObjectURL(blob);
        window.open(url);
      }).catch(error => {
        alert(error.response.data);
      });
    },
    buildGTFS() {
      projectsAPI.buildAndValidateGTFS(this.project.project_id).then(response => {
        this.$emit('update-project', response.data);
        this.runPeriodicCall();
      }).catch(error => {
        alert(error.response.data);
      });
    },
    cancelBuildGTFS() {
      projectsAPI.cancelBuildAndValidateGTFS(this.project.project_id).then(response => {
        this.$emit('update-project', response.data);
      }).catch(error => {
        alert(error.response.data[0]);
      });
    },
    runPeriodicCall() {
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        console.log('updated gtfs validation status...');
        projectsAPI.getProjectDetail(this.project.project_id).then(response => {
          if ([this.status.FINISHED, this.status.ERROR, this.status.CANCELED].indexOf(response.data.gtfs_creation_status) > -1) {
            clearInterval(this.interval);
          }
          this.$emit('update-project', response.data);
        });
      }, 2000);
    }
  }
}
</script>
