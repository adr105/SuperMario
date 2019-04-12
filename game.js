// Adrián Camacho Pérez

window.addEventListener("load",function() {
	var Q = window.Q = Quintus()
	        .include("Sprites, Scenes, Input, Touch, UI, TMX, Anim, 2D")
	        .setup({ width: 320, height: 480})
	        .controls().touch();

	Q.Sprite.extend("Player",{
		init: function(x, y, p){
			this._super(p, {
				sheet: "mario_small",
				sprite: "mario_small",
				speed: 300,
				jumpSpeed: -450,
				x: x,
				y: y,
				die: false

			});
			this.p.points = this.p.standingPoints;
		    this.add('2d, platformerControls');

		},
		
		step: function(dt) {
			
			if(this.p.y > 500) {
		       this.stage.unfollow(); 
		    }


		  }	  

	});
	


	Q.loadTMX("level.tmx, mario_small.json, mario_small.png", function(){
		Q.stageScene("level1");
		Q.compileSheets("mario_small.png","mario_small.json");
	});

	Q.scene("level1", function(stage) {
	  Q.stageTMX("level.tmx", stage);
	  Mario = stage.insert(new Q.Player(150, 380));
	  stage.add("viewport").follow(Mario);
	  stage.viewport.offsetX = -Q.width*30/100;
  	  stage.viewport.offsetY = Q.height*30/100;
	 });

	
});