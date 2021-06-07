<template>
  <div class="map-sidebar">
    <div class="side-table-header">
      <form class="form-inline d-flex mx-1 justify-content-end search" @submit.stop.prevent="doSearch">
        <div class="input-group">
          <input v-model="quickSearch" type="search" :placeholder="$t('vuetable.quickSearch')" v-on:input="doSearch">
        </div>
      </form>
      <div class="icon-link">
        <button class="btn icon flat"><i class="material-icons">visibility</i></button>
      </div>
    </div>
    <div class="table-content">
      <Vuetable ref="vuetable" :fields="fields" :api-url="url" data-path="results" pagination-path="pagination"
                @vuetable:pagination-data="onPaginationData" :query-params="makeQueryParams" :transform="transformData">
        <div slot="actions" slot-scope="props" class="flex">
          <button class="btn flat icon" @click="$emit('focus-st', props.rowData)" alt="Display stop_times.">
            <span class="material-icons">remove_red_eye</span>
          </button>
          <div class="btn icon flat">
            <i class="material-icons"
               @click="showMenu=!showMenu;activeTrip=props.rowData">more_vert</i>
            <StopTimesMenu v-if="showMenu && activeTrip.id===props.rowData.id"
                           @edit="editStopTimes"
                           @duplicate-trip="duplicateStopTimes"
                           @copy-trip-using-headway="copyStopTimesUsingHeadway"
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
      <template v-slot:m-title>
        <h2>{{ $t('stopTimes.deleteModalTitle', {tripId: deleteModal.trip.trip_id}) }}</h2>
      </template>
      <template v-slot:m-content>
        <span>{{ deleteModal.message }}</span>
      </template>
    </MessageModal>
  </div>
</template>


<script>
import VuetablePaginationDropDown from '@/components/vuetable/VuetablePaginationDropDown.vue';
import VuetablePagination from "@/components/vuetable/VueTablePagination.vue";
import tripsAPI from "@/api/trips.api";
import {debounce} from "debounce";
import StopTimesMenu from "@/components/stoptimes/StopTimesMenu";
import MessageModal from "@/components/modal/MessageModal";

let Vuetable = require('vuetable-2')

export default {
  name: "StopTimesTable",
  components: {
    Vuetable: Vuetable.Vuetable,
    VuetablePagination,
    VuetablePaginationDropDown,
    StopTimesMenu,
    MessageModal
  },
  props: {
    projectId: {
      required: true,
    }
  },
  data: function () {
    return {
      quickSearch: "",
      doSearch: false,
      showMenu: false,
      activeTrip: null,
      deleteModal: {
        visible: false,
        trip: null,
        message: ''
      },
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
        {
          name: "trip_id",
          title: "Trip ID",
        },
        {
          name: "stop_count",
          title: "Stops",
        },
        {
          name: "start_time",
          title: "Start Time"
        },
        {
          name: "end_time",
          title: "End Time"
        },
        {
          name: "shape",
          title: "Has Shape",
          formatter: shape => shape ? '<span class="material-icons">check</span>' : '<span class="material-icons">close</span>',
        },
      ],
      url: tripsAPI.tripsAPI.getFullBaseURL(this.projectId),
    };
  },
  methods: {
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
      let sorting = ""
      if (sortOrder.length > 0) {
        sorting = sortOrder[0].sortField + "|" + sortOrder[0].direction;
      }
      return {
        sort: sorting,
        page: currentPage,
        per_page: perPage,
        search: this.quickSearch,
      }
    },
    transformData(data) {
      data.results.map(trip => {
        trip.stop_count = trip.stop_times.length;
        if (trip.stop_count) {
          trip.start_time = trip.stop_times[0].arrival_time;
          trip.end_time = trip.stop_times[trip.stop_times.length - 1].departure_time;
        }
      })
      return data;
    },
    beginDeleteST(trip) {
      this.deleteModal.message = "";
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
        this.$refs.vuetable.refresh();
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
          tripId: this.activeTrip.id,
          mode: this.Enums.StopTimesEditorMode.EDIT,
          trip: this.activeTrip
        }
      });
    },
    duplicateStopTimes() {
      this.$router.push({
        name: 'editStopTimes',
        params: {
          projectId: this.$route.params.projectId,
          tripId: this.activeTrip.id,
          mode: this.Enums.StopTimesEditorMode.DUPLICATE,
          trip: this.activeTrip
        }
      });
    },
    copyStopTimesUsingHeadway() {
      this.$router.push({
        name: 'editStopTimes',
        params: {
          projectId: this.$route.params.projectId,
          tripId: this.activeTrip.id,
          mode: this.Enums.StopTimesEditorMode.COPY_USING_HEADWAY,
          trip: this.activeTrip
        }
      });
    }
  },
  mounted() {
    this.doSearch = debounce(this.refresh, 300);
  }
};
</script>
