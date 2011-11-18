/* Presentazion
   HTML/JS software to present slides in DWIM way
   Version 0.50 - November 6th, 2011
   First released on November 1st, 2011
   Author: Michele Beltrame
   License: Artistic (Perl5) or GPL3, at user choice
*/

Presentazion = {
    init : function() {
        this.slide_vpadding = parseInt( $("#mediatype").css("padding-top") );
        this.slide_hpadding = parseInt( $("#mediatype").css("padding-left") );

        // Convert multislides to normal slides
        this.preprocess_multislides();

        this.current_slide = 0;
        this.max_slide = $(".slide").size() - 1;
        this.last_search = '';

        // Tweak contents so they appear as we want
        this.preprocess_slides_contents();

        // TASK: printing
        if ( $("#mediatype").css("width") === "2px" ) {
            this.set_print_text_size();
            return;
        }

        // TASK: presenting
        $(".slide").hide();
        this.bind_keyboard_events();
        $(window).resize($.proxy(function() {
            this.set_text_size(current_slide);
        }), this);
        this.change_slide(0);
    },

    set_text_size : function(nslide) {
        var $slide = $(".slide:eq(" + nslide + ")");

        $(".slideshow").css("width", ($(window).width())+"px");
        $(".slideshow").css("height", ($(window).height())+"px");
        var divw = $(".slideshow").width();
        var divh = $(".slideshow").height();

        this.autoset_font_size($slide, divw, divh);

        // Center contents vertically
        $slide.css( "margin-top", ((divh/2)-($slide.height()/2))+"px" );
    },

    set_print_text_size : function(nslide) {
        var divw = $(".slide").width();
        var divh = $(".slide").height();

        $(".slide").each($.proxy(function(i, el) {
            // Enlarge font size until slide fills the container
            // Increment by chunks of 10 to make it faster
            var $slide = $(el);
            $slide.wrapInner('<div class="innerslide" style="display:inline-block;width:auto;height:auto;">');
            var $innerslide = $slide.children(".innerslide");

            this.autoset_font_size($innerslide, divw, divh);

            // Center contents vertically
            $innerslide.css( "margin-top", ((divh/2)-($innerslide.height()/2))+"px" );
        }, this));
    },

    change_slide : function(num) {
        $(".slide:eq(" + this.current_slide + ")").hide();
        this.current_slide = num;
        $(".slide:eq(" + this.current_slide + ")").show();
        this.set_text_size(this.current_slide);
    },

    preprocess_slides_contents : function() {
        // Wrap CODE contents into PREs, and replace the CODE tag with a div
        // (so it doesn't bring "custom" formatting with it)
        $(".slide code").each(function(i, el) {
            $(el).replaceWith('<div class="codewrapper"><pre>' + $(el).html() + '</pre></div>');
        });

        // Wrap ULs and OLs
        $(".slide ul").wrap('<div class="ulwrapper">');
        $(".slide ol").wrap('<div class="olwrapper">');
    },

    // Convert less-verbose multislides into slides
    // This code should be BURNED and rewritten, but I'd like
    // to get things to work before
    preprocess_multislides : function() {
        $(".multislide").each(function(i, el) {
            // Split multislide on separators
            var slides_html = $(el).html().split(/\n+----\n+/);

            // Process slide
            $.each(slides_html, function(i, shtml) {
                // Remove leading and trailing newlines as most are
                // unwanted (after the <div> tag for instance)
                shtml = shtml.replace(/^\n/, "").replace(/\n$/, "");

                // Process lines
                var lines = shtml.split("\n");

                // Remove comment lines
                lines = $.grep(lines, function(line) {
                    return line.match(/^\/\//);
                }, true);

                var in_code = 0; var in_ul = 0; var in_ol = 0;
                $.each(lines, function(j, line) {
                    // If a line begins with at least a \s, then it's code
                    // and it's subsequents are as well, if they still begin with \s
                    if ( line.match(/^(?:\s{4}|\t)/) ) {
                        lines[j] = line.replace(/^(?:\s{4}|\t)/, "");
                        if ( !in_code ) {
                            lines[j] = '<div class="codewrapper"><pre>' + "\n" + lines[j];
                            in_code = 1;
                        }
                        return true;
                    } else {
                        if ( in_code && line == "" ) {
                            return; // Code separation
                        }
                        if ( in_code ) {
                            lines[j] += "\n" + '</pre></div>';
                            in_code = 0;
                            return true;
                        }
                    }

                    // ULs
                    if ( line.match(/^\*\s/) ) {
                        lines[j] = line.replace(/^\*\s/, "");
                        lines[j] = "<li>" + lines[j] + "</li>";
                        if ( !in_ul ) {
                            lines[j] = '<ul>' + "\n" + lines[j];
                            in_ul = 1;
                        }
                        return true;
                    } else {
                        if ( in_ul ) {
                            lines[j] += "\n" + '</ul>';
                            in_ul = 0;
                            return true;
                        }
                    }


                    // OLs
                    if ( line.match(/^\#\s/) ) {
                        lines[j] = line.replace(/^\#\s/, "");
                        lines[j] = "<li>" + lines[j] + "</li>";
                        if ( !in_ol ) {
                            lines[j] = '<ol>' + "\n" + lines[j];
                            in_ol = 1;
                        }
                        return true;
                    } else {
                        if ( in_ol ) {
                            lines[j] += "\n" + '</ol>';
                            in_ol = 0;
                            return true;
                        }
                    }

                    // Wrap lonesome lines in <p>
                    // a lonesome lines does not begin with (<) (TODO: improve this)
                    if ( !line.match("^<") ) {
                        lines[j] = "<p>" + line + "</p>";
                    }
                });
                // If we closed with code, then add closing tags
                if ( in_code ) {
                    lines[lines.length-1] += "\n</pre></div>";
                }
                if ( in_ul ) {
                    lines[lines.length-1] += "\n</ul>";
                }
                if ( in_ol ) {
                    lines[lines.length-1] += "\n</ol>";
                }

                // Add to the DOM
                $(".multislide").before('<div class="slide">' + lines.join("\n") + '</div>');
            });

            // Remove multislide from the DOM, we don't need it anymore
            $(".multislide").remove();
        });
        
    },

    bind_keyboard_events : function() {
        $(document).keydown($.proxy(function(e) {
            switch (e.keyCode) {
                case 13: // Enter
                case 32: // Space
                case 34: // PgDown
                case 39: // Right
                    if ( this.current_slide == this.max_slide ) {
                        return;
                    }
                    this.change_slide( this.current_slide + 1 );
                    e.preventDefault();
                    break;
                case 8:  // Backspace
                case 33: // PgUp
                case 37: // Left
                    if ( this.current_slide == 0 ) {
                        return;
                    }
                    this.change_slide( this.current_slide - 1 );
                    e.preventDefault();
                    break;
                case 74: // j
                    var nto_str = prompt("Enter slide number to jump to (1-" + (this.max_slide+1) + ")", "1");
                    var nto = parseInt(nto_str);
                    if ( nto && nto > 0 && nto <= (max_slide+1) ) {
                        this.change_slide( nto - 1 );
                        e.preventDefault();
                    }
                    break;
                case 83: // s
                    this.last_search = prompt("Enter string to search (forward)", this.last_search);
                    var pattern = new RegExp(this.last_search, "i"); // case insensitive
                    $(".slide:gt(" + this.current_slide + ")").each($.proxy(function(i, el) {
                        if ( $(el).text().match(pattern) ) {
                            this.change_slide( this.current_slide + i + 1 );
                            return false;                    
                        }
                    },this));
                    e.preventDefault();
                    break;
                case 78: // n
                    alert("Current slide: " + (this.current_slide+1));
                    e.preventDefault();
                    break;
                case 72: // h
                    alert("COMMANDS\n\n"
                        + "PgDown/Space/Enter/Right: next slide\n"
                        + "PgUp/Backspace/Left: previous slide\n"
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
        }, this));
    },

    autoset_font_size : function($inner, outer_divw, outer_divh) {
        // Enlarge font size until slide fills the container
        // We begin with 10-px steps, to be way faster, and then
        // be more precise as we get near to the page boundaries
        var font_step = 10;
        var fsize = 10;
        while ( true ) {
            $inner.css("font-size", fsize+"px");
            
            // If we cross the boundary, return to previous size and
            // decrement the font_step (so at next cycles we can try
            // to go closer)
            if ( $inner.width() >= (outer_divw - this.slide_hpadding*2) || $inner.height() >= (outer_divh - this.slide_vpadding*2) ) {
                fsize -= font_step;
                $inner.css("font-size", fsize+"px");
                if ( font_step === 1 ) {
                    // We're at the end
                    break;
                }
                font_step--;
            }
            fsize += font_step;
        }
    }
};

$(function() {
    Presentazion.init();
});
