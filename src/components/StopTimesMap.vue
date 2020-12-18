<template>
  <div id="map" ref="mapContainer">
  </div>

</template>




<script>
  import tripsAPI from "@/api/trips.api";
  import stopsAPI from "@/api/stops.api";
  import shapesAPI from "@/api/shapes.api";
  import envelopeMixin from "@/mixins/envelopeMixin"
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ';
  export default {
    name: "SopTimesMap",
    components: {},
    mixins: [
      envelopeMixin,
    ],
    data: function () {
      return {
        shapeColor: "#55CCFF",
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
      project: {
        required: true,
      }
    },
    mounted() {
      this.$nextTick(() => {
        let map = new mapboxgl.Map({
          container: this.$refs.mapContainer,
          style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        });
        this.map = map;
        map.on('load', () => {
          this.addLayers();
          this.$emit('load');
          this.envelope(this.map, this.project);
          stopsAPI.stopsAPI.getAll(this.project).then((response) => {
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
            'line-color': this.shapeColor,
            'line-width': 2
          }
        });
        let img = require('../assets/png/arrow-small.png')
        this.map.loadImage(img, (err, image) => {
          if (err) {
            console.log(err);
            return;
          }
          this.map.addImage('arrow', image);
          this.map.addLayer({
            'id': 'arrowId',
            'type': 'symbol',
            'source': 'shape',
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
        this.map.addLayer({
          id: "layer-stops-icon",
          type: "circle",
          source: "stops",
          filter:  ["==", "selected", "selected"],
          paint: {
            "circle-radius": {
              base: 2,
              stops: [
                [12, 1.5],
                [14, 4],
                [20, 180]
              ]
            },
            "circle-color": [
              'match',
              ['get', 'selected'],
              'selected',
              '#FF2222',
              "#2222DD" //default
            ]
          }
        });
        this.map.addLayer({
          id: "layer-stops-label",
          type: "symbol",
          source: "stops",
          filter:  ["==", "selected", "selected"],
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
        tripsAPI.tripsAPI.detail(this.project, trip.id).then(response => {
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
          let coordinates = response.data.stop_times.map(st=>st.stop).map(id => {
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
        shapesAPI.shapesAPI.detail(this.project, shape).then(response => {
          let points = response.data.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
          this.geojson.geometry.coordinates = points;
          this.map.getSource('shape').setData(this.geojson);
        }).catch(err => console.log(err));
      },
    },
  };
</script>