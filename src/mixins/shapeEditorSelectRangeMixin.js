import config from "@/config";

let shapeEditorSelectRangeMixin = {
  computed: {
    firstSelectedPointSequence() {
      let firstPoint = this.selectRange.selectedStopFeatures[0];
      let lastPoint = this.selectRange.selectedStopFeatures[1];
      if (firstPoint.properties.sequence > lastPoint.properties.sequence) {
        return lastPoint.properties.sequence;
      }
      return firstPoint.properties.sequence;
    },
    endSelectedPointSequence() {
      let firstPoint = this.selectRange.selectedStopFeatures[0];
      let lastPoint = this.selectRange.selectedStopFeatures[1];
      if (firstPoint.properties.sequence > lastPoint.properties.sequence) {
        return firstPoint.properties.sequence;
      }
      return lastPoint.properties.sequence;
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
        stopsInBetween: []
      }
    }
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
        this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {between: false});
      });
      this.selectRange.stopsInBetween = [];

      let pointsForLine = [];
      for (let i = firstPoint.properties.sequence; i <= lastPoint.properties.sequence; i++) {
        let stop = this.selectRange.points[i];
        this.selectRange.stopsInBetween.push(stop);
        this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {between: true});
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
          'line-width': 1
        }
      });

      // Circles for the points
      this.map.addLayer({
        id: 'point-layer',
        type: 'circle',
        source: 'shape-points-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],].concat(config.shape_point_zoom),
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'between'], false], 'red',
            ['boolean', ['feature-state', 'selected'], false], '#21b0cf',
            ['boolean', ['feature-state', 'hover'], false], config.shape_fixed_line_color,
            'white'
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#21b0cf',
            ['boolean', ['feature-state', 'hover'], false], config.shape_fixed_line_color,
            config.shape_line_color,
          ],
          'circle-stroke-opacity': 1,
          'circle-stroke-width': 3
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
            'icon-color': 'red',
            'icon-halo-color': '#fff',
            'icon-halo-width': 2,
          }
        }, 'point-layer');
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
          'line-color': 'red',
          'line-width': 2
        }
      });

      let hoveredStops = {};
      let canvas = this.map.getCanvas();
      this.map.on('mouseenter', 'point-layer', e => {
        let feature = e.features[0];
        hoveredStops[feature.id] = feature;
        canvas.style.cursor = 'pointer';
        this.map.setFeatureState({source: 'shape-points-source', id: feature.id,}, {hover: true});
      });

      this.map.on('mousemove', 'point-layer', e => {
        let features = this.map.queryRenderedFeatures(e.point);
        let currentHoveredStops = {};
        features.forEach(feature => {
          if (feature.layer.id === 'point-layer') {
            hoveredStops[feature.id] = feature;
            currentHoveredStops[feature.id] = feature;
            this.map.setFeatureState({source: 'shape-points-source', id: feature.id,}, {hover: true});
          }
        });
        Object.keys(hoveredStops).forEach(featureId => {
          if (!Object.keys(currentHoveredStops).includes(featureId)) {
            this.map.setFeatureState({source: 'shape-points-source', id: featureId}, {hover: false});
          }
        });
      });

      this.map.on('mouseleave', 'point-layer', () => {
        canvas.style.cursor = '';
        Object.keys(hoveredStops).forEach(featureId => {
          this.map.setFeatureState({source: 'shape-points-source', id: featureId}, {hover: false});
        });
      });

      // we use just two points
      let lastUsedIndex = 0;
      this.map.on('click', 'point-layer', e => {
        // unselect previous point
        let previousFeatureId = this.selectRange.selectedStopFeatures[lastUsedIndex].id;
        this.map.setFeatureState({source: 'shape-points-source', id: previousFeatureId}, {selected: false});
        let feature = e.features[0];
        this.$set(this.selectRange.selectedStopFeatures, lastUsedIndex, feature);
        this.map.setFeatureState({source: 'shape-points-source', id: feature.id}, {selected: true});
        lastUsedIndex = lastUsedIndex ? 0 : 1;
        this.setBetweenData();
      });
    },
  }
};

export default shapeEditorSelectRangeMixin;