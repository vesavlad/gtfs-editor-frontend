<template>
  <div class="dynamic-map-container">
    <div class="top-map-bar">
      <div class="right-content grid center">
        <input type="search" placeholder="Search" v-model="stopData.quickSearch" @input="filterStops"/>
        <FKSelect v-model="shape.selectedShape" :field="shape.shapeField" :data="{}" :errors="[]"
                  v-on:input="loadShape($event)"></FKSelect>
        <button class="btn flat white"><span>How to use</span><i class="material-icons">help_outline</i></button>
      </div>
    </div>
    <div id='map' class="map">
      <button v-if="!stopData.creation.creating" class="btn floating" alt="Create Stop" @click="beginCreation">
        <span class="material-icons">add</span>
      </button>
    </div>
    <div class="map-sidebar">
      <div class="side-panel empty">
        <div class="side-header">
          <div></div>
          <div class="btn-list">
            <button class="btn flat close"><i class="material-icons">close</i></button>
          </div>
        </div>
        <div class="side-content">
          <div>
            <div class="empty img">
              <i class="material-icons">add_location_alt</i>
            </div>
            <ol>
              <li><span>Click the bottom right button to add a new stop</span></li>
              <li><span>Click on the map to place it</span></li>
            </ol>
          </div>
          <div v-if="edition.stop" v-show="edition.open">
            <button class="btn icon" alt="Delete" @click="saveStopData">
              <span class="material-icons">save</span>
            </button>
            <button class="btn icon" alt="Delete" @click="beginStopDeletion">
              <span class="material-icons">delete</span>
            </button>
            <stop-form :fields="stopFields" v-model="edition.stop" :errors="edition.errors">
            </stop-form>
          </div>
          <div v-if="stopData.creation.creating">
            <button class="btn icon" alt="Create" @click="create">
              <span class="material-icons">add_location</span>
            </button>
            <stop-form v-if="stopData.creation.creating" ref="createForm" :fields="stopFields"
                       :errors="stopData.creation.errors"
                       v-model="stopData.creation.data">
            </stop-form>
          </div>
        </div>
      </div>
    </div>
    <MessageModal :show="deleteModal.visible" @ok="deleteStop" @cancel="deleteModal.visible = false"
                  @close="deleteModal.visible = false" :showCancelButton="true" :okButtonLabel="$t('general.delete')"
                  :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>Are you sure you want to delete this stop?</h2>
      </template>
      <template v-slot:m-content>
          <span>
            {{ deleteModal.message }}
          </span>
      </template>
    </MessageModal>
  </div>
</template>

<script>
import stopsAPI from '@/api/stops.api';
import shapesAPI from '@/api/shapes.api';
import shapeMapMixin from "@/mixins/shapeMapMixin"
import StopForm from '@/components/StopForm.vue';
import FKSelect from '@/components/vuetable/inputs/FKSelect.vue';
import envelopeMixin from "@/mixins/envelopeMixin"
import config from "@/config.js"
import Enums from "@/utils/enums";
import MessageModal from "@/components/modal/MessageModal";
import {debounce} from "debounce";


const mapboxgl = require('mapbox-gl');
mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;

