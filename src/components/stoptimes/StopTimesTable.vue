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
                       :tripId="props.rowData.trip_id"
                       @edit="editShape()"
                       @duplicate-expedition="editShape()"
                       @duplicate-expedition-using-headway="editShape()"
                       @delete="$emit('delete-st', props.rowData)"
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
  </div>
</template>


<script>
import VuetablePaginationDropDown from '@/components/vuetable/VuetablePaginationDropDown.vue';
import VuetablePagination from "@/components/vuetable/VueTablePagination.vue";
import tripsAPI from "@/api/trips.api";
import {debounce} from "debounce";
import StopTimesMenu from "@/components/stoptimes/StopTimesMenu";

let Vuetable = require('vuetable-2')

export default {
  name: "StopTimesTable",
  components: {
    Vuetable: Vuetable.Vuetable,
    VuetablePagination,
    VuetablePaginationDropDown,
    StopTimesMenu
  },
  data: function () {
    return {
      quickSearch: "",
      doSearch: false,
      showMenu: false,
      activeTrip: null,
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
      url: tripsAPI.tripsAPI.getFullBaseURL(this.project),
    };
  },
  props: {
    project: {
      required: true,
    }
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
    refresh() {
      this.$refs.vuetable.refresh();
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
    }
  },
  mounted() {
    this.doSearch = debounce(this.refresh, 300);
  },
};
</script>
