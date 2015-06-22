var BGGWiki = (function(){

var REXP = {
	center: /\[center\](.*)\[\/center\]/,
	image: /\[ImageID\=(\d+).*?\]/,
	thing: /\[thing\=(\d+)\](.*?)\[\/thing\]/,
	italics: /\[i\](.*?)\[\/i\]/,
	bold: /\[b\](.*?)\[\/b\]/,
	floatright: /\[floatright\](.*?)\[\/floatright\]/,
};

var TASKS = {
	center: process_center,
	image: process_image,
	thing: process_thing,
	italics: process_italics,
	bold : process_bold,
	floatright: process_floatright
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

	line = line.replace(REXP.image, "<a href='https://boardgamegeek.com/image/"+imageId+"'><i class='glyphicon glyphicon-picture'></i></a>")
	return line;		
};

function process_thing(line) {
	var reResult= REXP.thing.exec(line);
	var id = reResult[1];
	var content = reResult[2];

	line = line.replace(REXP.thing, "<a href='https://boardgamegeek.com/boardgame/"+id+"'>"+content+"</a>")
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

	line = line.replace(REXP.floatright, "<div class='float:right'>"+content+"</div>");
	return line;
}


return conv;

})();