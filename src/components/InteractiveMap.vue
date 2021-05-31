<template>
  <div class="dynamic-map-container">
    <div class="top-map-bar">
      <div class="right-content grid center">
        <input type="search" placeholder="Search"/>
        <FKSelect v-model="selectedShape" :field="shapeField" :data="{}" :errors="[]"
                  v-on:input="loadShape($event)"></FKSelect>
        <button class="btn flat white"><span>How to use</span><i class="material-icons">help_outline</i></button>
      </div>
    </div>
    <div id='map' class="map">
      <button v-if="!creation.creating" class="btn floating" alt="Create Stop" @click="beginCreation">
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
          <div ref="popup" v-show="popup.open">
            <stop-form ref="popupContent" :fields="stopFields" v-model="popup.stop" :errors="popup.errors">
            </stop-form>
            <button class="btn icon" alt="Delete" @click="saveStopData">
              <span class="material-icons">save</span>
            </button>
            <button class="btn icon" alt="Delete" @click="beginStopDeletion">
              <span class="material-icons">delete</span>
            </button>
          </div>
          <div v-if="creation.creating">
            <stop-form v-if="creation.creating" ref="createForm" :fields="stopFields" :errors="creation.errors"
                       v-model="creation.data">
            </stop-form>
            <button class="btn icon" alt="Create" @click="create">
              <span class="material-icons">add_location</span>
            </button>
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
      selectedShape: null,
      active_stops: [],
      stops: [],
      deleteModal: {
        visible: false,
        stop: {},
        message: "",
      },
      popup: {
        stop: {},
        open: false,
        errors: {},
        disableClose: false,
      },
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
      activeShape: {},
      map: false,
      dragging: false,
      geojson: {},
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
      },
      shapeGeojson: {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': []
        }
      },
      info: [
        "Drag a Stop to update its coordinates",
        "Click on a Stop to edit its data",
        "Click outside the popup to open it",
      ],
    }
  },
  props: {
    project: {
      required: true,
    },
    stopFields: {
      type: Array,
    },
  },
  mounted() {
    this.$nextTick(() => {
      stopsAPI.stopsAPI.getAll(this.project).then((response) => {
        this.stops = response.data;
        let map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
          center: [this.stops[0].stop_lon, this.stops[0].stop_lat], // starting position [lng, lat]
          zoom: 16 // starting zoom
        });
        this.map = map;
        map.on('load', () => {
          this.envelope(map, this.project);
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
    loadShape(event) {
      if (this.activeShape.id !== event) {
        this.activeShape = {
          id: event
        }
        shapesAPI.shapesAPI.detail(this.project, this.activeShape.id).then(response => {
          this.activeShape = response.data;
          this.reGenerateShape();
        })
      }
    },
    reGenerateShape() {
      this.shapeGeojson.geometry.coordinates = this.activeShape.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
      this.map.getSource('shape').setData(this.shapeGeojson);
      this.map.fitBounds(this.getBounds(this.shapeGeojson.geometry.coordinates), {
        padding: 50
      });
    },
    beginStopDeletion() {
      let stop = this.popup.stop;
      this.deleteModal.visible = true;
      this.deleteModal.stop = stop;
      this.deleteModal.message = "";
    },
    deleteStop() {
      let stop = this.deleteModal.stop;
      stopsAPI.stopsAPI.remove(this.project, stop).then(() => {
        this.deleteModal.visible = false;
        this.deleteModal.stop = {};
        this.deleteModal.message = "";
        this.popup.disableClose = true;
        this.popup.popup.remove();
        this.popup.disableClose = false;
        this.stops = this.stops.filter(s => s.id !== stop.id);
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
        self.creation.creating = true;
        self.updateCreationCoords(e.lngLat);
      });
    },
    create() {
      let data = this.creation.data;
      stopsAPI.stopsAPI.create(this.project, data).then(() => {
        this.addStop(data);
        this.creation.errors = {};
        this.creation.creating = false;
        this.creation.data = {
          stop_lat: null,
          stop_lon: null,
        };
        this.creation.geojson.features = [];
        this.map.getSource('creating').setData(this.creation.geojson);
      }).catch((err) => {
        console.log(err.response);
        this.creation.errors = err.response.data;
      });
    },
    focusStop(stop_data) {
      this.map.flyTo({
        center: [stop_data.stop_lon, stop_data.stop_lat],
        zoom: 16,
      });
    },
    resize() {
      this.map.resize();
    },
    updateStopData(stop) {
      this.stops = this.stops.map(s => {
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
      this.stops.push(data);
      this.reGenerateStops();
    },
    saveStopData() {
      if (this.popup.disableClose) return;
      stopsAPI.stopsAPI.update(this.project, this.popup.stop).then(response => {
        console.log(response);
        this.active_stops.forEach(feature => {
          this.map.setFeatureState({
            source: 'stops',
            id: feature.id,
          }, {
            active: false
          });
        });
        this.stops = this.stops.map(stop => {
          if (this.popup.stop.id === stop.id) {
            return {
              ...this.popup.stop
            };
          } else {
            return stop;
          }
        });
        this.reGenerateStops()
      });
    },
    generateStopGeoJson(stop) {
      let label = stop.stop_id + (stop.stop_code ? ` (${stop.stop_code})` : '');
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
          stop_id: stop.id,
          label: label,
        },
        id: stop.id,
      }
    },
    reGenerateStops() {
      this.geojson.features = this.stops.map(this.generateStopGeoJson);
      this.map.getSource('stops').setData(this.geojson);
    },
    addStops() {
      // We create the geojson and add it to the map
      this.geojson = {
        type: 'FeatureCollection',
        features: this.stops.map(this.generateStopGeoJson),
      };
      this.map.addSource('stops', {
        type: 'geojson',
        data: this.geojson,
      });

      // We add an icon and text to the geojson
      this.map.addLayer({
        id: "layer-stops-icon",
        type: "circle",
        source: "stops",
        paint: {
          "circle-radius": ['interpolate', ['linear'], ['zoom'],].concat(config.stop_zoom),
          "circle-color": "white",
          "circle-stroke-color": [
            'case',
            ['boolean', ['feature-state', 'active'], false],
            config.stop_selected_color,
            ['boolean', ['feature-state', 'hover'], false],
            config.stop_hover_color,
            config.stop_color,
          ],
          "circle-stroke-opacity": 1,
          "circle-stroke-width": 2
        }
      });
      this.map.addLayer({
        id: "layer-stops-label",
        type: "symbol",
        source: "stops",
        minzoom: 16,
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
        data: this.creation.geojson,
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
        'data': this.shapeGeojson,
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
          'id': 'arrowId',
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
      this.creation.data.stop_lon = coords.lng;
      this.creation.data.stop_lat = coords.lat;
      this.creation.geojson.features = [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat],
        },
      }];
      this.map.getSource('creating').setData(this.creation.geojson);
    },
    findStop(id) {
      let s = null;
      this.stops.forEach(stop => {
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
        this.popup.stop = this.findStop(id);
        map.setFeatureState({
          source: 'stops',
          id: feature.id,
        }, {
          active: true
        });
        this.active_stops.push(feature);
        this.popup.open = true;
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
          map.setFeatureState({
            source: 'stops',
            id: feature.id,
          }, {
            hover: false
          });
        });
        hovered_stops = [];
        [e.features[0]].forEach(feature => {
          hovered_stops.push(feature);
          map.setFeatureState({
            source: 'stops',
            id: feature.id,
          }, {
            hover: true
          });
        });
      });
      this.map.on('mouseleave', 'layer-stops-icon', function () {
        hovered_stops.forEach(feature => {
          hovered_stops.push(feature.id);
          map.setFeatureState({
            source: 'stops',
            id: feature.id,
          }, {
            hover: false
          });
        });
        hovered_stops = [];
        if (this.dragging) return;
        canvas.style.cursor = '';
      });
      map.on('mousedown', 'layer-stops-icon', function (evt_down) {
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

      map.on('mousedown', 'layer-creating-icon', function (evt_down) {
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
      this.stops = this.stops.map(s => {
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