export default {
  name: 'InteractiveMap',
  components: {
    MessageModal,
    StopForm,
    FKSelect,
  },
  mixins: [
    envelopeMixin,
    shapeMapMixin,
  ],
  data() {
    return {
      shape: {
        selectedShape: null,
        activeShape: null,
        shapeField: {
          name: 'shape_id',
          title: 'Shape',
          sortField: 'shape',
          foreignKey: true,
          nullable: true,
          id_field: 'shape',
          ajax_params: {
            url: shapesAPI.shapesAPI.getFullBaseURL(this.$route.params.projectId),
          },
          type: Enums.InputType.FK_SELECT
        },
        geojson: {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        },
      },
      stopData: {
        quickSearch: null,
        activeStops: [],
        stops: [],
        creation: {
          creating: false,
          data: {
            stop_lat: null,
            stop_lon: null,
          },
          errors: {},
          geojson: {
            type: 'FeatureCollection',
            features: [] // We use feature collection to allow either 0 or 1
          }
        }
      },
      deleteModal: {
        visible: false,
        stop: {},
        message: "",
      },
      edition: {
        stop: null,
        open: false,
        errors: {},
        disableClose: false,
      },
      map: null,
      dragging: false,
    }
  },
  props: {
    projectId: {
      required: true,
    },
    stopFields: {
      type: Array,
    },
  },
  mounted() {
    this.filterStops = debounce(this.filterStops, 300);
    this.$nextTick(() => {
      stopsAPI.stopsAPI.getAll(this.projectId).then(response => {
        this.stopData.stops = response.data;
        this.map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/light-v10',
          zoom: 16
        });
        this.map.on('load', () => {
          this.envelope(this.map, this.projectId);
          this.addStops();
          this.addListeners();
          this.$emit('load');
        })
      }).catch((err) => {
        alert("Unable to fetch stops");
        console.log(err);
      });
    });
  },
  methods: {
    getStopGeojson() {
      console.log('generating stop points...');
      let generateStopGeoJson = stop => {
        let label = stop.stop_id + (stop.stop_code ? ` (${stop.stop_code})` : '');
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [stop.stop_lon, stop.stop_lat]
          },
          properties: {
            stop_id: stop.id,
            label: label,
          },
          id: stop.id,
        }
      };

      let geojson = {
        type: 'FeatureCollection',
        features: [] // We use feature collection to allow either 0 or 1
      };

      geojson.features = this.stopData.stops.map(generateStopGeoJson);

      return geojson;
    },
    filterStops() {
      let value = this.stopData.quickSearch;
      if (value.length < 4) {
        return;
      }
      let normalize = value => value !== null ? value.trim().toLowerCase() : '';

      value = normalize(value);
      let filtered = this.stopData.stops.filter(stop => {
        let stopCode = normalize(stop.stop_code);
        let stopId = normalize(stop.stop_id);
        let stopName = normalize(stop.stop_name);

        return stopCode.indexOf(value) > -1 || stopId.indexOf(value) > -1 || stopName.indexOf(value) > -1;
      });

      if (filtered.length > 0) {
        let points = filtered.map(stop => [stop.stop_lon, stop.stop_lat]);
        this.map.fitBounds(this.getBounds(points), {
          padding: 50
        });
      }
    },
    loadShape(shapeId) {
      if (shapeId === null) {
        this.shape.activeShape = null;
        this.map.setLayoutProperty('shape-layer', 'visibility', 'none')
        this.map.setLayoutProperty('shape-arrow-layer', 'visibility', 'none')
      } else if (this.shape.activeShape === null || this.shape.activeShape.id !== shapeId) {
        shapesAPI.shapesAPI.detail(this.projectId, shapeId).then(response => {
          this.shape.activeShape = response.data;
          this.reGenerateShape();
          this.map.setLayoutProperty('shape-layer', 'visibility', 'visible')
          this.map.setLayoutProperty('shape-arrow-layer', 'visibility', 'visible')
        })
      }
    },
    reGenerateShape() {
      this.shape.geojson.geometry.coordinates = this.shape.activeShape.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
      this.map.getSource('shape').setData(this.shape.geojson);
      this.map.fitBounds(this.getBounds(this.shape.geojson.geometry.coordinates), {
        padding: 50
      });
    },
    beginStopDeletion() {
      let stop = this.edition.stop;
      this.deleteModal.visible = true;
      this.deleteModal.stop = stop;
      this.deleteModal.message = "";
    },
    deleteStop() {
      let stop = this.deleteModal.stop;
      stopsAPI.stopsAPI.remove(this.projectId, stop).then(() => {
        this.deleteModal.visible = false;
        this.deleteModal.stop = {};
        this.deleteModal.message = "";
        this.edition.disableClose = true;
        this.edition.disableClose = false;
        this.stopData.stops = this.stopData.stops.filter(s => s.id !== stop.id);
        this.reGenerateStops();
        console.log("removed");
      }).catch((err) => {
        let data = err.response.data;
        this.deleteModal.message = data.message;
      });
    },
    beginCreation() {
      let self = this;
      this.map.once("click", e => {
        self.stopData.creation.creating = true;
        self.updateCreationCoords(e.lngLat);
      });
    },
    create() {
      let data = this.stopData.creation.data;
      stopsAPI.stopsAPI.create(this.projectId, data).then(() => {
        this.addStop(data);
        this.stopData.creation.errors = {};
        this.stopData.creation.creating = false;
        this.stopData.creation.data = {
          stop_lat: null,
          stop_lon: null,
        };
        this.stopData.creation.geojson.features = [];
        this.map.getSource('creating').setData(this.stopData.creation.geojson);
      }).catch((err) => {
        console.log(err.response);
        this.stopData.creation.errors = err.response.data;
      });
    },
    focusStop(stop) {
      this.map.flyTo({
        center: [stop.stop_lon, stop.stop_lat],
        zoom: 16,
      });
    },
    resize() {
      this.map.resize();
    },
    updateStopData(stop) {
      this.stopData.stops = this.stopData.stops.map(s => {
        if (s.id === stop.id) {
          return {
            ...stop
          };
        }
        return s;
      });
      this.reGenerateStops();
    },
    addStop(data) {
      this.stopData.stops.push(data);
      this.reGenerateStops();
    },
    saveStopData() {
      if (this.edition.disableClose) return;
      stopsAPI.stopsAPI.update(this.projectId, this.edition.stop).then(response => {
        console.log(response);
        this.stopData.activeStops.forEach(feature => {
          this.map.setFeatureState({source: 'stop-source', id: feature.id,}, {active: false});
        });
        this.stopData.stops = this.stopData.stops.map(stop => {
          if (this.edition.stop.id === stop.id) {
            return {
              ...this.edition.stop
            };
          } else {
            return stop;
          }
        });
        this.reGenerateStops()
      });
    },
    reGenerateStops() {
      this.map.getSource('stop-source').setData(this.getStopGeojson());
    },
    addStops() {
      this.map.addSource('stop-source', {
        type: 'geojson',
        data: this.getStopGeojson(),
      });

      // We add an icon and text to the geojson
      this.map.addLayer({
        id: "layer-stops-icon",
        type: "circle",
        source: "stop-source",
        paint: {
          "circle-radius": ['interpolate', ['linear'], ['zoom'],].concat(config.stop_zoom),
          "circle-color": "white",
          "circle-stroke-color": [
            'case',
            ['boolean', ['feature-state', 'active'], false], config.stop_selected_color,
            ['boolean', ['feature-state', 'hover'], false], config.stop_hover_color,
            config.stop_color,
          ],
          "circle-stroke-opacity": 1,
          "circle-stroke-width": 2
        }
      });
      this.map.addLayer({
        id: "layer-stops-label",
        type: "symbol",
        source: "stop-source",
        minzoom: 14,
        layout: {
          "text-field": "{label}",
          "text-anchor": "top",
          "text-offset": [0, 0.5],
          "text-allow-overlap": true,
        }
      });

      // Icon for new stop
      this.map.addSource('creating', {
        type: 'geojson',
        data: this.stopData.creation.geojson,
      })
      this.map.addLayer({
        id: "layer-creating-icon",
        type: "circle",
        source: "creating",
        paint: {
          "circle-radius": ['interpolate', ['linear'], ['zoom'],].concat(config.stop_creation_zoom),
          "circle-color": config.stop_creation_color,
        }
      });

      this.map.addSource('shape', {
        'type': 'geojson',
        'data': this.shape.geojson,
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
          'line-width': 2
        }
      });
      let img = require('../assets/img/double-arrow.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('double-arrow', image);
        this.map.addLayer({
          'id': 'shape-arrow-layer',
          'type': 'symbol',
          'source': 'shape',
          'layout': {
            'symbol-placement': 'line',
            'symbol-spacing': 100,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-image': 'double-arrow',
            'icon-size': 0.4,
            'visibility': 'visible'
          },
          paint: {
            'icon-color': 'red',
            'icon-halo-color': "#343332",
            'icon-halo-width': 2,
          }
        });
      });
    },
    updateCreationCoords(coords) {
      this.stopData.creation.data.stop_lon = coords.lng;
      this.stopData.creation.data.stop_lat = coords.lat;
      this.stopData.creation.geojson.features = [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat],
        },
      }];
      this.map.getSource('creating').setData(this.stopData.creation.geojson);
    },
    findStop(id) {
      let s = null;
      this.stopData.stops.forEach(stop => {
        if (stop.id === id) {
          s = stop;
        }
      })
      return s;
    },
    addListeners() {
      let map = this.map;
      let canvas = map.getCanvas();
      let self = this;

      this.map.on('click', 'layer-stops-icon', (evt) => {
        let coordinates = evt.features[0].geometry.coordinates.slice();
        let feature = evt.features[0];
        let id = feature.properties.stop_id;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(evt.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += evt.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        if (this.edition.stop) {
          // deactivate previous stop selected
          this.map.setFeatureState({source: 'stop-source', id: this.edition.stop.id,}, {active: false});
        }
        this.edition.stop = this.findStop(id);
        map.setFeatureState({source: 'stop-source', id: feature.id,}, {active: true});
        this.stopData.activeStops.push(feature);
        this.edition.open = true;
      });

      let hovered_stops = [];
      this.map.on('mouseenter', 'layer-stops-icon', function () {
        if (this.dragging) return;
        canvas.style.cursor = 'pointer';
      });

      this.map.on('mousemove', 'layer-stops-icon', function (e) {
        if (this.dragging) return;
        hovered_stops.forEach(feature => {
          hovered_stops.push(feature.id);
          map.setFeatureState({source: 'stop-source', id: feature.id,}, {hover: false});
        });
        hovered_stops = [];
        [e.features[0]].forEach(feature => {
          hovered_stops.push(feature);
          map.setFeatureState({source: 'stop-source', id: feature.id,}, {hover: true});
        });
      });

      this.map.on('mouseleave', 'layer-stops-icon', function () {
        hovered_stops.forEach(feature => {
          hovered_stops.push(feature.id);
          map.setFeatureState({source: 'stop-source', id: feature.id,}, {hover: false});
        });
        hovered_stops = [];
        if (this.dragging) return;
        canvas.style.cursor = '';
      });

      this.map.on('mousedown', 'layer-stops-icon', function (evt_down) {
        // Prevent the default map drag behavior.
        evt_down.preventDefault();
        canvas.style.cursor = 'grab';
        let activeStop = evt_down.features[0]
        this.dragging = true;
        map.once('mouseup', evt_up => {
          this.dragging = false;
          let coords = evt_up.lngLat;
          let distance = self.calcDistance(evt_down, evt_up);
          if (!distance) {
            return;
          }
          self.updateStop(activeStop, coords);
          canvas.style.cursor = '';
        });
      });

      this.map.on('mousedown', 'layer-creating-icon', function (evt_down) {
        // Prevent the default map drag behavior.
        evt_down.preventDefault();
        canvas.style.cursor = 'grab';
        map.once('mouseup', evt_up => {
          let coords = evt_up.lngLat;
          self.updateCreationCoords(coords);
          canvas.style.cursor = '';
        });
      });
    },
    // Distance in pixels between events
    calcDistance(e1, e2) {
      e1 = e1.point;
      e2 = e2.point;
      let xdif = e1.x - e2.x;
      let ydif = e2.y - e2.y;
      return Math.sqrt(xdif * xdif + ydif * ydif)
    },
    updateStop(stop, coords) {
      this.stopData.stops = this.stopData.stops.map(s => {
        if (s.id !== stop.properties.stop_id) {
          return s;
        }
        s.stop_lon = coords.lng;
        s.stop_lat = coords.lat;
        return s;
      });
      this.reGenerateStops();
    },
  },
}
</script>
