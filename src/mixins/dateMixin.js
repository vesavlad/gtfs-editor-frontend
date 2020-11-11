import moment from 'moment';

let dateMixin = {
  methods: {
    getLocalDate(dateObj) {
        return moment(dateObj).format("YYYY-MM-DD");
    }
  }
}

export default dateMixin;