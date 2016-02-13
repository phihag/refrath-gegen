(function() {
'use strict';

function empty(node) {
	var last;
	while ((last = node.lastChild)) {
		node.removeChild(last);
	}
}

function text(node, str) {
	if (!str) {
		str = '\xa0';
	}
	empty(node);
	node.appendChild(node.ownerDocument.createTextNode(str));
}

function get_optimal_size(span, desired_width, desired_height) {
	var current_width = span.offsetWidth;
	var current_height = span.offsetHeight;
	var span_style = window.getComputedStyle(span, null);
	var current_style = span_style.getPropertyValue('font-size');
	var m = /^([0-9.]+)(\s*px)?$/.exec(current_style);
	if (m) {
		var by_width = Math.floor(parseFloat(m[1]) / (current_width / desired_width));
		var by_height = Math.floor(parseFloat(m[1]) / (current_height / desired_height));
		return Math.min(by_width, by_height);
	}
	return parseFloat(current_style);
}

function resize() {
	var container = document.querySelector('#content');
	var container_width = container.offsetWidth;
	var container_height = 0.30 * container.offsetHeight;
	var els = ['#home>span', '#vs>span', '#away>span'].map(function(qs) {
		return document.querySelector(qs);
	});
	var sizes = els.map(function(el) {
		return get_optimal_size(el, container_width, container_height);
	});
	var min_size = Math.min.apply(null, sizes);
	els.forEach(function(el) {
		el.style.fontSize = min_size + 'px';
	});
}

function parse_text(s) {
	var m = s.match(/^([^-]{7,}-)([^-]{7,})$/);
	if (m) {
		return m[1] + '\n' + m[2];
	}
	return s;
}

function update_home() {
	text(document.querySelector('#home>span'), parse_text(document.querySelector('#input_home').value));
	resize();
}

function update_away() {
	text(document.querySelector('#away>span'), parse_text(document.querySelector('#input_away').value));
	resize();
}

function setup_appcache() {
	if (! window.applicationCache) {
		return;
	}

	var AUTOUPDATE_WITHIN = 1000;
	var start_time = Date.now();

	window.applicationCache.addEventListener('updateready', function() {
		if (window.applicationCache.status != window.applicationCache.UPDATEREADY) {
			return;
		}

		if (Date.now() - start_time <= AUTOUPDATE_WITHIN) {
			window.location.reload();
			return;
		}
	});
}

function fullscreen_active() {
	return !!(
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		document.msFullscreenElement
	);
}

function fullscreen_enter() {
	var doc = document.documentElement;
	if (doc.requestFullscreen) {
		doc.requestFullscreen();
	} else if (doc.webkitRequestFullscreen) {
		doc.webkitRequestFullscreen(doc.ALLOW_KEYBOARD_INPUT);
	} else if (doc.mozRequestFullScreen) {
		doc.mozRequestFullScreen();
	} else if (doc.msRequestFullscreen) {
		doc.msRequestFullscreen();
	}
}

function fullscreen_exit() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
}

function fullscreen_toggle() {
	if (fullscreen_active()) {
		fullscreen_exit();
	} else {
		fullscreen_enter();
	}
}

function fullscreen_change() {
	var body = document.querySelector('body');
	if (fullscreen_active()) {
		body.setAttribute('class', 'fullscreen');
	} else {
		body.setAttribute('class', '');
	}
}


document.addEventListener('DOMContentLoaded', function() {
	setup_appcache();

	window.addEventListener('resize', resize);

	document.querySelector('#input_home').addEventListener('input', update_home);
	document.querySelector('#input_home').addEventListener('change', update_home);
	document.querySelector('#input_away').addEventListener('input', update_away);
	document.querySelector('#input_away').addEventListener('change', update_away);

	document.querySelector('form#config').addEventListener('submit', function(e) {
		e.preventDefault();
		fullscreen_enter();
		return false;
	});
	document.addEventListener('webkitfullscreenchange', fullscreen_change);
	document.addEventListener('mozfullscreenchange', fullscreen_change);
	document.addEventListener('fullscreenchange', fullscreen_change);
	document.addEventListener('MSFullscreenChange', fullscreen_change);

	document.addEventListener('keydown', function(e) {
		if (e.target !== document.querySelector('body')) {
			return;
		}
		switch (e.keyCode) {
		case 32: // Space
		case 13: // Enter
			fullscreen_toggle();
			break;
		case 27: // Esc
			fullscreen_exit();
			break;
		}
	});
	document.addEventListener('click', function(e) {
		var content = document.querySelector('#content');
		if (
				(e.target === document.querySelector('body')) ||
				(e.target === content) ||
				(e.target.parentNode === content) ||
				(e.target.parentNode.parentNode === content)) {
			fullscreen_toggle();
		}
	});

	update_home();
	update_away();
});

})();