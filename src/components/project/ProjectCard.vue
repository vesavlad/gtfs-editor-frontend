<template>
  <div class="card project-card">
    <router-link class="project-card-map" :to="{name: 'projectoverview', params: {projectid: project.project_id}}">
      <EnvelopeMap :project="project" :width="347" :height="170" :enableInteraction="false"></EnvelopeMap>
    </router-link>
    <div class="card-content">
      <div class="grid title">
        <router-link :to="{name: 'projectoverview', params: {projectid: project.project_id}}">
          <h2>{{project.name}}</h2>
        </router-link>
        <button class="btn icon flat btn-options" @click.stop.prevent="showMenu=!showMenu">
          <i class="material-icons">more_vert</i>
          <ProjectMenu v-if="showMenu" :project="project" v-on="$listeners" @close="showMenu=false"></ProjectMenu>
        </button>
      </div>
      <div class="grid project-details">
        <div class="project-id">
          <strong>
            <span>ID:</span>
            <span>{{project.project_id}}</span>
          </strong>
        </div>
        <div class="project-last-edit">
          <span>{{ $t('projectCard.lastChange') }}: </span>
          <span>{{ lastModification }}</span>
        </div>
      </div>
      <div class="grid-pills">
        <template v-if="project.gtfs_validation_error_number!==null || project.gtfs_validation_warning_number !==null">
          <PillBase pillClass="error" :pillText="$t('projectCard.errors') + ': ' + project.gtfs_validation_error_number"></PillBase>
          <PillBase pillClass="warning" :pillText="$t('projectCard.warnings')+': ' + project.gtfs_validation_warning_number"></PillBase>
        </template>
        <PillBase v-else pillClass="empty" :pillText="$t('projectCard.neverValidated')"></PillBase>
      </div>
    </div>
  </div>
</template>

<script>
  import { DateTime } from 'luxon';
  import PillBase from "../PillBase";
  import EnvelopeMap from "../EnvelopeMap";
  import ProjectMenu from "@/components/project/ProjectMenu.vue";

  export default {
    name: 'ProjectCard',
    components: {
      PillBase,
      EnvelopeMap,
      ProjectMenu
    },
    props: {
      project:{
        type:Object,
        required:true
      }
    },
    data() {
      return {
        showMenu: false
      }
    },
    computed: {
      lastModification() {
        return DateTime.fromISO(this.project.last_modification).toRelative({locale: this.$i18n.locale });
      }
    }
  }
</script>
