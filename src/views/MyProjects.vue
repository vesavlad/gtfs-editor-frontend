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
      </div>
    </section>
    <CreateProjectModal :isVisible="project.create" @close="project.create=false"
                        @project-created="addProjectToList"></CreateProjectModal>
    <DeletionModal></DeletionModal>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import projectsAPI from '@/api/projects.api';
import ProjectCard from "../components/project/ProjectCard";
import DeletionModal from "@/components/project/DeletionModal";
import CreateProjectModal from "@/components/project/CreateProjectModal";

export default {
  name: 'MyProjects',
  components: {
    ProjectCard,
    CreateProjectModal,
    DeletionModal
  },
  data() {
    return {
      project: {
        create: false
      }
    }
  },
  computed: mapState([
    'projectList'
  ]),
  methods: {
    setData(projects) {
      this.$store.commit('setProjectList', projects);
    },
    addProjectToList(newProject) {
      let newProjectList = [...this.projectList];
      newProjectList.unshift(newProject);
      this.$store.commit('setProjectList', newProjectList);
      this.project.create = false;
    }
  },
  beforeRouteEnter(to, from, next) {
    projectsAPI.getAllProjects().then(response => {
      next(vm => vm.setData(response.data));
    });
  },
}
</script>
