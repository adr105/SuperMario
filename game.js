// Adrián Camacho Pérez

window.addEventListener("load",function() {
    var Q = window.Q = Quintus() 
            .include("Sprites, Scenes, Input, Touch, UI, TMX, Anim, 2D")
            .setup({ width: 320, height: 473}) //a 480 se ve el mapa repetido por Y
            .controls().touch()

    Q.PLAYER = 1;
    Q.COIN = 2;
    Q.ENEMY = 4;

    /* Mario */
    Q.Sprite.extend("Player",{
        init: function(p){
      	    this._super(p, {
            sheet: "mario",
            sprite: "mario",
            jumpSpeed: -400,
            x: 150,
            y: 500,
            die: false,
            type: Q.PLAYER,
            collisionMask: Q.SPRITE_DEFAULT | Q.COIN,
            win: false
            
          });
        this.add('2d, platformerControls, animation'); 
        this.on("bump.top","bumpTop"); 
        this.on("enemy.hit","enemyHit");
        this.on("win","marioWin"); 
        },

        bumpTop: function(col) {
          if(col.obj.isA("TileLayer")) {
            if(col.tile == 24) { col.obj.setTile(col.tileX,col.tileY, 36); }
            else if(col.tile == 36) { col.obj.setTile(col.tileX,col.tileY, 24); }
          }
        },

        marioDies: function () {
        	Q.stageScene("endGame",1, { label: "You lose!!" }); 
          this.destroy();
        },

        marioWin: function(){
        	this.p.win = true;
        	Q.stageScene("endGame",1, { label: "You Win!!" });
        },

        marioDiesAnim: function(){
      	  this.p.collisionMask = Q.SPRITE_NONE; //atraviesa el suelo
          this.p.vy = 450;
          this.p.vx = 0;
        },

        marioWinsAnim: function(){
          this.p.collisionMask = Q.SPRITE_NONE; 
          this.play('jump_right');
          this.p.vx = 15;
          this.p.vy = -35; //avanza en diagonal a darle un beso
        },

        enemyHit: function() {
        	if(!this.p.win){
        		this.play("die");
          	this.p.die = true;
        	}
        },

        step: function(dt) {
          var stop = false;

          if(this.p.die || this.p.win)
          	stop = true;

          if(!stop) { 
            this.p.gravity = 1;

              if(this.p.vx < 0) {
                if(this.p.landed > 0){this.play("run_left");} 
                else {this.play("jump_left");}
                this.p.direction = "left";
              } 
              else if(this.p.vx > 0) {
                if(this.p.landed > 0) {this.play("run_right");} 
                else {this.play("jump_right");}
                this.p.direction = "right";
              } 
              else {
                this.play("stand_" + this.p.direction);
              }
                 
            
          }

          if(this.p.y > 700) {
            this.stage.unfollow(); 
          }

          if(this.p.y > 950) {
          	this.marioDies();
          }

          if(this.p.win){
            this.marioWinsAnim();
          }

          if(this.p.die){
          	this.marioDiesAnim();
          }
        }
      });


    /*Base enemy*/
    Q.component('defaultEnemy', {

        added: function() {
        this.entity.add("2d, aiBounce, animation");
    	  this.entity.on("bump.top",this,"die");
    	  this.entity.on("bump.left", this, "killPlayer");
    	  this.entity.on("bump.right", this, "killPlayer");
    	  this.entity.on("hit.sprite",this,"killPlayer");
        },

        die: function(col) {
         if(col.obj.isA("Player")) {
          this.entity.play('dead');
          this.entity.p.dead = true;
          col.obj.p.vy = -300;
          this.entity.p.deadTimer = 0;
         }
      	},

      	killPlayer: function(col){
      		if(col.obj.isA("Player") && !this.entity.p.dead) {
          		col.obj.trigger('enemy.hit');
        	}
        }
       
      });

    /*Goomba*/
    Q.Sprite.extend("Goomba",{
        init: function(p) {
          this._super(p, { sheet: 'goomba'});
          this.add('defaultEnemy');
          this.play('walk');
        },

        step: function(dt) {
          if(this.p.dead) {
            this.del('2d, aiBounce');
            this.p.deadTimer++;
            if (this.p.deadTimer > 20) {          
              this.destroy();
            }
            return;
          }
          var p = this.p;

          p.vx += p.ax * dt;
          p.vy += p.ay * dt;

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          this.play('walk');
        }

    });


    /*Bloopa*/
    Q.Sprite.extend("Bloopa",{
      init: function(p) {
        this._super(p, { sheet: 'bloopa', vy: -140, rangeY: 90,
          gravity: 0, jumpSpeed: -230});
        this.p.initialY = this.p.y;
        this.add('defaultEnemy');
        this.play('jump');

      },

      step: function(dt) {
        if(this.p.dead) {
          this.del('2d, aiBounce');
          this.p.deadTimer++;
          if (this.p.deadTimer > 6) { //menos tiempo porque si no puedes saltar 2 veces sobre el cadaver
            this.destroy();
          }
            return;
          }
          this.p.vx = 0;
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


    /*Meta barra-princesa*/
    Q.Sprite.extend("Goal", {
      init: function(p,defaults) {
    	    this._super(p,Q._defaults(defaults||{},{
    	      collisionMask: Q.SPRITE_ALL,
    	      win: false
    	    }));

    	    this.add("2d");
    	    this.on("bump.top",this,"MarioWins");
    	    this.on("bump.left","MarioWins");
    	    this.on("bump.right","MarioWins");
    	    this.on("bump.bottom","MarioWins");
      	},
      MarioWins: function(col){
    	if(col.obj.isA("Player") && !this.p.win) {
          col.obj.trigger('win');
          this.p.win = true;
          this.p.collisionMask = Q.SPRITE_NONE;
        }
      },
    });

    /*Collision floor*/
    Q.Sprite.extend("Tile", {
      init: function(p,defaults) {
    	    this._super(p,Q._defaults(defaults||{},{
    	      type: Q.SPRITE_ALL,
    	      collisionMask: Q.SPRITE_ALL
    	    }));

    	    this.add("2d");
      	}
    });


    /*Coins*/
    Q.Sprite.extend("Collectable", {
      init: function(p) {
        this._super(p,{
          sheet: p.sprite,
          type: Q.COIN,
          collisionMask: Q.PLAYER,
          vx: 0,
          vy: 0,
          gravity: 0,
          picked: false
        });
        this.add("animation");
    	  this.play("shiny");
      }
    });


    Q.scene('mainMenu',function(stage) {
      var background = stage.insert(new Q.UI.Button({
          asset: 'mainTitle.png',
          x: Q.width/2,
          y: Q.height/2
      }));
      
      var button = stage.insert(new Q.UI.Button({ x: Q.width/2, y: Q.height/2 + Q.height/4, fill: "#E76318", label: "PLAY", color: "#F7D6B5" }))
      background.on("click",function() {
        Q.clearStages();
        Q.stageScene('level1');
      });
    });


    Q.loadTMX("level.tmx, mario_small.json, mario_small.png, goomba.json, goomba.png, bloopa.json, bloopa.png, princess.png, mainTitle.png, tiles.json, tiles.png, coin.json, coin.png", function() {
        Q.compileSheets("mario_small.png","mario_small.json");
        Q.compileSheets("goomba.png","goomba.json");
        Q.compileSheets("bloopa.png","bloopa.json");
        Q.compileSheets("tiles.png","tiles.json");
        Q.compileSheets("coin.png","coin.json");

        /* no animations
        Q.sheet("mario_small","mario_small.png", { tilew: 32, tileh: 32 });
        Q.sheet("goomba","goomba.png", { tilew: 32, tileh: 32 });
        Q.sheet("bloopa","bloopa.png", { tilew: 32, tileh: 32 });
        Q.sheet("princess","princess.png", { tilew: 32, tileh: 32 });
        */

        Q.animations("mario", {
          run_right: { frames: [1,2], rate: 1/5, flip: false, loop: true },
          run_left: { frames:  [1,2], rate: 1/5, flip: "x", loop: true },
          stand_right: { frames:[0], rate: 1/5, flip: false },
          stand_left: { frames: [0], rate: 1/5, flip: "x" }, 
          jump_right: { frames: [4], rate: 1/5, flip: false },
          jump_left: { frames:  [4], rate: 1/5, flip: "x" },
          die: { frames:  [12], rate: 1/5, flip: false, loop: true }
          });

        Q.animations("coin", {
          shiny: { frames: [0,1,2], rate: 1/6, flip: 'x', loop: true }
          });


        var EnemyAnimations = {
            walk: { frames: [0,1], rate: 1/3, loop: true },
            dead: { frames: [2], rate: 1/10 }
        };

        Q.animations("goomba", EnemyAnimations);
        Q.animations("bloopa", {
          jump: { frames: [0,1], rate: 1/2, loop: true },
          dead: { frames: [2], rate: 1/8 }
        });


        Q.stageScene("mainMenu");


    });

    Q.scene("level1",function(stage) {
      Q.stageTMX("level.tmx",stage);
      Mario = stage.insert(new Q.Player());
      stage.add("viewport").follow(Mario);
      stage.viewport.offsetX = -Q.width*30/100;
      stage.viewport.offsetY = Q.height*33/100;
      
      //stage.insert(new Q.Goomba({ x: 300, y: 380 }));
      //stage.insert(new Q.Bloopa({ x: 350, y: 525 }));
      //stage.insert(new Q.Bloopa({ x: 370, y: 525 }));
      //stage.insert(new Q.Bloopa({ x: 320, y: 525 }));
  
     // stage.insert(new Q.Princess({ x: 80, y: 500 }));
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
