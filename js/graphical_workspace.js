var origin_x = 300;
var origin_y = 300;

var global_dragging = false;
var global_first_endpoint = false;
var global_second_endpoint = false;
var global_first_endpoint_object = null;
var global_second_endpoint_object = null;

var anchor_size = 5;

var paper = Snap("#svg");

var grid_pattern_tenth_mm = paper.path("M 10 0 L 0 0 0 10").attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 0.5
}).pattern(0, 0, 10, 10);

var grid_pattern_mm = paper.path("M 100 0 L 0 0 0 100").attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 2
}).pattern(0, 0, 100, 100);

var grid_pattern_cm = paper.path("M 1000 0 L 0 0 0 1000").attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 5
}).pattern(0, 0, 1000, 1000);

var bg = paper.rect(-15000, -15000, 30000, 30000, 0, 0).attr({
    fill: "#fefefe"
});

var grid_small = paper.rect(-15000, -15000, 30000, 30000, 0, 0).attr({
    fill: grid_pattern_tenth_mm
});

var grid_big = paper.rect(-15000, -15000, 30000, 30000, 0, 0).attr({
    fill: grid_pattern_mm
});

var soldermask_bg = paper.rect(-15000, -15000, 30000, 30000).attr({fill:'white'});
var soldermask_group = paper.group(soldermask_bg);

var solderstop = paper.rect(-15000, -15000, 30000, 30000, 0, 0).attr({
  fill: "none",
  "fill-opacity": 0.5,
  mask: soldermask_group
});

var copperplanemask_bg = paper.rect(-15000, -15000, 30000, 30000).attr({fill:'white'});
var copperplanemask_group = paper.group(copperplanemask_bg);

