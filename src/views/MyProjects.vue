<template>
  <div class="dashboard">
    <div class="header">          
        <h1>Dashboard</h1>
    </div>
    <section class='pheader'>
    <ProjectsList :rows='projects' />
    </section>
  </div>
</template>

<script>
import ProjectsList from '@/components/ProjectsList.vue';
import projectsAPI from '@/api/projects.api';

export default {
  name: 'MyProjects',
  components: {
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
