let shapeMapMixin = {
  methods: {
    getBounds(points) {
      points = points.map(point => {
        if(point instanceof Array) {
          return point;
        }
        if( point instanceof Object) {
          return [point.lng,point.lat];
        }
      })
      // We start with the entire world
      let minlon = 180;
      let minlat = 90;
      let maxlon = -180;
      let maxlat = -90;
      // First point is gonna override all 4 defaults, then we slowly expand the square to incorporate any new points
      points.forEach(point => {
        minlon = Math.min(point[0], minlon)
        minlat = Math.min(point[1], minlat)
        maxlon = Math.max(point[0], maxlon)
        maxlat = Math.max(point[1], maxlat)
      });
      return [
        [minlon, minlat],
        [maxlon, maxlat],
      ]
    }
  }
}

export default shapeMapMixin;