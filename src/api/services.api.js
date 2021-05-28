import httpClient from './httpClient';

const ServicesAPI = class {
  constructor() {
    this.base_end_point = '/api';
    this.end_point = `${this.base_end_point}/projects/`;
  }

  getBaseURL(projectId) {
    return `${this.end_point}${projectId}/services/`
  }

  getFullBaseURL(projectId) {
    return httpClient.getBaseURL() + this.getBaseURL(projectId);
  }
}

const servicesAPI = new ServicesAPI();

export default {
  servicesAPI,
}