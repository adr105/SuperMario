// Adrián Camacho Pérez

window.addEventListener("load",function() {
	var Q = window.Q = Quintus()
	        .include("Sprites, Scenes, Input, Touch, UI, TMX, Anim, 2D")
	        .setup({ width: 320, height: 480})
	        .controls().touch();

	/* Mario */
	Q.Sprite.extend("Player",{
		init: function(p){
			this._super(p, {
				sheet: "mario_small",
				sprite: "mario_small",
			    x: 150,
			    y: 380,
			});
	    this.add('2d, platformerControls');

		},


	});



	Q.loadTMX("level.tmx, mario_small.json, mario_small.png", function(){
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.sheet("mario_small","mario_small.png", { tilew: 32, tileh: 32 });
		Q.stageScene("level1");

	});

	Q.scene("level1", function(stage) {
	  Q.stageTMX("level.tmx", stage);
	  Mario = stage.insert(new Q.Player());
	  stage.add("viewport").follow(Mario);
	  stage.viewport.offsetX = -Q.width*30/100;
  	  stage.viewport.offsetY = Q.height*33/100;
	  //stage.centerOn(150, 380);

	 });

	
});