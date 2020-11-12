<template>
    <div class="ProjectDashboard" style="width: 100%; display:flex; justify-content: space-around;">
        <div id="TablesTable" style="flex: 1">
            <table>
                <tbody>
                    <tr>
                        <th>GTFS Tables</th>
                    </tr>
                    <tr v-for="table in tables" :key="table">
                        <td>
                            <router-link :to="{ name: table, params: { projectid: $route.params.projectid }}">{{table}}
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="Buttons" class="list-container" style="flex: 1">
            <div class="list">
                <button class="btn list-item" style="width: 100%">Project Settings</button>
                <button class="btn list-item" style="width: 100%">Upload GTFS File</button>
                <button class="btn list-item" style="width: 100%">Validate</button>
                <button class="btn list-item" style="width: 100%">Publication</button>
                <button class="btn list-item" style="width: 100%">Download as GTFS</button>
            </div>
        </div>
        <div id="ProjectInfo">
            <table>
                <tbody>
                    <tr>
                        <th colspan=2>Feed Information</th>
                    </tr>
                    <tr>
                        <td>Last Edited</td>
                        <td>Never</td>
                    </tr>
                    <tr>
                        <td>Last Validated</td>
                        <td>Never</td>
                    </tr>
                    <tr>
                        <td>Start Date</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_start_date:'' }}</td>
                    </tr>
                    <tr>
                        <td>End Date</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_end_date:'' }}</td>
                    </tr>
                    <tr>
                        <td>Version</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_version:'' }}</td>
                    </tr>
                </tbody>
            </table>
            <table>
                <tbody>
                    <tr>
                        <th>Last Validation</th>
                    </tr>
                    <tr>
                        <td>0 errors</td>
                    </tr>
                    <tr>
                        <td>0 warnings</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import projectsAPI from '@/api/projects.api';

    export default {
        name: 'ProjectDashboard',
        data() {
            return {
                project: {
                    feedInfo: {},
                },
                tables: [
                    "FeedInfo", "Agencies", "Calendars", "Stops", "Routes", "Shapes", "Trips", "Stop Times",
                    "Frequencies", "Calendar Dates", "Fare Attributes", "Fare Rules", "Transfers", "Pathways", "Levels"
                ]
            }
        },
        methods: {
            initData() {
                projectsAPI.getProjectDetail(this.$route.params.projectid).then(response => {
                    this.project = response.data;
                });
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => vm.initData());
        },
    }
</script>