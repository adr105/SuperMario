// Adrián Camacho Pérez

window.addEventListener("load",function() {
	var Q = window.Q = Quintus()
	        .include("Sprites, Scenes, Input, Touch, UI, TMX, Anim, 2D")
	        .setup({ width: 320, height: 473}) //a 480 se ve el mapa repetido por Y
	        .controls().touch();

	Q.PLAYER = 1;
	Q.COIN   = 2;
	Q.ENEMY  = 4;



	/* Mario */
	Q.Sprite.extend("Player",{
		init: function(p){
			this._super(p, {
				sheet: "mario_small",
				sprite: "mario_small",
			    x: 150,
			    y: 500,
			    die: false,
			    type: Q.PLAYER,
			    collisionMask: Q.SPRITE_DEFAULT | Q.COIN,
			    win: false
			});
	    this.add('2d, platformerControls');
	    this.on("hit.sprite",function(collision) {
	      if(collision.obj.isA("Princess")) {
	        Q.stageScene("endGame",1, { label: "You Won!" }); 
	        this.destroy();
	      }
	    });

		},

		resetLv: function() {
		    Q.stageScene("level1");
		    this.p.die = false;
  		},

		marioDies: function(){
			this.resetLv();
		},

  		step: function(dt) {

  			if(this.p.y > 700){
		 		this.stage.unfollow(); 
		    }

    		if(this.p.y > 950){
    			this.marioDies();
   			}

  		}


	});

	Q.Sprite.extend("Princess", {
	  init: function(p) {
	    this._super(p, { sheet: 'princess', sprite: "princess", });
	  }
	});

	Q.Sprite.extend("Goomba",{
	  init: function(p) {
	    this._super(p, { sheet: 'goomba', vx: 100 });
	    this.add('2d, aiBounce');
	    
	    this.on("bump.left,bump.right,bump.bottom",function(collision) {
	      if(collision.obj.isA("Player")) { 
	        Q.stageScene("endGame",1, { label: "You Died" }); 
	        collision.obj.destroy();
	      }
	    });
	    
	    this.on("bump.top",function(collision) {
	      if(collision.obj.isA("Player")) { 
	        this.destroy();
	        collision.obj.p.vy = -300;
	      }
	    });
	  }
	});

	Q.Sprite.extend("Bloopa",{
	  init: function(p) {
	    this._super(p, { sheet: 'bloopa', vx: 0, vy: -140, rangeY: 90,
				gravity: 0,
				jumpSpeed: -230});
	    this.p.initialY = this.p.y;
	    this.add('2d, aiBounce');
	    
	    this.on("bump.left,bump.right,bump.bottom",function(collision) {
	      if(collision.obj.isA("Player")) { 
	        Q.stageScene("endGame",1, { label: "You Died" }); 
	        collision.obj.destroy();
	      }
	    });
	    
	    this.on("bump.top",function(collision) {
	      if(collision.obj.isA("Player")) { 
	        this.destroy();
	        collision.obj.p.vy = -300;
	      }
	    });
	  },

	  step: function(dt) {
			if(this.p.dead) {
				this.del('2d, aiBounce');
				this.p.deadTimer++;
				if (this.p.deadTimer > 24) {
					this.destroy();
				}
				return;
			}
			if(this.p.vy == 0){
				this.p.vy = -150;
			}
			if(this.p.y >= this.p.initialY) {		
				this.p.y = this.p.initialY;
				this.p.vy = -this.p.vy;
			} 
			else if(this.p.y + this.p.rangeY < this.p.initialY) {	
				this.p.y = this.p.initialY - this.p.rangeY;
				this.p.vy = -this.p.vy;
			}
		}
	});

	Q.scene('mainMenu',function(stage) {
	  var background = stage.insert(new Q.UI.Button({
	      asset: 'mainTitle.png',
	      x: Q.width/2,
	      y: Q.height/2
	  }));

	  var button = stage.insert(new Q.UI.Button({ x: Q.width/2, y: Q.height/2 + Q.height/4, fill: "#E76318", label: "PRES HERE TO PLAY", color: "#F7D6B5" }))
	  background.on("click",function() {
	    Q.clearStages();
	    Q.stageScene('level1');
	    Q.stageScene('hud', 3, Q('Player').first().p);
	  });
	});


	Q.loadTMX("level.tmx, mario_small.json, mario_small.png, goomba.json, goomba.png, bloopa.json, bloopa.png, princess.png, mainTitle.png, tiles.json, tiles.png, coin.png", function(){
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("bloopa.png","bloopa.json");


		Q.sheet("mario_small","mario_small.png", { tilew: 32, tileh: 32 });
		Q.sheet("goomba","goomba.png", { tilew: 32, tileh: 32 });
		Q.sheet("bloopa","bloopa.png", { tilew: 32, tileh: 32 });
		Q.sheet("princess","princess.png", { tilew: 32, tileh: 32 });
		Q.stageScene("mainMenu");

	});

	Q.scene("level1", function(stage) {
	  Q.stageTMX("level.tmx", stage);
	  Mario = stage.insert(new Q.Player());
	  stage.add("viewport").follow(Mario);
	  stage.viewport.offsetX = -Q.width*30/100;
  	  stage.viewport.offsetY = Q.height*33/100;

  	  stage.insert(new Q.Goomba({ x: 300, y: 380 }));
  	  
  	  //stage.insert(new Q.Bloopa({ x: 350, y: 525 }));
  	  stage.insert(new Q.Bloopa({ x: 370, y: 525 }));
  	  stage.insert(new Q.Bloopa({ x: 320, y: 525 }));
	
  	  stage.insert(new Q.Princess({ x: 80, y: 500 }));
	  //stage.centerOn(150, 380);
	 

	 });

	Q.scene('endGame',function(stage) {
	  var box = stage.insert(new Q.UI.Container({
	    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	  }));
	  
	  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
	                                           label: "Play Again" }))         
	  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
	                                        label: stage.options.label }));
	  button.on("click",function() {
	    Q.clearStages();
	    Q.stageScene('mainMenu');
	  });
	  box.fit(20);
	});

	
});