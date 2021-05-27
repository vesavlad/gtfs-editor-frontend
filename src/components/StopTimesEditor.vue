<template>
  <div class="dynamic-map-container">
    <div class="top-map-bar">
      <div class="right-content grid center">
        <button class="btn btn-outline-secondary" @click="orderModal.visible = true">
          <span>Reorder using shape</span>
          <span class="material-icons">low_priority</span>
        </button>
        <button class="btn btn-outline-secondary" @click="openSpeedModal">
          <span>Calc times</span><span class="material-icons">restore</span>
        </button>
      </div>
    </div>
    <div id="map" class="map" ref="mapContainer">
    </div>
    <div class="map-sidebar">
      <div class="side-panel">
        <div class="side-header">
          <div class="grid center">
            <h4>Trip ID:</h4>
            <input v-model="trip.trip_id">
          </div>
          <div class="btn-list">
            <button class="btn icon flat" @click="saveAndExit"><span class="material-icons">check</span></button>
            <label>
              <span>Drag</span>
              <input type="checkbox" id="enable-drag" v-model="drag_enabled">
            </label>
            <label>
              <span class="material-icons">settings</span>
              <input type="checkbox" id="optional-fields" v-model="show_optional_fields">
            </label>
          </div>
        </div>
        <vuetable ref="table" :fields="fields" :api-mode="false" :data="stop_times" v-show="!drag_enabled">
            <div :key="index" v-for="(field, index) in getProperFields(fields, {exclusions})" :slot="field.name"
                 slot-scope="properties"
                 v-bind:class="{error: errors.stop_times && errors.stop_times[properties.rowIndex][properties.rowField.name]}">
              <GeneralizedInput :data="properties.rowData" :field="properties.rowField"
                                v-model="properties.rowData[getFieldID(properties.rowField)]">
              </GeneralizedInput>
              <div v-if="errors.stop_times">
            <span class="error" :key="error"
                  v-for="error in errors.stop_times[properties.rowIndex][properties.rowField.name]">
              {{ error }}
            </span>
              </div>
            </div>
          </vuetable>
        <DraggableTable :fields="base_fields" :rows="stop_times" v-show="drag_enabled" v-model="stop_times"
                        @input="$nextTick(calculateSeqs)"></DraggableTable>
      </div>
    </div>
    <MessageModal :show="orderModal.visible" @ok="automaticallyOrder" @cancel="orderModal.visible = false"
                  @close="orderModal.visible = false" :showCancelButton="true" :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>Are you sure you want to automatically order the stops?</h2>
      </template>
      <template v-slot:m-content>
        <span class="warning">
          The current Stop Sequence will be overwritten. The closest point of the Shape will be used to determine the
          position,
          however this may fail if there's no way to accurately determine where this is. For instance, if the Shape
          passes twice next to the same Stop.
        </span>
      </template>
    </MessageModal>
    <MessageModal :show="speedModal.visible" @ok="calculateTimes" @cancel="speedModal.visible = false"
                  @close="speedModal.visible = false" :showCancelButton="true" :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>Are you sure you want to replace the current times?</h2>
      </template>
      <template v-slot:m-content>
        <span class="warning">
          The current Arrival and Departure times will be replaced. The arrival time of the first stop will be used
          as a starting point and all other arrival/departure times will be recalculated based on that.
        </span>
        <br>
        <label for="automatic-time">Automatically calculate times using a speed of </label>
        <input v-model="speed" type="number">[km/h]
        Starting from stop
        <SimpleSelect :field="STSelectField" v-model="speedModal.from_stop">
        </SimpleSelect>
        to stop
        <SimpleSelect :field="STSelectField" v-model="speedModal.to_stop">
        </SimpleSelect>
      </template>
    </MessageModal>
  </div>
</template>


