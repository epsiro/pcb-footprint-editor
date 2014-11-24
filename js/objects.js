function add_object(changed_line, line_nr) {

    //var changed_line = editor.getLine(line);

    if (changed_line.match(/Element\[/)) {
        values = parse_element(changed_line);
        object_instance = new Refdes(
            values.name,
            values.text_pos_x,
            values.text_pos_y,
            values.text_scale
        );

        console.log("Element added in objects[%d]: ", line_nr);
        //console.log(object_instance);
        object_instance.draw();
        zoom_group.add(object_instance.graphical_group);

        objects.splice(line_nr, 0, object_instance);
        objects.forEach(update_line_number);

        return 0;
    }

    if (changed_line.match(/Pad/)) {
        values = parse_pad_line(changed_line);
        object_instance = new Pad(line_nr, line_nr,
                values.x1,
                values.y1,
                values.x2,
                values.y2,
                values.thickness,
                values.clearance,
                values.mask_thickness
                );

        console.log("Pad added in objects[%d]: ", line_nr);
        //console.log(object_instance);
        object_instance.draw();
        zoom_group.add(object_instance.graphical_group);
        soldermask_group.add(object_instance.mask);
        copperplanemask_group.add(object_instance.clearance);

        objects.splice(line_nr, 0, object_instance);
        objects.forEach(update_line_number);

        return 0;
    }

    if (changed_line.match(/ElementLine/)) {
        values = parse_elementline(changed_line);
        object_instance = new ElementLine(
                values.x1,
                values.y1,
                values.x2,
                values.y2,
                values.thickness
                );

        console.log("ElementLine added in objects[%d]: ", line_nr);
        object_instance.draw();
        zoom_group.add(object_instance.graphical_group);

        objects.splice(line_nr, 0, object_instance);
        objects.forEach(update_line_number);

        return 0;
    }

    if (changed_line.match(/ElementArc/)) {
        values = parse_elementarc(changed_line);
        object_instance = new ElementArc(
                values.rx,
                values.ry,
                values.width,
                values.height,
                values.start_angle,
                values.delta_angle,
                values.thickness
                );

        console.log("ElementArc added in objects[%d]: ", line_nr);
        object_instance.draw();
        zoom_group.add(object_instance.graphical_group);

        objects.splice(line_nr, 0, object_instance);
        objects.forEach(update_line_number);

        return 0;
    }

    if (changed_line.match(/Pin/)) {
        //console.log(changed_line);
        values = parse_pin(changed_line);
        //console.log(values);
        object_instance = new Pin(
                values.cx,
                values.cy,
                values.pad_diameter,
                values.clearance,
                values.mask_diameter,
                values.hole_diameter
                );

        console.log("Pin added in objects[%d]: ", line_nr);
        object_instance.draw();
        zoom_group.add(object_instance.graphical_group);
        soldermask_group.add(object_instance.mask);
        copperplanemask_group.add(object_instance.clearance);

        objects.splice(line_nr, 0, object_instance);
        objects.forEach(update_line_number);

        return 0;
    }

    return 1;
}

function remove_object(line_nr) {

    //console.log(objects);
    object_instance = objects[line_nr];

    if (object_instance === "placeholder") {
        return 1;
    }

    if (object_instance === undefined) {
        return 1;
    }

    object_instance.graphical_group.remove();
    if (object_instance.mask != undefined) {
        object_instance.mask.remove();
    }
    if (object_instance.clearance != undefined) {
        object_instance.clearance.remove();
    }
    objects.splice(line_nr,1);
    console.log("Object removed: ", object_instance);
    objects.forEach(update_line_number);

    return 0;

}

function edit_object(changed_line, line_nr) {

    if (changed_line.match(/Element\[/)) {
        values = parse_element(changed_line);

        objects[line_nr].x = values.text_pos_x;
        objects[line_nr].y = values.text_pos_y;
        objects[line_nr].refdes_text = values.name;
        objects[line_nr].text_scale = values.text_scale
        objects[line_nr].draw();
    }

    if (changed_line.match(/Pad/)) {

        values = parse_pad_line(changed_line);

        objects[line_nr].x1 = values.x1;
        objects[line_nr].y1 = values.y1;
        objects[line_nr].x2 = values.x2;
        objects[line_nr].y2 = values.y2;
        objects[line_nr].thickness = values.thickness;
        objects[line_nr].mask_margin = values.mask_thickness - values.thickness;
        objects[line_nr].clearance_margin = values.clearance;
        objects[line_nr].draw();

        return 0;
    }

    if (changed_line.match(/ElementLine/)) {

        values = parse_elementline(changed_line);

        objects[line_nr].x1 = values.x1;
        objects[line_nr].y1 = values.y1;
        objects[line_nr].x2 = values.x2;
        objects[line_nr].y2 = values.y2;
        objects[line_nr].thickness = values.thickness;
        objects[line_nr].draw();

        return 0;
    }

    if (changed_line.match(/ElementArc/)) {

        values = parse_elementarc(changed_line);

        objects[line_nr].rx = values.rx;
        objects[line_nr].ry = values.ry;
        objects[line_nr].width = values.width;
        objects[line_nr].height = values.height;
        objects[line_nr].start_angle = values.start_angle;
        objects[line_nr].delta_angle = values.delta_angle;
        objects[line_nr].thickness = values.thickness;
        objects[line_nr].draw();

        return 0;
    }

    if (changed_line.match(/Pin/)) {

        values = parse_pin(changed_line);

        objects[line_nr].cx = values.cx;
        objects[line_nr].cy = values.cy;
        objects[line_nr].pad_diameter = values.pad_diameter;
        objects[line_nr].clearance_margin = values.clearance;
        objects[line_nr].mask_margin = values.mask_diameter - values.pad_diameter;
        objects[line_nr].hole_diameter = values.hole_diameter;
        objects[line_nr].draw();

        return 0;
    }

    return 1;
}

function update_line_number(element, index, array) {
    element.line_number = objects.indexOf(element);
}

var objects = new Array();

objects.push("placeholder");
