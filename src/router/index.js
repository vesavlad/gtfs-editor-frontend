import Vue from 'vue'
import VueRouter from 'vue-router'


import NotFound from '../views/NotFound.vue'



import MyProjects from '../views/MyProjects.vue'
import ProjectDashboard from '../views/ProjectDashboard.vue'
import CalendarView from '../views/CalendarView.vue'
import TripsView from '../views/TripsView.vue'
import StopTimes from '../views/StopTimes.vue'
import AgencyView from '../views/AgencyView.vue'
import StopsView from '../views/StopsView.vue'
import RoutesView from '../views/RoutesView.vue'
import CalendarDateView from '../views/CalendarDateView.vue'
import FrequencyView from '../views/FrequencyView.vue'
import FareAttributesView from '../views/FareAttributesView.vue'
import FareRulesView from '../views/FareRulesView.vue'
import LevelsView from '../views/LevelsView.vue'
import TransfersView from '../views/TransfersView.vue'
import PathwaysView from '../views/PathwaysView.vue'
import Shapes from '../views/Shapes.vue'


Vue.use(VueRouter)

const routes = [{
    path: '',
    redirect: '/myprojects'
  },
  {
    path: '/myprojects',
    name: 'myprojects',
    component: MyProjects,
    meta: {
      breadcrumb() {
        return this.$i18n.t('myProjects');
      }
    }
  },
  {
    path: '/project/:projectid',
    component: {render(c) { return c('router-view'); }},
    meta: {
      breadcrumb(routeParams){
        return this.$i18n.t('project') + ' ' + routeParams.projectid;
      }
    },
    children: [
      {
        path: '',
        name: 'projectoverview',
        component: ProjectDashboard,
      },
      {
        path: '/project/:projectid/agencies',
        name: 'Agencies',
        component: AgencyView,
        meta: {
          breadcrumb: 'Agencies'
        },
      },
      {
        path: '/project/:projectid/calendars',
        name: 'Calendars',
        component: CalendarView,
        meta: {
          breadcrumb: 'Calendars'
        },
      },
      {
        path: '/project/:projectid/calendardates',
        name: 'CalendarDates',
        component: CalendarDateView,
        meta: {
          breadcrumb: 'CalendarDates'
        },
      },
      {
        path: '/project/:projectid/trips',
        name: 'Trips',
        component: TripsView,
        meta: {
          breadcrumb: 'Trips'
        },
      },
      {
        path: '/project/:projectid/stoptimes',
        name: 'StopTimes',
        component: StopTimes,
        meta: {
          breadcrumb: 'StopTimes'
        },
      },
      {
        path: '/project/:projectid/stops',
        name: 'Stops',
        component: StopsView,
        meta: {
          breadcrumb: 'Stops'
        },
      },
      {
        path: '/project/:projectid/routes',
        name: 'Routes',
        component: RoutesView,
        meta: {
          breadcrumb: 'Routes'
        },
      },
      {
        path: '/project/:projectid/frequencies',
        name: 'Frequencies',
        component: FrequencyView,
        meta: {
          breadcrumb: 'Frequencies'
        },
      },
      {
        path: '/project/:projectid/fareattributes',
        name: 'FareAttributes',
        component: FareAttributesView,
        meta: {
          breadcrumb: 'Fare Attributes'
        },
      },
      {
        path: '/project/:projectid/farerules',
        name: 'FareRules',
        component: FareRulesView,
        meta: {
          breadcrumb: 'Fare Rules'
        },
      },
      {
        path: '/project/:projectid/transfers',
        name: 'Transfers',
        component: TransfersView,
        meta: {
          breadcrumb: 'Transfers'
        },
      },
      {
        path: '/project/:projectid/pathways',
        name: 'Pathways',
        component: PathwaysView,
        meta: {
          breadcrumb: 'Pathways'
        },
      },
      {
        path: '/project/:projectid/levels',
        name: 'Levels',
        component: LevelsView,
        meta: {
          breadcrumb: 'Levels'
        },
      },
      {
        path: '/project/:projectid/shapes',
        name: 'Shapes',
        component: Shapes,
        meta: {
          breadcrumb: 'Shapes'
        },
      },

    ]
  },
  {
    path: '/404',
    component: NotFound
  },
  {
    path: '*',
    redirect: '/404'
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router