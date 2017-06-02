const NUM_ROWS = 15;
const NUM_COLUMNS = 15;
const NUM_TILES = NUM_ROWS * NUM_COLUMNS;
const NUM_TRAY_TILES = 7;
const BORDER_WIDTH = 1;
const DEBUG = true;
const CURRENT_TILE_CLASS = "current-turn-tiles";

function tile(_id, _character, _score) {
	this.id = _id;
	this.character = _character,
	this.score = _score,
	this.left = null,
	this.up = null,
	this.right = null,
	this.down = null
};

var UI = (function() {

	return {
		init: function() {
			var boardEl = $("#board");
			for (var i = 0; i < NUM_ROWS; i++) {
				boardEl.append("<div id='row" + i + "' class='row'></div>");
				var curRow = boardEl.children("#row" + i);
				for (var j = 0; j < NUM_COLUMNS; j++) {
					var id = 'tile' + (i+1) + "-" + (j+1);
					curRow.append("<div id='" + id + "' class='tile board-tile'></div>");
				} 
				BoardUtil.setTileDroppable(curRow.find(".tile"));
			} 

			var tray = $("#tray");
			for (var i = 0; i < NUM_TRAY_TILES; i++) {
				var id = "tray-tile" + i;
				tray.append("<div id='tray-tile" + i + "' class='tile tray-tile current-turn-tiles'></div>");
			}

			this.resizeUI();

		},

		resizeUI: function() {

			var boardEl = $("#board"),
			    rows    = $(".row"),
			    tiles   = $(".tile"),
			    tray    = $("#tray");

			var boardLength = boardEl.width(),
			    rowHeight   = boardLength / NUM_ROWS - BORDER_WIDTH,
			    tileWidth   = boardLength / NUM_COLUMNS - BORDER_WIDTH;

			boardEl.css('height', boardLength);
			rows.css('height', rowHeight);
			rows.css('width', boardLength);
			tiles.css('height', rowHeight);
			tiles.css('width', tileWidth);
			tray.css('height', rowHeight);
			tray.css('width', (tileWidth + BORDER_WIDTH) * NUM_TRAY_TILES);
		},


	}

})();

