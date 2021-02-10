<template>
  <div>
    <BaseMenuBox :placement="placement" :options="options" @delete="showConfirmationModal=true" ></BaseMenuBox>
    <MessageModal v-if="showConfirmationModal" @close="showConfirmationModal=false" @cancel="showConfirmationModal=false" 
      @ok="deleteProject" :okButtonLabel="$t('delete')" :type="ModalType.ERROR">
      <template v-slot:m-title>{{ $t('projectMenu.deleteModalTitle') }}</template>
      <template v-slot:m-content>{{ $t('projectMenu.deleteModalMessage') }}</template>
    </MessageModal>
  </div>
</template>

<script>
import BaseMenuBox from '@/components/menuBox/BaseMenuBox.vue'
import Enums from '@/utils/enums.js'
import MessageModal from '@/components/MessageModal.vue'

export default {
  name: 'ProjectMenu',
  components: {
    BaseMenuBox,
    MessageModal
  },
  props:{
    placement: {
      type: String,
      default: Enums.MenuBoxPlacement.UPPER_LEFT,
    }
  },
  data() {
    return {
      options: [
        {
          icon: 'delete',
          name: 'delete',
          eventName: 'delete',
          isDisabled: false,
          classes: ['delete']
        }
      ],
      showConfirmationModal: false,
      ModalType: Enums.MessageModalType
    }
  },
  methods: {
    deleteProject() {
      this.showConfirmationModal = false;
      console.log("delete project");
      if (this.$route.name !== 'myprojects') {
        this.$router.push({name: 'myprojects'});
      }
    }
  }
}
</script>
