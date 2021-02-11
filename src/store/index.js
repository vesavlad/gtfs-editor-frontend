import Vue from 'vue'
import Vuex from 'vuex'
import ProjectsAPI from '@/api/projects.api';

Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    projectList: [],
    currentProject: null,
    showDeletionModal: false
  },
  mutations: {
    setProjectList(state, projectList) {
      state.projectList = projectList;
    },
    setCurrentProject(state, project) {
      state.currentProject = project
    },
    setFeedInfo(state, feedInfo) {
      state.currentProject.feedinfo = feedInfo;
    },
    setShowDeletionModal(state, value) {
      state.showDeletionModal = value;
    }
  },
  actions: {
    deleteCurrentProject({commit, state}) {
      ProjectsAPI.deleteProject(state.currentProject.project_id).then(() => {
        commit('setShowDeletionModal', false);
        commit("setProjectList", state.projectList.filter(
          project => project.project_id !== state.currentProject.project_id));
        commit('setCurrentProject', null);
      }).catch(error => {
        console.error(error.response.data);
      });
    }
  },
  modules: {}
})
