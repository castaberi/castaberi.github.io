
// Function for making choropleth of NYC restuarants and scores
function makeMap(dname) {

	//Width and height
	var width = 800,
	height = 600;
	
	xlegend = 0;
	ylegend = 40;
	
	//Define default colorbrewer scheme
	var colorSchemeSelect = "Blues";
	var colorScheme = colorbrewer[colorSchemeSelect]; 
	//define default number of quantiles
	var quantiles = 8;

	// Designate quantile scale generator
	// .range(colorScheme[quantiles].slice(4, 4 + 5););
	var color = d3.scale.quantize()
	.range(colorScheme[quantiles].slice(2, 2 + 6));
	
	//Create SVG element
	var svg = d3.select(dname).append("svg")
		.attr("width", width)
		.attr("height", height)


	function getColor(color, d, varname){
		var value=(d["properties"][varname]);
		//console.log(value);
		if(value>0){
			return color(value);
		}else{
			return "lightgrey";
		}
	}
	
		var projection = d3.geo.mercator()
						.center([-73.94, 40.70])
						.scale(60000)
						.translate([(width) / 2, (height)/2]);

		var path = d3.geo.path()
				.projection(projection);
		
			
    d3.json("nyc_zip.json", function(error, nyc) {
		varname = "N_REST";
		// Set the colour domain
		var max_value = d3.max(d3.values(nyc.features), function(d) { return d.properties[varname];} );
		var min_value = d3.min(d3.values(nyc.features), function(d) { 
			if (d.properties[varname] <= 0) {
				return; // count only positive values
			}
			return d.properties[varname];} );
			
		
		color.domain([min_value, max_value]);
	


		//var g = svg.append("g");
		
		// Bind data
		map = svg.append("g")
			.attr("class", "zipcode")
			.selectAll("path")
			.data(nyc.features);
		// Enter data
		map.enter().append("path")
			.attr("class", function(d){ return d.properties.name; })
			.attr("d", path)
			.style("fill",function(d){return getColor(color, d, varname);})
			.on("mouseover",mouseover)
			.on("mouseout",mouseout);
		map.exit().remove();
					
			
		// Add a legend
		var legend = svg.selectAll('g.legend')
			.data(color.range())
			
		// Enter data
		legend.enter().append('g').attr('class', 'legend');
			
		legend
			.append('rect')
			.attr("x", width - 780 + xlegend)
			.attr("y", function(d, i) {
			   return i * 20 + ylegend;
			})
		   .attr("width", 20)
		   .attr("height", 20)
		   .style("fill", function(d){return d;}); 
		   
		var legendtext = svg.selectAll("text").data(color.range());
		legendtext.attr("class", "update");
			
		legendtext.enter().append("text").attr("class","enter").attr("x", width - 755 + xlegend)
			.attr("y", function(d, i) {
			   return i * 20 + 4 + ylegend;
			})
			.attr("dy", "0.8em");

		legendtext.text(function(d,i) {
				var extent = color.invertExtent(d);
				var format = d3.format(".0f");
				return format(+extent[0]) + " - " + format(+extent[1]);
			})
		legendtext.exit().remove();	   
		   
			
	});
	
	function updateMap(varname) {

		if(varname == "N_REST") {
			display_format = ".0f";
		}
		else if(varname == "AVG_SCORE") {
			display_format = ".2f";
		}
		
		d3.json("nyc_zip.json", function(error, nyc) {
			// Set the colour domain
			var max_value = d3.max(d3.values(nyc.features), function(d) { return d.properties[varname];} );
			var min_value = d3.min(d3.values(nyc.features), function(d) { 
			if (d.properties[varname] <= 0) {
				return; // count only positive values
			}
			return d.properties[varname];} );
			
			
			
			if (varname == "AVG_SCORE" ) {
				var color_domain = [13.8, 15.34, 16.02, 16.52, 17.22];

				var color = d3.scale.threshold()
					.domain(color_domain)
			} else {										
				var color = d3.scale.quantize().domain([min_value, max_value]);
			}
				
			
		color.range(colorScheme[quantiles].slice(2, 2 + 6));
			

			// Bind data
			map = svg
			  .selectAll("path")
			  .data(nyc.features);			
			// Enter data
			map.enter().append("path")
			.attr("class", function(d){ return d.properties.name; })
			.attr("d", path)
			.on("mouseover",mouseover)
			.on("mouseout",mouseout)
			// Update			
			map.transition()
			  .duration(1000)
			  .style("fill",function(d){return getColor(color, d, varname);});
			// Exit
			map.exit().remove();
			

			
			
		var legendtext = svg.selectAll("text").data(color.range());
		legendtext.attr("class", "update");
			
		legendtext.enter().append("text").attr("class","enter").attr("x", width - 755 + xlegend)
			.attr("y", function(d, i) {
			   return i * 20 + 4 + ylegend;
			})
			.attr("dy", "0.8em");

		legendtext.text(function(d,i) {
				var extent = color.invertExtent(d);
				if(i == 0) {
					extent[0] = min_value;
				}
				else if(i == 5) {
					extent[1] = max_value;
				}
				var format = d3.format(display_format);
				return format(+extent[0]) + " - " + format(+extent[1]);
			})
		legendtext.exit().remove();				
	
	
		});
	}
	

	
	
	
	
	function mouseover(d){
		var avgscore = d3.round(d.properties["AVG_SCORE"],2);
		var text="Restaurants: "+d.properties["N_REST"] + "<br/>"
			+ "Average score: " + (avgscore < 0 ? "nan" : avgscore) + "<br/>"
			+ "Region: " + d.properties["PO_NAME"] + "<br/>"
			+ "ZIP code: " + d.properties["ZIP"];
		$(".mouseover").html(text);
		$(".mouseover").css("display","inline");
	}

	function mouseout(){
		d3.select("#arcSelection").remove();
		$(".mouseover").text("");
		$(".mouseover").css("display","none");
	}
	
	// moves the mouseover box whenever the mouse is moved.
	d3.select('html') // Selects the 'html' element
		.on('mousemove', function()
		{
			var locs=d3.mouse(this);	// get the mouse coordinates

			// add some padding
			locs[0]+=15;
			locs[1]+=5;

			$("div.mouseover").css("margin-left",locs[0]);
			$("div.mouseover").css("margin-top",locs[1]);
		});
		
		
		$('.map-nrest').on('click',function(){updateMap("N_REST")});
		$('.map-score').on('click',function(){updateMap("AVG_SCORE")});
		

}
	
	
	
	
	
	
	
	
	
	
	
