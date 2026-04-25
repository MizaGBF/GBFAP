/*jshint esversion: 11 */

var beep_audio = new Audio("../GBFML/assets/audio/beep.ogg"); // play GBF beep
var beep_enabled = true;

async function fetchJSON(url) // generic function to request a JSON file.
{
	try
	{
		const response = await fetch(url);
		if (!response.ok)
		{
			throw new Error(`Error HTTP ${response.status}`);
		}
		return await response.json();
	} catch (err) {
		console.error(`Fetch of ${url} failed:`, err);
		return null;
	}
}

// to check if two arrays of the following format are equal:
// [[N0a, N0b], [N1a, N1b], ..., [NXa, NxB]]
function nested_array_are_equal(A, B)
{
	if(A.length != B.length)
		return false;
	for(let i = 0; i < A.length; ++i)
	{
		if(A[i].length != B[i].length)
			return false;
		for(let j = 0; j < A[i].length; ++j)
		{
			if(A[i][j] != B[i][j])
				return false;
		}
	}
	return true;
}

// attempt to copy the string to the clipboard
// be sure to catch exceptions
function copy_to_clipboard(str)
{
	if(navigator.clipboard != undefined)
	{
		navigator.clipboard.writeText(str);
		push_popup('Copied!');
	}
	else push_popup('You need to be on a secure origin to copy');
}

// swap keys and values from an object
function swap(json)
{
	var ret = {};
	for(var key in json)
	{
		ret[json[key]] = key;
	}
	return ret;
}

// display a popup on the top left corner
function push_popup(string)
{
	let div = document.createElement('div');
	div.className = 'popup';
	div.textContent = string;
	document.body.appendChild(div);
	setTimeout(remove_popup, 2500, div);
}

// popup cleanup callback
function remove_popup(popup)
{
	popup.parentNode.removeChild(popup);
}

// retrieve url parameters
function get_url_params()
{
	return new URLSearchParams(window.location.search);
}

// update url parameters
function update_query(id)
{
	let params = new URLSearchParams(window.location.search);
	params.set("id", id);
	if('?' + params.toString() != window.location.search)
	{
		history.pushState(null, '', window.location.pathname + '?' + params.toString());
	}
	document.title = document.title.split(" - ")[0] + " - " + id;
}

// play beep.ogg
function beep()
{
	if(beep_enabled)
	{
		if(!beep_audio.paused)
			return;
		beep_audio.play();
	}
}

// to turn on or off the beep
function toggle_beep()
{
	beep_enabled = !beep_enabled;
	return beep_enabled;
}

// add an element to another element
function add_to(node, tagName, {cls = [], id = null, title = null, innertext = null, innerhtml = null, onload = null, onclick = null, onerror = null, disabled = false, br = false}={})
{
	let tag = document.createElement(tagName);
	for(let i = 0; i < cls.length; ++i)
		tag.classList.add(cls[i]);
	if(title) tag.title = title;
	if(innertext) tag.innerText = innertext;
	if(innerhtml) tag.innerHTML = innerhtml;
	if(id) tag.id = id;
	if(onload) tag.onload = onload;
	if(onclick) tag.onclick = onclick;
	if(onerror) tag.onerror = onerror;
	if(disabled) tag.disabled = true;
	if(node) node.appendChild(tag);
	if(br) node.appendChild(document.createElement("br"));
	return tag;
}

// wait the next frame using requestAnimationFrame to call a callback
// simple wrapper to not have to memorize the syntax
function update_next_frame(callback)
{
	requestAnimationFrame(() => {
		callback();
	});
}

// return capitalized string
function capitalize(string)
{
	if(string.length == 0 || ["and"].includes(string))
		return string;
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// interrupt on-going image downloads by clearing src tag
function interrupt_image_downloads(node)
{
	for(let img of node.getElementsByTagName("img"))
	{
		img.src = "";
		img.removeAttribute("src");
	}
}

// add lazy loading to all images found in the element children
function add_lazy_to_images(node)
{
	// finds all descendant elements
	const images = node.querySelectorAll('img');

	images.forEach(img => {
		img.loading = 'lazy';
	});
}