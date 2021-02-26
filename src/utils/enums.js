const Enums = {
  DataCard: {
    EMPTY: 'empty',
    BLOCKED: 'blocked',
    ENABLED: 'enabled'
  },
  ProjectCardStatus: {
    OK: 'ok',
    LOADING: 'loading',
    ERROR: 'error'
  },
  MenuBoxPlacement: {
    UPPER_LEFT: 'upperLeft',
    UPPER_RIGHT: 'upperRight'
  },
  MessageModalType: {
    ERROR: 'error',
    WARNING: 'warning'
  },
  BuildAndValidateGTFS: {
    QUEUED: 'queued',
    BUILDING: 'building',
    VALIDATING: 'validating',
    FINISHED: 'finished',
    ERROR: 'error',
    CANCELED: 'canceled'
  },
  ProjectCreationStatus: {
    EMPTY: 'empty',
    LOADING_GTFS: 'loading_gtfs',
    ERROR_LOADING_GTFS: 'error_loading_gtfs',
    FROM_GTFS: 'from_gtfs'
  },
  InputType: {
    INPUT: 'input',
    DATE: 'date',
    URL: 'url',
    EMAIL: 'email',
    CHECKBOX: 'checkbox',
    COLOR: 'color',
    SIMPLE_SELECT: 'simple-select',
    FK_SELECT: 'fk-select'
  },
  ProjectCreationType: {
    EMPTY: 'empty',
    FROM_GTFS: 'from_gtfs'
  }
}

export default Enums