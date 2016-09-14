function mouse_wheel_handler (ev) {
    ev.preventDefault();

    if (ev.deltaY < 0) {
        if (zoom_level < 3) {
            zoom_level += 0.10;
        }
    } else {
        if (zoom_level > 0.15) {
            zoom_level -= 0.10;
        }
    }

    if (zoom_level < 0.25) {
        grid_small.attr({ fill: grid_pattern_mm });
        grid_big.attr({ fill: grid_pattern_cm });
    } else if (zoom_level < 0.5) {
        anchor_size = 10;
        grid_small.attr({ fill: grid_pattern_mm });
        grid_big.attr({ fill: grid_pattern_cm });
    } else {
        anchor_size = 5;
        grid_small.attr({ fill: grid_pattern_tenth_mm });
        grid_big.attr({ fill: grid_pattern_mm });
    }

    //console.log(zoom_level);

    zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + zoom_level + ")");

}

var begin_drag_workspace = function(posx, posy, e) {
    if (global_dragging == true) {
        return;
    }

    //console.log(e.button);

    if (e.button == 2) {

        this.button = 2;

        this.origin_x = origin_x;
        this.origin_y = origin_y;

    } else if (e.button == 0) {

        this.button = 0;

        this.original_posx = posx - $('#svg').offset().left;///zoom_level;
        this.original_posy = posy - $('#svg').offset().top ;///zoom_level;

        selection_box.attr({
            x: this.original_posx,
            y: this.original_posy,
            width: 0,
            height: 0,
            visibility: "visible"
        });
    }
};

var drag_workspace = function(dx, dy, posx, posy, e) {
    if (global_dragging == true) {
        return;
    }

    if (this.button == 2) {
        origin_x = this.origin_x + dx;
        origin_y = this.origin_y + dy;
        zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + zoom_level + ")");

    } else if (this.button == 0) {

        var offset_x = 0;
        var offset_y = 0;

        if (dx < 0) {
            offset_x = dx;
            dx = -1*dx;
        }

        if (dy < 0) {
            offset_y = dy;
            dy = -1*dy;
        }

        selection_box.transform("translate(" + offset_x + "," + offset_y + ")");

        selection_box.attr({
            x: this.original_posx,
            y: this.original_posy,
            width: dx,
            height: dy
        });
    }
}

var end_drag_workspace = function(e) {
    if (global_dragging == true) {
        return;
    }

    if (this.button == 0) {

        selection_box.attr({ visibility: "hidden" });
        var selection_bbox = selection_box.getBBox();

        if (selection_bbox.width > 0 || selection_bbox.height > 0) {
            deselect_all_objects();
        }

        for (var i = 0; i < objects.length; i++) {

            var object = objects[i];

            if (object.graphical_group != undefined) {
                var object_bbox = object.graphical_group.getBBox();

                if (object_bbox.x  >= (selection_bbox.x  - origin_x)/zoom_level &&
                    object_bbox.x  <= (selection_bbox.x2 - origin_x)/zoom_level &&
                    object_bbox.x2 >= (selection_bbox.x  - origin_x)/zoom_level &&
                    object_bbox.x2 <= (selection_bbox.x2 - origin_x)/zoom_level ) {

                    if (object_bbox.y  >= (selection_bbox.y  - origin_y)/zoom_level &&
                        object_bbox.y  <= (selection_bbox.y2 - origin_y)/zoom_level &&
                        object_bbox.y2 >= (selection_bbox.y  - origin_y)/zoom_level &&
                        object_bbox.y2 <= (selection_bbox.y2 - origin_y)/zoom_level ) {

                          object.select();
                          //console.log(object);
                   }
                }
            }
        }

    }
};

var deselect_all_objects = function() {
    objects.forEach( function(object, index, array) {
        if (typeof object == "object") {
            object.unselect();
        }
    });
}

paper.node.addEventListener("wheel", mouse_wheel_handler, false);
paper.drag(drag_workspace, begin_drag_workspace, end_drag_workspace);

var zoom_level = 1;

var zoom_group = paper.group(grid_small, grid_big, center, distance_x, distance_y, copperplane, solderstop);
zoom_group.transform("translate(" + origin_x + "," + origin_y + ") scale(" + zoom_level + "," + zoom_level + ")");
