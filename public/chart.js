d3.csv("Data2.csv").then( function(dataall) {


  // Custom parsing function for "M/D/Y" format
  function parseDate(dateString) {
    const [month, day,year] = dateString.split('/');
    const res  = new Date(year, month - 1, day)//.getDate()
    return res;
  }

  var parseDate1 = d3.timeParse("%m/%d/%Y");

  // Parse the date strings and replace them with Date objects
  dataall.forEach(d => {

    d.Date_org = d.Date;
    //d.Date = parseDate(d.Date).getDate();
    d.Date = parseDate1(d.Date);
    //d.Month = parseDate(d.Date).getDate();
  });

  var data = [];
  for(i in dataall){
    //if(dataall[i].Month == select_month){
      data.push(dataall[i]);
    //}
  }
  data = data.slice(0,-1)
  var allGroup = [];
  for(i in data){
    if(!allGroup.includes(data[i].Date)){allGroup.push(data[i].Date);}
  }

  var data_select = [];
  var data_select1 = [];
  for(i in data){
    if(data[i].Date==allGroup[0]){
      data_select.push(data[i])
      data_select1.push({"Date":1, "Type":data[i].Type,"Value":1})
    }
  }
  // X scale
  var x_rosa = d3.scaleBand()
      .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
      .align(0)                  // This does nothing ?
      .domain( data.map(d => d.Type)); // The domain of the X axis is the list of states.

  // Y scale
  var y_rosa = d3.scaleLinear()
      .range([innerRadius, outerRadius])   // Domain will be define later.
      .domain([0, Math.pow(300,0.6)]); // Domain of Y is from 0 to the max seen in the data
  var max_y = 0;
  var max_value = 0;
  var color = function(d) {
      if(d<51){
        return '#34B274';}
      else if (d<101){return '#FDD000';}
      else if (d<151){return '#F4681A';}
      else if (d<201){return '#D3112E';}
      else if (d<301){return '#8854D0';}

  }




const sumstat = d3.group(data, d => d.Type); // nest function allows to group the calculation per level of a factor

var by_date = d3.group(data, d => d.Date);
// Convert the Map object to an array of key-value pairs using .entries()
var entries = Array.from(by_date.entries());

// Filter out entries where either key or values are undefined
var filteredEntries = entries.filter(([key, values]) => key !== undefined && values !== undefined);

// Convert the filtered entries back to a Map if needed
by_date = new Map(filteredEntries);

var categories = [];
for(i in data){
  if(!categories.includes(data[i].Type)){categories.push(data[i].Type);}
}

const n = categories.length
categories = categories.slice(0,n-1)
categories.push('AQI')


const date_list = []
for(i in data){
  if(!date_list.includes(data[i].Date)){date_list.push(data[i].Date);}
}

var AQI_values = []
for (const [key, value] of by_date.entries()) {
  var max_val = 0
  var max_type = ''
  for (i in value){
    if(Number(value[i].Value)>Number(max_val)){
      max_val = Number(value[i].Value);
      max_type = value[i].Type;
    }
  }
  AQI_values.push({'Type':'AQI','Date': key, 'Value': max_val,'DFactor': max_type})
}


var x_line = d3.scaleTime()
    .domain([date_list[150],d3.max(date_list)])
    .range([ 0, width2])

var health_list = ['Good',"Moderate","Sensitive","Unhealthy","Very Unhealthy"]
var emoji = ['😃','🤨','🧐','🥴','😷']

var y_axis_length = y_axis_L- margin2.top - margin2.bottom;
svg2.append("g")
.attr("transform", `translate(0, ${y_axis_length})`)
.call(d3.axisBottom(x_line).ticks(5))
.attr("class","x-axis");
 const y_domain = 250;//(Math.ceil((d3.max(data, function(d){ return +d.Value; }))/50))*50;
 console.log(y_domain)
// Add Y axis
var y_line = d3.scaleLinear()
    .domain([0, y_domain])
    .range([ y_axis_length,0 ]);
  svg2.append("g")
    .call(d3.axisLeft(y_line))
    .attr("class","axis");

for (let i = 1; i*50 <= y_domain; i++) {

svg2.append('rect')
  .attr('x', -4)
  .attr('y', y_line(i*50))
  .attr('width', 8)
  .attr('height', -y_line(50)+y_line(0))
  .attr('fill', color_fill(i*50));
  if(i<6){

svg2.append("text")
  .attr("text-anchor", "end")
      .attr("x", -40)
      .attr("y", y_line(i*50-5))
      .text(health_list[i-1])
      .attr("class","legend")
      .call(wrap,100)
      .append("tspan").attr("x", -40).attr("dy", "1.2em").text(emoji[i-1])
      .attr("font-size", 30)
    }
  }

var innerRadius_s = 5
var outerRadius_s = 35
// Y scale
var y_s = d3.scaleRadial()
    .range([innerRadius_s, outerRadius_s])   // Domain will be define later.
    .domain([0, Math.pow(300,0.5)]); // Domain of Y is from 0 to the max seen in the data
svg2.append("text")
    .attr("text-anchor", "end")
    .attr("x", width2)
    .attr("y", y_axis_length+50)
    .text("Date")
    .style("font-size", "22px")
    .attr("font-weight", "bold");
svg2.append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -15)
    .text("AQI")
    .style("font-size", "22px")
     .attr("font-weight", "bold");// Add bars


var mouseclick = function(event,d) {
console.log("clicl")
  // Display modal when a circle is clicked
const modal = document.getElementById("myModal");
const modalContent = document.getElementById("modalContentText");
modalContent.innerHTML = ``;
modal.style.display = "block";
// Clear previous SVG content
modalContent.innerHTML += '<svg id="circleSvg" ></svg>';
const groupName = "myGroup";
const svg = d3.select("#circleSvg");
// append the svg object to the body of the page
svg.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", `translate(${150},${-60})`)
  .append("g")
  .attr("class", groupName)
    .attr("transform", `translate(${width/2},${height/2+100})`); // Add 100 on Y translation, cause upper bars are longer
const selectedGroup = d3.select(`.${groupName}`);
    max_y = 0
    max_value = 0
    // recover the option that has been chosen
    var selectedOption = d[0].toDateString();
    console.log(selectedOption)
    data_select = [];
    for(i in data){
      if(data[i].Date.toDateString()==selectedOption){
        data_select.push(data[i])
      }
    }
    // Add bars
  data_select.sort((a, b) => b.Value - a.Value);
  data_select1 = []
  for(i in data_select){
    data_select1.push({"Date": data_select[i].Date,
                       "Value":1,
                       "Type":data_select[i].Type,
                       "Month":data_select[i].Month})
  }

    var layer1 = selectedGroup.append('g');
    var layer2 = selectedGroup.append('g');
    var layer3 = selectedGroup.append('g');


  var bars = layer2
      .selectAll("path")
      .data(data_select1)
      .join("path")
      .attr("fill", d =>color_fill(d.Value))
      .style("opacity", 0.7)
      .attr("d", d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(function(d){
            if(y_rosa(Math.pow(d['Value'],0.6))>max_y){
              max_y = y_rosa(Math.pow(d['Value'],0.6));
              max_value = d['Value'];
            }
            return y_rosa(Math.pow(d['Value'],0.6));})
          .startAngle(d => x_rosa(d.Type))
          .endAngle(d => x_rosa(d.Type) + x_rosa.bandwidth())
          .padAngle(0.05)
          .padRadius(innerRadius))


    bars.data(data_select).transition()
            .duration(2000)
            .delay(function(d,i){
              if(i<1){
              return i*300}
              else{
                return i*600+1500;
              }

            })
        .attr("fill", d =>color_fill(d.Value))
        .style("opacity", 0.7)
        .attr("d", d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(function(d){
              if(y_rosa(Math.pow(d['Value'],0.6))>max_y){
                max_y = y_rosa(Math.pow(d['Value'],0.6));
                max_value = d['Value'];
              }
              return y_rosa(Math.pow(d['Value'],0.6));})
            .startAngle(d => x_rosa(d.Type))
            .endAngle(d => x_rosa(d.Type) + x_rosa.bandwidth())
            .padAngle(0.05)
            .padRadius(innerRadius))
            .attr("stroke", function(d){
              for(i in AQI_values){
                if(AQI_values[i].Date.toDateString() == d.Date.toDateString()){
                if( d.Type==AQI_values[i]['DFactor']){
                  return "#000000";
                }
                else{return "none"}
              }
            }
          })
            .attr("stroke-width","5px")

            // Add the labels
    var pollution_axis = layer2.append("g")
        .selectAll("g")
        .data(data_select)
        .join("g")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "rotate(" + ((x_rosa(d.Type) + x_rosa.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; })
        .append("text")
          .text(function(d){return(d.Type)})
          .attr("transform", function(d) { return (x_rosa(d.Type) + x_rosa.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
          .attr("class","axis")
          .attr("alignment-baseline", "middle")
          .attr("class","pullution-axis")
          .attr("opacity",0)

    layer2
        .selectAll("text")
        .transition()
        .duration(2000)
        .delay(function(d,i){
          if(i<1){
          return i*300}
          else{
            return i*600+1500;
          }
        })
        .attr("opacity",1)
        .attr("transform", function(d) {
          var h = max_y
          return (x_rosa(d.Type) + x_rosa.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "translate(" + h + ",0)"+"rotate(90)translate(0,16)" : "translate(" + h+ ",0)"+"rotate(-90)translate(0,-9)"; })


      var lines = layer2.append("g")
        .selectAll("line")
        .data(data_select)
        .join("g")
        .append("line")
        .attr('x1', d =>y_rosa(Math.pow(d.Value,0.6))
        )
        .attr('y1', 0)
        .attr('x2', max_y+30)
        .attr('y2', 0)
        .attr('opacity',0)
        .attr("transform", function(d) {
          return "rotate(" + ((x_rosa(d.Type) + x_rosa.bandwidth() / 2) * 180 / Math.PI - 90) + ")"})
        .attr('stroke', d => color_text(d.Value))
        .attr("stroke-width",3)
        //.attr("transform", function(d) { return (x_rosa(d.Type) + x_rosa.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })

        layer2
            .selectAll("line")
            .transition()
            .duration(1200)
            .delay(function(d,i){
              if(i<1){
              return 600}
              else{
                return i*600+2400;
              }
            })
            .attr('opacity',1)

          // Add the labels
  layer2.append("g")
      .selectAll("g")
      .data(data_select)
      .join("g")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) { return "rotate(" + ((x_rosa(d.Type) + x_rosa.bandwidth() / 2) * 180 / Math.PI - 90) + ")"})


    var AQI = layer1.append("g").append('circle')
    .transition()
    .duration(2000)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', max_y)
      .attr("stroke-width", 3)
      .attr('stroke', color_fill(max_value))
      .attr('fill', color_fill(max_value))
      .style("opacity", 0.18)


      var yAxis = layer3
          .attr("text-anchor", "middle");
      const rank = [50,100,150,200,300]

      var yTick = yAxis
        .selectAll("g")
        .data(rank)
        .enter().append("g");

      yTick.append("circle")
          .attr("fill", "none")
          .style("stroke-dasharray", ("1, 5"))
          .attr("stroke", "#000")
          .attr("r", d=>y_rosa(Math.pow(d,0.6)));


      yTick.append("text")
          .data(rank)
          .attr("y", function(d) { return -y_rosa(Math.pow(d,0.6)); })
          .attr("dy", "0.35em")
          .attr("fill", "none")
          .attr("stroke", "#fff")
          .attr("stroke-width", 5)
          .text(d => d)
          .attr("class","pullution-axis")



      yTick.append("text")
          .data(rank)
          .attr("y", function(d) {
            return -y_rosa(Math.pow(d,0.6)); })
          .attr("dy", "0.35em")
          .text(d => d)
          .attr("class","pullution-axis")


      var AQI_text = yAxis.append("text")
          .attr("y", 10)
          .attr("dy", "-1em")
          .text("AQI")
          .style("font-size", "26px")
          .style("font-weight",600)
          .attr("fill", color_text(max_value));

      var AQI_value = yAxis.append("text")
          .attr("y", 50)
          .attr("dy", "-1em")
          .text(max_value)
          .style("font-size", "26px")
          .style("font-weight",600)
          .attr("fill", color_text(max_value));

// Close the modal when the close button is clicked
const closeButton = document.querySelector(".close");
closeButton.onclick = function () {
    modal.style.display = "none";
};

// Close the modal when the user clicks outside the modal content
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
}
var clip = svg2.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width2 )
    .attr("height", height2 )
    .attr("x", 0)
    .attr("y", 0);

svg2.append('g')
.attr("clip-path", "url(#clip)")
  .selectAll("path")
  .data(by_date)
  .join("g")
  .attr("class","flowers")
  .on("click", mouseclick)
  .attr("transform", function(d){
    return `translate(${x_line(d[0])+0}, ${y_line(0)})`})
  .selectAll("path")
  .data(function(d) {
    return d[1];})
  .join("path")
  .attr("fill", d =>color_fill(d.Value))
  .attr("d", d3.arc()     // imagine your doing a part of a donut plot
      .innerRadius(innerRadius_s)
      .outerRadius(function(d){
        if(y_rosa(d['Value'])>max_y){
          max_y = y_s(Math.pow(d['Value'],0.5));
          max_value = d['Value'];
        }
        return y_s(1.2*Math.pow(d['Value'],0.5));})
      .startAngle(d => x_rosa(d.Type))
      .endAngle(d => x_rosa(d.Type) + x_rosa.bandwidth())
      .padAngle(0.01)
      .padRadius(innerRadius))
  .attr("stroke", function(d){
    for(i in AQI_values){
      if(AQI_values[i].Date.toDateString() == d.Date.toDateString()){
      if( d.Type==AQI_values[i]['DFactor']){
        return "#000000";
      }
      else{return "none"}
    }
  }
})
  .style("opacity",function(d){
    for(i in AQI_values){
      if(AQI_values[i].Date.toDateString() == d.Date.toDateString()){
      if( d.Type==AQI_values[i]['DFactor']){
        return 1;
      }
      else{return 0.4}
    }
  }
})
  .attr("stroke-width","1.5px")


// Define the drag behavior
var drag = d3.drag()
    .on("start", dragStarted)
    .on("drag", dragged)
    .on("end", dragEnded);

      svg2.selectAll(".flowers")
      .call(drag);
// Drag start event handler
function dragStarted() {

  currentP = parseTransform(d3.select(this).attr("transform"));
  var clonedElement = d3.select(this.cloneNode(true)).attr("class","clone");
   svg2.node().appendChild(clonedElement.node());
    d3.select(this).raise().classed("active", true);
}

// Dragging event handler
function dragged(event, d) {
    d3.select(this).attr("transform", "translate(" + event.x + "," + event.y + ")");
}

// Drag end event handler
function dragEnded(event, d) {


    d3.select(this).attr("transform", "translate(" + currentP[0] + "," + currentP[1] + ")");
    d3.select(this).classed("active", false);
    svg2.selectAll(".clone").remove()
    fall_area_svg_M.append("text")
    .text("AQI Change")
    .attr("x",0)
    .attr("y",-100)
    .attr("text-anchor", "middle")
    .attr("class", "pullution-axis")

    fall_area_svg_M.append("text")
    .text("Driver Pollutant")
    .attr("x",0)
    .attr("y",-20)
    .attr("text-anchor", "middle")
    .attr("class", "pullution-axis")

    if (event.x >= fall_area_x_L
    && event.x <= fall_area_x_L+fall_area_width
    && event.y >= fall_area_y_L
    && event.y <= fall_area_y_L+fall_area_height){
      var res = create_rosa(fall_area_svg_L, d)
      left_g.selectAll("*").remove()
      left_g.append("text")
      .text(res[0])
      .attr("x",-40)
      .attr("y",-60)
      .attr("fill", color_text(max_value))
      .attr("class","rosa_text")

      left_g.append("text")
      .text(res[1])
      .attr("x",-50)
      .attr("y",20)
      .attr("fill", color_text(max_value))
      .attr("class","rosa_text")
}
    else if (event.x >= fall_area_x_R
    && event.x <= fall_area_x_R+fall_area_width
    && event.y >= fall_area_y_R
    && event.y <= fall_area_y_R+fall_area_height){
      var res = create_rosa(fall_area_svg_R, d)
      right_g.selectAll("*").remove()
      right_g.append("text")
      .text(res[0])
      .attr("x",40)
      .attr("y",-60)
      .attr("fill", color_text(max_value))
      .attr("class","rosa_text")

      right_g.append("text")
      .text(res[1])
      .attr("x",50)
      .attr("y",20)
      .attr("fill", color_text(max_value))
      .attr("class","rosa_text")
    }

    console.log('dragEnded')
}
function create_rosa(svg,d){
      svg.selectAll("*").remove();
      max_y = 0
      max_value = 0
      var factor = ''
      // recover the option that has been chosen
      var selectedOption = d[0].toDateString();
      console.log(selectedOption)
      data_select = [];
      for(i in data){
        if(data[i].Date.toDateString()==selectedOption){
          data_select.push(data[i])
        }
      }
        // Add bars
      data_select.sort((a, b) => b.Value - a.Value);
      data_select1 = []
      for(i in data_select){
        data_select1.push({"Date": data_select[i].Date,
                           "Value":1,
                           "Type":data_select[i].Type,
                           "Month":data_select[i].Month})
      }


      var layer1 = svg.append('g');
      var layer2 = svg.append('g');
      var layer3 = svg.append('g');


      var bars = layer2
          .selectAll("path")
          .data(data_select1)
          .join("path")
          .attr("fill", d =>color_fill(d.Value))
          .style("opacity", 0.7)
          .attr("d", d3.arc()
              .innerRadius(innerRadius)
              .outerRadius(function(d){
                if(y_rosa(Math.pow(d['Value'],0.6))>max_y){
                  max_y = y_rosa(Math.pow(d['Value'],0.6));
                  max_value = d['Value'];
                }
                return y_rosa(Math.pow(d['Value'],0.6));})
              .startAngle(d => x_rosa(d.Type))
              .endAngle(d => x_rosa(d.Type) + x_rosa.bandwidth())
              .padAngle(0.05)
              .padRadius(innerRadius))


        bars.data(data_select).transition()
                .duration(2000)
                .delay(function(d,i){
                  if(i<1){
                  return i*300}
                  else{
                    return i*600+1500;
                  }

                })
            .attr("fill", d =>color_fill(d.Value))
            .style("opacity", 0.7)
            .attr("d", d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(function(d){
                  if(y_rosa(Math.pow(d['Value'],0.6))>max_y){
                    max_y = y_rosa(Math.pow(d['Value'],0.6));
                    max_value = d['Value'];
                  }
                  return y_rosa(Math.pow(d['Value'],0.6));})
                .startAngle(d => x_rosa(d.Type))
                .endAngle(d => x_rosa(d.Type) + x_rosa.bandwidth())
                .padAngle(0.05)
                .padRadius(innerRadius))
                .attr("stroke", function(d){
                  for(i in AQI_values){
                    if(AQI_values[i].Date.toDateString() == d.Date.toDateString()){
                    if( d.Type==AQI_values[i]['DFactor']){
                      factor = d.Type
                      return "#000000";
                    }
                    else{return "none"}
                  }
                }
              })
                .attr("stroke-width","5px")

                // Add the labels
        var pollution_axis = layer2.append("g")
            .selectAll("g")
            .data(data_select)
            .join("g")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) { return "rotate(" + ((x_rosa(d.Type) + x_rosa.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; })
            .append("text")
              .text(function(d){return d.Type})
              .attr("transform", function(d) { return (x_rosa(d.Type) + x_rosa.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
              .attr("class","axis")
              .attr("alignment-baseline", "middle")
              .attr("class","pullution-axis")
              .attr("opacity",0)






        layer2
            .selectAll(".pullution-axis")
            .transition()
            .duration(2000)
            .delay(function(d,i){
              if(i<1){
              return i*300}
              else{
                return i*600+1500;
              }
            })
            .attr("opacity",1)
            .attr("transform", function(d) {
              var h = max_y
              return (x_rosa(d.Type) + x_rosa.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "translate(" + h + ",0)"+"rotate(90)translate(0,16)" : "translate(" + h+ ",0)"+"rotate(-90)translate(0,-9)"; })



        var lines = layer2.append("g")
          .selectAll("line")
          .data(data_select)
          .join("g")
          .append("line")
          .attr('x1', d =>y_rosa(Math.pow(d.Value,0.6))
          )
          .attr('y1', 0)
          .attr('x2', max_y+30)
          .attr('y2', 0)
          .attr('opacity',0)
          .attr("transform", function(d) {
            return "rotate(" + ((x_rosa(d.Type) + x_rosa.bandwidth() / 2) * 180 / Math.PI - 90) + ")"})
          .attr('stroke', d => color_text(d.Value))
          .attr("stroke-width",3)
          //.attr("transform", function(d) { return (x_rosa(d.Type) + x_rosa.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })

        layer2
            .selectAll("line")
            .transition()
            .duration(1200)
            .delay(function(d,i){
              if(i<1){
              return 600}
              else{
                return i*600+2400;
              }
            })
            .attr('opacity',1)

                // Add the labels
        layer2.append("g")
            .selectAll("g")
            .data(data_select)
            .join("g")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) { return "rotate(" + ((x_rosa(d.Type) + x_rosa.bandwidth() / 2) * 180 / Math.PI - 90) + ")"})


        var AQI = layer1.append("g").append('circle')
        .transition()
        .duration(2000)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', max_y)
          .attr("stroke-width", 3)
          .attr('stroke', color_fill(max_value))
          .attr('fill', color_fill(max_value))
          .style("opacity", 0.18)


        var yAxis = layer3
            .attr("text-anchor", "middle");

        var yTick = yAxis
          .selectAll("g")
          .data(rank)
          .enter().append("g");

        yTick.append("circle")
            .attr("fill", "none")
            .style("stroke-dasharray", ("1, 5"))
            .attr("stroke", "#555")
            .attr("r", d=>y_rosa(Math.pow(d,0.6)));


        yTick.append("text")
            .data(rank)
            .attr("y", function(d) { return -y_rosa(Math.pow(d,0.6)); })
            .attr("dy", "0.35em")
            .attr("fill", "none")
            .attr("stroke", "#fff")
            .attr("stroke-width", 3)
            .text(d => d)
            .attr("class","pullution-axis")
            .style("font-size","20")



        yTick.append("text")
            .data(rank)
            .attr("y", function(d) {
              return -y_rosa(Math.pow(d,0.6)); })
            .attr("dy", "0.35em")
            .text(d => d)
            .attr("class","pullution-axis")
            .style("fill", "#999")
            .style("font-size","20")
            .style("font-weight","300")


        var AQI_text = yAxis.append("text")
            .attr("y", 10)
            .attr("dy", "-1em")
            .text("AQI")
            .attr("fill", color_text(max_value))
            .attr("class","rosa_text")

        var AQI_value = yAxis.append("text")
            .attr("y", 60)
            .attr("dy", "-1em")
            .text(max_value)
            .attr("fill", color_text(max_value))
            .attr("class","rosa_text")
            .style("font-size","36px")

        svg.append("text")
              .attr("y", -fall_area_height/2+70)
              .attr("dy", "-1em")
              .text(d[0].toDateString())
              .attr("fill", color_text(max_value))
              .attr("class","rosa_text")

        return [max_value, factor];


}
    // Function to parse the transform attribute and extract the position
function parseTransform(transform) {
    var translate = transform.match(/translate\(([^)]+)\)/)[1].split(",");
    var x = parseFloat(translate[0]);
    var y = parseFloat(translate[1]);
    return [x, y];
}

svg2.selectAll(".flowers").transition()
  .duration(2000)
  .attr("transform", function(d){
    for(i in AQI_values){
      if(AQI_values[i].Date == d[0]){
        return `translate(${x_line(d[0])+0}, ${y_line(AQI_values[i].Value)})`}
      }
    })


svg2.append('g')
.attr("clip-path", "url(#clip)")
.selectAll("line")
  .data(AQI_values, function(d) {
    return d.Type+':'+d.Date;})
  .join("line")
  .attr("class","flowers-bar")
  .attr('x1', function(d) { return x_line(d.Date)+0 })
  .attr('y1', function(d) { return y_line(0)})
  .attr('x2', function(d) { return x_line(d.Date)+0})
  .attr('y2', function(d) { return y_line(0)})
  .transition()
    .duration(2000)
  .attr('y2', function(d) { return y_line(d.Value)})
  .attr('stroke', d => color_fill(d.Value))
  .attr("stroke-width","5px")


// Create the line generator
var line = d3.line()
    .x(function(d) {
      return x_line(d.Date)+0})
    .y(function(d) { return  y_line(d.Value)})

const lines = svg2.append("path").attr("clip-path", "url(#clip)")
      .datum(AQI_values)
  .join("path")
  .attr("class","AQI_line")
  .attr("fill", "none")
  .attr("stroke", "#121212")
  .attr("opacity", 0.5)
  .attr("stroke-width", 1.5)
  .attr("d", line)
      // Calculate the total length of the path
const totalLength = lines.node().getTotalLength();

// Set initial styles for the path
lines.attr("stroke-dasharray", totalLength + " " + totalLength)
     .attr("stroke-dashoffset", totalLength)
     .transition()
    .delay(2000)
     .duration(2000) // Animation duration in milliseconds
     .ease(d3.easeLinear) // Use linear easing for constant speed
     .attr("stroke-dashoffset", 0);

// Enable zooming on the x-axis
var zoom = d3.zoom()
   .scaleExtent([0.1, 4.5]) // Set the zoom scale limits if necessary
   .on("zoom", function (event) {
     console.log("Zoom")
       // Update the x-axis scale based on the zoom transform
       var x_line_new = event.transform.rescaleX(x_line);
       svg2.selectAll(".flowers")
       .attr("transform", function(d){
           for(i in AQI_values){
             if(AQI_values[i].Date == d[0]){
               return `translate(${x_line_new(d[0])+0}, ${y_line(AQI_values[i].Value)})`}
             }
           })
      svg2.selectAll(".flowers-bar")
      .attr('x1', function(d) { return x_line_new(d.Date)+0 })
      .attr('x2', function(d) { return x_line_new(d.Date)+0 })
      svg2.selectAll(".Month-bar")
      .attr('x1', d => x_line_new(parseDate1(d)))
      .attr('x2', d => x_line_new(parseDate1(d)))
      svg2.selectAll(".Month-annotate")
      .attr("x", d => 20+x_line_new(parseDate1(d)))

      svg2.selectAll(".AQI_line")
            .attr("d", line.x(function (d) {
            return x_line_new(d.Date)+0}) )
       svg2.selectAll(".x-axis").call(d3.axisBottom(x_line_new));


       svg3.selectAll(".factor-bar").attr("x", function(d) { return x_line_new(d.Date)-Math.sqrt(d.Value/300)*25 })
       svg3.selectAll(".AQIrect").attr("x", function(d) { return x_line_new(d.Date)-Math.sqrt(d.Value/300)*25 })
       svg3.selectAll(".Factorrect")
       .attr("x", function(d) { return x_line_new(d.Date)+5-(10+Math.sqrt(d.Value/300)*25 )})//x_line.bandwidth())/2 })
       sparklines.x(d => x_line_new(d.Date))//x_line.bandwidth()/2)
       svg3.selectAll(".sparks").attr("d", function(d){
         return sparklines(d[1])})
       svg3.selectAll(".Month-bar")
       .attr('x1', d => x_line_new(parseDate1(d)))
       .attr('x2', d => x_line_new(parseDate1(d)))
       svg3.selectAll(".Month-annotate")
       .attr("x", d => 20+x_line_new(parseDate1(d)))
       svg3.selectAll(".x-axis").call(d3.axisBottom(x_line_new));

   });

// Add the path using this helper function
svg2.append('rect')
 .attr('x', 0)
 .attr('y', y_line(0))
 .attr('width', width2)
 .attr('height', 100)
 .attr('stroke', 'black')
 .attr('fill', '#69a3b2')
 .attr("opacity",0).call(zoom);


var first_date = ['2/1/2023','3/1/2023','4/1/2023','5/1/2023','6/1/2023','7/1/2023']

svg2.append('g').attr("clip-path", "url(#clip)")
.selectAll("line")
  .data(first_date)
  .join("line")
  .attr("class","Month-bar")
  .attr('x1', d => x_line(parseDate1(d)))
  .attr('y1', y_line(0))
  .attr('x2', d => x_line(parseDate1(d)))
  .attr('y2', y_line(300))
  .attr("stroke-width","6px")
  .style("stroke-dasharray", ("3, 5"))
   .attr('stroke', 'black')

svg2.append('g').attr("clip-path", "url(#clip)")
.selectAll().data(first_date)
.enter().append("text")
.attr("class","Month-annotate")
 .attr("x", d => 20+x_line(parseDate1(d)))
 .attr("y", y_line(200))
 .text(d => d)


 // Add the path using this helper function
 svg3.append('rect')
  .attr('x', 0)
  .attr('y', y_line(0))
  .attr('width', width2)
  .attr('height', 100)
  .attr('stroke', 'black')
  .attr('fill', '#69a3b2')
  .attr("opacity",0).call(zoom);




svg3.append("g")
  .attr("transform", `translate(0, ${height3})`)
  .call(d3.axisBottom(x_line))
  .attr("class","x-axis");


// Create a Y scale for densities
const y_r = d3.scaleBand()
  .domain(['AQI','O3','PM2.5','PM10','CO','NO2','SO2'])
  .range([0, height3])
  .padding(0.2);


svg3.append("g")
  .call(d3.axisLeft(y_r))
  .attr("class","axis");

var clip = svg3.append("defs").append("svg:clipPath")
    .attr("id", "clip3")
    .append("svg:rect")
    .attr("width", width3 )
    .attr("height", height3 )
    .attr("x", 0)
    .attr("y", 0);
/*
svg3.append("g")
.attr("class", "x-axis")
  .attr("transform", `translate(0, ${y_r('O3')+34.5})`)
  .call(d3.axisBottom(x_r));

svg3.append("g")
.attr("class", "x-axis")
  .attr("transform", `translate(0, ${y_r('PM2.5')+34.5})`)
  .call(d3.axisBottom(x_r));

svg3.append("g")
.attr("class", "x-axis")
  .attr("transform", `translate(0, ${y_r('PM10')+34.5})`)
  .call(d3.axisBottom(x_r));

svg3.append("g")
.attr("class", "x-axis")
  .attr("transform", `translate(0, ${y_r('CO')+34.5})`)
  .call(d3.axisBottom(x_r));

svg3.append("g")
.attr("class", "x-axis")
  .attr("transform", `translate(0, ${y_r('NO2')+34.5})`)
  .call(d3.axisBottom(x_r));

svg3.append("g")
.attr("class", "x-axis")
  .attr("transform", `translate(0, ${y_r('SO2')+34.5})`)
  .call(d3.axisBottom(x_r));

svg3.selectAll(".x-axis")
   .selectAll("text")
   .remove();
*/
svg3.append('g').attr("clip-path", "url(#clip3)").append("rect")
  .attr('x', 0 )
  .attr('y', y_r("AQI")-y_r.bandwidth()/2)
  .attr('width', width3)
  .attr('height', y_r.bandwidth())
  .attr("fill",'#BDBDBD')
  .style("opacity",'0.4')
/*
// Add areas
svg3.selectAll()
  .data(data, function(d) {return d.Type+':'+d.Date;})
  .join("rect")
  .style("anchor", "middle")
  .attr("x", function(d) { return x_r(d.Date)+x_r.bandwidth()/2-Math.sqrt(d.Value/300)*x_r.bandwidth()/2 })
  .attr("y", function(d) { return y_r(d.Type)+y_r.bandwidth()/2-Math.sqrt(d.Value/300)*y_r.bandwidth()/2})
  .attr("width", function(d) { return Math.sqrt(d.Value/300)*x_r.bandwidth()})
  .attr("height", function(d) { return Math.sqrt(d.Value/300)*y_r.bandwidth()})
  .style("fill", function(d) { return color(d.Value)} )
  .style("opacity", function(d){return 0.7})
*/
function cal_height(d){
  return (d/250)**(3/5)*y_r.bandwidth();
}
svg3.append('g').attr("clip-path", "url(#clip3)").selectAll()
  .data(data, function(d) {return d.Type+':'+d.Date;})
  .join("rect")
  .style("anchor", "middle")
  .attr("class","factor-bar")
  .attr("x", function(d) {
    return x_line(d.Date)-(x_line(data[1].Date)-x_line(data[0].Date))*0.7/2 })
  .attr("y", function(d) { return y_r(d.Type)+y_r.bandwidth()/2-cal_height(d.Value)})
  .attr("width", (x_line(data[1].Date)-x_line(data[0].Date))*0.7)//function(d) { return Math.sqrt(d.Value/300)*50})//x_line.bandwidth()})
  .attr("height", d => cal_height(d.Value))
  .style("fill", function(d) { return color_fill(d.Value)} )
  .style("opacity", function(d){
    for(i in AQI_values){
      if(AQI_values[i].Date.toDateString()==d.Date.toDateString()){
        if (d.Type==AQI_values[i].DFactor){
          return 1
        }
        else{
          return 0.4
        }
      }
    }})

// Define line generator
const sparklines = d3.line()
    .x(d => x_line(d.Date))//x_line.bandwidth()/2)
    .y(d => y_r(d.Type)+y_r.bandwidth()/2-cal_height(d.Value)+cal_height(d3.max(d.Value)))

// Draw lines for each category
svg3.append('g').attr("clip-path", "url(#clip3)").selectAll(".line")
    .data(sumstat)
    .enter().append("path")
    .attr("class","sparks")
    //.attr("class", d => "line " + d.category)
    .attr("d", function(d){
      return sparklines(d[1])})
    .style("fill", "none")
    .style("stroke", "steelblue")

// Add areas
svg3.append('g').attr("clip-path", "url(#clip3)").selectAll()
  .data(AQI_values, function(d) {
    return d.Type+':'+d.Date;})
  .join("rect")
  .attr("class","AQIrect")
  .attr("x", function(d) { return x_line(d.Date)-(x_line(data[1].Date)-x_line(data[0].Date))*0.7/2})//x_line.bandwidth()/2 })
  .attr("y", function(d) { return y_r(d.DFactor)+y_r.bandwidth()/2-cal_height(d.Value)})
  .attr("width", (x_line(data[1].Date)-x_line(data[0].Date))*0.7)//function(d) { return Math.sqrt(d.Value/300)*50})//*x_line.bandwidth()})
  .attr("height", d => cal_height(d.Value))
  .style("fill", function(d) { return color_fill(d.Value)} )
  .style("opacity", 1)//function(d){return cal_opacity(d.Value)})


svg3.append('g').attr("clip-path", "url(#clip3)").selectAll()
  .data(AQI_values, function(d) {
    return d.Type+':'+d.Date;})
  .join("rect")
  .attr("class","Factorrect")
  .attr("x", function(d) { return x_line(d.Date)-(x_line(data[1].Date)-x_line(data[0].Date))*0.9/2 })//x_line.bandwidth())/2 })
  .attr("y", function(d) { return y_r(d.DFactor)+y_r.bandwidth()/2})
  .attr("width", (x_line(data[1].Date)-x_line(data[0].Date))*0.9)//function(d) { return 10+Math.sqrt(d.Value/300)*50})//x_line.bandwidth()})
  .attr("height", 0)
  .style("fill", "none" )
  .style("stroke",'red')
  .style("stroke-width",2)

function performTransition() {

svg3.selectAll(".AQIrect")
  .attr("y", function(d) { return y_r(d.DFactor)+y_r.bandwidth()/2-cal_height(d.Value)})

svg3.selectAll(".Factorrect")
  .attr("height", 0)
  .attr("y", function(d) { return y_r(d.DFactor)+y_r.bandwidth()/2})

svg3.selectAll(".AQIrect")
  .transition()
  .duration(2000)
  .attr("y", function(d) { return y_r(d.Type)+y_r.bandwidth()/2-cal_height(d.Value)})
  //.delay(function(d,i){return(i*250)})
svg3.selectAll(".Factorrect")
.transition()
.duration(2000)
  .attr("height", function(d) { return 10+cal_height(d.Value)})
    //.delay(function(d,i){return(i*250)})
  .attr("y", function(d) { return y_r(d.DFactor)+y_r.bandwidth()/2-(10+cal_height(d.Value))})
  }
  // Call the function initially
  performTransition();
  // Repeat the transition every 3000 milliseconds (3 seconds)
  setInterval(performTransition, 7000);

svg3.append('g').attr("clip-path", "url(#clip3)")
.selectAll("line")
  .data(first_date)
  .join("line")
  .attr("class","Month-bar")
  .attr('x1', d => x_line(parseDate1(d)))
  .attr('y1', y_line(0))
  .attr('x2', d => x_line(parseDate1(d)))
  .attr('y2', y_r("AQI"))
  .attr("stroke-width","6px")
  .style("stroke-dasharray", ("3, 5"))
   .attr('stroke', 'black')

svg3.append('g').attr("clip-path", "url(#clip3)").selectAll().data(first_date)
.enter().append("text")
.attr("class","Month-annotate")
 .attr("x", d => 20+x_line(parseDate1(d)))
 .attr("y", y_r("AQI"))
 .text(d => d)
/*
// Draw lines for each category
svg3.append("path")
    .datum(AQI_values)
    //.attr("class", d => "line " + d.category)
    .attr("d", function(d){
      return sparklines(d)})
    .style("fill", "none")
    .style("stroke", "steelblue")
*/
/*
svg3.selectAll()
  .data(AQI_values, function(d) {
    return d.Type+':'+d.Date;})
  .join("line")
  .attr('x1', function(d) { return x_r(d.Date)+x_r.bandwidth()/2 })
  .attr('y1', function(d) { return y_r(d.Type)+y_r.bandwidth()/2})
  .attr('x2', function(d) { return x_r(d.Date)+x_r.bandwidth()/2})
  .attr('y2', function(d) { return -10+y_r(d.DFactor)+y_r.bandwidth()/2-cal_height(d.Value)})
  .attr('stroke', 'red')

*/



const data1=[]

const data2 = {'SO2':[],
               'NO2':[],
               'PM10':[],
               'PM2.5':[],
               'O3':[],
               'CO':[]
             }

for (const [key, value] of by_date.entries()) {
  name_list = []
  numbers = []
  values = []
  for(i in value){
    name_list.push(value[i].Type)
    numbers.push(value[i].Value)
  }
  // Create an array of objects with original values and indices
const indexedNumbers = numbers.map((value, index) => ({ value, index }));

// Sort the array of objects based on the 'value' property
indexedNumbers.sort((a, b) => a.value - b.value);
number_sort = numbers.sort(function(a, b) {
    return a - b;
});
// Extract the sorted indices
const sortedIndices = indexedNumbers.map(item => item.index);
for(i in sortedIndices){
  data2[name_list[sortedIndices[i]]].push({"rank":1+Number(i),"AQI":Number(number_sort[i])})
}
}
for(i in data2){
  values = []
  A = []
  for(j in data2[i]){
    values.push(data2[i][j].rank)
    A.push(data2[i][j].AQI)
  }
  data1.push({"category":i,"values":values,"AQI":A})
}

// Define scales
const xScale = d3.scaleLinear()
    .domain([-1, data1[0].values.length ]) // assuming all categories have the same number of values
    .range([0, width4]);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data1, d => d3.max(d.values))])
    .nice()
    .range([height4, 0]);

