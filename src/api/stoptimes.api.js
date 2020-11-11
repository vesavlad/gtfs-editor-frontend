import httpClient from './httpClient';

const BASE_END_POINT = '/api'
const END_POINT = `${BASE_END_POINT}/projects/`;
const TABLE = '/stoptimes/'

const getAllStopTimes = (projectid) => {
    return httpClient.get(`${END_POINT}${projectid}${TABLE}`);
}
const updateStopTime = (projectid, data) => {
    let url=`${END_POINT}${projectid}${TABLE}${data.id}/`;
    console.log(url);
    return httpClient.patch(url, data);
}
const deleteStopTime = (projectid, data) => {
    let url=`${END_POINT}${projectid}${TABLE}${data.id}/`;
    console.log(url);
    return httpClient.delete(url);
}



export default {
    getAllStopTimes,
    updateStopTime,
    deleteStopTime,
}