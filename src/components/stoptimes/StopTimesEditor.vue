<template>
  <div class="dynamic-map-container">
    <div class="top-map-bar">
      <div class="right-content grid center">
        <button class="btn btn-outline-secondary" @click="orderModal.visible=true"
                :disabled="this.localTrip.stop_times.length===0">
          <span>{{ $t('stopTimes.editor.reorderStopsUsingShape') }}</span>
          <span class="material-icons">low_priority</span>
        </button>
        <button class="btn btn-outline-secondary" @click="openSpeedModal"
                :disabled="this.localTrip.stop_times.length===0">
          <span>{{ $t('stopTimes.editor.calculateTimes') }}</span><span class="material-icons">restore</span>
        </button>
      </div>
    </div>
    <div id="map" class="map" ref="mapContainer">
    </div>
    <div class="map-sidebar">
      <div class="side-panel" :class="{changed: dataChanged}">
        <div class="side-header">
          <label class="grid center">
            <h4>Trip ID:</h4>
            <input type="text" v-model="localTrip.trip_id">
          </label>
          <div class="btn-list">
            <button class="btn icon flat" @click="saveStopTimes"><span class="material-icons">check</span></button>
            <button class="btn icon flat" @click="dataChanged?closeWarning.visible=true:exit()">
              <span class="material-icons">close</span>
            </button>
            <label class="checkbox">
              <input type="checkbox" id="enable-drag" v-model="dragEnabled">
              <div class="btn icon flat" :data-info="$t('stopTimes.editor.enableCustomSortTable')"><span
                  class="material-icons">open_with</span></div>
            </label>
            <label class="checkbox">
              <input type="checkbox" id="optional-fields" v-model="vuetable.showOptionalFields"
                     @change="setOptionalFieldsVisibility">
              <div class="btn icon flat" :data-info="$t('stopTimes.editor.hintToShowExtraColumns')"><span
                  class="material-icons">settings</span></div>
            </label>
          </div>
        </div>
        <div class="table-content">
          <vuetable v-if="!dragEnabled" ref="vuetable" :fields="vuetable.fields" :api-mode="false"
                    :data="localTrip.stop_times" :row-class="getRowClass">
            <div slot="actions" slot-scope="props" class="flex">
              <button class="btn flat icon" @click="setActiveRow(props.rowData)" alt="Display stop_times.">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn flat icon" @click="flyToStop(props.rowData)" alt="move to stop.">
                <span class="material-icons">my_location</span>
              </button>
            </div>
            <template v-for="(field, index) in getProperFields(vuetable.fields, {exclusions: vuetable.exclusions})"
                      :slot="field.name" slot-scope="props">
              <GeneralizedInput :readonly="vuetable.activeRow.stop!==props.rowData.stop" :key="index"
                                v-model="props.rowData[getFieldID(props.rowField)]"
                                :data="props.rowData"
                                :field="props.rowField"
                                :errors="errors.stop_times?errors.stop_times[props.rowIndex]:{}">
              </GeneralizedInput>
            </template>
          </vuetable>
          <DraggableTable v-else :fields="vuetable.baseFields" :rows="localTrip.stop_times"
                          v-model="localTrip.stop_times" @input="$nextTick(calculateSequenceNumber)"></DraggableTable>
        </div>
        <div class="table-footer">

        </div>
      </div>
    </div>
    <MessageModal :show="orderModal.visible" @ok="automaticallyOrder" @cancel="orderModal.visible = false"
                  @close="orderModal.visible = false" :showCancelButton="true" :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>{{ $t('stopTimes.editor.orderStopsByDistance.title') }}</h2>
      </template>
      <template v-slot:m-content>
        <span class="warning">
          {{ $t('stopTimes.editor.orderStopsByDistance.body') }}
        </span>
      </template>
    </MessageModal>
    <MessageModal :show="speedModal.visible" @ok="calculateTimes" @cancel="speedModal.visible = false"
                  @close="speedModal.visible = false" :showCancelButton="true" :type="Enums.MessageModalType.WARNING"
                  :okButtonLabel="$t('stopTimes.editor.calculateStopTimesBasedOnSpeed.okButtonLabel')">
      <template v-slot:m-title>
        <h2>{{ $t('stopTimes.editor.calculateStopTimesBasedOnSpeed.title') }}</h2>
      </template>
      <template v-slot:m-content>
        <span class="warning">{{ $t('stopTimes.editor.calculateStopTimesBasedOnSpeed.warningMessage') }}</span>
        <br>
        <label>{{ $t('stopTimes.editor.calculateStopTimesBasedOnSpeed.firstParagraph') }}</label>
        <input v-model="speedModal.speed"
               v-tooltip="{ theme: 'error-tooltip', content: speedModal.speedFormatError, shown: !!speedModal.speedFormatError }"
               @focus="speedModal.speedFormatError=null">
        {{ $t('stopTimes.editor.calculateStopTimesBasedOnSpeed.secondParagraph') }}
        <SimpleSelect :field="speedModal.selectField" v-model="speedModal.fromStop" :errors="[]">
        </SimpleSelect>
        {{ $t('stopTimes.editor.calculateStopTimesBasedOnSpeed.thirdParagraph') }}
        <SimpleSelect :field="speedModal.selectField" v-model="speedModal.toStop" :errors="[]">
        </SimpleSelect>
      </template>
    </MessageModal>
    <MessageModal :show="closeWarning.visible" @ok="exit" @cancel="closeWarning.visible = false"
                  @close="closeWarning.visible = false" :showCancelButton="true" :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>{{ $t('stopTimes.editor.closeWarning.title') }}</h2>
      </template>
      <template v-slot:m-content>
        <p>{{ $t('stopTimes.editor.closeWarning.body') }}</p>
      </template>
    </MessageModal>
  </div>
