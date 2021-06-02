<template>
  <div class="dynamic-map-container">
    <div class="top-map-bar">
      <div class="right-content grid center">
        <input type="search" placeholder="Search" v-model="stop.quickSearch" @input="filterStops"/>
        <FKSelect v-model="shape.selectedShape" :field="shape.shapeField" :data="{}" :errors="[]"
                  v-on:input="loadShape($event)"></FKSelect>
        <button class="btn flat white"><span>{{ $t('general.howToUse') }}</span><i
            class="material-icons">help_outline</i></button>
      </div>
    </div>
    <div id='map' class="map">
      <button v-if="status===Enums.InteractiveMapStatus.READER" class="btn floating" alt="Create Stop"
              @click="beginCreation">
        <span class="material-icons">add</span>
      </button>
    </div>
    <div class="map-sidebar">
      <div class="side-panel empty" v-if="status===Enums.InteractiveMapStatus.READER">
        <div class="side-header">
          <div></div>
          <div class="btn-list">
          </div>
        </div>
        <div class="side-content">
          <div class="empty img">
            <i class="material-icons">add_location_alt</i>
          </div>
          <ol>
            <li><span>Click the bottom right button to add a new stop</span></li>
            <li><span>Click on the map to place it</span></li>
          </ol>
        </div>
      </div>
      <div class="side-panel edit-data-point" v-if="status===Enums.InteractiveMapStatus.EDIT_DATA_POINT">
        <div class="side-header">
          <div></div>
          <div class="btn-list">
            <button class="btn icon" alt="Delete" @click="saveStop"><span class="material-icons">save</span></button>
            <button class="btn icon" alt="Delete" @click="beginStopDeletion"><span class="material-icons">delete</span>
            </button>
            <button class="btn flat close"><i class="material-icons">close</i></button>
          </div>
        </div>
        <div class="side-content">
          <stop-form :fields="stopFields" v-model="stop.edition.stop" :errors="stop.edition.errors">
          </stop-form>
        </div>
      </div>
      <div class="side-panel adding-new-point" v-if="status===Enums.InteractiveMapStatus.ADDING_NEW_POINT">
        <div class="side-header">
          <div></div>
          <div class="btn-list">

          </div>
        </div>
        <div class="side-content">
          <h1>hello</h1>
        </div>
      </div>
      <div class="side-panel fill-new-data-point" v-if="status===Enums.InteractiveMapStatus.FILL_NEW_DATA_POINT">
        <div class="side-header">
          <div></div>
          <div class="btn-list">
            <button class="btn icon" alt="Create" @click="create"><span class="material-icons">add_location</span>
            </button>
          </div>
        </div>
        <div class="side-content">
          <stop-form ref="createForm" :fields="stopFields" :errors="stop.creation.errors"
                     v-model="stop.creation.data">
          </stop-form>
        </div>
      </div>
    </div>
    <MessageModal :show="stop.deleteModal.visible" @ok="deleteStop" @cancel="stop.deleteModal.visible = false"
                  @close="stop.deleteModal.visible = false" :showCancelButton="true"
                  :okButtonLabel="$t('general.delete')"
                  :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>Are you sure you want to delete this stop?</h2>
      </template>
      <template v-slot:m-content>
          <span>
            {{ stop.deleteModal.message }}
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
      stop: {
        quickSearch: null,
        activeStops: [],
        stops: [],
        creation: {
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
        deleteModal: {
          visible: false,
          stop: {},
          message: "",
        },
        edition: {
          stop: null,
          errors: {},
          disableClose: false,
        },
      },
      status: Enums.InteractiveMapStatus.READER,
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
    document.addEventListener('keydown', this.escapeKeyPressed);
    this.filterStops = debounce(this.filterStops, 300);
    this.$nextTick(() => {
      stopsAPI.stopsAPI.getAll(this.projectId).then(response => {
        this.stop.stops = response.data;
        this.map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/light-v10',
          zoom: 16
        });
        this.map.on('load', () => {
          this.envelope(this.map, this.projectId);
          this.addSourceAndLayersForStops();
          this.addSourceAndLayersForShape();
          this.addListeners();
          this.$emit('load');
        })
      }).catch((err) => {
        alert("Unable to fetch stops");
        console.log(err);
      });
    });
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.escapeKeyPressed);
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
        features: []
      };

      geojson.features = this.stop.stops.map(generateStopGeoJson);

      return geojson;
    },
    filterStops() {
      let value = this.stop.quickSearch;
      if (value.length < 4) {
        return;
      }
      let normalize = value => value !== null ? value.trim().toLowerCase() : '';

      value = normalize(value);
      let filtered = this.stop.stops.filter(stop => {
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
      let stop = this.stop.edition.stop;
      this.stop.deleteModal.visible = true;
      this.stop.deleteModal.stop = stop;
      this.stop.deleteModal.message = '';
    },
    deleteStop() {
      let stop = this.stop.deleteModal.stop;
      stopsAPI.stopsAPI.remove(this.projectId, stop).then(() => {
        this.stop.deleteModal.visible = false;
        this.stop.deleteModal.stop = null;
        this.stop.deleteModal.message = '';
        this.stop.edition.disableClose = false;
        this.stop.stops = this.stop.stops.filter(s => s.id !== stop.id);
        this.reGenerateStops();
        console.log(`stop ${stop.stop_id} removed`);
      }).catch((err) => {
        let data = err.response.data;
        this.stop.deleteModal.message = data.message;
      });
    },
    beginCreation() {
      this.status = this.Enums.InteractiveMapStatus.ADDING_NEW_POINT;
      this.map.getCanvas().style.cursor = 'grabbing';
      let self = this;

      // when user decides position he makes click on map
      this.map.once("click", e => {
        self.map.off('mousemove', this.mousemove);
        self.updateCreationCoords(e.lngLat);
        self.status = this.Enums.InteractiveMapStatus.FILL_NEW_DATA_POINT;
        self.map.getCanvas().style.cursor = '';
      });
      this.map.on('mousemove', this.mousemove);
    },
    mousemove(e) {
      // move feature to cursor position in realtime
      let coords = e.lngLat;
      this.updateCreationCoords(coords);
    },
    escapeKeyPressed(e) {
      if (e.keyCode === 27) {
        if (this.status === this.Enums.InteractiveMapStatus.ADDING_NEW_POINT ||
            this.status === this.Enums.InteractiveMapStatus.FILL_NEW_DATA_POINT) {
          this.status = this.Enums.InteractiveMapStatus.READER;
          this.map.getCanvas().style.cursor = '';
          this.map.off('mousemove', this.mousemove);
          this.stop.activeStops.forEach(feature => {
            this.map.setFeatureState({source: 'stop-source', id: feature.id,}, {active: false});
          });
          this.map.setLayoutProperty('layer-creating-icon', 'visibility', 'none')
        } else if (this.status === this.Enums.InteractiveMapStatus.EDIT_DATA_POINT) {
          this.status = this.Enums.InteractiveMapStatus.READER;
          this.stop.activeStops.forEach(feature => {
            this.map.setFeatureState({source: 'stop-source', id: feature.id,}, {active: false});
          });
        }
      }
    },
    create() {
      let data = this.stop.creation.data;
      stopsAPI.stopsAPI.create(this.projectId, data).then(() => {
        this.addStop(data);
        this.stop.creation.errors = {};
        this.stop.creation.data = {
          stop_lat: null,
          stop_lon: null,
        };
        this.map.setLayoutProperty('layer-creating-icon', 'visibility', 'none')
      }).catch((err) => {
        console.log(err.response);
        this.stop.creation.errors = err.response.data;
      });
    },
    flyToStop(stop) {
      this.map.flyTo({
        center: [stop.stop_lon, stop.stop_lat],
        zoom: 16,
      });
    },
    resize() {
      this.map.resize();
    },
    updateStopData(stop) {
      this.stop.stops = this.stop.stops.map(s => {
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
      this.stop.stops.push(data);
      this.reGenerateStops();
    },
    saveStop() {
      if (this.stop.edition.disableClose) return;
      stopsAPI.stopsAPI.update(this.projectId, this.stop.edition.stop).then(response => {
        this.stop.activeStops.forEach(feature => {
          this.map.setFeatureState({source: 'stop-source', id: feature.id,}, {active: false});
        });
        this.stop.stops = this.stop.stops.map(stop => {
          if (stop.id === response.data.id) {
            return response.data;
          }
          return stop;
        });
        this.reGenerateStops()
        this.status = this.Enums.InteractiveMapStatus.READER;
      });
    },
    reGenerateStops() {
      this.map.getSource('stop-source').setData(this.getStopGeojson());
    },
    addSourceAndLayersForStops() {
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
        data: this.stop.creation.geojson,
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
    },
    addSourceAndLayersForShape() {
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
    addListeners() {
      let map = this.map;
      let canvas = map.getCanvas();
      let self = this;

      this.map.on('click', () => {
        // deactivate stop if user clicks on map
        if (this.stop.edition.stop) {
          this.status = this.Enums.InteractiveMapStatus.READER;
          map.setFeatureState({source: 'stop-source', id: this.stop.edition.stop.id}, {active: false});
        }
      });

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
        if (this.stop.edition.stop) {
          // deactivate previous stop selected
          this.map.setFeatureState({source: 'stop-source', id: this.stop.edition.stop.id,}, {active: false});
        }
        this.stop.edition.stop = this.stop.stops.find(stop => stop.id === id);
        map.setFeatureState({source: 'stop-source', id: feature.id,}, {active: true});
        this.stop.activeStops.push(feature);
        this.status = this.Enums.InteractiveMapStatus.EDIT_DATA_POINT;
      });

      this.map.on('mouseenter', 'layer-stops-icon', function (e) {
        if (self.dragging || self.status === self.Enums.InteractiveMapStatus.ADDING_NEW_POINT) return;
        if (self.status === self.Enums.InteractiveMapStatus.EDIT_DATA_POINT &&
            self.stop.edition.stop.id === e.features[0].id) {
          canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'pointer';
        }
      });

      let hovered_stops = [];
      this.map.on('mousemove', 'layer-stops-icon', function (e) {
        if (self.dragging || self.status === self.Enums.InteractiveMapStatus.ADDING_NEW_POINT) return;
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
        if (self.dragging || self.status === self.Enums.InteractiveMapStatus.ADDING_NEW_POINT) return;
        canvas.style.cursor = '';
      });

      this.map.on('mousedown', 'layer-stops-icon', function (e) {
        let activeStop = e.features[0]
        if (self.status === self.Enums.InteractiveMapStatus.EDIT_DATA_POINT &&
            self.stop.edition.stop.id === activeStop.id) {
          // Prevent the default map drag behavior.
          e.preventDefault();
          canvas.style.cursor = 'grab';
          this.dragging = true;
          map.once('mouseup', evt_up => {
            this.dragging = false;
            let coords = evt_up.lngLat;
            let distance = self.calcDistance(e, evt_up);
            if (!distance) return;
            self.updateStop(activeStop, coords);
            canvas.style.cursor = '';
          });
        }
      });

      this.map.on('mouseenter', 'layer-creating-icon', () => {
        canvas.style.cursor = 'move';
      });

      this.map.on('mouseleave', 'layer-creating-icon', () => {
        canvas.style.cursor = '';
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
    updateCreationCoords(coords) {
      this.stop.creation.data.stop_lon = coords.lng;
      this.stop.creation.data.stop_lat = coords.lat;
      this.stop.creation.geojson.features = [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat],
        },
      }];
      this.map.getSource('creating').setData(this.stop.creation.geojson);
      this.map.setLayoutProperty('layer-creating-icon', 'visibility', 'visible')
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
      this.stop.stops = this.stop.stops.map(s => {
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