<script>
import tripsAPI from "@/api/trips.api";
import stopsAPI from "@/api/stops.api";
import shapesAPI from "@/api/shapes.api";
import fieldMixin from "@/mixins/fieldMixin.js";
import GeneralizedInput from "@/components/vuetable/inputs/GeneralizedInput.vue";
import SimpleSelect from "@/components/vuetable/inputs/SimpleSelect.vue";
import DraggableTable from "@/components/DraggableTable.vue";
import envelopeMixin from "@/mixins/envelopeMixin"
import config from "@/config.js"
import MessageModal from "@/components/modal/MessageModal";

let Vuetable = require('vuetable-2')

const mapboxgl = require('mapbox-gl');
mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;
let turf = require('@turf/turf');
let base_fields = [{
  title: "Seq",
  name: "stop_sequence",
},
  {
    title: "Stop ID",
    name: "stop_id",
  },
  {
    title: "Arrival Time",
    name: "arrival_time",
  },
  {
    title: "Departure Time",
    name: "departure_time",
  },
]

let optional_fields = [{
  title: "Stop Headsign",
  name: "stop_headsign",
}, {
  title: "Pickup Type",
  name: "pickup_type",
}, {
  title: "Drop-Off Type",
  name: "drop_off_type",
}, {
  title: "Continuous Pickup",
  name: "continuous_pickup",
}, {
  title: "Continuous Drop-Off",
  name: "continuous_dropoff",
}, {
  title: "Shape Distance Traveled",
  name: "shape_dist_traveled",
}, {
  title: "Timepoint",
  name: "timepoint",
}]

let full_fields = base_fields.concat(optional_fields);

