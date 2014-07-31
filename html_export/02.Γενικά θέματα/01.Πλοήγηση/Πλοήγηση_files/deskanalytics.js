/* 
 *
 * This file lives on Amazon S3.  Only reference it there:
 * http://webassets.desk.com/new/javascripts/deskanalytics.js
 *
 */


// Google Analytics
var _gaq = _gaq || [];
var ga_linker = false; // by default we don't add linker parameters


// By default, we use GA. (Switch to <uh.js> below for portals.)
var tracking_script = 'ga.js';

var cnd = (function(hostname){
 
  // parse hostname for last two domain chunks (i.e. desk.com)
  var hx = /[a-z]+\.[a-z]+$/.exec(hostname), hx = hx && hx[0];

  if(/\.local$/.test(hostname)) hx = 'development';
  if(/(desk|assistly)stage\.com$/.test(hostname)) hx = 'staging';
  //if(/(new\.desk\.com$/.test(hostname)) hx = 'staging';

  // Select a configuration based on hostname (last two, e.g. "assistly.com")
  switch(hx){
    case 'staging':
      return {
        name: 'assistly.', // tracker prefix
        namespace: 'astly', // cookie namespace (deprecated)
        domain: hx, // cookie domain
        ga_main: 'UA-10299982-2',
        ga_portal: 'UA-10299982-8'
      }
    case 'development':
       return {
        name: 'assistly.', // tracker prefix
        namespace: 'astly', // cookie namespace (deprecated)
        domain: hx, // cookie domain
        ga_main: 'UA-10299982-X', // invalid
        ga_portal: 'UA-10299982-X' // invalid
      }
    case 'assistly.com':
    case 'desk.com':
    default:
      return {
        name: 'assistly.', // tracker prefix
        namespace: 'astly', // cookie namespace (deprecated)
        domain: hx, // cookie domain
        ga_main: 'UA-10299982-1',
        ga_portal: 'UA-10299982-5'
      }
  }

})(document.location.hostname); // << IF you need to manually override the configuration, do it here.

// The following regular expression should...

// Match subdomains
// This is an explicit match anchored at the beginning and ending of the string.
// - www.assistly.com
// - dev.assistly.com
// - get.assistly.com
// - reg.assistly.com
// - support.assistly.com

// Match any client subdomain that is in combination with the following href. All matches can also run under SSL with "https".
// This match is only anchored to the beginning of the string. Query params, or sub folders may be appended to each match.
// - http://clientname.assistly.com/login
// - http://clientname.assistly.com/users
// - http://clientname.assistly.com/home
// - http://clientname.assistly.com/welcome
// - http://clientname.assistly.com/agent
// - http://clientname.assistly.com/analytics
// - http://clientname.assistly.com/reporting
// - http://clientname.assistly.com/admin
// - http://clientname.assistly.com/googleapps

var AssistlyDomains = /^(?:www|dev|offers|get|reg|press|shopifyapp|support|status|csu|help)\.(desk|assistly(stage)?)\.com$/i,
    AssistlyPortal = /^https?:\/\/[a-zA-Z0-9-]*\.(desk|assistly(stage)?)\.com\/(?:login|users|home|welcome|agent|analytics|reporting|admin|googleapps)/i;
    
var excludeDomains = /(glossybox|help\.dukgo|help\.duckduckgo)/i;
var deskProduct = /^https?:\/\/[a-zA-Z0-9-]*\.(desk|assistly(stage)?)\.com\/(login|users|home|welcome|agent|analytics|reporting|admin|googleapps)/i;

function _assistly_portal(link){
  return AssistlyDomains.test(link.hostname) || AssistlyPortal.test(link.href);
}

function _desk_product(link){
  return deskProduct.test(link.href);
}


// configure: custom variables to be set on certain paths
var cv_paths = [
  [ /^[\/]?product-tour/,       5, 'ProspectState', 'Tour',                     2 ],
  [ /^[\/]?free-trial/,         5, 'ProspectState', 'SignupView-Assistly',      2 ],
  [ /^[\/]?welcome/,            5, 'ProspectState', 'SignupComplete-Assistly',  2 ],
  [ /^[\/]?googleapps\/step1/,  5, 'ProspectState', 'SignupStart-Google',       2 ],
  [ /^[\/]?googleapps\/step2/,  5, 'ProspectState', 'SignupComplete-Google',    2 ]
];

