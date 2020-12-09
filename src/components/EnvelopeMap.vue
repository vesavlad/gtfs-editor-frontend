<template>
  <div id="envelopeMap" ref="mapContainer"></div>
</template>

<style scoped>
#envelopeMap {
  width: 300px;
  height: 300px;
}
</style>

<script>
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ';
  export default {
    name: "EnvelopeMap",
    components: {},
    mixins: [],
    props: {
      project: {
        required: true,
      }
    },
    data() {
      return {
        map: null
      };
    },
    mounted() {
        let center = this.project.envelope?this.project.envelope.geometry.coordinates[0][0]:[0,0];
        this.map = new mapboxgl.Map({
          container: this.$refs.mapContainer,
          center: center,
          style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        });
        this.map.on('load', () => {
          this.addLayers();
          this.setCoordinates();
          this.$emit('load');
        })
    },
    methods: {
      addLayers() {
        this.map.addSource('envelope-source', {
          'type': 'geojson',
          'data': this.project.envelope,
        });
        this.map.addLayer({
          'id': 'envelope-layer',
          'type': 'fill',
          'source': 'envelope-source',
          'layout': {},
          'paint': {
            'fill-outline-color': 'red',
            'fill-color': '#000',
            'fill-opacity': 0.4
          }
        });
      },
      setCoordinates() {
        let coordinates = this.project.envelope.geometry.coordinates[0];
        if (coordinates.length > 0) {
          var bounds = coordinates.reduce(function (bounds, coord) {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          this.map.fitBounds(bounds, {padding: 20});
        }
      }
    }
  };
</script>