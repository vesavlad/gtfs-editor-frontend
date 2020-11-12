<template>
    <div>
        <EditableTable :fields="fields" :url="url" :updateMethod="update" :deleteMethod="remove" :createMethod="create"
            :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
        </EditableTable>
    </div>
</template>

<script>
    import EditableTable from "@/components/EditableTable.vue";
    import pathwaysAPI from '@/api/pathways.api';
    import stopsAPI from '@/api/stops.api'
    export default {
        components: {
            EditableTable,
        },
        data() {
            return {
                url: pathwaysAPI.pathwaysAPI.getFullBaseURL(this.$route.params.projectid),
                downloadURL: pathwaysAPI.pathwaysAPI.getDownloadURL(this.$route.params.projectid),
                fields: [
                    'actions',
                    {
                        name: "pathway_id",
                        title: "Pathway*"
                    },
                    {
                        name: 'pathway_mode',
                        title: 'Mode',
                        type: "select-simple",
                        options: {
                            'walkway': 1,
                            'stairs': 2,
                            'moving sidewalk/travelator': 3,
                            'escalator': 4,
                            'elevator': 5,
                            'fare gate (or payment gate)': 6,
                            'exit gate': 7,
                        },
                    },
                    {
                        name: 'from_stop_id',
                        title: 'From Stop*',
                        sortField: 'from_stop_id',
                        foreignKey: true,
                        name_field: 'stop_id',
                        id_field: 'from_stop',
                        ajax_params: {
                            url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectid),
                        }
                    },
                    {
                        name: 'to_stop_id',
                        title: 'To Stop*',
                        sortField: 'to_stop_id',
                        foreignKey: true,
                        name_field: 'stop_id',
                        id_field: 'to_stop',
                        ajax_params: {
                            url: stopsAPI.stopsAPI.getFullBaseURL(this.$route.params.projectid),
                        }
                    },
                    {
                        name: "is_bidirectional",
                        title: "Bidirectional",
                        data_type: 'checkbox',
                    },
                ],
            };
        },
        methods: {
            update(data) {
                return pathwaysAPI.pathwaysAPI.update(this.$route.params.projectid, data);
            },
            create(data) {
                return pathwaysAPI.pathwaysAPI.create(this.$route.params.projectid, data);
            },
            remove(data) {
                return pathwaysAPI.pathwaysAPI.remove(this.$route.params.projectid, data);
            },
            uploadCSV(file) {
                return pathwaysAPI.pathwaysAPI.uploadCSV(this.$route.params.projectid, file);
            },
        },
    };
</script>