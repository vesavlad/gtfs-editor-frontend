<template>
  <div style="height: 100%;">
    <img v-if="showStaticMap" :width="width" :height="height" :src="createURL()" @error="replaceByDefault" @click="enableMapInteraction" @dragstart="enableMapInteraction" />
    <div v-if="!showStaticMap" id="envelopeMap" ref="mapContainer"></div>
  </div>
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
        showStaticMap: true,
        errorToLoadStaticImage: false,
        map: null,
      }
    },
    methods: {
      createURL() {
        let mapStyle = 'streets-v11';
        let mapboxAccessToken = process.env.VUE_APP_MAPBOX_TOKEN;
        let geojson = encodeURIComponent(JSON.stringify(this.project.envelope)).replace(/\s/g, '');
        let url = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/geojson(${geojson})/auto/${this.width}x${this.height}?access_token=${mapboxAccessToken}`;
        return url;
      },
      replaceByDefault(e) {
        let img = require('@/assets/img/logo.svg')
        e.target.src = img;
        this.errorToLoadStaticImage = true;
      },
      enableMapInteraction() {
        if (!this.errorToLoadStaticImage && this.enableInteraction) {
          this.showStaticMap = false;
          this.$nextTick(() => {
            console.log(this.$refs.mapContainer);
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
              this.map.resize();
            });
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