import httpClient from './httpClient';

const BASE_END_POINT = '/api'
const END_POINT = `${BASE_END_POINT}/projects/`;
const TABLE = '/stoptimes/'

const getAllStopTimes = (projectId) => {
    return httpClient.get(`${END_POINT}${projectId}${TABLE}`);
}
const updateStopTime = (projectId, data) => {
    let url=`${END_POINT}${projectId}${TABLE}${data.id}/`;
    console.log(url);
    return httpClient.patch(url, data);
}
const deleteStopTime = (projectId, data) => {
    let url=`${END_POINT}${projectId}${TABLE}${data.id}/`;
    console.log(url);
    return httpClient.delete(url);
}



export default {
    getAllStopTimes,
    updateStopTime,
    deleteStopTime,
}