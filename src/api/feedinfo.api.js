import httpClient from './httpClient';

const BASE_END_POINT = '/api'
const END_POINT = `${BASE_END_POINT}/projects/`;
const TABLE = '/feedinfo/'

const getFeedInfo = (projectid) => {
    return httpClient.get(`${END_POINT}${projectid}${TABLE}`);
}

const update = (projectid, data) => {
    return httpClient.patch(`${END_POINT}${projectid}${TABLE}${data.id}/`, data);
}

const create = (projectid, data) => {
    return httpClient.post(`${END_POINT}${projectid}${TABLE}`, data);
}


export default {
    getFeedInfo,
    update,
    create,
}