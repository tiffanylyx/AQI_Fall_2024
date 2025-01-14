const csvFile1 = '2014-2023.csv';
const csvFile2 = 'info.csv';
const types = ['NO2','O3','CO','PM10','PM2.5','SO2']
// 计数器来追踪当前显示的 tooltip 索引
let currentTooltipIndex = 0;

// 创建 text_group 和 tooltip
const textGroups = []; // 用于存储所有 text_group 及其 tooltip 的引用
function getFormattedDateTime() {
  var now = new Date();
  now.setTime(now.getTime() - 1.5 * 60 * 60 * 1000); // Subtract 1.5 hours



    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[now.getMonth()];

    const date = now.getDate();
    const suffix = ["th", "st", "nd", "rd"][
        (date % 10 > 3) ? 0 : (date % 100 - date % 10 != 10) * date % 10
    ];

    const year = now.getFullYear();
    let hour = now.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return  `${month} ${date}${suffix}, ${year}, ${hour}:00 ${ampm}`;
}
function getCurrentDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return month + '/' + day + '/' + year;
}

function getCurrentDateAndUTCHour() {
    // Create a new Date object for the current date and time
    var now = new Date();
    now.setTime(now.getTime() - 1.5 * 60 * 60 * 1000); // Subtract 1.5 hours



    // Fetch the year, month, and day
    var year = now.getUTCFullYear(); // Get the year as a four digit number (yyyy)
    var month = now.getUTCMonth() + 1; // Get the month as a number (0-11), add 1 to make it 1-12
    var day = now.getUTCDate(); // Get the day as a number (1-31)

    // Format the month and day to ensure two digits (e.g., '01' instead of '1')
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    // Combine into a date string in YYYY-MM-DD format
    var date = year + '-' + month + '-' + day;

    // Fetch UTC hour
    var hoursUTC = now.getUTCHours();
    hoursUTC = hoursUTC < 10 ? '0' + hoursUTC : hoursUTC; // Format the UTC hour to ensure two digits

    return date+"T"+hoursUTC;
}
function calculateCOAqi(co) {
    let aqi;
    if (co >= 0 && co <= 4.4) {
        aqi = linear(0, 50, 0, 4.4, co);
    } else if (co > 4.4 && co <= 9.4) {
        aqi = linear(51, 100, 4.5, 9.4, co);
    } else if (co > 9.4 && co <= 12.4) {
        aqi = linear(101, 150, 9.5, 12.4, co);
    } else if (co > 12.4 && co <= 15.4) {
        aqi = linear(151, 200, 12.5, 15.4, co);
    } else if (co > 15.4 && co <= 30.4) {
        aqi = linear(201, 300, 15.5, 30.4, co);
    } else if (co > 30.4 && co <= 40.4) {
        aqi = linear(301, 400, 30.5, 40.4, co);
    } else if (co > 40.4 && co <= 50.4) {
        aqi = linear(401, 500, 40.5, 50.4, co);
    } else {
        aqi = "Invalid CO level";
    }
    return aqi;
}

function linear(aqiHigh, aqiLow, concHigh, concLow, conc) {
    const aqi = ((aqiHigh - aqiLow) / (concHigh - concLow)) * (conc - concLow) + aqiLow;
    return Math.round(aqi);
}
// Call the function to display the date and UTC hour
time = getCurrentDateAndUTCHour();

var real_time_data = []
url = "https://www.airnowapi.org/aq/data/?startDate="+time+"&endDate="+time+"&parameters=OZONE,PM25,PM10,CO,NO2,SO2&BBOX=-84.3,33.690,-84.2,33.691&dataType=B&format=application/json&verbose=1&monitorType=0&includerawconcentrations=1&API_KEY=BB66CD77-8E6B-465B-9AC0-AD602FBC8827"

// Function to process and display all data
function processData(csvData1, csvData2, apiData, info) {
    let real_time_data = [];
    for (let i in apiData) {
        if (apiData[i].Parameter == 'OZONE') {
            real_time_data.push({ 'Type': 'O3', 'Value': apiData[i].AQI });
        }
        else if (apiData[i].Parameter == 'CO'){
            real_time_data.push({ 'Type': apiData[i].Parameter, 'Value': calculateCOAqi(apiData[i].RawConcentration) });
        }
        else{
            real_time_data.push({ 'Type': apiData[i].Parameter, 'Value': apiData[i].AQI });
        }
    }


    // Assuming create_rosa is a function you've defined to do something with the data
    document.getElementById('header-text').textContent = "Air Quality Index of " + getFormattedDateTime()
    if(chart_type=='circular'){
      create_rosa(getCurrentDate(), real_time_data, info);
      svg.attr('transform', `translate(${width / 2}, ${height / 2}) scale(${scaleFactor})`)
    }
    else{
      create_bar(getCurrentDate(), real_time_data, info);
    }



}

