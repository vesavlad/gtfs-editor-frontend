<template>
  <div class="dashboard container">
    <div class="header">
      <h1>Dashboard</h1>
      <button class="btn"><span>New project</span><i class="material-icons">add</i></button>
    </div>
    <section class='content'>
      <div class="grid projects">
        <ProjectCard v-for="project in projects" v-bind:key="project.project_id" :project="project"></ProjectCard>
      </div>
    <ProjectsList :rows='projects' />
    </section>
  </div>
</template>

<script>
import ProjectsList from '@/components/ProjectsList.vue';
import projectsAPI from '@/api/projects.api';
import ProjectCard from "../components/ProjectCard";

export default {
  name: 'MyProjects',
  components: {
    ProjectCard,
      ProjectsList
  },
  data() {
      return {
          projects: []
      }
  },
  methods: {
      setData(projects){
        this.projects = projects
      }
  },
  beforeRouteEnter (to, from, next) {
    projectsAPI.getAllProjects().then(response => {
      console.log(response)
        next(vm => vm.setData(response.data));
    });
  },
}
</script>
