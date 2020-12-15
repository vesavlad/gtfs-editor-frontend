
let fieldMixin = {
  methods: {
    getFieldName(field) {
      if (field instanceof Object) {
        return field.name;
      }
      return field;
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
    getFieldID(field) {
      if(field instanceof Object && field.id_field){
        return field.id_field;
      }
      return this.getFieldName(field);
    },
    getFKText(field, data) {
      return data[this.getFieldName(field)];
    },
    getProperFields(fields, params){
      if(!params) {
        params = {}
      }
      if(!params.exclusions){
        params.exclusions = ['actions']
      }
      let properFields = fields.filter(field => !params.exclusions.includes(this.getFieldName(field)));
      return properFields;
    }
  }
}

export default fieldMixin;