/* "The Ring" Data Visualisation.  (C) 2015 Adam Smith */

var dataTracker;
var isPressed = false;
var pressedObject = '';
var lastPressedX = 0;
var lastPressedY = 0;
var ringCentreX;
var ringCentreY;
var socket;
var studentHighlightMode = false;
var studentHighlightID;
var originalTotalMarks;

function prepareRing(maxMark, studentData, dataTrack, socketinput) {
	
	socket = socketinput;
	
	// Assign to relevant objects:
	dataTracker = dataTrack;	
	var canvas = document.getElementById('ringcanvas');
	var context = canvas.getContext('2d');		
	var container = document.getElementById('contentarea');

	// Adjust to accommodate padding:
	var padOffset = window.getComputedStyle(container, null).getPropertyValue('padding-bottom');
	var padInt = parseInt(padOffset) + 2;
	canvas.width = container.offsetHeight;
	canvas.height = container.offsetHeight - padInt*2;
	ringCentreX = canvas.width/2;
	ringCentreY = canvas.height/2;	
	
	// Draw to show initial points:
	redraw(context, canvas);
	originalTotalMarks = studentData.length;
	
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
	function eventTouchStart(e) { };
	function eventTouchMove(e) { };
	function eventTouchEnd(e) { };	
	
	// Mouse Events
	function eventMouseDown(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;		
		
		lastPressedX = mouseX;
		lastPressedY = mouseY;
		isPressed = true;
		
		// Discover whether a click corresponds to a point:
		for(var i=0; i<dataTracker.length; i++) {
			var xDiff = (mouseX - dataTracker[i].xPoint);
			var yDiff = (mouseY - dataTracker[i].yPoint);
			var radius = 40;
			if( Math.pow(xDiff,2) + Math.pow(yDiff,2) < Math.pow(radius,2)) {
				pressedObject = i;
				break;
			}
		}
	};	
	
	function eventMouseMove(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;				
		
		if(isPressed && !studentHighlightMode) {

			// Find relative difference change:
			var oldDist = Math.sqrt( Math.pow(lastPressedX - ringCentreX, 2) + Math.pow(lastPressedY - ringCentreY, 2) );
			var newDist = Math.sqrt( Math.pow(mouseX - ringCentreX, 2) + Math.pow(mouseY - ringCentreY,2) );
			var distDiff = (newDist / oldDist);
			var invDiff = (oldDist / newDist);
			
			for(var i=0; i<dataTracker.length; i++) {
				
					offsetX = ringCentreX - dataTracker[i].xPoint;
					offsetY = ringCentreY - dataTracker[i].yPoint;
				
					dataTracker[i].xPoint = (ringCentreX - (offsetX * distDiff));
					dataTracker[i].yPoint = (ringCentreY - (offsetY * distDiff));
					
					if(dataTracker[i].locked == false) {
						dataTracker[i].currentMark = (dataTracker[i].currentMark * invDiff);
					}
			
					// Fix mark if it exceeds 100%:
					if(dataTracker[i].currentMark > 100) dataTracker[i].currentMark = 100;

			}
			
			lastPressedX = mouseX;
			lastPressedY = mouseY;
			redraw(context, canvas);
		}
		
	};	
	
	function eventMouseUp(e) {
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;			
		
		isPressed = false;		
		
		// Discover whether a click corresponds to a point:
		for(var i=0; i<dataTracker.length; i++) {
			var xDiff = (mouseX - dataTracker[i].xPoint);
			var yDiff = (mouseY - dataTracker[i].yPoint);
			var radius = 60;
			if( (Math.pow(xDiff,2) + Math.pow(yDiff,2)) < Math.pow(radius,2)) {
				pressedObject = i;
				
				$('#component-details').stop().fadeOut(400);
				$('#extended-statistics').fadeOut(400);
				$('#student-details').delay(400).fadeIn(400);
				
				removeInsightMarks(context, canvas);
				socket.emit('studentRequest', dataTracker[i].studentID);
				
				socket.on('studentResponse', function(data) {
					document.getElementById('student-name').innerHTML = data.name + " / " + dataTracker[i].studentID;
					addInsightMarks(context, canvas, dataTracker[i].studentID, data.marks, i);
				});
					
				if(dataTracker[getDataByStudentID(dataTracker[i].studentID)].locked) switchLockButton('Lock');
				else switchLockButton('Locked');				
				
				// Add insight details:
				document.getElementById('insightMark').innerHTML = Math.round(dataTracker[i].currentMark);
				document.getElementById('insightFailCount').innerHTML = dataTracker[i].failCount;		
				document.getElementById('insightAverage').innerHTML = (dataTracker[i].componentTypeAverage).toFixed(1);

				// Add insight colours:
				if(Math.round(dataTracker[i].currentMark) < 40) {
					document.getElementById('insightMark').style.backgroundColor = 'rgba(255,0,0, 0.5)';
					document.getElementById('insightMark').style.color = 'white';
				}	
				else {
					document.getElementById('insightMark').style.backgroundColor = 'rgba(0, 255, 0, 0.4)';
					document.getElementById('insightMark').style.color = 'black';					
				}
					
				if(dataTracker[i].failCount > 0) {
					document.getElementById('insightFailCount').style.backgroundColor = 'rgba(255,0,0, 0.5)';
					document.getElementById('insightFailCount').style.color = 'white';
				}
				else {
					document.getElementById('insightFailCount').style.backgroundColor = 'rgba(0, 255, 0, 0.4)';
					document.getElementById('insightFailCount').style.color = 'black';					
				}
				
				if(dataTracker[i].componentTypeAverage.toFixed(1) < 40) {
					document.getElementById('insightAverage').style.backgroundColor = 'rgba(255,0,0, 0.5)';
					document.getElementById('insightAverage').style.color = 'white';
				}
				else {
					document.getElementById('insightAverage').style.backgroundColor = 'rgba(0,255,0, 0.4)';
					document.getElementById('insightAverage').style.color = 'black';						
				}
				
				break;
			}
			else {
				$('#student-details').stop().fadeOut(400);	
				$('#component-details').fadeIn(400);
				$('#extended-statistics').fadeIn(400);					
				removeInsightMarks(context, canvas);
		}		
		
		pressedObject = '';
		}
		
	};		
	
	function eventMouseLeave(e) { };		
	
	function eventMouseOver(e) { };			
	
	// Extract data points and add to the canvas:
	for(var i = 0; i < studentData.length; i++) {
		var points = calculatePoint(studentData[i].rawResult, i, studentData.length, 100, canvas, false, -1);
		if( (studentData[i].rawResult / 100) >= 0.4) {
			drawPoint(points[0], points[1], "#5e5e5e", context, canvas);
			dataTracker.push({xPoint: points[0], yPoint: points[1], colour: "#5e5e5e", currentMark: studentData[i].rawResult, rawMark: studentData[i].rawResult, studentID: studentData[i].studentID, locked: false, insightMark: false, originalID: studentData[i]._id, failCount: studentData[i].failCount, componentTypeAverage: studentData[i].componentTypeAverage});	
		}
		else {
			drawPoint(points[0], points[1], "red", context, canvas);
			dataTracker.push({xPoint: points[0], yPoint: points[1], colour: "red", currentMark: studentData[i].rawResult, rawMark: studentData[i].rawResult, studentID: studentData[i].studentID, locked: false, insightMark: false, originalID: studentData[i]._id, failCount: studentData[i].failCount, componentTypeAverage: studentData[i].componentTypeAverage});	
		}
	}
}