// configure: GA calls, including custom variables, to occur on certain events
var cv_events = [
  [ '#user_email', 'focus', function(ev){
    _gaq.push([ cnd.name + '_setCustomVar', 5, 'ProspectState', 'SignupStart-Assistly', 2 ]);
    _gaq.push([ cnd.name + '_trackEvent', 'Form', 'Signup Start', 'Email Focus' ]);
  } ]
];

// configure parameter-based custom variables
var cv_param = [
  [ /[&\?]ss=([^&]+)/, 3, 'Site Source', '$1', 3 ],
  [ /[&\?]st=([^&]+)/, 4, 'Site Tag', '$1', 3 ]
];


// Cookie functionality
function createCookie(name,value,days,domain) {
  if(!location.hostname.match(excludeDomains)) {
  
  	if (days) {
  		var date = new Date();
  		date.setTime(date.getTime()+(days*24*60*60*1000));
  		var expires = "; expires="+date.toGMTString();
  	}
  	else var expires = "";
  	document.cookie = name+"="+value+expires+"; path=/; domain="+domain+";";
  	
	}
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

var userSegment = readCookie("user_segment");
if(userSegment==null) {
	createCookie("user_segment", "Prospect", 30, cnd.domain);
	userSegment = "Prospect";
}

// Analytics Pros utility functions
function prospect(s){ return (/prospect/i.test(s)) } // does this thing look like a prospective client?
function _getelement(s){
  var i = s && s.substr(0,1);
  return (i == '#')
    ? [ document.getElementById(s.substr(1)) ]
    : (i == '.')
      ? document.getElementsByClassName(s.substr(1))
      : document.getElementsByTagName(s)
  ;
}
function _evlisten(node, ev, fn, cpt){ // primitive event-listener cross-browser handler
  if(node && node.addEventListener) return node.addEventListener(ev, fn, cpt);
  if(node && node.attachEvent) return node.attachEvent('on' + ev, function(e){ fn.call(node, e || window.event) });
}
function _load_listener(sel, ev, fn, cpt){ // apply listener on document-ready
  _evlisten(window, 'load', function(){
    var el = _getelement(sel), i = el.length;
    while(i--){
      _evlisten(el[i], ev, fn, cpt);
    }
  });
}

/** For portals **/
if(_assistly_portal(document.location)) {

  if(_desk_product(document.location)) {
    // Inject Product Specific Tracker
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-10299982-20');

    // remove personal info from page titles
    var sanitizedTitle = (document.title.indexOf(' -- ') > 0) ? document.title.split(' -- ')[0] : document.title ;
    
    // send pageview
    ga('send', 'pageview', {
      'title': sanitizedTitle
    });
  }
  
  // Marketing tracker
  ga_linker = true; // enable linker automation

  _gaq.push([ cnd.name + '_setAccount', cnd.ga_main ]);
  _gaq.push([ cnd.name + '_setDomainName', cnd.domain ]);
  _gaq.push([ cnd.name + '_setAllowAnchor', true ]);
  _gaq.push([ cnd.name + '_setAllowLinker', true ]);
  _gaq.push([ cnd.name + '_addIgnoredRef', cnd.domain]);

  // Override early: set new registrations before other processing
  var AP_userSeg = null;
  if(/^[\/]?(welcome|googleapps\/step2)/.test(document.location.pathname)){
    createCookie('newly_registered', 'true', null, cnd.domain);
    if(!(/trial(.?)admin/i.test(userSegment))){
      AP_userSeg = 'Trial Admin - new reg';
      createCookie("user_segment", "Trial Admin", 30, cnd.domain);
    } else AP_userSeg = userSegment;
  }

  // NOTE: there should always been a Stark in Winterfell... and a user segment UDV.
  // Really?  A GoT ref?  --Dylan
  AP_userSeg = AP_userSeg || userSegment;


  if(AP_userSeg && !prospect(AP_userSeg)){
    _gaq.push([ cnd.name + '_setVar', AP_userSeg ]); // Always set UDV of the current segment
  }

  // set up custom variables based on path
  var i = cv_paths.length;
  while(i--){
    if(cv_paths[i][0].test(document.location.pathname)) // loop-test configured paths
      _gaq.push([ cnd.name + '_setCustomVar' ].concat(cv_paths[i].slice(1)));
  }

  function apply_match(m, s, def){
    if(!s || !s.replace) return s;
    return s.replace(/\$([0-9]+)/g, function($0, $1){
      return m[Number($1)] || (def || '');
    });
  }

  // set up custom variables based on query params
  var i = cv_param.length, m;
  while(i--){
    m = cv_param[i][0].exec(document.location.search);
    cv_param[i][0].lastIndex = 0; // reset
    if(m){
      _gaq.push([ cnd.name + '_setCustomVar', cv_param[i][1], cv_param[i][2], apply_match(m, cv_param[i][3]), cv_param[i][4] ]);
    }
  }


  // add event listeners
  var i = cv_events.length, ev;
  while(ev = cv_events[ --i ]){
    _load_listener(ev[0], ev[1], ev[2], true);
  }

  // Desk.com's user-segment cookie as a Session-scoped CV
  if(readCookie('newly_registered') == 'true') userSegment = 'Prospect - new reg';
  userSegment = userSegment.replace(/(\+| )/g,"_");
  _gaq.push([ cnd.name + '_setCustomVar', 2, 'User_Type_S', userSegment, 2]);

  // We craft a distinct pageview if people hit /welcome directly - seems to be from a bookmark
  var url = document.location.pathname, query = document.location.search,
      query = (query && query.substr(0,1) != '?') ? '?' + query : query;
  if(!document.referrer && /^[\/]?welcome/.test(url) && /(desk|assistly(stage)?)\.com$/.test(document.location.hostname)){
    url = '/bookmark-wlcm';
  }
  _gaq.push([ cnd.name + '_trackPageview', url + (query || '') ]);

  setTimeout(function(){
   try {
    if(~document.location.pathname.indexOf('/agent') && jQuery('body.tour_running div#agent-tour-welcome').length){
      _gaq.push([ cnd.name + '_trackPageview', '/tour' ]);
    }
   } catch(e) { }
  }, 250);

}else{
  if (location.hostname.match(excludeDomains)){
  // Specifically for multiple GlossyBox sites so that our GA code doesn't affect their portal - it's okay that we may
	// possibly remove this from some other sites as well
	// Current sites are: http://service.glossybox.co.uk, http://glossyboxkorea.assistly.com, http://ajuda.glossybox.com.br,
	// https://glossyboxfr.assistly.com and http://service.glossybox.de
  } else {
    // new universal tracking Analytics.js
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    
    // Support Portal Tracker
    ga('create', 'UA-10299982-19', {
      //'sampleRate': 25, // lower sample rate for support sites, default 100
      'name':'portal'
    });
    ga('set', 'hostname', window.location.host.toString() );
    ga('send', 'pageview');
  
    // old urchin tracking
    var _uhq = _uhq || [];
    tracking_script = 'uh.js';
    _uhq.push([ cnd.name + '_setAccount', cnd.ga_portal ]);
    _uhq.push([ cnd.name + '_addIgnoredRef', cnd.domain ]);
    _uhq.push([ cnd.name + '_setAllowAnchor', true]);
    _uhq.push([ cnd.name + '_setLocalGifPath', document.location.protocol + '//utm.amikay.com/assistly.com/__utm.gif' ]);
    _uhq.push([ cnd.name + '_trackPageview']);

    (function(start){ // closure
      function config_filter(c){ // adjust for compatibility with Urchin wrapped tracker
        var m = [];
        for(var i = 0; i < c.length; i++){
          if(!c[i]) continue;
          if(c[i].pop){
            c[i][0] = c[i][0].replace(/^[^\.]+./, ''); // strip tracker names for Urchin
          }
          m.push(c[i]);
        }
        return m;
      }

      function config_handler(){
        var m = config_filter(arguments);
        for(var i = 0; i < m.length; i++){ // loop over GA-style config for UH tracker objects
          if(m[i].call) m[i].call(this);
          if(m[i].pop && this[ m[i][0] ] && this[ m[i][0] ].apply){
            this[ m[i][0] ].apply(this, m[i].slice(1));
          }
        }
      }

      function apply_config(timeout){
        if(window.UH){
          _uhq = window.UH(config_filter(_uhq)); // initialize tracker with config (NOTE: this won't handle callbacks, only "array of string")
          _uhq.push = config_handler; // but **this one** will handle callbacks
        } else return setTimeout(function(){ apply_config(timeout) }, (timeout || 320));
      }

      // start loop for loading Urchin's JS
      if(start) apply_config();
    })(true); // <<- this could be set via some other condition
  }
}


switch(tracking_script){
  case 'ga.js':
    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      //ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
    break;


  case 'uh.js':
    (function() {
      var uh = document.createElement('script'); uh.type = 'text/javascript'; uh.async = true;
      uh.src = (document.location.protocol) + '//utm.amikay.com/uh.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(uh, s);
    })();
    break;

}


// Calculate the cookie domain for storage. eg. .assistly.com or .assistly.local
function calculated_cookie_domain() {
	// calculate cookie domain (drop subdomain if present and prefix with . to allow use across subdomains)
	var cookie_domain = window.location.hostname;
	var hostname_parts = cookie_domain.split('.');
	if (hostname_parts > 2) {
		hostname_parts.shift();
		cookie_domain = hostname_parts.join('.');
	}
	return "." + cookie_domain;
}


//******************************************************************************
// $.assistlyGACookie('x') methods to read Google Analytics cookie values
//
(function($) {
	var cookie_values = {
		ga_source: '',
		ga_medium: '',
		ga_keywords: ''
	}

	var parseCookie = function() {
		var $ga_cookie = readCookie('__utmz');
		if ($ga_cookie) {
			$ga_id = $ga_cookie.split('u', 1);
			$ga_string = $ga_cookie.replace($ga_id, '');
			$ga_vars = $ga_string.split('|');
			for (i in $ga_vars) {
				$key = $ga_vars[i].split('=')[0];
				$value = $ga_vars[i].split('=')[1];

				if ($key == 'utmcmd') {
					cookie_values.ga_medium = ($value == undefined) ? '': $value;
				}
				if ($key == 'utmctr') {
					cookie_values.ga_keywords = ($value == undefined) ? '': $value;
				}
				if ($key == 'utmcsr') {
					cookie_values.ga_source = ($value == undefined) ? '': $value;
				}
			}
		}
	}

	var methods = {
		source: function() {
			return cookie_values.ga_source;
		},
		medium: function() {
			return cookie_values.ga_medium;
		},
		source_and_medium: function() {
			return cookie_values.ga_source + ' / ' + cookie_values.ga_medium;
		},
		keywords: function() {
			return cookie_values.ga_keywords;
		}
	}

	$.assistlyGACookie = function(method) {
		parseCookie();

		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.assistlyGACookie');
		}
	};
})(jQuery);


