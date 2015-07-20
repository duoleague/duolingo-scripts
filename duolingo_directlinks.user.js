// ==UserScript==
// @name           DuoDirectLinks
// @namespace      https://github.com/liuch/duolingo-scripts
// @include        https://www.duolingo.com/*
// @version        0.2.2
// @grant          none
// @description    This script adds the direct links for discussion comments, translation sentences, and activity stream events
// @description:ru Этот скрипт добавляет прямые ссылки на комментария в форумах, на предложения в переводах и на события в ленте
// @updateURL      https://github.com/liuch/duolingo-scripts/raw/master/duolingo_directlinks.meta.js
// @downloadURL    https://github.com/liuch/duolingo-scripts/raw/master/duolingo_directlinks.user.js
// @author         FieryCat aka liuch
// @license        MIT License
// ==/UserScript==

function inject(f) { //Inject the script into the document
	var script;
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('name', 'duodirectlinks');
	script.textContent = '(' + f.toString() + ')(jQuery)';
	document.head.appendChild(script);
}
inject(f);

function f($) {
	var trs = {
		"Direct link" : {
			"ru" : "Прямая ссылка",
			"uk" : "Пряме посилання"
		}
	}
	function tr(t) {
		if (duo.user !== undefined && duo.user.attributes.ui_language !== undefined && trs[t] !== undefined && trs[t][duo.user.attributes.ui_language] != undefined)
			return trs[t][duo.user.attributes.ui_language];
		return t;
	}

	function start(e, r, o) {
		if (!duo)
			return;

		// Activity links
		var x = new RegExp("^/(activity|stream)/[0-9]+\\?");
		if (x.exec(o.url)) {
			var j = $.parseJSON(r.responseText);
			if (j.events) {
				var id = 0, h = null;
				for (var i = 0; i < j.events.length; ++i) {
					id = j.events[i].id;
					if (id) {
						h = $("#comment-box-" + id).parents(".stream-item").children(".stream-item-header");
						if (h.length) {
							h.prepend('<a class="left" style="margin-right:5px;" href="/event/' + id + '"><span class="icon icon-link" /></a>');
						}
					}
				}
			}
			return;
		}

		// Translation links
		x = new RegExp("^/wiki_translation_sentence/[a-z0-9]+/[a-z0-9]+/(get_sentence|get_revisions)");
		if (x.exec(o.url)) {
			x = new RegExp("^/translation/([a-z0-9]+)($|\\$)");
			var id = x.exec(document.location.pathname);
			if (id) {
				id = id[1];
				var el = $(".document-sentence-sidebar :visible").find(".report-translator-cheating-wrapper");
				if (el.length && !el.find(".icon-link").length) {
					var idx = el.parent().parent().parent().attr("id").replace("sentence-sidebar-", "");
					el.append('<a class="right" href="/translation/' + id + '$index=' + idx + '"><span class="icon icon-link" style="margin-right:5px;" />' + tr('Direct link') + '</a>');
				}
			}
		}
	}

	$(document).ajaxComplete(function(e, r, o) {
		start(e, r, o);
	});
}
