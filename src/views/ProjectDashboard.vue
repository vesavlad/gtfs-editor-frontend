<template>
  <div class="ProjectDashboard container">
    <div class="header">
      <div class="grid center">
        <input ref="projectName" v-model="project.name" :disabled="!projectName.edit" v-bind:class="{error: projectName.hasError}" v-tooltip="{ theme: 'error-tooltip', content: projectName.errorMessage, shown: projectName.hasError }" v-autowidth="{minWidth: '60px', maxWidth: '800px'}" />
        <button v-if="!projectName.edit" @click="enableEditProjectName" class="btn icon flat"><i class="material-icons">edit</i></button>
        <button v-if="projectName.edit" @click="updateProjectName" class="btn icon flat green"><i class="material-icons">check</i></button>
        <button v-if="projectName.edit" @click="projectName.edit=false;project.name=projectName.oldValue;projectName.hasError=false" class="btn icon flat red"><i class="material-icons">close</i></button>
      </div>
      <div class="grid center">
        <span class="side-info">{{ $t('projectDashboard.lastChange')}}: {{ lastModification }}</span>
        <button class="btn icon flat" @click="showMenu=!showMenu">
          <i class="material-icons">more_vert</i>
          <ProjectMenu v-if="showMenu" placement="upperRight" :project="project" @project-deleted="$router.push({name: 'myprojects'})" @close="showMenu=false"></ProjectMenu>
        </button>
      </div>
    </div>
    <div class="section-content">
      <div class="section-details">
        <div class="card">
          <div class="card-content">
            <div class="header">
              <h2>{{ project.feedinfo?project.feedinfo.feed_publisher_name:'' }}</h2>
              <button class="btn icon flat" @click="feedInfo.edit=true"><i class="material-icons">edit</i></button>
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
                <EnvelopeMap :project="project" :width="274" :height="204"></EnvelopeMap>
              </div>
              <div class="project-info-details">
                <div>
                  <h5>{{ $t('projectDashboard.feedInfo.version')}}</h5>
                  <span>{{ project.feedinfo?project.feedinfo.feed_version:'' }}</span>
                </div>
                <div>
                  <h5>{{ $t('projectDashboard.feedInfo.feedID')}}</h5>
                  <span>{{ project.feedinfo?project.feedinfo.feed_id:'' }}</span>
                </div>
                <div class="grid g2">
                  <div>
                    <h5>{{ $t('projectDashboard.feedInfo.startDate')}}</h5>
                    <span>{{ project.feedinfo?project.feedinfo.feed_start_date:'' }}</span>
                  </div>
                  <div>
                    <h5>{{ $t('projectDashboard.feedInfo.endDate')}}</h5>
                    <span>{{ project.feedinfo?project.feedinfo.feed_end_date:'' }}</span>
                  </div>
                </div>
                <div class="grid g2">
                  <div>
                    <h5>{{ $t('projectDashboard.feedInfo.contactURL')}}</h5>
                    <span>{{ project.feedinfo?project.feedinfo.feed_contact_url:'' }}</span>
                  </div>
                  <div>
                    <h5>{{ $t('projectDashboard.feedInfo.contactEmail')}}</h5>
                    <span>{{ project.feedinfo?project.feedinfo.feed_contact_email:'' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <BuildAndValidateGTFS :project="project" @update-project="updateProjectStatus"></BuildAndValidateGTFS>
      </div>
      <div class="box-data">
        <h2>{{ $t('projectDashboard.gtfsRequiredData')}}</h2>
        <div class="grid-data required">
          <DataCard v-for="file in data.slice(0, 9)" v-bind:key="file.id" :projectId="$route.params.projectid" :viewName="file.viewName" :filename="file.name" :quantity="file.entries" :state="file.state" :errorNumber="file.errorNumber" :warningNumber="file.warningNumber" :message="$t(file.message)"></DataCard>
        </div>
      </div>
      <div class="box-data">
        <h2>{{ $t('projectDashboard.gtfsOptionalData')}}</h2>
        <div class="grid-data optional">
          <DataCard v-for="file in data.slice(9)" v-bind:key="file.id" :projectId="$route.params.projectid" :viewName="file.viewName" :filename="file.name" :quantity="file.entries" :state="file.state" :errorNumber="file.errorNumber" :warningNumber="file.warningNumber" :message="$t(file.message)"></DataCard>
        </div>
      </div>
    </div>
    <InputDataModal v-if="feedInfo.edit" @close="feedInfo.edit=false" @cancel="feedInfo.edit=false" @save="saveFeedInfo" @removeError="removeMessageError"
      :title="feedInfo.config.title" :link="feedInfo.config.link" :fields="feedInfo.config.fields" :data="project.feedinfo?project.feedinfo:{}" :errors="feedInfo.config.errors">
    </InputDataModal>
    <DeletionModal></DeletionModal>
  </div>
</template>

<script>
  import { DateTime } from 'luxon';
  import projectsAPI from '@/api/projects.api';
  import tablesAPI from '@/api/tables.api';
  import feedInfoAPI from '@/api/feedinfo.api';
  import InputDataModal from '@/components/InputDataModal.vue';
  import EnvelopeMap from '@/components/EnvelopeMap.vue';
  import DataCard from "@/components/DataCard";
  import Enums from '@/utils/enums';
  import ProjectMenu from "@/components/project/ProjectMenu.vue";
  import DeletionModal from "@/components/project/DeletionModal";
  import BuildAndValidateGTFS from "@/components/project/BuildAndValidateGTFS";

  export default {
    name: 'ProjectDashboard',
    components: {
      BuildAndValidateGTFS,
      ProjectMenu,
      DataCard,
      InputDataModal,
      EnvelopeMap,
      DeletionModal
    },
    data() {
      let data = [{
          name: "Agencies",
          viewName: "Agencies",
          id: "agency"
        }, {
          name: "Calendars",
          viewName: "Calendars",
          id: "calendar"
        }, {
          name: "Stops",
          viewName: "Stops",
          id: "stops"
        }, {
          name: "Routes",
          viewName: "Routes",
          id: "routes"
        }, {
          name: "Shapes",
          viewName: "Shapes",
          id: "shapes"
        }, {
          name: "Trips",
          viewName: "Trips",
          id: "trips"
        }, {
          name: "Stop Times",
          viewName: "StopTimes",
          id: "stop_times"
        }, {
          name: "Frequencies",
          viewName: "Frequencies",
          id: "frequencies"
        }, {
          name: "Calendar Dates",
          viewName: "CalendarDates",
          id: "calendar_dates"
        }, {
          name: "Fare Attributes",
          viewName: "FareAttributes",
          id: "fare_attributes"
        }, {
          name: "Fare Rules",
          viewName: "FareRules",
          id: "fare_rules"
        }, {
          name: "Transfers",
          viewName: "Transfers",
          id: "transfers"
        }, {
          name: "Pathways",
          viewName: "Pathways",
          id: "pathways"
        },{
          name: "Levels",
          viewName: "Levels",
          id: "levels"
        },
      ];
      return {
        projectName: {
          hasError: false,
          errorMessage: '',
          oldValue: null,
          edit: false,
        },
        feedInfo: {
          edit: false,
          config: {
            title: 'Feed info',
            link: 'https://developers.google.com/transit/gtfs/reference#feed_infotxt',
            errors: {},
            fields: [{
              label: "Publisher Name",
              name: "feed_publisher_name",
              type: "text",
              required: true,
            },
            {
              label: "Publisher URL",
              name: "feed_publisher_url",
              type: "url",
              required: true,
            },
            {
              label: "Language",
              name: "feed_lang",
              type: "text",
              required: true,
            },
            {
              label: "Start date",
              name: "feed_start_date",
              type: "date",
              required: true,
            },
            {
              label: "End Date",
              name: "feed_end_date",
              type: "date",
              required: true,
            },
            {
              label: "Version",
              name: "feed_version",
              type: "text",
              required: true,
            },
            {
              label: "Contact URL",
              name: "feed_contact_url",
              type: "url",
              required: false,
            },
            {
              label: "Contact Email",
              name: "feed_contact_email",
              type: "text",
              required: false,
            },
            {
              label: "ID",
              name: "feed_id",
              type: "text",
              required: true,
            },
          ]
          }
        },
        project: {
          feedinfo: {},
          gtfsvalidation: {}
        },
        data,
        showMenu: false,
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
              entry.errorNumber= 1;
              entry.warningNumber= 1;
              entry.state= Enums.DataCard.ENABLED;

              if (entry.entries===0) {
                datum.message= 'projectDashboard.dataCard.noData';
                datum.state = Enums.DataCard.EMPTY
              }

              if (datum.id==='routes' && data.agency.entries===0) {
                datum.message = 'projectDashboard.dataCard.routesBlockMessage';
                datum.state = Enums.DataCard.BLOCKED;
              } else if (datum.id==='trips' && (data.routes.entries===0 || data.calendar.entries===0 || data.shapes.entries===0)) {
                datum.message = 'projectDashboard.dataCard.tripsBlockMessage';
                datum.state = Enums.DataCard.BLOCKED;
              } else if (datum.id==='frequencies' && data.trips.entries===0) {
                datum.message = 'projectDashboard.dataCard.frequenciesBlockMessage';
                datum.state = Enums.DataCard.BLOCKED;
              } else if (datum.id==='transfers' && data.stops.entries===0) {
                datum.message = 'projectDashboard.dataCard.transfersBlockMessage';
                datum.state = Enums.DataCard.BLOCKED;
              } else if (datum.id==='pathways' && data.stops.entries===0) {
                datum.message = 'projectDashboard.dataCard.pathwaysBlockMessage';
                datum.state = Enums.DataCard.BLOCKED;
              }

              return {
                ...entry,
                ...datum,
              }
            }
            return datum;
          });
        });
      },
      enableEditProjectName() {
        this.projectName.oldValue=this.project.name;
        this.projectName.edit=true;
        this.$nextTick(() => {
          this.$refs.projectName.focus();
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
      saveFeedInfo(feedInfoData) {
        let method = this.project.feedinfo && this.project.feedinfo.id ? feedInfoAPI.update : feedInfoAPI.create;
        method(this.$route.params.projectid, feedInfoData).then((response) => {
          this.project.feedinfo = response.data;
          this.feedInfo.edit = false;
          this.feedInfo.config.errors = {};
        }).catch(err => {
          this.feedInfo.config.errors = err.response.data;
        });
      },
      removeMessageError(fieldName) {
        this.$delete(this.feedInfo.config.errors, fieldName);
      },
      updateProjectStatus(project) {
        this.project.gtfs_file_updated_at = project.gtfs_file_updated_at;
        this.project.gtfs_creation_status = project.gtfs_creation_status;
        this.project.gtfs_creation_duration = project.gtfs_creation_duration;
        this.project.gtfs_validation_message = project.gtfs_validation_message;
        this.project.gtfs_validation_error_number = project.gtfs_validation_error_number;
        this.project.gtfs_validation_warning_number = project.gtfs_validation_warning_number;
        this.project.gtfs_validation_duration = project.gtfs_validation_duration;
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
      }
    },
    beforeRouteEnter(to, from, next) {
      next(vm => vm.initData());
    },
  }
</script>
