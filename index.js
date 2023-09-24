won.style.display = "none"
lost.style.display = "none"

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')  // c for Context

canvas.width = 1280 //innerWidth
canvas.height = 720 //innerHeight

c.font = "bold 60px Ariel"
c.fillStyle = "#FFFFFF"
c.fillText("Loading...",800,350)


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
	{name: "NL"    , url: "https://i.imgur.com/KpDchBr.png"},
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
	'https://dl.dropbox.com/scl/fi/na0qiyslf8nk8x716xj56/Miss_exported.ogg?rlkey=0m66l1zwt3bv6kfy0tb0xm6g3',
	'https://dl.dropbox.com/scl/fi/4hmi45i9npv5ifllq0nta/Blow5.ogg?rlkey=uvzy7mr48nxxjwn3qvrevdlpu',
	'https://dl.dropbox.com/scl/fi/ienfa83ie5jht30a2d789/Rengoku.ogg?rlkey=7smz1zhwbixv8e8fmjg563zoq',
	'https://dl.dropbox.com/scl/fi/q12mtz5oksrn6ra9qwf3i/Rengoku_hit.ogg?rlkey=kkms05nerqwugh0d71x18vmec'
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

function eHPdecrease(damage) {
	eHP_prev = eHP
	eHP -= damage
	eHPanim = eHP_prev - eHP
	if (eHP<=0) won.style.display = "initial"
	pause=false
	animate()
}

function pHPdecrease(damage) {
	pHP_prev = pHP
	pHP -= damage
	pHPanim = pHP_prev - pHP
	if (pHP<=0) lost.style.display = "initial"
	pause=false
	animate()
}


const wonButton = document.getElementById("wonButton")
wonButton.addEventListener("click", function () {
	won.style.display = "none"
	canDefend = false
	c.clearRect(100,600,100,100)
	c.clearRect(400,280,500,320) // for the diagonal arrow
	c.drawImage(images.get("player"),605,400)
	c.drawImage(images.get("enemy"),100,100)
	c.drawImage(images.get("NL"),0,0,420,42,100,380,420,42)
	c.drawImage(images.get("NL"),294,0,126,42,980,350,126,42)
	init()
	tmax.draw()
	tcur.draw()
	atk.draw()
	c.font = "bold 36px Ariel"
	c.fillStyle = "#000000"
	c.fillText("攻擊",1015,665)
})

const lostButton = document.getElementById("lostButton")
lostButton.addEventListener("click", function () {
	lost.style.display = "none"
	init()
	c.clearRect(200,640,400,20)   // for the arrow
	// c.clearRect(690,390,310,210)
	c.clearRect(1100,400,100,400)
	c.clearRect(100,100,480,270)
	c.drawImage(images.get("player"),605,400)
	c.drawImage(images.get("enemy"),100,100)
	c.drawImage(images.get("NL"),0,0,420,42,100,380,420,42)
	c.drawImage(images.get("NL"),294,0,126,42,980,350,126,42)
	tmax.draw()
	tcur.draw()
	atk.draw()
	c.font = "bold 36px Ariel"
	c.fillStyle = "#000000"
	c.fillText("攻擊",1015,665)
})

const startButton = document.getElementById("startButton")
startButton.addEventListener("click", function () {
	welcome.style.display = "none"
})

let difficulty=20 //50
let t1
let t2
let tnow = 0
let prev_tnow = 0
let dist
let eHPdamage = 999
let recordSpeed = true
let recordDamage = true
let prev_x
let prev_y
let pHP = 300
let eHP = 1000
let pHP_prev = 300
let eHP_prev = 1000
let canAttack = true
let canDefend = false
let isAttacking = false
let isDefending = false
let pHPanim = -999
let eHPanim = -999
let dodgeAnim = -999
let dodgeFollow = false
let pause = true
const tmax = new Timer(100,50,200,50,'#FFFFFF')
const tcur = new Timer(100,50,200,50,'#9146FF') // Twitch's color
const atk = new Button(1000,600,100,'atk')
const def = new Button(100,600,100,'def')
let a_miss
let a_slap
let a_Rengoku
let a_Ren_hit

