<template>
  <div v-bind:style="{ 'background-image': 'url(\'' + createURL() + '\'), url(\'' + require('@/assets/img/logo.svg') + '\')' }" :width="width" :height="height" id="envelopeMap" ref="mapContainer" @click="enableMapInteraction" @dragstart="enableMapInteraction"></div>
</template>

<script>
  import config from "@/config.js"
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;

  export default {
    name: "EnvelopeMap",
    props: {
      project: {
        type: Object,
        required: true,
      },
      width: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: true
      },
      enableInteraction: {
        type: Boolean,
        required: false,
        default: true
      }
    },
    data() {
      return {
        map: null,
      }
    },
    methods: {
      createURL() {
        let url = '';
        if (this.project.envelope) {
          let mapStyle = 'streets-v11';
          let mapboxAccessToken = process.env.VUE_APP_MAPBOX_TOKEN;
          let geojson = JSON.parse(JSON.stringify(this.project.envelope));
          geojson.properties.stroke = '#ff0000';
          geojson.properties['stroke-opacity'] = 0.4;
          geojson.properties['stroke-width'] = 5;
          geojson.properties.fill = '#ff0000';
          geojson.properties['fill-opacity'] = 0.5;
          geojson = encodeURIComponent(JSON.stringify(geojson)).replace(/\s/g, '');
          url = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/geojson(${geojson})/auto/${this.width}x${this.height}?access_token=${mapboxAccessToken}`;
        }
        return url;
      },
      enableMapInteraction() {
        if (this.enableInteraction) {
          let center = this.project.envelope?this.project.envelope.geometry.coordinates[0][0]:[0,0];
          this.map = new mapboxgl.Map({
            container: this.$refs.mapContainer,
            center: center,
            zoom: config.map_base_zoom,
            style: 'mapbox://styles/mapbox/streets-v11'
          });
          this.map.on('load', () => {
            this.addLayers();
            this.setCoordinates();
            this.$emit('load');
          });
        }
      },
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
            'fill-outline-color': 'gray',
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
          this.map.fitBounds(bounds, {
            padding: 20,
            animate: false,
          });
        }
      }
    }
  };
</script>