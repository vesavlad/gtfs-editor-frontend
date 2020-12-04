<template>
  <div id="map" ref="mapContainer">
  </div>

</template>




<script>
  import shapesAPI from "@/api/shapes.api";
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ';
  export default {
    name: "ShapesMap",
    components: {},
    mixins: [],
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
        this.map.addSource('shape-pts', {
          'type': 'geojson',
          'data': this.pointsGeojson,
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
        this.map.addLayer({
          id: "shape-circle-layer",
          type: "circle",
          source: "shape-pts",
          paint: {
            "circle-radius": {
              base: 2,
              stops: [
                [12, 1.5],
                [14, 4],
                [20, 180]
              ]
            },
            "circle-color": this.shapeColor,
          }
        });
        this.map.addLayer({
          id: "shape-label-layer",
          type: "symbol",
          source: "shape-pts",
          minzoom: 14,
          layout: {
            "text-field": "{label}",
            "text-anchor": "top",
            "text-offset": [0, 0.5],
            "text-allow-overlap": true,
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
        this.map.on('click', 'shape-circle-layer', (evt) => {
          let feature = evt.features[0];
          if(this.selectingRange) {
            this.range.push(feature.properties.label);
            if(this.range.length === 2) {
              this.$emit("range", {
                start: this.range[0],
                finish: this.range[1],
              }) 
              this.selectingRange = false;
            }
          }
        })

      },
      beginPointSelection() {
        this.selectingRange = true;
        this.range = [];
      },
      displayShape(shape) {
        shapesAPI.shapesAPI.detail(this.project, shape.id).then(response => {
          let points = response.data.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
          this.pointsGeojson.features = response.data.points.map(point => {
            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [
                  point.shape_pt_lon,
                  point.shape_pt_lat,
                ]
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
          padding: 50
        });
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
        return [
          [minlon, minlat],
          [maxlon, maxlat],
        ]
      }
    },
  };
</script>