<template>
  <div class="dynamic-map-container">
    <div class="top-map-bar">
      <div class="left-content">
        <template v-if="localEditionMode===Enums.ShapeEditorEditionMode.SELECT_RANGE">
          <div class="edit-shape-range">{{ $t('shape.editor.helpMessageToSelectRange') }}</div>
        </template>
        <template v-else>
          <div class="grid center">
            <label class="switch">
              <input type="checkbox" v-model="mapMatching" @change="reGeneratePoints">
              <span class="slider round"></span>
            </label>
            <span>Map Matching</span>
          </div>
          <button v-if="mapMatching" class="btn" @click="replacePoints">{{ $t('shape.editor.replacePoints') }}</button>
        </template>
      </div>
      <div class="right-content grid center">
        <template
            v-if="[Enums.ShapeEditorEditionMode.SIMPLE, Enums.ShapeEditorEditionMode.DUPLICATE].includes(localEditionMode)">
          <button class="btn" @click="invertPoints"><span>{{ $t('shape.editor.invertShape') }}</span><span
              class="material-icons">cached</span></button>
        </template>
        <button class="btn flat white"><span>{{ $t('general.howToUse') }}</span><i
            class="material-icons">help_outline</i></button>
      </div>
    </div>
    <div class="map" ref='map'></div>
    <div class="map-sidebar">
      <div class="side-panel edit-shape edit-shape-range" v-if="localEditionMode===Enums.ShapeEditorEditionMode.SELECT_RANGE">
        <div class="side-header">
          <h4>{{ $t('shape.editor.editShapeRange') }}</h4>
        </div>
        <div class="side-content">
          <div class="field-name"><span>{{ $t('shape.editor.startPoint') }}</span></div>
          <div class="field">{{ firstSelectedPoint.properties.sequence }}</div>
          <div class="field-name"><span>{{ $t('shape.editor.endPoint') }}</span></div>
          <div class="field">{{ endSelectedPoint.properties.sequence }}</div>
          <div class="field-name"><span>Total points</span></div>
          <div class="field">0000</div>
          <button class="btn submit" @click="changeToEditRangeClick"
                  :disabled="firstSelectedPoint.properties.sequence===null || endSelectedPoint.properties.sequence===null">
            {{ $t('shape.editor.startEditionOfRangeButtonLabel') }}
          </button>
        </div>
      </div>
      <div class="side-panel edit-shape" v-else>
        <div class="side-header">
          <div>
            <h4 v-if="mode===Enums.ShapeEditorMode.CREATE">{{ $t('shape.editor.addNewShape') }}</h4>
            <h4 v-else>{{ $t('shape.editor.editShape') }}</h4>
          </div>
          <div class="btn-list">
            <button class="btn icon save" @click="saveAndExit"><span class="material-icons">check</span></button>
            <button class="btn icon" @click="exitModal.visible = true"><span class="material-icons">close</span>
            </button>
          </div>
        </div>
        <div class="side-content">
          <div class="field-name"><span>Shape ID</span></div>
          <div class="field" v-if="localShape"><input v-model="localShape.shape_id"></div>
          <div class="field-name"><span>{{ $t('shape.editor.length') }}</span></div>
          <div class="field"> {{ shapeLength }}</div>
          <div class="field-name"><span>{{ $t('shape.editor.pointsNumber') }}</span></div>
          <div class="field"> {{ points.length }}</div>
          <div v-if="error" class="errors error">
            {{ error.code }}
            <div v-for="(text, index) in error.message.split('\n')" :key="index">
              {{ text }}
            </div>
          </div>
          <p v-if="warning" class="errors warning grid">
            <span class="material-icons">warning</span>
            <span>{{ warning }}</span>
          </p>
        </div>
      </div>
    </div>
    <MessageModal :show="exitModal.visible" :showCancelButton="true" @cancel="exitModal.visible=false"
                  @close="exitModal.visible=false" @ok="exit" :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>{{ $t('shape.editor.discardChangesMessage') }}</h2>
      </template>
    </MessageModal>
  </div>
</template>

<script>
import shapesAPI from '@/api/shapes.api';
import mapMatching from '@/api/mapMatching.api';
import * as mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

import Enums from '@/utils/enums.js'
import errorMessageMixin from '@/mixins/shapeMapMixin';
import shapeMapMixin from '@/mixins/errorMessageMixin';
import envelopeMixin from "@/mixins/envelopeMixin";
import shapeEditorSelectRangeMixin from "@/mixins/shapeEditorSelectRangeMixin";
import config from "@/config";
import MessageModal from "@/components/modal/MessageModal";

mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;

