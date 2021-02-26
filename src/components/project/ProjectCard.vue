<template>
  <div class="card project-card">
    <router-link class="project-card-map"
                 :class="{disabled: [creationStatus.LOADING_GTFS, creationStatus.ERROR_LOADING_GTFS].indexOf(status)>-1}"
                 :to="{name: 'projectoverview', params: {projectid: project.project_id}}">
      <EnvelopeMap :project="project" :width="347" :height="170" :enableInteraction="false"></EnvelopeMap>
    </router-link>
    <div class="card-content">
      <div class="grid title">
        <router-link :to="{name: 'projectoverview', params: {projectid: project.project_id}}"
                     :class="{disabled: [creationStatus.LOADING_GTFS, creationStatus.ERROR_LOADING_GTFS].indexOf(status)>-1}">
          <h2>{{ project.name }}</h2>
        </router-link>
        <button class="btn icon flat btn-options" @click="showMenu=!showMenu">
          <i class="material-icons">more_vert</i>
          <ProjectMenu v-if="showMenu" :project="project" v-on="$listeners" @close="showMenu=false"></ProjectMenu>
        </button>
      </div>
      <template v-if="status===creationStatus.LOADING_GTFS">
        <div class="project-msj">
          <span>{{ $t('projectCard.waitGTFSLoading') }}</span>
        </div>
        <div class="grid-pills">
          <PillBase pillClass="loading" pillText="Uploading GTFS"></PillBase>
        </div>
      </template>
      <template v-else-if="status===creationStatus.ERROR_LOADING_GTFS">
        <div class="project-msj error">
          <span>{{ project.loading_gtfs_error_message }}</span>
        </div>
        <div class="grid-buttons">
          <button class="btn warning" @click="retryUpload"><span>Retry</span></button>
          <button class="btn cancel" @click="deleteProject"><span>Delete</span></button>
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
      creationStatus: Enums.ProjectCreationStatus
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
    retryUpload() {
      console.log("retry upload");
    }
  }
}
</script>