function calculatePoint(health, id, total, max, canvas, insight, originalpos) {
	
	var radian;
	
	if(insight == true) {
		radian = ((2*Math.PI)*(originalpos))/originalTotalMarks;
	}
	else {
		radian = (2*Math.PI)/originalTotalMarks;
	}
	
	// Angle & Proportion:
	var stepX = canvas.height/2 - ((health/max) * canvas.height/2);
	var stepY = canvas.height/2 - ((health/max) * canvas.height/2);

	// Calculate final point:
	if(insight == true) {
		var x = stepX*Math.cos(radian) + canvas.width/2;
		var y = stepY*Math.sin(radian) + canvas.height/2;					
	}
	else {
		var x = stepX*Math.cos(radian*id) + canvas.width/2;
		var y = stepY*Math.sin(radian*id) + canvas.height/2;				
	}
	
	return [x, y];
}

function drawPoint(x, y, colour, context, canvas) {
	drawCircle(x, y, 8, 0, colour, colour, context, canvas);
}

function drawCircle(x, y, radius, linewidth, linecolour, fillcolour, context, canvas) {
	context.beginPath();
	context.arc(x, y, radius, 0, 2 * Math.PI, false);
	context.lineWidth = linewidth;
	context.strokeStyle = linecolour;
	context.fillStyle = fillcolour;
	if(linecolour != '') context.stroke();
	context.fill();
}

