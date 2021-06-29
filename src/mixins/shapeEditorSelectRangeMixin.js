import _ from 'lodash';


let shapeEditorSelectRangeMixin = {
  methods: {
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

      for (let i = firstPoint.properties.sequence; i <= lastPoint.properties.sequence; i++) {
        let stop = this.points[i];
        this.selectRange.stopsInBetween.push(stop);
        if ([firstPoint.properties.sequence, lastPoint.properties.sequence].includes(i)) {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {selected: true});
        } else {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {between: true});
        }
        if (i !== lastPoint.properties.sequence) {
          this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {between: true});
        }
      }
    },
    changeToSelectRange(shape) {
      this.setShapeData(shape);
      this.setSourceAndLayers();

      this.map.on('mouseenter', 'point-layer', this.selectRangeMouseEnter);
      this.map.on('mousemove', 'point-layer', this.selectRangeMouseMove);
      this.map.on('mouseleave', 'point-layer', this.selectRangeMouseLeave);
      this.map.on('click', 'point-layer', this.selectRangeClick);
    },
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
        if (feature.layer.id === 'point-layer') {
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

      if (this.selectRange.selectedStopFeatures[0].properties.sequence === null) {
        indexToChange = 0;
      } else if (this.selectRange.selectedStopFeatures[1].properties.sequence === null) {
        if (this.selectRange.selectedStopFeatures[0].properties.sequence > feature.properties.sequence) {
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
      // disable previous events
      this.map.off('mouseenter', 'point-layer', this.selectRangeMouseEnter);
      this.map.off('mousemove', 'point-layer', this.selectRangeMouseMove);
      this.map.off('mouseleave', 'point-layer', this.selectRangeMouseLeave);
      this.map.off('click', 'point-layer', this.selectRangeClick);

      // set style to edit range
      for (let i = 0; i < this.points.length; i++) {
        let stop = this.points[i];
        if ([this.firstSelectedPoint.properties.sequence, this.endSelectedPoint.properties.sequence].includes(i)) {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {editable: true});
          if (i === this.firstSelectedPoint.properties.sequence) {
            this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {editable: true});
          } else {
            this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {frozen: true});
          }
        } else if (this.firstSelectedPoint.properties.sequence < i && i < this.endSelectedPoint.properties.sequence) {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {editable: true});
          this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {editable: true});
        } else {
          this.map.setFeatureState({source: 'shape-points-source', id: stop.id}, {frozen: true});
          this.map.setFeatureState({source: 'shape-lines-source', id: stop.id}, {frozen: true});
        }
      }

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

      this.map.on('dblclick', 'point-line-layer', e => {
        // disable zoom with double click over line
        e.preventDefault();
      });

      // when click on a line we add a point in there between the ends
      this.map.on('click', 'point-line-layer', e => {
        let feature = e.features[0];
        if (this.map.queryRenderedFeatures(e.point).filter(feature => feature.layer.id === 'point-layer').length > 0 ||
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

      this.map.on('mouseenter', 'point-line-layer', e => {
        let feature = e.features[0];
        let isEditable = this.map.getFeatureState({source: 'shape-lines-source', id: feature.id}).editable;
        if (hoveredStops.size === 0 && isEditable) {
          this.map.getCanvas().style.cursor = 'copy';
        }
      });

      this.map.on('mouseleave', 'point-line-layer', () => {
        this.map.getCanvas().style.cursor = '';
      });

      // logic for point

      this.map.on('dblclick', 'point-layer', e => {
        // disable zoom with double click over line
        e.preventDefault();
      });

      this.map.on('contextmenu', 'point-layer', e => {
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
        if (this.map.queryRenderedFeatures(e.point).filter(feature => feature.layer.id === 'point-line-layer').length > 0) {
          this.map.getCanvas().style.cursor = 'copy';
        } else {
          this.map.getCanvas().style.cursor = '';
        }
      });

      this.map.on('mouseenter', 'point-layer', e => {
        let feature = e.features[0];
        let isEditable = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).editable;
        let isSelected = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).selected;
        if (isEditable && !isSelected) {
          hoveredStops.add(feature.id);
          this.map.setFeatureState({source: 'shape-points-source', id: feature.id}, {hover: true});
          this.map.getCanvas().style.cursor = 'move';
        }
      });

      this.map.on('mousemove', 'point-layer', e => {
        let features = this.map.queryRenderedFeatures(e.point);
        let currentHoveredStops = new Set();
        features.forEach(feature => {
          if (feature.id) {
            let isEditable = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).editable;
            let isSelected = this.map.getFeatureState({source: 'shape-points-source', id: feature.id}).selected;
            if (isEditable && feature.layer.id === 'point-layer' && !isSelected) {
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

      this.map.on('mouseleave', 'point-layer', () => {
        this.map.getCanvas().style.cursor = '';
        hoveredStops.forEach(featureId => {
          this.map.setFeatureState({source: 'shape-points-source', id: featureId}, {hover: false});
        });
        hoveredStops = new Set();
      });

      this.map.on('mousedown', 'point-layer', eDown => {
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
        this.map.setFilter('point-layer', ['!=', ['id'], feature.id]);

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
          this.map.setFilter('point-layer', null);
        });
      });

      if (options.letExtendShape) {
        this.map.on('dblclick', e => {
          // disable zoom with double click
          e.preventDefault();
          if (this.map.queryRenderedFeatures(e.point).filter(
            feature => ['point-layer', 'point-line-layer'].includes(feature.layer.id)).length > 0) {
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
  }
};

export default shapeEditorSelectRangeMixin;