// Helper function to read query parameters
function getParameterByName(name) {
	name = String(name).replace(/[.*+?|()[\]{}\\]/g, '\\$&');
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Parse query string for SalesForce lead details and store in a cookie for use in the signup widget
function createSalesForceLeadCookie() {
	// read query parameters
	var sf_rid 		= getParameterByName('sf_rid');
	var sf_rname 	= getParameterByName('sf_rname');
	var sf_custid = getParameterByName('sf_custid');

	// concatenate values for cookie/source field
	var sf_cookie_value = sf_rid + "|" + sf_rname + "|" + sf_custid;

	// check if we have the query parameters
	if(sf_rid || sf_rname || sf_custid) {
		// calculate cookie domain (drop subdomain if present and prefix with . to allow use across subdomains)
		var cookie_domain = window.location.hostname;
		var hostname_parts = cookie_domain.split('.');
		if (hostname_parts > 2) {
			hostname_parts.shift();
			cookie_domain = hostname_parts.join('.');
		}
		cookie_domain = "." + cookie_domain;

		// write 60-day cookie with concatenated value for the source field
		createCookie('SalesForceLead', sf_cookie_value, 60, cookie_domain);
	}
}

// Always call the create cookie function as it will only overwrite if new data is present
createSalesForceLeadCookie();


// Parse query string for PID details and store in a cookie for use in the signup widget
function createPIDCookie() {
	// read query parameters
	var pid = getParameterByName('PID');

	// check if we have the query parameters
	if(pid) {
		// calculate cookie domain (drop subdomain if present and prefix with . to allow use across subdomains)
		var cookie_domain = window.location.hostname;
		var hostname_parts = cookie_domain.split('.');
		if (hostname_parts > 2) {
			hostname_parts.shift();
			cookie_domain = hostname_parts.join('.');
		}
		cookie_domain = "." + cookie_domain;

		// write 60-day cookie with concatenated value for the source field
		createCookie('PID', pid, 60, cookie_domain);
	}
}

// Always call the create cookie function as it will only overwrite if new data is present
createPIDCookie();


// Parse query string for coupon details and store in a cookie for use in the signup widget
function createCouponCookie() {
	// read query parameters
	var coupon = getParameterByName('uniqueID');

	// check if we have the query parameters
	if(coupon) {
		// calculate cookie domain (drop subdomain if present and prefix with . to allow use across subdomains)
		var cookie_domain = window.location.hostname;
		var hostname_parts = cookie_domain.split('.');
		if (hostname_parts > 2) {
			hostname_parts.shift();
			cookie_domain = hostname_parts.join('.');
		}
		cookie_domain = "." + cookie_domain;

		// write 60-day cookie with concatenated value for the source field
		createCookie('coupon', coupon, 60, cookie_domain);
	}
}

// Always call the create cookie function as it will only overwrite if new data is present
createCouponCookie();



//******************************************************************************
// Multi-Attribution Google source/medium tracking
//

function MultiTouchTracker(params) {
	if (params === undefined) {
		params = {};
	}

	if (params.cookie_domain) {
		this.cookie_domain = params.cookie_domain;
	} else {
		this.cookie_domain = document.domain;
	}
	if (params.cookie_name) {
		this.cookie_name = params.cookie_name;
	}
	else {
		this.cookie_name = 'multitouch';
	}
	if (params.cookie_lifetime) {
		this.cookie_lifetime = params.cookie_lifetime;
	}
	else {
		this.cookie_lifetime = 180; // days
	}
	if (params.max_cookie_size) {
		this.max_cookie_size = params.max_cookie_size;
	}
	else {
		this.max_cookie_size = 255; // bytes
	}
	this.allow_internal = params.allow_internal;

	this.fieldsep = ' / ';
	this.recsep = ' | ';

	var enginestring = 'google:q;yahoo:p;msn:q;bing:q;daum:q;eniro:search_word;naver:query;images.google:q;aol:query;aol:encquery;lycos:query;ask:q;altavista:q;netscape:query;cnn:query;about:terms;mamma:query;alltheweb:q;voila:rdata;virgilio:qs;live:q;baidu:wd;alice:qs;yandex:text;najdi:q;aol:q;mama:query;seznam:q;search:q;wp:szukaj;onet:qt;szukacz:q;yam:k;pchome:q;kvasir:q;sesam:q;ozu:q;terra:query;mynet:q;ekolay:q;rambler:words';

	var e = enginestring.split(';');
	this.engines = [];
	for (var j = 0; j < e.length; j++) {
		this.engines[j] = e[j].split(':');
	}
}

MultiTouchTracker.prototype.multitouch = function(ref, landing) {
	if (ref === undefined) ref = document.referrer;
	if (landing === undefined) landing = window.location.href;

	// reject internal referrals (from the same domain), accept everything else
	var dom = this.cookie_domain;
	if (!this.allow_internal && dom && !MultiTouchTracker.is_empty_ref(ref) && ref.match('^https?://?(?:[^/]*\.)?' + dom + '/')) return 'Internal';
	var med = 'none';
	var src = 'direct';
	if (landing.match('[&?]gclid=')) {
		med = 'cpc';
		src = 'adwords';
	}	else {
		var utm_src = landing.match('[&?]utm_source=([^&#]+)');
		if (utm_src == null) {
			if (ref) {
				var organic_src = this.isOrganic(ref);
				if (organic_src) {
					med = 'organic';
					src = MultiTouchTracker.clean_var(organic_src);
				} else {
					med = 'referral';
					src = MultiTouchTracker.domain_of(ref);
				}
			}
		} else {
			src = MultiTouchTracker.clean_var(utm_src[1]);
			var utm_med = landing.match('[&?]utm_medium=([^&#]+)');
			if (utm_med) med = MultiTouchTracker.clean_var(utm_med[1]);
		}
	}

	return this.appendCookie(src + this.fieldsep + med);
}

MultiTouchTracker.prototype.appendCookie = function(val) {
	var cookval = readCookie(this.cookie_name) || '';

	cookval = MultiTouchTracker.decode(cookval);

	// check if the last record is different to the new record
	var cv = cookval.split(this.recsep);
	if (cv[cv.length - 1] != val) {
		if (cookval.length > 0) {
			cookval = cookval + this.recsep + val;
		} else {
			cookval = val;
		}
	}

	// ensure cookie does not exceed allocated size
	while (cookval.length > this.max_cookie_size) {
		var cv = cookval.split(this.recsep);
		cv.splice(1,1);
		cookval = cv.join(this.recsep);
	}

	createCookie(this.cookie_name, MultiTouchTracker.encode(cookval), this.cookie_lifetime, calculated_cookie_domain());

	return cookval;
}

MultiTouchTracker.prototype.isOrganic = function(ref) {
	var dom = MultiTouchTracker.domain_of(ref);
	if (!dom) return;
	ref = ref.split('?').join('&');
	for (var j = 0; j < this.engines.length; j++) {
		if (MultiTouchTracker.contains(dom, this.engines[j][0]) &&
		MultiTouchTracker.contains(ref, '&' + this.engines[j][1] + '=')) {
			return this.engines[j][0];
		}
	}
	return false;
}

MultiTouchTracker.clean_var = function(s) {
	s = s.replace(new RegExp(this.fieldsep + '|' + this.recsep, 'g'), '');
	if (!s) s = '-';
	return s;
}

MultiTouchTracker.contains = function(haystack, needle) {
	return haystack.indexOf(needle) > -1;
}

MultiTouchTracker.is_empty_ref = function(ref) {
	return undefined == ref || "-" == ref || "" == ref;
}

MultiTouchTracker.encode = function(s, u) {
	if (typeof(encodeURIComponent) == 'function') {
		if (u) return encodeURI(s);
		else return encodeURIComponent(s);
	} else {
		return escape(s);
	}
}

MultiTouchTracker.decode = function(s) {
	if (typeof(decodeURIComponent) == 'function') {
		return decodeURIComponent(s);
	} else {
		return unescape(s);
	}
}

MultiTouchTracker.domain_of = function(ref) {
	if (!ref) return '';
	var parts = ref.match(/https?:\/\/([^\/]+)/);
	if (parts) {
		return parts[1];
	}
	return '';
}
var _mtt;

function multitouch() {
	if (_mtt === undefined) _mtt = new MultiTouchTracker();
	return _mtt.multitouch();
}

function multitouch_value() {
	if (_mtt === undefined) _mtt = new MultiTouchTracker();
	cookieval = readCookie(_mtt.cookie_name) || '';
	return MultiTouchTracker.decode(cookieval);
}

// call the multitouch event for every page load
multitouch();



// jQuery Linker Integration for Analytics
if(ga_linker) jQuery(function($){


  var qx = /^(?:https?:)?\/\/([^\/]+)\//i, 
    tracker = null, cdom = cnd.domain, tname = cnd.name.replace(/\.$/g, ''), 
    hx = document.location.hostname;

  function get_hostname(s){
    var x = qx.exec(s);
    return x && x[1] || document.location.hostname;
  }


  function _endswith(str, suffix){
    return (str.substr(str.length - suffix.length) == suffix)
  }
 
  function _urllink(url){
    if(url && url.href && url.hostname) return url;
    var hn = get_hostname(url), path = '/' + url.replace(qx, '');
    return {
      href: url,
      hostname: hn,
      pathname: path
    }
  }

  function is_internal(hostname, cookie_domain){
    return hostname == hx || _endswith(hostname, cookie_domain || cdom);
  }
 
  function linker_update(url){
    var q = _urllink(url); 

    // hack for get.desk.com reg
    // because using $.prop() to update action doesn't always work
    if(document.location.toString().indexOf('get.desk.com') > 0) {
      $('#new_user').attr('action', url);
      return url;
    }
    
    return (tracker && !is_internal(q.hostname) ? tracker._getLinkerUrl(q.href) : q.href);
  }

  // requires jQuery
  function linker_node(o, cookie_domain){
    var tag = o.tagName.toLowerCase();
    switch(tag){
      case 'form':
        if(_assistly_portal(_urllink(o.action))){
          switch(o.method.toLowerCase()){
            case 'post':
              return $(o).submit(function(){ tracker._linkByPost(this); });
            case 'get':
            default:
              return $(o).attr('action', linker_update(o.action));
          }
        } 
        break;
      case 'a':
      default:
        if(/^((mailto|javascript):|#)/i.test(o.getAttribute('href')))
          return $(o);
        if(_assistly_portal(o))
          return $(o).attr('href', linker_update(o));
        break;
    }
  }

  jQuery.fn.linker = function(){
    $(this).each(function(){ linker_node(this) });
  };

  jQuery.linker_url = linker_update;

  _gaq.push(function(){
    tracker = _gat._getTrackerByName(tname);
    $('a[href]').linker();
    $('form[action]').linker();
  });


});

// reg.desk.com form fix
if(document.domain.toString() == 'reg.desk.com') {
  document.getElementById('user_site_attributes_site_source_attributes_source_1').value = 'reg.desk.com';
}

// Run pixel injection on /welcome
if(document.location.toString().indexOf('desk.com/welcome') > 0) {

  // Optimizely Injection
  var a=document.createElement('script');
  var b=document.getElementsByTagName('script')[0];
  a.src=document.location.protocol+'//cdn.optimizely.com/js/109614729.js';
  a.async=true;a.type='text/javascript';b.parentNode.insertBefore(a,b);
  
  
  // Quantcast
  var _qevents = _qevents || [];
  (function() {
  var elem = document.createElement('script');
  elem.src = (document.location.protocol == "https:" ? "https://secure" : "http://edge") + ".quantserve.com/quant.js";
  elem.async = true;
  elem.type = "text/javascript";
  var scpt = document.getElementsByTagName('script')[0];
  scpt.parentNode.insertBefore(elem, scpt);
  })();  
  _qevents.push(
    {qacct:"p-W8jZpvRsFVP-M",labels:"_fp.event.Free Trial Thank You Page"}
  );
  

  // AdRoll
  window.adroll_adv_id = "LP3ED7PIZRHCHGYHAXF72M";
  window.adroll_pix_id = "ONE5IC5OY5DD3BPAKIUHHJ";
  (function () {
    __adroll_loaded=true;
    var scr = document.createElement("script");
    var host = (("https:" == document.location.protocol) ? "https://s.adroll.com" : "http://a.adroll.com");
    scr.setAttribute('async', 'true');
    scr.type = "text/javascript";
    scr.src = host + "/j/roundtrip.js";
    ((document.getElementsByTagName('head') || [null])[0] ||
      document.getElementsByTagName('script')[0].parentNode).appendChild(scr);
  }());


}

/* Google Tag Manager */
(function() {
  // Initialize Google Tag Manager on Desk.com ONLY
  if (document.domain === "desk.com" || document.domain === "www.desk.com") {
    // Google Tag Manager Magic
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    '//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5XXKWG');
    // End Google Tag Manager
  }
})();

