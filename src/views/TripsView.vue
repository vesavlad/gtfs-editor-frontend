<template>
    <div>
        <EditableTable :fields="fields" :url="url" :updateMethod="updateTrip" :deleteMethod="removeTrip"
      :createMethod="createTrip" :downloadURL="downloadURL" :uploadCSV="uploadCSV" :searchable="true">
        </EditableTable>
    </div>
</template>

<script>
    import EditableTable from "@/components/EditableTable.vue";
    import tripsAPI from '@/api/trips.api';
    import routesAPI from '@/api/routes.api';
    import shapesAPI from '@/api/shapes.api';
    export default {
        components: {
            EditableTable,
        },
        data() {
            return {
                url: tripsAPI.tripsAPI.getFullBaseURL(this.$route.params.projectid),
                downloadURL: tripsAPI.tripsAPI.getDownloadURL(this.$route.params.projectid),
                fields: [
                    'actions',
                    {
                        name: 'trip_id',
                        title: 'Trip*',
                        sortField: 'trip_id',
                    },
                    {
                        name: 'route_id',
                        title: 'Route*',
                        sortField: 'route_id',
                        foreignKey: true,
                        id_field: 'route',
                        ajax_params: {
                            url: routesAPI.routesAPI.getFullBaseURL(this.$route.params.projectid),
                        }
                    },
                    {
                        name: 'shape_id',
                        title: 'Shape',
                        sortField: 'shape',
                        foreignKey: true,
                        nullable: true,
                        id_field: 'shape',
                        ajax_params: {
                            url: shapesAPI.shapesAPI.getFullBaseURL(this.$route.params.projectid),
                        }
                    },
                    {
                        name: 'service_id',
                        title: 'Service*',
                    },
                    {
                        name: 'trip_headsign',
                        title: 'Headsign',
                    },
                    {
                        name: "direction_id",
                        title: "Direction",
                        type: "select-simple",
                        options: {
                            'Going': true,
                            'Back': false,
                        },
                    },
                    {
                        name: "trip_short_name",
                        title: "Short Name",
                    },
                    {
                        name: "block_id",
                        title: "Block",
                    },
                    {
                        name: "wheelchair_accessible",
                        title: "Wheelchair Accessible",
                        type: "select-simple",
                        options: {
                            'Unknown': null,
                            'Yes': 1,
                            'No': 0,
                        },
                    },
                    {
                        name: "bikes_allowed",
                        title: "Bikes Allowed",
                        type: "select-simple",
                        options: {
                            'Unknown': null,
                            'Yes': 1,
                            'No': 0,
                        },
                    },
                ],
            };
        },
        methods: {
            updateTrip(data) {
                return tripsAPI.tripsAPI.update(this.$route.params.projectid, data);
            },
            createTrip(data) {
                return tripsAPI.tripsAPI.create(this.$route.params.projectid, data);
            },
            removeTrip(data) {
                return tripsAPI.tripsAPI.remove(this.$route.params.projectid, data);
            },
            uploadCSV(file) {
                return tripsAPI.tripsAPI.uploadCSV(this.$route.params.projectid, file);
            },
        },
    };
</script>