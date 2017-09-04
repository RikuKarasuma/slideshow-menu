/*
 *  Small Slide Show web application that retrieves JSON Project Information 
 *  from Server. Parses it. Then builds a categorical menu and subsequent sub 
 *  menus all based upon tags relevant to each Project. 
 *  
 *  Designed for Desktop and Mobile devices. Optimised for Chrome, Opera, 
 *  Firefox, Edge and Mobile versions. IE is unsupported.   
 *  
 *  @author Owen McMonagle.
 *  @version 0.3 
 */



// ******************************* Global components Begin *********************************************
const OPACITY_INCREMENT = 0.1;
const OPACITY_MULTIPLIER = 100;
const ITEM_CLASS_ACTIVE = "active";
// Selected Portfolio Items.
let selectedElements = [];
// Selected project name.
let selectedName = "";
// JSON portfolio data.
let data = null;
// Transitioning flag.
let transitioning = false;

// ******************************* Script start up Begin ***********************************************

//Build menus as soon as page load.
window.addEventListener('load', requestPortfolioJSON(), false);

//******************************* Script start up End **************************************************


// ******************************* Fade/Slide in / out Components Begin ********************************

/**
 * Begins the fade out, slide in, fade in transition.
 * Designed to take Arrays so the same timer are used for all elements.
 * This effectively saves us a ton of optimisation.
 * @param elements - HTML elements to animate.
 * @param data - Data to inject into the HTML element.
 * @param width_limits - Width limits of elements in order to calculate roll 
 * out speed.
 */
function beginFadeTransition(elements, data, width_limits) 
{
	// Set Animation transitioning.
	transitioning = true;
	// Initial fade interval
	const fade_interval = 40;
	const opacity_limit = 0.1;
	let op = 1;  // initial opacity
	let finished = false;
	let timer = setInterval(function () 
	{
		// Iterate over each element to fade out...
		for( let i = 0; i < elements.length; i ++)
		{		
			// Once opacity hits fade out limit..
			if (op <= opacity_limit)
			{
				elements[i].style.display = 'none';
				elements[i].innerHTML = "";
				finished = true;
			}
			elements[i].style.opacity = op;
			elements[i].style.filter = 'alpha(opacity=' + op * OPACITY_MULTIPLIER + ")";
		}
		// Decrease opacity.
		op -= op * OPACITY_INCREMENT;
		
		// If elements finished...
		if(finished)
		{
			// Turn off timer.
			clearInterval(timer);
			// Is mobile device...
			if(isMobileDevice())
				// Use Unfade animation instead.
				mobileUnfade(elements, data);
			else
				// Use normal animation.
				rollOutAndUnfade(elements, width_limits, data);
		}
	}, fade_interval);
}

/**
 * Handles the sliding out and unfading transition of HTML elements.
 * At the end the Data is injected into these elements.
 * <br><br>
 * Can handle each parameter as an array provided they have
 * respective corresponding parameters.
 * <br>
 * Handles each element with the same timer, iteratively.
 * @param elements - HTML elements to roll out and unfade.
 * @param width_limits - Width limits of elements in order to calculate roll 
 * out speed.
 * @param data - Data to inject into the HTML element.
 */
function rollOutAndUnfade(elements, width_limits, data)
{
	// Set up opacity and width variables.
	const opacity_limit = 1, interval_length = getIntervalTime();
	let initial_width = 1, op = 0.1;
	let widths = [];
	let interval_index = 0;
	// Display element.
	let timer = setInterval(function () 
	{
		// Flag which lets us know when the elements are 
		// finished expanding.
		let finished = true;
		// Increment through elements...
		for( let i = 0; i < elements.length; i ++)
			// If limits are reached...
			if(widths[i] > width_limits[i])
				setWidth(elements[i], width_limits[i]);
			else
			{
				// Width increments.
				// If width is null...
				if(widths[i] == null)
					widths[i] = initial_width;
				// Set new increment.
				setWidth(elements[i], widths[i]);
				// Increment variable for next loop.
				widths[i] += (width_limits[i]/interval_length);
				// Opacity increments.
				elements[i].style.opacity = op;
				// Data Injection arguments
				if(interval_index == 0)
				{
					injectData(elements[i], data[i]);
					elements[i].style.display = 'block';
				}
				// If get to end we're not finished.
				finished = false;
			}
		// Opacity increments...
		op += OPACITY_INCREMENT;
		// If width or opacity limits of all objects are reached...
		if(finished)
		{
			// End timer.
			clearInterval(timer);
			// Signal end of transitioning.
			transitioning = false;
			// Display showcase link.
			displayShowcaseMsg();
		}
		interval_index ++;
	}, interval_length);
}

