/* "The Ring" Data Visualisation.  (C) 2015 Adam Smith */

var dataTracker;
var isPressed = false;
var pressedObject = '';
var pressedOffsetX = 0;
var pressedOffsetY = 0;

var lastPressedX = 0;
var lastPressedY = 0;

var firstOriginalValueX;
var currentRadian;

// Create the basic canvas:
var barCanvas;
var barContext;	

var barsWidth;
var barsHeight;


function prepareBars(maxMark, studentData, dataTrack) {

	dataTracker = dataTrack;
	
	barCanvas = document.getElementById('barcanvas');
	barContext = barCanvas.getContext('2d');
	
	barsWidth = barCanvas.width;
	barsHeight = barCanvas.height;
	
	var container = document.getElementById('contentarea');
	
	// Adjust to accommodate padding:
	//var padOffset = $('#contentarea').css('padding');
	
	var padOffset = window.getComputedStyle(container, null).getPropertyValue('padding-bottom');
	var padInt = parseInt(padOffset) + 2;
	
	//alert(padOffset);
	//alert(padInt);

	barCanvas.width = 200;
	barCanvas.height = 300;
	
	//canvas.height = 500;
	//canvas.width = 500;
	
	
	
	barsRedraw();
	
	// Add Event Listeners:
	barCanvas.addEventListener("touchstart", eventTouchStart, false); 
	barCanvas.addEventListener("touchmove", eventTouchMove, true); 
    barCanvas.addEventListener("touchend", eventTouchEnd, false); 
 	barCanvas.addEventListener("mousedown", eventMouseDown, false); 
 	barCanvas.addEventListener("mousemove", eventMouseMove, false); 
 	barCanvas.addEventListener("mouseup", eventMouseUp, false); 
 	barCanvas.addEventListener("mouseleave", eventMouseLeave, false);	 
 	barCanvas.addEventListener("mouseover", eventMouseOver, false); 

	
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
		
		if(isPressed) {
			
			var centreX = barCanvas.width / 2;
			var centreY = barCanvas.height / 2;
			var oldX = lastPressedX;
			var oldY = lastPressedY;

			// Find relative difference change:
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
			
				// Fix mark if it exceeds 100%:
				if(dataTracker[i].currentMark > 100) dataTracker[i].currentMark = 100;
			}
			
			lastPressedX = mouseX;
			lastPressedY = mouseY;
			redraw();
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
	
	// Add original point to state:
	firstOriginalValueX = dataTracker[0].xPoint;

	// Find steps:
	var centreX = barCanvas.width / 2;
	var centreY = barCanvas.height / 2;
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


function barsRedraw() {
	barContext.clearRect(0,0,barsWidth, barsHeight);

	/* Border circle */
	barContext.beginPath();
	barContext.arc(barsWidth/2, barsHeight/2, (barsHeight/2), 0, 2 * Math.PI, false);
	barContext.lineWidth = 0.5;
	//context.strokeStyle = '#5e5e5e';
	barContext.fillStyle = '#FFE6E6';
	barContext.fill();
	//context.stroke();	
	
	/* Pass boundary circle */
	barContext.beginPath();
	barContext.arc(barsWidth/2, barsHeight/2, (barsHeight/2)*0.6, 0, 2 * Math.PI, false);
	barContext.lineWidth = 0.5;
	barContext.fillStyle = 'white';
	barContext.fill();
	//context.strokeStyle = 'maroon';
	//context.stroke();
	
	/* First class undercircle */
	barContext.beginPath();
	barContext.arc(barsWidth/2, barsHeight/2, (barsHeight/2)*0.3, 0, 2 * Math.PI, false);
	barContext.lineWidth = 0.5;
	barContext.strokeStyle = 'green';
	barContext.stroke();
	
	/* Center completion circle */
	barContext.beginPath();
	barContext.arc(barsWidth/2, barsHeight/2, 3, 0, 2 * Math.PI, false);
	barContext.lineWidth = 2;
	barContext.fillStyle = "black";
	barContext.fill();
	barContext.strokeStyle = '#003300';
	barContext.stroke();
	
	for(var i=0; i<dataTracker.length; i++) {
		
		var currentX = dataTracker[i].xPoint;
		var currentY = dataTracker[i].yPoint;
		var centreX = barCanvas.width / 2;
		var centreY = barCanvas.height /2;
		var failRadius = centreY * 0.6;
		
		var newPoints = calculatePoint(Math.round(dataTracker[i].currentMark), i, dataTracker.length, 100, barCanvas);
		
		// Testing stuff!!
		dataTracker[i].xPoint = newPoints[0];
		dataTracker[i].yPoint = newPoints[1];
		
		// Check if the point is now in the circle.
		if( Math.pow(currentX - centreX, 2) + Math.pow(currentY - centreY, 2) <= Math.pow(failRadius,2) )
			dataTracker[i].colour = "green";
		else
			dataTracker[i].colour = "red";
		
		drawPoint(dataTracker[i].xPoint, dataTracker[i].yPoint, dataTracker[i].colour, barContext);
	
		// Update Percentage:
		document.title = (dataTracker[1].currentMark / dataTracker[1].rawMark) + '%';
		document.getElementById('currentScale').innerHTML = 'Scale Factor: ' + (dataTracker[1].currentMark / dataTracker[1].rawMark).toFixed(2) + '';

	}
}