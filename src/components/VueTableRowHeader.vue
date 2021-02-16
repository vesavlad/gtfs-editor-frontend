<script>
import VuetableRowHeader  from "vuetable-2/src/components/VuetableRowHeader.vue";

export default {
  name: 'VueTableRowHeader',
  extends: VuetableRowHeader,
  methods: {
    renderTitle (field) {
      let title = this.getTitle(field)
      if (title.length > 0 && this.isInCurrentSortGroup(field) || this.hasSortableIcon(field)) {
        let style = 'hola';//`opacity:${this.sortIconOpacity(field)};position:relative;float:right`
        let iconTag = this.vuetable.showSortIcons ? this.renderIconTag(['sort-icon', this.sortIcon(field)], `style="${style}"`) : ''
        return title + ' ' + iconTag
      }
      return title
    },
  }
};
</script>