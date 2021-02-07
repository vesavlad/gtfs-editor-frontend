<template>
  <div class="ProjectDashboard container">
    <div class="header">
      <div class="grid center">
        <h1><input v-model="project.name" :disabled="!projectName.edit" v-bind:class="{error: projectName.hasError}" :data-error="projectName.errorMessage" /></h1>
        <button v-if="!projectName.edit" @click="projectName.oldValue=project.name;projectName.edit=true" class="btn icon flat"><i class="material-icons">edit</i></button>
        <button v-if="projectName.edit" @click="updateProjectName" class="btn icon flat"><i class="material-icons">check</i></button>
        <button v-if="projectName.edit" @click="projectName.edit=false;project.name=projectName.oldValue" class="btn icon flat"><i class="material-icons">close</i></button>
      </div>
      <span class="side-info">{{ $t('projectDashboard.lastChange')}}: {{ lastModification }}</span>
    </div>
    <div class="section-content">
      <div class="section-details">
        <div class="card">
          <div class="card-content">
            <div class="header">
              <h2>{{ project.feedinfo?project.feedinfo.feed_publisher_name:'' }}</h2>
              <button class="btn icon flat"><i class="material-icons">edit</i></button>
            </div>
            <div class="grid">
              <div class="box-info">
                <i class="material-icons">language</i>
                <span>{{ project.feedinfo?project.feedinfo.feed_publisher_url:'' }}</span>
              </div>
              <div class="box-info">
                <i class="material-icons">flag</i>
                <span>{{ project.feedinfo?project.feedinfo.feed_lang:'ES' }}</span>
              </div>
            </div>
            <div class="grid-project-info">
              <div class="project-card-map">
                <EnvelopeMap :project="project"></EnvelopeMap>
              </div>
              <div class="project-info-details">
                <div>
                  <h5>{{ $t('projectDashboard.version')}}</h5>
                  <span>{{ project.feedinfo?project.feedinfo.feed_version:'' }}</span>
                </div>
                <div>
                  <h5>{{ $t('projectDashboard.feedID')}}</h5>
                  <span>{{ project.feedinfo?project.feedinfo.feed_id:'' }}</span>
                </div>
                <div class="grid g2">
                  <div>
                    <h5>{{ $t('projectDashboard.startDate')}}</h5>
                    <span>{{ project.feedinfo?project.feedinfo.feed_start_date:'' }}</span>
                  </div>
                  <div>
                    <h5>{{ $t('projectDashboard.endDate')}}</h5>
                    <span>{{ project.feedinfo?project.feedinfo.feed_end_date:'' }}</span>
                  </div>
                </div>
                <div class="grid g2">
                  <div>
                    <h5>{{ $t('projectDashboard.contactURL')}}</h5>
                    <span>Calama</span>
                  </div>
                  <div>
                    <h5>{{ $t('projectDashboard.contactEmail')}}</h5>
                    <span>Calama</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card summary">
          <div class="card-title">
            <h4>{{ $t('projectDashboard.summary')}}</h4>
          </div>
          <div class="card-content">
            <div class="flex between">
              <div>
                <div class="small">{{ $t('projectDashboard.lastBuild')}}</div>
                <div>{{ project.gtfs_file_updated_at?(new Date(project.gtfs_file_updated_at)).toLocaleString():'Never' }}</div>
              </div>
              <div>
                <button class="btn" @click="buildGTFSButtonAction"><span>Run builder</span></button>
              </div>
            </div>
          </div>
          <ul class="list-summary">
            <li>
              <span class="lsh">{{ $t('projectDashboard.buildStatus')}}</span>
              <span class="lst">{{ project.gtfs_creation_status?project.gtfs_creation_status:'' }} {{ project.gtfsvalidation?project.gtfsvalidation.status:'' }}</span>
            </li>
            <li>
              <span class="lsh">{{ $t('projectDashboard.buildDuration')}}</span>
              <span class="lst">{{ project.gtfs_creation_duration?project.gtfs_creation_duration:'' }} {{ project.gtfsvalidation?project.gtfsvalidation.duration:'' }}</span>
            </li>
            <!--          <li>
                        <span class="lsh">Execution</span>
                        <span class="lst">{{ project.gtfsvalidation?(new Date(project.gtfsvalidation.ran_at)).toLocaleString():'' }}</span>
                      </li>-->
            <li>
              <span class="lsh">{{ $t('projectDashboard.errors')}}</span>
              <span class="lst">{{ project.gtfsvalidation?project.gtfsvalidation.error_number:'' }}</span>
            </li>
            <li>
              <span class="lsh">{{ $t('projectDashboard.warnings')}}</span>
              <span class="lst">{{ project.gtfsvalidation?project.gtfsvalidation.warning_number:'' }}</span>
            </li>
          </ul>
          <div class="card-content grid end">
            <button class="btn min warning"
                    :disabled="project.gtfsvalidation && ['finished', 'error'].indexOf(project.gtfsvalidation.status)<0"
                    @click="seeGTFSValidationResults"><span>{{ $t('projectDashboard.viewErrors')}}</span><i class="material-icons">error_outline</i></button>
            <button class="btn min green" @click="dowloadGTFS"><span>{{ $t('projectDashboard.download')}}</span><i class="material-icons">save_alt</i></button>
          </div>
        </div>
      </div>
      <div class="box-data">
        <h2>{{ $t('projectDashboard.gtfsRequiredData')}}</h2>
        <div class="grid-data required">
          <DataCard :filename="'Agencies'" :quantity="24" :errorNumber="3" :warningNumber="4" :state="'enabled'"></DataCard>
          <DataCard :filename="'PP'" :quantity="24" :errorNumber="5" :warningNumber="6" :state="'blocked'" :message="'Require stops and trips data'"></DataCard>
          <DataCard :filename="'CC'" :quantity="24" :errorNumber="7" :warningNumber="8" :state="'empty'" :message="$t('projectDashboard.noData')"></DataCard>
        </div>
      </div>
      <div class="box-data">
        <h2>{{ $t('projectDashboard.gtfsOptionalData')}}</h2>
        <div class="grid-data optional">
          
        </div>
      </div>
    </div>

    <div id="TablesTable" class="flex">
      <Vuetable ref="vuetable" :fields="fields" :data="data" :api-mode="false">
        <div slot="name" slot-scope="props">
          <router-link :to="{name:props.rowData[props.rowField.name], params: { projectid: $route.params.projectid }}">
            {{props.rowData[props.rowField.name]}}
          </router-link>
        </div>
      </Vuetable>
    </div>
    <Modal v-if="showModal" @cancel="showModal = false" @close="showModal = false" @ok="showModal = false"
      :showCancelButton="false" :modalClasses="['warning']">
      <p slot="content" v-html="modalContent"></p>
    </Modal>
  </div>