function init() {
	difficulty=20 //50
	tnow = 0
	prev_tnow = 0
	eHPdamage = 999
	pHP = 300
	eHP = 1000
	pHP_prev = 300
	eHP_prev = 1000
	canAttack = true
	canDefend = false
	isAttacking = false
	isDefending = false
	pHPanim = -999
	eHPanim = -999
	dodgeAnim = -999
	dodgeFollow = false
	pause = true
	tcur.width = 200
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
	if (eHPanim>0) {
		c.clearRect(100,380,420,42)
		c.globalAlpha = 0.25
		c.drawImage(images.get("NL"),0,0,420./1000.*(eHP+eHPanim),42,100,380,420./1000.*(eHP+eHPanim),42)
		c.globalAlpha = 1.0
		c.drawImage(images.get("NL"),0,0,420./1000.*eHP,42,100,380,420./1000.*eHP,42)
		eHPanim -= 3.50001*Math.sqrt((eHP_prev - eHP)/100.)
		if (eHPanim<=0) {
			pause=true
			canDefend=true
		}
		return
	}
	else if (pHPanim>0) {
		// c.drawImage(images.get("NL"),294,0,126,42,980,350,126,42)
		c.clearRect(980,350,126,42)
		c.globalAlpha = 0.25
		c.drawImage(images.get("NL"),420-126./300.*(pHP+pHPanim),0,420-126./300.*(pHP+pHPanim),42,980+126-126./300.*(pHP+pHPanim),350,420-126./300.*(pHP+pHPanim),42)
		c.globalAlpha = 1.0
		c.drawImage(images.get("NL"),420-126./300.*pHP,0,420-126./300.*pHP,42,980+126-126./300.*pHP,350,420-126./300.*pHP,42)
		// c.drawImage(images.get("NL"),0,0,420./1000.*eHP,42,100,380,420./1000.*eHP,42)
		pHPanim -= 5.00001
		if (pHPanim<=0) {
			pause=true
			canAttack=true
		}
		return
	}
	c.clearRect(100,50,200,50)
	tmax.draw()
	tcur.draw()
	tcur.update()
	tnow += 1
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
		window.removeEventListener('mousemove',attacking)
		pause=true
		isAttacking = false
		canDefend=true
		a_miss.play()
		c.drawImage(images.get("edodge"),100,100)
		c.font = "bold 72px Ariel"
		c.fillStyle = "#FFFFFF"
		c.fillText("太久囉",550,350)
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
		pHPdecrease(100)
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
	// c.beginPath()
	// c.arc(mousePos.x,mousePos.y,10, 0, 2*Math.PI, false)
	// c.fillStyle = '#00FF00'
	// c.fill()
	if (prev_dist<600) {
		if (recordSpeed) {
			recordSpeed=false
			prev_tnow = tnow
		}
		if (recordDamage && mousePos.x<=300) {
			recordDamage=false
			var A = (mousePos.y-prev_y) / (mousePos.x-prev_x) // trying to find closest distance
			var B = -1 // between target (300,200) and line, assuming line equation is
			var C = prev_y - (mousePos.y-prev_y) / (mousePos.x-prev_x) * prev_x // Ax + By + C = 0
			eHPdamage = Math.abs(A*300 + B*200 + C) / Math.sqrt(A**2+B**2)
		}
		if (dist>prev_dist) {  // bingo
			window.removeEventListener('mousemove',attacking)
			pause=true
			isAttacking=false
			if (prev_dist>300 || eHPdamage>200){
				console.log(dist, prev_dist, tnow-prev_tnow, Math.sqrt( (mousePos.x-prev_x)**2 + (mousePos.y-prev_y)**2 ), eHPdamage, 100+200./15.*(20- Math.min(Math.max(5,eHPdamage),20) ))
				canDefend=true
				a_miss.play()
				c.drawImage(images.get("edodge"),100,100)
				c.font = "bold 72px Ariel"
				c.fillStyle = "#FFFFFF"
				c.fillText("打歪了",550,350)
			}
			else if (Math.sqrt( (mousePos.x-prev_x)**2 + (mousePos.y-prev_y)**2 )<138 || tnow-prev_tnow>13) {
				console.log(dist, prev_dist, tnow-prev_tnow, Math.sqrt( (mousePos.x-prev_x)**2 + (mousePos.y-prev_y)**2 ), eHPdamage, 100+200./15.*(20- Math.min(Math.max(5,eHPdamage),20) ))
				canDefend=true
				a_miss.play()
				c.drawImage(images.get("edodge"),100,100)
				c.font = "bold 72px Ariel"
				c.fillStyle = "#FFFFFF"
				c.fillText("太慢了",550,350)
			}
			else {
				a_slap.play()
				c.drawImage(images.get("ehit"),100,100)
				c.drawImage(images.get("patk"),605,400)
				if (eHPdamage<20) {
					c.font = "bold 72px Ariel"
					c.fillStyle = "#FF9900"
					c.fillText("命中要害！",550,350)
				}
				eHPdecrease( 100+200./15.*(20- Math.min(Math.max(5,eHPdamage),20) ) ) // bonus damage to 5<eHPdamage<20
			}
			def.draw()
			c.font = "bold 36px Ariel"
			c.fillStyle = "#000000"
			c.fillText("閃避",115,665)
		}
	}
	prev_x = mousePos.x
	prev_y = mousePos.y
}

