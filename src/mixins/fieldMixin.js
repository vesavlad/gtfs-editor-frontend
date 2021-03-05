let fieldMixin = {
  methods: {
    getFieldID(field) {
      if (field instanceof Object && field.id_field) {
        return field.id_field;
      }
      return field.name;
    },
    getFKText(field, data) {
      return data[field.name];
    },
    getProperFields(fields, params) {
      if (!params) {
        params = {}
      }
      if (!params.exclusions) {
        params.exclusions = ['actions']
      }
      let properFields = fields.filter(field => !params.exclusions.includes(field.name));
      return properFields;
    }
  }
}

export default fieldMixin;
