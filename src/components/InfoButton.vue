<template>
  <div>
    <button class="btn icon" @click="openInfo" alt="Commands">
      <span class="material-icons">info</span>
    </button>
    <Modal v-show="modal.visible" @close="closeInfo" @cancel="closeInfo" :showCancelButton="false">
      <template slot="title" @ok="closeInfo">
        <h2>Usage Info</h2>
      </template>
      <template slot="content">
        <div v-for="piece in processed_info" v-bind:key="piece">
          <span class="info">{{piece}}</span>
          <br>
        </div>
      </template>
      <template slot="close-button-name">Close</template>
    </Modal>
  </div>

</template>


<script>
  import Modal from "@/components/Modal.vue";

  export default {
    name: 'InfoButton',
    components: {
      Modal,
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
