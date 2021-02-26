<template>
  <div class="card project-card">
    <router-link class="project-card-map"
                 :class="{disabled: [creationStatus.LOADING, creationStatus.ERROR].indexOf(status)>-1}"
                 :event="[creationStatus.LOADING, creationStatus.ERROR].indexOf(status)>-1?'':'click'"
                 :to="{name: 'projectoverview', params: {projectid: project.project_id}}">
      <EnvelopeMap :project="project" :width="347" :height="170" :enableInteraction="false"></EnvelopeMap>
    </router-link>
    <div class="card-content">
      <div class="grid title">
        <router-link :to="{name: 'projectoverview', params: {projectid: project.project_id}}"
                     :class="{disabled: [creationStatus.LOADING, creationStatus.ERROR].indexOf(status)>-1}"
                     :event="[creationStatus.LOADING, creationStatus.ERROR].indexOf(status)>-1?'':'click'">
          <h2>{{ project.name }}</h2>
        </router-link>
        <div class="btn icon flat btn-options">
          <i class="material-icons" @click="showMenu=!showMenu">more_vert</i>
          <ProjectMenu v-if="showMenu" :project="project" @close="showMenu=false"></ProjectMenu>
        </div>
      </div>
      <template v-if="status===creationStatus.LOADING">
        <div class="project-msj">
          <span>{{ $t('projectCard.waitGTFSLoading') }}</span>
        </div>
        <div class="grid-pills">
          <PillBase pillClass="loading" :pillText="$t('projectCard.uploadingGTFS')"></PillBase>
        </div>
      </template>
      <template v-else-if="status===creationStatus.ERROR">
        <div class="project-msj error">
          <span>{{ project.loading_gtfs_error_message }}</span>
        </div>
        <div class="grid-buttons">
          <label class="btn warning">
            <input class="btn warning" type="file" ref="file" accept="application/zip" v-on:change="uploadGTFSFile"/>
            <span>{{ $t('projectCard.retry') }}</span>
          </label>
          <button class="btn cancel" @click="deleteProject"><span>{{ $t('projectCard.delete') }}</span></button>
        </div>
      </template>
      <template v-else>
        <div class="grid project-details">
          <div class="project-id">
            <strong>
              <span>ID:</span>
              <span>{{ project.project_id }}</span>
            </strong>
          </div>
          <div class="project-last-edit">
            <span>{{ $t('projectCard.lastChange') }}: </span>
            <span>{{ lastModification }}</span>
          </div>
        </div>
        <div class="grid-pills">
          <template
              v-if="project.gtfs_validation.error_number!==null || project.gtfs_validation.warning_number !==null">
            <PillBase pillClass="error"
                      :pillText="$t('projectCard.errors') + ': ' + project.gtfs_validation.error_number"></PillBase>
            <PillBase pillClass="warning"
                      :pillText="$t('projectCard.warnings')+': ' + project.gtfs_validation.warning_number"></PillBase>
          </template>
          <PillBase v-else pillClass="empty" :pillText="$t('projectCard.neverValidated')"></PillBase>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import {DateTime} from 'luxon';
import PillBase from "../PillBase";
import EnvelopeMap from "../EnvelopeMap";
import ProjectMenu from "@/components/project/ProjectMenu.vue";
import Enums from "@/utils/enums";
import projectsAPI from "@/api/projects.api";

export default {
  name: 'ProjectCard',
  components: {
    PillBase,
    EnvelopeMap,
    ProjectMenu
  },
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showMenu: false,
      creationStatus: Enums.ProjectCardStatus,
      interval: null
    }
  },
  computed: {
    lastModification() {
      return DateTime.fromISO(this.project.last_modification).toRelative({locale: this.$i18n.locale});
    },
    status() {
      if (this.project.creation_status === Enums.ProjectCreationStatus.LOADING_GTFS) {
        return Enums.ProjectCardStatus.LOADING;
      } else if (this.project.creation_status === Enums.ProjectCreationStatus.ERROR_LOADING_GTFS) {
        return Enums.ProjectCardStatus.ERROR;
      }
      return Enums.ProjectCardStatus.OK;
    }
  },
  methods: {
    deleteProject() {
      this.$store.commit('setCurrentProject', this.project);
      this.$store.commit('setShowDeletionModal', true);
    },
    runPeriodicCall() {
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        console.log('checking gtfs loading status...');
        projectsAPI.getProjectDetail(this.project.project_id).then(response => {
          if ([Enums.ProjectCreationStatus.FROM_GTFS, Enums.ProjectCreationStatus.ERROR_LOADING_GTFS].indexOf(response.data.creation_status) > -1) {
            clearInterval(this.interval);
            if (response.data.creation_status === Enums.ProjectCreationStatus.FROM_GTFS) {
              console.log("gtfs loaded");
            } else if (response.data.creation_status === Enums.ProjectCreationStatus.ERROR_LOADING_GTFS) {
              console.log("gtfs was not loaded");
            }
            this.$emit('project-updated', response.data);
          }
        });
      }, 2000);
    },
    uploadGTFSFile() {
      if (this.$refs.file.files[0]) {
        let currentFile = this.$refs.file.files.item(0);
        projectsAPI.uploadGTFS(this.project.project_id, currentFile).then(response => {
          this.$refs.file.value = null;
          this.$emit('project-updated', response.data);
          this.runPeriodicCall();
        }).catch(error => {
          console.log(error.response.data);
          this.$refs.file.value = null;
        });
      }
    }
  }, mounted() {
    if (this.status === Enums.ProjectCardStatus.LOADING) {
      this.runPeriodicCall();
    }
  },
  beforeDestroy() {
    clearInterval(this.interval);
  }
}
</script>
