<template>
    <a href="#" class="card project-card">
        <div class="project-card-map">
            <EnvelopeMap :project="project"></EnvelopeMap>
        </div>
        <div class="card-content" @click="$router.push({ name: 'projectoverview', params: { projectid: project.project_id } })">
            <div class="grid title">
                <h2>{{project.name}}</h2>
                <button class="btn icon flat"><i class="material-icons">more_vert</i></button>
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
                <PillBase v-if="project.gtfsvalidation" pillClass="error" :pillText="$t('projectCard.errors') + ': ' + project.gtfsvalidation.error_number"></PillBase>
                <PillBase v-if="project.gtfsvalidation" pillClass="warning" :pillText="$t('projectCard.warnings')+': ' + project.gtfsvalidation.warning_number"></PillBase>
                <PillBase v-if="!project.gtfsvalidation" pillClass="empty" :pillText="'without validation'"></PillBase>
            </div>
        </div>
    </a>
</template>

<script>
  import { DateTime } from 'luxon';
  import PillBase from "./PillBase";
  import EnvelopeMap from "./EnvelopeMap";

  export default {
    name: 'ProjectCard',
    components: {
      PillBase,
      EnvelopeMap
    },
    props: {
      project:{
        type:Object,
        required:true
      }
    },
    computed: {
      lastModification() {
        return DateTime.fromISO(this.project.last_modification).toFormat('FF');
      }
    }
  }
</script>
