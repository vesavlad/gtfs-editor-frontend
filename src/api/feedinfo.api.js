import httpClient from './httpClient';

const BASE_END_POINT = '/api'
const END_POINT = `${BASE_END_POINT}/projects/`;
const TABLE = '/feedinfo/'

const getFeedInfo = (projectId) => {
    return httpClient.get(`${END_POINT}${projectId}${TABLE}`);
}

const update = (projectId, data) => {
    return httpClient.patch(`${END_POINT}${projectId}${TABLE}${data.id}/`, data);
}

const create = (projectId, data) => {
    return httpClient.post(`${END_POINT}${projectId}${TABLE}`, data);
}


export default {
    getFeedInfo,
    update,
    create,
}