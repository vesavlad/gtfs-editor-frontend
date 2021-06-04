<template>
  <div id="map" class="map" ref="mapContainer"></div>
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
      geojson: {
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
      let map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
      });
      this.map = map;
      map.on('load', () => {
        this.addLayers();
        this.$emit('load');
        this.envelope(this.map, this.projectId);
        stopsAPI.stopsAPI.getAll(this.projectId).then((response) => {
          let stops = response.data;
          stops.forEach(stop => {
            this.stops[stop.id] = stop;
          });
          this.stopsGeojson.features = stops.map(this.generateStopGeoJson);
          this.map.getSource('stops').setData(this.stopsGeojson);
        });
      });
    });
  },
  methods: {
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
    addLayers() {
      this.map.addSource('shape', {
        'type': 'geojson',
        'data': this.geojson,
      });
      this.map.addSource('stops', {
        'type': 'geojson',
        'data': this.stopsGeojson,
      });
      this.map.addLayer({
        'id': 'shape-layer',
        'type': 'line',
        'source': 'shape',
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
        this.map.addImage('double-arrow', image);
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
          }
        });
      });
      this.map.addLayer({
        id: "layer-stops-icon",
        type: "circle",
        source: "stops",
        filter: ["==", "selected", "selected"],
        paint: {
          "circle-radius": ['interpolate', ['linear'], ['zoom'],].concat(config.stoptimes_stop_zoom),
          "circle-color": config.stop_selected_color
        }
      });
      this.map.addLayer({
        id: "layer-stops-seq",
        type: "symbol",
        source: "stops",
        filter: ["==", "selected", "selected"],
        minzoom: 14,
        layout: {
          "text-field": "Seq: {sequence}",
          "text-anchor": "top",
          "text-offset": [0, -0.5],
          "text-allow-overlap": true,
        }
      });
      this.map.addLayer({
        id: "layer-stops-label",
        type: "symbol",
        source: "stops",
        filter: ["==", "selected", "selected"],
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
        console.log(response);
        let data = response.data;
        if (data.shape) {
          this.displayShape(data.shape);
        }
        let stop_ids = response.data.stop_times.map(st => st.stop);
        this.stopsGeojson.features = this.stopsGeojson.features.map(feature => {
          feature.properties.selected = stop_ids.includes(feature.properties.id) ? 'selected' : false;
          return feature;
        });
        this.map.getSource('stops').setData(this.stopsGeojson);
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
        this.geojson.geometry.coordinates = points;
        this.map.getSource('shape').setData(this.geojson);
      }).catch(err => console.log(err));
    },
  },
};
</script>
