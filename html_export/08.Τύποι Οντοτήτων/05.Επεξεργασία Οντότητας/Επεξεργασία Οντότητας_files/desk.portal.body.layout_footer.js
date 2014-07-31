$(document).ready(function() {
  if (deskEV('enable_gs') == 'true') {
      var search_term = deskEV('search_term')
      var params = ( search_term != null ) ? "&topic[query]=" + escape(search_term) : ""
      $('#gs_link').attr('href', gsurl + "/topics/new?from=company&product=&commit=Nope.+Finish+posting+my+question" + params);
  }
  //load twitter embedded widget js
  !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
});

// READONLY PORTAL UI ADJUSTMENTS
if (deskEV('read_only') == 'true') {
  $(".input-button input[type='submit']").hide();
  $("#support-side a").each(function(){
    if( $(this).attr("href").match(/emails/) ){
        if (deskEV('site.default_mailbox').length > 0) {
            var default_mailbox = "mailto:" + deskEV('site.default_mailbox');
            $(this).attr("href", default_mailbox);
        } else {
            $(this).hide();
        }
    } else {
      $(this).hide();
    }
  });

  $(".answer-rating").hide();
  $(".question #form").html("{{system.snippets.answers_unavailable}}");
  $("#rate_article").hide();
}

// end READONLY PORTAL UI ADJUSTMENTS

// Tweet Button
!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

// Facebook Like Button
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=190751927613851";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Google Plus Button
(function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();

