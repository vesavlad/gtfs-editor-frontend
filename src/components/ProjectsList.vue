<template>
  <div class="TransportModeTable">
    <div class="table">
      <table>
        <tbody>
          <tr>
            <th><span>ID</span></th>
            <th><span>Name</span></th>
            <th><span>Last Edit</span></th>
            <th><span>Errors</span></th>
            <th><span>Warnings</span></th>
          </tr>
          <tr v-for="project in rows" :key="project.project_id">
            <td>
              <span>{{ project.project_id }}</span>
            </td>
            <td>
              <router-link :to="{ name: 'projectoverview', params: { projectid: project.project_id }}">{{
                project.name
              }}</router-link>
            </td>
            <td><span>2020-10-10</span></td>
            <td><span>0</span></td>
            <td><span>100</span></td>
          </tr>
        </tbody>
      </table>
      <button class="btn" @click="creatingProject = true">
        <span class="material-icons">add</span><span>New Project</span>
      </button>
    </div>
    <Modal
      v-if="creatingProject"
      @cancel="creatingProject = false"
      @close="creatingProject = false"
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
import projectsAPI from "@/api/projects.api";
export default {
  name: "ProjectsList",
  components: {
    Modal,
  },
  props: {
    rows: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      creatingProject: false,
      projectName: null
    };
  },
  methods: {
    createProject() {
      projectsAPI
        .createProject(this.projectName)
        .then((response) => {
          this.$router.push({ name: "projectoverview", params: {projectid: response.data.project_id} });
        })
        .catch((error) => {
          this.errorMessage = error;
        });
    },
  }
};
</script>