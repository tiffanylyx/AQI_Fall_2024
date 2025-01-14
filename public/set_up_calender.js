
// set the dimensions and margins of the graph
select_date = 193
let container = d3.select('#daily_chart');

// Get the width of the container div
let containerWidth = screen.width*0.4//container.node().getBoundingClientRect().width;
let containerHeight = screen.height*0.8//container.node().getBoundingClientRect().height;

const margin = {top: -50, right: 0, bottom: 0, left: 0},
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom,
    innerRadius = 0,
    outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border
// Create SVG canvas
const svg = d3.select('#daily_chart').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`);
const barHeight = outerRadius - innerRadius;
const buttun_line_padding = 80
// Sample data
const data = [
  { Type: 'NO2', Value: 78 },
  { Type: 'CO', Value: 117 },
  { Type: 'PM10', Value: 50 },
  { Type: 'O3', Value: 94 },
  { Type: 'SO2', Value: 195 },
  { Type: 'PM2.5', Value: 117 },
];
const types = ['NO2','O3','CO','PM10','PM2.5','SO2']
const rank = [0,50,100,150,200,300,500]
// Create a scale for the angles
const angleScale = d3.scaleBand()
  .range([0, 2 * Math.PI])
  .domain(data.map(d => d.Type))
  .padding(0);

// Create a radial scale for the radius
const radiusScale = d3.scaleLinear()
  .range([innerRadius, outerRadius])
  .domain([0, 500]);

// Function to calculate rotation for each bar
const calculateRotation = d => (angleScale(d.Type) * 180 / Math.PI-90)
var barwidth=30

let AQI_value = 0
let DP
let scaleFactor
if(chart_type=='bar'){
  scaleFactor = screen.width/(14*bar_height(300))
}
else{
  scaleFactor = screen.width/(11*bar_height(300))
}

const circle_bar = svg.append('g')
var layer1 = circle_bar.append('g');
var layer2 = circle_bar.append('g');
var layer3 = circle_bar.append('g');
function parseDate(dateString) {
  const [month, day,year] = dateString.split('/');
  const res  = new Date(year, month - 1, day)//.getDate()
  return res;
}
const csvFile1 = '2014-2023.csv';
const csvFile2 = 'info.csv';

// Load both files concurrently
Promise.all([
  d3.csv(csvFile1),
  d3.csv(csvFile2)
]).then(function([dataall, info]) {

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
  var allTime = [];
  for(i in data){
    if(!allTime.includes(data[i].Date_org)){allTime.push(data[i].Date_org);}
  }
  var date = allTime[select_date]

  var by_date = d3.group(data, d => d.Date);
  // Convert the Map object to an array of key-value pairs using .entries()
  var entries = Array.from(by_date.entries());

  // Filter out entries where either key or values are undefined
  var filteredEntries = entries.filter(([key, values]) => key !== undefined && values !== undefined);

  // Convert the filtered entries back to a Map if needed
  by_date = new Map(filteredEntries);
  var data_select = [];
  for(i in data){
    if(data[i].Date_org===date){
      data_select.push(data[i])
    }
  }
  var data_for_day = []
  for(i in data_select){
    state = 'Missing'
    if(types.includes(data_select[i].Type)){
      state = 'In'
    }
    data_for_day.push({'Type':data_select[i].Type,
    'Value': parseInt(data_select[i].Value,10),
    'State':state})
  }
  if(chart_type=='circular'){
    create_rosa(date,data_for_day,info)
  }
  else{
    create_bar(date,data_for_day,info)
  }
  
  // The scaling factor, e.g., 2 would double size, 0.5 would halve it


  // Apply the scaling transform to a group element that contains all other elements
  
})
const floatingDiv = d3.select('#daily_chart').append('div')
    .attr('class', 'floating-base floating-div-left')
    .style('top',60)
    .style('left',30)

const date_text = floatingDiv.append('div')
    .attr('class', 'date-text')


const AQI_text = floatingDiv.append('div')
    .attr('class', 'aqi-value')
const status = floatingDiv.append('div').attr('class', 'text-info')

const health = status.append('span')
    .attr('class', 'pollutant-text-left')
    status.append('span').text("•").attr("class",'separator')

const DP_text = status.append('span')
    .attr('class', 'pollutant-text-right')
function create_bar(date,data_select,info){
  d3.select("#year-view-header").style("display","none")
  AQI_value = 0
  let move_y = 140
  barwidth = 60
  var data = []
  var typesArray = data_select.map(item => item.Type);

  for(i in types){
    if(typesArray.includes(types[i])){
    data.push({'Type':types[i],
    'Value': parseInt(data_select.find(item => item.Type === types[i]).Value,10)})
  }
  else{
    data.push({'Type':types[i],
    'Value': 0})
  }
}
svg.selectAll("*").remove()
var padding_bar = 80

const circle_bar = svg.append('g').attr("id",'circle_bar')
var layer1 = circle_bar.append('g').attr("id",'layer1');
var layer2 = circle_bar.append('g').attr("id",'layer2');
var layer3 = circle_bar.append('g').attr("id",'layer3')
barGroups = layer3

.selectAll('g')
.data(data)
.enter()
.append('g')
.attr("transform", function(d,i) {
  return `translate(${(i-5/2)*(padding_bar+barwidth)-50},${move_y})`;
})

// Append a rect to each group
bars = barGroups.append('rect')
.attr('x', 0)
  .attr('y', d => -bar_height_bar(d.Value, outerRadius, innerRadius ))
  .attr('rx', barwidth / 10) // Rounded corners
  .attr('ry', barwidth / 10) // Rounded corners
  .attr('width', barwidth)
  .attr('height', d => bar_height_bar(d.Value, outerRadius, innerRadius ))
  .attr('fill', function(d){
    if(AQI_value < parseInt(d.Value)){
      AQI_value = parseInt(d.Value)
      DP = d.Type
    }
    return color_fill(d.Value, view_type)
  })
  .attr("stroke", function(d){
    if(d.Type==DP){
      return 'Black'
    }
    else{ return 'None'}
  })
  .attr("stroke-width", function(d){
    if(d.Type==DP){
      return 4
    }
    else{ return 0}
  })
  for (let index = 0; index < data.length; index++) {
    data_1 = data[index]
    text_group = layer3.append("g").attr("transform",`translate(${(index-5/2)*(padding_bar+barwidth)-60+barwidth/2},${move_y+30})`)
      
    labels1 = text_group.append('text')
    .attr("x", -10) // Position the text in the center of the rect
    .attr("y",0) // Adjust the position accordingly
    .style("text-anchor","middle")
    .attr("dy", 0.3)
    .attr("dominant-baseline", "central") // Vertically center the text
    .text(function() {
      for(i in info){
        if ( data_1.Type==info[i].Name){
          return info[i].Full+" ("+data_1.Type+")"
        }
      }
    })
    .attr("fill", 'black')
    .style("font-size",14)
    .attr("id",data_1.Type)
    labels1.call(wrapText, 67);

  bbox = labels1.node().getBBox()
  textWidth = bbox.width;
  textHeight = bbox.height;

  
  // Now append a text element to each group
  labels2 = text_group.append('text')
  .attr("x", 40) // Position the text in the center of the rect
  .attr("y",  textHeight/2) // Adjust the position accordingly
    .attr("text-anchor", "middle") // Center the text
    .attr("dominant-baseline", "central") // Vertically center the text
    .text(function() {
      return data_1.Value; // Assuming each datum has a label property
    })
    .style("font-size", "30px") // Smaller font size for the AQI range
    .attr("dx", "0.3em").style('fill',function(){
        if(data_1.Type==DP){
          if((AQI_value<101)&&(AQI_value>30)){
            return 'Black'
          }
          else{
            return 'White'
          }
        }
        else{
          return color_fill(data_1.Value,view_type)
        }
      })
  bbox = text_group.node().getBBox()
  textWidth = bbox.width;
  textHeight = bbox.height;
  padding_h = 10
  padding_v=10
  rec = text_group.insert('rect', 'text') // Insert rectangle before the text element
      .attr('x', bbox.x - padding_h / 2)
      .attr('y', -8)
      .attr('rx', textHeight / 4) // Rounded corners
      .attr('ry', textHeight / 4) // Rounded corners
      .attr('width', 120)
      .attr('height', 70)
      .style('fill',function(){
              if(data_1.Type==DP){
                return color_fill(data_1.Value,view_type)
              }
              else{
                return 'white'
              }
            })
      .attr("class",data_1.Type)
      .attr("id",data_1.Value)
      .style('stroke', function(){
        if(data_1.Type!=DP){
          return color_fill(data_1.Value,view_type)
        }
        else{
          return 'Black'
        }
      } )
      .style('stroke-width',function(){
              if(data_1.Type==DP){
                return '4'
              }
              else{
                return '3'
              }

            } )
  //.style('filter', 'url(#drop-shadow)');
  rec.on('click',function(){
    event.stopPropagation();
    var type = d3.select(this).attr('class')
    var value = d3.select(this).attr('id')
    if(value=='Missing'){
      console.log("Calendar: Open_Info_Card: Missing")
      event.stopPropagation();
      var overlay_Missing = document.getElementById('overlay_Missing');
    // Show the overlay
    overlay_Missing.style.display = 'block';
    }
    else{
      for(i in info){
        if(info[i].Name===type){
          openOverlay(type,info[i])
        }
      }
    }
  })
  // Move text to the front if needed (for browsers that don't support 'insert')
 

  if(data_1.Type==DP){
  DP_group = text_group.append("g")
  .attr("text-anchor", "middle")
  // Define the points for the triangle
  var points = [
    {x: -18, y: 0}, // Adjusted for center positioning (-10, 0)
    {x: 18, y: 0}, // Adjusted for center positioning (10, 0)
    {x: 0, y: 18*1.73} // Adjusted for center positioning (0, -17)
  ];

  // Draw the triangle using a path element
  DP_group.append("path")
    .attr("d", d3.line()
      .x(function(d) { return d.x+10; })
      .y(function(d) { return d.y-bar_height_bar(AQI_value, outerRadius, innerRadius )-70; })
      .curve(d3.curveLinearClosed) // This makes the path closed
    (points))
    .style("fill", color_fill(AQI_value,view_type)); // Style the text color
  DP_info = DP_group.append("text").attr("x",10).attr("y",-bar_height_bar(AQI_value, outerRadius, innerRadius )-80);


  // Append the text "Driver Pollutant"
  DP_info
  .text(" Driver Pollutant")
  .style("font-size", "26px")
  .style("font-weight", "bold")
  .style("text-decoration", "underline")
  .style("fill", color_fill(AQI_value,view_type)); // Style the text color

  

  const bbox = DP_info.node().getBBox();
  const textWidth = bbox.width;
  const textHeight = bbox.height;
  DP_group
      .on('click',function(){
        console.log("Calendar: Open_Info_Card: DP")
        event.stopPropagation();
        var overlay_DP = document.getElementById('overlay_DP');
      // Show the overlay
      overlay_DP.style.display = 'block';}
      )
}
  }


AQI_y =-bar_height_bar(AQI_value, outerRadius, innerRadius )+move_y
  AQI_line_0 = layer1
  .append("line")
  .attr("x1",(3)*(padding_bar+barwidth))
  .attr("x2",(-3)*(padding_bar+barwidth))
        .attr("y1",AQI_y)
        .attr("y2",AQI_y)
        .attr("stroke", color_fill(AQI_value,view_type)) // arrow.attr can also be used as a getter
        .attr("fill", color_fill(AQI_value,view_type))
        .attr("stroke-width", 5)
        .attr("opacity",1)
AQI_text_0 = layer1.append("text")
.attr("class","sub_title")
.attr("x",0-barwidth/2)
.attr("y",AQI_y-20 )
.attr("text-anchor", "middle")
.text("AQI = "+AQI_value)
.attr('fill',color_fill(AQI_value,view_type))
.attr("opacity",1)
x_axis = layer1
.append("line")
.attr("x1",(3)*(padding_bar+barwidth))
.attr("x2",(-3)*(padding_bar+barwidth))
      .attr("y1",move_y)
      .attr("y2",move_y)
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("opacity",1)
y_axis = layer1
.append("line")
.attr("x1",(-3)*(padding_bar+barwidth))
.attr("x2",(-3)*(padding_bar+barwidth))
      .attr("y1",move_y)
      .attr("y2",move_y-bar_height_bar(500,outerRadius,innerRadius))
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("opacity",1)
for (i in rank){
  layer2.append("text")
  .text(rank[i])
  .attr("x", (-3)*(padding_bar+barwidth)-10)
  .attr("y",move_y-bar_height_bar(rank[i],outerRadius,innerRadius))
  .attr("text-anchor","end")
  .attr("fill","black")
  if(i>0){
    layer2.append("rect")
    .attr("x",(-3)*(padding_bar+barwidth)-5)
    .attr("y",move_y-bar_height_bar(rank[i],outerRadius,innerRadius))
    .attr("width",10)
    .attr("height",bar_height_bar(rank[i],outerRadius,innerRadius)-bar_height_bar(rank[i-1],outerRadius,innerRadius))
    .attr("fill",color_fill(rank[i-1],view_type))
  }

}
date_text.text(text_to_display(date));
AQI_text.text('AQI: '+AQI_value).style('fill',color_fill(AQI_value,view_type));
health.text(color_type(AQI_value));

DP_text.text( 'Driver Pollutant: '+DP).style('fill',color_fill(AQI_value,view_type));
floatingDiv.style("border-top", "10px solid "+color_fill(AQI_value,view_type))
svg.attr('transform', `translate(${width / 2}, ${height / 2}) scale(${scaleFactor})`)
}
function create_rosa(date,data_select,info){
  d3.select("#year-view-header").style("display","none")
  var data = []
  var typesArray = data_select.map(item => item.Type);

  for(i in types){
    if(typesArray.includes(types[i])){
    data.push({'Type':types[i],
    'Value': parseInt(data_select.find(item => item.Type === types[i]).Value,10)})
  }
  else{
    data.push({'Type':types[i],
    'Value': 'Missing'})
  }
}


  AQI_value = 0
svg.selectAll("*").remove()
const circle_bar = svg.append('g').attr("id",'circle_bar').attr("transform",'translate(0,25)')
var layer1 = circle_bar.append('g').attr("id",'layer1');
var layer2 = circle_bar.append('g').attr("id",'layer2');
var layer3 = circle_bar.append('g').attr("id",'layer3');
const bars = layer3
  .selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', -barwidth / 2)
  .attr('y', d => -bar_height(d.Value, outerRadius, innerRadius ))
  .attr('rx', barwidth / 5) // Rounded corners
  .attr('ry', barwidth / 5) // Rounded corners
  .attr('width', barwidth)
  .attr('height', d => bar_height(d.Value, outerRadius, innerRadius ))
  .attr('fill', function(d){
    if(AQI_value < parseInt(d.Value)){
      AQI_value = parseInt(d.Value)
      DP = d.Type
    }
    return color_fill(d.Value,view_type)
  })
  .attr("stroke", function(d){
    if(d.Type==DP){
      return 'Black'
    }
    else{ return 'None'}
  })
  .attr("stroke-width", function(d){
    if(d.Type==DP){
      return 6
    }
    else{ return 0}
  })
  // First translate to the bottom center, then rotate
  .attr('transform', d => `rotate(${calculateRotation(d)})`);
const circle = layer3.append('circle')
.attr('cx', 0)
.attr('cy', 0)
.attr('r',barwidth)
.attr("fill","white")

const AQI_mark =  layer2.append('circle')
.attr('cx', 0)
.attr('cy', 0)
.attr('r',bar_height(AQI_value, outerRadius, innerRadius ))
.attr("fill","none")
.attr("stroke",color_fill(AQI_value,view_type))
.attr("stroke-width",6)

const lines = layer1.append("g")
  .selectAll("line")
  .data(data)
  .join("g")
  .append("line")
  .attr('y1', 0)
  .attr('x1', 0)
  .attr('y2', -bar_height(AQI_value, outerRadius, innerRadius )-buttun_line_padding)
  .attr('x2', 0)
  .attr('transform', d => `rotate(${calculateRotation(d)})`)
  .attr('stroke', d => color_fill(d.Value,view_type))
  .attr("stroke-width",3)
  .style("stroke-dasharray", ("5, 5"))
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
      .attr("r", d=>bar_height(d,outerRadius,innerRadius));
  yTick.append("text")
      .data(rank)
      .attr("y", function(d) { return -bar_height(d,outerRadius,innerRadius) })
      .attr("dy", "0.35em")
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .text(d => d)
      .attr("class","pullution-axis")
      .style("font-size","14")



  yTick.append("text")
      .data(rank)
      .attr("y", function(d) {
        return -bar_height(d,outerRadius,innerRadius) })
      .attr("dy", "0.35em")
      .text(d => d)
      .attr("class","pullution-axis")
      .style("fill", "#999")
      .style("font-size","16")
      .style("font-weight","300")

// Draw the button background
const padding_h = 20;
const padding_v = 12;
// Add the text to the SVG first to measure it
for (i in data){
  text_group = layer3.append("g")
      .attr("text-anchor", "middle")
      .attr("transform",  function(){
        var indicate = 1
        if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
          indicate = 1
        }
        else{indicate = -1}
      return `translate(${60*indicate+(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.cos(Math.PI+angleScale(data[i].Type))},
      ${(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.sin(Math.PI+angleScale(data[i].Type))})`
    })
  text = text_group.append("text")  .attr("x", 0) // Set the x position of the text element
  .attr("y", 0) .style("dominant-baseline", "middle")
  text.append("tspan")
    .text(function() {
      var textContent = '';
      for (var j in info) {
        if (data[i].Type === info[j].Name) {
          textContent = info[j].Full + ' (' + info[j].Name + ') ';
          break; // Exit the loop once the match is found
        }
      }
      return textContent;
    })
    .style('fill',function(){
      if(data[i].Type==DP){
        if((AQI_value<101)&&(AQI_value>50)){
          return 'Black'
        }
        else{
          return 'White'
        }
      }
      else{
        return 'Black'
      }
    })
    .style("font-size",'14px')

  text.append("tspan")
  .text(data[i].Value)
  .style("font-size", "26px") // Smaller font size for the AQI range
    .attr("dx", "0.3em").style('fill',function(){
      if(data[i].Type==DP){
        if((AQI_value<101)&&(AQI_value>50)){
          return 'Black'
        }
        else{
          return 'White'
        }
      }
      else{
        return color_fill(data[i].Value,view_type)
      }
    })
    .style("font-weight", "bold")
    .style("font-family","Arial")
  // Calculate text dimensions
  const bbox = text.node().getBBox();
  const textWidth = bbox.width;
  const textHeight = bbox.height;


  // Draw the button background behind the text
  text_group.insert('rect', 'text') // Insert rectangle before the text element
      .attr('x', bbox.x - padding_h / 2)
      .attr('y', bbox.y - padding_v / 2)
      .attr('rx', textHeight / 4) // Rounded corners
      .attr('ry', textHeight / 4) // Rounded corners
      .attr('width', textWidth + padding_h)
      .attr('height', textHeight + padding_v)
      .style('fill', function(){
        if(data[i].Type==DP){
          return color_fill(data[i].Value,view_type)
        }
        else{
          return 'White'
        }
      } )
      .style('stroke', function(){
        if(data[i].Type!=DP){
          return color_fill(data[i].Value,view_type)
        }
        else{
          return 'Black'
        }
      } )
      .style('stroke-width', '4');
  text_group.attr("transform",  function(){
        var indicate = 1
        if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
          indicate = 1}
        else{indicate = -1}
      return `translate(${textWidth/2*indicate+(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.cos(Math.PI+angleScale(data[i].Type))},
      ${(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.sin(Math.PI+angleScale(data[i].Type))})`
    })
    text_group.on('click',function(){
      event.stopPropagation();
      text = d3.select(this).select('text').text().split(' ')
      var value = text.at(-1);
      text.pop();
      var newtext = text.join(' ')

      var a = newtext.split('(')
      a.pop()
      newtext = a.join(' ')
      if(value=='Missing'){
        console.log("Calendar: Open_Info_Card: Missing")
        event.stopPropagation();
        var overlay_Missing = document.getElementById('overlay_Missing');
      // Show the overlay
      overlay_Missing.style.display = 'block';
      }
      else{
        for(i in info){
          if(info[i].Full===newtext.slice(0, -1)){
            openOverlay(newtext,info[i])
          }
        }
      }
    })
  // Move text to the front if needed (for browsers that don't support 'insert')
  text.raise();
      const points = [
          [0,8*Math.sqrt(3)], // 顶点A
          [16,-8*Math.sqrt(3)], // 顶点B
          [-16,-8*Math.sqrt(3)] // 顶点C
      ]
      if(data[i].Type==DP){
      DP_group = text_group.append("g")
          .attr("text-anchor", "middle").attr("transform", function(){
            var indicate = 1
            if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
              indicate = 1}
            else{indicate = -1}
          return `translate(${-indicate*70},${indicate*50})`})
      DP_info = DP_group.append("text").attr("x",106).attr("y",10);
        DP_group.append("path")
        .attr("d", "M-20,-7 L10,-7 L20,0 L10,7 L-5,7 L-5,-7 Z") // Triangle path with the tip centered at (0,0)
        .attr("fill", color_fill(AQI_value,view_type))
      // Draw the exclamation mark using rectangles for simplicity

      DP_group.append("rect")
        .attr("x", -1) // X position (centered at 0,0)
        .attr("y", -2) // Y position (above the bottom)
        .attr("width", 10) // Width of the exclamation mark
        .attr("height", 3) // Height of the exclamation mark's stick
        .attr("fill", "#fff"); // Fill with white color

        // Append the text "Driver Pollutant"
        DP_info.append("tspan")
        .attr("dx", "10")
        .attr("dy", "-4")
        .text(" Driver Pollutant")
        .style("font-weight", "bold")
        .style("fill", color_fill(AQI_value,view_type)); // Style the text color

        // Append the "Learn more" text
        DP_info.append("tspan")
        .attr("dx", "6")
        .text("Learn more")
        .style("font-size", "10px")
        .style("text-decoration", "underline")
        .style("fill", "blue") // Style the text to look like a link

        const bbox = DP_group.node().getBBox();
        const textWidth = bbox.width;
        const textHeight = bbox.height;
        DP_group.attr("text-anchor", "middle").attr("transform", function(){
              var indicate = 1
              if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
                indicate = 1}
              else{indicate = -1}
            return `translate(${-textWidth/2.5},${indicate*(textHeight+15)})`})
            .on('click',function(){
              console.log("Calendar: Open_Info_Card: DP")
              event.stopPropagation();
              var overlay_DP = document.getElementById('overlay_DP');
            // Show the overlay
            overlay_DP.style.display = 'block';}
            )
          }
}

date_text.text(text_to_display(date));
AQI_text.text('AQI: '+AQI_value).style('fill',color_fill(AQI_value,view_type));
health.text(color_type(AQI_value));

DP_text.text( 'Driver Pollutant: '+DP).style('fill',color_fill(AQI_value,view_type));
floatingDiv.style("border-top", "10px solid "+color_fill(AQI_value,view_type))
svg.attr('transform', `translate(${width / 2}, ${height / 2}) scale(${scaleFactor})`)
}


function bar_height_2(d, max, min){
  return d*0.7+barwidth
}
function bar_height(d, max, min){
  var res;
  if(d<151){
    res =  d;}
  else if (d<301){res= 200+(d-200)/2;}
  else if (d<501){res = 200+(300-200)/2+(d-300)/4;}
  return res*0.7+barwidth
}


function color_type(d){
  if(d<51){
    return 'Good';}
  else if (d<101){return 'Moderate';}
  else if (d<151){return 'Unhealthy for sensitive group';}
  else if (d<201){return 'Unhealthy';}
  else if (d<301){return 'Very Unhealthy';}
  else if (d<501){return 'Hazardous';}


}

function text_to_display(dateString){
  // Function to parse the date in m/d/y format
const parseDate = d3.timeParse("%m/%d/%Y");

// Function to format the date into "Month day, Year" format
// Note: D3 does not have built-in ordinal date formatters (%O),
// so you need to handle that separately
const formatDate = d3.timeFormat("%b %-d, %Y");

// Parse the date string into a date object
const date = parseDate(dateString);

// Create an ordinal suffix for the day
const day = date.getDate();
const suffix = ["th", "st", "nd", "rd"][((day % 100) - 20) % 10] || ["th", "st", "nd", "rd"][day % 100] || "th";

// Format the date into your desired string format, manually adding the ordinal suffix
const formattedDate = formatDate(date).replace(/(\d+),/, `$1${suffix},`);
return formattedDate
}

function openOverlay(buttonText,info) {
  console.log("Calendar: Open_Info_Card: "+buttonText)
  var overlay = document.getElementById('overlay');

  var overlayContent = document.getElementById('overlay-content1');


  // Set the content of the overlay based on the button's text
  document.querySelector('#overlay-content1 h2').textContent = info.Full + ' ('+info.Name + ')';
  document.getElementById('p-title').textContent = info.Full + ' ('+info.Name + ')';
  document.getElementById('p-what').textContent = info.What;
  document.getElementById('p-where').textContent = info.Where;
  document.getElementById('p-how').textContent = info.Harm;
  document.getElementById('illustration').src = 'illustration/'+info.Name+'.png'
  document.getElementById('cause').src = 'illustration/cause/'+info.Name+'.png'
  document.getElementById('harm').src = 'illustration/harm/'+info.Name+'.png'



  // Show the overlay
  overlay.style.display = 'block';

}


function showDivLayout() {
  console.log("Calendar: Info_card_filp")
  var content1 = document.getElementById('overlay-content1');
  var content2 = document.getElementById('overlay-content2');
  var note_card = document.getElementById('note_card');

  // Toggle between showing content1 and content2
  if (content1.style.display === 'none') {
    content1.style.display = 'block';
    content2.style.display = 'none';
    note_card.textContent = "1/2"
  } else {
    content1.style.display = 'none';
    content2.style.display = 'block';
    note_card.textContent = "2/2"
  }
}
document.getElementById('overlay-content1').onclick = showDivLayout;
document.getElementById('overlay-content2').onclick = showDivLayout; // If you want to switch back to the first div when the second one is clicked
