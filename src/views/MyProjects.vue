<template>
  <div class="dashboard container">
    <div class="header">
      <h1>{{ $t('myProjects.myProjects') }}</h1>
      <button class="btn" @click="project.create=true"><span>{{ $t('myProjects.newProject') }}</span><i
          class="material-icons">add</i></button>
    </div>
    <section class='content'>
      <div class="projects">
        <ProjectCard v-for="project in projectList" v-bind:key="project.project_id" :project="project"></ProjectCard>

        <div class="card project-card">
          <router-link class="project-card-map disabled" :to="{name: 'projectoverview', params: {projectid: project.project_id}}">
            <EnvelopeMap :project="project" :width="347" :height="170" :enableInteraction="false"></EnvelopeMap>
          </router-link>
          <div class="card-content">
            <div class="grid title">
              <router-link :to="{name: 'projectoverview', params: {projectid: project.project_id}}" class="disabled">
                <h2>Name</h2>
              </router-link>
              <button class="btn icon flat btn-options" @click="showMenu=!showMenu">
                <i class="material-icons">more_vert</i>
                <ProjectMenu v-if="showMenu" :project="project" v-on="$listeners" @close="showMenu=false"></ProjectMenu>
              </button>
            </div>
            <div class="project-msj">
              <span>Wait until uploading is complete</span>
            </div>
            <div class="grid-pills">
              <PillBase pillClass="loading" pillText="Uploading GTFS"></PillBase>
            </div>
          </div>
        </div>
        <div class="card project-card">
          <router-link class="project-card-map disabled" :to="{name: 'projectoverview', params: {projectid: project.project_id}}">
            <EnvelopeMap :project="project" :width="347" :height="170" :enableInteraction="false"></EnvelopeMap>
          </router-link>
          <div class="card-content">
            <div class="grid title">
              <router-link :to="{name: 'projectoverview', params: {projectid: project.project_id}}" class="disabled">
                <h2>Name</h2>
              </router-link>
              <button class="btn icon flat btn-options" @click="showMenu=!showMenu">
                <i class="material-icons">more_vert</i>
                <ProjectMenu v-if="showMenu" :project="project" v-on="$listeners" @close="showMenu=false"></ProjectMenu>
              </button>
            </div>
            <div class="project-msj error">
              <span>GTFS could not upload</span>
            </div>
            <div class="grid-buttons">
              <button class="btn warning"><span>Retry</span></button>
              <button class="btn cancel"><span>Delete</span></button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <BaseModal v-if="project.create" @close="project.create=false;project.config.errors={}"
               :classes="['modal-new-project']">
      <template v-slot:m-content>
        <div class="modal-new-header">
          <h2>{{ $t('myProjects.createProject') }}</h2>
        </div>
        <div class="content">
          <input v-model="projectName" type="text" class="main-input-text" :placeholder="$t('myProjects.projectName')"
                 :class="{error: project.config.errors.name }" @focus="project.config.errors={}"
                 v-tooltip="{ theme: 'error-tooltip', content: project.config.errors.name?project.config.errors.name[0]:'', shown: project.config.errors.name !== undefined }"/>
            <div class="title">
              <h4>Choose how to start</h4>
              <div class="line"></div>
            </div>
            <div class="new-box">
              <label class="grid-new-box">
                <input type="radio" name="how-to-start" checked/>
                <div class="flex center">
                  <img src="@/assets/img/new-scratch.svg" alt="New from scratch image"/>
                  <img src="@/assets/img/check.svg" class="check" alt="Check"/>
                </div>
                <p>{{ $t('myProjects.startEmptyProject') }}</p>
              </label>
            </div>
            <div class="new-box">
              <label class="grid-new-box">
                <input type="radio" name="how-to-start"/>
                <div class="flex center">
                  <img src="@/assets/img/new-file.svg" alt="New from scratch image"/>
                  <img src="@/assets/img/check.svg" class="check" alt="Check"/>
                </div>
                <p>{{ $t('myProjects.startProjectFromGTFS') }}</p>
              </label>
              <!-- agregar logica para subir archivo al crear un proyecto -->
              <div  class="upload-gtfs-file">
                <label>
                  <span class="btn flat"><span>{{ $t('general.upload') }}</span><i class="material-icons">file_upload</i></span>
                  <input type="file" id="file" ref="file" accept="zip" v-on:change="handleFileUpload"/>
                </label>
                <div class="file-name"><span>My file</span><button class="btn flat icon error"><i class="material-icons">close</i></button></div>
              </div>
            </div>
        </div>
        <div class="modal-footer">
          <button class="btn green" @click="createProjectFromGTFS">
            <span>{{ $t('general.create') }}</span>
          </button>
        </div>
      </template>
    </BaseModal>
    <DeletionModal></DeletionModal>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import BaseModal from "@/components/BaseModal.vue";
import projectsAPI from '@/api/projects.api';
import ProjectCard from "../components/project/ProjectCard";
import DeletionModal from "@/components/project/DeletionModal";
import PillBase from "@/components/PillBase";
import Enums from "@/utils/enums";
import EnvelopeMap from "@/components/EnvelopeMap";

export default {
  name: 'MyProjects',
  components: {
    ProjectCard,
    BaseModal,
    DeletionModal,
    PillBase,
    EnvelopeMap
  },
  data() {
    return {
      project: {
        create: false,
        config: {
          errors: {}
        }
      },
      projectName: null,
      fileContent: null,
      interval: null
    }
  },
  computed: mapState([
    'projectList'
  ]),
  methods: {
    setData(projects) {
      this.$store.commit('setProjectList', projects);
    },
    createProjectAndRedirect() {
      projectsAPI.createProject(this.projectName).then(response => {
        this.project.config.errors = {};
        this.$router.push({name: "projectoverview", params: {projectid: response.data.project_id}});
      })
          .catch((error) => {
            this.project.config.errors = error.response.data;
          });
    },
    createProjectFromGTFS() {
      projectsAPI.createProjectFromGTFS(this.projectName, this.fileContent).then(response => {
        this.$refs.file.value = null;
        this.runPeriodicCall(response.data);
      }).catch(error => {
        console.error(error.data);
        this.project.config.errors = error.response.data;
        this.$refs.file.value = null;
      });
    },
    handleFileUpload() {
      this.fileContent = this.$refs.file.files.item(0);
    },
    runPeriodicCall(project) {
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        console.log('checking gtfs loading status...');
        projectsAPI.getProjectDetail(project.project_id).then(response => {
          if ([Enums.ProjectCreationStatus.FROM_GTFS, Enums.ProjectCreationStatus.ERROR_LOADING_GTFS].indexOf(response.data.creation_status) > -1) {
            clearInterval(this.interval);
            if (response.data.creation_status === Enums.ProjectCreationStatus.FROM_GTFS) {
              console.log("gtfs loaded");
            } else if (response.data.creation_status === Enums.ProjectCreationStatus.ERROR_LOADING_GTFS) {
              console.log("gtfs was not loaded");
            }
          }
        });
      }, 2000);
    }
  },
  beforeRouteEnter(to, from, next) {
    projectsAPI.getAllProjects().then(response => {
      next(vm => vm.setData(response.data));
    });
  },
}
</script>