// Function for making bar chart
function makeBarPlot(dname) {

	var margin = {top: 50, right: 70, bottom: 30, left: 50},
		width = 700 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	var xbar = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);

	var ybar = d3.scale.linear()
		.range([height, 0]);

	var xbarAxis = d3.svg.axis()
		.scale(xbar)
		.orient("bottom");

	var ybarAxis = d3.svg.axis()
		.scale(ybar)
		.orient("left");


	var svg = d3.select(dname).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		

		
		

	d3.csv("categoriesfrequency.csv", type, function(error, data) {
	  varname = "frequency";
	  xbar.domain(data.map(function(d) { return d.cat; }));
	  ybar.domain([0, d3.max(data, function(d) { return d[varname]; })]);

	  svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .style("font-size","11px")
		  .call(xbarAxis);

	  svg.append("g")
		  .attr("class", "y axis")
		  .style("font-size","13px")
		  .call(ybarAxis)
		.append("text").attr("class", "ylab")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 7)
		  .attr("dy", ".100em")
		  .style("text-anchor", "end")
		  .text(varname);

		// Bind
		bar = svg.selectAll(".bar")
		   .data(data.sort(function(a, b){return b.score-a.score}));
		// Enter
		bar.enter().append("rect")
		  .attr("class", "bar")
		  .attr("x", function(d) { return xbar(d.cat); })
		  .attr("width", xbar.rangeBand())
		  .attr("y", function(d) { return ybar(d[varname]); })
		  .attr("height", function(d) { return height - ybar(d[varname]); })
		  .on("mouseover",function(d){ return mouseover_bar(d, varname);})
		  .on("mouseout",mouseout);
		  
		  
		// Exits
		bar.exit().remove();
		

	});



	function type(d) {
	  d.frequency = +d.frequency;
	  return d;
	}

		var updateData = function(varname)
		{	
			d3.csv("categories"+varname+".csv", type, function(error, data) {
				if (error) throw error;

				ybar.domain([0, d3.max(data, function(d) { return d[varname]; })]);
				xbar.domain(data.map(function(d) { return d.cat; }));
				
				
				// Bind
				var bars = svg.selectAll(".bar").data(data);
				
				// Enter
				bars.enter().append("rect").attr("class", "bar");
				
				
				// Update
				bars.transition()
					.duration(2000)
					.attr("x", function(d) { return xbar(d.cat); })
					.attr("width", xbar.rangeBand())
					.attr("y", function(d) { return ybar(d[varname]); })
					.attr("height", function(d) { return height - ybar(d[varname]); });
				
				// Exits
				bars.exit().remove();
				// Update y axis
				svg.selectAll(".y.axis")
				  .transition()
				  .duration(2000)
				  .call(ybarAxis);
				// Update x axis
				svg.selectAll(".x.axis")
				  .transition()
				  .duration(2000)
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + height + ")")
				  //attr("transform", function(d) { return "rotate(-65)" })
				  .call(xbarAxis);
				// Update y labels
				svg.selectAll(".ylab")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 7)
				  .attr("dy", ".100em")
				  .style("text-anchor", "end")
				  .text(varname);
				  
				  
				 
				 
				if (varname == "score") {  		
				var dataAvg = d3.sum(data, function(d) { return d[varname]; }) / data.length; 
				lines = svg.selectAll(".avgline")
					.data(data)
					.enter()
					.append("line")
					.attr("class", "avgline")
					.style("stroke", "black")
					.style("stroke-dasharray", ("3, 3"))
					.attr("x1", xbar("African"))
					.attr("y1", ybar(dataAvg))
					.attr("x2", xbar("Cafe")+xbar.rangeBand())
					.attr("y2", ybar(dataAvg))
					.style("stroke-opacity", 0.5)
					.on("mouseover",function(d){ return mouseover_line(d, dataAvg);})
					.on("mouseout",mouseout);
				} else {
					svg.selectAll(".avgline").remove();
				}
				  
								
			});								
		}

		
		dict = {"American": "'American', 'Californian', 'Creole', 'Cajun', 'Creole/Cajun', 'Southwestern', 'Hawaiian', 'Polynesian', 'Barbecue', 'Steak'",
			"Chinese": "'Chinese', 'Chinese/Cuban'",
			"Fast Food": "'Pizza', 'Hotdogs', 'Hamburgers'",
			"Italian": "'Italian', 'Pizza/Italian'",
			"Cafe": "'Cafe/Coffee/Tea'",
			"Latin": "'Latin (Cuban, Dominican, Puerto Rican, South & Central American)', 'Mexican', 'Chilean', 'Tex-Mex', 'Brazilian', 'Polynesian', 'Peruvian'",
			"Asian": "'Asian', 'Japanese', 'Korean', 'Russian', 'Thai', 'Iranian', 'Indian', 'Middle Eastern', 'Indonesian', 'Filipino', 'Vietnamese/Cambodian/Malaysia', 'Afghan', 'Pakistani', 'Armenian', 'Bangladeshi'",
			"African": "'African', 'Soul Food', 'Ethiopian', 'Egyptian', 'Moroccan'",
			"European": "'Eastern European', 'Continental', 'Polish', 'Czech', 'Irish', 'German', 'English', 'Scandinavian'",
			"Bakery": "Bakery",
			"Mediterranean": "'Mediterranean', 'French', 'Portuguese', 'Spanish', 'Greek', 'Turkish'",
			"Seafood": "Seafood",
			"Other": "'Other', 'Ice cream [...]', 'Juice, Smoothies, Fruit Salads', 'Bottled beverages', 'Fruits/vegatables', 'Nuts/Confectionary', 'Chicken', 'Delicatessen', 'Sandwiches', 'Salads', 'Tapas', 'Vegetarian', 'Pancakes/Waffles', 'Soups', 'Jewish/Kosher', 'Bagels/Pretzels', 'Hotdogs/Pretzels'"};
		
		
		
		function mouseover_bar(d, varname){
			//var text=varname + ": <span style='color:red'>"+ d3.round(d[varname],4) + "</span>";
			var text = "<b>Cuisine descriptions:</b><br></br>" + dict[d.cat];
			$(".mouseover").html(text);
			$(".mouseover").css("display","inline");
		}
		
		function mouseover_line(d, avg){
			//var text=varname + ": <span style='color:red'>"+ d3.round(d[varname],4) + "</span>";
			var text = "Grand average: " + d3.round(avg, 3);
			$(".mouseover").html(text);
			$(".mouseover").css("display","inline");
		}

		function mouseout(){
			d3.select("#arcSelection").remove();
			$(".mouseover").text("");
			$(".mouseover").css("display","none");
			$(".mouseover").css("width", "120px");
		}
		
		// moves the mouseover box whenever the mouse is moved.
		d3.select('html') // Selects the 'html' element
			.on('mousemove', function()
			{
				var locs=d3.mouse(this);	// get the mouse coordinates

				// add some padding
				locs[0]+=15;
				locs[1]+=5;

				$("div.mouseover").css("margin-left",locs[0]);
				$("div.mouseover").css("margin-top",locs[1]);
			});
			
			
		
		
		
		$('.bar-frequency').on('click',function(){updateData("frequency")});
		$('.bar-score').on('click',function(){updateData("score")});
		
}














