var open = 0;
var openID = 0;
var originalSliderVal = 0;
var approvedData = [];
var currentHighlightMode = 'standard';
var clickedID = 0;

function prepareWorkflow(componentData, studentData, allMarks, moduleData, mode) {

	$('#workflow-view').css("paddingTop", '0%');

	var maxStuff = componentData.length * studentData.length;	
	
	// Add component titles etc:
	var compData = "";
	for(var i=0; i<componentData.length; i++) {
		
		// Find their aggregation here:
		var total = 0;
		var counter = 0;
		
		for(var w=0; w<allMarks.length; w++) {
			if(allMarks[w].componentID == componentData[i]._id) {
				total += allMarks[w].rawResult;
				counter++;
			}
		}
		
		var avgAggregate = ((total / counter*100)/10000 * 24).toFixed(1);
		
		// Change colour depending on overall scale insight:
		if(avgAggregate > 17.0 || avgAggregate < 13.5) var modInsightColour = 'rgba(255,0,0,0.5)';
		else var modInsightColour = '#5e5e5e';
		
		compData += "<a class='workflow-element' style='height: auto; background-color: transparent; color: "+ modInsightColour +";'>" + componentData[i].moduleCode + "<div class='dividerline'></div>"+ avgAggregate +"</a>";
	}
	
	
	document.getElementById('workflow-view').innerHTML += "<div class='workflow-studentsection'><div class='workflow-studentsection-detailsarea'><h3 style='font-weight: 400;'> </h3></div>" + compData + "</div>";	

	var counter = 0;
	
	// For every student:
	for(var k=0; k<studentData.length; k++) {
		var componentHTML = '';
		for(var i=0; i<componentData.length; i++) {
			// Set variables of each block:
			var avgExamSquare = "<div class='insightSquare staticSquare' id='avgExam" + componentData[i]._id +"' style='display: none; color: black; pointer-events: none; background: white; margin-top: 6%'>?</div>";		
			var failedExamSquare = "<div class='insightSquare staticSquare' id='failedExam" + componentData[i]._id +"' style='display: none; color: black; pointer-events: none; background: white; margin-top: 6%'>?</div>";
			var insightLabels = "<div style='clear: both;'></div><div class='insightLabel' style='display: none; pointer-events: none;'>Avg. Comps.</div><div class='insightLabel' style='display: none'>Failed Comps.</div>";
			
			var studentMark = '';
			
			// Find this student's marks:
			for(var m=0; m<allMarks.length; m++) {
				if( ( allMarks[m].componentID == componentData[i]._id ) && ( allMarks[m].studentID == studentData[k]._id ) ) {
					studentMark = allMarks[m].rawResult;
				}
			}
			
			var workMarkHTML = "<span id='mainMark" + componentData[i]._id + "' class='workMark' style='display: none; pointer-events: none;'>" + studentMark +"</span>";
			var nameHTML = "<div class='studentName' style='display: none; margin-top: 1%; pointer-events: none;' id='name"+ studentData[k].fullname +"'></div>";
			var moduleNameHTML = "<div class='moduleName' style='pointer-events: none;'>" + studentMark +"</div>";
			
			var resultBackground = '#5e5e5e';
			if(studentMark == '') resultBackground = 'transparent';
			
			if(studentMark < 40 && studentMark != '') resultBackground = 'rgba(255,0,0,0.4)';
			
			var workflowHTML = "<a data-studentid='" + componentData[i].studentID +"' style='background-color: " + resultBackground + "' class='workflow-element' id='" + counter +"'>" + workMarkHTML + nameHTML + moduleNameHTML + avgExamSquare + failedExamSquare + insightLabels + "</a>";		
			counter++;
			componentHTML += workflowHTML;
		}

		// Determine whether this student is a 'fail' student:
		if (findFailed(studentData[k]._id) > 0)
			var bgColour = "rgba(255,0,0, 0)";
		else
			var bgColour = "transparent";	
		
		// Add this section:
		var studentSection = "<div class='workflow-studentsection' id='" + studentData[k]._id + "' style='background-color: " + bgColour + "'><div class='workflow-studentsection-detailsarea'><h3 style='font-weight: 400;'>" + studentData[k].fullname + "</h3></div>" + componentHTML + "</div>";	
		document.getElementById('workflow-view').innerHTML += studentSection;		
		// Go to a new line and reset componentHTML:
		document.getElementById('workflow-view').innerHTML += '<div style="clear: both;"></div>';	
		componentHTML = '';		
	}

	function findFailed(studentID) {
		var failedCount = 0;
		for(var i=0; i<allMarks.length; i++) {
			if(allMarks[i].studentID == studentID && allMarks[i].rawResult < 40 )
				failedCount++;
		}
		return failedCount;
	}

	
	// Mode Switching:
	var initialWidthHeight = '5%';
	
	$('.workflow-element').velocity({opacity: '1', width: initialWidthHeight, height: initialWidthHeight}, 800, 'easeInOutCubic', function() {
		standardHighlights();
	}).css("display","inline-block");		
	
	/*
	$('.workflow-element').animate({opacity: '1'}, 800, 'easeInOutCubic', function() {
		
	}).css("display", "inline-block");
	*/
	
	
	$('.workflow-element').click(function(evt) {
	
		if(open == 0 && !locked) {
			
			clickedID = evt.target.id;
			
			$('.frameBoxes').finish().remove();
			$('.floatingBoxes').finish().remove();
			
			if(isNaN(evt.target.id)) return;

			// Hide existing UI:
			$('.workMark').finish().fadeOut(300);
			$('.studentName').fadeOut(300);
			$('.insightSquare').fadeOut(300);
			$('.insightLabel').fadeOut(300);				
	
			var pos = $('#' + evt.target.id).position();
			$('#' + evt.target.id).clone().attr('id', 'holder').insertAfter("#" + evt.target.id);
			$('#' + evt.target.id).css({position: 'absolute', top: pos.top + $('#workflow-view').scrollTop(), left: pos.left, right: pos.right, bottom: pos.bottom});
		
			for(var i=0; i<maxStuff; i++) {
		
				if(i != evt.target.id) {
					$('#' + i).finish().velocity({opacity: 0}, 400, 'easeInOutCubic').delay(400).queue(function(etc) {
					$('#' + i).css({width: '0%', height: '0%', padding: '0', margin: '0'});
					});
				}
			}
		
			$('#' + evt.target.id).finish().animate({width: '100%', height: '100%', left: 0, top: $('#workflow-view').scrollTop(), backgroundColor: 'white', color: 'black', border: 'solid 0px #ccc'}, 700, 'easeInOutCubic');
			$('#holder').animate({opacity: 0}, 0, 'easeInOutCubic');
			
			var theElement = document.getElementById(evt.target.id);
			
			var sentID = $('#' + clickedID).closest('.workflow-studentsection').attr("id");
			socket.emit('studentRequest', sentID);
			
			$('#' + clickedID).find('.moduleName').fadeOut(500);
			

			socket.on('studentResponse', function(data) {	
			
				// Disregard previous socket responses:
				if(data.originalid != sentID) return;
				
				// Set up HTML to inject:
				var studentFrame = "<iframe id='studentFrameBox' class='frameBoxes' style='opacity: 0; width: 100%; height: 100%; border: none;' src='/student/" + data.originalid + "/choiceview'></iframe>";
				var floatingBox = "<div id='floatingBox' class='floatingBoxes' style=''><a id='approveButton' href='#' class='insightButton miniButton'>Approve</a><a id='backButton' href='#' class='insightButton miniButton'>Back</a></div>";
				
				// Add new UI Namespaces with animation:
				$('#' + evt.target.id).delay(000).append(studentFrame + floatingBox);
				$('#studentFrameBox').finish().delay(200).animate({opacity: 1}, 500, 'easeInOutCubic');	
				//$('#studentFrameBox').delay(1000).css({display: 'inline-block'});				
				//$('#floatingBox').finish().delay(1000).fadeIn(500);	
				$('#floatingBox').css({display: 'block', opacity: 1});			

				//$('#holder').finish().remove();
			});

			open = 1;
			openID = sentID;
			originalSliderVal = $('#slider').slider("value");
			
		}

	});
	
	
	$(document).on("click", "#approveButton", function(){ 
		
		closeActive();

		approvedData.push(openID);			
		

		for(var i=0; i<approvedData.length; i++) {
			$('#' + approvedData[i]).finish().animate({opacity: 0.2}, 1000, 'easeInOutCubic');	
		}		
	
	
	});
	
	$(document).on("click", "#backButton", function(){ 
		
		closeActive();
	
	});	
	
	$(document).on("click", "#mini-ringButton", function(){ 
		
		window.location = "/student/" + componentData[openID].studentID;
	
	});		
	
	$(document).on("click", "#mini-workflowButton", function(){ 
		
		window.location = "/student/" + componentData[openID].studentID + "/workflow/";
	
	});			
	
	
	function closeActive() {
		
		$('.floatingBoxes').finish().fadeOut(500);
		$('.frameBoxes').finish().fadeOut(500);
		
		$('.floatingBoxes').delay(750).remove();
		$('.frameBoxes').delay(750).remove();		
		
		$('#' + openID).delay(2000).css({backgroundColor: '', color: '', padding: '', margin: '', width: '', height: '', position: 'relative', top: '', left: '', right: '', bottom: '', display: 'inline-block'});

		
		$('#holder').remove();
		
		
		for(var i=0; i<maxStuff; i++) {
			$('#' + i).delay(1500).finish().animate({opacity: 1}, 500, 'easeInOutCubic').delay(400).queue(function(etc) {
				$('#' + i).delay(2000).css({width: '5%', height: '5%', padding: '2%', margin: ''});
				
				$('.workflow-element').finish();
				
			});	
		}	

		$('#' + clickedID).find('.moduleName').fadeIn(500);
		
		$('#' + clickedID).css({position: '', backgroundColor: '#5e5e5e', color: 'white', width: '5%', padding: '', margin: '', height: ''});		
				
		
		if(currentHighlightMode == 'standard') standardHighlights();
		else enhancedHighlights();			



		open = 0;
		$('#slider').slider("value", 10);		
		
	}
	
	
	function enhancedHighlights() {
		
		for(var i=0; i<componentData.length; i++) {

			var theColour = '';
			var mrk = componentData[i].rawResult;
			
			if(mrk > 69) theColour = '#8C489F';
			else if(mrk > 67) theColour = '#b19cd9';
			else if(mrk > 59) theColour = '#336699';
			else if(mrk > 57) theColour = '#3399CC';
			else if(mrk > 49) theColour = '#097054';
			else if(mrk > 47) theColour = '#99CC99';
			else if(mrk > 39) theColour = '#FF6600';
			else if(mrk > 37) theColour = '#FF9900';
			else theColour = 'maroon';			
				
			$('#' + i).velocity({backgroundColor: theColour}, 500, 'easeInOutCubic');
		
		}		
		
	}
	
	
	function standardHighlights() {
		
		for(var i=0; i<componentData.length; i++) {

			var theColour = '';
			var mrk = componentData[i].rawResult;
			
			if(mrk > 39) theColour = 'rgba(0,0,0, 0.3)';
			else if(mrk > 36) theColour = 'rgba(255,165,0, 0.5)';
			else theColour = 'rgba(255,0,0,0.5)';
		
			$('#' + i).velocity({backgroundColor: theColour}, 500, 'easeInOutCubic');
		
		}
		
	}
	
	
	
	
	$(document).on("click", "#resetApprovedButton", function(){ 
		approvedData = [];
		$('.workflow-element').finish().velocity({opacity: 1}, 500, 'easeInOutCubic');
		
		if(currentHighlightMode == 'standard') standardHighlights();
		else enhancedHighlights();		
		
	});
	
	$(document).on("click", "#enhancedWorkflowButton", function(){ 

		
		if(currentHighlightMode == 'standard') {
			enhancedHighlights();
			currentHighlightMode = 'enhanced';
			document.getElementById('enhancedWorkflowButton').innerHTML = 'Enhanced Highlights';
		}
		else {
			standardHighlights();
			currentHighlightMode = 'standard';
			document.getElementById('enhancedWorkflowButton').innerHTML = 'Standard Highlights';			
		}
	});	
	
	
	$('#workflow-viewtoggle').click(function(evt) {
		for(var i=0; i<componentData.length; i++) {
			$('#' + i).css({"opacity": '', "width": '', "height": '', "margin": ''});	
		}	
	});
	

	var eventsElement = document.getElementById('workflow-view');
	
	var mc = new Hammer.Manager(eventsElement);
	var pinchRecogniser = new Hammer.Pinch();
	var rotateRecogniser = new Hammer.Rotate();
	var panRecogniser = new Hammer.Pan({direction: Hammer.DIRECTION_ALL, threshold: 0});

	pinchRecogniser.recognizeWith(rotateRecogniser);
	mc.add([pinchRecogniser, rotateRecogniser, panRecogniser]);

	var lastWidth = $('.workflow-element').width();
	
	var locked = false;
	
	var originalTouchAction = mc.touchAction;
	
	mc.on("pinch rotate", function(ev) {	
	
		//mc.touchAction = originalTouchAction;

		if(ev.scale > 1 && !locked) {
			
			$('.workflow-element').finish();	
			
				if($('#slider').slider("value") == 5) {
					$( "#slider" ).slider("value", 10);
				}			
		}
		else{

			if(!locked) {
				
			$('.workflow-element').finish();					
				
			if($('#slider').slider("value") == 10) {
				$( "#slider" ).slider("value", 5);
			}				
				
				
				
				
				
			}
		
		}
	
	


	});
	
	
	var hammerBody = new Hammer(document.body, {});
	
	
	
	hammerBody.on('swipeleft', function(ev) {
		
		//mc.touchAction = 'pan-y'; 
		//$('#workflow-view').css('touch-action', 'pan-y');
		
		$( "#filter-slider" ).slider("value", $('#filter-slider').slider("value") - (10 + ev.velocityX * 2) );
		
	});
	
	
	hammerBody.on('swiperight', function(ev) {

		$( "#filter-slider" ).slider("value", $('#filter-slider').slider("value") + (10 + Math.abs(ev.velocityX) * 2) );
		
	});
	
	
	
	  $(function() {

		$( "#slider" ).slider({
		velocity: "slow",
		max: 10,
		min: 5,
		step: 5,
		value: 10,
		change: function(event, ui) {
			
			locked = true;
			
			//$('.workflow-element').finish().animate({width: ui.value + '%', height: ui.value + '%' }, 1000, 'easeInOutCubic');
			
			if(ui.value == 10) {
				
				$('.workflow-studentsection').animate({borderWidth: 1, padding: '1%'}, 1000, 'easeInOutCubic');				
				$('.workflow-studentsection-detailsarea').animate({width: '30%', fontSize: '1em'}, 1000, 'easeInOutCubic');
				$('.workflow-element').animate({margin: '1%'}, 500, 'easeInOutCubic');				

				$('#workflow-view').velocity({paddingTop: "0%"}, 500, 'easeInOutCubic', function() {
					locked = false;
					
				});
			}
			else if(ui.value == 5) {
				
				$('.workflow-studentsection').animate({borderWidth: 0, padding: '2'}, 1000, 'easeInOutCubic');				
				$('.workflow-studentsection-detailsarea').animate({width: 0, fontSize: 0}, 1000, 'easeInOutCubic');
				$('.workflow-element').animate({margin: 0}, 500, 'easeInOutCubic');
				
				$('#workflow-view').finish().velocity({paddingTop: "0%"}, 700, 'easeInOutCubic', function() {
					locked = false;
					
				});				
			}
		}
		});

	  });
	  
	  
	
	  $(function() {
	  
		$( "#filter-slider" ).slider({
		velocity: "slow",
		max: 100,
		min: 0,
		step: 1,
		value: 100,
		change: function(event, ui) {
			
			locked = true;
	
			for(var i=0; i<maxStuff; i++) {
				
				//if(componentData[i].rawResult > ui.value) $('#' + i).finish().fadeOut(500);
				//else $('#' + i).finish().fadeIn(500);

				if(  parseInt($('#' + i).find('.moduleName').html()) > ui.value ) {
					//alert("Hi");
					$('#' + i).finish().animate({opacity: 0}, 500, 'easeInOutCubic');
					
				}
				else {
					 //alert("No");
					 $('#' + i).finish().animate({opacity: 1}, 500, 'easeInOutCubic');
					
				}
				
			}	
			
			document.getElementById('filtertext').innerHTML = "Filter Threshold : " + ui.value + "%";
			
			locked = false;
			
		}
		});

	  });	
	  
	  


}