</template>


<script>
import tripsAPI from '@/api/trips.api';
import stopsAPI from '@/api/stops.api';
import shapesAPI from '@/api/shapes.api';
import fieldMixin from '@/mixins/fieldMixin.js';
import GeneralizedInput from '@/components/vuetable/inputs/GeneralizedInput.vue';
import SimpleSelect from '@/components/vuetable/inputs/SimpleSelect.vue';
import DraggableTable from '@/components/DraggableTable.vue';
import envelopeMixin from '@/mixins/envelopeMixin';
import config from '@/config';
import MessageModal from '@/components/modal/MessageModal';
import _ from 'lodash';
import Enums from '@/utils/enums';

let Vuetable = require('vuetable-2')

const mapboxgl = require('mapbox-gl');
mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;
let turf = require('@turf/turf');


export default {
  name: 'StopTimesEditor',
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
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    trip: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localTrip: _.cloneDeep(this.trip),
      unchangedTrip: _.cloneDeep(this.trip),
      dataChanged: false,
      errors: {},
      dragEnabled: false,
      vuetable: {
        baseFields: [
          {title: this.$i18n.t('vuetable.actions'), name: 'actions', type: null},
          {title: 'Seq', name: 'stop_sequence'},
          {title: 'Stop ID', name: 'stop_id'},
          {title: 'Shape Distance Traveled', name: 'shape_dist_traveled', type: Enums.InputType.NUMBER},
          {title: 'Arrival Time', name: 'arrival_time'},
          {title: 'Departure Time', name: 'departure_time'}
        ],
        optionalFields: [
          {title: 'Stop Headsign', name: 'stop_headsign'},
          {title: 'Pickup Type', name: 'pickup_type'},
          {title: 'Drop-Off Type', name: 'drop_off_type'},
          {title: 'Continuous Pickup', name: 'continuous_pickup'},
          {title: 'Continuous Drop-Off', name: 'continuous_dropoff'},
          {title: 'Timepoint', name: 'timepoint'}
        ],
        fields: [],
        fullFields: [],
        exclusions: ['actions', 'stop_sequence', 'stop_id'],
        activeRow: {},
        showOptionalFields: false,
      },
      stop: {
        sourceName: 'stop-source',
        stops: [],
        stopMap: new Map(),
      },
      shape: {
        sourceName: 'shape-source',
        turfShape: false
      },
      orderModal: {
        visible: false,
      },
      speedModal: {
        visible: false,
        fromStop: null,
        toStop: null,
        selectField: {
          name: 'stop',
          type: 'select-simple',
          options: {},
        },
        speed: 60,
        speedFormatError: null
      },
      closeWarning: {
        visible: false
      }
    };
  },
  watch: {
    trip() {
      this.localTrip = _.cloneDeep(this.trip);
      this.unchangedTrip = _.cloneDeep(this.trip);
    },
    localTrip: {
      handler() {
        this.dataChanged = !_.isEqual(this.unchangedTrip, this.localTrip);
      },
      deep: true
    }
  },
  mounted() {
    this.vuetable.fields = this.vuetable.baseFields;
    this.vuetable.fullFields = this.vuetable.baseFields.concat(this.vuetable.optionalFields);
    this.$nextTick(() => {
      stopsAPI.stopsAPI.getAll(this.projectId).then((response) => {
        this.stop.stops = response.data;
        this.stop.stops.forEach(stop => this.stop.stopMap.set(stop.id, stop));
        this.map = new mapboxgl.Map({
          container: this.$refs.mapContainer,
          style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
        });
        this.map.on('load', () => {
          this.addStopsLayers();
          this.addShapeLayers();
          this.$emit('load');
          this.envelope(this.map, this.projectId);
        });
      });
    });
  },
  methods: {
    getRowClass(rowData) {
      if (rowData.stop === this.vuetable.activeRow.stop) {
        return 'changed';
      }
      return '';
    },
    setOptionalFieldsVisibility() {
      this.vuetable.fields = this.vuetable.showOptionalFields ? this.vuetable.fullFields : this.vuetable.baseFields;
    },
    setActiveRow(rowData) {
      if (this.vuetable.activeRow.stop) {
        this.map.setFeatureState({source: this.stop.sourceName, id: this.vuetable.activeRow.stop}, {focus: false});
      }
      this.vuetable.activeRow = rowData;
      if (rowData.stop) {
        this.map.setFeatureState({source: this.stop.sourceName, id: rowData.stop}, {focus: true});
      }
    },
    addStopsLayers() {
      let minZoom = 14;
      let geojson = {
        type: 'FeatureCollection',
        features: this.generateStopFeatures()
      };

      this.map.addSource(this.stop.sourceName, {
        'type': 'geojson',
        'data': geojson,
      });

      this.map.addLayer({
        id: 'layer-stops-icon',
        type: 'circle',
        source: this.stop.sourceName,
        layout: {
          'visibility': 'visible'
        },
        paint: {
          'circle-radius':
              ['interpolate', ['linear'], ['zoom'],].concat(config.stoptimes_stop_zoom),
          'circle-color': [
            'case',
            ['get', 'selected'], '#21b0cf',
            ['boolean', ['feature-state', 'hover'], false], "#21b0cf",
            '#39505d'
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['get', 'selected'], false], "#21b0cf",
            ['boolean', ['feature-state', 'hover'], false], "#21b0cf",
            "white"
          ],
          'circle-stroke-opacity': 1,
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'focus'], false], 10,
            ['boolean', ['get', 'selected'], false], 5,
            ['boolean', ['feature-state', 'hover'], false], 2,
            1
          ],
        }
      });
      let img = require('../../assets/img/bg-stop-name.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('bg-stop-name', image, {sdf: true});
        this.map.addLayer({
          id: 'layer-stops-label',
          type: 'symbol',
          source: this.stop.sourceName,
          minzoom: minZoom,
          layout: {
            'text-field': '{label}',
            'text-font': ['Roboto Medium', 'Arial Unicode MS Regular'],
            'icon-image': 'bg-stop-name',
            'icon-anchor': 'bottom',
            'text-anchor': 'top',
            'text-offset': [0, 1.3],
            'text-size': 14,
            'icon-text-fit': 'both',
            'icon-text-fit-padding': [4, 6, 0, 6],
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': config.stop_label_color,
            'icon-color': [
              'case',
              ['boolean', ['feature-state', 'focus'], false], config.stop_label_background_hover_color,
              config.stop_label_background_color,
            ],
          }
        });
      });
      this.map.addLayer({
        id: 'layer-stops-seq',
        type: 'symbol',
        source: this.stop.sourceName,
        filter: ['get', 'selected'],
        minzoom: minZoom,
        layout: {
          'text-field': '{sequence}',
          'text-size': 14,
          'text-font': ['Roboto Medium', 'Arial Unicode MS Regular'],
          'text-anchor': 'top',
          'text-offset': [-0.03, -0.4],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': config.stop_label_color,
        }
      });
      this.map.addLayer({
        id: 'layer-stops-time',
        type: 'symbol',
        source: this.stop.sourceName,
        filter: ['get', 'arrival_time'],
        minzoom: minZoom,
        layout: {
          'text-field': '{arrival_time}',
          'text-anchor': 'top',
          'text-offset': [0, 1.5],
          'text-allow-overlap': true,
        }
      });
      this.map.on('click', 'layer-stops-icon', e => {
        e.preventDefault();
        let feature = e.features[0];

        let stopHasFocus = this.map.getFeatureState({
          source: this.stop.sourceName,
          id: feature.id
        }).focus;

        if (stopHasFocus) {
          this.localTrip.stop_times = this.localTrip.stop_times.filter(st => st.stop !== feature.id);
          this.setActiveRow({});
          this.calculateSequenceNumber()
          this.updateStops();
        } else if (feature.properties.selected) {
          let stopTime = this.localTrip.stop_times.filter(st => st.stop === feature.id)[0];
          this.setActiveRow(stopTime);
        } else {
          let stop = this.stop.stopMap.get(feature.properties.id);
          let stopTime = {
            trip: this.localTrip.id,
            trip_id: this.localTrip.trip_id,
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
          };
          stopTime.shape_dist_traveled = this.calculateShapeDistanceTraveled(stopTime);
          stopTime.stop_sequence = this.localTrip.stop_times.length + 1;
          this.localTrip.stop_times.push(stopTime);
          this.setActiveRow(stopTime);
          this.calculateSequenceNumber();
          this.updateStops();
        }
      });

      let canvas = this.map.getCanvas();
      let map = this.map;
      let hoveredStops = {};
      this.map.on('mouseenter', 'layer-stops-icon', e => {
        canvas.style.cursor = 'pointer';
        let feature = e.features[0];
        hoveredStops[feature.id] = feature;
        map.setFeatureState({source: this.stop.sourceName, id: feature.id}, {hover: true});
      });
      this.map.on('mouseleave', 'layer-stops-icon', () => {
        canvas.style.cursor = '';
        Object.keys(hoveredStops).forEach(featureId => {
          map.setFeatureState({source: this.stop.sourceName, id: featureId}, {hover: false});
        });
        hoveredStops = {};
      });
    },
    addShapeLayers() {
      let geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
      this.map.addSource(this.shape.sourceName, {
        type: 'geojson',
        data: geojson,
      });
      this.map.addLayer({
        id: 'shape-layer',
        type: 'line',
        source: this.shape.sourceName,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': config.shape_line_color,
          'line-width': 2
        }
      }, 'layer-stops-icon');
      let img = require('../../assets/img/double-arrow.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('double-arrow', image, {sdf: true});
        this.map.addLayer({
          id: 'shape-arrow-layer',
          type: 'symbol',
          source: this.shape.sourceName,
          layout: {
            'symbol-placement': 'line',
            'symbol-spacing': 100,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-image': 'double-arrow',
            'icon-size': 0.4,
            'visibility': 'visible',
          },
          paint: {
            'icon-color': config.shape_line_color,
            'icon-halo-color': '#fff',
            'icon-halo-width': 2
          }
        }, 'layer-stops-icon');
      });
      if (this.localTrip && this.localTrip.shape) {
        shapesAPI.shapesAPI.detail(this.projectId, this.localTrip.shape).then(response => {
          let points = response.data.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
          this.shape.turfShape = turf.lineString(points);
          geojson.geometry.coordinates = points;
          this.map.getSource(this.shape.sourceName).setData(geojson);
        }).catch(err => console.log(err));
      } else {
        window.alert('Warning: editing a StopTimes without a shape is not supported');
      }
    },
    openSpeedModal() {
      this.speedModal.fromStop = this.localTrip.stop_times[0].stop_sequence;
      this.speedModal.toStop = this.localTrip.stop_times[this.localTrip.stop_times.length - 1].stop_sequence;
      this.speedModal.visible = true;
      this.speedModal.selectField.options = [];
      this.localTrip.stop_times.forEach((st) => {
        let title = `${st.stop_id} (${st.stop_sequence})`;
        this.speedModal.selectField.options.push({name: title, value: st.stop_sequence});
      })
    },
    calculateTimes() {
      if (this.localTrip.stop_times.length) {
        let speed = Number(this.speedModal.speed);
        if (this.speedModal.speed === '' || Number.isNaN(speed) || speed === 0) {
          this.speedModal.speedFormatError = this.$t('stopTimes.editor.calculateStopTimesBasedOnSpeed.speedFormatError');
          return;
        }
        let first = this.localTrip.stop_times[this.speedModal.fromStop - 1];
        if (!first.arrival_time) {
          return;
        }
        let headway = this.timeToSeconds(first.arrival_time);
        this.localTrip.stop_times.forEach(st => {
          if (st.stop_sequence < this.speedModal.fromStop || this.speedModal.toStop < st.stop_sequence) {
            return st;
          }
          let seconds = (parseFloat(st.shape_dist_traveled) - parseFloat(first.shape_dist_traveled)) / speed * 3600;
          let formatted_time = this.secondsToTime(seconds + headway);
          if (st.stop_sequence > first.stop_sequence) {
            st.arrival_time = formatted_time;
          }
          st.departure_time = formatted_time;
          return st;
        });
      }
      this.speedModal.visible = false;
    },
    timeToSeconds(timeString) {
      let times = timeString.split(':').map(t => parseInt(t));
      let seconds = 0;
      for (let i = 0; i < times.length; i++) {
        seconds *= 60;
        seconds += times[i];
      }
      return seconds;
    },
    secondsToTime(seconds) {
      seconds = Math.floor(seconds);
      let pad = (s) => s.length < 2 ? '0' + s : s;
      let hours = (seconds / 3600 | 0).toString()
      seconds = seconds % 3600
      let minutes = (seconds / 60 | 0).toString()
      seconds = (seconds % 60).toString()

      hours = pad(hours);
      minutes = pad(minutes);
      seconds = pad(seconds);
      return `${hours}:${minutes}:${seconds}`;
    },
    automaticallyOrder() {
      this.localTrip.stop_times.sort((st1, st2) => parseFloat(st1.shape_dist_traveled) - parseFloat(st2.shape_dist_traveled));
      this.orderModal.visible = false;
      this.calculateSTPositions();
      this.updateStops();
    },
    updateStops() {
      let geojson = {
        type: 'FeatureCollection',
        features: this.generateStopFeatures(),
      };
      this.map.getSource(this.stop.sourceName).setData(geojson);
    },
    generateStopFeatures() {
      let st_map = new Map();
      this.localTrip.stop_times.forEach(st => st_map.set(st.stop, st))
      return this.stop.stops.map(stop => {
        let stopTime = st_map.get(stop.id);
        let props = {
          selected: false,
          sequence: undefined,
          arrival_time: undefined,
          departure_time: undefined,
        }
        if (stopTime) {
          props = {
            selected: true,
            sequence: stopTime.stop_sequence,
            arrival_time: stopTime.arrival_time,
            departure_time: stopTime.departure_time,
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
            label: stop.stop_id + (stop.stop_code ? ` (${stop.stop_code})` : ''),
            ...props,
          },
          id: stop.id,
        }
      });
    },
    calculateSequenceNumber() {
      this.localTrip.stop_times.forEach((el, index) => {
        el.stop_sequence = index + 1;
      });
    },
    calculateSTPositions() {
      this.localTrip.stop_times.forEach(st => {
        st.shape_dist_traveled = this.calculateShapeDistanceTraveled(st);
      });
      this.calculateSequenceNumber();
    },
    calculateShapeDistanceTraveled(st) {
      let stop = this.stop.stopMap.get(st.stop);
      let point = turf.point([stop.stop_lon, stop.stop_lat]);
      let nearest = turf.nearestPointOnLine(this.shape.turfShape, point);
      return nearest.properties.location.toFixed(3);
    },
    saveStopTimes() {
      let data = this.localTrip;
      tripsAPI.tripsAPI.update(this.projectId, data).then(() => {
        this.$toast.open({
          message: this.$t('stopTimes.editor.recordsSaved'),
          type: 'success',
          position: 'bottom',
          duration: 1000,
          pauseOnHover: false
        });
        this.unchangedTrip = _.cloneDeep(data);
        this.dataChanged = false;
      }).catch(err => {
        this.errors = err.response.data;
        console.log(this.errors);
      })
    },
    exit() {
      this.$router.push({name: "StopTimes", params: {projectId: this.$route.params.projectId}});
    },
    flyToStop(rowData) {
      // agregar clase focus a la tabla cuando se llame esta función
      let stop = this.stop.stopMap.get(rowData.stop);
      this.map.flyTo({
        center: [stop.stop_lon, stop.stop_lat],
        zoom: 16,
      });
    }
  }
};
</script>
