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
    NUMBER: 'number',
    EMAIL: 'email',
    TIME: 'time',
    CHECKBOX: 'checkbox',
    COLOR: 'color',
    SIMPLE_SELECT: 'simple-select',
    FK_SELECT: 'fk-select'
  },
  ProjectCreationType: {
    EMPTY: 'empty',
    FROM_GTFS: 'from_gtfs'
  },
  ShapeEditorMode: {
    CREATE: 'create',
    EDIT: 'edit',
  },
  ShapeEditorEditionMode: {
    SIMPLE: 'simple',
    RANGE: 'range',
    DUPLICATE: 'duplicate'
  },
  InteractiveMapStatus: {
    READER: 'reader',
    ADDING_NEW_POINT: 'addingNewPoint',
    FILL_NEW_DATA_POINT: 'addDataPoint',
    EDIT_DATA_POINT: 'editDataPoint'
  }
}

export default Enums