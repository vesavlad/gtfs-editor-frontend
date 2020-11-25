import httpClient from './httpClient';

const BASE_END_POINT = '/api'
const END_POINT = `${BASE_END_POINT}/projects/`;
const getAllProjects = () => {
    return httpClient.get(`${END_POINT}?no_page`);
}

const createProject = (name) => httpClient.post(`${END_POINT}`, {name});
const getProjectDetail = (id) => httpClient.get(`${END_POINT}${id}/`);
const runGTFSValidation = (id) => httpClient.post(`${END_POINT}${id}/run_gtfs_validation/`);
const cancelGTFSValidation = (id) => httpClient.post(`${END_POINT}${id}/cancel_gtfs_validation/`);
const buildGTFS = (id) => httpClient.post(`${END_POINT}${id}/create_gtfs_file/`);
const downloadGTFS = (id) => httpClient.request({url: `${END_POINT}${id}/download/`, method: 'GET', responseType: 'blob'});
const uploadGTFS = (id, file) => {
    let formData = new FormData();
    formData.append('file', file)
    let headers = { 
        headers: { 
            'Content-Type': 'multipart/form-data'
        }
    }
    return httpClient.post(`${END_POINT}${id}/upload_gtfs_file/`, formData, headers);
}

export default {
    getAllProjects,
    createProject,
    getProjectDetail,
    runGTFSValidation,
    cancelGTFSValidation,
    buildGTFS,
    downloadGTFS,
    uploadGTFS
}