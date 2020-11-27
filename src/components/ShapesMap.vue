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
        // console.log(process.env);
        // let url = `@/assets/arrow.png`
        // console.log(url);
        // console.log(require(url));
        // this.map.loadImage(url, (err, image) => {
        //   if (err) {
        //     console.log(err); 
        //     return;
        //   }
        //   this.map.addImage('arrow', image);
        //   this.map.addLayer({
        //     'id': 'arrowId',
        //     'type': 'symbol',
        //     'source': 'mapSource',
        //     'layout': {
        //       'symbol-placement': 'line',
        //       'symbol-spacing': 1,
        //       'icon-allow-overlap': true,
        //       // 'icon-ignore-placement': true,
        //       'icon-image': 'arrow',
        //       'icon-size': 0.045,
        //       'visibility': 'visible'
        //     }
        //   });
        // });

      },
      displayShape(shape) {
        shapesAPI.shapesAPI.detail(this.project, shape.id).then(response => {
          let points = response.data.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
          this.setShapeCoordinates(points);
        }).catch(err => console.log(err));
      },
      setShapeCoordinates(points) {
        this.geojson.geometry.coordinates = points;
        this.map.getSource('shape').setData(this.geojson);
        this.map.fitBounds(this.getBounds(points));
      },
      getBounds(points) {
        // We start with the entire world
        let minlon = 180;
        let minlat = 90;
        let maxlon = -180;
        let maxlat = -90;
        // First point is gonna override all 4 defaults, then we slowly expand the square to incorporate any new points
        points.forEach(point => {
          minlon = Math.min(point[0], minlon)
          minlat = Math.min(point[1], minlat)
          maxlon = Math.max(point[0], maxlon)
          maxlat = Math.max(point[1], maxlat)
        });
        // We add a bit of padding to better visualize the shape
        let lonPadding = (maxlon-minlon)*0.1
        let latPadding = (maxlat-minlat)*0.1
        minlon = Math.max(-90, minlon - lonPadding)
        minlat = Math.max(-180, minlat - latPadding)
        maxlon = Math.min(90, maxlon + lonPadding)
        maxlat = Math.min(180, maxlat+ latPadding)
        return [
          [minlon, minlat],
          [maxlon, maxlat],
        ]
      }
    },
  };
</script>