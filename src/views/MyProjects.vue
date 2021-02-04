<template>
  <div class="dashboard container">
    <button @click="showBaseModal=true" class="btn">show baseModal</button> <!-- delete -->
    <button @click="showInputDataModal=true" class="btn">show inputDataModal</button> <!-- delete -->
    <button @click="showMessageModal=true" class="btn">show messageModal</button> <!-- delete -->
    <div class="header">
      <h1>{{ $t('myProjects')}}</h1>
      <button class="btn" @click="creatingProject=true"><span>{{ $t('newProject') }}</span><i class="material-icons">add</i></button>
    </div>
    <section class='content'>
      <div class="projects">
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
      <template slot="mHeader">
        <h2>{{ $t('createProject') }}</h2>
      </template>
      <template slot="mContent">
        <label for="pname">{{ $t('projectName') }}:</label>
        <input v-model="projectName" type="text" />
      </template>
      <template slot="mFooter"> </template>
      <template slot="close-button-name">{{ $t('createProject') }}</template>
    </Modal>
    <BaseModal v-if="showBaseModal" @close="showBaseModal=false">
      <template v-slot:mcontent>
        hola1
      </template>
    </BaseModal><!-- delete -->
    <InputDataModal v-if="showInputDataModal" @close="showInputDataModal=false">
      <template v-slot:mcontent>
        hola2
      </template>
    </InputDataModal><!-- delete -->
    <MessageModal v-if="showMessageModal" @close="showMessageModal=false">
      <template v-slot:mcontent>
        hola3
      </template>
    </MessageModal><!-- delete -->
  </div>
</template>

<script>
import Modal from "@/components/Modal.vue";
import BaseModal from "@/components/BaseModal.vue";  // delete
import InputDataModal from "@/components/InputDataModal.vue";  // delete
import MessageModal from "@/components/MessageModal.vue";  // delete
import projectsAPI from '@/api/projects.api';
import ProjectCard from "../components/ProjectCard";

export default {
  name: 'MyProjects',
  components: {
    ProjectCard,
    Modal,
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
