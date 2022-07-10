let config = {
  stop_color: '#68614d',
  stop_hover_color: '#cf3a41',
  stop_creation_color: "#cf3a41",
  stop_selected_color: '#FFFFFF',
  stop_stroke_color: '#FFFFFF',
  stop_stroke_hover_color: '#cf3a41',
  stop_stroke_selected_color: '#cf3a41',
  stop_label_background_color: '#1F2B32',
  stop_label_background_hover_color: '#cf3a41',
  stop_label_color: '#FFFFFF',
  stop_zoom: [
    // Pairs of zoom level - radius of ball (in pixels). Gets interpolated
    12, 1.5,
    14, 4,
    20, 10,
  ],
  stop_creation_zoom: [
    12, 1.5,
    14, 4,
    20, 30,
  ],

  shape_line_color: "#c79414",
  shape_point_color: "#c79414",
  shape_fixed_line_color: '#CC1111',
  shape_connecting_line_color: '#CC8811',
  map_matching_color: '#7dc242',
  shape_point_zoom: [
    12, 1.5,
    14, 4,
    20, 10,
  ],

  stoptimes_stop_zoom: [
    12, 1.5,
    14, 4,
    20, 10,
  ],

  map_base_zoom: 0,
}
export default config;