function defending(event) {
	var mousePos = getMousePos(canvas, event)
	if ( mousePos.x - prev_x > 120 && dodgeAnim == -999) {  // fast enough and not currently dodging
		dodgeAnim = 100
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
	prev_x = mousePos.x
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
		// c.clearRect(690,390,310,210)
		c.clearRect(1100,400,100,400)
		c.clearRect(100,100,480,270)
		c.drawImage(images.get("player"),605,400)
		c.drawImage(images.get("enemy"),100,100)
		c.fillStyle = "black"
		c.fillRect(250,198,100,4)
		c.fillRect(298,150,4,100)
		c.beginPath()
		c.arc(300,200,40, 0, 2*Math.PI, false)
		c.strokeStyle = 'black'
		c.lineWidth = 3
		c.stroke()
		c.beginPath()
		c.arc(300,200,6, 0, 2*Math.PI, false)
		c.fillStyle = 'red'
		c.fill()
		c.beginPath()
		canvas_arrow(c, 900, 550, 420, 310)
		c.strokeStyle = "#00FFFF"
		c.lineWidth = 5.
		c.stroke()
		isAttacking = true
		pause=false
		animate()
		dist = Math.sqrt( (mousePos.x-300)**2 + (mousePos.y-200)**2 )
		eHPdamage = 999
		recordSpeed = true
		recordDamage = true
		prev_x = mousePos.x
		prev_y = mousePos.y
		window.addEventListener('mousemove', attacking)
	} else {
		if (isInside(mousePos, def)) {
			if (canDefend==false) return
			canDefend = false
			tcur.width = 200
			c.clearRect(100,600,100,100)
			c.clearRect(400,280,500,320) // for the diagonal arrow
			c.drawImage(images.get("NL"),0,0,420./1000.*eHP,42,100,380,420./1000.*eHP,42)
			c.drawImage(images.get("player"),605,400)
			c.drawImage(images.get("enemy"),100,100)
			c.beginPath()
			canvas_arrow(c, 220, 650, 550, 650)
			c.strokeStyle = "#00FFFF"
			c.lineWidth = 5.
			c.stroke()
			isDefending = true
			t1 = 180 - Math.random()*110
			t2 = t1 - difficulty
			prev_x = mousePos.x
			pause=false
			animate()
			window.addEventListener('mousemove', defending)
		}
	}
})


/// Finally, start (once all audios are loaded)

window.onload = (event) => {

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

	// Function to run when all audio files are loaded
	function onAllAudioLoaded() {
	    // Your code to run after all audio files are loaded
	    a_miss = new Audio('https://dl.dropbox.com/scl/fi/na0qiyslf8nk8x716xj56/Miss_exported.ogg?rlkey=0m66l1zwt3bv6kfy0tb0xm6g3')
		a_slap = new Audio('https://dl.dropbox.com/scl/fi/4hmi45i9npv5ifllq0nta/Blow5.ogg?rlkey=uvzy7mr48nxxjwn3qvrevdlpu')
		a_Rengoku = new Audio('https://dl.dropbox.com/scl/fi/ienfa83ie5jht30a2d789/Rengoku.ogg?rlkey=7smz1zhwbixv8e8fmjg563zoq')
		a_Ren_hit = new Audio('https://dl.dropbox.com/scl/fi/q12mtz5oksrn6ra9qwf3i/Rengoku_hit.ogg?rlkey=kkms05nerqwugh0d71x18vmec')
		a_miss.volume = 0.7
		a_slap.volume = 0.65
		a_Rengoku.volume = 0.35
		a_Ren_hit.volume = 0.3
	    init()
		c.clearRect(550,250,600,150) // for the loading... text
		c.drawImage(images.get("NL"),0,0,420,42,100,380,420,42)
		c.drawImage(images.get("NL"),294,0,126,42,980,350,126,42)
		tmax.draw()
		tcur.draw()
		c.drawImage(images.get("enemy"),100,100)
		c.drawImage(images.get("player"),605,400)
		atk.draw()
		c.font = "bold 36px Ariel"
		c.fillStyle = "#000000"
		c.fillText("攻擊",1015,665)
	}
}
