<template>
  <div>
    <button class="btn icon" @click="openInfo" alt="Commands">
      <span class="material-icons">info</span>
    </button>
    <MessageModal :show="modal.visible" @close="closeInfo" @ok="closeInfo" :showCancelButton="false"
                  okButtonLabel="$t('general.close')" :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>Usage Info</h2>
      </template>
      <template v-slot:m-content>
        <div v-for="piece in processed_info" v-bind:key="piece">
          <span class="info">{{ piece }}</span>
          <br>
        </div>
      </template>
    </MessageModal>
  </div>

</template>


<script>
import MessageModal from "@/components/modal/MessageModal";

export default {
  name: 'InfoButton',
  components: {
    MessageModal
  },
  data() {
    let info = this.info;
    let processed_info = (info instanceof Array) ? info : [info];
    return {
      processed_info,
      modal: {
        visible: false,
      }
    }
  },
  props: {
    info: {
      default: ""
    }
  },
  methods: {
    openInfo() {
      this.modal.visible = true;
    },
    closeInfo() {
      this.modal.visible = false;
    }
  }
}
</script>
