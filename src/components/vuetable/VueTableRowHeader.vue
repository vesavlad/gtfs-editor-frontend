<script>
import VuetableRowHeader from "vuetable-2/src/components/VuetableRowHeader.vue";

export default {
  name: 'VueTableRowHeader',
  extends: VuetableRowHeader,
  methods: {
    renderTitle(field) {
      let title = this.getTitle(field)
      if (title.length > 0 && this.isInCurrentSortGroup(field) || this.hasSortableIcon(field)) {
        let iconTag = this.vuetable.showSortIcons ? this.renderIconTag(['sort-icon', this.sortIcon(field)], ``) : ''
        return this.formatTitle(title + ' ' + iconTag)
      }
      return this.formatTitle(title);
    },
    formatTitle(title) {
      return `<div>${title}</div>`;
    }
  }
};
</script>