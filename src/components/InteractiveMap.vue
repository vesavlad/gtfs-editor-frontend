<template>
  <div id='map-container'>
    <div id='map'>
      <div ref="popup" v-show="popup.open">
        <popup-content ref="popupContent" :fields="stopFields" v-model="popup.stop" :errors="popup.errors">
        </popup-content>
        <button class="btn icon" alt="Delete" @click="beginStopDeletion">
          <span class="material-icons">delete</span>
        </button>
        <!-- <button class="btn icon" alt="Save" @click="log">
          <span class="material-icons">save</span>
        </button> -->
      </div>
    </div>
    <div class="map-overlay top">
      <div class="map-overlay-inner" v-if="map">
        <button v-if="!creation.creating" class="btn icon" alt="Create Stop" @click="beginCreation">
          <span class="material-icons">add</span>
        </button>
        <div v-if="creation.creating">
          <popup-content v-if="creation.creating" ref="createForm" :fields="stopFields" :errors="creation.errors"
            v-model="creation.data">
          </popup-content>
          <button class="btn icon" alt="Create" @click="create">
            <span class="material-icons">add_location</span>
          </button>
        </div>
      </div>
    </div>
    <Modal v-if="deleteModal.visible" @ok="deleteStop" @close="deleteModal.visible = false"
      @cancel="deleteModal.visible = false" :showCancelButton="true">
      <template slot="title">
        <h2>Are you sure you want to delete this stop?</h2>
      </template>
      <template slot="content">
        <span>
          {{deleteModal.message}}
        </span>
      </template>
      <template slot="close-button-name">Delete</template>
    </Modal>
  </div>
</template>

<script>
  import stopsAPI from '@/api/stops.api';
  import PopupContent from '@/components/PopupContent.vue';
  import Modal from "@/components/Modal.vue";
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ';

  export default {
    name: 'InteractiveMap',
    components: {
      PopupContent,
      Modal,
    },
    data() {
      return {
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
            style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
            center: [this.stops[0].stop_lon, this.stops[0].stop_lat], // starting position [lng, lat]
            zoom: 16 // starting zoom
          });
          this.map = map;
          map.on('load', () => {
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
          console.log(err);
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
          console.log(this.creation);
          this.creation.errors = {};
          this.creation.creating = false;
          this.creation.data = {
            stop_lat: null,
            stop_lon: null,
          };
          this.creation.geojson.features = [];
          this.map.getSource('creating').setData(this.creation.geojson);
        }).catch((err) => {
          console.log(err);
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
      generatePopup(stop) {
        this.popup.stop = stop;
        this.popup.errors = {};
        return this.$refs.popup;
      },
      createLabel(stop) {
        return stop.stop_id + (stop.stop_code ? ` (${stop.stop_code})` : "");
      },
      addStop(data) {
        this.stops.push(data);
        this.reGenerateStops();
      },
      generateStopGeoJson(stop) {
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
            label: this.createLabel(stop),
          }
        }
      },
      reGenerateStops(){
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
            "circle-radius": {
              base: 2,
              stops: [
                [12, 1.5],
                [14, 4],
                [20, 180]
              ]
            },
            "circle-color": "#2222DD"
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
            "circle-radius": {
              base: 2,
              stops: [
                [12, 4],
                [20, 240]
              ]
            },
            "circle-color": "#DD9911",
          }
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
        console.log(id);
        this.stops.forEach(stop => {
          if(stop.id === id){
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
          if (this.dragMode(evt)) {
            return;
          }
          var coordinates = evt.features[0].geometry.coordinates.slice();
          var id = evt.features[0].properties.stop_id;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(evt.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += evt.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          let stop = this.findStop(id);
          let popup = new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setDOMContent(this.generatePopup(stop))
          popup.addTo(map)
            .on('close', () => {
              if (this.popup.disableClose) return;
              stopsAPI.stopsAPI.update(this.project, this.popup.stop).then(response => {
                console.log(response);
                this.stops = this.stops.map(stop => {
                  if(this.popup.stop.id === stop.id){
                    return {...this.popup.stop};
                  }
                  else {
                    return stop;
                  }
                });
                this.reGenerateStops()
              });
            });
          this.popup.popup = popup;
          this.popup.open = true;
        });
        this.map.on('mouseenter', 'layer-stops-icon', function () {
          if (this.dragging) return;
          canvas.style.cursor = 'pointer';
        });
        this.map.on('mouseleave', 'layer-stops-icon', function () {
          if (this.dragging) return;
          canvas.style.cursor = '';
        });
        map.on('mousedown', 'layer-stops-icon', function (evt) {
          // Prevent the default map drag behavior.
          if (!self.dragMode(evt)) {
            return;
          }
          evt.preventDefault();
          canvas.style.cursor = 'grab';
          let activeStop = evt.features[0]

          map.once('mouseup', evt => {
            let coords = evt.lngLat;
            self.updateStop(activeStop, coords);
            canvas.style.cursor = '';
          });
        });

        map.on('mousedown', 'layer-creating-icon', function (evt) {
          // Prevent the default map drag behavior.
          if (!self.dragMode(evt)) {
            return;
          }
          evt.preventDefault();
          canvas.style.cursor = 'grab';

          map.once('mouseup', evt => {
            let coords = evt.lngLat;
            self.updateCreationCoords(coords);
            canvas.style.cursor = '';
          });
        });
      },
      log() {
        console.log(...arguments);
      },
      updateStop(stop, coords) {
        this.stops = this.stops.map(s => {
          if(s.id !== stop.properties.stop_id){
            return s;
          }
          s.stop_lon = coords.lng;
          s.stop_lat = coords.lat;
          console.log(s);
          return s;
        });
        this.reGenerateStops();
      },
      dragMode(evt) {
        return evt.originalEvent.altKey;
      },
    },
  }
</script>

<style>
  @import url("https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css");

  #map {
    width: 100%;
    height: 100%;
    min-height: 800px;
  }

  canvas.mapglbox-canvas {
    width: 100%;
    height: 100%;
  }

  div.mapboxgl-popup-content {
    overflow-y: scroll;
    max-height: 400px;
  }

  #map-container {
    position: relative;
  }

  .map-overlay {
    font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
    position: absolute;
    width: 200px;
    top: 0;
    left: 0;
    padding: 10px;
  }

  .map-overlay .map-overlay-inner {
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    padding: 10px;
    margin-bottom: 10px;
  }

  .map-overlay-inner fieldset {
    border: none;
    padding: 0;
    margin: 0 0 10px;
  }

  .map-overlay-inner fieldset:last-child {
    margin: 0;
  }

  .map-overlay-inner select {
    width: 100%;
  }

  .map-overlay-inner label {
    display: block;
    font-weight: bold;
    margin: 0 0 5px;
  }

  .map-overlay-inner button {
    display: inline-block;
    width: 36px;
    height: 20px;
    border: none;
    cursor: pointer;
  }

  .map-overlay-inner button:focus {
    outline: none;
  }

  .map-overlay-inner button:hover {
    box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
</style>