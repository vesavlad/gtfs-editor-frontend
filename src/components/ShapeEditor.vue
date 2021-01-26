<template>
  <div id='map-container'>
    <div id='map' ref='map'>
    </div>
    <div class="map-overlay top">
      <div class="map-overlay-inner" v-if="map">
        <div>Largo de shape: {{ shapeLength }}</div>
        <div>
          shape ID
          <input v-model="shape_id">
        </div>
        Map Matching
        <br>
        <label class="switch">
          <input type="checkbox" v-model="mapMatching" @change="reGeneratePoints">
          <span class="slider round"></span>
        </label>
        <div v-if="error" class="error">
          {{error.code}}
          <br>
          <div v-for="(text, index) in error.message.split('\n')" :key="index">
            {{ text }}
          </div>
        </div>
        <div v-if="warning" class="warning">
          {{warning}}
        </div>
        <button class="btn btn-outline-secondary" @click="invertPoints">
          Invert Shape
        </button>
        <button v-if="mapMatching" class="btn btn-outline-secondary" @click="replacePoints">
          Replace points
        </button>
        <button class="btn btn-outline-secondary" @click="saveAndExit">
          Save and exit
        </button>
        <button class="btn btn-outline-secondary" @click="exitModal.visible = true">
          Exit
        </button>
      </div>
    </div>
    <Modal v-if="exitModal.visible" :showCancelButton="true" @close="exitModal.visible=false"
      @cancel="exitModal.visible=false" @ok="exit">
      <template slot="title">
        <h2>Are you sure you want to exit and discard your changes?</h2>
      </template>
    </Modal>
  </div>
</template>

