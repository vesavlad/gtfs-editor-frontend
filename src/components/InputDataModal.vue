<template>
  <BaseModal :classes="ownClasses">
    <slot name="m-content">
      <div class="m-header">
        <h2>Feed info</h2>
        <div class="grid">
          <button class="btn icon flat"><i class="material-icons">info</i></button>
          <button class="btn icon flat"><i class="material-icons">close</i></button>
        </div>
      </div>
      <ul class="m-content">
        <li>
          <div class="input-row-title h4 required">
            <span>Publish name</span>
          </div>
          <div class="input-row-content single">
            <input type="text" placeholder="Enter name"/>
          </div>
        </li>
        <li>
          <div class="input-row-title h4">
            <span>First name input / second name input </span>
          </div>
          <div class="input-row-content double">
            <select>
              <option selected disabled>Select</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <select>
              <option selected disabled>Select</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
        </li>
      </ul>
      <div class="m-footer">
        <div class="error-message">
          <span>General Error message</span>
        </div>
        <div class="option-buttons">
          <button class="btn flat"><span>Cancel</span></button>
          <button class="btn green"><span>Save</span></button>
        </div>
      </div>
    </slot>
  </BaseModal>
</template>

<script>
export default {
  name: 'InputDataModal',
  props: {
    classes: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ownClasses() {
      return ['input-data'].concat(this.classes);
    }
  }
}
</script>
