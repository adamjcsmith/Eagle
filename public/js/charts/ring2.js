/* "The Ring" Data Visualisation.  (C) 2015 Adam Smith */

var dataTracker = [];
var isPressed = false;
var pressedObject = '';
var pressedOffsetX = 0;
var pressedOffsetY = 0;

var lastPressedX = 0;
var lastPressedY = 0;

var firstOriginalValueX;
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
		
		lastPressedX = mouseX;
		lastPressedY = mouseY;
		
		isPressed = true;
		
		// Loop through the array.  Matches X and Y ordinates?
		for(var i=0; i<dataTracker.length; i++) {

			var xDiff = (mouseX - dataTracker[i].xPoint);
			var yDiff = (mouseY - dataTracker[i].yPoint);
			var radius = 20;
			
			var pressDiffX = dataTracker[i].xPoint - mouseX;
			var pressDiffY = dataTracker[i].yPoint - mouseY;
			
			if( Math.pow(xDiff,2) + Math.pow(yDiff,2) < Math.pow(radius,2)) {
				//alert("Detected point!");
				pressedObject = i;
				//pressedOffsetX = pressDiffX;
				//pressedOffsetY = pressDiffY;
				
				break;
			}
		}
	};	
	
	function eventMouseMove(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;				
		
		
		/* TESTING STUFF */
		//isPressed = true;
		//pressedObject = 0;
		
		if(isPressed) {
			
			
			var centreX = canvas.width / 2;
			var centreY = canvas.height / 2;
			
			//var oldY = dataTracker[pressedObject].yPoint;
			//var oldX = dataTracker[pressedObject].xPoint;
			
			var oldX = lastPressedX;
			var oldY = lastPressedY;
			
			/*
			// Find vector 1:
			var vec1x = (oldX - centreX);
			var vec1y = (oldY - centreY);
			var vec1mag = Math.sqrt( Math.pow(vec1x, 2) + Math.pow(vec1y, 2));
			
			var v1xNorm = vec1x / vec1mag;
			var v1yNorm = vec1y / vec1mag;
			
			// Find vector 2:
			var vec2x = (mouseX - centreX);
			var vec2y = (mouseY - centreY);
			var vec2mag = Math.sqrt( Math.pow(vec2x, 2) + Math.pow(vec2y, 2));
			
			var v2xNorm = vec2x / vec2mag;
			var v2yNorm = vec2y / vec2mag;
			
			// Find dot product:
			
			var dotproduct = ( (v1xNorm * v2xNorm) + (v1yNorm * v2yNorm) );
			
			document.title = (Math.acos(dotproduct));
			
			currentRadian = currentRadian + dotproduct;
			*/
			
			// New - find distance of old, distance of new.
			
			var oldDist = Math.sqrt( Math.pow(oldX - centreX, 2) + Math.pow(oldY - centreY, 2) );
			
			var newDist = Math.sqrt( Math.pow(mouseX - centreX, 2) + Math.pow(mouseY - centreY,2) );
			
			var distDiff = (newDist / oldDist);
			
			var invDiff = (oldDist / newDist);
			
			//document.title = distDiff*100 + "%";
			
			//dataTracker[pressedObject].xPoint = mouseX;
			//dataTracker[pressedObject].yPoint = mouseY;
			
			for(var i=0; i<dataTracker.length; i++) {
				
				//dataTracker[i].xPoint += dataTracker[i].xPoint * distDiff;
				//dataTracker[i].yPoint += dataTracker[i].yPoint * distDiff;
				
				offsetX = centreX - dataTracker[i].xPoint;
				offsetY = centreY - dataTracker[i].yPoint;
				
				dataTracker[i].xPoint = (centreX - (offsetX * distDiff)) - pressedOffsetX;
				dataTracker[i].yPoint = (centreY - (offsetY * distDiff)) - pressedOffsetY;
				//dataTracker[i].currentMark = (dataTracker[i].currentMark * invDiff);
				
				
			}
			
			//document.title = ( Math.round((1 - (dataTracker[0].xPoint) / firstOriginalValueX) * 100) + "%");
			
			document.title = (dataTracker[1].currentMark);
			
			lastPressedX = mouseX;
			lastPressedY = mouseY;
			
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
			dataTracker.push({xPoint: points[0], yPoint: points[1], colour: "green", currentMark: studentData[i].rawResult});
		}
		else {
			drawPoint(points[0], points[1], "red", context);
			dataTracker.push({xPoint: points[0], yPoint: points[1], colour: "red", currentMark: studentData[i].rawResult});
		}
	}
	
	// Add original point to state:
	firstOriginalValueX = dataTracker[0].xPoint;

	// Find steps:
	var centreX = canvas.width / 2;
	var centreY = canvas.height / 2;
	var stepX = centreX / 100;
	var stepY = centreY / 100;
	

}

function recalculate(x, y, radian) {
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


function snap(id, canvas) {
	
	// Additive!
	
	centreX = canvas.width / 2;
	centreY = canvas.height / 2;

	
	
	
}


function redraw(context, canvas) {
	context.clearRect(0,0,canvas.width, canvas.height);

	canvas.style.background = '#FFE6E6';
	
	
	/* Pass boundary circle */
	context.beginPath();
	context.arc(canvas.width/2, canvas.height/2, (canvas.height/2)*0.6, 0, 2 * Math.PI, false);
	context.lineWidth = 0.5;
	context.fillStyle = 'white';
	context.fill();
	//context.strokeStyle = 'maroon';
	//context.stroke();
	
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
		
		var currentX = dataTracker[i].xPoint;
		var currentY = dataTracker[i].yPoint;
		var centreX = canvas.width / 2;
		var centreY = canvas.height /2;
		var failRadius = centreY * 0.6;
		
		// Round to steps:
		var stepX = centreX / 100;
		var stepY = centreY / 100;
		
		
		//dataTracker[i].xPoint = Math.round(dataTracker[i].xPoint);
		//dataTracker[i].yPoint = Math.round(dataTracker[i].yPoint);
		
		
		// Check if the point is now in the circle.
		if( Math.pow(currentX - centreX, 2) + Math.pow(currentY - centreY, 2) <= Math.pow(failRadius,2) )
			dataTracker[i].colour = "green";
		else
			dataTracker[i].colour = "red";
		
		drawPoint(dataTracker[i].xPoint, dataTracker[i].yPoint, dataTracker[i].colour, context);
	}
}