</template>

<script>
  import { DateTime } from 'luxon';
  import projectsAPI from '@/api/projects.api';
  import tablesAPI from '@/api/tables.api';
  import Modal from '@/components/Modal.vue';
  import EnvelopeMap from '@/components/EnvelopeMap.vue';
  import DataCard from "@/components/DataCard";
  
  //import Enums from '@/utils/enums'
  let Vuetable = require('vuetable-2')

  export default {
    name: 'ProjectDashboard',
    components: {
      DataCard,
      Vuetable: Vuetable.Vuetable,
      Modal,
      EnvelopeMap,
    },
    data() {
      let data = [{
          name: "FeedInfo",
          id: "feed_info",
        }, {
          name: "Agencies",
          id: "agency",
        }, {
          name: "Calendars",
          id: "calendar",
        }, {
          name: "Stops",
          id: "stops",
        }, {
          name: "Routes",
          id: "routes",
        }, {
          name: "Shapes",
          id: "shapes",
        }, {
          name: "Trips",
          id: "trips",
        }, {
          name: "Stop Times",
          id: "stop_times",
        }, {
          name: "Frequencies",
          id: "frequencies",
        }, {
          name: "Calendar Dates",
          id: "calendar_dates",
        }, {
          name: "Fare Attributes",
          id: "fare_attributes",
        }, {
          name: "Fare Rules",
          id: "fare_rules",
        }, {
          name: "Transfers",
          id: "transfers",
        }, {
          name: "Pathways",
          id: "pathways",
        },{
          name: "Levels",
          id: "levels",
        },
      ];
      return {
        projectName: {
          HasError: false,
          errorMessage: '',
          oldValue: null,
          edit: false,
        },
        project: {
          feedInfo: {},
          gtfsvalidation: {}
        },
        fields: [{
            name: "name",
            title: "Table",
          },
          {
            name: "entries",
          },
        ],
        data,
        showModal: false,
        modalContent: '',
      }
    },
    computed: {
      lastModification() {
        return DateTime.fromISO(this.project.last_modification).toRelative({locale: this.$i18n.locale });
      }
    },
    methods: {
      initData() {
        projectsAPI.getProjectDetail(this.$route.params.projectid).then(response => {
          if (!response.data.gtfsvalidation) {
            response.data.gtfsvalidation = {};
          }
          this.project = response.data;
        });
        tablesAPI.list_tables(this.$route.params.projectid).then(response => {
          let data = response.data;
          this.data = this.data.map(datum => {
            let entry = data[datum.id];
            if(entry) {
              return {
                ...entry,
                ...datum,
              }
            }
            return datum;
          });
        });
      },
      updateProjectName() {
        projectsAPI.updateProject(this.$route.params.projectid, {name: this.project.name}).then(() => {
          this.projectName.oldValue = null;
          this.projectName.edit = false;
          this.projectName.hasError = false;
          this.projectName.errorMessage = '';
        }).catch(error => {
          this.projectName.hasError = true;
          this.projectName.errorMessage = error.response.data.name[0];
        });
      },
      dowloadGTFS() {
        projectsAPI.downloadGTFS(this.$route.params.projectid).then(response => {
          let blob = new Blob([response.data], {
            type: response.headers['content-type']
          });
          let url = window.URL.createObjectURL(blob);
          window.open(url);
        }).catch(error => {
          alert(error.response.data);
        });
      },
      buildGTFSButtonAction() {
        projectsAPI.buildGTFS(this.$route.params.projectid).then(response => {
          this.project.gtfs_file_updated_at = response.data.gtfs_file_updated_at;
          this.project.gtfs_creation_status = response.data.gtfs_creation_status;
          this.project.gtfs_creation_duration = response.data.gtfs_creation_duration;
          this.runPeriodicCall();
        }).catch(error => {
          alert(error.response.data);
        });
      },
      seeGTFSValidationResults() {
        let content = this.project.gtfsvalidation.message;
        this.modalContent = '<pre>' + content + '</pre>';
        this.showModal = true;
      },
      validateButtonAction() {
        let status = this.project.gtfsvalidation ? this.project.gtfsvalidation.status : null;
        if (['queued', 'processing'].indexOf(status) >= 0) {
          this.cancelGTFSValidation();
        } else {
          this.runGTFSValidation();
        }
      },
      runGTFSValidation() {
        projectsAPI.runGTFSValidation(this.$route.params.projectid).then(response => {
          this.project.gtfsvalidation = response.data;
          this.runPeriodicCall();
        }).catch(error => {
          this.modalContent = error.response.data[0];
          this.showModal = true;
        });
      },
      cancelGTFSValidation() {
        projectsAPI.cancelGTFSValidation(this.$route.params.projectid).then(response => {
          this.project.gtfsvalidation = response.data;
        }).catch(error => {
          this.modalContent = error.response.data[0];
          this.showModal = true;
        });
      },
      uploadGTFSFile() {
        let currentFile = this.$refs.file.files.item(0);
        projectsAPI.uploadGTFS(this.$route.params.projectid, currentFile).then(response => {
          console.log(response.data);
          this.$refs.file.value = null;
        }).catch(error => {
          console.log(error.data);
          this.$refs.file.value = null;
        });
      },
      runPeriodicCall() {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
          console.log('updated gtfs validation status...');
          projectsAPI.getProjectDetail(this.$route.params.projectid).then(response => {
            if (response.data.gtfsvalidation && ['finished', 'error', 'canceled'].indexOf(
                response.data.gtfsvalidation.status) > -1 && ['finished', 'error']
              .indexOf(response.data.gtfs_creation_status) > -1) {
              clearInterval(this.interval);
            }
            this.project = response.data;
          });
        }, 2000);
      }
    },
    beforeRouteEnter(to, from, next) {
      next(vm => vm.initData());
    },
  }
</script>
