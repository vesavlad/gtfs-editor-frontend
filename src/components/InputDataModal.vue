<template>
  <BaseModal :classes="ownClasses" @close="$emit('close')">
    <template v-slot:m-content>
      <div class="m-header">
        <h2>{{ title }}</h2>
        <div class="grid">
          <button v-if="link" class="btn icon flat" @click="openLink"><i class="material-icons">info</i></button>
          <button class="btn icon flat" @click="$emit('close')"><i class="material-icons">close</i></button>
        </div>
      </div>
      <ul class="m-content">
        <li v-for="field in fields" :key="field.name">
          <div class="input-row-title h4" :class="{required: field.required}">
            <span>{{ field.label }}{{ field.required?'*':'' }}</span>
          </div>
          <div class="input-row-content single">
            <input :type="field.type" v-model="localData[field.name]" :placeholder="`Enter ${field.label.toLowerCase()}`" @focus="$emit('removeError', field.name)" :class="{error: errors[field.name]}" v-tooltip="{ theme: 'error-tooltip', content: errors[field.name]?errors[field.name][0]:'', shown: errors[field.name]!==undefined }"/>
          </div>
        </li>
      </ul>
      <div class="m-footer">
        <div class="error-message" v-if="errors.non_field_errors">
          <span>{{ errors.non_field_errors }}</span>
        </div>
        <div class="option-buttons">
          <button class="btn flat" @click="$emit('cancel')"><span>{{ $t('general.cancel') }}</span></button>
          <button class="btn green" @click="$emit('save', localData)"><span>{{ $t('general.save') }}</span></button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/BaseModal.vue';

export default {
  name: 'InputDataModal',
  components: {
    BaseModal
  },
  props: {
    classes: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: null
    },
    fields: {
      type: Array,
      default: () => [],
      validator(value) {
        let properties = ['name', 'required', 'label', 'type'];
        for (let i = 0; i < properties.length; i++) {
          for (let j = 0; j < value.length; j++) {
            if (!Object.prototype.hasOwnProperty.call(value[j], properties[i])) {
              console.warn(`Property ${properties[i]} is not present in element ${j+1} of fields prop`);
              return false;
            }
          }
        }
        return true;
      }
    },
    initialData: {
      type: Object,
      required: true,
    },
    errors: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localData: {...this.initialData}
    }
  },
  computed: {
    ownClasses() {
      return ['input-data'].concat(this.classes);
    }
  },
  methods: {
    openLink() {
      window.open(this.link);
    }
  },
  mounted() {
    this.fields.forEach(field => {
      if (!Object.prototype.hasOwnProperty.call(this.localData, field.name)) {
        this.localData[field.name] = null;
      }
    });
  }
}
</script>
