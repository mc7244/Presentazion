/* Presentazion
   HTML/JS software to present slides in DWIM way
   Version 0.20 - November 1st, 2011
   Author: Michele Beltrame
   License: Artistic (Perl5) or GPL3, at user choice
*/

$(function() {
    // Pad a bit to avoid  being too near to borders
    // (projectors might cut)
    var window_hpadding = 50; // px
    // Some vpadding to fix an issue with Chromium
    var window_vpadding = 50; // px
    // Keep this not too small, so calculation is faster
    var font_step = 10;

    var current_slide = 0;
    var max_slide = $(".slide").size() - 1;
    var last_search = '';

    var set_text_size = function(nslide) {
        var $slide = $(".slide:eq(" + nslide + ")");

        $(".slideshow").css("width", ($(window).width())+"px");
        $(".slideshow").css("height", ($(window).height())+"px");
        var divw = $(".slideshow").width();
        var divh = $(".slideshow").height();

        // Enlarge font size until slide fills the container
        // Increment by chunks of 10 to make it faster
        for ( var fsize = 10; fsize < 1000; fsize += font_step) {
            // Never allow contents to reach container boundaries
            $slide.css("font-size", fsize+"px");
            /*$slide.text($(window).width() + " --- " + $(window).height() + " <br> " + $slide.css("font-size")
                + "<br>" + $slide.width() + " --- " + $slide.height()
            ); // TMP*/
            
            if ( $slide.width() >= (divw - window_hpadding*2) || $slide.height() >= (divh - window_vpadding*2) ) {
                $slide.css("font-size", (fsize-font_step)+"px");
                break;
            }
        }

        // Center contents vertically
        $slide.css( "margin-top", ((divh/2)-($slide.height()/2))+"px" );
    };

    var set_print_text_size = function(nslide) {
        var divw = $(".slide").width();
        var divh = $(".slide").height();

        $(".slide").each(function(i, el) {
            // Enlarge font size until slide fills the container
            // Increment by chunks of 10 to make it faster
            var $slide = $(el);
            $slide.wrapInner('<div class="innerslide" style="display:inline-block;width:auto;height:auto;">');
            var $innerslide = $slide.children(".innerslide");
            for ( var fsize = 10; fsize < 1000; fsize += font_step) {
                // Never allow contents to reach container boundaries
                $innerslide.css("font-size", fsize+"px");
                
                if ( $innerslide.width() >= (divw - window_hpadding*2) || $innerslide.height() >= (divh - window_vpadding*2) ) {
                    $innerslide.css("font-size", (fsize-font_step)+"px");
                    break;
                }
            }
            console.log($innerslide.width() + " --- " + $innerslide.height());
            // Center contents vertically
            $innerslide.css( "margin-top", ((divh/2)-($innerslide.height()/2))+"px" );
        });
    };

    var change_slide = function(num) {
        $(".slide:eq(" + current_slide + ")").hide();
        current_slide = num;
        $(".slide:eq(" + current_slide + ")").show();
        set_text_size(current_slide);
    }

    // Printing
    if ( $("#mediatype").css("width") === "2px" ) {
        set_print_text_size();
        return;
    }
    $(".slide").hide();

    // Wrap CODE contents into PREs, and replace the CODE tag with a div
    // (so it doesn't bring "custom" formatting with it)
    $(".slide code").wrapInner('<pre>');
    $(".slide code").replaceWith('<div class="codewrapper">' + $(".slide code").html() + "</div>");

    $(".slide ul").wrap('<div class="ulwrapper">');

    $(window).resize(function() {
        set_text_size(current_slide);
    });
    change_slide(0);

    $(document).keydown(function(e) {
        switch (e.keyCode) {
            case 13: // Enter
            case 32: // Space
            case 34: // PgDown
                if ( current_slide == max_slide ) {
                    return;
                }
                change_slide( current_slide + 1 );
                e.preventDefault();
                break;
            case 8:  // Backspace
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
                last_search = prompt("Enter string to search (forward)", last_search);
                var pattern = new RegExp(last_search, "i"); // case insensitive
                $(".slide:gt(" + current_slide + ")").each(function(i, el) {
                    if ( $(el).text().match(pattern) ) {
                        change_slide( i + 1 );
                        return false;                    
                    }
                })
                e.preventDefault();
                break;
            case 78: // n
                alert("Current slide: " + (current_slide+1));
                e.preventDefault();
                break;
            case 72: // h
                alert("COMMANDS\n\n"
                    + "PgDown/Space/Enter: next slide\n"
                    + "PgUp/Backspace: previous slide\n"
                    + "j: jump to page\n"
                    + "s: search (forward, no wrap)\n"
                    + "h: this help\n"
                );
                e.preventDefault();
                break;
            default:
                break;
        }
        return true; // don't stop other keys to be handled by browser
    });

});
