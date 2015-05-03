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
			
			
			// New - find distance of old, distance of new.
			
			var oldDist = Math.sqrt( Math.pow(oldX - centreX, 2) + Math.pow(oldY - centreY, 2) );
			
			var newDist = Math.sqrt( Math.pow(mouseX - centreX, 2) + Math.pow(mouseY - centreY,2) );
			
			var distDiff = (newDist / oldDist);
			
			// Inverted Diff for display:
			var invDiff = (oldDist / newDist);
			
			
			for(var i=0; i<dataTracker.length; i++) {
				
				offsetX = centreX - dataTracker[i].xPoint;
				offsetY = centreY - dataTracker[i].yPoint;
				
				dataTracker[i].xPoint = (centreX - (offsetX * distDiff)) - pressedOffsetX;
				dataTracker[i].yPoint = (centreY - (offsetY * distDiff)) - pressedOffsetY;
				dataTracker[i].currentMark = (dataTracker[i].currentMark * invDiff);
			
				// Check if current mark is beyond 100%:
				if(dataTracker[i].currentMark > 100)
					dataTracker[i].currentMark = 100;
			
			}
			
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
		if( (studentData[i].rawResult / 100) >= 0.4) {
			drawPoint(points[0], points[1], "green", context);
			dataTracker.push({xPoint: points[0], yPoint: points[1], colour: "green", currentMark: studentData[i].rawResult, rawMark: studentData[i].rawResult});
			//alert('For mark no#' + i + ' the rawMark is: ' + dataTracker[i].rawMark);		
		}
		else {
			drawPoint(points[0], points[1], "red", context);
			dataTracker.push({xPoint: points[0], yPoint: points[1], colour: "red", currentMark: studentData[i].rawResult, rawMark: studentData[i].rawResult});
			//alert('For mark no#' + i + ' the rawMark is: ' + dataTracker[i].rawMark);			
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

function calculatePoint(health, id, total, max, canvas) {
	// Calculate Angle:
	var radian = (2*Math.PI)/total;
	currentRadian = radian;
	
	// Inverse proportion:
	var stepX = canvas.height/2 - ((health/max) * canvas.height/2);
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
		
		var currentX = dataTracker[i].xPoint;
		var currentY = dataTracker[i].yPoint;
		var centreX = canvas.width / 2;
		var centreY = canvas.height /2;
		var failRadius = centreY * 0.6;
		
		var newPoints = calculatePoint(Math.round(dataTracker[i].currentMark), i, dataTracker.length, 100, canvas);
		
		// Testing stuff!!
		dataTracker[i].xPoint = newPoints[0];
		dataTracker[i].yPoint = newPoints[1];
		
		// Check if the point is now in the circle.
		if( Math.pow(currentX - centreX, 2) + Math.pow(currentY - centreY, 2) <= Math.pow(failRadius,2) )
			dataTracker[i].colour = "green";
		else
			dataTracker[i].colour = "red";
		
		drawPoint(dataTracker[i].xPoint, dataTracker[i].yPoint, dataTracker[i].colour, context);
	
		// Update Percentage:
		document.title = (dataTracker[1].currentMark / dataTracker[1].rawMark) + '%';

	}
}
