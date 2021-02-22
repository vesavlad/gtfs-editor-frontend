<script>
import VuetableRowHeader from "vuetable-2/src/components/VuetableRowHeader.vue";

export default {
  name: 'VuetableRowHeader',
  extends: VuetableRowHeader,
  methods: {
    renderTitle(field) {
      let title = this.getTitle(field)
      if (title.length > 0 && this.isInCurrentSortGroup(field) || this.hasSortableIcon(field)) {
        let iconTag = this.vuetable.showSortIcons ? this.renderIconTag(['sort-icon', this.sortIcon(field)], ``) : ''
        return this.formatTitle(title, iconTag, field)
      }
      return this.formatTitle(title, null, field);
    },
    formatTitle(title, iconTag, field) {
      if (field.required) {
        title = `<span class='required'>${title}*</span>`;
      }
      if (iconTag) {
        title = `${title} ${iconTag}`;
      }
      return `<div class="table-th">${title}</div>`;
    }
  }
};
</script>
