var origin_x = 300;
var origin_y = 300;

var global_dragging = false;
var global_first_endpoint = false;
var global_second_endpoint = false;
var global_first_endpoint_object = null;
var global_second_endpoint_object = null;

var anchor_size = 5;

var paper = Snap("#svg");

var grid_pattern_small = paper.path("M 10 0 L 0 0 0 10").attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 0.5
}).pattern(0, 0, 10, 10);

var grid_pattern_big = paper.path("M 100 0 L 0 0 0 100").attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 1
}).pattern(0, 0, 100, 100);

var bg = paper.rect(-15000, -15000, 30000, 30000, 0, 0).attr({
    fill: "#fefefe"
});

var grid_small = paper.rect(-15000, -15000, 30000, 30000, 0, 0).attr({
    fill: grid_pattern_small
});

var grid_big = paper.rect(-15000, -15000, 30000, 30000, 0, 0).attr({
    fill: grid_pattern_big
});

var arrow_start = paper.path("M0,3 L-10,0 L0,-3").attr({stroke: "#aaa", fill: "none"});
var arrow_end = paper.path("M0,3 L10,0 L0,-3").attr({stroke: "#aaa", fill: "none"});
var marker_start = arrow_start.marker(-10,-6, 20,12, -10,0);
var marker_end = arrow_end.marker(-10,-6, 20,12, 10,0);

var distance_x_line = paper.line(0, 0, 0, 0).attr({
    stroke: "#aaa",
    strokeWidth: 2,
    markerStart: marker_start,
    markerEnd: marker_end
});
var distance_x_text = paper.text(0, 0, "");
var distance_x = paper.group(distance_x_line, distance_x_text);
distance_x_text.transform("scale(1,-1)");
distance_x.attr({ visibility: "hidden" });

var distance_y_line = paper.line(0, 0, 0, 0).attr({
    stroke: "#aaa",
    strokeWidth: 2,
    markerStart: marker_start,
    markerEnd: marker_end
});
var distance_y_text = paper.text(0, 0, "");
var distance_y = paper.group(distance_y_line, distance_y_text);
distance_y_text.transform("scale(1,-1)");
distance_y.attr({ visibility: "hidden" });

var center = paper.circle(0, 0, 10).attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 2
});