function redraw(context, canvas) {
	context.clearRect(0,0,canvas.width, canvas.height);
	
	// Outer Border
	drawCircle(ringCentreX, ringCentreY, ringCentreY, 0.5, '', '#FFE6E6', context, canvas);
	// Pass Boundary
	drawCircle(ringCentreX, ringCentreY, ringCentreY*0.6, 0.5, '', 'white', context, canvas);	
	// First Class
	drawCircle(ringCentreX, ringCentreY, ringCentreY*0.3, 1, 'green', 'white', context, canvas);
	// Full Marks / Centre
	drawCircle(ringCentreX, ringCentreY, 3, 2, '#003300', 'black', context, canvas);
	
	for(var i=0; i<dataTracker.length; i++) {
		var failRadius = ringCentreY * 0.6;
		
		if(dataTracker[i].insightMark == true) {
			var newPoints = calculatePoint(Math.round(dataTracker[i].currentMark), i, dataTracker.length, 100, canvas, true, dataTracker[i].originalPos);
		}
		else {
			var newPoints = calculatePoint(Math.round(dataTracker[i].currentMark), i, dataTracker.length, 100, canvas, false, -1);
		}
		
		dataTracker[i].xPoint = newPoints[0];
		dataTracker[i].yPoint = newPoints[1];
		
		// Check if the point is now in the circle.
		if( Math.pow(dataTracker[i].xPoint - ringCentreX, 2) + Math.pow(dataTracker[i].yPoint - ringCentreY, 2) <= Math.pow(failRadius,2) )
			dataTracker[i].colour = "#5e5e5e";
		else
			dataTracker[i].colour = "red";
		
		if(studentHighlightMode) {
			
			if(dataTracker[i].insightMark == false) {
				dataTracker[i].colour = "rgba(0,0,0,0.1)";
			}
			
			if(dataTracker[i].insightMark == true) {

			}
		}
		
		drawPoint(dataTracker[i].xPoint, dataTracker[i].yPoint, dataTracker[i].colour, context, canvas);

		document.getElementById('insightSuggestedScale').innerHTML = (dataTracker[1].currentMark / dataTracker[1].rawMark).toFixed(2) + 'x';
		scaleFactor = (dataTracker[i].currentMark / dataTracker[i].rawMark).toFixed(2);
		
		// Update Insight Values here:
		document.getElementById('insightAggregate').innerHTML = (originalAggr * scaleFactor).toFixed(1);		
		document.getElementById('insightAverageMark').innerHTML = (originalAverage * scaleFactor).toFixed(1);
		
		document.getElementById('currentScale').innerHTML = 'Scale Factor: ' + (dataTracker[1].currentMark / dataTracker[1].rawMark).toFixed(2) + '';
	}
}

