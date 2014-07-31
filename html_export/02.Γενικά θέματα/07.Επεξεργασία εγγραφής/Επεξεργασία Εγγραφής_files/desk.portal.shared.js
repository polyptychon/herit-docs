
//
// Desk Portal SHARED Javascript
//

// Header


// Used in the Page(Index) template
// Define some style on the autocomplete ui; #q is the seach input
jQuery(document).ready(function() {
  // Default Focus
  $( "#q" ).bind("autocompleteopen", function(event, ui) {
    $('.ui-autocomplete').css({'margin':'0 0 0 -5px', 'width':'845px'});
  });
});

