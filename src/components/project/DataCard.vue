<template>
  <router-link class="card data-card" :class="[cardClass]" :event="state===DataCardEnum.BLOCKED?'':'click'"
               :to="{name: viewName, params: { projectid: projectId }}">
    <div class="data-header header">
      <h4>{{ filename }}</h4>
      <div class="btn-list">
        <div class="icon flat" v-if="state===DataCardEnum.BLOCKED"><i class="material-icons">lock</i></div>
        <div class="icon flat warning" v-if="state===DataCardEnum.EMPTY"><i class="material-icons">warning</i></div>
        <button class="btn icon flat" v-if="state===DataCardEnum.ENABLED"><i class="material-icons">edit</i></button>
        <button class="btn icon flat"><i class="material-icons">more_vert</i></button>
      </div>
    </div>
    <div class="data-content">
      <div class="data-body" v-if="[DataCardEnum.EMPTY,DataCardEnum.BLOCKED].indexOf(state)>-1">
        <span><span>{{ message }}</span></span>
      </div>
      <ul class="data-body" v-if="state===DataCardEnum.ENABLED">
        <li>
          <span class="big">{{ quantity }}</span>
          <span>{{ $t('dataCard.records') }}</span>
        </li>
      </ul>
      <div class="data-footer">
        <button class="btn" v-if="[DataCardEnum.EMPTY,DataCardEnum.BLOCKED].indexOf(state)>-1"
                :disabled="state===DataCardEnum.BLOCKED"><span>{{ $t('dataCard.add') }}</span></button>
        <PillBase v-if="state===DataCardEnum.ENABLED && warningNumber !==0" pillClass="warning"
                  :pillText="warningNumber"></PillBase>
        <PillBase v-if="state===DataCardEnum.ENABLED && errorNumber !==0" pillClass="error"
                  :pillText="errorNumber"></PillBase>
      </div>
    </div>
  </router-link>
</template>

<script>
import PillBase from "@/components/PillBase.vue";
import Enums from '@/utils/enums';

export default {
  name: 'DataCard',
  components: {
    PillBase
  },
  props: {
    filename: {
      type: String,
      required: true
    },
    projectId: {
      type: [String, Number],
      required: true
    },
    viewName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: null,
    },
    message: {
      type: String,
      default: ''
    },
    errorNumber: {
      type: Number,
      default: 0
    },
    warningNumber: {
      type: Number,
      default: 0
    },
    state: {
      type: String,
      default: Enums.DataCard.ENABLED,
      required: true,
      validation(value) {
        return [Enums.DataCard.Empty, Enums.DataCard.BLOCKED, Enums.DataCard.ENABLED].indexOf(value) !== -1;
      }
    }
  },
  data() {
    return {
      DataCardEnum: Enums.DataCard
    }
  },
  computed: {
    cardClass() {
      let className = null;
      switch (this.state) {
        case Enums.DataCard.EMPTY:
          className = 'empty';
          break;
        case Enums.DataCard.BLOCKED:
          className = 'locked';
          break;
        case Enums.DataCard.ENABLED:
          className = null;
          break;
      }
      return className;
    }
  }
}
</script>