/**
 * A better transition animation for mobile devices. Only unfades instead 
 * of rolling out the width.
 * <br><br>
 * Can handle each parameter as an array provided they have
 * respective corresponding parameters.
 * <br>
 * @param elements - HTML elements to unfade.
 * @param data - Data to inject into the HTML element.
 */
function mobileUnfade(elements, data)
{
	// Set up opacity and interval variables.
	const opacity_limit = 1, interval_length = getIntervalTime();
	let op = 0.1;
	let interval_index = 0;
	// Display element.
	let timer = setInterval(function () 
	{
		// Flag which lets us know when the elements are 
		// finished expanding.
		let finished = true;
		// Increment through elements...
		for( let i = 0; i < elements.length; i ++)
			if(op <= 1)
			{
				// Opacity increments.
				elements[i].style.opacity = op;
				// Data Injection arguments
				if(interval_index == 0)
				{
					injectData(elements[i], data[i]);
					elements[i].style.display = 'block';
				}
				// If get to end we're not finished.
				finished = false;
			}
		// Opacity increments...
		op += OPACITY_INCREMENT/2;
		// If width or opacity limits of all objects are reached...
		if(finished)
		{
			// End timer.
			clearInterval(timer);
			// Signal end of transitioning.
			transitioning = false;
			// Display showcase link.
			displayShowcaseMsg();
		}
		interval_index ++;
	}, interval_length);
}

/**
 * Retrieves interval time. The time varies depending on whether the user 
 * is a mobile or desktop device. If desktop device, time varies between 
 * Firefox and the others remain the same.
 * <pre>
 * 	Mobile: 50ms. For fade/unfade.
 * 	Desktop: 10ms. For Chrome, Opera etc fade, slide and unfade.
 * 	Firefox: 35ms. For slide and unfade.
 * </pre>
 * 
 * @returns Interval time for Slideshow animation.
 */
function getIntervalTime()
{
	// Verify if user is mobile device...
	if(!isMobileDevice())
	{
		// if not check if the browser is Firefox...
		// if user is firefox, increase interval time
		// If other browser leave as default.
		return ((navigator.userAgent.search("Firefox") > -1) ? 35 : 10);
	}
	else
		// if mobile device, set unfade interval.
		return 50;
}

/**
 * Sets the width of a HTML element.
 * @param element - Element to set width of.
 * @param width - New width of element.
 */
function setWidth(element, width)
{
	element.style.width = width + "px";
}

// ******************************* Fade/Slide in / out Components End **********************************
// ******************************* Menu Controller Components Begin ******************************

/**
 * Menu on click function. Expands sub menus which are filled with
 * sub items which represent Portfolio Projects.
 * @param element - Menu Item that was clicked upon.
 * @param index - Index of item on menu. Used to expand the sub menu.
 */
function menuItemClick(element, index)
{
	const is_sub_item = false;
	// Add or remove the active CSS on menu item.
	activateMenuItem(element, is_sub_item);
	// Display or hide drop down list associated with menu item.
	const elements = document.getElementsByClassName("js-gallery-menu-item-container");
	elements[index].style.display = elements[index].style.display == "block" ? "none" : "block";
}

/**
 * Sub Menu on click function. Selects Portfolio Project. 
 * @param element - Sub menu item that was clicked upon.
 */
function subMenuItemClick(element)
{
	// Returns false if sub item is already activated.
	// If newly selected doesn't equal currently selected project name...
	if((element.innerText != selectedName) && !transitioning)
	{
		// Add and/or remove the active CSS on all sub menu items.
		activateSubMenuItems(getAllSubItems(element.innerText));
		
		// Grab element to fade and roll.
		const header = document.getElementById("js-gallery-sub-container-1");
		const body = document.getElementById("js-gallery-sub-container-2");
		
		// Get data to inject.
		let data_to_inject = search(element.innerText);
		
		// If data exists...
		if(data_to_inject != null)
		{
			// Begin fade/slide transition.
			beginFadeTransition([header, body], [data_to_inject[0], data_to_inject[1]], [1060, 1060]);
			// Set title of new portfolio project.
			selectedName = element.innerText;
			document.getElementById("item_title").innerText = selectedName;
			return;
		}
		
		alert("Portfolio item does not exist.");
	}
}

