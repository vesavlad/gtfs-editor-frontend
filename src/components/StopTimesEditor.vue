<template>
  <div class="horizontal-display">
    <div id="map" ref="mapContainer">
    </div>
    <div>
      <div class="horizontal-display">
        <input type="checkbox" id="optional-fields" v-model="show_optional_fields">
        <label for="optional-fields">Show Optional Fields</label>
      </div>
      <div class="horizontal-display">
        <input type="checkbox" id="automatic-time" v-model="automatic_times">
        <label for="automatic-time">Automatically calculate times using a speed of </label>
        <input v-model="speed" type="number">[km/h]
      </div>
      <vuetable ref="table" :fields="fields" :api-mode="false" :data="stop_times">
        <GeneralizedInput :key="index" v-for="(field, index) in getProperFields(fields, {exclusions})"
          :slot="getFieldName(field)" slot-scope="properties" :data="properties.rowData" :field="properties.rowField"
          v-model="properties.rowData[getFieldID(properties.rowField)]">
        </GeneralizedInput>
      </vuetable>
      Trip ID:<input v-model="trip.trip_id">
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
  let turf = require('@turf/turf');
  let base_fields = [{
      title: "Seq",
      name: "stop_sequence",
    },
    {
      title: "Stop ID",
      name: "stop_id",
    },
    {
      title: "Distance [km]",
      name: "distance",
    },
    {
      title: "Arrival Time",
      name: "arrival_time",
    },
    {
      title: "Departure Time",
      name: "departure_time",
    },
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
        speed: 60,
        automatic_times: false,
        exclusions: ['actions', 'stop_sequence', 'stop_id', 'distance'],
        fields: base_fields,
        show_optional_fields: false,
        stop_times: this.trip.stop_times,
        shapeColor: "#55CCFF",
        stops: [],
        stop_map: new Map(),
        shape: false,
        turfShape: false,
      };
    },
    props: {
      project: {
        required: true,
      },
      trip: {
        required: true,
      },
      mode: {
        required: true,
      },
    },
    watch: {
      show_optional_fields(val) {
        this.fields = val ? full_fields : base_fields;
      },
      automatic_times() {
        this.updateStops();
      },
      speed() {
        this.updateStops();
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
      reCalculateTimes() {
        if (this.automatic_times) {
          let speed = Number(this.speed);
          if (Number.isNaN(speed)) {
            return;
          }
          speed = speed * 1.0;
          this.stop_times = this.stop_times.map(st => {
            let seconds = st.distance / speed * 3600;
            let formatted_time = new Date(null, null, null, null, null, seconds).toTimeString().match(
              /\d{2}:\d{2}:\d{2}/)[0]
            st.arrival_time = formatted_time;
            st.departure_time = formatted_time;
            return st;
          })
        }
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
        geojson.features = this.generateStopFeatures();
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
          minzoom: 16,
          layout: {
            "text-field": "{label}",
            "text-anchor": "top",
            "text-offset": [0, 0.5],
            "text-allow-overlap": true,
          }
        });
        this.map.addLayer({
          id: "layer-stops-seq",
          type: "symbol",
          source: "stops",
          filter: ['get', 'selected'],
          minzoom: 16,
          layout: {
            "text-field": "Seq: {sequence}",
            "text-anchor": "top",
            "text-offset": [0, -0.5],
            "text-allow-overlap": true,
          }
        });
        this.map.addLayer({
          id: "layer-stops-time",
          type: "symbol",
          source: "stops",
          filter: ['get', 'selected'],
          minzoom: 16,
          layout: {
            "text-field": "{arrival_time}",
            "text-anchor": "top",
            "text-offset": [0, 1.5],
            "text-allow-overlap": true,
          }
        });
        this.map.on('click', 'layer-stops-icon', evt => {
          let feature = evt.features[0];
          if (feature.properties.selected) {
            return;
          }
          evt.preventDefault();
          let stop = this.stop_map.get(feature.properties.id);
          let st = {
            trip: this.trip.id,
            trip_id: this.trip.trip_id,
            stop: stop.id,
            stop_id: stop.stop_id,
            stop_sequence: null,
            arrival_time: null,
            departure_time: null,
            stop_headsign: null,
            pickup_type: null,
            drop_off_type: null,
            continuous_pickup: null,
            continuous_dropoff: null,
            shape_dist_traveled: null,
            timepoint: null
          }
          st.distance = this.calculatePosition(st);
          this.stop_times.push(st);
          this.updateStops();
        });

        this.map.on('contextmenu', 'layer-stops-icon', evt => {
          let feature = evt.features[0];
          if (!feature.properties.selected) {
            return;
          }
          evt.preventDefault();
          let stop = this.stop_map.get(feature.properties.id);
          this.stop_times = this.stop_times.filter(st => st.stop !== stop.id);
          this.updateStops();
        });
      },
      updateStops() {
        this.calculateSTPositions();
        this.reCalculateTimes();
        let geojson = {
          type: 'FeatureCollection',
          features: this.generateStopFeatures(),
        };
        this.map.getSource('stops').setData(geojson);
      },
      generateStopFeatures() {
        let st_map = new Map();
        this.stop_times.forEach(st => st_map.set(st.stop, st))
        return this.stops.map(stop => {
          let st = st_map.get(stop.id);
          let props = {
            selected: false,
            sequence: undefined,
            arrival_time: undefined,
            departure_time: undefined,
          }
          if (st) {
            props = {
              selected: true,
              sequence: st.stop_sequence,
              arrival_time: st.arrival_time,
              departure_time: st.departure_time,
            }
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
              ...props,
            }
          }
        });
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
            this.turfShape = turf.lineString(points);
            geojson.geometry.coordinates = points;
            this.map.getSource('shape').setData(geojson);
            this.calculateSTPositions();
          }).catch(err => console.log(err));
        } else {
          window.alert("Warning: editing a StopTimes without a shape is not supported");
        }
      },
      calculateSTPositions() {
        let stop_times = this.stop_times.map(st => {
          return {
            ...st,
            distance: this.calculatePosition(st),
          }
        });
        stop_times.sort((st1, st2) => st1.distance - st2.distance);
        for (let i = 0; i < stop_times.length; i++) {
          stop_times[i].stop_sequence = i + 1;
        }
        this.stop_times = stop_times;
      },
      calculatePosition(st) {
        let stop = this.stop_map.get(st.stop);
        let point = turf.point([stop.stop_lon, stop.stop_lat]);
        let nearest = turf.nearestPointOnLine(this.turfShape, point);
        console.log(nearest)
        return nearest.properties.location.toFixed(3);
      },
      saveAndExit() {
        console.log("SAE-v2");
        let data = {
          ...this.trip,
          stop_times: this.stop_times,
        }
        let save = undefined;
        switch(this.mode) {
          case 'edit':
            save = tripsAPI.tripsAPI.update.bind(tripsAPI.tripsAPI);
            break;
          case 'duplicate':
            save = tripsAPI.tripsAPI.create.bind(tripsAPI.tripsAPI);
            break;
        }
        save(this.project, data).then(() => {
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