<template>
  <div class="fare-attributes container">
    <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    <section class="content">
      <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
                     :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
      </EditableTable>
    </section>
  </div>
</template>

<script>
import EditableTable from "@/components/vuetable/EditableTable.vue";
import fareAttributesAPI from '@/api/fareattributes.api';
import agenciesAPI from '@/api/agencies.api';
import TableHeader from "@/components/vuetable/TableHeader";
import Enums from "@/utils/enums";

export default {
  components: {
    EditableTable,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Fare attributes',
      infoURL: "https://developers.google.com/transit/gtfs/reference#fare_attributestxt",
      downloadURL: fareAttributesAPI.fareAttributesAPI.getDownloadURL(this.$route.params.projectId),
      url: fareAttributesAPI.fareAttributesAPI.getFullBaseURL(this.$route.params.projectId),
      fields: [
        {
          name: 'actions',
          title: this.$i18n.t('vuetable.actions'),
          type: null
        },
        {
          name: 'fare_id',
          sortField: 'fare_id',
          title: 'Fare ID',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'price',
          sortField: 'price',
          title: 'Price',
          required: true,
          type: Enums.InputType.NUMBER
        },
        {
          name: 'currency_type',
          title: 'Currency Code',
          required: true,
          type: Enums.InputType.INPUT
        },
        {
          name: 'payment_method',
          title: 'Payment Method',
          required: true,
          type: Enums.InputType.SIMPLE_SELECT,
          options: [
            {name: 'Before Boarding', value: 1},
            {name: 'On Board', value: 0},
          ]
        },
        {
          name: 'transfers',
          title: 'Transfers',
          options: [
            {name: 0, value: 0},
            {name: 1, value: 1},
            {name: 2, value: 2},
            {name: 'Unlimited', value: null},
          ],
          required: true,
          type: Enums.InputType.SIMPLE_SELECT,
        },
        {
          name: 'agency_id',
          title: 'Agency',
          sortField: 'agency_id',
          required: true,
          foreignKey: true,
          id_field: 'agency',
          ajax_params: {
            url: agenciesAPI.agenciesAPI.getFullBaseURL(this.$route.params.projectId),
          },
          type: Enums.InputType.FK_SELECT,
        },
        {
          name: 'transfer_duration',
          title: 'Duration [s]',
          required: true,
          type: Enums.InputType.NUMBER,
        },
      ],
    };
  },
  methods: {
    update(data) {
      return fareAttributesAPI.fareAttributesAPI.update(this.$route.params.projectId, data);
    },
    create(data) {
      return fareAttributesAPI.fareAttributesAPI.create(this.$route.params.projectId, data);
    },
    remove(data) {
      return fareAttributesAPI.fareAttributesAPI.remove(this.$route.params.projectId, data);
    },
    uploadCSV(file) {
      return fareAttributesAPI.fareAttributesAPI.uploadCSV(this.$route.params.projectId, file);
    },
    log(out) {
      console.log(out);
    },
  },
};
</script>
