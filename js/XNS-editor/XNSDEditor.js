var diagramCont = document.getElementById("diagram");
var menuCont = document.getElementById("menuContainer");
var checkColors = document.getElementById("checkColors");
var xnsd = new XNSDiagram();

function drag(e) {
	if (this.id.includes("menu-item")) {
		e.dataTransfer.setData("mode", "copy");
	} else {
		e.dataTransfer.setData("mode", "move");
	}
	e.dataTransfer.setData("data", this.getAttribute("type"));
	e.dataTransfer.setData("template-index", this.getAttribute("template-index"));
	e.dataTransfer.setData("id", this.id);
}

function drop(ev) {
	ev.preventDefault();
	var type = ev.dataTransfer.getData("data");
	var mode = ev.dataTransfer.getData("mode");
	var templateIndex = ev.dataTransfer.getData("template-index");
	var id = ev.dataTransfer.getData("id");
	var obj;
	var target = ev.target;
	if (mode == "copy") {
		obj = renderStatement(templates[templateIndex]);
		obj.json = templates[templateIndex];
	} else {
		obj = document.getElementById(id);
	}
	console.log(diagramCont.json.statements);
	console.log(diagramCont.lastChild);
	insertStatementInTarget(target, obj, mode);
	handleDragLeave(ev);
}

function deleteStatementInJSON(container, index) {
	container = checkMethodStatements(container);
	container.json.statements.splice(index, 1);
}

function insertStatementInJSON(container, index, statement) {
	container = checkMethodStatements(container);
	if (typeof index == "undefined") {
		container.json.statements.push(statement.json);
	} else {
		container.json.statements.splice(index, 0, statement.json);
	}
}

function checkMethodStatements(node) {
	return node.className != "statements" ? node : node.parentNode;
}

function insertStatementInTarget(target, statement, mode) {
	var parent = target.parentNode;
	if (parent == diagramCont) {
		target.appendChild(statement);
		target.appendChild(newEmptyBlock());
		insertStatementInJSON(parent, undefined, statement);
	} else if (mode == "copy") {
		if (parent.lastChild == target) {
			parent.appendChild(statement);
			parent.appendChild(newEmptyBlock());
		} else {
			parent.insertBefore(statement, target);
			parent.insertBefore(newEmptyBlock(), statement);
		}
		insertStatementInJSON(parent, indexOfStatement(statement), statement);
	} else {
		var currentIndex = indexOfStatement(statement);
		var targetIndex = indexOfStatement(target) + 0.5;
		var parentTarget = target.parentNode;
		var parentStatement = statement.parentNode;
		var empty = statement.nextSibling;
		parent.insertBefore(statement, target);
		parent.insertBefore(empty, statement);
		deleteStatementInJSON(parentStatement, currentIndex);
		insertStatementInJSON(parentTarget, targetIndex, statement);
	}
}

function indexOfStatement(statement) {
	var realIndex = indexOfChild(statement);
	return (realIndex - 1) / 2;
}

function indexOfChild(child) {
	return Array.from(child.parentNode.children).indexOf(child);
}

function handleDragOver(ev) {
	if (ev.target.getAttribute("droppable") == "true") {
		if (ev.target.className == "empty") {
			ev.target.style.height = "20px";
		}
		ev.target.classList.add("over");
	}
}

function handleDragLeave(ev) {
	if (ev.target.classList.contains("empty")) {
		ev.target.style.height = "1px";
	}
	ev.target.classList.remove("over");
}

function renderStatement(statement) {
	var obj = xnsd[statement.type](statement.data);
	obj.classList.add("Nassi-Shneiderman");
	obj.setAttribute("type", statement.type);
	obj.setAttribute("draggable", "true");
	setEvent(obj, "dragstart", drag);
	return obj;
}

function newEmptyBlock() {
	return xnsd.newBlock("empty", undefined, "true");
}

function allowDrop(ev) {
	ev.preventDefault();
	if (ev.target.getAttribute("droppable") == "true") {
		ev.dataTransfer.dropEffect = "copy"; // drop it like it's hot
	}
	else {
		ev.dataTransfer.dropEffect = "none"; // dropping is not allowed
	}
}

function toJSON(codeStr) {
	var codeJson = {};
	try {
		codeJson = JSON.parse(codeStr);
	} catch (e) {
		console.log(e);
	}
	return codeJson;
}

function insertHeader(elem, description) {
	var title = document.createElement("h2");
	title.className = "external";
	title.innerHTML = description + "<br/>&nbsp";
	elem.appendChild(title);
}

function setEvent(domElement, eventName, handler) {
	if (document.body.addEventListener) {
		domElement.addEventListener(eventName, handler);
	} else {
		domElement.attachEvent("on" + eventName, handler);
	}
}

function generateMenuItems() {
	for (let index = 0; index < templates.length; index++) {
		const template = templates[index];
		var obj = renderStatement(template);
		obj.id = "menu-item-" + template.type;
		obj.setAttribute("template-index", index);
		menuCont.appendChild(newMenuItem(obj));
	}
}

function clearAllChilds(node) {
	while (node.firstChild) {
		node.removeChild(node.lastChild);
	}
}

function newMenuItem(obj) {
	var div = document.createElement("div");
	div.classList.add("menuItem");
	div.appendChild(obj);
	return div;
}

function appendDiagram(json) {
	diagram = xnsd.render(
		diagramCont,
		json.statements ?
			json : {
				statements: [json]
			}
	);
	diagramCont.json = json;
	return diagram;
}

function handleOpen() {
	appendDiagram(base);
	diagramCont.lastChild.appendChild(newEmptyBlock());
	generateMenuItems();
}


function handleCheckbox(e) {
	var link = document.getElementById("css/XNSColors.css");
	link.setAttribute("href", (e.target.checked ? link.id : ""));
}

function generateCanvasIn(target, statement) {
	return html2canvas(statement).then(canvas => {
		target.appendChild(canvas);
	});
}

function init() {
	setEvent(diagramCont, "dragenter", handleDragOver);
	setEvent(diagramCont, "dragleave", handleDragLeave);
	setEvent(diagramCont, "drop", drop);
	setEvent(diagramCont, "dragover", allowDrop);
	setEvent(checkColors, "click", handleCheckbox);
	setEvent(window, "load", handleOpen);
}


init();

