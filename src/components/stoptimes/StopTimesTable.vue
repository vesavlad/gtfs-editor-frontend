<template>
  <div class="map-sidebar">
    <div class="side-table-header">
      <form class="form-inline d-flex mx-1 justify-content-end search" @submit.stop.prevent="doSearch">
        <div class="input-group">
          <input v-model="quickSearch" type="search" :placeholder="$t('vuetable.quickSearch')" v-on:input="doSearch">
        </div>
      </form>
      <button class="btn icon flat"><i class="material-icons">visibility</i></button>
    </div>
    <div class="table-content">
      <Vuetable ref="vuetable" :fields="fields" :api-url="url" data-path="results" pagination-path="pagination"
                @vuetable:pagination-data="onPaginationData" :query-params="makeQueryParams" :transform="transformData"
                :row-class="getRowClass">
        <div slot="actions" slot-scope="props" class="grid min center">
          <button class="btn icon btn-focus" @click="tripWithFocus=props.rowData;$emit('focus-st', props.rowData)"
                  alt="Display stop_times.">
            <span class="material-icons">my_location</span>
          </button>
          <button v-if="props.rowData.stop_times.length===0" class="btn flat icon"
                  @click="activeTrip=props.rowData;editStopTimes()" alt="edit stop times">
            <span class="material-icons">add_circle</span>
          </button>
          <div v-else class="btn icon flat">
            <i class="material-icons" @click="showMenu=!showMenu;activeTrip=props.rowData">more_vert</i>
            <StopTimesMenu v-if="showMenu && activeTrip.id===props.rowData.id"
                           @edit="editStopTimes"
                           @duplicate-trip="showDuplicationModal"
                           @delete="beginDeleteST(props.rowData)"
                           @close="showMenu=false">
            </StopTimesMenu>
          </div>
        </div>
      </Vuetable>
    </div>
    <div class="table-footer">
      <VuetablePagination ref="pagination" @vuetable-pagination:change-page="onChangePage">
      </VuetablePagination>
      <VuetablePaginationDropDown ref="paginationDropDown" @vuetable-pagination:change-page="onChangePage">
      </VuetablePaginationDropDown>
    </div>
    <MessageModal :show="deleteModal.visible" @ok="deleteST" @cancel="deleteModal.visible = false"
                  @close="deleteModal.visible = false" :showCancelButton="true" :okButtonLabel="$t('general.delete')"
                  :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title><h2>showMenu: {{ showMenu }}</h2>
        <h2>{{ $t('stopTimes.deleteModalTitle', {tripId: deleteModal.trip.trip_id}) }}</h2>
      </template>
      <template v-slot:m-content>
        <span>{{ deleteModal.message }}</span>
      </template>
    </MessageModal>
    <MessageModal :show="duplicationModal.visible" @ok="duplicateStopTimes" @close="duplicationModal.visible = false"
                  @cancel="duplicationModal.visible = false"
                  :okButtonLabel="$t('stopTimes.menu.duplicationModal.duplicate')">
      <template v-slot:m-title>
        {{ $t('stopTimes.menu.duplicationModal.title', {tripId: activeTrip.trip_id}) }}
      </template>
      <template v-slot:m-content>
        <div class="stoptime-copy">
          <div class="flex v-center">
            <span>{{ $t('stopTimes.menu.duplicationModal.createCopyOf', {tripId: activeTrip.trip_id}) }}</span>
            <input v-model="duplicationModal.headway" type="number"
                   v-tooltip="{ theme: 'error-tooltip', content: duplicationModal.headwayFormatError, shown: !!duplicationModal.headwayFormatError }"
                   @focus="duplicationModal.headwayFormatError=null">
            <span>{{ $t('stopTimes.menu.duplicationModal.seconds') }}</span>
          </div>
          <div class="flex v-center">
            <span>{{ $t('stopTimes.menu.duplicationModal.withTripId') }}</span>
            <input type="text" v-model="duplicationModal.newTripId"
                   v-tooltip="{ theme: 'error-tooltip', content: duplicationModal.tripIdFormatError, shown: !!duplicationModal.tripIdFormatError }"
                   v-autowidth="{minWidth: '60px'}"
                   @focus="duplicationModal.tripIdFormatError=null">
          </div>
        </div>
      </template>
    </MessageModal>
  </div>
</template>


<script>
import VuetablePaginationDropDown from '@/components/vuetable/VuetablePaginationDropDown.vue';
import VuetablePagination from '@/components/vuetable/VueTablePagination.vue';
import tripsAPI from '@/api/trips.api';
import {debounce} from 'debounce';
import StopTimesMenu from '@/components/stoptimes/StopTimesMenu';
import MessageModal from '@/components/modal/MessageModal';

let Vuetable = require('vuetable-2')