// Temporarily adds marks about a specific student to the canvas.
function addInsightMarks(context, canvas, studentID, marks, position) {
	
	for(var i = 0; i<marks.length; i++) {
		if(checkDataByID(marks[i]._id) == false) {
			dataTracker.push({xPoint: 0, yPoint: 0, colour: "green", currentMark: marks[i].rawResult, rawMark: marks[i].rawResult, studentID: studentID, locked: true, insightMark: true, originalPos: position, originalID: marks[i]._id});	
			studentHighlightMode = true;
			studentHighlightID = studentID;
		}
	}
	
	redraw(context, canvas);
	addMinMaxLine(context);
}

function removeInsightMarks(context, canvas) {
	for(var i=0; i<dataTracker.length; i++) {
		if(dataTracker[i].insightMark == true) {
			dataTracker.splice(i, 1);
		}
	}
	studentHighlightMode = false;
	studentHighlightID = '';
	redraw(context, canvas);
}

function checkDataByID(id) {
	for(var i=0; i<dataTracker.length; i++) {
		if(dataTracker[i].originalID == id) {
			return true;
		}
	}
	return false;
}

function addMinMaxLine(context) {
	var minID;
	var maxID;
	
	var maxMark = -1;
	var minMark = 101;
	
	for(var i=0; i<dataTracker.length; i++) {
		if(dataTracker[i].insightMark) {
			
			if(dataTracker[i].rawMark > 50) {
				
				if(dataTracker[i].rawMark > maxMark) {
					maxMark = dataTracker[i].rawMark;
					maxID = i;
				}

			}
			else {
				
				if(dataTracker[i].rawMark < minMark) {
					minMark = dataTracker[i].rawMark;
					minID = i;
				}
				
			}
			
		}
	}
	
	context.beginPath();
	context.moveTo(dataTracker[minID].xPoint, dataTracker[minID].yPoint);
	context.lineTo(dataTracker[maxID].xPoint, dataTracker[maxID].yPoint);
	context.lineWidth = 1;
	context.strokeStyle = 'rgba(0,0,0,0.15)';
	context.stroke();	
	
}

function lockTier(label, mode) {
	
	var minThreshold = 0;
	var maxTreshold = 0;
	
	if(label == 'Fail') {
		minThreshold = 0; maxThreshold = 40;
	}
	else if(label == '3rd') {
		minThreshold = 40; maxThreshold = 50;
	}
	else if(label == '2:2') {
		minThreshold = 50; maxThreshold = 60;
	}
	else if(label == '2:1') {
		minThreshold = 60; maxThreshold = 70;
	}
	else if(label == '1:1') {
		minThreshold = 70; maxThreshold = 100;
	}
	
	for(var i=0; i<dataTracker.length; i++) {
		if(dataTracker[i].currentMark < maxThreshold && dataTracker[i].currentMark >= minThreshold ) {
			
			if(mode == 'lock') dataTracker[i].locked = true;
			else dataTracker[i].locked = false;
			
		}
			
	}	
	
}

$(document).on("click", "#individualDetailsButton", function(){ 
	window.location = "/student/" + studentHighlightID;
});

// Get DataTracker Array position by Student ID:
function getDataByStudentID(StudentID) {
	for(var i=0; i<dataTracker.length; i++) {	
		if((dataTracker[i].studentID == StudentID) && (dataTracker[i].insightMark == false)) {
			return i;
		}
	}	
	return -1;
}

function switchLockButton(setting) {
	
	if(setting == 'Locked') {
		$('#individualLockButton').removeClass("buttonDown");
		$('#individualLockButton').html('Lock');		
	} else {
		$('#individualLockButton').addClass("buttonDown");
		$('#individualLockButton').html('Locked');			
	}
	
}

$(document).on("click", "#individualLockButton", function(){ 

	i = getDataByStudentID(studentHighlightID);
	
	if(i > -1) {

		if(dataTracker[i].locked) {
			dataTracker[i].locked = false;
			switchLockButton('Locked');			
		} else {
			dataTracker[i].locked = true;	
			switchLockButton('Lock');				
		}

			return;
	}
	

});