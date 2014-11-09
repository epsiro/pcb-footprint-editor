var editor = CodeMirror.fromTextArea(document.getElementById("footprint_code"), {
  lineNumbers: false,
  undoDepth: 10000,
  mode: "text/html",
  vimMode: true
});

editor.on("change", function(cm, change){

    //console.log(change);

    /* Line(s) have been added */
    if (change.text.length > change.removed.length) {

        for (var line_nr = change.from.line;
                line_nr < (change.from.line + change.text.length); line_nr++) {

            var line = change.text[line_nr - change.from.line];
            if (line != "") {
                if (add_object(line, line_nr) == 0) {
                    //console.log("added " + line_nr + " " + line);
                }
            }
        }

    /* Line(s) have been removed */
    } else if (change.text.length < change.removed.length) {

        var tmp_line_nr = change.from.line;

        for (var line_nr = change.from.line;
                line_nr < (change.from.line + change.removed.length); line_nr++) {

            var line = change.removed[line_nr - change.from.line];
            if (line != "") {
                if (remove_object(line, tmp_line_nr) == 0) {
                    //console.log("removed " + line_nr + " " + tmp_line_nr + " " + line);
                    tmp_line_nr--;
                }
            }
            tmp_line_nr++;
        }

    /* Line(s) have been edited */
    } else {

        for (var line_nr = change.from.line;
                line_nr < (change.from.line + change.text.length); line_nr++) {

            var line = editor.getLine(line_nr);
            if (line != "") {
                if (edit_object(line, line_nr) == 0) {
                    //console.log("edited " + line_nr + " " + line);
                }
            }
        }
    }
});

var hl_line = editor.addLineClass(0, "background", "selected_pad");
editor.removeLineClass(0, "background", "selected_pad");

editor.on("cursorActivity", function(cm){

    if (editor.getLine(editor.getCursor().line).match(/Pad/)) {

        // Remove old selected
        editor.removeLineClass(hl_line, "background", "selected_pad");

        if (hl_line.text.match(/Pad/)) {
            objects[editor.getLineNumber(hl_line)].pad.attr({ stroke: "#8c96a0" });
        }

        // Show new selected
        hl_line = editor.addLineClass(editor.getCursor().line, "background", "selected_pad");
        objects[editor.getCursor().line].pad.attr({ stroke: "#acb6c0" });
    }
});

editor.on("blur", function(cm){

    // Remove old selected
    editor.removeLineClass(hl_line, "background", "selected_pad");

    if (hl_line.text.match(/Pad/)) {
        objects[editor.getLineNumber(hl_line)].pad.attr({ stroke: "#8c96a0" });
    }
});

function get_last_line() {

    var last_line;

    editor.eachLine(function(line){
        if (line.text === ")") {
            last_line = editor.getLineNumber(line);
        }
    });

    return last_line;
}

$('#vim_mode_cb').click(function () {
    editor.setOption("vimMode", this.checked);
});

function new_component() {
    var element_header = 'Element["" "0805" "0805" "" 1000 1000 -1.5mm -2.5mm 0 100 ""]\n(\n';
    var element_end = ')';

    editor.setValue(element_header + element_end);
    editor.clearHistory();

    distance_x.attr({ visibility: "hidden" });
    distance_y.attr({ visibility: "hidden" });

    global_dragging = false;
    global_first_endpoint = false;
    global_second_endpoint = false;
    global_first_endpoint_object = null;
    global_second_endpoint_object = null;
}

new_component();
