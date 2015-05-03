var open = 0;
var openID = 0;

var originalSliderVal = 0;

var dataTracker = [];

var approvedData = [];

var currentHighlightMode = 'standard';

function prepareWorkflow(markData, mode) {

	dataTracker = markData;

	for(var i=0; i<markData.length; i++) {
	
		var elem = document.getElementById('workflow-view');
	
		var boxType = '';
		
		var idMode;
		var bigIndication;
		if(mode == 'allstudents') {
			idMode = markData[i]._id;
			bigIndication = markData[i]._id;
		}
		else {
			idMode = markData[i].studentID;
			bigIndication = markData[i].rawResult;
		}

		// Set variables of each block:
		var avgExamSquare = "<div class='insightSquare staticSquare' id='avgExam" + idMode +"' style='display: none; color: black; pointer-events: none; background: white; margin-top: 6%'>?</div>";		
		var failedExamSquare = "<div class='insightSquare staticSquare' id='failedExam" + idMode +"' style='display: none; color: black; pointer-events: none; background: white; margin-top: 6%'>?</div>";
		var insightLabels = "<div style='clear: both;'></div><div class='insightLabel' style='display: none; pointer-events: none;'>Avg. Comps.</div><div class='insightLabel' style='display: none'>Failed Comps.</div>";
		var workMarkHTML = "<span id='mainMark" + idMode + "' class='workMark' style='display: none; pointer-events: none;'>" + bigIndication +"</span>";
		var nameHTML = "<div class='studentName' style='display: none; margin-top: 1%; pointer-events: none;' id='name"+ idMode +"'></div>";
		
		var moduleNameHTML = "";
		
		if(mode == 'student') {
			moduleNameHTML = "<div class='soloView studentName' style='pointer-events:none;'>" + markData[i].moduleName + "</div>" + "<span class='soloView workMark' style=' pointer-events: none;'>" + markData[i].rawResult +"</span>" + "<div class='soloView studentName' style='pointer-events:none;'>" + markData[i].type + "</div>";
		}
		
		
		var workflowHTML = "<a data-studentid='" + markData[i].studentID +"' data-studentname=''  class='workflow-element " + boxType + "' id='" + i +"'>" + workMarkHTML + nameHTML + moduleNameHTML + avgExamSquare + failedExamSquare + insightLabels + "</a>";		

		
		// Get student Name if component only:
		//if(mode != 'student' && mode != 'allstudents') {
			
		if(mode == 'allstudents') socket.emit('studentRequest', markData[i]._id);
		else socket.emit('studentRequest', markData[i].studentID);
			
			socket.on('studentResponse', function(data) {	
				document.getElementById("name" + data.originalid).innerHTML = data.name;
				document.getElementById("name" + data.originalid).dataset.studentname = data.name;		
				
				var avgModuleSum = 0;
				var avgModuleCount = 0;
				var failedModuleCount = 0;
				
				for(var j=0; j<data.marks.length; j++) {
					
					if(data.marks[j].rawResult < 40) {
						failedModuleCount++;
					}
					
					avgModuleSum += data.marks[j].rawResult;
					avgModuleCount++;
				}
				
				
				document.getElementById("avgExam" + data.originalid).innerHTML = (avgModuleSum / avgModuleCount).toFixed(1);
				document.getElementById("failedExam" + data.originalid).innerHTML = failedModuleCount;
				
				if(mode == 'allstudents') {
					// Only if all students view:
					document.getElementById("mainMark" + data.originalid).innerHTML = (avgModuleSum / avgModuleCount).toFixed(1);
					markData[i].rawResult = (avgModuleSum / avgModuleCount).toFixed(1);
				}
					
			});
		
		//}
		
		

		elem.innerHTML += workflowHTML;			

		
	}
	
	
	// Mode Switching:
	var initialWidthHeight = '5%';
	
	if(mode == 'student') {
		$('.workflow-element').css({width: '18%', height: '18%', display: 'inline-block'});
		initialWidthHeight = '20%';
		$('.workflow-element').animate({opacity: '1', width: initialWidthHeight, height: initialWidthHeight}, 800, 'easeInOutCubic');
		originalSliderVal = 20;
		$('#workflow-view').animate({paddingTop: "20%"}, 500, 'easeInOutCubic');		
		$('.workMark').animate({fontSize: 70}, 500, 'easeInOutCubic', function() {
			
			standardHighlights();
			
		});
	}
	else {
	$('.workflow-element').animate({opacity: '1', width: initialWidthHeight, height: initialWidthHeight}, 800, 'easeInOutCubic', function() {
		
		standardHighlights();
		
	}).css("display","inline-block");		
		
	}
	
	

	
	
	
	$('.workflow-element').click(function(evt) {
	
		if(open == 0 && !locked) {
			
			$('#studentFrameBox').finish().remove();
			$('#floatingBox').finish().remove();
			
			if(isNaN(evt.target.id)) return;
			
			
			// Hide existing UI:
			$('.workMark').finish().fadeOut(300);
			$('.studentName').fadeOut(300);
			$('.insightSquare').fadeOut(300);
			$('.insightLabel').fadeOut(300);				
	
			var pos = $('#' + evt.target.id).position();
			$('#' + evt.target.id).clone().attr('id', 'holder').insertAfter("#" + evt.target.id);
			$('#' + evt.target.id).css({position: 'absolute', top: pos.top + $('#workflow-view').scrollTop(), left: pos.left, right: pos.right, bottom: pos.bottom});
		
			for(var i=0; i<markData.length; i++) {
		
				if(i != evt.target.id) {
					$('#' + i).finish().animate({opacity: 0}, 400, 'easeInOutCubic').delay(400).queue(function(etc) {
					$('#' + i).css({width: '0%', height: '0%', padding: '0', margin: '0'});
					});
				}
			}
		
			$('#' + evt.target.id).finish().animate({width: '100%', height: '100%', left: 0, top: $('#workflow-view').scrollTop(), backgroundColor: 'transparent', color: 'black', border: 'solid 0px #ccc'}, 700, 'easeInOutCubic');
			$('#holder').animate({opacity: 0}, 0, 'easeInOutCubic');
			
			
			if(mode == 'student') {
				
				//window.location = "https://www.google.co.uk";
				
				setTimeout(function() {
					window.location = "/component/" + markData[evt.target.id].componentID + "/scatter";
				}, 500);
				
				return;
			}
			
			if(mode == 'allstudents') {
				
				setTimeout(function() {
					window.location = "/student/" + markData[evt.target.id]._id + "/workflow";
				}, 500);
				
				return;				
				
			}
			
			
			var theElement = document.getElementById(evt.target.id);
			
			var sentID = theElement.dataset.studentid; 
			socket.emit('studentRequest', theElement.dataset.studentid);
			
			
			
			socket.on('studentResponse', function(data) {	
			
				// Disregard previous socket responses:
				if(data.originalid != sentID) return;
				
				// Set up HTML to inject:
				var studentFrame = "<iframe id='studentFrameBox' style='opacity: 0; width: 100%; height: 100%; border: none;' src='/student/" + data.originalid + "/fullview'></iframe>";
				var floatingBox = "<div id='floatingBox'><a id='approveButton' href='#' class='insightButton miniButton'>Approve</a><a id='backButton' href='#' class='insightButton miniButton'>Back</a>     <a id='mini-ringButton' href='#' class='insightButton miniButton'>ring</a>    <a id='mini-workflowButton' href='#' class='insightButton miniButton'>flow</a>    </div>";
				
				// Add new UI Namespaces with animation:
				$('#' + evt.target.id).delay(000).append(studentFrame + floatingBox);
				$('#studentFrameBox').delay(200).animate({opacity: 1}, 500, 'easeInOutCubic');	
				//$('#studentFrameBox').delay(1000).css({display: 'inline-block'});				
				$('#floatingBox').delay(1000).fadeIn(500);		

				//$('#holder').finish().remove();
			});

			open = 1;
			openID = evt.target.id;
			originalSliderVal = $('#slider').slider("value");
			
		}

	});
	
	
	$(document).on("click", "#approveButton", function(){ 
		
		
		
		closeActive();
		
		// Do hiding here...
		
		// Get the original block clicked... openID!!!!
		
		//$('#' + openID).finish().delay(1000).animate({opacity: 0.4}, 1000, 'easeInOutCubic');

		approvedData.push(openID);			
		
		
		for(var i=0; i<approvedData.length; i++) {
			$('#' + approvedData[i]).finish().animate({opacity: 0.1}, 1000, 'easeInOutCubic');	
		}		
		
	
	
	});
	
	$(document).on("click", "#backButton", function(){ 
		
		closeActive();
	
	});	
	
	$(document).on("click", "#mini-ringButton", function(){ 
		
		window.location = "/student/" + markData[openID].studentID;
	
	});		
	
	$(document).on("click", "#mini-workflowButton", function(){ 
		
		window.location = "/student/" + markData[openID].studentID + "/workflow/";
	
	});			
	
	
	function closeActive() {
		
		$('#floatingBox').fadeOut(500);
		$('#studentFrameBox').fadeOut(500);
		
		$('#studentFrameBox').delay(750).remove();
		$('#floatingBox').delay(750).remove();		
		
		$('#' + openID).delay(2000).css({backgroundColor: '', color: '', padding: '', margin: '', width: originalSliderVal + "%", height: originalSliderVal + "%", position: 'relative', top: '', left: '', right: '', bottom: '', display: 'inline-block'});

		$('#holder').remove();
		
		
		
		for(var i=0; i<markData.length; i++) {
			$('#' + i).delay(1500).finish().animate({opacity: 1}, 500, 'easeInOutCubic').delay(400).queue(function(etc) {
				$('#' + i).delay(2000).css({width: '5%', height: '5%', padding: '2%', margin: ''});
				
				$('.workflow-element').finish();
			});	
		}	

		
		if(currentHighlightMode == 'standard') standardHighlights();
		else enhancedHighlights();			
		
		open = 0;
		$('#slider').slider("value", originalSliderVal);		
		
	}
	
	
	function enhancedHighlights() {
		
		for(var i=0; i<markData.length; i++) {

			var theColour = '';
			var mrk = markData[i].rawResult;
			
			if(mrk > 69) theColour = '#8C489F';
			else if(mrk > 67) theColour = '#b19cd9';
			else if(mrk > 59) theColour = '#336699';
			else if(mrk > 57) theColour = '#3399CC';
			else if(mrk > 49) theColour = '#097054';
			else if(mrk > 47) theColour = '#99CC99';
			else if(mrk > 39) theColour = '#FF6600';
			else if(mrk > 37) theColour = '#FF9900';
			else theColour = 'maroon';			
				
			$('#' + i).animate({backgroundColor: theColour}, 500, 'easeInOutCubic');
		
		}		
		
	}
	
	
	function standardHighlights() {
		
		for(var i=0; i<markData.length; i++) {

			var theColour = '';
			var mrk = markData[i].rawResult;
			
			if(mrk > 39) theColour = 'rgba(0,0,0, 0.3)';
			else if(mrk > 36) theColour = 'rgba(255,165,0, 0.5)';
			else theColour = 'rgba(255,0,0,0.5)';
		
			$('#' + i).animate({backgroundColor: theColour}, 500, 'easeInOutCubic');
		
		}
		
	}
	
	
	
	
	$(document).on("click", "#resetApprovedButton", function(){ 
		approvedData = [];
		$('.workflow-element').finish().animate({opacity: 1}, 500, 'easeInOutCubic');
		
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
		for(var i=0; i<markData.length; i++) {
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
					$( "#slider" ).slider("value", 15);
				}
				else if($('#slider').slider("value") == 20) {
					$( "#slider" ).slider("value", 35);
				}				
			
		}
		else{

			if(!locked) {
				
			$('.workflow-element').finish();					
				
			if($('#slider').slider("value") == 35) {
				$( "#slider" ).slider("value", 20);

			}
			else if($('#slider').slider("value") == 20) {
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
		animate: "slow",
		max: 35,
		min: 5,
		step: 15,
		value: 5,
		change: function(event, ui) {
			
			locked = true;
			
			if(mode == 'student') return;
			
			//if(locked) $('.workflow-element').delay(500).finish();
			
			$('.workflow-element').animate({width: ui.value + '%', height: ui.value + '%'}, 1000, 'easeInOutCubic');
			
			if(ui.value == 5) {
				$('.workMark').stop().animate({fontSize: ''}, 500, 'easeInOutCubic');
				$('.workMark').fadeOut(1000);
				$('.studentName').fadeOut(1000);
				
				$('.insightSquare').fadeOut(500);
				$('.insightLabel').fadeOut(500);	
				
				$('#workflow-view').animate({paddingTop: "23%"}, 500, 'easeInOutCubic', function() {
					locked = false;
					
				});
			}
			else if(ui.value == 20) {
				
				
				if(mode == 'student') {
						// Do stuff and return;
					
					$('.soloView').fadeIn(500);

				}
				
				$('.workMark').stop().delay(500).fadeIn(500);
				$('.workMark').animate({fontSize: 70}, 500, 'easeInOutCubic');
				$('.studentName').delay(500).fadeIn(500);

				$('.insightSquare').fadeOut(500);
				$('.insightLabel').fadeOut(500);				
				
				$('#workflow-view').animate({paddingTop: "15%"}, 500, 'easeInOutCubic', function() {
					locked = false;
					
				});				
			}
			else if(ui.value == 35) {
				$('.workMark').stop().delay(500).fadeIn(500);
				$('.workMark').animate({fontSize: 70}, 500, 'easeInOutCubic');
				$('.studentName').delay(500).fadeIn(500);
				$('.insightSquare').delay(500).fadeIn(500);
				$('.insightLabel').delay(500).fadeIn(500);
				
				$('#workflow-view').animate({paddingTop: ''}, 500, 'easeInOutCubic', function() {
					locked = false;
					
				});					
			}
			
		}
		});

	  });
	  
	  
	
	  $(function() {

		$( "#filter-slider" ).slider({
		animate: "slow",
		max: 100,
		min: 0,
		step: 1,
		value: 100,
		change: function(event, ui) {
			
			locked = true;
	
			for(var i=0; i<markData.length; i++) {
				
				if(markData[i].rawResult > ui.value) $('#' + i).finish().fadeOut(500);
				else $('#' + i).finish().fadeIn(500);
			}	
			
			document.getElementById('filtertext').innerHTML = "Filter Threshold : " + ui.value + "%";
			
			locked = false;
			
		}
		});

	  });	
	  
	  


}