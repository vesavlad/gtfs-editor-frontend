<template>
  <div id='map'>
    <popup-content v-show="modalOpen" ref="popupContent" :fields="stopFields" :data="popup.stop"></popup-content>
  </div>
</template>

<style>
  @import url("https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css");

  #map {
    width: 100%;
    height: 100%;
    min-height: 800px;
  }

  canvas.mapglbox-canvas {
    width: 100%;
    height: 100%;
  }

  div.mapboxgl-popup-content {
    overflow-y: scroll;
    max-height: 400px;
  }
</style>


<script>
  import stopsAPI from '@/api/stops.api';
  import PopupContent from '@/components/PopupContent.vue';
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ';

  export default {
    name: 'InteractiveMap',
    components: {
      PopupContent
    },
    data() {
      return {
        stops: [],
        popup: {
          stop: {},
        },
        modalOpen: false,
      }
    },
    computed: {
      stopMap() {
        let map = {};
        this.stops.forEach(stop => {
          map[stop.id] = stop;
        });
        return map;
      }
    },
    props: {
      project: {
        required: true,
      },
      stopFields: {
        type: Array,
      },
    },
    mounted() {

      this.$nextTick(() => {
        stopsAPI.stopsAPI.getAll(this.project).then((response) => {
          this.stops = response.data
          let map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
            center: [this.stops[0].stop_lon, this.stops[0].stop_lat], // starting position [lng, lat]
            zoom: 16 // starting zoom
          });
          this.map = map;
          map.on('load', () => {
            this.addStops();
            this.$emit('load');
          })
        }).catch((err) => {
          alert("Unable to fetch stops");
          console.log(err);
        });

      });
    },
    methods: {
      onClosePopup(){
        console.log(this.$refs.popupContent.getData());
      },
      resize() {
        this.map.resize();
      },
      generatePopup(stop) {
        this.popup.stop = stop;
        console.log(this.$refs.popupContent);
        return this.$refs.popupContent.$el;
      },
      addStops() {
        let map = this.map;
        let stopMap = this.stopMap;
        let data = {
          type: 'FeatureCollection',
          features: this.stops.map(stop => {
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
                stop_id: stop.id,
                title: stop.stop_name
              }
            }
          })
        };
        this.map.addSource('stops', {
          type: 'geojson',
          data,
        });
        this.map.addLayer({
          id: "stops",
          type: "circle",
          source: "stops",
          paint: {
            "circle-radius": {
              base: 2,
              stops: [
                [12, 1.5],
                [14, 4],
                [20, 180]
              ]
            },
            "circle-color": "#2222DD"
          }
        });
        console.log("Points added");
        this.map.on('click', 'stops', (evt) => {

          var coordinates = evt.features[0].geometry.coordinates.slice();
          var stop_id = evt.features[0].properties.stop_id;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(evt.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += evt.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          let stop = stopMap[stop_id];
          let popup = new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setDOMContent(this.generatePopup(stop))
          popup.addTo(map);
          popup.on('close', ()=>{
            stopsAPI.stopsAPI.update(this.project, this.$refs.popupContent.getData());
          });
          this.modalOpen = true;
        });
        this.map.on('mouseenter', 'stops', function () {
          map.getCanvas().style.cursor = 'pointer';
        });
        this.map.on('mouseleave', 'stops', function () {
          map.getCanvas().style.cursor = '';
        });
      }
    },
  }
</script>