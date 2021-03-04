import httpClient from './httpClient';

const ServicesAPI = class {
  constructor() {
    this.base_end_point = '/api';
    this.end_point = `${this.base_end_point}/projects/`;
  }

  getBaseURL(projectid) {
    return `${this.end_point}${projectid}/services/`
  }

  getFullBaseURL(projectid) {
    return httpClient.getBaseURL() + this.getBaseURL(projectid);
  }
}

const servicesAPI = new ServicesAPI();

export default {
  servicesAPI,
}