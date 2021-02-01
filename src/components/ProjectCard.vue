<template>
    <a href="#" class="card project-card">
        <div class="project-card-map">
            <EnvelopeMap :project="project"></EnvelopeMap>
        </div>
        <div class="card-content">
            <div class="grid title">
                <h2>{{project.name}}</h2>
                <button class="btn icon flat"><i class="material-icons">more_vert</i></button>
            </div>
            <div class="grid project-details">
                <div class="project-id">
                    <strong>
                        <span>ID:</span>
                        <span>{{project.project_id}}</span>
                    </strong>
                </div>
                <div class="project-last-edit">
                    <span>Last edit: </span>
                    <span>{{project.last_modification}}</span>
                </div>
            </div>
            <div class="grid-pills">
                <PillBase pillClass="error" :pillText="'Errors: 1'"></PillBase>
                <PillBase pillClass="warning" :pillText="'Warnings:3'"></PillBase>
            </div>
        </div>
    </a>
</template>

<script>
    import PillBase from "./PillBase";
    import EnvelopeMap from "./EnvelopeMap";
export default {
    name: 'ProjectCard',
    components: {
        PillBase,
        EnvelopeMap
    },
    props: {
        project:{
            type:Object,
            required:true
        }
    },
}
</script>
