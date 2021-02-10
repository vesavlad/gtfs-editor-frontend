<template>
  <div class="dashboard container">
    <div class="header">
      <h1>{{ $t('myProjects')}}</h1>
      <button class="btn" @click="project.create=true"><span>{{ $t('newProject') }}</span><i class="material-icons">add</i></button>
    </div>
    <section class='content'>
      <div class="projects">
        <ProjectCard v-for="project in projects" v-bind:key="project.project_id" :project="project" @project-deleted="projectDeleted"></ProjectCard>
      </div>
    </section>
    <BaseModal v-if="project.create" @close="project.create=false;project.config.errors={}" :classes="['modal-new-project']">
      <template v-slot:m-content>
        <div class="modal-new-header">
          <h2>{{ $t('createProject') }}</h2>
          <input v-model="projectName" type="text" class="main-input-text" :placeholder="$t('projectName')" :class="{error: project.config.errors.name }" v-tooltip="{ theme: 'error-tooltip', content: project.config.errors.name?project.config.errors.name[0]:'', shown: project.config.errors.name !== undefined }"/>
        </div>
        <div class="content grid g2">
          <div class="new-box">
            <img src="@/assets/img/new-scratch.svg" alt="New from scratch image"/>
            <p>Start a new project from scratch</p>
            <button class="btn" @click="createProject"><span>Start</span></button>
          </div>
          <div class="new-box">
            <img src="@/assets/img/new-file.svg" alt="New from scratch image"/>
            <p>Start a new project from a GTFS file</p>
            <!-- agregar logica para subir archivo al crear un proyecto -->
            <button class="btn"><span>Upload</span><i class="material-icons">file_upload</i></button>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import BaseModal from "@/components/BaseModal.vue";
import projectsAPI from '@/api/projects.api';
import ProjectCard from "../components/ProjectCard";

export default {
  name: 'MyProjects',
  components: {
    ProjectCard,
    BaseModal
  },
  data() {
    return {
      projects: [],
      project: {
        create: false,
        config: {
          errors: {}
        }
      },
      projectName: null
    }
  },
  methods: {
    setData(projects){
      this.projects = projects
    },
    createProject() {
      projectsAPI.createProject(this.projectName).then((response) => {
        this.project.config.errors = {};
        this.$router.push({ name: "projectoverview", params: {projectid: response.data.project_id} });
      })
      .catch((error) => {
        this.project.config.errors = error.response.data;
      });
    },
    projectDeleted(projectId) {
      this.projects = this.projects.filter(project => project.project_id !== projectId);
    }
  },
  beforeRouteEnter (to, from, next) {
    projectsAPI.getAllProjects().then(response => {
      next(vm => vm.setData(response.data));
    });
  },
}
</script>
