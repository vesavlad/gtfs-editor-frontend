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
          <button :disabled="!mapMatching" class="btn" @click="replacePoints">{{
              $t('shape.editor.replacePoints')
            }}
          </button>
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
          <div class="field">{{ firstSelectedPoint.id }}</div>
          <div class="field-name"><span>{{ $t('shape.editor.endPoint') }}</span></div>
          <div class="field">{{ endSelectedPoint.id }}</div>
          <div class="field-name"><span>{{ $t('shape.editor.pointsToEdit') }}</span></div>
          <div class="field">{{ pointsToEdit }}</div>
          <button class="btn submit" @click="changeToEditRange" :disabled="pointsToEdit === 0">
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
          <div class="field" v-if="localShape">
            <SimpleInput v-model="localShape.shape_id"
                         :field="{type: Enums.InputType.INPUT, title:'shape_id'}"
                         :errors="error.shape_id"></SimpleInput>
          </div>
          <div class="field-name"><span>{{ $t('shape.editor.length') }}</span></div>
          <div class="field"> {{ shapeLength }}</div>
          <div class="field-name"><span>{{ $t('shape.editor.pointsNumber') }}</span></div>
          <div class="field"> {{ points.length }}</div>
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
import MessageModal from "@/components/modal/MessageModal";
import config from "@/config";
import _ from "lodash";
import SimpleInput from "@/components/vuetable/inputs/SimpleInput";

mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;

