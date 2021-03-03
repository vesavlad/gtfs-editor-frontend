<template>
  <div class="card summary" v-if="project.gtfs_validation">
    <div class="card-title">
      <h4>{{ $t('projectDashboard.gtfsBuilder.title') }}</h4>
    </div>
    <div class="card-content">
      <div class="flex between">
        <div>
          <div class="small">{{ $t('projectDashboard.gtfsBuilder.lastBuild') }}</div>
          <div class="msj-builder-execution"
               v-if="[status.FINISHED, status.CANCELED, status.ERROR, null].indexOf(project.gtfs_building_and_validation_status)>-1">
            {{ project.gtfs_file_updated_at ? lastBuildExecution : $t('general.never') }}
          </div>
          <div v-else class="grid center">
            <span class="msj-builder-execution">{{ $t('projectDashboard.gtfsBuilder.executing') }}</span>
            <i class="material-icons rotating">autorenew</i>
          </div>
        </div>
        <div class="grid">
          <button class="btn"
                  v-if="[status.FINISHED, status.CANCELED, status.ERROR, null].indexOf(project.gtfs_building_and_validation_status)>-1"
                  @click="buildGTFS">
            <span>{{ $t('projectDashboard.gtfsBuilder.executeButtonLabel') }}</span>
            <i class="material-icons-outlined">not_started</i>
          </button>
          <button v-else class="btn cancel" @click="cancelBuildGTFS">
            <span>{{ $t('projectDashboard.gtfsBuilder.cancelButtonLabel') }}</span>
            <i class="material-icons">close</i>
          </button>
        </div>
      </div>
    </div>
    <ul class="list-summary">
      <li>
        <span class="lsh">{{ $t('projectDashboard.gtfsBuilder.buildStatus') }}</span>
        <span class="lst">{{
            project.gtfs_building_and_validation_status ? project.gtfs_building_and_validation_status : ''
          }}</span>
      </li>
      <li>
        <span class="lsh">{{ $t('projectDashboard.gtfsBuilder.buildDuration') }}</span>
        <span class="lst">{{ project.gtfs_building_duration ? project.gtfs_building_duration : '' }}</span>
      </li>
      <li>
        <span class="lsh">{{ $t('projectDashboard.gtfsBuilder.errors') }}</span>
        <span class="lst">{{ project.gtfs_validation.error_number ? project.gtfs_validation.error_number : '' }}</span>
      </li>
      <li>
        <span class="lsh">{{ $t('projectDashboard.gtfsBuilder.warnings') }}</span>
        <span class="lst">{{
            project.gtfs_validation.warning_number ? project.gtfs_validation.warning_number : ''
          }}</span>
      </li>
    </ul>
    <div class="card-content grid end">
      <button class="btn min warning"
              :disabled="!project.gtfs_validation.message"
              @click="showModal=true"><span>{{ $t('projectDashboard.gtfsBuilder.viewErrors') }}</span><i
          class="material-icons">error_outline</i></button>
      <button class="btn min green" @click="dowloadGTFS">
        <span>{{ $t('projectDashboard.gtfsBuilder.download') }}</span><i class="material-icons">save_alt</i></button>
    </div>
    <BaseModal v-if="showModal" @close="showModal=false">
      <template slot="m-content">
        <div class="m-header">
          <h2>{{ $t('projectDashboard.gtfsBuilder.validationReport.title') }}</h2>
          <div class="grid">
            <a class="btn icon flat" target="_blank" href="https://gtfs.mobilitydata.org/spec/gtfs-schedule"><i
                class="material-icons">info</i></a>
            <button class="btn icon flat" @click="showModal=false"><i class="material-icons">close</i></button>
          </div>
        </div>
        <ul class="report-list m-content">
          <li class="report-collapse" v-for="(file, index) in errorData" :key="index">
            <button class="report-header" @click="setVisibility(file)">
              <div>
                <i class="material-icons">description</i>
                <h3>{{ file.filename }}</h3>
                <div class="grid min">
                  <pillBase pillClass="error" :pillText="file.errorNumber"></pillBase>
                  <pillBase pillClass="warning" :pillText="file.warningNumber"></pillBase>
                </div>
              </div>
              <div class="icon flat">
                <i class="material-icons">keyboard_arrow_up</i>
              </div>
            </button>
            <div class="report-body">
              <transition name="fade">
                <div class="report-content" v-if="report.activeRow===file.filename && report.show">
                  <ul class="report-box errors">
                    <li v-for="(row, index) in file.errors" :key="index">
                      <h4>{{ row.title }}</h4>
                      <span>Code: {{ row.code }}, Entity ID: {{ row.entityId }}</span>
                      <p>{{ row.description }}</p>
                    </li>
                  </ul>
                  <ul class="report-box warnings">
                    <li v-for="(row, index) in file.warnings" :key="index">
                      <h4>{{ row.title }}</h4>
                      <span>Code: {{ row.code }}, Entity ID: {{ row.entityId }}</span>
                      <p>{{ row.description }}</p>
                    </li>
                  </ul>
                </div>
              </transition>
            </div>
          </li>
        </ul>
        <div class="m-footer">
          <div class="option-buttons">
            <button class="btn"><span>{{ $t('projectDashboard.gtfsBuilder.validationReport.downloadCSV') }}</span>
            </button>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import BaseModal from "@/components/BaseModal";
import projectsAPI from "@/api/projects.api";
import {DateTime} from "luxon";
import Enums from "@/utils/enums";
import PillBase from "@/components/PillBase";

export default {
  name: 'BuildAndValidateGTFS',
  components: {
    BaseModal,
    PillBase
  },
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
      status: Enums.BuildAndValidateGTFS,
      report: {
        activeRow: null,
        show: true
      }
    }
  },
  computed: {
    lastBuildExecution() {
      return DateTime.fromISO(this.project.gtfs_file_updated_at).toRelative({locale: this.$i18n.locale});
    },
    errorData() {
      let rows = this.project.gtfs_validation.message.split('\n').map(row => row.split(','));
      rows.shift();
      rows.pop();
      return rows.reduce((accumulator, row, index) => {
        let filename = row[0];
        let code = row[1];
        let level = row[2];
        let entityId = row[3];
        let title = row[4];
        let description = row[5];

        if (index === 0) {
          this.report.activeRow = filename;
          this.report.show = true;
        }

        if (!accumulator[filename]) {
          accumulator[filename] = {
            filename: filename,
            errorNumber: 0,
            warningNumber: 0,
            errors: [],
            warnings: []
          };
        }

        let data = {
          title,
          description,
          code,
          entityId
        }
        if (level === 'ERROR') {
          accumulator[filename].errorNumber += 1;
          accumulator[filename].errors.push(data);
        } else if (level === 'WARNING') {
          accumulator[filename].warningNumber += 1;
          accumulator[filename].warnings.push(data);
        }

        return accumulator;
      }, {});
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
          if ([this.status.FINISHED, this.status.ERROR, this.status.CANCELED].indexOf(response.data.gtfs_building_and_validation_status) > -1) {
            clearInterval(this.interval);
            this.$emit('update-project', response.data);
          }
        });
      }, 2000);
    },
    setVisibility(file) {
      if (this.report.activeRow !== file.filename) {
        this.report.activeRow = file.filename;
        this.report.show = true;
      } else {
        this.report.show = !this.report.show;
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.interval);
  }
}
</script>