var copperplane = paper.rect(-15000, -15000, 30000, 30000, 0, 0).attr({
  fill: "none",
  "fill-opacity": 0.8,
  mask: copperplanemask_group
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
//distance_x_text.transform("scale(1,-1)");
distance_x.attr({ visibility: "hidden" });

var distance_y_line = paper.line(0, 0, 0, 0).attr({
    stroke: "#aaa",
    strokeWidth: 2,
    markerStart: marker_start,
    markerEnd: marker_end
});
var distance_y_text = paper.text(0, 0, "");
var distance_y = paper.group(distance_y_line, distance_y_text);
//distance_y_text.transform("scale(1,-1)");
distance_y.attr({ visibility: "hidden" });

var center = paper.circle(0, 0, 10).attr({
    fill: "none",
    stroke: "gray",
    strokeWidth: 2
});

var path_arc_360 = paper.path(describe_arc_path(0,0,360,135,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_350 = paper.path(describe_arc_path(0,0,350,135,350)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_340 = paper.path(describe_arc_path(0,0,340,135,340)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_330 = paper.path(describe_arc_path(0,0,330,135,330)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_320 = paper.path(describe_arc_path(0,0,320,135,320)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_310 = paper.path(describe_arc_path(0,0,310,135,310)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_300 = paper.path(describe_arc_path(0,0,300,135,300)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_290 = paper.path(describe_arc_path(0,0,290,135,290)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_280 = paper.path(describe_arc_path(0,0,280,135,280)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_270 = paper.path(describe_arc_path(0,0,270,135,270)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_260 = paper.path(describe_arc_path(0,0,260,135,260)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_250 = paper.path(describe_arc_path(0,0,250,135,250)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_240 = paper.path(describe_arc_path(0,0,240,135,240)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_230 = paper.path(describe_arc_path(0,0,230,135,230)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_220 = paper.path(describe_arc_path(0,0,220,135,220)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_210 = paper.path(describe_arc_path(0,0,210,135,210)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_200 = paper.path(describe_arc_path(0,0,200,135,200)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_190 = paper.path(describe_arc_path(0,0,190,135,190)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_180 = paper.path(describe_arc_path(0,0,180,135,180)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_170 = paper.path(describe_arc_path(0,0,170,135,170)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_160 = paper.path(describe_arc_path(0,0,160,135,160)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_150 = paper.path(describe_arc_path(0,0,150,135,150)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_140 = paper.path(describe_arc_path(0,0,140,135,140)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_130 = paper.path(describe_arc_path(0,0,130,135,130)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_120 = paper.path(describe_arc_path(0,0,120,135,120)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_110 = paper.path(describe_arc_path(0,0,110,135,110)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_100 = paper.path(describe_arc_path(0,0,100,135,100)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_90  = paper.path(describe_arc_path(0,0,90 ,135,90 )).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_80  = paper.path(describe_arc_path(0,0,80 ,135,80 )).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_70  = paper.path(describe_arc_path(0,0,70 ,135,70 )).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_60  = paper.path(describe_arc_path(0,0,60 ,135,60 )).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_50  = paper.path(describe_arc_path(0,0,50 ,135,50 )).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_40  = paper.path(describe_arc_path(0,0,40 ,135,40 )).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_30  = paper.path(describe_arc_path(0,0,30 ,135,30 )).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_20  = paper.path(describe_arc_path(0,0,20 ,135,20 )).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
var path_arc_10  = paper.path(describe_arc_path(0,0,10 ,135,10 )).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });

//var path_arc_360 = paper.path(describe_arc_path(0,0,360,360,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_350 = paper.path(describe_arc_path(0,0,350,350,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_340 = paper.path(describe_arc_path(0,0,340,340,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_330 = paper.path(describe_arc_path(0,0,330,330,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_320 = paper.path(describe_arc_path(0,0,320,320,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_310 = paper.path(describe_arc_path(0,0,310,310,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_300 = paper.path(describe_arc_path(0,0,300,300,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_290 = paper.path(describe_arc_path(0,0,290,290,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_280 = paper.path(describe_arc_path(0,0,280,280,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_270 = paper.path(describe_arc_path(0,0,270,270,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_260 = paper.path(describe_arc_path(0,0,260,260,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_250 = paper.path(describe_arc_path(0,0,250,250,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_240 = paper.path(describe_arc_path(0,0,240,240,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_230 = paper.path(describe_arc_path(0,0,230,230,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_220 = paper.path(describe_arc_path(0,0,220,220,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_210 = paper.path(describe_arc_path(0,0,210,210,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_200 = paper.path(describe_arc_path(0,0,200,200,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_190 = paper.path(describe_arc_path(0,0,190,190,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_180 = paper.path(describe_arc_path(0,0,180,180,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_170 = paper.path(describe_arc_path(0,0,170,170,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_160 = paper.path(describe_arc_path(0,0,160,160,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_150 = paper.path(describe_arc_path(0,0,150,150,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_140 = paper.path(describe_arc_path(0,0,140,140,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_130 = paper.path(describe_arc_path(0,0,130,130,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_120 = paper.path(describe_arc_path(0,0,120,120,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_110 = paper.path(describe_arc_path(0,0,110,110,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_100 = paper.path(describe_arc_path(0,0,100,100,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_90  = paper.path(describe_arc_path(0,0,90 ,90 ,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_80  = paper.path(describe_arc_path(0,0,80 ,80 ,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_70  = paper.path(describe_arc_path(0,0,70 ,70 ,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_60  = paper.path(describe_arc_path(0,0,60 ,60 ,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_50  = paper.path(describe_arc_path(0,0,50 ,50 ,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_40  = paper.path(describe_arc_path(0,0,40 ,40 ,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_30  = paper.path(describe_arc_path(0,0,30 ,30 ,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_20  = paper.path(describe_arc_path(0,0,20 ,20 ,360)).attr({ fill: "none", stroke: "red", strokeWidth: 10, strokeLinecap: "round" });
//var path_arc_10  = paper.path(describe_arc_path(0,0,10 ,10 ,360)).attr({ fill: "none", stroke: "blue", strokeWidth: 10, strokeLinecap: "round" });

var path_arc = paper.group(
path_arc_360,
path_arc_350,
path_arc_340,
path_arc_330,
path_arc_320,
path_arc_310,
path_arc_300,
path_arc_290,
path_arc_280,
path_arc_270,
path_arc_260,
path_arc_250,
path_arc_240,
path_arc_230,
path_arc_220,
path_arc_210,
path_arc_200,
path_arc_190,
path_arc_180,
path_arc_170,
path_arc_160,
path_arc_150,
path_arc_140,
path_arc_130,
path_arc_120,
path_arc_110,
path_arc_100,
path_arc_90 ,
path_arc_80 ,
path_arc_70 ,
path_arc_60 ,
path_arc_50 ,
path_arc_40 ,
path_arc_30 ,
path_arc_20 ,
path_arc_10
);
