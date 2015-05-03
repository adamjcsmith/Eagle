/* "The Ring" Data Visualisation.  (C) 2015 Adam Smith */

var dataTracker = [];
var isPressed = false;
var pressedObject = '';

var currentRadian;


function prepareRing(maxMark, studentData) {
	
	// Create the basic canvas:
	var canvas = document.getElementById('ringcanvas');
	var context = canvas.getContext('2d');		
	
	// Adjust for correct sizing:
	canvas.width = 900;
	canvas.height = 700;
	
	redraw(context, canvas);
	
	// Add Event Listeners:
	canvas.addEventListener("touchstart", eventTouchStart, false); 
	canvas.addEventListener("touchmove", eventTouchMove, true); 
    canvas.addEventListener("touchend", eventTouchEnd, false); 
 	canvas.addEventListener("mousedown", eventMouseDown, false); 
 	canvas.addEventListener("mousemove", eventMouseMove, false); 
 	canvas.addEventListener("mouseup", eventMouseUp, false); 
 	canvas.addEventListener("mouseleave", eventMouseLeave, false);	 
 	canvas.addEventListener("mouseover", eventMouseOver, false); 

	
	// Touch Events
	function eventTouchStart(e) {
		
	};
	
	function eventTouchMove(e) {
		
	};
	
	function eventTouchEnd(e) {
		
	};	
	
	
	// Mouse Events
	function eventMouseDown(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;		
		
		isPressed = true;
		
		// Loop through the array.  Matches X and Y ordinates?
		for(var i=0; i<dataTracker.length; i++) {

			var xDiff = (mouseX - dataTracker[i].xPoint);
			var yDiff = (mouseY - dataTracker[i].yPoint);
			var radius = 20;
			
			if( Math.pow(xDiff,2) + Math.pow(yDiff,2) < Math.pow(radius,2)) {
				//alert("Detected point!");
				pressedObject = i;
				break;
			}
		}
	};	
	
	function eventMouseMove(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;				
		
		
		if(isPressed) {
			dataTracker[pressedObject].xPoint = mouseX;
			dataTracker[pressedObject].yPoint = mouseY;
			
			redraw(context, canvas);
		}
		
	};	
	
	function eventMouseUp(e) {
		
		isPressed = false;
		pressedObject = '';
		
		
	};		
	
	function eventMouseLeave(e) {
		
	};		
	
	function eventMouseOver(e) {
		
	};			
	

	
	// Extract data points and add to the canvas:
	for(var i = 0; i < studentData.length; i++) {
		var points = calculatePoint(studentData[i].rawResult, i, studentData.length, 100, canvas);
		if( (studentData[i].rawResult / 100) > 0.4) {
			drawPoint(points[0], points[1], "green", context);
			dataTracker.push({xPoint: points[0], yPoint: points[1], colour: "green"});
		}
		else {
			drawPoint(points[0], points[1], "red", context);
			dataTracker.push({xPoint: points[0], yPoint: points[1], colour: "red"});
		}
	}


}

function calculateAngle(x1, x2, y1, y2, centre) {
	return Math.atan2(y2 - y1, x2 - x1);
}

function adjustAngle(x, y, radian) {
	//var newx = x * Math.cos(currentRadian+radian) + 
}

function calculatePoint(health, id, total, max, canvas) {
	// Calculate Angle:
	var radian = (2*Math.PI)/total;
	currentRadian = radian;
	
	// Inverse proportion:
	var stepX = canvas.width/2 - ((health/max) * canvas.width/2);
	var stepY = canvas.height/2 - ((health/max) * canvas.height/2);

	// Calculate final point:
	var x = stepX*Math.cos(radian*id) + canvas.width/2;
	var y = stepY*Math.sin(radian*id) + canvas.height/2;		

	return [x, y];
}

function drawPoint(x, y, colour, context) {
	context.beginPath();
	context.arc(x, y, 8, 0, 2 * Math.PI, false);
	context.lineWidth = 3;
	context.fillStyle = colour;
	context.fill();
	context.strokeStyle = colour;
	context.stroke();				
}


function redraw(context, canvas) {
	context.clearRect(0,0,canvas.width, canvas.height);
	
	/* Pass boundary circle */
	context.beginPath();
	context.arc(canvas.width/2, canvas.height/2, (canvas.height/2)*0.6, 0, 2 * Math.PI, false);
	context.lineWidth = 0.5;
	context.fillStyle = 'white';
	context.fill();
	context.strokeStyle = 'maroon';
	context.stroke();
	
	/* First class undercircle */
	context.beginPath();
	context.arc(canvas.width/2, canvas.height/2, (canvas.height/2)*0.3, 0, 2 * Math.PI, false);
	context.lineWidth = 0.5;
	context.strokeStyle = 'green';
	context.stroke();
	
	/* Center completion circle */
	context.beginPath();
	context.arc(canvas.width/2, canvas.height/2, 3, 0, 2 * Math.PI, false);
	context.lineWidth = 2;
	context.fillStyle = "black";
	context.fill();
	context.strokeStyle = '#003300';
	context.stroke();
	
	for(var i=0; i<dataTracker.length; i++) {
		console.log("Called loop");
		drawPoint(dataTracker[i].xPoint, dataTracker[i].yPoint, dataTracker[i].colour, context);
	}
}
