<template>
  <div class="dashboard container">
    <div class="header">
      <h1>{{ $t('myProjects.myProjects') }}</h1>
      <button class="btn" @click="project.create=true"><span>{{ $t('myProjects.newProject') }}</span><i
          class="material-icons">add</i></button>
    </div>
    <section class='content'>
      <div class="projects">
        <ProjectCard v-for="project in projectList" v-bind:key="project.project_id" :project="project"
                     @project-updated="updateProject"></ProjectCard>
      </div>
      <div class="empty-section">
        <i class="material-icons">announcement</i>
        <p>There is no projects yet, start one from new project button</p>
      </div>
    </section>
    <CreateProjectModal :isVisible="project.create" @close="project.create=false"
                        @project-created="updateProject"></CreateProjectModal>
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
    updateProject(newProject) {
      let index = this.projectList.findIndex(project => project.project_id === newProject.project_id);
      let newProjectList = [...this.projectList];
      if (index === -1) {
        newProjectList.unshift(newProject);
        this.project.create = false;
      } else {
        newProjectList[index] = newProject;
      }
      this.$store.commit('setProjectList', newProjectList);
    }
  },
  beforeRouteEnter(to, from, next) {
    projectsAPI.getAllProjects().then(response => {
      next(vm => vm.setData(response.data));
    });
  },
}
</script>
