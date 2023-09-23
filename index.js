const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')  // c for Context

canvas.width = 1280 //innerWidth
canvas.height = 720 //innerHeight

c.font = "bold 60px Ariel"
c.fillStyle = "#FFFFFF"
c.fillText("loading 很久\n請稍等...",550,350)


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
	// {name: "bgnd"  , url: "https://i.imgur.com/9yez9IX.png"},
	{name: "player", url: "https://i.imgur.com/nRwyHP7.png"},
	{name: "patk"  , url: "https://i.imgur.com/MaIVNyY.png"},
	{name: "phit"  , url: "https://i.imgur.com/5y5dNOq.png"},
	{name: "enemy" , url: "https://i.imgur.com/KWBFk22.png"},
	{name: "eprep" , url: "https://i.imgur.com/v4m1YWo.png"},
	{name: "eatk"  , url: "https://i.imgur.com/gLBrsbb.png"},
    {name: "ehit"  , url: "https://i.imgur.com/QVbsRLy.png"},
    {name: "edodge", url: "https://i.imgur.com/9O0aRui.png"},
    {name: "Rengoku1", url: "https://i.imgur.com/bO2jPd5.png"},
    {name: "Rengoku2", url: "https://i.imgur.com/UAqZdKO.png"},
    {name: "Rengoku3", url: "https://i.imgur.com/jM2sNDl.png"},
    {name: "Rengoku4", url: "https://i.imgur.com/akpZ3Bl.png"},
    {name: "", url: ""}
])

var rengoku = [images.get("Rengoku1"), images.get("Rengoku2"), images.get("Rengoku3"), images.get("Rengoku4")]

// Define your audio file URLs
const audioUrls = [
	'https://od.lk/s/MTlfNTAwOTUyNTNf/Miss_exported.ogg',
	'https://od.lk/s/MTlfNTAwODc3MjZf/Blow5.ogg',
	'https://od.lk/s/MTlfNTAwOTQyNjFf/Rengoku.ogg',
	'https://od.lk/s/MTlfNTAwOTQyNTVf/Rengoku_hit.ogg'
];

// Initialize a variable to keep track of loaded audio files
let loadedAudioCount = 0;



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
			this.color = '#FF4444'
		}
		else if (type=='def') {
			this.color = '#44FF44'
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


let tnow=0
let t1
let difficulty=25 //50
let t2
let mouseX
let dist
let canAttack = true
let canDefend = false
let isAttacking = false
let isDefending = false
let dodgeAnim = -999
let dodgeFollow = false
let pause = false
const tmax = new Timer(100,50,200,50,'#FFFFFF')
const tcur = new Timer(100,50,200,50,'#9146FF') // Twitch's color
const atk = new Button(1000,600,100,'atk')
const def = new Button(100,600,100,'def')
let a_miss
let a_slap
let a_Rengoku
let a_Ren_hit

function init() {
	tnow=0
	difficulty=25 //50
	canAttack = true
	canDefend = false
	isAttacking = false
	isDefending = false
	dodgeAnim = -999
	dodgeFollow = false
	pause = false
}


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
		c.drawImage(images.get("player"),605+100*Math.sin(Math.PI*dodgeAnim**2/10000.),400)
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
		c.fillStyle = "#FFFFFF"
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
		isDefending = false
		canAttack = true
		a_Ren_hit.play()
		c.drawImage(images.get("phit"),605,400)
		c.drawImage(images.get("eatk"),100,100)
		atk.draw()
		c.font = "bold 36px Ariel"
		c.fillStyle = "#000000"
		c.fillText("攻擊",1015,665)
	}
	else if (isDefending && tcur.width<=t1){
		a_Rengoku.play()
		c.drawImage(rengoku[Math.floor(0.2*tcur.width)%4],100,100)
		c.drawImage(images.get("eprep"),100,100)
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
			c.fillStyle = "#FFFFFF"
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
	if ( mousePos.x - prev_X > 120 && dodgeAnim == -999) {  // fast enough and not currently dodging
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
		c.clearRect(200,640,400,20)   // for the arrow
		c.clearRect(690,390,310,210)
		c.clearRect(1100,400,100,400)
		c.clearRect(100,100,480,270)
		c.drawImage(images.get("player"),605,400)
		c.drawImage(images.get("enemy"),100,100)
		c.beginPath()
		canvas_arrow(c, 1000, 600, 420, 310)
		c.strokeStyle = "#00FFFF"
		c.lineWidth = 5.
		c.stroke()
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
			c.beginPath()
			canvas_arrow(c, 220, 650, 550, 650)
			c.strokeStyle = "#00FFFF"
			c.lineWidth = 5.
			c.stroke()
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


/// Finally, start (once all audios are loaded)

window.onload = (event) => {
	// Function to run when all audio files are loaded
	function onAllAudioLoaded() {
	    // Your code to run after all audio files are loaded
	    a_miss = new Audio('https://od.lk/s/MTlfNTAwOTUyNTNf/Miss_exported.ogg')
		a_slap = new Audio('https://od.lk/s/MTlfNTAwODc3MjZf/Blow5.ogg')
		a_Rengoku = new Audio('https://od.lk/s/MTlfNTAwOTQyNjFf/Rengoku.ogg')
		a_Ren_hit = new Audio('https://od.lk/s/MTlfNTAwOTQyNTVf/Rengoku_hit.ogg')
		a_miss.volume = 0.7
		a_slap.volume = 0.65
		a_Rengoku.volume = 0.35
		a_Ren_hit.volume = 0.3
	    init()
		c.clearRect(550,250,600,150) // for the loading... text
		tmax.draw()
		tcur.draw()
		c.drawImage(images.get("enemy"),100,100)
		c.drawImage(images.get("player"),605,400)
		atk.draw()
		c.font = "bold 36px Ariel"
		c.fillStyle = "#000000"
		c.fillText("攻擊",1015,665)
	}

	// Function to load an audio file and increment the counter
	function loadAudio(url) {
	    const audio = new Audio(url);
	    audio.addEventListener('canplaythrough', () => {
	        loadedAudioCount++;
	        if (loadedAudioCount === audioUrls.length) {
	            // All audio files are loaded
	            onAllAudioLoaded();
	        }
	    });
	    audio.load(); // Start loading the audio file
	}

	// Load all audio files
	audioUrls.forEach((url) => {
	    loadAudio(url);
	});
}
