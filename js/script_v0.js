var allData;

var courseN, teacherN, courseT, courseNum;
var studentsHolder;
var defaultEvals=[];

var el, evaluateList;
var name, pw;
var evalScores, evalScoreLists=[];


////////////////////////////////////////////////

init();
animate();

function init () {

	// Get html elements
		courseN = byId("course_name");
		teacherN = byId("teacher_name");
		courseT = byId("time_space");
		courseNum = byId("course_number");
		studentsHolder = byId("studentHolder");
		
		// get all the eval ranking of all the students
		evalScores = byClass("eval_scores");

	// VEX_DIALOG
	// For instructors to LogIn (TO-DO)
		vex.defaultOptions.className = 'vex-theme-wireframe';
		vex.dialog.open({
			message: "Enter your netId and password:",
			input: "<input name=\"netId\" type=\"text\" placeholder=\"netId\" required />\n<input name=\"password\" type=\"password\" placeholder=\"Password\" required />",
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: "Login"
				}),
				$.extend({}, vex.dialog.buttons.NO, {
					text: "Back"
				})
			],
			callback: function(data) {
				if(data===false){
					vex.dialog.alert("See you next time.");
					return;
				}
				vex.dialog.alert("Good morning teacher " + data.netId + ".");
			}
		});

	// SORTABLE_DRAGGING
	// The ranking things at the top of the page
		el = document.getElementById('eval_items');

		// Create Sortable object at the TOP
		evaluateList = Sortable.create(el, {
			animation: 150,
			filter: '.js-remove',
			onFilter: function(evt){
				evt.item.parentNode.removeChild(evt.item);
			}
			// onUpdate: function (evt){
			// 	var item = evt.item; // the current dragged HTMLElement
			// 	console.log(item);
			// }
		});

		// ADD button
		// Adding new element for ranking
		byId('add_skill').onclick = function() {
			var s_el = document.createElement('li');			// Get all the TOP elements
			var s_el_simple = document.createElement('li');		// Get all the students' elements

			vex.dialog.prompt({
				message: "Skill to add to evaluate:",
				placeholder: "Weirdness",
				callback: function(value){
					if(!value) {
						return;
					}
					s_el.innerHTML = value + '<i class="js-remove">X</i>';
					evaluateList.el.appendChild(s_el);
					//
					// s_el_simple.innerHTML = value;
					// for(var i=0; i<evalScores.length; i++){
					// 	evalScores[i].appendChild(s_el_simple);
					// }
				}
			});
			// s_el.innerHTML = 
		}

		// UPDATE button
		// If clicked, all the students' elements will be updated as same as the TOP one
		byId('update_skill').onclick = function() {

			// Alert to ask for confirmation before update, and wipe out the ranking history (if any)
			vex.dialog.confirm({
				message: 'This will reset the scaling history. Are you absolutely sure to do this?',
				callback: function(value) {
					// If No then do nothing
					if(!value) {
						return;
					}
					else{
						// Get the evaluation element object at the TOP
						var currentEval = evaluateList.el.getElementsByTagName("li");

						// Delete the eval ranking of all the students
						for(var i=0; i<evalScores.length; i++){
							while (evalScores[i].firstChild) 
								evalScores[i].removeChild(evalScores[i].firstChild);
						}

						// For each evaluation element at TOP
						for(var i=0; i<currentEval.length; i++){

							// Get the text of the element, eg Fabrication
							var tmpL = currentEval[i].innerHTML;
							var tmpCut = tmpL.split("<");

							// For each student, recreate the evaluation element
							// v1
							// for(var j=0; j<evalScores.length; j++){
								// var s_el_simple = document.createElement('li');
								// s_el_simple.innerHTML = tmpCut[0];
								// evalScores[j].appendChild(s_el_simple);					
							// }

							// v2
							// var $eLi = $("<li>").text(tmpCut[0]).appendTo($('.eval_scores'));

							// var $eSpan = $("<span>",{
							// 	class: "star-rating"
							// }).appendTo($eLi);

							// for(var j=0; j<5; j++){
							// 	$("<input>", {
							// 		type: "radio",
							// 		name: tmpCut[0]+"Rating",
							// 		value: j+1
							// 	}).appendTo($eSpan);
							// }

							// v3
							// For every Div with className "eval_scores"
							// --> For every students' rankings
							$('.eval_scores').each(function(index){

								// Create li element, and assign text, eg Fabrication
								// Then append to the Div
								var $eLi = $("<li>").text(tmpCut[0]);
								$(this).append($eLi);

								// Create span element, to restore all the ranking inputs
								// Then append to li
								var $eSpan = $("<span>",{
									class: "star-rating"
								}).appendTo($eLi);

								if(index!=0){	// if it's not Laura(fake) / from JSON

									// To create FIVE ranking dots for each element
									for(var j=0; j<5; j++){
										// Create input element
										// And assign specific name, eg Laura+Fabrication+Rating, so FIVE dots are in a group
										$("<input>", {
											type: "radio",
											name: allData[index-1].firstname+tmpCut[0]+"Rating",
											value: j+1
										}).appendTo($eSpan);
									}
								} else {		// if it's Laura(fake)
									for(var j=0; j<5; j++){
										$("<input>", {
											type: "radio",
											name: "Laura Juo-Hsin"+tmpCut[0]+"Rating",
											value: j+1
										}).appendTo($eSpan);
									}
								}
							});
						}
					}
				}
			});	
		}

	// Get all the default eval ranking elements, from the Sortable object at the TOP
	var defaultEval = evaluateList.el.getElementsByTagName("li");

	// Get all the names of the default eval ranking elements
	for(var i=0; i<defaultEval.length; i++){
		var tmpL = defaultEval[i].innerHTML;
		var tmpCut = tmpL.split("<");
		defaultEvals.push(tmpCut[0]);
	}

	// read JSON
	$.getJSON("data/section.json", function(data){
		allData = data;
		// console.log(data[0]);

		courseN.innerHTML += data[0].title;
		teacherN.innerHTML += data[0].title;
		courseT.innerHTML += (data[0].semester + " " + data[0].year);
		courseNum.innerHTML += data[0].course_number;

		// For each student
		$.each(data, function(key, val){

			// Create a div to contain everything of this student
			var studentRow = document.createElement('div');
			studentRow.className = "row";
			studentRow.id = val.firstname;

			// Create div for student name & image
			// As Grid by specific className to use in CSS
			// Then append to studentRow (Main div)
			var $sdiv_1 = $("<div/>", {
				class: "col-xs-6 col-lg-4"
			}).appendTo(studentRow);

			// Create h4 for showing the student name
			// Then append to sdiv_1 (Grid div)
			$("<h4></h4>").text(val.firstname + ", " + val.lastname).appendTo($sdiv_1);

			// Create img for showing the student image
			// Then append to sdiv_1 (Grid div)
			var $img = $("<img>", {
				src: "https://itp.nyu.edu/image.php?image=/people_pics/itppics/" + val.netid + ".jpg",
				class: "img-responsive",
				height: 300
			}).appendTo($sdiv_1);

			// Create div as Grid, by specific className to use in CSS
			// Then append to sdiv_1 (Grid div)
			var $sdiv_2 = $("<div/>", {
				class: "col-xs-12 col-sm-6 col-lg-8 eval_scores"
			}).appendTo(studentRow);

			// For each eval element, create ranking dots
			for(var i=0; i<defaultEvals.length; i++){

				// Create li element, and assign text, eg Fabrication
				// Then append to the Div
				var $eLi = $("<li>").text(defaultEvals[i]).appendTo($sdiv_2);

				// Create span element, to restore all the ranking inputs
				// Then append to li
				var $eSpan = $("<span>",{
					class: "star-rating"
				}).appendTo($eLi);

				// To create FIVE ranking dots for each element
				// Create input element
				// And assign specific name, eg Laura+Fabrication+Rating, so FIVE dots are in a group
				for(var j=0; j<5; j++){
					$("<input>", {
						type: "radio",
						name: val.firstname+defaultEvals[i]+"Rating",
						value: j+1
					}).appendTo($eSpan);
				}
			}

			// Create div for text input
			// Then append to studentRow
			var $sdiv_3 = $("<div/>", {
				class: "col-xs-12 col-sm-6 col-lg-8 eval_text"
			}).appendTo(studentRow);

			// Create textarea element
			var $text = $("<textarea>",{
				id: val.firstname+"TextMiddle",
				placeholder: "General feedback and opportunities to " + val.firstname + ".",
				width: "80%",
				height: "5em"
			}).appendTo($sdiv_3);

			// Append studentRow (of each student), to studentsHolder (for all student)
			studentsHolder.appendChild(studentRow);
		});
	});
		
}

function animate() {
	requestAnimationFrame(animate);
	update();
}

function update() {

}

function byId(_id) {
	return document.getElementById(_id);
}

function byClass(_class) {
	return document.getElementsByClassName(_class);
}