var editor = CodeMirror.fromTextArea(document.getElementById("footprint_code"), {
  lineNumbers: false,
  undoDepth: 10000,
  mode: "text/html",
  vimMode: true
});

editor.on("change", function(cm, change){

    //console.log(change);

    /* Line added */
    if (change.removed[0] === "") {

        if (change.text[0] === "") {
            var line = change.to.line+1;
        } else {
            var line = change.to.line;
        }

        add_new_object(line);

    /* Line removed */
    } else if (change.text[0] === "") {
        var line = change.from.line;
        remove_object(line);

    } else if (change.to.line == change.from.line) {
        var line = change.to.line;
        var changed_line = editor.getLine(change.to.line);

        if (changed_line.match(/Pad/)) {

            values = parse_pad_line(changed_line);

            objects[change.to.line].x1 = mm_to_nm(values.x1);
            objects[change.to.line].y1 = mm_to_nm(values.y1);
            objects[change.to.line].x2 = mm_to_nm(values.x2);
            objects[change.to.line].y2 = mm_to_nm(values.y2);
            objects[change.to.line].thickness = mm_to_nm(values.thickness);
            objects[change.to.line].draw();
        }
    } else {

        for (line = change.from.line; line < change.text.length; line++) {

            add_new_object(line);
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

$(document).bind('keydown', 'p', add_pad);
$( "#svg" ).dblclick(add_pad);

var element_header = 'Element["" "0805" "0805" "" 1000 1000 -1.5mm -2.5mm 0 100 ""]\n(\n';
var element_end = ')';

editor.setValue(element_header + element_end);
editor.clearHistory();
