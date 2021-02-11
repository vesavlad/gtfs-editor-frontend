<template>
  <div class="dashboard container">
    <div class="header">
      <h1>{{ $t('myProjects.myProjects')}}</h1>
      <button class="btn" @click="project.create=true"><span>{{ $t('myProjects.newProject') }}</span><i class="material-icons">add</i></button>
    </div>
    <section class='content'>
      <div class="projects">
        <ProjectCard v-for="project in projectList" v-bind:key="project.project_id" :project="project"></ProjectCard>
      </div>
    </section>
    <BaseModal v-if="project.create" @close="project.create=false;project.config.errors={}" :classes="['modal-new-project']">
      <template v-slot:m-content>
        <div class="modal-new-header">
          <h2>{{ $t('myProjects.createProject') }}</h2>
          <input v-model="projectName" type="text" class="main-input-text" :placeholder="$t('myProjects.projectName')" :class="{error: project.config.errors.name }" v-tooltip="{ theme: 'error-tooltip', content: project.config.errors.name?project.config.errors.name[0]:'', shown: project.config.errors.name !== undefined }"/>
        </div>
        <div class="content grid g2">
          <div class="new-box">
            <img src="@/assets/img/new-scratch.svg" alt="New from scratch image"/>
            <p>{{ $t('myProjects.startEmptyProject') }}</p>
            <button class="btn" @click="createProject"><span>{{ $t('general.create') }}</span></button>
          </div>
          <div class="new-box">
            <img src="@/assets/img/new-file.svg" alt="New from scratch image"/>
            <p>{{ $t('myProjects.startProjectFromGTFS') }}</p>
            <!-- agregar logica para subir archivo al crear un proyecto -->
            <button class="btn"><span>{{ $t('general.upload') }}</span><i class="material-icons">file_upload</i></button>
          </div>
        </div>
      </template>
    </BaseModal>
    <DeletionModal></DeletionModal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BaseModal from "@/components/BaseModal.vue";
import projectsAPI from '@/api/projects.api';
import ProjectCard from "../components/ProjectCard";
import DeletionModal from "@/components/project/DeletionModal";

export default {
  name: 'MyProjects',
  components: {
    ProjectCard,
    BaseModal,
    DeletionModal
  },
  data() {
    return {
      project: {
        create: false,
        config: {
          errors: {}
        }
      },
      projectName: null
    }
  },
  computed: mapState([
    'projectList'
  ]),
  methods: {
    setData(projects) {
      this.$store.commit('setProjectList', projects);
    },
    createProject() {
      projectsAPI.createProject(this.projectName).then((response) => {
        this.project.config.errors = {};
        this.$router.push({ name: "projectoverview", params: {projectid: response.data.project_id} });
      })
      .catch((error) => {
        this.project.config.errors = error.response.data;
      });
    }
  },
  beforeRouteEnter (to, from, next) {
    projectsAPI.getAllProjects().then(response => {
      next(vm => vm.setData(response.data));
    });
  },
}
</script>