// Define line generator
const line_G = d3.line()
    .x((d, i) => xScale(i))
    .y(d => yScale(d))

// Draw lines for each category
svg4.selectAll(".line")
    .data(data1)
  .enter().append("path")
    //.attr("class", d => "line " + d.category)
    .attr("d", d => line_G(d.values))
    .style("fill", "none")
    .style("stroke", d =>color_fill(d3.max(d.AQI)))
    .style("stroke-width",function(d){
      return (1+d3.mean(d.values))**2/2})
    .style("opacity",function(d){
      return d3.min(d.values)/6})

/*
for(j in data2){
  console.log(data2[j])
  // Add circles as marks

svg4.selectAll(".circle")
    .data(data2[j])
  .enter().append("circle")
    .attr("cx", function(d,i){
      console.log(d,i)
      return xScale(i)})
    .attr("cy", d => yScale(d.rank))
    .attr("r", d => 12) // Radius of the circle marks
    .attr("fill",d => color(d.AQI))
    .attr("opacity",0.7)
}
*/
// Add labels for categories
svg4.selectAll(".category-label")
    .data(data1)
  .enter().append("text")
    .attr("class", "category-label")
    .attr("x", d => xScale(Math.floor(d.values.length/2)))
    .attr("y", d => yScale(d.values[Math.floor(d.values.length/2) ]))
    .text(d => d.category)
    .attr("text-anchor", "middle")
    .style("fill", "steelblue")
    .style("font-size", "20px")
    .attr("dy", ".35em");

// Add x-axis
svg4.append("g")
    .attr("transform", "translate(0," + height4 + ")")
    .call(d3.axisBottom(xScale));

// Add y-axis
svg4.append("g")
    .call(d3.axisLeft(yScale));

});
