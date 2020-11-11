
function isObject(val) {
  if (val === null) { return false;}
  return ( (typeof val === 'function') || (typeof val === 'object') );
}

function processObject(errorData) {
  let message = '';
  for (let key in errorData) {
    let item = errorData[key];
    if (Array.isArray(item)){
      if (key !== 'non_field_errors') {
        message += `<b>${key}:</b><ul>`;
      } else {
        message += `<ul>`;
      }      
      errorData[key].forEach(el => {
          message += `<li>${el}</li>`; 
      });
      message += '</ul>'
    } else if (isObject(item)) {
      message += processObject(item);
    }
  }
  
  return message;
}

let errorMessageMixin = {
  methods: {
    getErrorMessage(errorData) {
      let message = '<b>Please correct the following error(s):</b><br /><br />';
      message += processObject(errorData);
      return message;
    }
  }
}

export default errorMessageMixin;