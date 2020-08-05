$( document ).one( "pagecreate", ".eventPage", function() {
    // Handler for navigating to the next page
    function navnext( next ) {
        $( ":mobile-pagecontainer" ).pagecontainer( "change", next + ".html", {
            transition: "slide"
        });
    }

    // Handler for navigating to the previous page
    function navprev( prev ) {
        $( ":mobile-pagecontainer" ).pagecontainer( "change", prev + ".html", {
            transition: "slide",
            reverse: true
        });
    }
    
    $( document ).on( "swipeleft", ".ui-page", function( event ) {
        var next = $( this ).jqmData( "next" );
        if ( next ) {
            navnext( next );
        }
    });
    
    $( document ).on( "swiperight", ".ui-page", function( event ) {
        var prev = $( this ).jqmData( "prev" );
        if ( prev ) {
            navprev( prev );
        }
    });
    
});