var BoardUtil = (function() {

	// Private
	var tileBase = { 
		'A' : { count : 9, score : 1, character : "A"},
		'B' : { count : 2, score : 3, character : "B"},
		'C' : { count : 2, score : 3, character : "C"},
		'D' : { count : 4, score : 2, character : "D"},
		'E' : { count : 12, score : 1, character : "E"},
		'F' : { count : 2, score : 4, character : "F"},
		'G' : { count : 3, score : 2, character : "G"},
		'H' : { count : 2, score : 4, character : "H"},
		'I' : { count : 9, score : 1, character : "I"},
		'J' : { count : 1, score : 8, character : "J"},
		'K' : { count : 1, score : 5, character : "K"},
		'L' : { count : 4, score : 1, character : "L"},
		'M' : { count : 2, score : 3, character : "M"},
		'N' : { count : 6, score : 1, character : "N"},
		'O' : { count : 8, score : 1, character : "O"},
		'P' : { count : 2, score : 3, character : "P"},
		'Q' : { count : 1, score : 10, character : "Q"},
		'R' : { count : 6, score : 1, character : "R"},
		'S' : { count : 4, score : 1, character : "S"},
		'T' : { count : 6, score : 1, character : "T"},
		'U' : { count : 4, score : 1, character : "U"},
		'V' : { count : 2, score : 4, character : "V"},
		'W' : { count : 2, score : 4, character : "W"},
		'X' : { count : 1, score : 8, character : "X"},
		'Y' : { count : 2, score : 4, character : "Y"},
		'Z' : { count : 1, score : 10, character : "Z"}
	}
	
	var tileMap = new Map();
	var currentTurnTiles;  // DOM list

	// Public
	return {

		getTile: function(_target) {
			var id = this.getIdFromArg(_target);
			return tileMap.get(id);
		},

		hasTile: function(_target) {
			var id = this.getIdFromArg(_target);
			return tileMap.has(id);
		},

		getTileChatacter: function(_target) {
			return this.getTile(_target).character;
		},

		getTrayTile: function(_target) {
			var id = this.getIdFromArg(_target);
			return tileMap.get(id);
		},
		
		getTrayTileCharacter: function(_target) {
			return this.getTrayTile(_target).character;
		}, 

		tileMoved: function(_source, _target) {
			if (DEBUG) console.log("tileMoved: \n    source: " + _source + ". target: " + _target);
			this.setTile(_target, this.getTile(this.getIdFromArg(_source)));
			tileMap.delete(_source);
		},

		setTile: function(_target, _tile) {
			var id   = this.getIdFromArg(_target);
			var char = _tile.character;

			_tile.id = id;
			tileMap.set(id, _tile);
			if (char != null) $("#" + id).html("<p>" + char + "</p>").show();
		},

		setTrayTile: function(_target, _tile) {
			var id   = this.getIdFromArg(_target);
			var char = _tile.character;

			tileMap.set(id, _tile);
			if (char) $("#" + id).html("<p>" + char + "</p>").show();
		},

		setTileDraggable: function(_target) {
			element = this.getDomFromArg(_target);
			if (element.draggable("instance")) {		// If there's already an instance,
				element.draggable("enable");			// just enable.
			} else {
				element.draggable({
					revert: true,
					revertDuration: 0
				});
			}
			element.addClass(CURRENT_TILE_CLASS);
		},

		setTileDroppable: function(_target) {
			element = this.getDomFromArg(_target);
			element.droppable({
				drop: function(event, ui) {
					var targetId = $(this).attr('id');
					if (tileMap.has(targetId)) { 
						return; // space is occupied -- do nothing.
					}
					var sourceId = ui.draggable.attr('id');
					BoardUtil.tileMoved(sourceId, targetId);
					BoardUtil.setBlankSpace(sourceId);
					BoardUtil.setTileDraggable(targetId);
					console.log(sourceId + " dropped. "
						+ targetId + " now draggable");
					
				}
			});
		},

		setBlankSpace: function(_target) {
			var element = this.getDomFromArg(_target);
			element.html("").draggable("disable");
			element.removeClass(CURRENT_TILE_CLASS);
		},

		getDomFromArg: function(callerParam) {	// Allows methods to take in multiple types
			var type = jQuery.type(callerParam);
			switch(type) {
				case "string": return $("#" + callerParam);
				case "array" : return $("#tile" + callerParam[0] + "-" + callerParam[1]);
				case "object": return callerParam;
				case "number": return $("#tray-tile" + callerParam);
			}
		},

		getIdFromArg: function(callerParam) {
			var type = jQuery.type(callerParam);
			switch(type) {
				case "string": return callerParam; 
				case "array" : return "tile" + callerParam[0] + "-" + callerParam[1];
				case "object": return callerParam.attr('id');
				case "number": return "tray-tile" + callerParam;
			}
		},
	//parses the coordinates from the id
		parseCoordFromId: function(str) {
			var retArr = [],
			    count = 0;

			if (DEBUG) console.log("parseCoordFromId arg: " + str);
			for (var i = 4; i < str.length; i++) {	//indices specific to tile naming convention
				var coord = parseInt(str.substring(i, str.length));
				if (coord === NaN) continue;
				retArr.push(coord);
				i += coord / 10 >= 1 ? 2 : 1; // one or two digits
				if (++count >= 2) break;
			}
			if (DEBUG) console.log("parseCoordFromId return: " + retArr);
			return retArr;
		},

	// Get tile coordinate
		getPosFromArg: function(callerParam) {
			var type = jQuery.type(callerParam);
			switch(type) {				// Gets last two characters in ID; this will always be coordinates
				case "string": return this.parseCoordFromId(callerParam);
				case "array" : return callerParam; 
				case "object": return this.parseCoordFromId(callerParam.attr('id'));
			}
		},

		getRandomLetter: function() {
			var selector = Math.floor(Math.random() * 25) + 65, // Gets random ASCII value
			    letter   = tileBase[String.fromCharCode(selector)],
			    endCount = 0;

			while (letter.count <= 0) {
				if (++selector > 90) selector = 65;				// Gets next letter, wraps around.
				letter = tileBase[String.fromCharCode(selector)];
				if (++endCount > 26) return false;  // game over
			}
			letter.count--;
			return letter;
		},

  // sets up a linked list to evaluate words; only updates tiles used this turn;
		updateAdjacentTiles: function() {
			$("." + CURRENT_TILE_CLASS + ".board-tile").each(function() {

				var obj    =  $(this),
				    coords =  BoardUtil.getPosFromArg(obj),
				    id     =  BoardUtil.getIdFromArg(obj),
				    tile   =  BoardUtil.getTile(id),
				    x      =  coords[0], y = coords[1];	

				tile.up    =  (x != 1) ? BoardUtil.getTile([x - 1, y]) : null;
				tile.down  = (x != 15) ? BoardUtil.getTile([x + 1, y]) : null;
				tile.left  =  (y != 1) ? BoardUtil.getTile([x, y - 1]) : null;
				tile.right = (y != 15) ? BoardUtil.getTile([x, y + 1]) : null;

				if (tile.up) tile.up.down = tile;
				if (tile.down) tile.down.up = tile;			// sets up bidirectional linked list
				if (tile.left) tile.left.right = tile;	
				if (tile.right) tile.right.left = tile;

				if (DEBUG) {
					console.log("updateAdjacentTiles: " + '\n' +
								"   coords: " + x + " , " + y + '\n' +
								"   arg: " + obj + '\n' +
								"   result: ");
					console.log(tile);
				}
			});
		},

		setNextTurnTiles: function() {
			for (var i = 0; i < NUM_TRAY_TILES; i++) {
				if (!this.hasTile(i)) {
					var letter = this.getRandomLetter();
					//if (!letter) Game.endGame(); <-- maybe not? -- TODO
					this.setTrayTile(i, new tile(this.getIdFromArg(i), letter.character, letter.score));
				}
			}
			var tray = $("#tray > div");
			this.setTileDraggable(tray);
			tray.addClass(CURRENT_TILE_CLASS);
		},

		numCurTilesOnBoard: function() {
			var count = 0;
			$("#tray > div").each(function() {
				if (BoardUtil.hasTile($(this))) count++;
			});
			if (DEBUG) console.log("trayTileCount: " + count);
			return NUM_TRAY_TILES - count;
		},

		/*
		 * Count all tiles on board, ensure they are either in the same column or row,
		 * check if all tiles are contiguous 
		 *
		 * Returns false if invalid placement OTHERWISE returns orientation as string
		 */

		evalutateTilePlacementValidity: function() {
			var tilePos 	= [],
				isCorrect	= false,
			    isInRow 	= true, 
			    isInColumn 	= true,
			    tiles 		= $("." + CURRENT_TILE_CLASS + ".board-tile");

			tiles.each(function() {
				tilePos.push(BoardUtil.getPosFromArg($(this)));
			});

			tilePos.forEach((curVal, index, arr) => {
				if (arr[0][0] != curVal[0]) {
					isInRow = false;
				}
			});

			if (!isInRow) {
				tilePos.forEach((curVal, index, arr) => {
					if (arr[0][1] != curVal[1]) {
						isInColumn = false;
					}
				});
			} else {isInColumn = false}

			if (DEBUG) { 
				console.log("evaluateTileValidity() : isInColumn: " + isInColumn + 
								", isInRow: " + isInRow);
			}

			if (!isInColumn && !isInRow) return false;

			var count    = 0;
			var traverse = this.getTile(tiles);

			if (isInRow) {
				while (traverse.left) {
					traverse = traverse.left;		// go all the way left then all the way right in linked list --
				}									// we don't know where in the chain we started
				while (traverse) {
					if ($("#" + traverse.id).hasClass(CURRENT_TILE_CLASS)) count++;
					traverse = traverse.right;		
				}
			} else {
				while (traverse.up) {
					traverse = traverse.up;
				}									// up then down
				while(traverse) {
					if ($("#" + traverse.id).hasClass(CURRENT_TILE_CLASS)) count++;
					traverse = traverse.down;
				}
			}

			var numCurTilesOnBoard = this.numCurTilesOnBoard();
			if (count < numCurTilesOnBoard) {
				if (DEBUG) console.log("evaluateTilePlacementValidity(): iterative count less than actual count");
				return false;
			}
			if (DEBUG && count > numCurTilesOnBoard) { 
				console.log("Board.evaluateTilePlacementValidity()" + '\n' +
					"Iterative count greater than actual tile count. Something is very wrong!");
			}

			return isInRow ? "row" : "column";
		}
	};

})();

