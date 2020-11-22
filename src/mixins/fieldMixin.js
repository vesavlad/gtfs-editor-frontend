
let fieldMixin = {
  methods: {
    getFieldName(field) {
      if (field instanceof String) {
        return field;
      }
      return field.name;
    },
    getFieldTitle(field) {
      if (field instanceof Object) {
        return field.title || field.name
      }
      return this.getFieldName(field);
    },
    getFKName(field) {
      if (field.fk_name) {
        return field.fk_name;
      }
      return field.name;
    },
    getFKText(field, data) {
      return data[this.getFieldName(field)];
    },
    getProperFields(fields){
      return fields.filter(field => this.getFieldName(field) !== "actions");
    }
  }
}

export default fieldMixin;