<template>
  <div ref="map" class="map">
  </div>
</template>

<script>
import shapesAPI from "@/api/shapes.api";
import shapeMapMixin from "@/mixins/shapeMapMixin";
import envelopeMixin from "@/mixins/envelopeMixin";
import config from "@/config";

const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;

export default {
  name: "ShapesMap",
  mixins: [
    shapeMapMixin,
    envelopeMixin,
  ],
  data: function () {
    return {
      geojson: {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': []
        }
      },
      pointsGeojson: {
        type: 'FeatureCollection',
        features: []
      },
    };
  },
  props: {
    project: {
      required: true,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.map = new mapboxgl.Map({
        container: this.$refs.map,
        style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
      });
      this.map.on('load', () => {
        this.envelope(this.map, this.project);
        this.addLayers();
        this.$emit('load');
      })
    });
  },
  methods: {
    addLayers() {
      this.map.addSource('shape', {
        'type': 'geojson',
        'data': this.geojson,
      });
      this.map.addSource('shape-pts', {
        'type': 'geojson',
        'data': this.pointsGeojson,
      });
      this.map.addLayer({
        id: 'shape-layer',
        type: 'line',
        source: 'shape',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': config.shape_line_color,
          'line-width': 2
        }
      });
      this.map.addLayer({
        id: "shape-circle-layer",
        type: "circle",
        source: "shape-pts",
        paint: {
          "circle-radius": ['interpolate', ['linear'], ['zoom'],].concat(config.shape_point_zoom),
          "circle-color": "white",
          "circle-stroke-color": config.shape_point_color,
          "circle-stroke-opacity": 1,
          "circle-stroke-width": 3
        }
      });
      this.map.addLayer({
        id: "shape-label-layer",
        type: "symbol",
        source: "shape-pts",
        minzoom: 16,
        layout: {
          "text-field": "{label}",
          "text-anchor": "top",
          "text-offset": [0, 0.6],
          "text-allow-overlap": true,
        }
      });
      let img = require('../../assets/img/double-arrow.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('double-arrow', image, {sdf: true});
        this.map.addLayer({
          'id': 'arrowId',
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
            'icon-color': config.shape_line_color,
            'icon-halo-color': "#fff",
            'icon-halo-width': 2
          }
        });
      });
      this.map.on('click', 'shape-circle-layer', (evt) => {
        let feature = evt.features[0];
        if (this.selectingRange) {
          this.range.push(feature.properties.label);
          if (this.range.length === 2) {
            this.$emit("selected-range", {start: this.range[0], finish: this.range[1],})
            this.selectingRange = false;
          }
        }
      })
    },
    beginRangeSelection() {
      this.selectingRange = true;
      this.range = [];
    },
    displayShape(shape) {
      shapesAPI.shapesAPI.detail(this.project, shape.id).then(response => {
        let points = response.data.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
        this.pointsGeojson.features = response.data.points.map(point => {
          let coordinates = [
            point.shape_pt_lon,
            point.shape_pt_lat,
          ];
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates,
            },
            properties: {
              label: point.shape_pt_sequence,
            }
          }
        })
        this.map.getSource('shape-pts').setData(this.pointsGeojson);
        this.setShapeCoordinates(points);
      }).catch(err => console.log(err));
    },
    setShapeCoordinates(points) {
      this.geojson.geometry.coordinates = points;
      this.map.getSource('shape').setData(this.geojson);
      this.map.fitBounds(this.getBounds(points), {
        padding: 50,
      });
    },
  },
};
</script>
