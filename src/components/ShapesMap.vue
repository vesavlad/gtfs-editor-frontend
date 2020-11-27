<template>
  <div id="map" ref="mapContainer">
  </div>

</template>




<script>
  import shapesAPI from "@/api/shapes.api";
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ';
  console.log(shapesAPI);
  export default {
    name: "ShapesMap",
    components: {},
    mixins: [],
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
        })
      });
    },
    methods: {
      addLayers() {
        this.map.addSource('shape', {
          'type': 'geojson',
          'data': this.geojson,
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
            'line-color': '#3333CC',
            'line-width': 2
          }
        });
        const url = 'img/arrow.png'
        this.map.loadImage(url, (err, image) => {
          if (err) {
            console.log(err);
            return;
          }
          this.map.addImage('arrow', image);
          this.map.addLayer({
            'id': 'arrowId',
            'type': 'symbol',
            'source': 'mapSource',
            'layout': {
              'symbol-placement': 'line',
              'symbol-spacing': 1,
              'icon-allow-overlap': true,
              // 'icon-ignore-placement': true,
              'icon-image': 'arrow',
              'icon-size': 0.045,
              'visibility': 'visible'
            }
          });
        });

        this.setDefaultCoordinates();
      },
      setDefaultCoordinates() {
        let points = [
          [-122.48369693756104, 37.83381888486939],
          [-122.48348236083984, 37.83317489144141],
          [-122.48339653015138, 37.83270036637107],
          [-122.48356819152832, 37.832056363179625],
          [-122.48404026031496, 37.83114119107971],
          [-122.48404026031496, 37.83049717427869],
          [-122.48348236083984, 37.829920943955045],
          [-122.48356819152832, 37.82954808664175],
          [-122.48507022857666, 37.82944639795659],
          [-122.48610019683838, 37.82880236636284],
          [-122.48695850372314, 37.82931081282506],
          [-122.48700141906738, 37.83080223556934],
          [-122.48751640319824, 37.83168351665737],
          [-122.48803138732912, 37.832158048267786],
          [-122.48888969421387, 37.83297152392784],
          [-122.48987674713133, 37.83263257682617],
          [-122.49043464660643, 37.832937629287755],
          [-122.49125003814696, 37.832429207817725],
          [-122.49163627624512, 37.832564787218985],
          [-122.49223709106445, 37.83337825839438],
          [-122.49378204345702, 37.83368330777276]
        ]
        this.setShapeCoordinates(points);
      },
      setShapeCoordinates(points) {
        this.geojson.geometry.coordinates = points;
        this.map.getSource('shape').setData(this.geojson);
        this.map.flyTo({
          center: points[0],
          zoom: 14,
        });

      },
    },
  };
</script>