function prepareWorkflow(moduleData, mode) {
	var closedComponents = [];
	var allElements = [];
	for(var i=0; i<moduleData.length; i++) {
		
		// Populate with information:
		if(mode != 'All Modules') {
			if(mode == 'Student') {
				var bigIndication = moduleData[i].rawResult;
				var littleName = moduleData[i].moduleName;
				var id = moduleData[i]._id;
			}
			else {
				var bigIndication = moduleData[i].type;
				var littleName = moduleData[i].title + " / " + moduleData[i].startYear;
				var id = moduleData[i]._id;				
			}
		} 
		else {
			var bigIndication = moduleData[i].code;
			var littleName = moduleData[i].name;
			var id = i;
		}
		
		// Dim block if component is closed:
		if(moduleData[i].open == 1 || mode == 'All Modules' || mode == 'Student') var bgColour = '#5e5e5e';
		else var bgColour = '#cccccc';
		
		var workMarkHTML = "<div id='mainMark" + id + "' class='workMark' style=' pointer-events: none;'>" + bigIndication +"</div>";
		var peekHTML = "<div class='insightSquare' style='display: none; background: pointer-events: none; white; color: #5e5e5e; text-align: center; width: auto; height: auto; padding: 10%; font-size: 30px;' id='peek"+ id +"'>" + "15" + "</div>";
		var nameHTML = "<div class='studentName' id='studentName" + id + "' style='margin-top: 1%; pointer-events: none;'>"+ littleName +"</div>";
		var workflowHTML = "<a class='workflow-element' oncontextmenu='return false' style='background-color: " + bgColour + ";' id='"+ (id) + "'>" + workMarkHTML + nameHTML + peekHTML + "</a>";		
		
		// Add to all elements for later:
		allElements.push(id);
		
		// Add to view or save for later if closed:
		if(moduleData[i].open == '1' || mode == 'All Modules') document.getElementById('workflow-view').innerHTML += workflowHTML;
		else closedComponents.push(workflowHTML);
	}
	
	// Add any closed components separately:
	if(closedComponents.length > 0) {
		document.getElementById('workflow-view').innerHTML += '<div style="clear: both;"></div>';
		for(var i=0; i<closedComponents.length; i++) {
			document.getElementById('workflow-view').innerHTML += closedComponents[i];
		}
	}
	
	var initialWidthHeight = '20%';
	$('.workflow-element').css({width: '18%', height: '18%', display: 'inline-block'});
	$('.workflow-element').animate({opacity: '1', width: initialWidthHeight, height: initialWidthHeight}, 800, 'easeInOutCubic');
	$('#workflow-view').animate({paddingTop: '15%'}, 500, 'easeInOutCubic');		
	$('.workMark').animate({fontSize: 70}, 500, 'easeInOutCubic');

	$('.workflow-element').click(function(evt) {
		if(isNaN(evt.target.id) || locked) return;
		$('.workMark').finish().fadeOut(300);
		$('.studentName').fadeOut(300);			
		var pos = $('#' + evt.target.id).position();
		$('#' + evt.target.id).clone().attr('id', 'holder').insertAfter("#" + evt.target.id);
		$('#' + evt.target.id).css({position: 'absolute', top: pos.top + $('#workflow-view').scrollTop(), left: pos.left, right: pos.right, bottom: pos.bottom});
	
		for(var i=0; i<allElements.length; i++) {
			if(i != evt.target.id) {
				$('#' + i).finish().animate({opacity: 0}, 400, 'easeInOutCubic').delay(400).queue(function(etc) {
					$('#' + i).css({width: '0%', height: '0%', padding: '0', margin: '0'});
				});
			}
		}

		$('#' + evt.target.id).finish().animate({width: '100%', height: '100%', left: 0, top: $('#workflow-view').scrollTop(), backgroundColor: 'transparent', color: 'black', border: 'solid 0px #ccc'}, 500, 'easeInOutCubic');
		$('#holder').animate({opacity: 0}, 0, 'easeInOutCubic');
		
		if(mode != 'All Modules') setTimeout(function() { window.location = "/component/" + ( parseInt(evt.target.id)); }, 400);
		else setTimeout(function() { window.location = "/module/" + ( parseInt(evt.target.id)+1); }, 400);
		
	});	
	
	var eventsElement = document.getElementById('workflow-view');
	var mc = new Hammer.Manager(eventsElement);
	var pinchRecogniser = new Hammer.Pinch();
	var rotateRecogniser = new Hammer.Rotate();
	var panRecogniser = new Hammer.Pan({direction: Hammer.DIRECTION_ALL, threshold: 0});
	var pressRecogniser = new Hammer.Press();
	pinchRecogniser.recognizeWith(rotateRecogniser);
	mc.add([pinchRecogniser, rotateRecogniser, panRecogniser, pressRecogniser]);
	var lastWidth = $('.workflow-element').width();
	var locked = false;
	var originalTouchAction = mc.touchAction;
	
	mc.on("pinch rotate", function(ev) {	
		if(ev.scale > 1 && !locked) {
			$('.workflow-element').finish();	
			if($('#slider').slider("value") == 5) $( "#slider" ).slider("value", 15);
			else if($('#slider').slider("value") == 20) $( "#slider" ).slider("value", 35);				
		}
		else{
			if(locked) return;
			$('.workflow-element').finish();					
			if($('#slider').slider("value") == 35) $( "#slider" ).slider("value", 20);
			else if($('#slider').slider("value") == 20) $( "#slider" ).slider("value", 5);			
		}
	});
	
	var pressedID;
	var pressedName;
	
	$('.workflow-element').hammer({}).bind("press", function(evt) {
		if( $('#slider').slider("value") < 20) return;
		pressedID = this.id;
		pressedName = $('#studentName' + this.id).html();	
		$('#mainMark' + this.id).fadeOut(150);
		$('#peek' + this.id).finish().delay(150).fadeIn(150);
		$('#studentName' + this.id).delay(300).html("Students Sat");		
	});
	
	$('#workflow-view').hammer({}).bind("pressup", function(evt) {	
		$('#peek' + pressedID).fadeOut(500);
		$('#mainMark' + pressedID).delay(500).fadeIn(500);
		$('#studentName' + pressedID).delay(1000).html(pressedName);		
	});
	
	$(function() {
		$( "#slider" ).slider({
			animate: "slow",
			max: 20,
			min: 5,
			step: 15,
			value: 20,
			change: function(event, ui) {
				locked = true;
				$('.workflow-element').animate({width: ui.value + '%', height: ui.value + '%'}, 1000, 'easeInOutCubic');
				if(ui.value == 5) {
					$('.workMark').stop().animate({fontSize: '16'}, 1000, 'easeInOutCubic');
					$('.studentName').fadeOut(1000);
					$('#workflow-view').animate({paddingTop: "23%"}, 500, 'easeInOutCubic', function() {
						locked = false;
					});
				}
				else if(ui.value == 20) {
					$('.workMark').stop().fadeIn(500);
					$('.workMark').animate({fontSize: 70}, 1000, 'easeInOutCubic');
					$('.studentName').delay(500).fadeIn(500);		
					$('#workflow-view').animate({paddingTop: "15%"}, 500, 'easeInOutCubic', function() {
						locked = false;
					});				
				}
			}
		});
	  });
	  
	  $(function() { $( "#filter-slider" ).slider({ animate: "slow", max: 100, min: 0, step: 1, value: 100, disabled: true }); });	
}