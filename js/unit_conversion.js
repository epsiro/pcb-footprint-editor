function nm_to_view(number) {
    return number/10000
}

function view_to_nm(number) {
    return number*10000
}

function nm_to_mm(number) {
    return number/1000000
}

function mm_to_nm(number) {
    return number*1000000
}

function nm_to_mil(number) {
    return number/25400
}

function mil_to_nm(number) {
    return number*25400
}

function nm_to_hundredth_mil(number) {
    return number/254
}

function hundredth_mil_to_nm(number) {
    return number*254
}

function parse_length(s) {

    var pos_mm = s.indexOf("mm");
    if (pos_mm > -1) {
        return mm_to_nm(s.slice(0, pos_mm).trim());

    }

    var pos_mil = s.indexOf("mil");
    if (pos_mil > -1) {
        return mil_to_nm(s.slice(0, pos_mil).trim());
    }

    var bracket = "square";

    if ($.isNumeric(s)) {
        if (bracket == "round") {
            return mil_to_nm(s.trim());
        } else if (bracket == "square") {
            return hundredth_mil_to_nm(s.trim());
        }
    }
}

function sign(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
}
