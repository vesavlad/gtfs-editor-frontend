<template>
  <div class="horizontal-display">
    <div id="map" ref="mapContainer">
    </div>
    <div>
      <div class="horizontal-display">
        <input type="checkbox" id="optional-fields" v-model="show_optional_fields">
        <label for="optional-fields">Show Optional Fields</label>
      </div>
      <vuetable ref="table" :fields="fields" :api-mode="false" :data="stop_times">
        <GeneralizedInput :key="index"
          v-for="(field, index) in getProperFields(fields, {exclusions: ['actions', 'stop_sequence', 'stop_id']})"
          :slot="getFieldName(field)" slot-scope="properties" :data="properties.rowData" :field="properties.rowField"
          v-model="properties.rowData[getFieldID(properties.rowField)]" v-on:input="changeHandler(properties)">
        </GeneralizedInput>
      </vuetable>
      <button class="btn btn-outline-secondary" @click="saveAndExit">
        Save changes and exit
      </button>
    </div>
  </div>
</template>




<script>
  import tripsAPI from "@/api/trips.api";
  import stopsAPI from "@/api/stops.api";
  import shapesAPI from "@/api/shapes.api";
  import fieldMixin from "@/mixins/fieldMixin.js";
  import GeneralizedInput from "@/components/GeneralizedInput.vue";
  let Vuetable = require('vuetable-2')
  import envelopeMixin from "@/mixins/envelopeMixin"
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ';

  let base_fields = [{
      title: "Seq",
      name: "stop_sequence",
    },
    {
      title: "Stop ID",
      name: "stop_id",
    },
    {
      title: "Arrival Time",
      name: "arrival_time",
    },
    {
      title: "Departure Time",
      name: "departure_time",
    }
  ]

  let optional_fields = [{
    title: "Stop Headsign",
    name: "stop_headsign",
  }, {
    title: "Pickup Type",
    name: "pickup_type",
  }, {
    title: "Drop-Off Type",
    name: "drop_off_type",
  }, {
    title: "Continuous Pickup",
    name: "continuous_pickup",
  }, {
    title: "Continuous Drop-Off",
    name: "continuous_dropoff",
  }, {
    title: "Shape Distance Traveled",
    name: "shape_dist_traveled",
  }, {
    title: "Timepoint",
    name: "timepoint",
  }, ]

  let full_fields = base_fields.concat(optional_fields);

  export default {
    name: "SopTimesMap",
    components: {
      Vuetable: Vuetable.Vuetable,
      GeneralizedInput,
    },
    mixins: [
      envelopeMixin,
      fieldMixin,
    ],
    data: function () {
      return {
        fields: base_fields,
        show_optional_fields: false,
        stop_times: this.trip.stop_times,
        shapeColor: "#55CCFF",
        stops: [],
        stop_map: new Map(),
        shape: false,
      };
    },
    props: {
      project: {
        required: true,
      },
      trip: {
        required: true,
      }
    },
    watch: {
      show_optional_fields(val) {
        this.fields = val ? full_fields : base_fields;
      },
    },
    mounted() {
      this.$nextTick(() => {
        stopsAPI.stopsAPI.getAll(this.project).then((response) => {
          this.stops = response.data;
          this.stops.forEach(stop => this.stop_map.set(stop.id, stop));
          let map = new mapboxgl.Map({
            container: this.$refs.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
          });
          this.map = map;
          map.on('load', () => {
            this.addSources();
            this.$emit('load');
            this.envelope(this.map, this.project);
          });
        });
      });
    },
    methods: {
      changeHandler(props) {
        console.log(props);
      },
      addSources() {
        this.addStops();
        this.addShape();
      },
      addStops() {
        let geojson = {
          type: 'FeatureCollection',
          features: []
        };
        geojson.features = this.stops.map(this.generateStopFeature);
        this.map.addSource('stops', {
          'type': 'geojson',
          'data': geojson,
        });
        this.map.addLayer({
          id: "layer-stops-icon",
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
            "circle-color": [
              'case',
              ['get', 'selected'],
              '#DD2222',
              "#2222DD" //default
            ]
          }
        });
        this.map.addLayer({
          id: "layer-stops-label",
          type: "symbol",
          source: "stops",
          minzoom: 14,
          layout: {
            "text-field": "{label}",
            "text-anchor": "top",
            "text-offset": [0, 0.5],
            "text-allow-overlap": true,
          }
        });
      },
      generateStopFeature(stop) {
        let selected = false;
        let sequence = undefined;
        let st = this.stop_times.filter(st => st.stop_id === stop.stop_id);
        if (st.length) {
          sequence = st[0].stop_sequence;
          selected = true;
        }
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
            selected,
            sequence,
          }
        }
      },
      addShape() {
        let geojson = {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        }
        this.map.addSource('shape', {
          'type': 'geojson',
          'data': geojson,
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
        if (this.trip.shape) {
          shapesAPI.shapesAPI.detail(this.project, this.trip.shape).then(response => {
            this.shape = response.data;
            let points = this.shape.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
            geojson.geometry.coordinates = points;
            this.map.getSource('shape').setData(geojson);
          }).catch(err => console.log(err));
        }
      },
      saveAndExit(){
        console.log("SAE");
        let data = {
          ...this.trip,
          stop_times: this.stop_times,
        }
        tripsAPI.tripsAPI.update(this.project, data).then(()=>{
          this.$emit('close');
        }).catch(err => {
          console.log(err);
        })
      }
    }
  };
</script>

<style scoped>
  .horizontal-display {
    display: flex;
    flex-direction: row
  }
</style>