<script>
  import shapesAPI from '@/api/shapes.api';
  import mapMatching from '@/api/mapMatching.api';
  import * as mapboxgl from 'mapbox-gl';
  import * as turf from '@turf/turf';

  import errorMessageMixin from '@/mixins/shapeMapMixin';
  import shapeMapMixin from '@/mixins/errorMessageMixin';
  import envelopeMixin from "@/mixins/envelopeMixin"

  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ';
  import Modal from "@/components/Modal.vue";
  export default {
    name: 'ShapeEditor',
    components: {
      Modal,
    },
    mixins: [
      errorMessageMixin,
      shapeMapMixin,
      envelopeMixin,
    ],
    data() {
      return {
        map: false,
        pointGeojson: {
          type: 'FeatureCollection',
          features: [],
        },
        lineGeojson: {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        },
        fixedPoints: {
          start: [],
          finish: [],
        },
        connectingLineGeojson: {
          'type': 'FeatureCollection',
          features: [],
        },
        pointSeqGeojson: {
          'type': 'FeatureCollection',
          features: [],
        },
        points: [],
        lineCoords: [],
        id: 0,
        mapMatching: !this.shape || this.range,
        shape_id: this.shape ? this.shape.shape_id : "",
        warning: false,
        error: false,
        exitModal: {
          visible: false,
        }
      }
    },
    props: {
      project: {
        required: true,
      },
      shape: {
        required: true,
      },
      range: {
        default: false,
      },
      mode: {
        type: String,
        default: "simple"
      }
    },
    computed: {
      creating() {
        return this.shape ? false : true;
      },
      shapeLength() {
        let result = 0;
        if (this.points.length > 1) {
          let points = this.points.map(el => [el.lng, el.lat]);
          let turfShape = turf.lineString(points);
          let answer = turf.nearestPointOnLine(turfShape, turf.point(points[points.length -1]));
          result = answer.properties.location.toFixed(2) + " kms";
        }
        return result;
      }
    },
    mounted() {
      let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
      });
      this.map = map;
      map.on('load', () => {
        this.addSources();
        this.addLayers();
        this.addListeners();
        this.$emit('load');
      });
    },
    methods: {
      addSources() {
        // This are our base points
        this.map.addSource('points', {
          'type': 'geojson',
          'data': this.pointGeojson,
        });

        this.map.addSource('points-seq', {
          'type': 'geojson',
          'data': this.pointSeqGeojson,
        });

        // This is the shape from mapbox
        this.map.addSource('line', {
          'type': 'geojson',
          'data': this.lineGeojson,
        });

        let fixedPointsGeojson = {
          type: 'FeatureCollection',
          features: [],
        }
        this.map.addSource('fixedPoints', {
          'type': 'geojson',
          'data': fixedPointsGeojson,
        });

        this.map.addSource('connecting-line', {
          'type': 'geojson',
          'data': this.connectingLineGeojson,
        });

        if (!this.creating && this.mode !== "all") {
          shapesAPI.shapesAPI.detail(this.project, this.shape.id).then(response => {
            let points = response.data.points.map(point => {
              return {
                id: this.id++,
                lat: point.shape_pt_lat,
                lng: point.shape_pt_lon,
              }
            });
            if (this.range) {
              // Range uses the shape_pt_sequence so let's say you want to edit between 10-20, this would mean
              // that you want to keep the values at array positions 0-9 (seq 1-10) and 19- (seq 20), so we have
              // to adjust the indexes to use slice in order to split the array.
              let start = this.range.start;
              let finish = this.range.finish - 1;
              let startingPoints = points.slice(0, start);
              let finishingPoints = points.slice(finish);
              this.fixedPoints = {
                start: startingPoints,
                finish: finishingPoints,
              }
              points = points.slice(start, finish);
              if (points.length > 1) {
                points = [points[0], points[points.length - 1]]
              }
              [startingPoints, finishingPoints].map(pointSeq => {
                let feature = {
                  'type': 'Feature',
                  'properties': {},
                  'geometry': {
                    'type': 'LineString',
                    'coordinates': pointSeq.map(point => [point.lng, point.lat])
                  }
                };
                fixedPointsGeojson.features.push(feature);
              })
              this.map.getSource('fixedPoints').setData(fixedPointsGeojson);
            }
            this.points = points;
            let bounds = this.getBounds(this.points);
            let padding = Math.min(this.$refs.map.offsetHeight, this.$refs.map.offsetWidth) * 2 / 5;
            this.map.fitBounds(bounds, {
              padding,
              animate: false,
            });
            this.reGeneratePoints();
          });
        } else {
          this.envelope(this.map, this.project);
        }
      },
      exit() {
        this.$emit('close');
      },
      addLayers() {
        // Line for the shape itself
        this.map.addLayer({
          'id': 'point-line-layer',
          'type': 'line',
          'source': 'points-seq',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#119911',
            'line-width': 7
          }
        });

        // Line for fixed points

        this.map.addLayer({
          'id': 'fixed-point-line-layer',
          'type': 'line',
          'source': 'fixedPoints',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#CC1111',
            'line-width': 5
          }
        });

        this.map.addLayer({
          'id': 'connecting-line-layer',
          'type': 'line',
          'source': 'connecting-line',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#CC8811',
            'line-width': 5
          }
        });

        // Line for the map matching shape
        this.map.addLayer({
          'id': 'line-layer',
          'type': 'line',
          'source': 'line',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#3333CC',
            'line-width': 2
          }
        });

        // Circles for the points
        this.map.addLayer({
          id: "point-layer",
          type: "circle",
          source: "points",
          filter: ["==", "$type", "Point"],
          paint: {
            "circle-radius": {
              base: 2,
              stops: [
                [14, 8],
                [16, 20]
              ]
            },
            "circle-color": "#33CC33"
          }
        });
        // Arrow for the shape
        let img = require('../assets/png/arrow-small.png')
        this.map.loadImage(img, (err, image) => {
          if (err) {
            console.log(err);
            return;
          }
          this.map.addImage('arrow', image);
          this.map.addLayer({
            'id': 'point-arrow',
            'type': 'symbol',
            'source': 'points-seq',
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
          this.map.addLayer({
            'id': 'line-arrow',
            'type': 'symbol',
            'source': 'line',
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
      },
      getPointIndex(id) {
        for (let i = 0; i < this.points.length; i++) {
          if (this.points[i].id === id) {
            return i;
          }
        }
        return -1;
      },
      invertPoints() {
        this.points = this.points.reverse();
        this.reGeneratePoints();
      },
      addListeners() {
        let map = this.map;
        let canvas = map.getCanvas();
        let self = this;
        map.on('dblclick', 'point-line-layer', evt => {
          evt.preventDefault();
        })
        // When click on a line we add a point in there between the ends
        map.on('click', 'point-line-layer', evt => {
          evt.preventDefault();
          let feature = evt.features[0];
          let newStop = {
            ...evt.lngLat,
            id: self.id++,
          }
          self.points.splice(self.getPointIndex(feature.properties.to), 0, newStop);
          self.reGeneratePoints();
        });
        map.on('mouseenter', 'point-line-layer', () => {
          canvas.style.cursor = 'crosshair';
        });


        map.on('mouseleave', 'point-line-layer', () => {
          canvas.style.cursor = '';
        });
        // When we double click the map we add a point in that position
        this.map.on('dblclick', (e) => {
          if (e.defaultPrevented) {
            return;
          }
          e.preventDefault();
          this.points.push({
            ...e.lngLat,
            id: this.id++,
          });
          this.reGeneratePoints();
        });
        map.on('contextmenu', 'point-layer', evt => {
          evt.preventDefault();
          let id = evt.features[0].properties.id;
          this.points = this.points.filter(point => point.id !== id);
          this.reGeneratePoints();
        });
        map.on('mousedown', 'point-layer', function (evt_down) {
          evt_down.preventDefault();
          canvas.style.cursor = 'grab';
          let feature = evt_down.features[0]

          map.once('mouseup', evt_up => {
            let coords = evt_up.lngLat;
            let distance = self.calcDistance(evt_down, evt_up);
            if (!distance) {
              return;
            }
            self.updatePoint(feature, coords);
            canvas.style.cursor = '';
          });
        });
      },
      updatePoint(pt, coords) {
        this.points = this.points.map(point => {
          if (pt.properties.id === point.id) {
            point = {
              ...point,
              ...coords,
            }
          }
          return point;
        });
        this.reGeneratePoints();
      },
      // Distance in pixels between events
      calcDistance(e1, e2) {
        e1 = e1.point;
        e2 = e2.point;
        let xdif = e1.x - e2.x;
        let ydif = e2.y - e2.y;
        return Math.sqrt(xdif * xdif + ydif * ydif)
      },
      reGeneratePoints() {
        // We add the features
        this.pointGeojson.features = this.points.map(this.generatePointGeojson);
        // And the polyline
        this.pointSeqGeojson.features = this.generateLineFeatures(this.points);
        this.map.getSource('points').setData(this.pointGeojson);
        this.map.getSource('points-seq').setData(this.pointSeqGeojson);
        if (this.mapMatching) {
          if (this.points.length > 100) {
            this.warning = "Warning: Mapmatching not available with >100 points";
            this.lineGeojson.geometry.coordinates = [];
            this.map.getSource('line').setData(this.lineGeojson);
            return;
          }
          if (this.points.length < 2) {
            return;
          }
          mapMatching.match(this.points).then(response => {
            console.log(response.data);
            if (response.data.code !== "Ok") {
              this.error = response.data;
              return
            }
            let matchings = response.data.matchings;
            if (matchings.length == 0) {
              this.lineGeojson.geometry.coordinates = [];
              console.log("No matchings")
            } else {
              this.lineGeojson.geometry.coordinates = matchings[0].geometry.coordinates;
            }

            this.map.getSource('line').setData(this.lineGeojson);
            this.error = false;
          }).catch(err => {
            console.log(err.response);
            this.error = err.response.data;
            this.lineGeojson.geometry.coordinates = [];
            this.map.getSource('line').setData(this.lineGeojson);
          });
        } else {
          this.lineGeojson.geometry.coordinates = [];
          this.map.getSource('line').setData(this.lineGeojson);
        }
        let connectingLines = [];
        if (this.fixedPoints.start.length > 0) {
          let connectee = this.points.concat(this.fixedPoints.finish);
          if (connectee.length) {
            connectingLines.push(this.generateLine(this.fixedPoints.start[this.fixedPoints.start.length - 1], connectee[
              0]))
          }
        }
        if (this.fixedPoints.finish.length > 0) {
          let connectee = this.fixedPoints.start.concat(this.points);
          if (connectee.length) {
            connectingLines.push(this.generateLine(connectee[connectee.length - 1], this.fixedPoints.finish[0]))
          }
        }
        this.connectingLineGeojson.features = connectingLines;
        this.map.getSource('connecting-line').setData(this.connectingLineGeojson);
        this.warning = false;
      },
      generateLine(from, to) {
        return {
          'type': 'Feature',
          'properties': {
            from: from.id,
            to: to.id,
          },
          'geometry': {
            'type': 'LineString',
            'coordinates': [
              [from.lng, from.lat],
              [to.lng, to.lat],
            ]
          }
        }
      },
      generateLineFeatures(points) {
        let features = []
        let lastPoint = points[0];
        points.slice(1).forEach(point => {
          features.push({
            'type': 'Feature',
            'properties': {
              from: lastPoint.id,
              to: point.id,
            },
            'geometry': {
              'type': 'LineString',
              'coordinates': [
                [lastPoint.lng, lastPoint.lat],
                [point.lng, point.lat],
              ]
            }
          });
          lastPoint = point;
        });
        return features;
      },
      generatePointGeojson(point) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              point.lng,
              point.lat,
            ]
          },
          properties: {
            id: point.id,
          }
        }
      },
      replacePoints() {
        let coords = this.lineGeojson.geometry.coordinates;
        if (coords.length) {
          this.points = coords.map(coord => {
            return {
              id: this.id++,
              lng: coord[0],
              lat: coord[1],
            }
          });
          this.mapMatching = false;
          this.reGeneratePoints();
        }
      },
      generateErrorMessage(errData) {
        if (errData[0]) {
          this.error = {
            code: "Error storing Shape",
            message: errData.join("\n")
          }
        }
        this.error = {
          message: Object.entries(errData).map(entry => {
            let val = entry[0];
            let errors = entry[1];
            return val + ":\n" + errors.join("\n");
          }).join("\n"),
          code: "Unable to create shape"
        };

      },
      saveAndExit() {
        if (this.mapMatching) {
          this.warning =
            "Warning: Map matching is enabled, please disable map matching or replace your points with the Map Matching result";
          return;
        }
        let generatePointJson = (point, index) => {
          return {
            shape_pt_sequence: index + 1,
            shape_pt_lat: point.lat,
            shape_pt_lon: point.lng,
          }
        }
        let data = {
          shape_id: this.shape_id,
          points: this.points.map(generatePointJson)
        };
        console.log(this.mode);
        if (this.creating || this.mode === "duplicate") {
          shapesAPI.shapesAPI.create(this.project, data).then(response => {
            console.log(response);
            this.$emit('close');
          }).catch(err => {
            console.log(err.response);
            this.generateErrorMessage(err.response.data);
          });
        } else {
          data.id = this.shape.id;
          data.points = this.fixedPoints.start.concat(this.points).concat(this.fixedPoints.finish).map(
            generatePointJson);
          shapesAPI.shapesAPI.put(this.project, data).then(response => {
            console.log(response);
            this.$emit('close');
          }).catch(err => {
            console.log(err.response);
            this.generateErrorMessage(err.response.data);
          });
        }
      }
    },
  }
</script>

<style scoped>
  @import url("https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css");

  .btn {
    min-width: 100px;
    min-height: 40px;
  }

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

  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }

  input:checked+.slider {
    background-color: #2196F3;
  }

  input:focus+.slider {
    box-shadow: 0 0 1px #2196F3;
  }

  input:checked+.slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>