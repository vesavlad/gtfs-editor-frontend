import axios from 'axios';
var querystring = require('querystring');

let url = 'https://api.mapbox.com/matching/v5/mapbox/driving-traffic?access_token=' +
`${'pk.eyJ1Ijoiam9yb21lcm8iLCJhIjoiY2toa2t2NnBjMDJkYTJzcXQyZThhZTNyNSJ9.Wx6qT7xWJ-hhKHyLMNbnAQ'}`;

const match = (points) => {
    console.log(points);
    let coordinates = points.map(point => `${point.lng},${point.lat}`).join(';');
    let body = {
        coordinates,
        geometries:'geojson',
        steps: false,
        radiuses: points.map(()=>25).join(';'),
    }
    let config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    return axios.post(url, querystring.stringify(body), config)
}

export default {match};