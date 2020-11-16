import httpClient from './httpClient';

const BASE_END_POINT = '/api'
const END_POINT = `${BASE_END_POINT}/projects/`;
const getAllProjects = () => {
    return httpClient.get(`${END_POINT}?no_page`);
}

const createProject = (name) => {
    return httpClient.post(`${END_POINT}`, {name});
}

const getProjectDetail = (id) => {
    return httpClient.get(`${END_POINT}${id}/`);
}

const runGTFSValidation = (id) => {
    return httpClient.post(`${END_POINT}${id}/run_gtfs_validation/`)
}

const cancelGTFSValidation = (id) => {
    return httpClient.post(`${END_POINT}${id}/cancel_gtfs_validation/`)
}

export default {
    getAllProjects,
    createProject,
    getProjectDetail,
    runGTFSValidation,
    cancelGTFSValidation
}