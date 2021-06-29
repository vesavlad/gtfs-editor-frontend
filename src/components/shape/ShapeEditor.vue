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
      <div class="side-panel edit-shape edit-shape-range"
           v-if="localEditionMode===Enums.ShapeEditorEditionMode.SELECT_RANGE">
        <div class="side-header">
          <h4>{{ $t('shape.editor.editShapeRange') }}</h4>
        </div>
        <div class="side-content">
          <div class="field-name"><span>{{ $t('shape.editor.startPoint') }}</span></div>
          <div class="field">{{ firstSelectedPoint.properties.sequence }}</div>
          <div class="field-name"><span>{{ $t('shape.editor.endPoint') }}</span></div>
          <div class="field">{{ endSelectedPoint.properties.sequence }}</div>
          <div class="field-name"><span>{{ $t('shape.editor.pointsToEdit') }}</span></div>
          <div class="field">{{ pointsToEdit }}</div>
          <button class="btn submit" @click="changeToEditRangeClick" :disabled="pointsToEdit === 0">
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
import MessageModal from "@/components/modal/MessageModal";
import config from "@/config";

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
      geojson: {
        points: {
          'type': 'FeatureCollection',
          features: [],
        },
        lines: {
          'type': 'FeatureCollection',
          features: [],
        },
        mapMatchingLine: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          },
          properties: {},
          id: 1
        },
        movingPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: []
          },
          properties: {},
          id: 1,
        }
      },
      id: 1,
      mapMatching: false,
      warning: false,
      error: false,
      exitModal: {
        visible: false,
      },
      selectRange: {
        selectedStopFeatures: [
          {id: null, properties: {sequence: null}},
          {id: null, properties: {sequence: null}}
        ],
        stopsInBetween: [],
        hoveredStops: new Set()
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
    },
    firstSelectedPoint() {
      return this.selectRange.selectedStopFeatures[0];
    },
    endSelectedPoint() {
      return this.selectRange.selectedStopFeatures[1];
    },
    pointsToEdit() {
      if (this.selectRange.selectedStopFeatures[0].properties.sequence !== null &&
          this.selectRange.selectedStopFeatures[1].properties.sequence !== null) {
        return this.selectRange.selectedStopFeatures[1].properties.sequence - this.selectRange.selectedStopFeatures[0].properties.sequence;
      }
      return 0;
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
        this.changeToCreate();
      } else if (this.localEditionMode === this.Enums.ShapeEditorEditionMode.DUPLICATE) {
        this.changeToDuplicate(this.localShape);
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
    generateLineFeatures(points) {
      let features = []
      let previousPoint = points[0];
      points.slice(1).forEach(point => {
        features.push({
          'type': 'Feature',
          'properties': {
            from: previousPoint.id,
            to: point.id,
          },
          'geometry': {
            'type': 'LineString',
            'coordinates': [
              [previousPoint.lng, previousPoint.lat],
              [point.lng, point.lat],
            ]
          },
          id: previousPoint.id
        });
        previousPoint = point;
      });
      return features;
    },
    setShapeData(shape) {
      this.points = shape.points.map(point => {
        return {
          id: this.id++,
          lat: point.shape_pt_lat,
          lng: point.shape_pt_lon,
        }
      });
      this.geojson.points.features = this.points.map(el => {
        return this.generateGeojsonPoint(el, {sequence: el.id});
      });
      this.geojson.lines.features = this.generateLineFeatures(this.points);
    },
    setSourceAndLayers() {
      this.map.addSource('shape-points-source', {
        'type': 'geojson',
        'data': this.geojson.points,
      });

      this.map.addSource('shape-lines-source', {
        'type': 'geojson',
        'data': this.geojson.lines,
      });

      this.map.addSource('mapmatching-line-source', {
        'type': 'geojson',
        'data': this.geojson.mapMatchingLine,
      });

      // Circles for the points
      this.map.addLayer({
        id: 'point-layer',
        type: 'circle',
        source: 'shape-points-source',
        paint: {
          'circle-radius':
              ['interpolate', ['linear'], ['zoom'],
                12, [
                'case',
                ['boolean', ['feature-state', 'hover'], false], 5,
                ['boolean', ['feature-state', 'selected'], false], 5,
                1.5
              ],
                14, [
                'case',
                ['boolean', ['feature-state', 'hover'], false], 5,
                ['boolean', ['feature-state', 'selected'], false], 5,
                3
              ],
                20, [
                'case',
                ['boolean', ['feature-state', 'hover'], false], 5,
                ['boolean', ['feature-state', 'selected'], false], 5,
                3
              ],],
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false], '#7DC242',
            ['boolean', ['feature-state', 'frozen'], false], '#aab9be',
            ['boolean', ['feature-state', 'editable'], false], 'white',
            ['boolean', ['feature-state', 'selected'], false], '#7DC242',
            ['boolean', ['feature-state', 'between'], false], 'white',
            'white'
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false], '#7DC242',
            ['boolean', ['feature-state', 'editable'], false], config.shape_line_color,
            ['boolean', ['feature-state', 'selected'], false], '#7DC242',
            ['boolean', ['feature-state', 'between'], false], '#7DC242',
            config.shape_line_color,
          ],
          'circle-stroke-opacity': 1,
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false], 3,
            ['boolean', ['feature-state', 'editable'], false], 2,
            ['boolean', ['feature-state', 'frozen'], false], 0,
            ['boolean', ['feature-state', 'selected'], false], 3,
            ['boolean', ['feature-state', 'between'], false], 3,
            2
          ]
        }
      });

      // Line for the map matching shape
      this.map.addLayer({
        'id': 'line-layer',
        'type': 'line',
        'source': 'mapmatching-line-source',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': config.map_matching_color,
          'line-width': 2
        }
      });

      // Line for the shape itself
      this.map.addLayer({
        'id': 'point-line-layer',
        'type': 'line',
        'source': 'shape-lines-source',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'editable'], false], '#19849c',
            ['boolean', ['feature-state', 'frozen'], false], '#aab9be',
            ['boolean', ['feature-state', 'between'], false], '#7dc242',
            '#19849c'
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'editable'], false], 4,
            2
          ]
        }
      }, 'point-layer');

      // Arrow for the shape
      let img = require('../../assets/img/double-arrow.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('double-arrow', image, {sdf: true});
        this.map.addLayer({
          'id': 'point-arrow',
          'type': 'symbol',
          'source': 'shape-lines-source',
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
            'icon-color': [
              'case',
              ['boolean', ['feature-state', 'frozen'], false], '#aab9be',
              ['boolean', ['feature-state', 'editable'], false], '#19849c',
              ['boolean', ['feature-state', 'between'], false], '#7dc242',
              '#19849c'
            ],
            'icon-halo-color': '#fff',
            'icon-halo-width': 2,
          }
        }, 'point-layer');

        this.map.addLayer({
          'id': 'mapmathing-line-arrow',
          'type': 'symbol',
          'source': 'mapmatching-line-source',
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
            'icon-color': config.map_matching_color,
            'icon-halo-color': "#fff",
            'icon-halo-width': 2,
          }
        });
      });
    },
    changeToEditRangeClick() {
      this.localEditionMode = this.Enums.ShapeEditorEditionMode.EDIT_RANGE;
      this.changeToEditRange();
    },
    changeToCreate() {
      this.localEditionMode = this.Enums.ShapeEditorEditionMode.SIMPLE;
      this.localShape = {
        id: null,
        shape_id: null,
        points: []
      };
      this.mapMatching = true;
      this.setSourceAndLayers();
      this.enableShapeEdition({letExtendShape: true});
      console.log("create shape");
    },
    changeToDuplicate(shape) {
      this.localEditionMode = this.Enums.ShapeEditorEditionMode.DUPLICATE;
      this.localShape.id = null;
      this.localShape.shape_id = this.$t('shape.editor.duplicationPrefix') + this.localShape.shape_id;
      this.setShapeData(shape);
      this.setSourceAndLayers();

      this.points.forEach(stop => {
        this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {editable: true});
        this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {editable: true});
      });
      this.enableShapeEdition();
    },
    exit() {
      this.$router.push({name: 'Shapes', params: {projectId: this.projectId}});
    },
    getPointIndex(id) {
      return this.points.findIndex(e => e.id === id);
    },
    invertPoints() {
      this.points = this.points.reverse();
      this.reGeneratePoints();
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
    calculateMapMatching() {
      if (this.mapMatching) {
        if (this.points.length > 100) {
          this.warning = "Mapmatching not available with >100 points";
          this.geojson.mapMatchingLine.geometry.coordinates = [];
          this.map.getSource('mapmatching-line-source').setData(this.geojson.mapMatchingLine);
          return;
        } else if (this.points.length < 2) {
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
            this.geojson.mapMatchingLine.geometry.coordinates = [];
            console.log("No matchings")
          } else {
            this.geojson.mapMatchingLine.geometry.coordinates = matchings[0].geometry.coordinates;
          }

          this.map.getSource('mapmatching-line-source').setData(this.geojson.mapMatchingLine);
          this.error = false;
        }).catch(err => {
          console.log(err.response);
          this.error = err.response.data;
          this.geojson.mapMatchingLine.geometry.coordinates = [];
          this.map.getSource('mapmatching-line-source').setData(this.geojson.mapMatchingLine);
        });
      } else {
        this.geojson.mapMatchingLine.geometry.coordinates = [];
        this.map.getSource('mapmatching-line-source').setData(this.geojson.mapMatchingLine);
        this.warning = false;
      }
    },
    reGeneratePoints() {
      // We add the features
      this.geojson.points.features = this.points.map(f => this.generateGeojsonPoint(f, {}));
      // And the polyline
      this.geojson.lines.features = this.generateLineFeatures(this.points);
      this.map.getSource('shape-points-source').setData(this.geojson.points);
      this.map.getSource('shape-lines-source').setData(this.geojson.lines);
      this.calculateMapMatching();
    },
    replacePoints() {
      let coords = this.geojson.mapMatchingLine.geometry.coordinates;
      if (coords.length) {
        let ids = [];
        this.points = coords.map(coord => {
          this.id++;
          ids.push(this.id);
          return {
            id: this.id,
            lng: coord[0],
            lat: coord[1],
          }
        });
        this.mapMatching = false;
        this.reGeneratePoints();
        ids.forEach(id => {
          this.map.setFeatureState({source: 'shape-points-source', id: id}, {editable: true});
          this.map.setFeatureState({source: 'shape-lines-source', id: id}, {editable: true});
        });
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
      let generateGTFSShapePoint = (point, index) => {
        return {
          shape_pt_sequence: index + 1,
          shape_pt_lat: point.lat,
          shape_pt_lon: point.lng,
        }
      }
      let data = {
        shape_id: this.localShape.shape_id,
        points: this.points.map(generateGTFSShapePoint)
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
            generateGTFSShapePoint);
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
