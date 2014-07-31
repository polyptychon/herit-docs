
//
// Desk Portal HEADER Javascript
//

// Usage: deskEV('system.snippets.loading')
function deskEV(v) {
    v = v.replace(/\./g, '-')
    return $('#' + v).html();
}

	jQuery(document).ready(function() {

    if (deskEV('twitter_enabled') == 'true') {

		jQuery('#tweets').tweet({
			join_text: 'auto',
			auto_join_text_default: '',
			auto_join_text_reply: '',
			username: deskEV('twitter_username'),
			avatar_size: 24,
			count: 3,
			loading_text: deskEV('system.snippets.loading')+'...',
			time_text_seconds_ago: $("#system-snippets-seconds_ago").html(),
			time_text_a_minute_ago: $('#system-snippets-a_minute_ago').html(),
			time_text_minutes_ago: $('#system-snippets-minutes_ago').html(),
			time_text_an_hour_ago: $('#system-snippets-an_hour_ago').html(),
			time_text_hours_ago: $('#system-snippets-hours_ago').html(),
			time_text_a_day_ago: $('#system-snippets-a_day_ago').html(),
			time_text_days_ago: $('#system-snippets-days_ago').html(),
			time_text_about: $('#system-snippets-about').html()
		});
	}
	//Do not load autocomplete if the search pacth is null - this happens if the search path is empty or
	//the containing div cannot be found (may have been removed by the client)
	if($("#site-search_autocomplete_articles_url").length>0) {
		var autocomplete_source = deskEV('site-search_autocomplete_articles_url');
		if ($('form').hasClass('support-search-small')) {
			autocomplete_source += '?size=small';
		} else {
			autocomplete_source += '?';
		}
	    $("#q").autocomplete({
	      delay: 200,
	      minLength: 2,
	      search: function(event, ui) { $("#q").autocomplete("option", "source", autocomplete_source);},
	      select: function(event, ui) { $(location).attr('href', ui.item.id); },
	      focus: function(event, ui) { return false; }
	    });
	}

    if ($('#q').length != 0) {
  		//Hide #question-mask if search has content
  		if($('#q').val().length > 0) {
  			$('#question-mask').hide();
  		}

  		$('#q').focus(function(){
  			$('#question-mask').hide();
  		});

  		$('#q').blur(function(){
  			if($(this).val().length == 0) $('#question-mask').show();
  		});
    }

		$('#question-mask').click(function() {
			$('#q').focus();
		});

		$('form').submit(function(){
	    	$('input[type=text]').each(function(){
				$(this).val($.trim($(this).val()))
			});
		});

		// Extra validator added to handle invalid characters
	    $.validator.addMethod('invalidchars', function(value, element, param) {
	      param = param.split("").join("|");
				if(param.length > 0){
					return this.optional(element) || ! new RegExp(param).test(value);
	    	}
	    	return true;
	    }, deskEV('system.snippets.invalid_characters_found'));

	    $("#a-content-select").change(function(event){
	      var r = location.pathname.match(/\/customer(.*)\/portal(.*)/i);
	      if(r && r.length>1)
	        location.href = "/customer/" + $(this).val() + "/portal" + r[2] + location.search;
	      else
	        location.href = "/customer/" + $(this).val() + "/portal/articles" + location.search;
	    });
	});

	function highlightSearchTerms(search_terms){
	  $.each(search_terms.split(' '), function(index, value) {
	    $('.content a, .content p').highlight($.trim(value), '<span class=\"highlight\">$1</span>');
		$('#search-results a, #search-results p').highlight($.trim(value), '<span class=\"highlight\">$1</span>');
	  });
	}

	if (deskEV('enable_gs') == 'true') { // XXX Ask Kevin if 'true' is correct string
		gsStringTable['generic_error'] = deskEV('system.snippets.get_satisfaction_error');
		gsStringTable['view_all'] = deskEV('system.snippets.view_all');
		gsStringTable['search_header_no_results'] = deskEV('system.snippets.no_related_discussions');
		gsStringTable['search_header_with_results'] = deskEV('system.snippets.related_discussions')+" {0} "+deskEV('system.snippets.discussions');
		gsStringTable['generic_results_subheader'] = "{0} "+deskEV('system.snippets.discussions');
		gsStringTable['generic_replies'] = "{0} "+deskEV('system.snippets.replies');
		gsStringTable['questions_header'] = deskEV('system.snippets.questions');
		gsStringTable['ideas_header'] = deskEV('system.snippets.ideas');
		gsStringTable['problems_header'] = deskEV('system.snippets.problems');
		gsStringTable['praises_header'] = deskEV('system.snippets.praise');
		getCompanyId(); //Get Satisfaction Company ID
	}


// XXX Decide if we want this here now that we have per-page js files
// Used in the Page(Index) template
// Define some style on the autocomplete ui; #q is the seach input
jQuery(document).ready(function() {
    // Default Focus
    $( "#q" ).bind("autocompleteopen", function(event, ui) {
        $('.ui-autocomplete').css({'margin':'0 0 0 -5px', 'width':'845px'});
    });

	// For the back button links (previously <a href="/" onclick="history.back(); return false;"> )
    // found in the question_pre_create, email_pre_create, chat_pre_create
    $('.onclick-go-back').click(function() {
        history.back();
        return false;
    });

    // Hide our desk-external-variable divs
    $('.desk-external-variables').hide();

    var home_link = $('#breadcrumbs a:first-child').attr("href") || location.href;
    $("a[href='/']").attr("href", home_link );
});
