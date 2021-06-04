import Vue from 'vue'
import VueRouter from 'vue-router'


import NotFound from '../views/NotFound.vue'


import MyProjects from '../views/MyProjects.vue'
import ProjectDashboard from '../views/ProjectDashboard.vue'
import CalendarView from '../views/CalendarView.vue'
import TripsView from '../views/TripsView.vue'
import StopTimesView from '../views/StopTimesView.vue'
import StopTimesEditorView from '../views/StopTimesEditorView.vue'
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
import ShapeEditorView from '../views/ShapeEditorView.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '',
    redirect: '/myprojects'
  },
  {
    path: '/myprojects',
    name: 'myprojects',
    component: MyProjects,
    meta: {
      breadcrumb() {
        return this.$i18n.t('myProjects.myProjects');
      }
    }
  },
  {
    path: '/project/:projectId',
    component: {render(c) { return c('router-view'); }},
    meta: {
      breadcrumb(routeParams) {
        return this.$i18n.t('general.project') + ' ' + routeParams.projectId;
      }
    },
    children: [
      {
        path: '',
        name: 'projectoverview',
        component: ProjectDashboard,
      },
      {
        path: '/project/:projectId/agencies',
        name: 'Agencies',
        component: AgencyView,
        meta: {
          breadcrumb: 'Agencies'
        },
      },
      {
        path: '/project/:projectId/calendars',
        name: 'Calendars',
        component: CalendarView,
        meta: {
          breadcrumb: 'Calendars'
        },
      },
      {
        path: '/project/:projectId/calendardates',
        name: 'CalendarDates',
        component: CalendarDateView,
        meta: {
          breadcrumb: 'CalendarDates'
        },
      },
      {
        path: '/project/:projectId/trips',
        name: 'Trips',
        component: TripsView,
        meta: {
          breadcrumb: 'Trips'
        },
      },
      {
        path: '/project/:projectId/stoptimes',
        component: {render(c) { return c('router-view'); }},
        meta: {
          breadcrumb: 'StopTimes'
        },
        children: [
          {
            path: '',
            name: 'StopTimes',
            component: StopTimesView,
          },
          {
            path: '/project/:projectId/stoptimes/create',
            name: 'createShape',
            component: StopTimesEditorView,
            props: true,
            meta: {
              breadcrumb: 'Create'
            }
          },
          {
            path: '/project/:projectId/stoptimes/:stoptimeId',
            name: 'editStopTime',
            component: StopTimesEditorView,
            props: true,
            meta: {
              breadcrumb: 'Edit'
            }
          }
        ]
      },
      {
        path: '/project/:projectId/stops',
        name: 'Stops',
        component: StopsView,
        meta: {
          breadcrumb: 'Stops'
        },
      },
      {
        path: '/project/:projectId/routes',
        name: 'Routes',
        component: RoutesView,
        meta: {
          breadcrumb: 'Routes'
        },
      },
      {
        path: '/project/:projectId/frequencies',
        name: 'Frequencies',
        component: FrequencyView,
        meta: {
          breadcrumb: 'Frequencies'
        },
      },
      {
        path: '/project/:projectId/fareattributes',
        name: 'FareAttributes',
        component: FareAttributesView,
        meta: {
          breadcrumb: 'Fare Attributes'
        },
      },
      {
        path: '/project/:projectId/farerules',
        name: 'FareRules',
        component: FareRulesView,
        meta: {
          breadcrumb: 'Fare Rules'
        },
      },
      {
        path: '/project/:projectId/transfers',
        name: 'Transfers',
        component: TransfersView,
        meta: {
          breadcrumb: 'Transfers'
        },
      },
      {
        path: '/project/:projectId/pathways',
        name: 'Pathways',
        component: PathwaysView,
        meta: {
          breadcrumb: 'Pathways'
        },
      },
      {
        path: '/project/:projectId/levels',
        name: 'Levels',
        component: LevelsView,
        meta: {
          breadcrumb: 'Levels'
        },
      },
      {
        path: '/project/:projectId/shapes',
        component: {render(c) { return c('router-view'); }},
        meta: {
          breadcrumb: 'Shapes'
        },
        children: [
          {
            path: '',
            name: 'Shapes',
            component: Shapes,
          },
          {
            path: '/project/:projectId/shapes/create',
            name: 'createShape',
            component: ShapeEditorView,
            props: true,
            meta: {
              breadcrumb: 'Create'
            }
          },
          {
            path: '/project/:projectId/shapes/:shapeId',
            name: 'editShape',
            component: ShapeEditorView,
            props: true,
            meta: {
              breadcrumb: 'Edit'
            }
          }
        ]
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