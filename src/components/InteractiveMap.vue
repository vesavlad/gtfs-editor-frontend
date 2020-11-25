<template>
  <div id='map-container'>
    <div id='map'>
      <popup-content v-show="modalOpen" ref="popupContent" :fields="stopFields" v-model="popup.stop"></popup-content>
    </div>
    <div class="map-overlay top">
      <div class="map-overlay-inner" v-if="map">
        <button v-if="!creation.creating" class="btn icon" alt="Create Stop" @click="beginCreation">
          <span class="material-icons">add</span>
        </button>
        <div v-if="creation.creating">
          <popup-content v-if="creation.creating" ref="createForm" :fields="stopFields"
            :errors="creation.errors" v-model="creation.data">
          </popup-content>
          <button class="btn icon" alt="Create" @click="create">
            <span class="material-icons">add_location</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import stopsAPI from '@/api/stops.api';
  import PopupContent from '@/components/PopupContent.vue';
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ';

  export default {
    name: 'InteractiveMap',
    components: {
      PopupContent
    },
    data() {
      return {
        stops: [],
        popup: {
          stop: {},
        },
        map: false,
        modalOpen: false,
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
    computed: {
      stopMap() {
        let map = {};
        this.stops.forEach(stop => {
          map[stop.id] = stop;
        });
        return map;
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
      beginCreation() {
        let self = this;
        this.map.once("click", e => {
          self.creation.creating = true;
          self.updateCreationCoords(e.lngLat);
        });
      },
      create() {
        let data = this.creation.data;
        stopsAPI.stopsAPI.create(this.project, data).then(response => {
          console.log(response);
          this.addStop(data);
          this.creation.errors = {};
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
      generatePopup(stop) {
        this.popup.stop = stop;
        return this.$refs.popupContent.$el;
      },
      createLabel(stop) {
        return stop.stop_id + (stop.stop_code ? ` (${stop.stop_code})` : "");
      },
      addStops() {
        // We create the geojson and add it to the map
        this.geojson = {
          type: 'FeatureCollection',
          features: this.stops.map(stop => {
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
          })
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
      addListeners() {
        let map = this.map;
        let canvas = map.getCanvas();
        let stopMap = this.stopMap;
        let self = this;
        this.map.on('click', 'layer-stops-icon', (evt) => {
          if (this.dragMode(evt)) {
            return;
          }
          var coordinates = evt.features[0].geometry.coordinates.slice();
          var stop_id = evt.features[0].properties.stop_id;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(evt.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += evt.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          let stop = stopMap[stop_id];
          let popup = new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setDOMContent(this.generatePopup(stop))
          popup.addTo(map);
          popup.on('close', () => {
            stopsAPI.stopsAPI.update(this.project, this.popup.stop);
          });
          this.modalOpen = true;
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
      updateStop(stop, coords) {
        stop.geometry.coordinates = coords;
        this.geojson.features = this.geojson.features.map(feature => {
          if (feature.properties.stop_id === stop.properties.stop_id) {
            feature.geometry.coordinates = [coords.lng, coords.lat];
            let stop_data = this.stopMap[stop.properties.stop_id];
            stop_data.stop_lat = coords.lat;
            stop_data.stop_lon = coords.lng;
            stopsAPI.stopsAPI.update(this.project, {
              id: stop_data.id,
              stop_lat: coords.lat,
              stop_lon: coords.lng,
            }).then(() => {
              console.log("updated");
            })
          }
          return feature;
        });
        this.map.getSource('stops').setData(this.geojson);
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