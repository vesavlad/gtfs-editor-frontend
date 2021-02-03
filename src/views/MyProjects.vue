<template>
  <div class="dashboard container">
    <div class="header">
      <h1>{{ $t('myProjects')}}</h1>
      <button class="btn" @click="creatingProject=true"><span>New project</span><i class="material-icons">add</i></button>
    </div>
    <section class='content'>
      <div class="grid projects">
        <ProjectCard v-for="project in projects" v-bind:key="project.project_id" :project="project"></ProjectCard>
      </div>
    </section>
    <Modal
      v-if="creatingProject"
      @cancel="creatingProject=false"
      @close="creatingProject=false"
      @ok="createProject"
      :showCancelButton="true"
      :modalClasses="[]"
    >
      <template slot="title">
        <h2>Create project</h2>
      </template>
      <template slot="content">
        <label for="pname">Project Name:</label>
        <input v-model="projectName" type="text" />
      </template>
      <template slot="base"> </template>
      <template slot="close-button-name">Create Project</template>
    </Modal>
  </div>
</template>

<script>
import Modal from "@/components/Modal.vue";
import projectsAPI from '@/api/projects.api';
import ProjectCard from "../components/ProjectCard";

export default {
  name: 'MyProjects',
  components: {
    ProjectCard,
    Modal,
  },
  data() {
    return {
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
