function Ghost(startX, startY, col, b){
	var color = col;
	var posX = startX;
	var posY = startY;
	var vX = -1; //initial ghost direction is left
	var vY=0;
	var board = b;
	var pacMan = board.getPacMan();
	var homeX = -1;
	var homeY = -1;
	var graveYardX = 0;
	var graveYardY = 0;

	var chase=false;
	var frightened=false;

	var targetX;
	var targetY;


	this.scatter = function(){
		chase = false;
		vX = -vX;
		vY = -vY;
	}
	this.chase = function(){
		chase = true;
		vX = -vX;
		vY = -vY;
	}

	this.frighten = function(){
		frightened=true;
	}
	this.unfrighten = function(){
		frightened=false;
	}

	this.setHome=function(x,y){
		homeX = x;
		homeY = y;
	}

	this.getHomeX = function(){
		return homeX;
	}

	this.getHomeY=function(){
		return homeY;
	}

	this.setTarget = function(x,y){//taregeting callback
		targetX = x;
		targetY = y;
	}

	this.getTargets=function(){}//the targeting function for the child to override

	this.getX=function(){
		return posX;
	}

	this.getY=function(){
		return posY;
	}

	this.setPos = function(x,y){
		posX = x;
		posY = y;
	}
	this.getColor=function(){
		return color;
	}

	this.update=function(){

		//update target cell
		
		if(frightened){
			//randomly choose a square that is not backwards
			var choices = new Array();
			for(var i = -1; i<2; i++){
				//check left right
				if(board.canWalk(posX+i, posY) && vX!=-i && i!=0){
					if(i==-1){
						choices.push(function(){
							vX = -1;
							vY = 0;
						});
					}
					if(i==1){
						choices.push(function(){
							vX = 1;
							vY = 0;
						});
					}
				}
			}
			for(var i = -1; i<2; i++){
				//check up down
				if(board.canWalk(posX, posY+i) && vY!=-i && i!=0){
					if(i==-1){
						choices.push(function(){
							vX = 0;
							vY = -1;
						});
					}
					if(i==1){
						choices.push(function(){
							vX = 0;
							vY = 1;
						});
					}
				}
			}
			if(choices.length>0){
				choices[Math.floor(Math.random()*choices.length)]();
			}
		}else{ 

			if(!chase){
				targetX = homeX;
				targetY = homeY;
			}else{
				this.getTargets(board);
			}
			//set next direction
			//check all four directions
			//cannot move backwards ie next v != -v
			var bestVX = 0;
			var bestVY = 0;
			var bestD = 99999;

			
			for(var i = -1; i < 2; i++){//check left and right
				if(i!= -vX && i!=0 && board.canWalk(posX+i, posY)){
					var thisD = Math.sqrt( Math.pow(targetX - (posX+i),2) + Math.pow((targetY - posY),2));

					if(thisD<bestD) {
						bestD = thisD;
						bestVX = i;
						bestVY = 0;
					}
				}
			}

			for(var i = -1; i < 2; i++){//check up and down
				if(i!= -vY && i!=0 &&board.canWalk(posX, posY+i)){
					var thisD = Math.sqrt( Math.pow((targetX - posX),2) + Math.pow(targetY - (posY +i),2));
					if(thisD<bestD) {
						bestD = thisD;
						bestVX = 0;
						bestVY = i;
					}
				}
			}
			

			if(bestVX!=0){
				vX=bestVX;
				vY=0;
			}
			if(bestVY!=0){
				vX=0;
				vY=bestVY;
			}

		}
		//vX=bestVX;
		//vY=bestVY;
		
		//update pos
		if(board.canWalk(posX+vX, posY+vY)){
			posX+=vX;
			posY+=vY;
		}
	}

	//ghosts can turn left or right but not reverse without a special call.
	//TODO: implement special cell that a ghost may not turn into but may pass over normally

}

function Blinky(startX, startY, b){
	var ghosty = new Ghost(startX, startY, '#FF0000', b);
	ghosty.getTargets=function(board){
		//alert('pinky targeting');
		var pac = board.getPacMan();
		this.setTarget(pac.getX(),pac.getY());
		//alert('hi');
	}
	ghosty.setHome(b.getWidth(), -2);
	return ghosty;
}

function Pinky(startX, startY, b){
	var ghosty = new Ghost(startX, startY, '#FF0080', b);
	ghosty.getTargets=function(board){
		//alert('pinky targeting');
		var pac = board.getPacMan();
		this.setTarget(pac.getX()+(4*pac.getVX()),pac.getY()+(4*pac.getVY()));
		//alert('hi');
	}
	ghosty.setHome(1, -2);
	return ghosty;
}

function Inky(startX, startY, b){
	var ghosty = new Ghost(startX, startY, '#00FFFF', b);
	ghosty.getTargets=function(board){
		//alert('pinky targeting');
		var pac = board.getPacMan();
		var blink = board.getBlinky();
		var t1x = pac.getX()+(2*pac.getVX());
		var t1y = pac.getY()+(2*pac.getVY());

		var blinkyTot1x = t1x-blink.getX();
		var blinkyTot1y = t1y-blink.getY();

		var tx = blink.getX() + blinkyTot1x;
		var ty = blink.getY() + blinkyTot1y;

		this.setTarget(tx,ty);
		//alert('hi');
	}
	ghosty.setHome(b.getWidth(), b.getHeight()+1);
	return ghosty;
}

function Clyde(startX, startY, b){
	var ghosty = new Ghost(startX, startY, '#FA6800', b);
	ghosty.getTargets=function(board){
		//alert('pinky targeting');
		var pac = board.getPacMan();
		var distToPacman =Math.sqrt(Math.pow((pac.getX() - this.getX()),2) + Math.pow((pac.getY() - this.getY()),2) );
		if(Math.ceil(distToPacman)>8){
			this.setTarget(pac.getX(),pac.getY());
			//$('#clydeLog').text('target set to x: ' + pac.getX() + " y: " + pac.getY() + " distance: " + distToPacman);
		}else{
			this.setTarget(this.getHomeX(), this.getHomeY());
			//$('#clydeLog').text('target set to x: ' + this.getHomeX() + " y: " + this.getHomeY() + " distance: " + distToPacman);
		}
		//this.setTarget(pac.getX()+(4*pac.getVX()),pac.getY()+(4*pac.getVY()));
		//alert('hi');
	}
	ghosty.setHome(0, b.getHeight()+1);
	return ghosty;
}