export default {
  name: "StopTimesEditor",
  components: {
    MessageModal,
    Vuetable: Vuetable.Vuetable,
    GeneralizedInput,
    DraggableTable,
    SimpleSelect,
  },
  mixins: [
    envelopeMixin,
    fieldMixin,
  ],
  data: function () {
    return {
      STSelectField: {
        name: "stop",
        type: "select-simple",
        options: {},
      },
      speed: 60,
      errors: {},
      drag_enabled: false,
      exclusions: ['actions', 'stop_sequence', 'stop_id', 'distance'],
      base_fields: base_fields,
      fields: base_fields,
      show_optional_fields: false,
      stop_times: this.trip.stop_times,
      stops: [],
      stop_map: new Map(),
      shape: false,
      turfShape: false,
      orderModal: {
        visible: false,
      },
      speedModal: {
        visible: false,
        from_stop: null,
        to_stop: null,
      },
      info: [
        "Click on a Stop to add it to the sequence",
        "Right click on a Stop to remove it from the sequence",
      ]
    };
  },
  props: {
    project: {
      required: true,
    },
    trip: {
      required: true,
    },
    mode: {
      required: true,
    },
  },
  watch: {
    show_optional_fields(val) {
      this.fields = val ? full_fields : base_fields;
    },
  },
  mounted() {
    this.$nextTick(() => {
      stopsAPI.stopsAPI.getAll(this.project).then((response) => {
        this.stops = response.data;
        this.stops.forEach(stop => this.stop_map.set(stop.id, stop));
        let map = new mapboxgl.Map({
          container: this.$refs.mapContainer,
          style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
        });
        this.map = map;
        map.on('load', () => {
          this.addSources();
          this.$emit('load');
          this.envelope(this.map, this.project);
        });
      });
    });
  },
  methods: {
    openSpeedModal() {
      this.speedModal.from_stop = this.stop_times[0].stop_sequence;
      this.speedModal.to_stop = this.stop_times[this.stop_times.length - 1].stop_sequence;
      this.speedModal.visible = true;
      this.STSelectField.options = {};
      this.stop_times.forEach((st) => {
        let title = `${st.stop_id} (${st.stop_sequence})`
        this.STSelectField.options[title] = st.stop_sequence;
      })
    },
    log() {
      console.log(...arguments)
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
      seconds = Math.floor(seconds);
      let pad = (s) => s.length < 2 ? "0" + s : s;
      let hours = (seconds / 3600 | 0).toString()
      seconds = seconds % 3600
      let minutes = (seconds / 60 | 0).toString()
      seconds = (seconds % 60).toString()

      hours = pad(hours);
      minutes = pad(minutes);
      seconds = pad(seconds);
      return `${hours}:${minutes}:${seconds}`;
    },
    addHeadway(time, headway) {
      return this.secondsToTime(this.timeToSeconds(time) + headway);
    },
    calculateTimes() {
      if (this.stop_times.length) {
        let speed = Number(this.speed);
        if (Number.isNaN(speed)) {
          return;
        }
        let first = this.stop_times[this.speedModal.from_stop - 1];
        console.log(first);
        if (!first.arrival_time) {
          return;
        }
        let headway = this.timeToSeconds(first.arrival_time);
        speed = speed * 1.0;
        this.stop_times = this.stop_times.map(st => {
          if (st.stop_sequence < this.speedModal.from_stop ||
              st.stop_sequence > this.speedModal.to_stop) {
            return st;
          }
          let seconds = (st.distance - first.distance) / speed * 3600;
          let formatted_time = this.secondsToTime(seconds + headway);
          if (st.stop_sequence > first.stop_sequence) {
            st.arrival_time = formatted_time;
          }
          st.departure_time = formatted_time;
          return st;
        })
      }
      this.speedModal.visible = false;
    },
    addSources() {
      this.addStops();
      this.addShape();
    },
    addStops() {
      let geojson = {
        type: 'FeatureCollection',
        features: []
      };
      geojson.features = this.generateStopFeatures();
      this.map.addSource('stops', {
        'type': 'geojson',
        'data': geojson,
      });
      this.map.addLayer({
        id: "layer-stops-icon",
        type: "circle",
        source: "stops",
        paint: {
          "circle-radius": [
            'interpolate',
            ['linear'],
            ['zoom'],
          ].concat(config.stoptimes_stop_zoom),
          "circle-color": [
            'case',
            ['get', 'selected'],
            config.stop_selected_color,
            config.stop_color //default
          ]
        }
      });
      this.map.addLayer({
        id: "layer-stops-label",
        type: "symbol",
        source: "stops",
        minzoom: 14,
        layout: {
          "text-field": "{label}",
          "text-anchor": "top",
          "text-offset": [0, 0.5],
          "text-allow-overlap": true,
        }
      });
      this.map.addLayer({
        id: "layer-stops-seq",
        type: "symbol",
        source: "stops",
        filter: ['get', 'selected'],
        minzoom: 14,
        layout: {
          "text-field": "Seq: {sequence}",
          "text-anchor": "top",
          "text-offset": [0, -0.5],
          "text-allow-overlap": true,
        }
      });
      this.map.addLayer({
        id: "layer-stops-time",
        type: "symbol",
        source: "stops",
        filter: ['get', 'arrival_time'],
        minzoom: 14,
        layout: {
          "text-field": "{arrival_time}",
          "text-anchor": "top",
          "text-offset": [0, 1.5],
          "text-allow-overlap": true,
        }
      });
      this.map.on('click', 'layer-stops-icon', evt => {
        let feature = evt.features[0];
        if (feature.properties.selected) {
          return;
        }
        evt.preventDefault();
        let stop = this.stop_map.get(feature.properties.id);
        let st = {
          trip: this.trip.id,
          trip_id: this.trip.trip_id,
          stop: stop.id,
          stop_id: stop.stop_id,
          stop_sequence: null,
          arrival_time: null,
          departure_time: null,
          stop_headsign: null,
          pickup_type: null,
          drop_off_type: null,
          continuous_pickup: null,
          continuous_dropoff: null,
          shape_dist_traveled: null,
          timepoint: null
        }
        st.distance = this.calculatePosition(st);
        this.stop_times.push(st);
        this.updateStops();
      });

      this.map.on('contextmenu', 'layer-stops-icon', evt => {
        let feature = evt.features[0];
        if (!feature.properties.selected) {
          return;
        }
        evt.preventDefault();
        let stop = this.stop_map.get(feature.properties.id);
        this.stop_times = this.stop_times.filter(st => st.stop !== stop.id);
        this.updateStops();
      });
    },
    automaticallyOrder() {
      this.stop_times.sort((st1, st2) => st1.distance - st2.distance);
      this.orderModal.visible = false;
      this.updateStops();
    },
    updateStops() {
      this.calculateSTPositions();
      let geojson = {
        type: 'FeatureCollection',
        features: this.generateStopFeatures(),
      };
      this.map.getSource('stops').setData(geojson);
    },
    generateStopFeatures() {
      let st_map = new Map();
      this.stop_times.forEach(st => st_map.set(st.stop, st))
      return this.stops.map(stop => {
        let st = st_map.get(stop.id);
        let props = {
          selected: false,
          sequence: undefined,
          arrival_time: undefined,
          departure_time: undefined,
        }
        if (st) {
          props = {
            selected: true,
            sequence: st.stop_sequence,
            arrival_time: st.arrival_time,
            departure_time: st.departure_time,
          }
        }
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              stop.stop_lon,
              stop.stop_lat,
            ]
          },
          properties: {
            id: stop.id,
            label: stop.stop_id + (stop.stop_code ? ` (${stop.stop_code})` : ""),
            ...props,
          }
        }
      });
    },
    addShape() {
      let geojson = {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': []
        }
      }
      this.map.addSource('shape', {
        'type': 'geojson',
        'data': geojson,
      });
      this.map.addLayer({
        'id': 'shape-layer',
        'type': 'line',
        'source': 'shape',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': config.shape_line_color,
          'line-width': 3
        }
      });
      let img = require('../assets/img/arrow-small.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('arrow', image);
        this.map.addLayer({
          'id': 'arrowId',
          'type': 'symbol',
          'source': 'shape',
          'layout': {
            'symbol-placement': 'line',
            'symbol-spacing': 100,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-image': 'arrow',
            'icon-size': 1,
            'visibility': 'visible'
          }
        });
      });
      if (this.trip.shape) {
        shapesAPI.shapesAPI.detail(this.project, this.trip.shape).then(response => {
          this.shape = response.data;
          let points = this.shape.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
          this.turfShape = turf.lineString(points);
          geojson.geometry.coordinates = points;
          this.map.getSource('shape').setData(geojson);
          this.calculateSTPositions();
        }).catch(err => console.log(err));
      } else {
        window.alert("Warning: editing a StopTimes without a shape is not supported");
      }
    },
    calculateSeqs() {
      let stop_times = this.stop_times;
      for (let i = 0; i < stop_times.length; i++) {
        stop_times[i].stop_sequence = i + 1;
      }
      this.stop_times = stop_times;
    },
    calculateSTPositions() {
      let stop_times = this.stop_times.map(st => {
        return {
          ...st,
          distance: this.calculatePosition(st),
        }
      });
      this.stop_times = stop_times;
      this.calculateSeqs();
    },
    calculatePosition(st) {
      let stop = this.stop_map.get(st.stop);
      let point = turf.point([stop.stop_lon, stop.stop_lat]);
      let nearest = turf.nearestPointOnLine(this.turfShape, point);
      return nearest.properties.location.toFixed(3);
    },
    saveAndExit() {
      let data = {
        ...this.trip,
        stop_times: this.stop_times,
      }
      let save = undefined;
      switch (this.mode) {
        case 'edit':
          save = tripsAPI.tripsAPI.update.bind(tripsAPI.tripsAPI);
          break;
        case 'duplicate':
          save = tripsAPI.tripsAPI.create.bind(tripsAPI.tripsAPI);
          break;
      }
      save(this.project, data).then(() => {
        this.$emit('close');
      }).catch(err => {
        this.errors = err.response.data;
        console.log(this.errors);
      })
    }
  }
};
</script>
