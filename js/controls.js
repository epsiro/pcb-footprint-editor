$('button').tooltip();

$('#controls_mode button').click(function() {

    $(this).addClass('active').siblings().removeClass('active');

    if ($(this).attr("id") == "controls_new_pad") {
        tool_state = "pad";
    } else if ($(this).attr("id") == "controls_new_elementline") {
        tool_state = "elementline";
    }
});

$( "#load_file" ).on("click", load_file_as_text);
$( "#save_file" ).on("click", save_text_as_file);

