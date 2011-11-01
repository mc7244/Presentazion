/* Presentazion
   HTML/JS software to present slides in DWIM way
   Version 0.10 - November 1st, 2011
   Author: Michele Beltrame
   License: Artistic (Perl5) or GPL3, at user choice
*/

$(function() {
    // Pad a bit to avoid  being too near to borders
    // (projectors might cut)
    var window_hpadding = 50; // px

    var current_slide = 0;
    var max_slide = $(".slide").size()-1;
    $(".slide").hide();

    var set_text_size = function() {
        var $slide = $(".slide:eq(" + current_slide + ")");

        $(".slideshow").css("width", ($(window).width())+"px");
        $(".slideshow").css("height", ($(window).height())+"px");
        var divw = $(".slideshow").width();
        var divh = $(".slideshow").height();

        // Enlarge font size until slide fills the container
        // Increment by chunks of 5 or it's quite slow
        // TODO: CHANGE THIS TO BE A FOR
        var fsize = 10;
        while (1) {
            // Never allow contents to reach container boundaries
            $slide.css("font-size", fsize+"px");
            if ( $slide.width() >= (divw - window_hpadding*2) || $slide.height() >= divh ) {
                $slide.css("font-size", (fsize-5)+"px");
                break;
            }
            if ( fsize >= 1000 ) { alert("Exception 1"); break; } 
            fsize+=5;
        }

        // Center contents vertically
        $slide.css( "margin-top", ((divh/2)-($slide.height()/2))+"px" );
    };

    var change_slide = function(num) {
        $(".slide:eq(" + current_slide + ")").hide();
        current_slide = num;
        $(".slide:eq(" + current_slide + ")").show();
        set_text_size();
    }

    // Wrap CODE contents into PREs, and replace the CODE tag with a div
    // (so it doesn't bring "custom" formatting with it)
    $(".slide code").wrapInner('<pre>');
    $(".slide code").replaceWith('<div class="codewrapper">' + $(".slide code").html() + "</div>");

    $(".slide ul").wrap('<div class="ulwrapper">');

    $(window).resize(set_text_size);
    change_slide(0);

    $(document).keydown(function(e) {
        console.warn(e);
        switch (e.keyCode) {
            case 34: // PgDown
                if ( current_slide == max_slide ) {
                    return;
                }
                change_slide( current_slide + 1 );
                e.preventDefault();
                break;
            case 33: // PgUp
                if ( current_slide == 0 ) {
                    return;
                }
                change_slide( current_slide - 1 );
                e.preventDefault();
                break;
            case 74: // j
                var nto_str = prompt("Enter slide number to jump to (1-" + (max_slide+1) + ")", "1");
                var nto = parseInt(nto_str);
                if ( nto && nto > 0 && nto <= (max_slide+1) ) {
                    change_slide( nto - 1 );
                    e.preventDefault();
                }
                break;
            case 83: // s
                var pattern = prompt("Enter string to search (forward)");
                var rep = new RegExp(pattern, "i"); // case insensitive
                $(".slide:gt(" + current_slide + ")").each(function(i, el) {
                    if ( $(el).text().match(rep) ) {
                        change_slide( i + 1 );
                        return false;                    
                    }
                })
                e.preventDefault();
                break;
            case 78: // n
                alert("Current slide: " + (current_slide+1));
        }
    });

});
