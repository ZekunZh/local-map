"use strict";
// global variables
var	server= "http://local-map/"

var mapControl = {
	existMap: false,
	mapName: null,
	mapPlot: 
		function(name, callback) {
			// add svg map to html
			d3.xml( server + "maps/" + name + ".svg", 
			function(error, documentFragment) {
				if(error){
					console.log(error);
					return;
				}

				var svgNode,
					map,
					floorName,
					allTables,
					allAvailables;

				svgNode = documentFragment.getElementsByTagName("svg")[0];
				map = d3.select(".map");
				map.node().appendChild(svgNode);
				floorName = name;

				// mark all tables as available
				allTables = d3.select("#tables").selectAll("g");
				allTables.attr("class", "available");
				/////////////////////////////
				// for each people, search his table
				/////////////////////////////
				d3.json( server+"people", function(error, data) {
					/////////////////////////////
					// add names to each table
					/////////////////////////////
					var dataset = data,
						table,
						// Define the div for the tooltip
						div = d3.select("#main").select(".tooltip")
								.style("opacity", 0);
					
					dataset.forEach(function(data, i) {
						// data example: ["CN=Laurence EYRAUD-JOLY,OU=Klee SA,OU=Utilisateurs,DC=KLEE,DC=LAN,DC=NET", 
						//					{ "mail": ["Laurence.EYRAUDJOLY@kleegroup.com"], "physicalDeliveryOfficeName": ["La Boursidière : N4-D-01"], "cn": ["Laurence EYRAUD-JOLY"] }]
						// only need data[1]
						var d = data[1];
						// split tableID into two parts.
						// ex "La Boursidiere : N3-A-01" => ["La Boursidiere", "N3-A-01"]

						if (d.physicalDeliveryOfficeName) {
							var splitID = d.physicalDeliveryOfficeName[0].split(/\s+:\s+/);

							// do following if we have the second part
							if(splitID[1]){
								table = d3.select("#"+splitID[1]);
								// if found in map, change table color, add hover actions
								if(table[0][0] !== null){
									// mark as occupied
									table.attr("class", "occupied");
									table.select("rect")
									     .attr("id", d.cn[0])
										 .attr("fill", "#ff9900");

									// mouse hover on the text will give more info
									table.on("mouseover", function() {
										div.transition()
											.duration(200)
											.style("opacity", .9);
										div .html(d.cn[0] + "<br/>"
													+ "email: " + d.mail[0])
											.style("left", (d3.event.pageX + 16) + "px")
											.style("top", (d3.event.pageY + 16) + "px");
									});
									table.on("mouseout", function() {
										div.transition()
											.duration(500)
											.style("opacity", 0);
									});	
								}
							}
						}
					});

					////////////////////////////////
					// show all available tables
					////////////////////////////////
					allAvailables = d3.select("#tables").selectAll(".available");
					allAvailables.selectAll("rect").attr("fill", "#99ff99");
					allAvailables.on("mouseover", function() {
						div.transition()
							.duration(200)
							.style("opacity", .9);
						div.html("pas de personne" + "<br/>" + "ce bureau est disponible")
							.style("left", (d3.event.pageX + 16) + "px")
							.style("top", (d3.event.pageY + 16) + "px");
					});
					allAvailables.on("mouseout", function() {
						div.transition()
							.duration(500)
							.style("opacity", 0);
					});

					callback();
				});
			});
		}
};