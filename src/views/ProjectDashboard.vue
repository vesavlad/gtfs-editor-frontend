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
                            <router-link :to="{ name: table, params: { projectid: $route.params.projectid }}">{{table}}</router-link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="Buttons" class="list-container" style="flex: 1">
            <div class="list">
                <button class="btn list-item" style="width: 100%">Project Settings</button>
                <button class="btn list-item" style="width: 100%">Upload GTFS File</button>
                <button class="btn list-item" style="width: 100%" @click="validateButtonAction">Validate</button>
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
                        <td>Publisher name</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_publisher_name:'' }}</td>
                    </tr>
                    <tr>
                        <td>Publisher URL</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_publisher_url:'' }}</td>
                    </tr>
                    <tr>
                        <td>Start Date</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_start_date:'' }}</td>
                    </tr>
                    <tr>
                        <td>Lang</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_lang:'' }}</td>
                    </tr>
                    <tr>
                        <td>End Date</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_end_date:'' }}</td>
                    </tr>
                    <tr>
                        <td>Version</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_version:'' }}</td>
                    </tr>
                    <tr>
                        <td>Feed id</td>
                        <td>{{ project.feedinfo?project.feedinfo.feed_id:'' }}</td>
                    </tr>
                </tbody>
            </table>
            <br />
            <table>
                <tbody>
                    <tr>
                        <th colspan="2">Last GTFS Validation</th>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td>{{ project.gtfsvalidation.status }}</td>
                    </tr>
                    <tr>
                        <td>Execution</td>
                        <td>{{ (new Date(project.gtfsvalidation.ran_at)).toLocaleString() }}</td>
                    </tr>
                    <tr>
                        <td>Duration</td>
                        <td>{{ project.gtfsvalidation.duration }}</td>
                    </tr>
                    <tr>
                        <td>Errors</td>
                        <td>{{ project.gtfsvalidation.error_number }}</td>
                    </tr>
                    <tr>
                        <td>Warnings</td>
                        <td>{{ project.gtfsvalidation.warning_number }}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><button class="btn list-item" style="width: 100%" :disabled="project.gtfsvalidation.status!=='finished'" @click="seeGTFSValidationResults">see results</button></td>
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
                    gtfsvalidation: {}
                },
                showModal: false,
                modalContent: '',
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
            },
            seeGTFSValidationResults() {
                let content = this.project.gtfsvalidation.status==='error'?this.project.gtfsvalidation.error_message:this.project.gtfsvalidation.message;
                this.modalContent = content;
                this.showModal = true;
            },
            validateButtonAction() {
                let status = this.project.gtfsvalidation?this.project.gtfsvalidation.status:null;
                if (['queued', 'processing'].indexOf(status) >= 0) {
                    this.cancelGTFSValidation();
                } else {
                    this.runGTFSValidation();
                }
            },
            runGTFSValidation() {
                projectsAPI.runGTFSValidation(this.$route.params.projectid).then(response => {
                    this.project.gtfsvalidation = response.data;
                    this.runPeriodicCall();
                }).catch(error => {
                    this.modalContent = error.response.data[0];
                    this.showModal = true;
                });
            },
            cancelGTFSValidation() {
                projectsAPI.cancelGTFSValidation(this.$route.params.projectid).then(response => {
                    this.project.gtfsvalidation = response.data;
                    clearInterval(this.interval);
                }).catch(error => {
                    this.modalContent = error.response.data[0];
                    this.showModal = true;
                });
            },
            runPeriodicCall() {
                clearInterval(this.interval);
                this.interval = setInterval(() => {
                    console.log('updated gtfs validation status...');
                    projectsAPI.getProjectDetail(this.$route.params.projectid).then(response => {
                        if (['finished', 'error', 'canceled'].indexOf(response.data.gtfsvalidation.status) > -1 ) {
                            clearInterval(this.interval);
                        }
                        this.project.gtfsvalidation = response.data.gtfsvalidation;
                    });
                }, 5000);
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => vm.initData());
        },
    }
</script>