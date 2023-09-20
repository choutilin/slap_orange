const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')  // c for Context

canvas.width = 1280 //innerWidth
canvas.height = 720 //innerHeight

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
			this.color = 'blue'
		}
	}
	draw() {
		c.beginPath()
		c.rect(this.x,this.y,this.width,this.height)
		c.fillStyle = this.color
		c.fill()
	}
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
const enemy = new Enemy(300,200,200,'red')
enemy.draw()
const eprep = new Enemy(300,200,100,'green')
const eatk  = new Enemy(300,200,100,'blue')
const atk = new Button(1000,600,100,'atk')
atk.draw()
const def = new Button(100,600,100,'def')
def.draw()



var tnow=0
var t1
var difficulty=35 //50
var t2
var mouseX
var dist
var canAttack = true
var canDefend = false
var isDefending = false
var pause = false

function animate() {
	if (pause) return
	requestAnimationFrame(animate)
	c.clearRect(100,50,200,50)
	tmax.draw()
	tcur.draw()
	tcur.update()
	tnow+=1
	if (isDefending && tcur.width<=t2){
		window.removeEventListener('mousemove',defending)
		eatk.draw()
		pause=true
		console.log('got hit!')
		isDefending = false
		canAttack = true
	}
	else if (isDefending && tcur.width<=t1){
		eprep.draw()
	}
}

function attacking(event) {
	var mousePos = getMousePos(canvas, event)
	var prev_dist = dist
	dist = Math.sqrt( (mousePos.x-300)**2 + (mousePos.y-200)**2 )
	if (dist>prev_dist) {  // bingo
		console.log(tnow - prev_tnow)
		console.log(prev_dist)
		window.removeEventListener('mousemove',attacking)
		pause=true
		canDefend=true
	}
}

function defending(event) {
	var mousePos = getMousePos(canvas, event)
	var prev_X = mouseX
	mouseX = mousePos.x
	// console.log(mousePos.x - prev_X)
	if ( mousePos.x - prev_X > 200.4087 ) {  // fast enough
		// console.log(tnow - prev_tnow)
		if (tcur.width<=t1){
			window.removeEventListener('mousemove',defending)
			pause=true
			console.log('dodged!')
			isDefending = false
			canAttack = true
		}
	}
}

window.addEventListener('click', (click) => {
	var mousePos = getMousePos(canvas, click)
	if (isInside(mousePos, atk)) {
		if (canAttack==false) return
		canAttack = false
		enemy.draw()
		pause=false
		animate()
		dist = Math.sqrt( (mousePos.x-300)**2 + (mousePos.y-200)**2 )
		prev_tnow = tnow
		tcur.width = 200
		window.addEventListener('mousemove', attacking)
	} else {
		if (isInside(mousePos, def)) {
			if (canDefend==false) return
			canDefend = false
			isDefending = true
			pause=false
			animate()
			mouseX = mousePos.x
			prev_tnow = tnow
			tcur.width = 200
			t1 = 180 - Math.random()*110
			t2 = t1 - difficulty
			window.addEventListener('mousemove', defending)
		}
	}
})


