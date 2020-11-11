import httpClient from './httpClient';

const BASE_END_POINT = '/api'
const END_POINT = `${BASE_END_POINT}/projects/`;
const TABLE = '/feedinfo/'

const getFeedInfo = (projectid) => {
    return httpClient.get(`${END_POINT}${projectid}${TABLE}`);
}


export default {
    getFeedInfo,
}