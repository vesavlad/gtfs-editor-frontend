<template>
  <MessageModal :show="showDeletionModal" @close="closeModal" @cancel="closeModal" @ok="deleteProject"
                :okButtonLabel="$t('general.delete')" :type="ModalType.WARNING">
    <template v-slot:m-title>{{ $t('projectMenu.deleteModalTitle') }}</template>
    <template v-slot:m-content>{{ $t('projectMenu.deleteModalMessage') }}</template>
  </MessageModal>
</template>

<script>
import {mapState} from 'vuex'
import Enums from '@/utils/enums.js'
import MessageModal from '@/components/MessageModal.vue'


export default {
  name: 'ConfirmDeletionModal',
  components: {
    MessageModal
  },
  data() {
    return {
      ModalType: Enums.MessageModalType
    }
  },
  computed: mapState([
    'showDeletionModal',
    'currentProject'
  ]),
  methods: {
    closeModal() {
      this.$store.commit('setShowDeletionModal', false);
    },
    deleteProject() {
      this.$store.dispatch('deleteCurrentProject');
    }
  }
}
</script>
