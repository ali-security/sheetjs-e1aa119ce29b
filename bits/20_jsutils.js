function keys(o/*:any*/)/*:Array<any>*/ {
	var ks = Object.keys(o), o2 = [];
	for(var i = 0; i < ks.length; ++i) if(Object.prototype.hasOwnProperty.call(o, ks[i])) o2.push(ks[i]);
	return o2;
}

function evert_key(obj/*:any*/, key/*:string*/)/*:EvertType*/ {
	var o = ([]/*:any*/), K = keys(obj);
	for(var i = 0; i !== K.length; ++i) if(o[obj[K[i]][key]] == null) o[obj[K[i]][key]] = K[i];
	return o;
}

function evert(obj/*:any*/)/*:EvertType*/ {
	var o = ([]/*:any*/), K = keys(obj);
	for(var i = 0; i !== K.length; ++i) o[obj[K[i]]] = K[i];
	return o;
}

function evert_num(obj/*:any*/)/*:EvertNumType*/ {
	var o = ([]/*:any*/), K = keys(obj);
	for(var i = 0; i !== K.length; ++i) o[obj[K[i]]] = parseInt(K[i],10);
	return o;
}

function evert_arr(obj/*:any*/)/*:EvertArrType*/ {
	var o/*:EvertArrType*/ = ([]/*:any*/), K = keys(obj);
	for(var i = 0; i !== K.length; ++i) {
		if(o[obj[K[i]]] == null) o[obj[K[i]]] = [];
		o[obj[K[i]]].push(K[i]);
	}
	return o;
}

var basedate = /*#__PURE__*/new Date(1899, 11, 30, 0, 0, 0); // 2209161600000
function datenum(v/*:Date*/, date1904/*:?boolean*/)/*:number*/ {
	var epoch = /*#__PURE__*/v.getTime();
	if(date1904) epoch -= 1462*24*60*60*1000;
	var dnthresh = /*#__PURE__*/basedate.getTime() + (/*#__PURE__*/v.getTimezoneOffset() - /*#__PURE__*/basedate.getTimezoneOffset()) * 60000;
	return (epoch - dnthresh) / (24 * 60 * 60 * 1000);
}
var refdate = /*#__PURE__*/new Date();
var dnthresh = /*#__PURE__*/basedate.getTime() + (/*#__PURE__*/refdate.getTimezoneOffset() - /*#__PURE__*/basedate.getTimezoneOffset()) * 60000;
var refoffset = /*#__PURE__*/refdate.getTimezoneOffset();
function numdate(v/*:number*/)/*:Date*/ {
	var out = new Date();
	out.setTime(v * 24 * 60 * 60 * 1000 + dnthresh);
	if (out.getTimezoneOffset() !== refoffset) {
		out.setTime(out.getTime() + (out.getTimezoneOffset() - refoffset) * 60000);
	}
	return out;
}

/* ISO 8601 Duration */
function parse_isodur(s) {
	var sec = 0, mt = 0, time = false;
	var m = s.match(/P([0-9\.]+Y)?([0-9\.]+M)?([0-9\.]+D)?T([0-9\.]+H)?([0-9\.]+M)?([0-9\.]+S)?/);
	if(!m) throw new Error("|" + s + "| is not an ISO8601 Duration");
	for(var i = 1; i != m.length; ++i) {
		if(!m[i]) continue;
		mt = 1;
		if(i > 3) time = true;
		switch(m[i].slice(m[i].length-1)) {
			case 'Y':
				throw new Error("Unsupported ISO Duration Field: " + m[i].slice(m[i].length-1));
			case 'D': mt *= 24;
				/* falls through */
			case 'H': mt *= 60;
				/* falls through */
			case 'M':
				if(!time) throw new Error("Unsupported ISO Duration Field: M");
				else mt *= 60;
				/* falls through */
			case 'S': break;
		}
		sec += mt * parseInt(m[i], 10);
	}
	return sec;
}

