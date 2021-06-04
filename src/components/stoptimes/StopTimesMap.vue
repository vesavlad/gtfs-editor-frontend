<template>
  <div id="map" class="map"></div>
</template>

<script>
import tripsAPI from "@/api/trips.api";
import stopsAPI from "@/api/stops.api";
import shapesAPI from "@/api/shapes.api";
import envelopeMixin from "@/mixins/envelopeMixin"
import config from "@/config.js"

const mapboxgl = require('mapbox-gl');
mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;

export default {
  name: "SopTimesMap",
  mixins: [
    envelopeMixin,
  ],
  data: function () {
    return {
      shapeGeojson: {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': []
        }
      },
      stopsGeojson: {
        type: 'FeatureCollection',
        features: []
      },
      stops: {},
    };
  },
  props: {
    projectId: {
      required: true,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
      });
      this.map.on('load', () => {
        this.envelope(this.map, this.projectId);
        this.addShapeLayers();
        this.addStopLayers();
        this.loadStops();
        this.$emit('load');
      });
    });
  },
  methods: {
    loadStops() {
      stopsAPI.stopsAPI.getAll(this.projectId).then(response => {
        let stops = response.data;
        stops.forEach(stop => {
          this.stops[stop.id] = stop;
        });
        this.stopsGeojson.features = stops.map(this.generateStopGeoJson);
        this.map.getSource('stops-source').setData(this.stopsGeojson);
      });
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
          id: stop.id,
          label: stop.stop_id + (stop.stop_code ? ` (${stop.stop_code})` : ""),
          selected: false,
        }
      }
    },
    addShapeLayers() {
      this.map.addSource('shape-source', {
        'type': 'geojson',
        'data': this.shapeGeojson,
      });
      this.map.addLayer({
        'id': 'shape-layer',
        'type': 'line',
        'source': 'shape-source',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': config.shape_line_color,
          'line-width': 2
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
          'id': 'shape-arrow-layer',
          'type': 'symbol',
          'source': 'shape-source',
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
        });
      });
    },
    addStopLayers() {
      this.map.addSource('stops-source', {
        'type': 'geojson',
        'data': this.stopsGeojson,
      });

      this.map.addLayer({
        id: "layer-stops-icon",
        type: "circle",
        source: "stops-source",
        filter: ["==", "selected", true],
        paint: {
          "circle-radius": ['interpolate', ['linear'], ['zoom'],].concat(config.stoptimes_stop_zoom),
          "circle-color": config.stop_color
        }
      });
      this.map.addLayer({
        id: "layer-stops-seq",
        type: "symbol",
        source: "stops-source",
        filter: ["==", "selected", true],
        minzoom: 14,
        layout: {
          "text-field": "seq:{sequence}",
          "text-anchor": "top",
          "text-offset": [0, -0.5],
          "text-allow-overlap": true,
        }
      });
      this.map.addLayer({
        id: "layer-stops-label",
        type: "symbol",
        source: "stops-source",
        filter: ["==", "selected", true],
        minzoom: 16,
        layout: {
          "text-field": "{label}",
          "text-anchor": "top",
          "text-offset": [0, 0.5],
          "text-allow-overlap": true,
        }
      });
    },
    displayTrip(trip) {
      tripsAPI.tripsAPI.detail(this.projectId, trip.id).then(response => {
        let data = response.data;
        if (data.shape) {
          this.displayShape(data.shape);
        }
        let stop_ids = response.data.stop_times.map(st => st.stop);
        this.stopsGeojson.features = this.stopsGeojson.features.map(feature => {
          feature.properties.selected = stop_ids.includes(feature.properties.id);
          return feature;
        });
        this.map.getSource('stops-source').setData(this.stopsGeojson);
        let coordinates = response.data.stop_times.map(st => st.stop).map(id => {
          let stop = this.stops[id];
          return [stop.stop_lon, stop.stop_lat];
        });
        if (coordinates.length > 0) {
          let bounds = coordinates.reduce(function (bounds, coord) {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          this.map.fitBounds(bounds, {
            padding: 20,
          });
        }

      });
    },
    displayShape(shape) {
      shapesAPI.shapesAPI.detail(this.projectId, shape).then(response => {
        let points = response.data.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
        this.shapeGeojson.geometry.coordinates = points;
        this.map.getSource('shape-source').setData(this.shapeGeojson);
      }).catch(err => console.log(err));
    },
  },
};
</script>
