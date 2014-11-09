function add_object(changed_line, line_nr) {

    //var changed_line = editor.getLine(line);

    if (changed_line.match(/Pad/)) {
        values = parse_pad_line(changed_line);
        pad_instance = new Pad(line_nr, line_nr,
                values.x1,
                values.y1,
                values.x2,
                values.y2,
                values.thickness
                );

        console.log("Pad added in objects[%d]: ", line_nr);
        //console.log(pad_instance);
        pad_instance.draw();
        zoom_group.add(pad_instance.graphical_group);

        objects.splice(line_nr, 0, pad_instance);
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

        console.log("ElementLine added in objects[%d]: %s", line_nr);
        object_instance.draw();
        zoom_group.add(object_instance.graphical_group);

        objects.splice(line_nr, 0, object_instance);
        objects.forEach(update_line_number);

        return 0;
    }

    return 1;
}

function remove_object(changed_line, line_nr) {

    //console.log(objects);
    object_instance = objects[line_nr];

    if (object_instance === undefined) {
        return 1;
    }

    if (object_instance === "placeholder") {
        return 1;
    }

    object_instance.graphical_group.remove();
    objects.splice(line_nr,1);
    console.log("Object removed: ", object_instance);
    objects.forEach(update_line_number);

    return 0;

}

function edit_object(changed_line, line_nr) {

    if (changed_line.match(/Pad/)) {

        values = parse_pad_line(changed_line);

        objects[line_nr].x1 = values.x1;
        objects[line_nr].y1 = values.y1;
        objects[line_nr].x2 = values.x2;
        objects[line_nr].y2 = values.y2;
        objects[line_nr].thickness = values.thickness;
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

    return 1;
}

function update_line_number(element, index, array) {
    element.line_number = objects.indexOf(element);
}

function dblclick_handler(e) {
    if (tool_state == "pad") {
        add_pad(e);
    } else if (tool_state == "elementline") {
        add_elementline(e);
    }
}

var tool_state = "pad";

$(document).bind('keydown', 'p', add_pad);
$( "#svg" ).dblclick(dblclick_handler);


var objects = new Array();

objects.push("placeholder");
objects.push("placeholder");