// Main function to load CSV and API data
function loadDataAndProcess(csvFile1, csvFile2, url) {
    Promise.all([
        d3.csv(csvFile1),
        d3.csv(csvFile2),
        fetch(url).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
    ]).then(function([csvData1, csvData2, apiData]) {
        processData(csvData1, csvData2, apiData, csvData2); // Assuming 'info' should come from csvData2
    })
}
loadDataAndProcess(csvFile1, csvFile2, url)
// set the dimensions and margins of the graph
const select_date = 228


var container = d3.select('#daily_chart');
var svg_color

// Get the width of the container div
var containerWidth = container.node().getBoundingClientRect().width;
var containerHeight = container.node().getBoundingClientRect().height;
const margin = {top: -50, right: 20, bottom: 0, left: 20},
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom,
    innerRadius = 0,
    outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border
// Create SVG canvas
const svg = d3.select('#daily_chart').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`)
  .attr("fill","#F5F6F6")
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

let barwidth = 20
const scaleFactor = screen.width/(7.5*bar_height(300))
let AQI_value = 0
let DP
const circle_bar = svg.append('g')
var layer1 = circle_bar.append('g');
var layer2 = circle_bar.append('g');
var layer3 = circle_bar.append('g');


const floatingDiv = d3.select('#floating-div')

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
    'Value': 'Missing'})
  }
}
svg.selectAll("*").remove()
var padding_bar = 100

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
    text_group = layer3.append("g")
        .attr("transform", `translate(${(index - 5 / 2) * (padding_bar + barwidth) - 60 + barwidth / 2}, ${move_y + 30})`);


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
          if((AQI_value<101)&&(AQI_value>50)){
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
      console.log("Home_page: Open_Info_Card: Missing")
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
    DP_info.append("tspan")
    .attr("dx", "6")
    .attr("dy", "1")
    .text(" Driver Pollutant")
    .style("font-size", "26px")
    .style("font-weight", "bold")
    .style("text-decoration", "underline")
    .style("fill", color_fill(AQI_value,view_type)); // Style the text color
    // Append the "Learn more" text
    DP_info.append("tspan")
    .attr("dx", "6")
    .text("Learn more")
    .style("font-size", "10px")
    .style("text-decoration", "underline")
    .style("fill", "blue") // Style the text to look like a link


    const bbox = DP_info.node().getBBox();
    const textWidth = bbox.width;
    const textHeight = bbox.height;
    DP_group
        .on('click',function(){
          console.log("Home_page: Open_Info_Card: DP")
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
date_text.text(getFormattedDateTime());
AQI_text.text('AQI: '+AQI_value).style('fill',color_fill(AQI_value,view_type));
health.text(color_type(AQI_value));

DP_text.text( 'Driver Pollutant: '+DP).style('fill',color_fill(AQI_value,view_type));
floatingDiv.on('click',function(){
  event.stopPropagation();
  var overlay_DP = document.getElementById('overlay_DP');
  // Show the overlay
  overlay_DP.style.display = 'block';
          })
floatingDiv.style("border-top", "10px solid "+color_fill(AQI_value,view_type))

}
//create_rosa(data)
function create_rosa(date,data_select,info){
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
svg.selectAll("*").remove()

const circle_bar = svg.append('g').attr("id",'circle_bar')
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
  // First translate to the bottom center, then rotate
  .attr('transform', d => `rotate(${calculateRotation(d)})`);
const circle = layer3.append('circle')
.attr('cx', 0)
.attr('cy', 0)
.attr('r',barwidth*0.7)
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
  var yAxis = layer2
      .attr("text-anchor", "middle");

  var yTick = yAxis
    .selectAll("g")
    .data(rank)
    .enter().append("g");

  yTick.append("circle")
      .attr("fill", "none")
      .style("stroke-dasharray", ("2, 6"))
      .attr("stroke", "#003E93")
      .attr("opacity",0.5)
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


  yTick.append("text")
      .data(rank)
      .attr("y", function(d) {
        return -bar_height(d,outerRadius,innerRadius) })
      .attr("dy", "0.35em")
      .text(d => d)
      .attr("class","pullution-axis")
      .style("fill", "#003E93")
      .style("opacity",0.4)

// Draw the button background
const padding_h = 30;
const padding_v = 20;
// Add the text to the SVG first to measure it
for (i in data){
  text_group = layer3.append("g")
      .attr("text-anchor", "left")
      .attr("transform",  function(){
        var indicate = 0
        if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
          indicate = 0
        }
        else{indicate = -1}
      return `translate(${180*indicate+(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.cos(Math.PI+angleScale(data[i].Type))},
      ${(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.sin(Math.PI+angleScale(data[i].Type))})`
    })

  text = text_group.append("text").attr("x", 0) // Set the x position of the text element
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
    .style("font-size",'16px')
  text.append("tspan").attr("y", 2)
  .text(data[i].Value)
  .style("font-size", "30px") // Smaller font size for the AQI range
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
  text_group
      .attr("transform",  function(){
        var indicate = 0
        if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
          indicate = 0
        }
        else{indicate = -1}
      return `translate(${textWidth*indicate+(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.cos(Math.PI+angleScale(data[i].Type))},
      ${(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.sin(Math.PI+angleScale(data[i].Type))})`
    })
  // Create the filter with the id #drop-shadow
  // Set the height and width to 130% to allow for the blur
  var filter = svg.append("defs")
    .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "120%")
      .attr("width", "120%");

  // SourceAlpha refers to the graphic that this filter will be applied to
  // convolve that with a Gaussian with a standard deviation of 3
  filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");

  // Translate the blur
  filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("result", "offsetBlur");

  // Add an feMerge node to merge the original source graphic and the
  // blur filter result
  var feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode")
      .attr("in", "offsetBlur")
  feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
  // Draw the button background behind the text
  text_group.insert('rect', 'text') // Insert rectangle before the text element
      .attr('x', bbox.x - padding_h / 2)
      .attr('y', bbox.y - padding_v / 2)
      .attr('rx', textHeight / 4) // Rounded corners
      .attr('ry', textHeight / 4) // Rounded corners
      .attr('width', textWidth + padding_h)
      .attr('height', textHeight + padding_v)
      .style('fill',function(){
              if(data[i].Type==DP){
                return color_fill(data[i].Value,view_type)
              }
              else{
                return 'white'
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
      .style('stroke-width',function(){
              if(data[i].Type==DP){
                return '4'
              }
              else{
                return '3'
              }

            } )
  //.style('filter', 'url(#drop-shadow)');
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
      console.log("Home_page: Open_Info_Card: Missing")
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
  text_group = layer3.append("g")
      .attr("transform",  function(){
        var indicate = 1
        if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
          indicate = 1}
        else{indicate = -1}
      return `translate(${(textWidth+padding_h)*indicate+(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.cos(Math.PI+angleScale(data[i].Type))},
      ${(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.sin(Math.PI+angleScale(data[i].Type))})`
    })


  // Move text to the front if needed (for browsers that don't support 'insert')
  text.raise();

      if(data[i].Type==DP){
        DP_group = text_group.append("g")
        .attr("text-anchor", "middle")

      DP_info = DP_group.append("text").attr("x",106).attr("y",5);
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
        .attr("dx", "6")
        .attr("dy", "1")
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

        const bbox = DP_info.node().getBBox();
        const textWidth = bbox.width;
        const textHeight = bbox.height;
        DP_group.attr("text-anchor", "middle").attr("transform", function(){
              var indicate = 1
              if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
                indicate = -1}
              else{indicate = 0}
            return `translate(${indicate*textWidth+20},${-1*(textHeight+25)})`})
            .on('click',function(){
              console.log("Home_page: Open_Info_Card: DP")
              event.stopPropagation();
              var overlay_DP = document.getElementById('overlay_DP');
            // Show the overlay
            overlay_DP.style.display = 'block';}
            )
}
/*
// 获取 text_group 的位置
const transform = text_group.node().getAttribute("transform");
const [x, y] = transform.match(/-?\d+(\.\d+)?/g).map(Number); // 提取 transform 中的 x, y 坐标
console.log(x,y)

const tooltipId = `bubbleTooltip${i}`;
// 创建并设置 tooltip，初始状态为隐藏
const tooltip = d3.select("#daily_chart").append("div")
  .attr("class", "bubble-container")
  .attr("id", tooltipId)
  .html(`
    <div class="bubble">
      <div class="icon">
        <img src="icon/DoubleTap.png" alt="Icon" />
      </div>
      <p>Tap to see more information (${i + 1})</p>
    </div>
  `)
  .style("left", `${x/2 + width/2}px`) // 位置相对于 text_group 左右偏移
  .style("top", `${y/2 + height/2}px`); // 位置相对于 text_group 上下偏移

textGroups.push({ text_group, tooltip, tooltipId });
*/
}
/*
// 显示第一个 tooltip
textGroups[0].tooltip.classed("active", true);
console.log("textGroups",textGroups[0])

// 设置点击事件处理程序
textGroups.forEach((item, index) => {
  item.text_group.on("click", function() {
    // 隐藏当前 tooltip
    item.tooltip.classed("active", false);

    // 显示下一个 tooltip
    if (index + 1 < textGroups.length) {
      textGroups[index + 1].tooltip.classed("active", true);
      currentTooltipIndex++;
    }
  });
});
*/

date_text.text(getFormattedDateTime());
AQI_text.text('AQI: '+AQI_value).style('fill',color_fill(AQI_value,view_type));
health.text(color_type(AQI_value));

DP_text.text( 'Driver Pollutant: '+DP).style('fill',color_fill(AQI_value,view_type));
floatingDiv.on('click',function(){
  event.stopPropagation();
  var overlay_DP = document.getElementById('overlay_DP');
  // Show the overlay
  overlay_DP.style.display = 'block';
          })
floatingDiv.style("border-top", "10px solid "+color_fill(AQI_value,view_type))

}


function bar_height_2(d, max, min){
  return 4.5*Math.pow(d,0.65)+barwidth*0.7
}
function bar_height_bar(d, max, min){
  var res;
  if(d<151){
    res =  d;}
  else if (d<301){res= 200+(d-200)/2;}
  else if (d<501){res = 200+(300-200)/2+(d-300)/4;}
  return res*1.3
}
function bar_height(d, max, min){
  var res;
  if(d<151){
    res =  d;}
  else if (d<301){res= 200+(d-200)/2;}
  else if (d<501){res = 200+(300-200)/2+(d-300)/4;}
  else{
    return 0
  }
  return res*0.85+barwidth
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
  d3.select("#bubbleContainer3").style("display","none")
  console.log("Home_page:Open_Info_Card: "+buttonText)
  var overlay = document.getElementById('overlay');

  var overlayContent = document.getElementById('overlay-content1');

  // Set the content of the overlay based on the button's text
  document.querySelector('#overlay-content1 h2').innerHTML = info.Full + ' (' + info.Name + ')';
  document.getElementById('p-title').innerHTML = info.Full + ' (' + info.Name + ')';
  document.getElementById('p-what').innerHTML = info.What;
  document.getElementById('p-where').innerHTML = info.Where;
  document.getElementById('p-how').innerHTML = info.Harm;
  document.getElementById('illustration').src = 'illustration/' + info.Name + '.png';
  document.getElementById('cause').src = 'illustration/cause/' + info.Name + '.png';
  document.getElementById('harm').src = 'illustration/harm/' + info.Name + '.png';

  // Show the overlay
  overlay.style.display = 'block';
}
function showDivLayout() {
  console.log("Home_page:Info_card_filp")
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
document.getElementById('floating-legend').addEventListener('click', function(){
  event.stopPropagation();
  document.getElementById('overlay_color').style.display = 'block';
  console.log("Home_page:Open_Info_Card: Color")
});

function showNextBubble(clickedIndex) {
  console.log("here")
  // Get the current bubble based on clicked index
  const currentBubble = document.querySelector(`#bubbleContainer${clickedIndex} .bubble`);
  // Hide the current bubble
  if (currentBubble) {
    currentBubble.classList.add("hidden");
  }

  // Get the next bubble in sequence
  const nextBubbleContainer = document.querySelector(`#bubbleContainer${clickedIndex + 1}`);
  const nextBubble = nextBubbleContainer ? nextBubbleContainer.querySelector(".bubble") : null;

  // Show the next bubble if it exists
  if (nextBubble) {
    nextBubble.classList.remove("hidden");
  } else {
    // Optional: Reset the sequence when all bubbles have been shown
    resetBubbles();
  }
}

// Function to reset all bubbles, if you want the sequence to restart
function resetBubbles() {
  const bubbles = document.querySelectorAll(".bubble");
  bubbles.forEach((bubble, index) => {
    if (index === 0) {
      bubble.classList.remove("hidden"); // Show the first bubble
    } else {
      bubble.classList.add("hidden"); // Hide all other bubbles
    }
  });
}
