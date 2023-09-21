const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')  // c for Context

canvas.width = 1280 //innerWidth
canvas.height = 720 //innerHeight

/// load resources

function ImageCollection(list, callback){
    var total = 0, images = {};   //private :)
    for(var i = 0; i < list.length; i++){
        var img = new Image();
        images[list[i].name] = img;
        img.onload = function(){
            total++;
            if(total == list.length){
                callback && callback();
            }
        };
        img.src = list[i].url;
    }
    this.get = function(name){
        return images[name] || (function(){throw "Not exist"})();
    };
}

//Create an ImageCollection to load and store my images
var images = new ImageCollection([
	{name: "player", url: "https://i.imgur.com/nRwyHP7.png"},
	{name: "patk"  , url: "https://i.imgur.com/MaIVNyY.png"},
	{name: "enemy" , url: "https://i.imgur.com/KWBFk22.png"},
	{name: "eprep" , url: "https://i.imgur.com/CzK99KJ.png"},
	{name: "eatk"  , url: "https://i.imgur.com/lmyvAL7.png"},
    {name: "ehit"  , url: "https://i.imgur.com/QVbsRLy.png"},
    {name: "edodge", url: "https://i.imgur.com/9O0aRui.png"},
    {name: "Rengoku1", url: "https://i.imgur.com/bO2jPd5.png"},
    {name: "Rengoku2", url: "https://i.imgur.com/UAqZdKO.png"},
    {name: "Rengoku3", url: "https://i.imgur.com/jM2sNDl.png"},
    {name: "Rengoku4", url: "https://i.imgur.com/akpZ3Bl.png"},
    {name: "", url: ""}
]);

var rengoku = [images.get("Rengoku1"), images.get("Rengoku2"), images.get("Rengoku3"), images.get("Rengoku4")]

var a_miss = new Audio('https://od.lk/s/MTlfNTAwODc2NTVf/Miss.ogg')
var a_slap = new Audio('https://od.lk/s/MTlfNTAwODc3MjZf/Blow5.ogg')

window.onload = function() {
    if(!window.location.hash) {
        window.location = window.location + '#loaded';
        window.location.reload();
    }
}


/// definitions

class Timer {
	constructor(x,y,width,height,color) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.color = color
	}
	draw() {
		c.beginPath()
		c.rect(this.x,this.y,this.width,this.height)
		c.fillStyle = this.color
		c.fill()
	}
	update() {
		this.draw()
		if (this.width>0) {
			this.width -= 1
		}
	}
}

class Enemy {
	constructor(x,y,radius,color) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
	}
	draw() {
		c.beginPath()
		c.arc(this.x,this.y,this.radius,
			  0, 2*Math.PI, false)
		c.fillStyle = this.color
		c.fill()
	}
}

class Button {
	constructor(x,y,size,type) {
		this.x = x
		this.y = y
		this.width = size
		this.height = size
		if (type=='atk') {
			this.color = 'red'
		}
		else if (type=='def') {
			this.color = 'green'
		}
	}
	draw() {
		c.beginPath()
		c.rect(this.x,this.y,this.width,this.height)
		c.fillStyle = this.color
		c.fill()
	}
}

function canvas_arrow(context, fromx, fromy, tox, toy) {
  var headlen = 10; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

// Function to get the mouse position
function getMousePos(canvas, event) {
	var rect = canvas.getBoundingClientRect()
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top,
	}
}
// Function to check whether a point is inside a rectangle
function isInside(pos, rect) {
	return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
}

const tmax = new Timer(100,50,200,50,'blue')
tmax.draw()
const tcur = new Timer(100,50,200,50,'green')
tcur.draw()
c.drawImage(images.get("enemy"),100,100)
// const eprep = new Enemy(300,200,100,'green')
// const eatk  = new Enemy(300,200,100,'blue')
c.drawImage(images.get("player"),605,400)
const atk = new Button(1000,600,100,'atk')
atk.draw()
c.font = "bold 36px Ariel"
c.fillStyle = "#000000"
c.fillText("攻擊",1015,665)
const def = new Button(100,600,100,'def')
// def.draw()


var tnow=0
var t1
var difficulty=25 //50
var t2
var mouseX
var dist
var canAttack = true
var canDefend = false
var isAttacking = false
var isDefending = false
var dodgeAnim = -999
var dodgeFollow = false
var pause = false



/// logic and execution

