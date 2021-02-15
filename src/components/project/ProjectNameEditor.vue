<template>
  <div class="grid center">
    <input ref="propertyName" v-model="value" :disabled="!edit" @keyup.escape="cancelEdit" @keyup.enter="update"
           v-bind:class="{error: hasError}"
           v-tooltip="{ theme: 'error-tooltip', content: errorMessage, shown: hasError }"
           v-autowidth="{minWidth: '60px', maxWidth: '800px'}"/>
    <button v-if="!edit" @click="enableEdit" class="btn icon flat"><i class="material-icons">edit</i></button>
    <button v-if="edit" @click="update" class="btn icon flat green"><i class="material-icons">check</i></button>
    <button v-if="edit" @click="cancelEdit" class="btn icon flat red"><i class="material-icons">close</i></button>
  </div>
</template>

<script>
import projectsAPI from '@/api/projects.api';

export default {
  name: 'ProjectNameEditor',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      hasError: false,
      errorMessage: '',
      oldValue: null,
      edit: false,
      value: this.project.name
    }
  },
  watch: {
    project(newValue) {
      this.value = newValue.name;
    }
  },
  methods: {
    cancelEdit() {
      this.edit = false;
      this.value = this.oldValue;
      this.hasError = false;
    },
    enableEdit() {
      this.oldValue = this.value;
      this.edit = true;
      this.$nextTick(() => {
        this.$refs.propertyName.focus();
      });
    },
    update() {
      projectsAPI.updateProject(this.project.project_id, {name: this.value}).then(response => {
        this.oldValue = null;
        this.edit = false;
        this.hasError = false;
        this.errorMessage = '';
        this.$emit('project-name-updated', response.data);
      }).catch(error => {
        this.hasError = true;
        this.errorMessage = error.response.data.name[0];
      });
    },
  }
}
</script>