var Game = (function () {

	var numCurTilesOnBoard,
	    totalScore = 0,
	    isCurrentTurn;

	//public
	return{

		startTurn: function() {
			BoardUtil.setNextTurnTiles();
			isCurrentTurn = true;
		},

		endTurn: function() {
			if(!(numCurTilesOnBoard = BoardUtil.numCurTilesOnBoard())) {
				alert("No tiles placed");
				return;
			}

			BoardUtil.updateAdjacentTiles();

			var tileAlignment = BoardUtil.evalutateTilePlacementValidity();
			if (!(tileAlignment)) {
				alert("Tile placement invalid");
				return;
			}

			this.calcScore(tileAlignment);
			var oldTiles = $("." + CURRENT_TILE_CLASS + ".board-tile");
			oldTiles.draggable("disable");
			oldTiles.removeClass(CURRENT_TILE_CLASS);
			isCurrentTurn = false;
		},
	// TODO
		isWord: function(word) {
			return true;
		},

		calcScore: function(tileAlignment) {  // Row or column?
			var score = { val: 0 }; // so we can pass as reference to recursive calls
			var traverse = BoardUtil.getTile($("." + CURRENT_TILE_CLASS + ".board-tile"));

			if (tileAlignment === "row") {
				while (traverse.left) traverse = traverse.left;
			} else if (tileAlignment === "column") {
				while (traverse.up) traverse = traverse.up;
			} else {
				console.log("Game.calcScore() --> tileAlignment argument is invalid: " + tileAlignment)
			}

			var wordList = [""];

			var result = this.calcScoreNittyGritty(traverse, tileAlignment, score, wordList);

			if (!(result === true)) {
				alert("Invalid word: " + result);
				return false;
			}

			/*
			 *	TODO: add html elements to display total score, words created this turn, maybe a word history...
			 */

			totalScore += score.val;
			alert("totalScore: " + totalScore);
			return true;
		},

	// returns true if all words are valid, OTHERWISE returns the invalid word
		calcScoreNittyGritty: function(curTile, alignment, score, wordList) {

			if (!curTile) {
				var parallelWord = wordList[0];
				if (parallelWord != "" && !this.isWord(parallelWord)) return parallelWord;
				return true;
			}

			var traverse = curTile;
			var perpWord = "";

			if (alignment === "row") {
				while (traverse.up) traverse = traverse.up;
				if ((traverse != curTile || curTile.down) && $("#" + curTile.id).hasClass(CURRENT_TILE_CLASS)) {  
					while (traverse) {							// if there is a column of tiles for				   				
						perpWord += traverse.character;			// current tile -- a vertical word exists
						score.val += traverse.score;			// also checks if the current tile is a tile placed on this turn
						traverse = traverse.down;
					}
				}
			} else {
				while (traverse.left) traverse = traverse.left;
				if ((traverse != curTile || curTile.right) && $("#" + curTile.id).hasClass(CURRENT_TILE_CLASS)) { 
					while (traverse) {						// same check as above but for rows perpendicular to placed tiles    				
						perpWord += traverse.character;
						score.val += traverse.score;
						traverse = traverse.right;
					}
				}
			}

			if (perpWord != "") {
				if(!this.isWord(perpWord)) return perpWord;
				wordList.push(perpWord);
			}
			  
			wordList[0] += curTile.character;  // wordList[0] is the parallel word  
			score.val += curTile.score;
			
			if (alignment == "row")
				return this.calcScoreNittyGritty(curTile.right, alignment, score, wordList);
			if (alignment == "column")
				return this.calcScoreNittyGritty(curTile.down, alignment, score, wordList);
		}
	};
})();