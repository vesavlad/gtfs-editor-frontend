import config from "@/config";

let shapeEditorSelectRangeMixin = {
  computed: {
    firstSelectedPoint() {
      let firstPoint = this.selectRange.selectedStopFeatures[0];
      let lastPoint = this.selectRange.selectedStopFeatures[1];
      if (firstPoint.properties.sequence > lastPoint.properties.sequence) {
        return lastPoint;
      }
      return firstPoint;
    },
    endSelectedPoint() {
      let firstPoint = this.selectRange.selectedStopFeatures[0];
      let lastPoint = this.selectRange.selectedStopFeatures[1];
      if (firstPoint.properties.sequence > lastPoint.properties.sequence) {
        return firstPoint;
      }
      return lastPoint;
    }
  },
  data() {
    return {
      selectRange: {
        points: null,
        geojsonPoints: {
          type: 'FeatureCollection',
          features: [],
        },
        geojsonLine: {
          type: "FeatureCollection",
          features: []
        },
        geojsonBetweenLine: {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        },
        selectedStopFeatures: [{id: null, properties: {sequence: null}}, {id: null, properties: {sequence: null}}],
        stopsInBetween: [],
        hoveredStops: {},
        lastUsedIndex: 0
      }
    }
  },
  methods: {
    cleanMapFromSelectRangeLogic() {
      this.map.off('mouseenter', 'point-layer', this.selectRangeMouseEnter);
      this.map.off('mousemove', 'point-layer', this.selectRangeMouseMove);
      this.map.off('mouseleave', 'point-layer', this.selectRangeMouseLeave);
      this.map.off('click', 'point-layer', this.selectRangeClick);
      this.map.removeLayer('point-line-layer');
      this.map.removeLayer('point-layer');
      this.map.removeLayer('point-arrow');
      this.map.removeLayer('point-arrow-between-selected-points-layer');
      this.map.removeLayer('line-between-selected-points-layer');
      this.map.removeSource('shape-points-source');
      this.map.removeSource('shape-line-source');
      this.map.removeSource('shape-line-between-source');
    },
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
      this.selectRange.points = [];
      this.selectRange.points = shape.points.map(point => {
        return {
          id: this.id++,
          lat: point.shape_pt_lat,
          lng: point.shape_pt_lon,
        }
      });
      this.selectRange.geojsonPoints.features = this.selectRange.points.map(el => {
        return this.generateGeojsonPoint(el, {sequence: el.id});
      });
      this.selectRange.geojsonLine.features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.selectRange.points.map(p => [p.lng, p.lat])
        },
        properties: {}
      });
    },
    setBetweenData() {
      let firstPoint = this.selectRange.selectedStopFeatures[0];
      let lastPoint = this.selectRange.selectedStopFeatures[1];
      if (!firstPoint.id || !lastPoint.id) {
        console.warn('points are not defined yet');
        return;
      }
      if (firstPoint.properties.sequence > lastPoint.properties.sequence) {
        let aux = firstPoint;
        firstPoint = lastPoint;
        lastPoint = aux;
      }

      this.selectRange.stopsInBetween.forEach(stop => {
        this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {selected: false});
        this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {between: false});
      });
      this.selectRange.stopsInBetween = [];

      let pointsForLine = [];
      for (let i = firstPoint.properties.sequence; i <= lastPoint.properties.sequence; i++) {
        let stop = this.selectRange.points[i];
        this.selectRange.stopsInBetween.push(stop);
        if ([firstPoint.properties.sequence, lastPoint.properties.sequence].includes(i)) {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {selected: true});
        } else {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {between: true});
        }
        pointsForLine.push([stop.lng, stop.lat]);
      }
      this.selectRange.geojsonBetweenLine.geometry.coordinates = pointsForLine;
      this.map.getSource('shape-line-between-source').setData(this.selectRange.geojsonBetweenLine);

      let firstSegment = this.selectRange.points.slice(0, firstPoint.properties.sequence + 1);
      let secondSegment = this.selectRange.points.slice(lastPoint.properties.sequence, this.selectRange.points.length - 1);
      this.selectRange.geojsonLine.features[0].geometry.coordinates = firstSegment.map(stop => [stop.lng, stop.lat]);
      if (this.selectRange.geojsonLine.features.length > 1) {
        if (secondSegment.length > 1) {
          this.selectRange.geojsonLine.features[1].geometry.coordinates = secondSegment.map(stop => [stop.lng, stop.lat]);
        } else {
          this.selectRange.geojsonLine.features.pop();
        }
      } else if (secondSegment.length > 1) {
        this.selectRange.geojsonLine.features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: secondSegment.map(stop => [stop.lng, stop.lat])
          },
          properties: {}
        });
      }
      this.map.getSource('shape-line-source').setData(this.selectRange.geojsonLine);
    },
    changeToSelectRange(shape) {
      this.setShapeData(shape);
      this.map.addSource('shape-points-source', {
        'type': 'geojson',
        'data': this.selectRange.geojsonPoints,
      });

      this.map.addSource('shape-line-source', {
        'type': 'geojson',
        'data': this.selectRange.geojsonLine,
      });

      this.map.addSource('shape-line-between-source', {
        'type': 'geojson',
        'data': this.selectRange.geojsonBetweenLine,
      });

      // Line for the shape itself
      this.map.addLayer({
        'id': 'point-line-layer',
        'type': 'line',
        'source': 'shape-line-source',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': config.shape_line_color,
          'line-width': 2
        }
      });

      // Line for the shape itself
      this.map.addLayer({
        'id': 'line-between-selected-points-layer',
        'type': 'line',
        'source': 'shape-line-between-source',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#7DC242',
          'line-width': 4
        }
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
            ['boolean', ['feature-state', 'selected'], false], '#7DC242',
            ['boolean', ['feature-state', 'between'], false], 'white',
            ['boolean', ['feature-state', 'hover'], false], '#7DC242',
            'white'
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#7DC242',
            ['boolean', ['feature-state', 'between'], false], '#7DC242',
            ['boolean', ['feature-state', 'hover'], false], '#7DC242',
            config.shape_line_color,
          ],
          'circle-stroke-opacity': 1,
          'circle-stroke-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 3,
              ['boolean', ['feature-state', 'between'], false], 3,
              ['boolean', ['feature-state', 'hover'], false], 3,
              2,
          ],
        }
      });

      // Arrow for the shape
      let img = require('../assets/img/double-arrow.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('double-arrow', image, {sdf: true});
        this.map.addLayer({
          'id': 'point-arrow',
          'type': 'symbol',
          'source': 'shape-line-source',
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
            'icon-color': config.shape_line_color,
            'icon-halo-color': '#fff',
            'icon-halo-width': 2,
          }
        }, 'point-layer');

        // Arrow for the line selected

        this.map.addLayer({
          'id': 'point-arrow-between-selected-points-layer',
          'type': 'symbol',
          'source': 'shape-line-between-source',
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
            'icon-color': '#7DC242',
            'icon-halo-color': '#fff',
            'icon-halo-width': 2,
          }
        }, 'point-layer');
      });


      this.map.on('mouseenter', 'point-layer', this.selectRangeMouseEnter);
      this.map.on('mousemove', 'point-layer', this.selectRangeMouseMove);
      this.map.on('mouseleave', 'point-layer', this.selectRangeMouseLeave);
      this.map.on('click', 'point-layer', this.selectRangeClick);
    },
    selectRangeMouseEnter(e) {
      let feature = e.features[0];
      this.selectRange.hoveredStops[feature.id] = feature;
      this.map.getCanvas().style.cursor = 'pointer';
      this.map.setFeatureState({source: 'shape-points-source', id: feature.id,}, {hover: true});
    },
    selectRangeMouseMove(e) {
      let features = this.map.queryRenderedFeatures(e.point);
      let currentHoveredStops = {};
      features.forEach(feature => {
        if (feature.layer.id === 'point-layer') {
          this.selectRange.hoveredStops[feature.id] = feature;
          currentHoveredStops[feature.id] = feature;
          this.map.setFeatureState({source: 'shape-points-source', id: feature.id,}, {hover: true});
        }
      });
      Object.keys(this.selectRange.hoveredStops).forEach(featureId => {
        if (!Object.keys(currentHoveredStops).includes(featureId)) {
          this.map.setFeatureState({source: 'shape-points-source', id: featureId}, {hover: false});
        }
      });
    },
    selectRangeMouseLeave() {
      this.map.getCanvas().style.cursor = '';
      Object.keys(this.selectRange.hoveredStops).forEach(featureId => {
        this.map.setFeatureState({source: 'shape-points-source', id: featureId}, {hover: false});
      });
    },
    selectRangeClick(e) {
      // unselect previous point
      let previousFeatureId = this.selectRange.selectedStopFeatures[this.selectRange.lastUsedIndex].id;
      this.map.setFeatureState({source: 'shape-points-source', id: previousFeatureId}, {selected: false});
      let feature = e.features[0];
      this.$set(this.selectRange.selectedStopFeatures, this.selectRange.lastUsedIndex, feature);
      this.map.setFeatureState({source: 'shape-points-source', id: feature.id}, {selected: true});
      this.selectRange.lastUsedIndex = this.selectRange.lastUsedIndex ? 0 : 1;
      this.setBetweenData();
    }
  }
};

export default shapeEditorSelectRangeMixin;
