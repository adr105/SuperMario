// Adrián Camacho Pérez

window.addEventListener("load",function() {
	var Q = window.Q = Quintus()
	        .include("Sprites, Scenes, Input, Touch, UI, TMX, Anim, 2D")
	        .setup({ width: 320, height: 480})
	        .controls().touch();


	Q.loadTMX("level.tmx, mario_small.json, mario_small.png", function(){
		Q.stageScene("level1");
		Q.compileSheets("mario_small.png","mario_small.json");
	});

	Q.scene("level1", function(stage) {
	  Q.stageTMX("level.tmx", stage);
	  stage.add("viewport");
	  stage.centerOn(150, 380);

	 });

	
});