function animate() {
	if (pause) return
	requestAnimationFrame(animate)
	if (dodgeFollow) {
		if (dodgeAnim>0) {
			c.clearRect(605,400,595,400)
			c.drawImage(images.get("player"),605+100*Math.sin(Math.PI*dodgeAnim/100.),400)
			dodgeAnim -= 2.5
			if (dodgeAnim<=0) {
				dodgeAnim = -999
				isDefending = false
				canAttack = true
				atk.draw()
				c.font = "bold 36px Ariel"
				c.fillStyle = "#000000"
				c.fillText("攻擊",1015,665)
				dodgeFollow = false
				pause = true
			}
			return
		}
		else return
	}
	c.clearRect(100,50,200,50)
	tmax.draw()
	tcur.draw()
	tcur.update()
	tnow+=1
	if (dodgeAnim>0) {
		c.clearRect(605,400,595,400)
		c.drawImage(images.get("player"),605+100*Math.sin(Math.PI*dodgeAnim/100.),400)
		dodgeAnim -= 2
		if (dodgeAnim<=0) {
			dodgeAnim = -999
			c.drawImage(images.get("player"),605,400)
			c.clearRect(1100,400,100,400)
			if (canAttack) atk.draw()
		}
	}
	if (isAttacking && tcur.width<=1) {
		console.log(tnow)
		window.removeEventListener('mousemove',attacking)
		pause=true
		isAttacking = false
		canDefend=true
		a_miss.play()
		c.drawImage(images.get("edodge"),100,100)
		c.font = "bold 72px Ariel"
		c.fillStyle = "#000000"
		c.fillText("沒打中",550,350)
		def.draw()
		c.font = "bold 36px Ariel"
		c.fillStyle = "#000000"
		c.fillText("閃避",115,665)
	}
	else if (isDefending && tcur.width<=t2){
		window.removeEventListener('mousemove',defending)
		pause=true
		// c.clearRect(690,390,310,210)
		// c.clearRect(1100,400,100,400)
		// c.drawImage(images.get("player"),605,400)
		c.font = "bold 72px Ariel"
		c.fillStyle = "#FF0000"
		c.fillText("碰！",750,550)
		isDefending = false
		canAttack = true
		c.drawImage(images.get("eatk"),100,100)
		atk.draw()
		c.font = "bold 36px Ariel"
		c.fillStyle = "#000000"
		c.fillText("攻擊",1015,665)
	}
	else if (isDefending && tcur.width<=t1){
		c.drawImage(images.get("eprep"),100,100)
		c.font = "bold 72px Ariel"
		c.fillStyle = "#000000"
		c.fillText("煉獄...",750,550)
	}
	else if (isDefending) {
		c.drawImage(rengoku[Math.floor(0.2*tcur.width)%4],100,100)
	}
}

function attacking(event) {
	var mousePos = getMousePos(canvas, event)
	var prev_dist = dist
	dist = Math.sqrt( (mousePos.x-300)**2 + (mousePos.y-200)**2 )
	if (dist>prev_dist && prev_dist<600) {  // bingo
		console.log(tnow - prev_tnow)
		console.log(prev_dist)
		window.removeEventListener('mousemove',attacking)
		pause=true
		isAttacking=false
		canDefend=true
		if (prev_dist<=150){
			a_slap.play()
			c.drawImage(images.get("ehit"),100,100)
			c.drawImage(images.get("patk"),605,400)
		}
		else{
			a_miss.play()
			c.drawImage(images.get("edodge"),100,100)
			c.font = "bold 72px Ariel"
			c.fillStyle = "#000000"
			c.fillText("沒打中",550,350)
		}
		def.draw()
		c.font = "bold 36px Ariel"
		c.fillStyle = "#000000"
		c.fillText("閃避",115,665)
	}
}

function defending(event) {
	var mousePos = getMousePos(canvas, event)
	var prev_X = mouseX
	mouseX = mousePos.x
	// console.log(mousePos.x - prev_X)
	if ( mousePos.x - prev_X > 150.4087 && dodgeAnim == -999) {  // fast enough and not currently dodging
		dodgeAnim = 100
		// console.log(tnow - prev_tnow)
		if (tcur.width<=t1){
			window.removeEventListener('mousemove',defending)
			a_miss.play()
			c.drawImage(images.get("eatk"),100,100)
			pause = true
			dodgeFollow = true
			dodgeAnim = 100
			pause = false
			animate()
		}
	}
}

window.addEventListener('click', (click) => {
	var mousePos = getMousePos(canvas, click)
	if (isInside(mousePos, atk)) {
		if (canAttack==false) return
		canAttack = false
		tcur.width = 200
		// enemy.draw()
		// c.clearRect(1000,600,100,100)
		c.clearRect(1100,400,100,400)
		c.clearRect(700,350,200,200)
		c.clearRect(290,640,520,20)
		c.clearRect(690,390,310,210)
		c.drawImage(images.get("player"),605,400)
		c.drawImage(images.get("enemy"),100,100)
		c.beginPath();
		canvas_arrow(c, 1000, 600, 420, 310);
		c.stroke();
		isAttacking = true
		pause=false
		animate()
		dist = Math.sqrt( (mousePos.x-300)**2 + (mousePos.y-200)**2 )
		prev_tnow = tnow
		window.addEventListener('mousemove', attacking)
	} else {
		if (isInside(mousePos, def)) {
			if (canDefend==false) return
			canDefend = false
			tcur.width = 200
			c.clearRect(100,600,100,100)
			c.clearRect(400,280,600,320)
			c.drawImage(images.get("player"),605,400)
			c.drawImage(images.get("enemy"),100,100)
			c.beginPath();
			canvas_arrow(c, 300, 650, 800, 650);
			c.stroke();
			isDefending = true
			pause=false
			animate()
			mouseX = mousePos.x
			prev_tnow = tnow
			t1 = 180 - Math.random()*110
			t2 = t1 - difficulty
			window.addEventListener('mousemove', defending)
		}
	}
})