export default {
  name: 'ShapeEditor',
  components: {
    MessageModal,
  },
  mixins: [
    errorMessageMixin,
    shapeMapMixin,
    envelopeMixin,
    shapeEditorSelectRangeMixin
  ],
  props: {
    projectId: {
      type: [String, Number],
      required: true,
    },
    shape: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      validator: function (value) {
        if (Object.values(Enums.ShapeEditorMode).indexOf(value) === -1) {
          console.error(`shape editor mode "${value}" is not valid`)
          return false;
        }
        return true;
      }
    },
    editionMode: {
      type: String,
      default: Enums.ShapeEditorEditionMode.SIMPLE,
      validator: function (value) {
        if (Object.values(Enums.ShapeEditorEditionMode).indexOf(value) === -1) {
          console.error(`edit mode "${value}" is not valid`)
          return false;
        }
        return true;
      }
    }
  },
  data() {
    return {
      localShape: this.shape,
      localEditionMode: this.editionMode,
      map: null,
      points: [],
      geojsonPoints: {
        'type': 'FeatureCollection',
        features: [],
      },
      geojsonLine: {
        'type': 'FeatureCollection',
        features: [],
      },
      connectingLineGeojson: {
        'type': 'FeatureCollection',
        features: [],
      },
      pointSeqGeojson: {
        'type': 'FeatureCollection',
        features: [],
      },
      lineCoords: [],
      id: 0,
      mapMatching: false,
      warning: false,
      error: false,
      exitModal: {
        visible: false,
      }
    }
  },
  computed: {
    shapeLength() {
      let result = 0;
      if (this.points.length > 1) {
        let points = this.points.map(el => [el.lng, el.lat]);
        let turfShape = turf.lineString(points);
        let answer = turf.nearestPointOnLine(turfShape, turf.point(points[points.length - 1]));
        result = answer.properties.location.toFixed(2);
      }
      return result + " kms";
    }
  },
  mounted() {
    this.map = new mapboxgl.Map({
      container: this.$refs.map,
      style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    });
    this.map.on('load', () => {
      if (this.localEditionMode === this.Enums.ShapeEditorEditionMode.SELECT_RANGE) {
        this.changeToSelectRange(this.localShape);
      } else if (this.localEditionMode === this.Enums.ShapeEditorEditionMode.SIMPLE) {
        console.log("simple");
      } else if (this.localEditionMode === this.Enums.ShapeEditorEditionMode.DUPLICATE) {
        console.log("duplicate");
      } else {
        this.addSources();
        this.setData();
        this.addLayers();
        this.addListeners();
      }
      this.envelope(this.map, this.projectId);
      this.$emit('load');
    });
  },
  methods: {
    generateGeojsonPoint(point, properties) {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.lng, point.lat]
        },
        properties: properties,
        id: point.id
      }
    },
    setShapeData(shape) {
      this.points = [];
      this.points = shape.points.map(point => {
        return {
          id: this.id++,
          lat: point.shape_pt_lat,
          lng: point.shape_pt_lon,
        }
      });
      this.geojsonPoints.features = this.points.map(el => {
        return this.generateGeojsonPoint(el, {sequence: el.id});
      });
      this.geojsonLine.features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.points.map(p => [p.lng, p.lat])
        },
        properties: {},
        id: 1
      });
    },
    changeToEditRangeClick() {
      this.localModeEdition = this.Enums.ShapeEditorEditionMode.EDIT_RANGE;
      this.changeToEditRange();
    },
    addSources() {
      this.map.addSource('points', {
        'type': 'geojson',
        'data': this.pointGeojson,
      });

      this.map.addSource('points-seq', {
        'type': 'geojson',
        'data': this.pointSeqGeojson,
      });

      this.map.addSource('line', {
        'type': 'geojson',
        'data': this.lineGeojson,
      });

      this.map.addSource('fixedPoints', {
        'type': 'geojson',
        'data': {
          type: 'FeatureCollection',
          features: [],
        },
      });

      this.map.addSource('connecting-line', {
        'type': 'geojson',
        'data': this.connectingLineGeojson,
      });
    },
    setData() {
      let points = [];
      if (this.localShape !== null) {
        points = this.localShape.points.map(point => {
          return {
            id: this.id++,
            lat: point.shape_pt_lat,
            lng: point.shape_pt_lon,
          }
        });
      }

      if (this.mode === this.Enums.ShapeEditorMode.EDIT) {
        this.mapMatching = false;
        if (this.Enums.ShapeEditorEditionMode.EDIT_RANGE && !!this.range) {
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

          let fixedPointsGeojson = {
            type: 'FeatureCollection',
            features: [],
          };

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
          });
          this.map.getSource('fixedPoints').setData(fixedPointsGeojson);
        }
      } else {
        if (this.localEditionMode === this.Enums.ShapeEditorEditionMode.DUPLICATE) {
          this.localShape.id = null;
          this.localShape.shape_id = this.$t('shape.editor.duplicationPrefix') + this.localShape.shape_id;
        } else {
          this.localShape = {id: null, shape_id: null, points: []};
          this.mapMatching = true;
          this.envelope(this.map, this.projectId);
        }
      }

      this.points = points;
      if (this.mode === this.Enums.ShapeEditorMode.EDIT ||
          (this.mode === this.Enums.ShapeEditorMode.CREATE && this.localEditionMode === this.Enums.ShapeEditorEditionMode.DUPLICATE)) {
        let bounds = this.getBounds(this.points);
        let padding = Math.min(this.$refs.map.offsetHeight, this.$refs.map.offsetWidth) * 0.1;
        this.map.fitBounds(bounds, {
          padding,
          animate: false,
        });
        this.reGeneratePoints();
      }
    },
    exit() {
      this.$router.push({name: 'Shapes', params: {projectId: this.projectId}});
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
          'line-color': config.shape_line_color,
          'line-width': 5
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
          'line-color': config.shape_fixed_line_color,
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
          'line-color': config.shape_connecting_line_color,
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
          'line-color': config.map_matching_color,
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
          "circle-radius": ['interpolate', ['linear'], ['zoom'],].concat(config.shape_point_zoom),
          'circle-color': [
            'case',
            ['boolean', ['get', 'selected'], false], "#21b0cf",
            ['boolean', ['feature-state', 'hover'], false], config.shape_fixed_line_color,
            'white'
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['get', 'selected'], false], "#21b0cf",
            ['boolean', ['feature-state', 'hover'], false], config.shape_fixed_line_color,
            config.shape_line_color,
          ],
          "circle-stroke-opacity": 1,
          "circle-stroke-width": 2
        }
      });
      // Arrow for the shape
      let img = require('../../assets/img/double-arrow.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('double-arrow', image, {sdf: true},{ pixelRatio: 2 });
        this.map.addLayer({
          'id': 'point-arrow',
          'type': 'symbol',
          'source': 'points-seq',
          'layout': {
            'symbol-placement': 'line',
            'symbol-spacing': 200,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-image': 'double-arrow',
            'icon-size': .7,
            'visibility': 'visible'
          },
          paint: {
            'icon-color': config.shape_line_color,
            'icon-halo-color': "#fff",
            'icon-halo-width': 2,
            'icon-halo-blur': 0,
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
            'icon-image': 'double-arrow',
            'icon-size': 1,
            'visibility': 'visible'
          },
          paint: {
            'icon-color': config.map_matching_color,
            'icon-halo-color': "#fff",
            'icon-halo-width': 2,
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

      let hoveredStops = {};
      map.on('mouseenter', 'point-line-layer', e => {
        let feature = e.features[0];
        hoveredStops[feature.id] = feature;
        canvas.style.cursor = 'pointer';
        map.setFeatureState({source: 'points', id: feature.id,}, {hover: true});
      });

      map.on('mouseleave', 'point-line-layer', () => {
        canvas.style.cursor = '';
        Object.keys(hoveredStops).forEach(featureId => {
          map.setFeatureState({source: 'points', id: featureId}, {hover: false});
        });
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
        let id = evt.features[0].id;
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
        if (pt.id === point.id) {
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
      this.pointGeojson.features = this.points.map(f => this.generateGeojsonPoint(f, {}));
      // And the polyline
      this.pointSeqGeojson.features = this.generateLineFeatures(this.points);
      this.map.getSource('points').setData(this.pointGeojson);
      this.map.getSource('points-seq').setData(this.pointSeqGeojson);
      if (this.mapMatching) {
        if (this.points.length > 100) {
          this.warning = "Mapmatching not available with >100 points";
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
          if (matchings.length === 0) {
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
        this.warning = this.$t('shape.editor.mapMatchingWarning');
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
        shape_id: this.localShape.shape_id,
        points: this.points.map(generatePointJson)
      };
      if (this.mode === this.Enums.ShapeEditorMode.CREATE || this.localEditionMode === this.Enums.ShapeEditorEditionMode.DUPLICATE) {
        shapesAPI.shapesAPI.create(this.projectId, data).then(() => {
          this.$router.push({name: "Shapes", params: {projectId: this.projectId}});
        }).catch(err => {
          console.log(err.response);
          this.generateErrorMessage(err.response.data);
        });
      } else {
        data.id = this.localShape.id;
        data.points = this.fixedPoints.start.concat(this.points).concat(this.fixedPoints.finish).map(
            generatePointJson);
        shapesAPI.shapesAPI.put(this.projectId, data).then(() => {
          this.$router.push({name: "Shapes", params: {projectId: this.projectId}});
        }).catch(err => {
          console.log(err.response);
          this.generateErrorMessage(err.response.data);
        });
      }
    }
  },
  watch: {
    shape() {
      this.localShape = this.shape;
    }
  }
}
</script>