// Fuction for making scatter plot
function makeScatter(dname) {
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

	var x = d3.scale.linear()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var svg = d3.select(dname).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.csv("scores.csv", function(error, data) {
	  if (error) throw error;
	  var xvar = "RATING_YELP";
	  var yvar = "AVGSCORE";
	  
	  
	  
	  data.forEach(function(d) {
		d[xvar] = +d[xvar];
		d[yvar] = +d[yvar];
	  });

	  //x.domain(d3.extent(data, function(d) { return d[xvar]; })).nice();
	  x.domain([1,5]);
	  y.domain(d3.extent(data, function(d) { return d[yvar]; })).nice();

	  svg.append("g")
		  .attr("class", "xs axis")
		  .attr("transform", "translate(0," + height + ")")
		  .style("font-size","15px")
		  .call(xAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("x", width)
		  .attr("y", -6)
		  .style("text-anchor", "end")
		  .text("Yelp Review");

	  svg.append("g")
		  .attr("class", "y axis")
		  .style("font-size","15px")
		  .call(yAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("Average Inspecection Score")

	  svg.selectAll(".dot")
		  .data(data)
		.enter().append("circle")
		  .attr("class", "dot")
		  .attr("r", 1)
		  .attr("cx", function(d) { return x(d[xvar]); })
		  .attr("cy", function(d) { return y(d[yvar]); })  

	});
	
		d3.selectAll(".filter_button").on("change", function () {
		var selected = this.value, 
		display = this.checked ? "inline" : "none";
		svg.selectAll(".dot")
		.filter(function(d) { return d.CUISINE == selected; })
		.attr("display", display);
	});

	d3.selectAll(".all_button").on("click", function () {
		var selected = this.value;
		if(selected == "check") {
			checkAll();
		}
		if(selected == "uncheck") {
			uncheckAll();
		}
	});

	

	function checkAll() {
		d3.selectAll('.filter_button').property('checked', true);	
		svg.selectAll(".dot").attr("display", "inline");	
	}
	
	function uncheckAll() {
		d3.selectAll('.filter_button').property('checked', false);
		svg.selectAll(".dot").attr("display", "none");
	}
	
	
}
