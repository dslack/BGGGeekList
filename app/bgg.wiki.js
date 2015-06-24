var BGGWiki = (function(){

var REXP = {
	center: /\[center\](.*?)\[\/center\]/,
	image: /\[ImageID\=(\d+).*?\]/,
	thing: /\[thing\=(\d+)\](.*?)\[\/thing\]/,
	italics: /\[i\](.*?)\[\/i\]/,
	bold: /\[b\](.*?)\[\/b\]/,
	floatright: /\[floatright\](.*?)\[\/floatright\]/,
	youtube: /\[youtube=(.*?)\]/,
	blogpost: /\[blogpost=(\d+)\](.*?)\[\/blogpost\]/,
	url: /\[url=(.*?)\](.*?)\[\/url\]/,
	quote: /\[q\](.*?)\[\/q\]/
};

var TASKS = {
	center: process_center,
	image: process_image,
	thing: process_thing,
	italics: process_italics,
	bold : process_bold,
	floatright: process_floatright,
	youtube: process_youtube,
	blogpost: process_blogpost,
	url: process_url,
	quote: process_quote
}

var conv = {};

conv.process = function(wikitext, options){

	var lines = wikitext.split(/\r?\n/);	
	var html = "";

	lines.forEach(function(line, idx){
		if (line === "") {
			return;
		}
		var newLine = line;

		Object.keys(REXP).forEach(function(key) {
			var timer = 0;
			while (newLine.match(REXP[key]) != null)  {
				if (timer > 4) {
					break;
				}
				newLine = TASKS[key](newLine);
				timer += 1;

			}
			if (timer > 4) {
				console.log(newLine);
			}
			timer = 0;
		});

		if (idx < lines.length) {
			html += newLine+"\r\n";
		}
	})

	html = wiky.process(html, options);

	return html;
};



function process_center(line){
	var reResult= REXP.center.exec(line);
	var centeredText = reResult[1];
	line = line.replace(REXP.center, "<div style='text-align:center'>" + centeredText+"</div>");

	return line;
};

function process_image(line) {
	var reResult= REXP.image.exec(line);
	var imageId = reResult[1];

	var html = "<a class='external-link' target='_blank' href='https://boardgamegeek.com/image/"+imageId+"'>"+
	"<i class='large-icon fa fa-picture-o'></i>"+
	"<i class='capper-icon fa fa-external-link'></i>"+
	"</a>"

	line = line.replace(REXP.image, html)
	return line;		
};

function process_thing(line) {
	var reResult= REXP.thing.exec(line);
	var id = reResult[1];
	var content = reResult[2];

	line = line.replace(REXP.thing, "<a  target='_blank' href='https://boardgamegeek.com/boardgame/"+id+"'>"+content+"</a>")
	return line;			
};

function process_italics(line) {
	var reResult= REXP.italics.exec(line);
	var content = reResult[1];

	line = line.replace(REXP.italics, "<em>"+content+"</em>")
	return line;			
};

function process_bold(line) {
	var reResult= REXP.bold.exec(line);
	var content = reResult[1];

	line = line.replace(REXP.bold, "<strong>"+content+"</strong>")
	return line;			
};

function process_floatright(line) {
	var reResult = REXP.floatright.exec(line);
	var content = reResult[1];

	line = line.replace(REXP.floatright, "<div style='float:right'>"+content+"</div>");
	return line;
}

function process_youtube(line) {
	var reResult = REXP.youtube.exec(line);
	var content = reResult[1];

	//line = line.replace(REXP.youtube, "<a href='https://www.youtube.com/watch?v="+content+"'><i class='fa fa-youtube'></i></a>");
	// var html = '<iframe id="ytplayer'+content+' type="text/html" width="640" height="390" '+
 //  			'src="http://www.youtube.com/embed/'+content+'?autoplay=0"	frameborder="0"/>';

 	var html = "<a class='external-link' href='http://www.youtube.com/embed/"+content+"?autoplay=0' target='_blank'>" +
		"<i class='fa fa-youtube large-icon'></i>" +
		"<i class='fa fa-external-link capper-icon'></i>" +
		"</a>";

	line = line.replace(REXP.youtube, html);  			
	return line;
}

function process_blogpost(line) {
	var reResult = REXP.blogpost.exec(line);
	var id = reResult[1];
	var content = reResult[2];

	line = line.replace(REXP.blogpost, "<a target='_blank' href='https://boardgamegeek.com/blogpost/"+id+"'>"+content+"</a>");
	return line;
}

function process_url(line) {
	var reResult = REXP.url.exec(line);
	var url = reResult[1];
	var content = reResult[2];

	line = line.replace(REXP.url, "<a  target='_blank' href='"+url+"'>"+content+"</a>");
	return line;
}

function process_quote(line) {
	var reResult = REXP.quote.exec(line);
	var content = reResult[1];

	line = line.replace(REXP.quote, "<blockquote><p>"+content+"</p></blockquote>");
	return line;
}

return conv;

})();