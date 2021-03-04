<template>
  <BaseModal v-on="$listeners">
    <template slot="m-content">
      <div class="m-header">
        <h2>{{ $t('projectDashboard.gtfsBuilder.validationReport.title') }}</h2>
        <div class="grid">
          <a class="btn icon flat" target="_blank" href="https://gtfs.mobilitydata.org/spec/gtfs-schedule"><i
              class="material-icons">info</i></a>
          <button class="btn icon flat" @click="$emit('close')"><i class="material-icons">close</i></button>
        </div>
      </div>
      <ul class="report-list m-content">
        <li class="report-collapse collapsed" v-for="(file, index) in formattedMessage" :key="index">
          <button class="report-header" @click="setVisibility(file)">
            <div>
              <i class="material-icons">description</i>
              <h3>{{ file.filename }}</h3>
              <div class="grid min">
                <pillBase v-if="file.errorNumber>0" pillClass="error" :pillText="file.errorNumber"></pillBase>
                <pillBase v-if="file.warningNumber>0" pillClass="warning" :pillText="file.warningNumber"></pillBase>
              </div>
            </div>
            <div class="icon flat">
              <i class="material-icons">keyboard_arrow_down</i>
            </div>
          </button>
          <transition name="collapse" v-on:before-enter="beforeEnter" v-on:enter="enter" v-on:before-leave="beforeLeave"
                      v-on:leave="leave">
            <div class="report-body" v-if="activeRow===file.filename && showDetail">
              <div class="report-content">
                <ul class="report-box errors" v-if="file.errorNumber>0">
                  <li v-for="(row, index) in file.errors" :key="index">
                    <h4>{{ row.title }}</h4>
                    <span>Code: {{ row.code }}, Entity ID: {{ row.entityId }}</span>
                    <p>{{ row.description }}</p>
                  </li>
                </ul>
                <ul class="report-box warnings" v-if="file.warningNumber>0">
                  <li v-for="(row, index) in file.warnings" :key="index">
                    <h4>{{ row.title }}</h4>
                    <span>Code: {{ row.code }}, Entity ID: {{ row.entityId }}</span>
                    <p>{{ row.description }}</p>
                  </li>
                </ul>
              </div>
            </div>
          </transition>
        </li>
      </ul>
      <div class="m-footer">
        <div class="option-buttons">
          <button class="btn" @click="downloadCSVData">
            <span>{{ $t('projectDashboard.gtfsBuilder.validationReport.downloadCSV') }}</span>
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from "@/components/BaseModal";
import PillBase from "@/components/PillBase";
import FileSaver from 'file-saver';

export default {
  name: 'ValidatorReportModal',
  components: {
    BaseModal,
    PillBase
  },
  props: {
    message: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      activeRow: null,
      showDetail: true
    }
  },
  computed: {
    formattedMessage() {
      let rows = this.message.split('\n').map(row => row.split(','));
      rows.shift();
      rows.pop();
      return rows.reduce((accumulator, row, index) => {
        let filename = row[0];
        let code = row[1];
        let level = row[2];
        let entityId = row[3];
        let title = row[4];
        let description = row[5];

        if (index === 0) {
          this.activeRow = filename;
          this.showDetail = true;
        }

        if (!accumulator[filename]) {
          accumulator[filename] = {
            filename: filename,
            errorNumber: 0,
            warningNumber: 0,
            errors: [],
            warnings: []
          };
        }

        let data = {
          title,
          description,
          code,
          entityId
        }
        if (level === 'ERROR') {
          accumulator[filename].errorNumber += 1;
          accumulator[filename].errors.push(data);
        } else if (level === 'WARNING') {
          accumulator[filename].warningNumber += 1;
          accumulator[filename].warnings.push(data);
        }

        return accumulator;
      }, {});
    }
  },
  methods: {
    setVisibility(file) {
      if (this.activeRow !== file.filename) {
        this.activeRow = file.filename;
        this.showDetail = true;
      } else {
        this.showDetail = !this.showDetail;
      }
    },
    downloadCSVData() {
      let data = this.message;
      let blob = new Blob([data], {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(blob, "validation-data.csv");
    },
    beforeEnter: function (el) {
      el.style.height = '0';
    },
    enter: function (el) {
      el.style.height = el.scrollHeight + 'px';
    },
    beforeLeave: function (el) {
      el.style.height = el.scrollHeight + 'px';
    },
    leave: function (el) {
      el.style.height = '0';
    }
  }
}
</script>