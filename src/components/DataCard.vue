<template>
    <a href="#" class="card data-card">
        <div class="data-header header">
          <h4>Agencies</h4>
          <div class="btn-list">
            <button class="btn icon flat"><i class="material-icons">edit</i></button>
            <button class="btn icon flat"><i class="material-icons">more_vert</i></button>
          </div>
        </div>
        <div class="data-content">
          <ul class="data-body">
            <li>
              <span class="big">24</span>
              <span>Added</span>
            </li>
          </ul>
          <div class="data-footer">
            <PillBase pillClass="warning" :pillText="3"></PillBase>
            <PillBase pillClass="error" :pillText="3"></PillBase>
          </div>
        </div>
    </a>
</template>

<script>
    import PillBase from "./PillBase";
export default {
    name: 'DataCard',
    components: {
        PillBase
    },
    props: {
        project:{
            type:Object,
            required:true
        },
      state: {
          type:Number,
          required: true

      }
    },
}
</script>
