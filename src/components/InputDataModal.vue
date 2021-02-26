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
            <span>{{ field.title }}{{ field.required?'*':'' }}</span>
          </div>
          <div class="input-row-content single">
            <template v-if="[InputType.INPUT, InputType.DATE, InputType.URL, InputType.EMAIL].indexOf(field.type)>-1">
              <input :type="field.type" v-model="localData[field.name]" :placeholder="`Enter ${field.title.toLowerCase()}`" @focus="$emit('removeError', field.name)" :class="{error: errors[field.name]}" v-tooltip="{ theme: 'error-tooltip', content: errors[field.name]?errors[field.name][0]:'', shown: errors[field.name]!==undefined }"/>
            </template>
            <template v-else-if="field.type===InputType.CHECKBOX">
              <label class="checkbox">
                <input type="checkbox" v-model="localData[field.name]" />
                <div class="checkbox-name"><span>{{ field.label }}</span></div>
              </label>
            </template>
            <template v-else-if="[InputType.SIMPLE_SELECT, InputType.FK_SELECT, InputType.COLOR].indexOf(field.type)>-1">
              <GeneralizedInput v-model="localData[field.name]" :field="field" :data="{}" @focus="$emit('removeError', field.name)" v-tooltip="{ theme: 'error-tooltip', content: errors[field.name]?errors[field.name][0]:'', shown: errors[field.name]!==undefined }"></GeneralizedInput>
            </template>
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
import Enums from "@/utils/enums";
import GeneralizedInput from "@/components/vuetable/GeneralizedInput";

export default {
  name: 'InputDataModal',
  components: {
    BaseModal,
    GeneralizedInput
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
        // required field is optional so is not checked
        let properties = ['name', 'title', 'type'];
        for (let i = 0; i < properties.length; i++) {
          for (let j = 0; j < value.length; j++) {
            if (!Object.prototype.hasOwnProperty.call(value[j], properties[i])) {
              console.warn(`Property ${properties[i]} is not present in element ${j+1} of fields prop`);
              return false;
            }
            if (properties[i]==='type' && Object.values(Enums.InputType).concat([null]).indexOf(value[j][properties[i]])===-1) {
              console.warn(`value ${value[j][properties[i]]} is not valid for property ${properties[i]} in element ${j+1}`);
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
      localData: {...this.initialData},
      InputType: Enums.InputType
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