export default {
  name: 'ShapeEditor',
  components: {
    SimpleInput,
    MessageModal,
  },
  mixins: [
    errorMessageMixin,
    shapeMapMixin,
    envelopeMixin
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
      error: {},
      exitModal: {
        visible: false,
      },
      selectRange: {
        selectedStopFeatures: [
          {id: null},
          {id: null}
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
      if (this.selectRange.selectedStopFeatures[0].id !== null &&
          this.selectRange.selectedStopFeatures[1].id !== null) {
        return this.selectRange.selectedStopFeatures[1].id - this.selectRange.selectedStopFeatures[0].id;
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
      switch (this.localEditionMode) {
        case this.Enums.ShapeEditorEditionMode.SIMPLE:
          if (this.mode === this.Enums.ShapeEditorMode.CREATE) {
            this.changeToCreationMode();
          } else {
            this.changeToEditionMode(this.localShape);
          }
          break;
        case this.Enums.ShapeEditorEditionMode.SELECT_RANGE:
          this.changeToSelectRangeMode(this.localShape);
          break;
        case this.Enums.ShapeEditorEditionMode.DUPLICATE:
          this.changeToDuplicationMode(this.localShape);
          break;
      }
      this.envelope(this.map, this.projectId);
      this.$emit('load');
    });
  },
  beforeDestroy() {
    this.map.remove();
  },
  methods: {
    changeToCreationMode() {
      this.localEditionMode = this.Enums.ShapeEditorEditionMode.SIMPLE;
      this.localShape = {
        id: null,
        shape_id: null,
        points: []
      };
      this.mapMatching = true;
      this.setSourceAndLayers();
      this.enableShapeEdition({letExtendShape: true});
    },
    changeToEditionMode(shape) {
      this.localEditionMode = this.Enums.ShapeEditorEditionMode.SIMPLE;
      this.setShapeData(shape);
      this.setSourceAndLayers();
      this.points.forEach(stop => {
        this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {editable: true});
        this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {editable: true});
      });
      this.enableShapeEdition({letExtendShape: true});
    },
    changeToSelectRangeMode(shape) {
      this.setShapeData(shape);
      this.setSourceAndLayers();

      this.map.on('mouseenter', 'shape-points-layer', this.selectRangeMouseEnter);
      this.map.on('mousemove', 'shape-points-layer', this.selectRangeMouseMove);
      this.map.on('mouseleave', 'shape-points-layer', this.selectRangeMouseLeave);
      this.map.on('click', 'shape-points-layer', this.selectRangeClick);
    },
    changeToDuplicationMode(shape) {
      this.localEditionMode = this.Enums.ShapeEditorEditionMode.DUPLICATE;
      this.localShape.id = null;
      this.localShape.shape_id = this.$t('shape.editor.duplicationPrefix') + this.localShape.shape_id;
      this.setShapeData(shape);
      this.setSourceAndLayers();

      this.points.forEach(stop => {
        this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {editable: true});
        this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {editable: true});
      });
      this.enableShapeEdition({letExtendShape: true});
    },
    generateGeojsonPoint(point, properties) {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.lng, point.lat]
        },
        properties: !properties ? {} : properties,
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
      this.geojson.points.features = this.points.map(this.generateGeojsonPoint);
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

      // Circles for shape points
      this.map.addLayer({
        id: 'shape-points-layer',
        type: 'circle',
        source: 'shape-points-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            12, [
              'case',
              ['boolean', ['feature-state', 'hover'], false], 5,
              ['boolean', ['feature-state', 'selected'], false], 5,
              1.5
            ],
            20, [
              'case',
              ['boolean', ['feature-state', 'hover'], false], 5,
              ['boolean', ['feature-state', 'selected'], false], 5,
              3
            ]
          ],
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false], '#7DC242',
            ['boolean', ['feature-state', 'frozen'], false], '#AAB9BE',
            ['boolean', ['feature-state', 'editable'], false], '#FFFFFF',
            ['boolean', ['feature-state', 'selected'], false], '#7DC242',
            ['boolean', ['feature-state', 'between'], false], '#FFFFFF',
            '#FFFFFF'
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false], '#7DC242',
            ['boolean', ['feature-state', 'editable'], false], '#d67515',
            ['boolean', ['feature-state', 'selected'], false], '#7DC242',
            ['boolean', ['feature-state', 'between'], false], '#7DC242',
            '#d67515',
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
        'id': 'mapmatching-line-layer',
        'type': 'line',
        'source': 'mapmatching-line-source',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': config.map_matching_color,
          'line-width': 4
        }
      });

      // Line for the shape itself
      this.map.addLayer({
        'id': 'shape-lines-layer',
        'type': 'line',
        'source': 'shape-lines-source',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'editable'], false], '#d67515',
            ['boolean', ['feature-state', 'frozen'], false], '#AAB9BE',
            ['boolean', ['feature-state', 'between'], false], '#7DC242',
            '#d67515'
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'editable'], false], 4,
            2
          ]
        }
      }, 'shape-points-layer');

      // Arrow for the shape-lines-layer layer
      let img = require('../../assets/img/double-arrow.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('double-arrow', image, {sdf: true});
        this.map.addLayer({
          'id': 'shape-lines-arrow',
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
              ['boolean', ['feature-state', 'editable'], false], '#d67515',
              ['boolean', ['feature-state', 'frozen'], false], '#AAB9BE',
              ['boolean', ['feature-state', 'between'], false], '#7DC242',
              '#d67515'
            ],
            'icon-halo-color': '#FFFFFF',
            'icon-halo-width': 2,
          }
        }, 'shape-points-layer');

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
            'icon-halo-color': "#FFFFFF",
            'icon-halo-width': 2,
          }
        });
      });
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
        let points = this.points;
        if (this.localEditionMode === this.Enums.ShapeEditorEditionMode.EDIT_RANGE) {
          points = points.filter(point => this.map.getFeatureState({
            source: 'shape-points-source',
            id: point.id
          }).editable);
        }

        if (points.length > 100) {
          this.warning = "Mapmatching not available with >100 points";
          this.geojson.mapMatchingLine.geometry.coordinates = [];
          this.map.getSource('mapmatching-line-source').setData(this.geojson.mapMatchingLine);
          return;
        } else if (points.length < 2) {
          return;
        }
        mapMatching.match(points).then(response => {
          if (response.data.code !== "Ok") {
            console.log(response.data);
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
        }).catch(err => {
          console.log(err.response.data);
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
      this.geojson.points.features = this.points.map(this.generateGeojsonPoint);
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
        coords = coords.map(coord => {
          let id = this.id++;
          ids.push(id);
          return {
            id: id,
            lng: coord[0],
            lat: coord[1],
          }
        });
        if (this.localEditionMode === this.Enums.ShapeEditorEditionMode.EDIT_RANGE) {
          // remove first and last point (because they can not be modified)
          coords = coords.slice(1, coords.length - 1);
          // find position of first and last points in editing range
          let firstIndex = this.points.findIndex(stop => stop.id === this.selectRange.selectedStopFeatures[0].id);
          let lastIndex = this.points.findIndex(stop => stop.id === this.selectRange.selectedStopFeatures[1].id);
          // concatenate first part static points + new points + last part of static points
          this.points = [
            ...this.points.slice(0, firstIndex + 1),
            ...coords,
            ...this.points.slice(lastIndex, this.points.length)
          ];
        } else {
          this.points = coords;
        }
        this.mapMatching = false;
        this.reGeneratePoints();
        ids.forEach(id => {
          this.map.setFeatureState({source: 'shape-points-source', id: id}, {editable: true});
          this.map.setFeatureState({source: 'shape-lines-source', id: id}, {editable: true});
        });
      }
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
          this.error = err.response.data;
        });
      } else {
        data.id = this.localShape.id;
        shapesAPI.shapesAPI.put(this.projectId, data).then(() => {
          this.$router.push({name: "Shapes", params: {projectId: this.projectId}});
        }).catch(err => {
          console.log(err.response);
          this.error = err.response.data;
        });
      }
    },
    setBetweenData() {
      // clean previous points
      this.selectRange.stopsInBetween.forEach(stop => {
        this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {selected: false});
        this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {between: false});
        this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {between: false});
      });
      this.selectRange.stopsInBetween = [];

      let firstPoint = this.selectRange.selectedStopFeatures[0];
      let lastPoint = this.selectRange.selectedStopFeatures[1];
      if (!firstPoint.id || !lastPoint.id) {
        console.warn('points are not defined yet');
        return;
      }

      this.points.forEach(stop => {
        if (firstPoint.id <= stop.id && stop.id <= lastPoint.id) {
          this.selectRange.stopsInBetween.push(stop);
          if ([firstPoint.id, lastPoint.id].includes(stop.id)) {
            this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {selected: true});
          } else {
            this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {between: true});
          }
          if (stop.id !== lastPoint.id) {
            this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {between: true});
          }
        }
      });

    },
    /************************************************************
     * Events for select range mode
     * **********************************************************/
    selectRangeMouseEnter(e) {
      let feature = e.features[0];
      this.selectRange.hoveredStops.add(feature.id);
      this.map.getCanvas().style.cursor = 'pointer';
      this.map.setFeatureState({source: 'shape-points-source', id: feature.id,}, {hover: true});
    },
    selectRangeMouseMove(e) {
      let features = this.map.queryRenderedFeatures(e.point);
      let currentHoveredStops = new Set();
      features.forEach(feature => {
        if (feature.layer.id === 'shape-points-layer') {
          this.selectRange.hoveredStops.add(feature.id);
          currentHoveredStops.add(feature.id);
          this.map.setFeatureState({source: 'shape-points-source', id: feature.id,}, {hover: true});
        }
      });
      this.selectRange.hoveredStops.forEach(featureId => {
        if (!currentHoveredStops.has(featureId)) {
          this.map.setFeatureState({source: 'shape-points-source', id: featureId}, {hover: false});
        }
      });
    },
    selectRangeMouseLeave() {
      this.map.getCanvas().style.cursor = '';
      this.selectRange.hoveredStops.forEach(featureId => {
        this.map.setFeatureState({source: 'shape-points-source', id: featureId}, {hover: false});
      });
    },
    selectRangeClick(e) {
      let feature = e.features[0];
      let indexToChange = null;

      if (this.selectRange.selectedStopFeatures[0].id === null) {
        indexToChange = 0;
      } else if (this.selectRange.selectedStopFeatures[1].id === null) {
        if (this.selectRange.selectedStopFeatures[0].id > feature.id) {
          let tmp = this.selectRange.selectedStopFeatures[0];
          this.$set(this.selectRange.selectedStopFeatures, 0, feature);
          feature = tmp;
        }
        indexToChange = 1;
      } else {
        // unselect previous selected points
        let previousFirstFeatureId = this.selectRange.selectedStopFeatures[0].id;
        let previousSecondFeatureId = this.selectRange.selectedStopFeatures[1].id;
        this.map.setFeatureState({source: 'shape-points-source', id: previousFirstFeatureId}, {selected: false});
        this.map.setFeatureState({source: 'shape-points-source', id: previousSecondFeatureId}, {selected: false});

        this.$set(this.selectRange.selectedStopFeatures, 1, {id: null, properties: {sequence: null}});
        indexToChange = 0;
      }

      this.$set(this.selectRange.selectedStopFeatures, indexToChange, feature);
      this.map.setFeatureState({source: 'shape-points-source', id: feature.id}, {selected: true});

      this.setBetweenData();
    },
    changeToEditRange() {
      this.localEditionMode = this.Enums.ShapeEditorEditionMode.EDIT_RANGE;

      // disable previous listeners of select range mode
      this.map.off('mouseenter', 'shape-points-layer', this.selectRangeMouseEnter);
      this.map.off('mousemove', 'shape-points-layer', this.selectRangeMouseMove);
      this.map.off('mouseleave', 'shape-points-layer', this.selectRangeMouseLeave);
      this.map.off('click', 'shape-points-layer', this.selectRangeClick);

      // set style to edit range
      this.points.forEach(stop => {
        if ([this.firstSelectedPoint.id, this.endSelectedPoint.id].includes(stop.id)) {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {editable: true});
          if (stop.id === this.firstSelectedPoint.id) {
            this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {editable: true});
          } else {
            this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {frozen: true});
          }
        } else if (this.firstSelectedPoint.id < stop.id && stop.id < this.endSelectedPoint.id) {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {editable: true});
          this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {editable: true});
        } else {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {frozen: true});
          this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {frozen: true});
        }
      });

      this.enableShapeEdition();
    },
    enableShapeEdition(options) {
      let defaultOptions = {
        letExtendShape: false
      };
      options = _.assign({}, defaultOptions, options);

      // set moving point source and layer
      this.map.addSource('moving-point-source', {
        'type': 'geojson',
        'data': this.geojson.movingPoint,
      });

      this.map.addLayer({
        id: 'moving-point-layer',
        type: 'circle',
        source: 'moving-point-source',
        layout: {
          'visibility': 'none'
        },
        paint: {
          'circle-radius': 5,
          'circle-color': '#7DC242',
          'circle-stroke-color': '#7DC242',
          'circle-stroke-opacity': 1,
          'circle-stroke-width': 3
        }
      });

      // add new map behaviour

      // logic for line
      let hoveredStops = new Set();

      this.map.on('dblclick', 'shape-lines-layer', e => {
        // disable zoom with double click over line
        e.preventDefault();
      });

      // when click on a line we add a point in there between the ends
      this.map.on('click', 'shape-lines-layer', e => {
        let feature = e.features[0];
        if (this.map.queryRenderedFeatures(e.point).filter(feature => feature.layer.id === 'shape-points-layer').length > 0 ||
            !this.map.getFeatureState({source: 'shape-lines-source', id: feature.id}).editable) {
          return;
        }
        let newStop = {
          ...e.lngLat,
          id: this.id++,
        }
        this.points.splice(this.getPointIndex(feature.properties.to), 0, newStop);
        this.reGeneratePoints();
        // set point status
        this.map.setFeatureState({source: 'shape-points-source', id: newStop.id}, {editable: true});
        this.map.setFeatureState({source: 'shape-points-source', id: newStop.id}, {hover: true});
        // set line status
        this.map.setFeatureState({source: 'shape-lines-source', id: newStop.id}, {editable: true});
        hoveredStops.add(newStop.id);
        this.map.getCanvas().style.cursor = 'move';
      });

      this.map.on('mouseenter', 'shape-lines-layer', e => {
        let feature = e.features[0];
        let isEditable = this.map.getFeatureState({source: 'shape-lines-source', id: feature.id}).editable;
        if (hoveredStops.size === 0 && isEditable) {
          this.map.getCanvas().style.cursor = 'copy';
        }
      });

      this.map.on('mouseleave', 'shape-lines-layer', () => {
        this.map.getCanvas().style.cursor = '';
      });

      // logic for point

      this.map.on('dblclick', 'shape-points-layer', e => {
        // disable zoom with double click over line
        e.preventDefault();
      });

      this.map.on('contextmenu', 'shape-points-layer', e => {
        let feature = e.features[0];
        let isEditable = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).editable;
        let isSelected = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).selected;
        if (!isEditable || isSelected) {
          return;
        }
        // remove point
        this.points = this.points.filter(point => point.id !== feature.id);
        this.reGeneratePoints();
        hoveredStops.delete(feature.id);
        if (this.map.queryRenderedFeatures(e.point).filter(feature => feature.layer.id === 'shape-lines-layer').length > 0) {
          this.map.getCanvas().style.cursor = 'copy';
        } else {
          this.map.getCanvas().style.cursor = '';
        }
      });

      this.map.on('mouseenter', 'shape-points-layer', e => {
        let feature = e.features[0];
        let isEditable = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).editable;
        let isSelected = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).selected;
        if (isEditable && !isSelected) {
          hoveredStops.add(feature.id);
          this.map.setFeatureState({source: 'shape-points-source', id: feature.id}, {hover: true});
          this.map.getCanvas().style.cursor = 'move';
        }
      });

      this.map.on('mousemove', 'shape-points-layer', e => {
        let features = this.map.queryRenderedFeatures(e.point);
        let currentHoveredStops = new Set();
        features.forEach(feature => {
          if (feature.id) {
            let isEditable = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).editable;
            let isSelected = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).selected;
            if (isEditable && feature.layer.id === 'shape-points-layer' && !isSelected) {
              hoveredStops.add(feature.id);
              currentHoveredStops.add(feature.id);
              this.map.setFeatureState({source: 'shape-points-source', id: feature.id,}, {hover: true});
            }
          }
        });
        hoveredStops.forEach(featureId => {
          if (!currentHoveredStops.has(featureId)) {
            this.map.setFeatureState({source: 'shape-points-source', id: featureId}, {hover: false});
          }
        });
      });

      this.map.on('mouseleave', 'shape-points-layer', () => {
        this.map.getCanvas().style.cursor = '';
        hoveredStops.forEach(featureId => {
          this.map.setFeatureState({source: 'shape-points-source', id: featureId}, {hover: false});
        });
        hoveredStops = new Set();
      });

      this.map.on('mousedown', 'shape-points-layer', eDown => {
        // Prevent the default map drag behavior.
        eDown.preventDefault();

        // only works when user raises mousedown event with left click
        if (eDown.originalEvent.button !== 0) {
          return;
        }
        let feature = eDown.features[0]
        let isEditable = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).editable;
        let isSelected = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).selected;
        if (!isEditable || isSelected) {
          return;
        }
        this.map.getCanvas().style.cursor = 'grab';

        this.geojson.movingPoint.geometry.coordinates = [];
        this.map.getSource('moving-point-source').setData(this.geojson.movingPoint);
        this.map.setLayoutProperty('moving-point-layer', 'visibility', 'visible');
        this.map.setFilter('shape-points-layer', ['!=', ['id'], feature.id]);

        let mouseMove = eMove => {
          this.geojson.movingPoint.geometry.coordinates = [eMove.lngLat.lng, eMove.lngLat.lat];
          this.map.getSource('moving-point-source').setData(this.geojson.movingPoint);
          this.map.getCanvas().style.cursor = 'grabbing';
        }
        this.map.on('mousemove', mouseMove);

        this.map.once('mouseup', eUp => {
          if (!_.isEqual(eUp.lngLat, eDown.lngLat)) {
            this.updatePoint(feature, eUp.lngLat);
            this.map.getCanvas().style.cursor = '';
          }
          this.map.off('mousemove', mouseMove);
          this.map.setLayoutProperty('moving-point-layer', 'visibility', 'none');
          this.map.setFilter('shape-points-layer', null);
        });
      });

      if (options.letExtendShape) {
        this.map.on('dblclick', e => {
          // disable zoom with double click
          e.preventDefault();
          if (this.map.queryRenderedFeatures(e.point).filter(
              feature => ['shape-points-layer', 'shape-lines-layer'].includes(feature.layer.id)).length > 0) {
            return;
          }
          let newStop = {
            ...e.lngLat,
            id: this.id++,
          };
          this.points.push(newStop);
          this.reGeneratePoints();
          // set point status
          this.map.setFeatureState({source: 'shape-points-source', id: newStop.id}, {editable: true});
          this.map.setFeatureState({source: 'shape-points-source', id: newStop.id}, {hover: true});
          hoveredStops.add(newStop.id);
          // set line status
          this.map.setFeatureState({source: 'shape-lines-source', id: newStop.id}, {editable: true});
          this.map.getCanvas().style.cursor = 'move';
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
