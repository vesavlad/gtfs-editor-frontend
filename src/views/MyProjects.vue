<template>
  <div class="dashboard container">
    <div class="header">
      <h1>{{ $t('myProjects')}}</h1>
      <button class="btn" @click="creatingProject=true"><span>{{ $t('newProject') }}</span><i class="material-icons">add</i></button>
    </div>
    <section class='content'>
      <div class="projects">
        <ProjectCard v-for="project in projects" v-bind:key="project.project_id" :project="project"></ProjectCard>
      </div>
    </section>
    <BaseModal
        v-if="creatingProject"
        @cancel="creatingProject=false"
        @close="creatingProject=false"
        @ok="createProject"
        :showCancelButton="true"
        :modalClasses="['modal-new-project']"
    >
      <template v-slot:mcontent>
        <div class="modal-new-header">
          <h2>{{ $t('createProject') }}</h2>
          <input v-model="projectName" type="text" class="main-input-text" :placeholder="$t('projectName')"/>
        </div>
        <div class="content grid g2">
          <div class="new-box">
            <img src="@/assets/img/new-scratch.svg" alt="New from scratch image"/>
            <p>Start a new project from scratch</p>
            <button class="btn"><span>Start</span></button>
          </div>
          <div class="new-box">
            <img src="@/assets/img/new-file.svg" alt="New from scratch image"/>
            <p>Start a new project from a GTFS file</p>
            <button class="btn"><span>Upload</span><i class="material-icons">file_upload</i></button>
          </div>
        </div>
      </template>
    </BaseModal><!-- delete -->
    <InputDataModal v-if="showInputDataModal" @close="showInputDataModal=false">
    </InputDataModal><!-- delete -->
    <MessageModal v-if="showMessageModal" @close="showMessageModal=false">
    </MessageModal><!-- delete -->
  </div>
</template>

<script>
import BaseModal from "@/components/BaseModal.vue";  // delete
import InputDataModal from "@/components/InputDataModal.vue";  // delete
import MessageModal from "@/components/MessageModal.vue";  // delete
import projectsAPI from '@/api/projects.api';
import ProjectCard from "../components/ProjectCard";

export default {
  name: 'MyProjects',
  components: {
    ProjectCard,
    BaseModal, // delete
    InputDataModal,  // delete
    MessageModal // delete
  },
  data() {
    return {
      showBaseModal: false, // delete
      showInputDataModal: false, // delete
      showMessageModal: false, // delete
      projects: [],
      creatingProject: false,
      projectName: null
    }
  },
  methods: {
    setData(projects){
      this.projects = projects
    },
    createProject() {
      projectsAPI.createProject(this.projectName).then((response) => {
        this.$router.push({ name: "projectoverview", params: {projectid: response.data.project_id} });
      })
      .catch((error) => {
        this.errorMessage = error;
      });
    },
  },
  beforeRouteEnter (to, from, next) {
    projectsAPI.getAllProjects().then(response => {
      next(vm => vm.setData(response.data));
    });
  },
}
</script>
