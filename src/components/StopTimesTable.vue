<template>
  <div class="map-sidebar">
    <form class="form-inline d-flex mx-1 justify-content-end search" @submit.stop.prevent="doSearch">
      <div class="input-group">
        <input v-model="quickSearch" type="search" placeholder="Quick search" v-on:input="doSearch">
      </div>
    </form>
    <div>
      <Vuetable ref="vuetable" :fields="fields" :api-url="url" data-path="results" pagination-path="pagination"
                @vuetable:pagination-data="onPaginationData" :query-params="makeQueryParams" :transform="transformData">
        <div slot="actions" slot-scope="props" class="flex">
          <button class="btn icon" @click="$emit('delete-st', props.rowData)" alt="Delete stop-times.">
            <span class="material-icons">delete</span>
          </button>
          <button class="btn icon" @click="$emit('edit-st', props.rowData)" alt="Edit stop-times.">
            <span class="material-icons">edit</span>
          </button>
          <button class="btn icon" @click="$emit('focus-st', props.rowData)" alt="Display stop_times.">
            <span class="material-icons">remove_red_eye</span>
          </button>
        </div>
      </Vuetable>
    </div>
    <VuetablePagination ref="pagination" @vuetable-pagination:change-page="onChangePage">
    </VuetablePagination>
    <VuetablePaginationDropDown ref="paginationDropDown" @vuetable-pagination:change-page="onChangePage">
    </VuetablePaginationDropDown>
  </div>

</template>


<script>
import $ from 'jquery';
import 'select2';
import VuetablePagination from "@/components/vuetable/VueTablePagination.vue";
import tripsAPI from "@/api/trips.api";
import {debounce} from "debounce";

let Vuetable = require('vuetable-2')

export default {
  name: "StopTimesTable",
  components: {
    Vuetable: Vuetable.Vuetable,
    VuetablePagination,
    VuetablePaginationDropDown: Vuetable.VuetablePaginationDropDown,
  },
  data: function () {
    return {
      quickSearch: "",
      doSearch: false,
      fields: [
        "actions",
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
          formatter: shape => shape ? "Yes" : "No",
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
        this.$nextTick(() => {
          $(".vuetable-pagination-dropdown").val(this.current_page).trigger('change');
        });
      }
    },
    onChangePage(page) {
      if (page == this.current_page) {
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
    this.$nextTick(() => {
      $("select.vuetable-pagination-dropdown").select2({
        matcher(query, option) {
          if (query.term) {
            return String(option.id).startsWith(query.term) ? option : null;
          }
          return option;
        }
      }).on('change', (evt) => this.$refs.pagination.loadPage(evt.target.value));
    });
  },
};
</script>