/**
 * Deactivates already activated sub items, then proceeds to activate the sub
 * items that were just selected by the user.
 * @param elements - HTML elements to activate once clicked upon.
 */
function activateSubMenuItems(elements)
{
	// if other sub items are already activated, deactivate them. 
	if(selectedElements.length > 0)
		for(let i = 0; i < selectedElements.length; i ++)
			selectedElements[i].classList.remove(ITEM_CLASS_ACTIVE);
	// clear our previous selected sub items.
	selectedElements = [];
	
	const is_sub_item = true;
	// activate all sub items that were selected.
	for(let i = 0; i < elements.length; i ++)
		activateMenuItem(elements[i], is_sub_item);
}

/**
 * Activates/Deactivates a menu/sub-menu item by adding an extra class to it.
 * Only one sub item can be active at any one time.
 * @param element - Element to activate/deactivate.
 * @param sub_item - Is Menu Item or Menu Sub Item.
 */
function activateMenuItem(element, sub_item)
{
	// if element is active. Remove active class.
	if(element.classList.contains(ITEM_CLASS_ACTIVE))
		element.classList.remove(ITEM_CLASS_ACTIVE);
	// if element is not active. Add active class.
	else
	{
		element.classList.add(ITEM_CLASS_ACTIVE);
		// if sub item..
		if(sub_item)
			// set new activated sub item.
			selectedElements.push(element);
	}
}

/**
 * Searches for sub menu items with the same Project name that is passed.
 * @param sub_item_name - Name of sub item element to find.
 * @returns Array of sub items with the passed name.
 */
function getAllSubItems(sub_item_name)
{
	// Get tag container.
	let menu_elements = document.getElementById("js-gallery-tag-container").children;
	// List to store sub menu items that are found.
	let sub_menu_items = [];
	// Iterate through menu items...
	for(let i = 2; i < menu_elements.length; i++)
	{
		// Gather sub menu items into list.
		let sub_menu_elements = menu_elements[i].children;
		// iterate through sub menu items... 
		for(let e = 0; e < sub_menu_elements.length; e++)
			// If sub menu item name equals the name we're looking for.. 
			if(sub_menu_elements[e].innerText == sub_item_name)
				// Add found sub item to list.
				sub_menu_items.push(sub_menu_elements[e]);
	}
	// Return found sub menu items.
	return sub_menu_items;
}
// ******************************* Menu Controller Components End ********************************
// ******************************* View Generation Components Begin ******************************

/**
 * Builds a menu from tags and places projects into each sub menu respective to
 * each tag.
 */
function buildMenu()
{
	const parent_node = document.getElementById("js-gallery-tag-container");
	const projects = getProjectData();
	for( let i = 0; i < projects.length; i++)
	{
		let menu_item = createItem(i, projects[i][0], (projects[i].length-1));
		injectData(parent_node, menu_item);
		buildSubMenu(i, projects[i]);
	}
}

/**
 * Retrieves sub menu container and injects sub items into it from an array of
 * projects.
 * @param index - Index of the parent menu item. 
 * @param sub_menu_items - Each project with relevant tag to add to menu.
 */
function buildSubMenu(index, sub_menu_items)
{
	const sub_menu_container = document.getElementsByClassName("js-gallery-menu-item-container")[index];
	for( let i = 1; i < sub_menu_items.length; i++)
		injectData(sub_menu_container, createSubItem(sub_menu_items[i]));
}

/**
 * Inject string into element while retaining current HTML.
 * @param element - HTML Element to inject data into.
 * @param data - Project HTML to inject.
 */
function injectData(element, data)
{
	element.innerHTML += data;
}

/**
 * Creates menu HTML item. Requires menu index, name of category and number of 
 * projects within.
 * @param index - Index of Main Menu Item.
 * @param name - Name of the Menu item category.
 * @param item_length - Number of projects within Tag.
 * @returns HTML String representing a Main Tag Category.
 */
function createItem(index, name, item_length)
{
	return "<span class='js-gallery-menu-item' onclick='menuItemClick(this," + index + ")'>" + name + "("+item_length+")</span><div class='js-gallery-menu-item-container'></div>";
}

/**
 * Creates sub menu HTML item. Requires name.
 * @param name - Name of project.
 * @returns HTML String representing a Project within a Tag category.
 */
function createSubItem(name)
{
	return "<span class='js-gallery-menu-sub-item' onclick='subMenuItemClick(this)'>"+name+"</span>";
}