export default {
  name: 'StopTimesTable',
  components: {
    Vuetable: Vuetable.Vuetable,
    VuetablePagination,
    VuetablePaginationDropDown,
    StopTimesMenu,
    MessageModal,
  },
  props: {
    projectId: {
      required: true,
    }
  },
  data: function () {
    return {
      quickSearch: '',
      doSearch: false,
      showMenu: false,
      tripWithFocus: {},
      activeTrip: {},
      deleteModal: {
        visible: false,
        trip: null,
        message: ''
      },
      duplicationModal: {
        visible: false,
        headway: 0,
        newTripId: null,
        headwayFormatError: null,
        tripIdFormatError: null
      },
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
        {
          name: 'trip_id',
          title: 'Trip ID',
        },
        {
          name: 'direction_id',
          title: 'Direction ID',
        },
        {
          name: 'stop_count',
          title: 'Stops',
        },
        {
          name: 'start_time',
          title: 'Start Time',
          formatter: start_time => start_time ? start_time : this.$t('stopTimes.table.emptyStopTimes')
        },
        {
          name: 'end_time',
          title: 'End Time',
          formatter: end_time => end_time ? end_time : this.$t('stopTimes.table.emptyStopTimes')
        },
        {
          name: 'shape',
          title: 'Has Shape',
          formatter: shape => shape ? '<span class="material-icons">check</span>' : '<span class="material-icons">close</span>',
        },
      ],
      url: tripsAPI.tripsAPI.getFullBaseURL(this.projectId),
    };
  },
  methods: {
    showDuplicationModal() {
      this.duplicationModal.visible = true;
      this.duplicationModal.newTripId = `${this.$t('stopTimes.menu.duplicationModal.prefixForNewTrip')} ${this.activeTrip.trip_id}`;
    },
    getRowClass(rowData) {
      if (rowData.id === this.tripWithFocus.id) {
        return 'focus';
      }
      return '';
    },
    onPaginationData(paginationData) {
      if (paginationData.current_page !== this.current_page || paginationData.last_page !== this.last_page) {
        this.current_page = paginationData.current_page;
        this.last_page = paginationData.last_page;
        this.$refs.pagination.setPaginationData(paginationData);
        this.$refs.paginationDropDown.setPaginationData(paginationData);
      }
    },
    onChangePage(page) {
      if (page === this.current_page) {
        return;
      }
      this.$refs.vuetable.changePage(page);
    },
    makeQueryParams(sortOrder, currentPage, perPage) {
      let sorting = ''
      if (sortOrder.length > 0) {
        sorting = sortOrder[0].sortField + '|' + sortOrder[0].direction;
      }
      return {
        sort: sorting,
        page: currentPage,
        per_page: perPage,
        search: this.quickSearch,
      }
    },
    refresh() {
      this.$refs.vuetable.refresh();
    },
    transformData(data) {
      data.results.map(trip => {
        trip.stop_count = trip.stop_times.length;
        if (trip.stop_count) {
          trip.start_time = trip.stop_times[0].arrival_time;
          trip.end_time = trip.stop_times[trip.stop_times.length - 1].departure_time;
        } else {
          trip.start_time = null;
          trip.end_time = null;
        }
      })
      return data;
    },
    beginDeleteST(trip) {
      this.deleteModal.message = '';
      this.deleteModal.visible = true;
      this.deleteModal.trip = trip;
    },
    deleteST() {
      let data = {
        id: this.deleteModal.trip.id,
        stop_times: [],
      }
      tripsAPI.tripsAPI.update(this.$route.params.projectId, data).then(() => {
        this.deleteModal.trip = null;
        this.deleteModal.visible = false;
        this.deleteModal.message = '';
        this.refresh();
      }).catch(err => {
        console.log(err.response);
        this.deleteModal.message = err.response.data.message;
        this.deleteModal.visible = true;
      })
    },
    editStopTimes() {
      this.$router.push({
        name: 'editStopTimes',
        params: {
          projectId: this.$route.params.projectId,
          tripId: this.activeTrip.id
        }
      });
    },
    timeToSeconds(timeString) {
      let times = timeString.split(":").map(t => parseInt(t));
      let seconds = 0;
      for (let i = 0; i < times.length; i++) {
        seconds *= 60;
        seconds += times[i];
      }
      return seconds;
    },
    secondsToTime(seconds) {
      return new Date(null, null, null, null, null, seconds).toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0];
    },
    addHeadway(time, headway) {
      return this.secondsToTime(this.timeToSeconds(time) + headway);
    },
    duplicateStopTimes() {
      let headway = Number(this.duplicationModal.headway);
      if (this.duplicationModal.headway === '' || Number.isNaN(headway) || headway === 0) {
        this.duplicationModal.headwayFormatError = this.$t('stopTimes.menu.duplicationModal.headwayFormatError');
      } else if (!this.duplicationModal.newTripId) {
        this.duplicationModal.tripIdFormatError = this.$t('stopTimes.menu.duplicationModal.tripIdFormatError');
      } else {
        let newTrip = {
          ...this.activeTrip,
          trip_id: this.duplicationModal.newTripId
        }
        delete newTrip.id;
        newTrip.stop_times.forEach(st => {
          if (st.arrival_time) {
            st.arrival_time = this.addHeadway(st.arrival_time, headway);
          }
          if (st.departure_time) {
            st.departure_time = this.addHeadway(st.departure_time, headway);
          }
          delete st.id;
        });
        tripsAPI.tripsAPI.create(this.$route.params.projectId, newTrip).then(response => {
          this.duplicationModal.visible = false;
          let newTripData = response.data;
          this.$router.push({
            name: 'editStopTimes',
            params: {
              projectId: this.$route.params.projectId,
              tripId: newTripData.id
            }
          });
        }).catch(err => {
          console.log(err.response);
          this.duplicationModal.tripIdFormatError = this.$t('stopTimes.menu.duplicationModal.tripIdDuplicated');
        });
      }
    }
  },
  mounted() {
    this.doSearch = debounce(this.refresh, 300);
  }
};
</script>