var good_pd_date_1 = /*#__PURE__*/new Date('2017-02-19T19:06:09.000Z');
var good_pd_date = /*#__PURE__*/isNaN(/*#__PURE__*/good_pd_date_1.getFullYear()) ? /*#__PURE__*/new Date('2/19/17') : good_pd_date_1;
var good_pd = /*#__PURE__*/good_pd_date.getFullYear() == 2017;
/* parses a date as a local date */
function parseDate(str/*:string|Date*/, fixdate/*:?number*/)/*:Date*/ {
	var d = new Date(str);
	if(good_pd) {
		/*:: if(fixdate == null) fixdate = 0; */
		if(fixdate > 0) d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
		else if(fixdate < 0) d.setTime(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
		return d;
	}
	if(str instanceof Date) return str;
	if(good_pd_date.getFullYear() == 1917 && !isNaN(d.getFullYear())) {
		var s = d.getFullYear();
		if(str.indexOf("" + s) > -1) return d;
		d.setFullYear(d.getFullYear() + 100); return d;
	}
	var n = str.match(/\d+/g)||["2017","2","19","0","0","0"];
	var out = new Date(+n[0], +n[1] - 1, +n[2], (+n[3]||0), (+n[4]||0), (+n[5]||0));
	if(str.indexOf("Z") > -1) out = new Date(out.getTime() - out.getTimezoneOffset() * 60 * 1000);
	return out;
}

function cc2str(arr/*:Array<number>*/, debomit)/*:string*/ {
	if(has_buf && Buffer.isBuffer(arr)) {
		if(debomit) {
			if(arr[0] == 0xFF && arr[1] == 0xFE) return utf8write(arr.slice(2).toString("utf16le"));
			if(arr[1] == 0xFE && arr[2] == 0xFF) return utf8write(utf16beread(arr.slice(2).toString("binary")));
		}
		return arr.toString("binary");
	}

	if(typeof TextDecoder !== "undefined") try {
		if(debomit) {
			if(arr[0] == 0xFF && arr[1] == 0xFE) return utf8write(new TextDecoder("utf-16le").decode(arr.slice(2)));
			if(arr[0] == 0xFE && arr[1] == 0xFF) return utf8write(new TextDecoder("utf-16be").decode(arr.slice(2)));
		}
		var rev = {
			"\u20ac": "\x80", "\u201a": "\x82", "\u0192": "\x83", "\u201e": "\x84",
			"\u2026": "\x85", "\u2020": "\x86", "\u2021": "\x87", "\u02c6": "\x88",
			"\u2030": "\x89", "\u0160": "\x8a", "\u2039": "\x8b", "\u0152": "\x8c",
			"\u017d": "\x8e", "\u2018": "\x91", "\u2019": "\x92", "\u201c": "\x93",
			"\u201d": "\x94", "\u2022": "\x95", "\u2013": "\x96", "\u2014": "\x97",
			"\u02dc": "\x98", "\u2122": "\x99", "\u0161": "\x9a", "\u203a": "\x9b",
			"\u0153": "\x9c", "\u017e": "\x9e", "\u0178": "\x9f"
		};
		if(Array.isArray(arr)) arr = new Uint8Array(arr);
		return new TextDecoder("latin1").decode(arr).replace(/[€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g, function(c) { return rev[c] || c; });
	} catch(e) {}

	var o = [];
	for(var i = 0; i != arr.length; ++i) o.push(String.fromCharCode(arr[i]));
	return o.join("");
}

function dup(o/*:any*/)/*:any*/ {
	if(typeof JSON != 'undefined' && !Array.isArray(o)) return JSON.parse(JSON.stringify(o));
	if(typeof o != 'object' || o == null) return o;
	if(o instanceof Date) return new Date(o.getTime());
	var out = {};
	for(var k in o) if(Object.prototype.hasOwnProperty.call(o, k)) out[k] = dup(o[k]);
	return out;
}

function fill(c/*:string*/,l/*:number*/)/*:string*/ { var o = ""; while(o.length < l) o+=c; return o; }

/* TODO: stress test */
function fuzzynum(s/*:string*/)/*:number*/ {
	var v/*:number*/ = Number(s);
	if(!isNaN(v)) return isFinite(v) ? v : NaN;
	if(!/\d/.test(s)) return v;
	var wt = 1;
	var ss = s.replace(/([\d]),([\d])/g,"$1$2").replace(/[$]/g,"").replace(/[%]/g, function() { wt *= 100; return "";});
	if(!isNaN(v = Number(ss))) return v / wt;
	ss = ss.replace(/[(]([^()]*)[)]/,function($$, $1) { wt = -wt; return $1;});
	if(!isNaN(v = Number(ss))) return v / wt;
	return v;
}
var lower_months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
function fuzzydate(s/*:string*/)/*:Date*/ {
	var o = new Date(s), n = new Date(NaN);
	var y = o.getYear(), m = o.getMonth(), d = o.getDate();
	if(isNaN(d)) return n;
	var lower = s.toLowerCase();
	if(lower.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/)) {
		lower = lower.replace(/[^a-z]/g,"").replace(/([^a-z]|^)[ap]m?([^a-z]|$)/,"");
		if(lower.length > 3 && lower_months.indexOf(lower) == -1) return n;
	} else if(lower.match(/[a-z]/)) return n;
	if(y < 0 || y > 8099) return n;
	if((m > 0 || d > 1) && y != 101) return o;
	if(s.match(/[^-0-9:,\/\\]/)) return n;
	return o;
}

var split_regex = /*#__PURE__*/(function() {
	var safe_split_regex = "abacaba".split(/(:?b)/i).length == 5;
	return function split_regex(str/*:string*/, re, def/*:string*/)/*:Array<string>*/ {
		if(safe_split_regex || typeof re == "string") return str.split(re);
		var p = str.split(re), o = [p[0]];
		for(var i = 1; i < p.length; ++i) { o.push(def); o.push(p[i]); }
		return o;
	};
})();

function remove_doctype(str) {
	var preamble = str.slice(0, 1024);
	var si = preamble.indexOf("<!DOCTYPE");
	if(si == -1) return str;
	var m = str.match(/<[\w]/);
	if(!m) return str;
	return str.slice(0, si) + str.slice(m.index);
}

/* str.match(/<!--[\s\S]*?-->/g) --> str_match_ng(str, "<!--", "-->") */
function str_match_ng(str, s, e) {
  var out = [];

  var si = str.indexOf(s);
  while(si > -1) {
    var ei = str.indexOf(e, si + s.length);
		if(ei == -1) break;

		out.push(str.slice(si, ei + e.length));
		si = str.indexOf(s, ei + e.length);
	}

  return out.length > 0 ? out : null;
}

/* str.replace(/<!--[\s\S]*?-->/g, "") --> str_remove_ng(str, "<!--", "-->") */
function str_remove_ng(str, s, e) {
  var out = [], last = 0;

  var si = str.indexOf(s);
	if(si == -1) return str;
  while(si > -1) {
		out.push(str.slice(last, si));
    var ei = str.indexOf(e, si + s.length);
		if(ei == -1) break;

		if((si = str.indexOf(s, (last = ei + e.length))) == -1) out.push(str.slice(last));
	}

  return out.join("");
}

/* str.match(/<tag\b[^>]*?>([\s\S]*?)</tag>/) --> str_match_xml(str, "tag") */
var xml_boundary = { " ": 1, "\t": 1, "\r": 1, "\n": 1, ">": 1 };
function str_match_xml(str, tag) {
	var si = str.indexOf('<' + tag), w = tag.length + 1, L = str.length;
	while(si >= 0 && si <= L - w && !xml_boundary[str.charAt(si + w)]) si = str.indexOf('<' + tag, si+1);
	if(si === -1) return null;
	var sf = str.indexOf(">", si + tag.length);
	if(sf === -1) return null;
	var et = "</" + tag + ">";
	var ei = str.indexOf(et, sf);
	if(ei == -1) return null;
	return [str.slice(si, ei + et.length), str.slice(sf + 1, ei)];
}

/* str.match(/<(?:\w+:)?tag\b[^<>]*?>([\s\S]*?)<\/(?:\w+:)?tag>/) --> str_match_xml_ns(str, "tag") */
var str_match_xml_ns = /*#__PURE__*/(function() {
	var str_match_xml_ns_cache = {};
	return function str_match_xml_ns(str, tag) {
		var res = str_match_xml_ns_cache[tag];
		if(!res) str_match_xml_ns_cache[tag] = res = [
			new RegExp('<(?:\\w+:)?'+tag+'\\b[^<>]*>', "g"),
			new RegExp('</(?:\\w+:)?'+tag+'>', "g")
		];
		res[0].lastIndex = res[1].lastIndex = 0;
		var m = res[0].exec(str);
		if(!m) return null;
		var si = m.index;
		var sf = res[0].lastIndex;
		res[1].lastIndex = res[0].lastIndex;
		m = res[1].exec(str);
		if(!m) return null;
		var ei = m.index;
		var ef = res[1].lastIndex;
		return [str.slice(si, ef), str.slice(sf, ei)];
	};
})();

/* str.match(/<(?:\w+:)?tag\b[^<>]*?>([\s\S]*?)<\/(?:\w+:)?tag>/g) --> str_match_xml_ns_g(str, "tag") */
var str_match_xml_ns_g = /*#__PURE__*/(function() {
	var str_match_xml_ns_cache = {};
	return function str_match_xml_ns(str, tag) {
		var out = [];
		var res = str_match_xml_ns_cache[tag];
		if(!res) str_match_xml_ns_cache[tag] = res = [
			new RegExp('<(?:\\w+:)?'+tag+'\\b[^<>]*>', "g"),
			new RegExp('</(?:\\w+:)?'+tag+'>', "g")
		];
		res[0].lastIndex = res[1].lastIndex = 0;
		var m;
		while((m = res[0].exec(str))) {
			var si = m.index;
			res[1].lastIndex = res[0].lastIndex;
			m = res[1].exec(str);
			if(!m) return null;
			var ef = res[1].lastIndex;
			out.push(str.slice(si, ef));
			res[0].lastIndex = res[1].lastIndex;
		}
		return out.length == 0 ? null : out;
	};
})();

/* str.replace(/<(?:\w+:)?tag\b[^<>]*?>([\s\S]*?)<\/(?:\w+:)?tag>/g, "") --> str_remove_xml_ns_g(str, "tag") */
var str_remove_xml_ns_g = /*#__PURE__*/(function() {
	var str_remove_xml_ns_cache = {};
	return function str_remove_xml_ns_g(str, tag) {
		var out = [];
		var res = str_remove_xml_ns_cache[tag];
		if(!res) str_remove_xml_ns_cache[tag] = res = [
			new RegExp('<(?:\\w+:)?'+tag+'\\b[^<>]*>', "g"),
			new RegExp('</(?:\\w+:)?'+tag+'>', "g")
		];
		res[0].lastIndex = res[1].lastIndex = 0;
		var m;
		var si = 0, ef = 0;
		while((m = res[0].exec(str))) {
			si = m.index;
			out.push(str.slice(ef, si));
			ef = si;
			res[1].lastIndex = res[0].lastIndex;
			m = res[1].exec(str);
			if(!m) return null;
			ef = res[1].lastIndex;
			res[0].lastIndex = res[1].lastIndex;
		}
		out.push(str.slice(ef));
		return out.length == 0 ? "" : out.join("");
	};
})();

/* str.match(/<tag\b[^<>]*?>([\s\S]*?)<\/tag>/gi) --> str_match_xml_ig(str, "tag") */
var str_match_xml_ig = /*#__PURE__*/(function() {
	var str_match_xml_ns_cache = {};
	return function str_match_xml_ns(str, tag) {
		var out = [];
		var res = str_match_xml_ns_cache[tag];
		if(!res) str_match_xml_ns_cache[tag] = res = [
			new RegExp('<'+tag+'\\b[^<>]*>', "ig"),
			new RegExp('</'+tag+'>', "ig")
		];
		res[0].lastIndex = res[1].lastIndex = 0;
		var m;
		while((m = res[0].exec(str))) {
			var si = m.index;
			res[1].lastIndex = res[0].lastIndex;
			m = res[1].exec(str);
			if(!m) return null;
			var ef = res[1].lastIndex;
			out.push(str.slice(si, ef));
			res[0].lastIndex = res[1].lastIndex;
		}
		return out.length == 0 ? null : out;
	};
})();