// ******************************* View Generation Components End ********************************
// ******************************* Data Model Components Begin ***********************************

/**
 * Uses retrieved JSON data to build arrays which will be injected into the menu 
 * the build system. Each project is sorted according to tag. Then fitted into a
 * 2D array. So what is returned is an Array of Project Arrays sorted by project
 * tag.   
 * @returns Array of Project Arrays sorted by Tag. 
 */
function getProjectData()
{
	let tags = [];
	let projects = [];
	// Iterate over each project...
	for( let i = 0; i < data.projects.length; i++)
	{
		// Store each project.
		let project = data.projects[i];
		projects.push(project);
		// Iterate over each tag within the project...
		for( let e = 0; e < project.tags.length; e++)
		{
			// Store each tag.
			let tag = project.tags[e];
			if(!contains(tags, tag))
				tags.push(tag);
		}
	}
	// Sort the tags alphabetically.
	tags.sort();
	// Create project data which will enable us to build our menus.
	let project_data = [];
	for( let i = 0; i < tags.length; i++)
		project_data.push(createTagArray(tags[i], projects));
	
	// Debug.
	//for( let i = 0; i < project_data.length; i++)
		//for( let e = 1; e < project_data[i].length; e++)
			//console.log("Tag["+project_data[i][0]+"]: " + project_data[i][e]);
	
	return project_data;
}

/**
 * Iterates through each project searching for tag matches. Once a match is
 * found it is added to a list to be returned once finished.
 * @param tag - Tag to sort array by.
 * @param projects - Projects to sift through. 
 * @returns Array of Projects sorted by Tag.
 */
function createTagArray(tag, projects)
{
	let relevant_projects = [tag];
	// Iterate over each project...
	for(let i = 0; i < projects.length; i++)
		// if project contains tag...
		if(contains(projects[i].tags, tag))
			// Store project as relevant to respective tag.
			relevant_projects.push(projects[i].name);

	return relevant_projects;
}

/**
 * Iterates through a list looking for a match to the passed object.
 * @param list - List to search through.
 * @param object - Object to compare to.
 * @returns True if list contains Object. False otherwise.
 */
function contains(list, object)
{
	for( let i = 0; i < list.length; i++)
		if(list[i] === object)
			return true;
	
	return false;
}

/**
 * Returns the header and body information of a project via Array.
 * Requires project name.
 * @param name - Name of the project to find.
 * @returns Array which contains header and body info respectively. 
 */
function search(name)
{	
	for( let e = 0; e < data.projects.length; e++)
		if(data.projects[e].name == name)
			return [ data.projects[e].header, data.projects[e].body ];
	
	return null;
}
// ******************************* Data Model Components End *************************************
// ******************************* Networking Components Begin ***********************************

/**
 * Request the project data from the server in JSON format. Then proceeds to 
 * build the menus. Starting point of the Slide Menu.
 */
function requestPortfolioJSON()
{
	try
	{
		// Make request Object.
		let portfolio_call = new XMLHttpRequest();
		// Add state event listener
		portfolio_call.addEventListener("readystatechange", function()
		{
			// If request is finished, response is ready and HTTP OK... 
			if(this.readyState == 4 && this.status == 200)
				try
				{
					// Parse retrieved JSON.
					data = JSON.parse(this.responseText);
					// Build Tags Menu with Data.
					buildMenu();
				}
				catch(exception)
				{
					alert("Json parse or Tag Menu build error: " + exception);
				}
		});
		// Attach REST GET link to request.
		portfolio_call.open('GET', 'portfolio-request');
		// Make request.
		portfolio_call.send(null);
	}
	catch(exception)
	{
		alert("Portfolio request failed.");
	}
}
// ******************************* Networking Components End *************************************

/**
 * Checks if user is browsing within a mobile device. Namely Windows, Android
 * and IOS.
 * @returns True if Windows, Android or IOS mobile device. 
 */
function isMobileDevice()
{
	let user_agent = navigator.userAgent || navigator.vendor || window.opera;

	// Windows. 
	if (/windows phone/i.test(user_agent))
		return true;

	// Android.
	if (/android/i.test(user_agent))
		return true;
	
	// IOS.
	if (/iPad|iPhone|iPod/.test(user_agent) && !window.MSStream)
		return true;
	
	return false;
}

/**
 * Displays a link in between the Project Header and Body which takes the
 * user back to the showcase. 
 */
function displayShowcaseMsg()
{
	document.getElementById("back-to-portfolio").style = 'display:block;';
}

