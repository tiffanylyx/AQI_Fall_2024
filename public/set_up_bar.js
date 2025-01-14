
const select_date = 228
const scaleFactor = 0.95
const container = d3.select('#bar_chart');

// Get the width of the container div
const containerWidth = container.node().getBoundingClientRect().width;
const containerHeight = container.node().getBoundingClientRect().height;
const margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom,
    innerRadius = 0,
    outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border
// Create SVG canvas
const svg = d3.select('#bar_chart').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`);
const barHeight = outerRadius - innerRadius;
const buttun_line_padding = 120
// Sample data
const org_data  = [
  { Type: 'NO2', Value: '26.6 ppb' },
  { Type: 'CO', Value: '0.5 ppm' },
  { Type: 'PM10', Value: '43 ug/m3' },
  { Type: 'O3', Value: '0.081 ppm' },
  { Type: 'SO2', Value: '0.4 ppb' },
  { Type: 'PM2.5', Value: '25.5 ug/m3' }, 
]
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

var barwidth = 160
var padding_bar = 120
var padding_text = 300
var text_length = barwidth*6 + padding_bar*5 - padding_text

let AQI_value = 0
let DP
let next
const info_group = svg.append('g')
const bars_group = svg.append('g')
const explain_group = svg.append('g')

const csvFile1 = '2014-2023.csv';
const csvFile2 = 'info.csv';
var explain_text
var text_box
var back = 0
let timer; // Declare a variable to hold the reference to the timeout
var len = 8000
function resetTimer(duration) {
  clearTimeout(timer); // Clear the existing timer
  timer = setTimeout(() => {
    document.getElementById('nextButton').click(); // Programmatically click the next button
  }, duration); // Set a new timer for 45 seconds
}
resetTimer(len)
// Load both files concurrently
Promise.all([
  d3.csv(csvFile1),
  d3.csv(csvFile2)
]).then(function([dataall, info]) {


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
  var allTime = [];
  for(i in data){
    if(!allTime.includes(data[i].Date_org)){allTime.push(data[i].Date_org);}
  }
  var date = '08/24/2023'

  var data_select = [];
  for(i in data){
    if(data[i].Date_org===date){
      data_select.push(data[i])
    }
  }

  var data_for_day = []
  for(i in data_select){
    var org
    for(j in org_data){
      if(data_select[i].Type==org_data[j].Type){
        org = org_data[j].Value
      }
    }
    data_for_day.push({'Type':data_select[i].Type,'Value': parseInt(data_select[i].Value,10),'Org_Val':org})
  }
  var bars
  var labels1, labels2
  var arrow
  var barGroups
  var AQI_line_0
  var AQI_text_0
  var AQI_y
  var circle_bar
  padding_h = 120
  padding_v = 40




  create_number(date, data_for_day, info)
  // Store the functions in an array
  const functionsArray = [
      { func: create_number, args: [date,data_for_day,info] },
      { func: change_AQI, args: [date,data_for_day,info] },
      { func: color_code, args: [date,data_for_day,info] },
      { func: create_bar, args: [date,data_for_day,info] },
      { func: move_bar, args: [date, data_for_day, info,30] },
      { func: stack, args: [30,info] },
      { func: add_rosa, args: [date,data_for_day,info] },
  ];

  // Initialize the current index
  let currentIndex = 0;

  // Function to run the function at the current index
  function runFunctionAtIndex() {
      const functionObject = functionsArray[currentIndex];
      functionObject.func.apply(null, functionObject.args);
  }

  function updateProgressIndicator() {
      // Get all the dots
      const dots = document.querySelectorAll('.progress-dot');

      // Remove 'active' class from all dots
      dots.forEach(dot => {
          dot.classList.remove('active');
      });

      // Add 'active' class to the current dot
      dots[currentIndex].classList.add('active');
  }

  // Run the updateProgressIndicator function initially to set the first step active
  updateProgressIndicator();

  // Modified event listener for the next button
  document.getElementById('nextButton').addEventListener('click', () => {
    if (currentIndex < functionsArray.length - 1) { // Check if currentIndex is less than the last index
      currentIndex++;} // Increment currentIndex}
    else if (currentIndex==functionsArray.length-1){
      currentIndex = 0
    }
      runFunctionAtIndex();
      updateProgressIndicator(); // Call this function to update the visual progress indicator
    if(currentIndex==functionsArray.length-1){
      len = 15000
    }
    
  });

  // Modified event listener for the previous button
  document.getElementById('previousButton').addEventListener('click', () => {
    console.log("Explain: Click previous button")
    if (currentIndex > 0) { // Check if currentIndex is greater than 0
      currentIndex--; // Decrement currentIndex
      runFunctionAtIndex();
      updateProgressIndicator(); // Call this function to update the visual progress indicator
    }
    
  });

})
let explainText
function raw_number(data,info){
  console.log("Explain-Animation: raw_number")
  len = 8000
  barwidth = 160
  padding_bar = 120
  explain_group.selectAll("*").remove()
  info_group.selectAll("*").remove()
  bars_group.selectAll("*").remove()
  d3.select("#circle_bar").remove()

  explainText = document.getElementById('explain-text');
  console.log(explainText)
  const textBox = document.getElementById('text-box');
  
  const paddingH = 20; // Horizontal padding
  const paddingV = 10; // Vertical padding

  // Set the text content
  explainText.textContent = 'This is the explanatory text';

  // Get the dimensions of the text
  const bbox = explainText.getBoundingClientRect();
  const textWidth = bbox.width;
  const textHeight = bbox.height;

  // Set the dimensions and position of the bounding box
  textBox.style.width = text_length+padding_text + 'px';
  textBox.style.height = (textHeight + paddingV * 2) + 'px';
  textBox.style.left = '51%';
  textBox.style.top = '20%';
  textBox.style.transform = 'translate(-50%, -50%)';

  // Position the text within the bounding box
  explainText.style.left = '50%';
  explainText.style.top = '20%';
  explainText.style.transform = 'translate(-50%, -50%)';
  explainText.maxWidth = text_length+padding_text+ 'px';

  barGroups = bars_group
    .selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .attr("transform", function(d,i) {
      return `translate(${(i-5/2)*(padding_bar+barwidth)-50},-60)`;
    })

  // Append a rect to each group
  bars = barGroups.append('rect')
    .attr('x', 0)
    .attr('y', -40)
    .attr('rx', 8) // Rounded corners
    .attr('ry', 8) // Rounded corners
    .attr('width', barwidth)
    .attr('height', 0)
    .attr('fill','white')
    .attr('stroke','black')
  // Now append a text element to each group
  labels1 = barGroups.append('text')
    .attr("x", barwidth / 2) // Position the text in the center of the rect
    .attr("y", 80) // Adjust the position accordingly
    .attr("text-anchor", "middle") // Center the text
    .attr("dominant-baseline", "central") // Vertically center the text
    .text(function(d) {
      for(i in info){
        if ( d.Type==info[i].Name){
          return info[i].Full
        }
      }
    })
    .attr("fill", 'black')
    .attr('class','main_text')
    .style('opacity',0)

  // Now append a text element to each group
  labels2 = barGroups.append('text')
    .attr("x", barwidth / 2) // Position the text in the center of the rect
    .attr("y",0) // Adjust the position accordingly
    .attr("text-anchor", "middle") // Center the text
    .attr("dominant-baseline", "central") // Vertically center the text
    .text(function(d) {
      return d.Org_Val; // Assuming each datum has a label property
    })
    .attr("fill", 'black')
    .attr('class','sub_title')
    .style('opacity',0)

}

function create_number(date, data, info){
  d3.select("#bubbleContainer_rosa").style("display","none")
  d3.select("#Realtime-dot").style("display","none")
  console.log("Explain-Animation: create_number")
  raw_number(data,info)
  explainText = document.getElementById('explain-text');

  const textBox = document.getElementById('text-box');
  
  const paddingH = 20; // Horizontal padding
  const paddingV = 10; // Vertical padding

  // Set the text content
  explainText.innerHTML = 'On <b>August 24, 2023</b>, which marked the highest value of Atlanta\'s Air Quality Index for the whole 2023, the levels of different pollutants in the air detected by the sensors of EPA were recorded as follows.';

  // Get the dimensions of the text
  const bbox = explainText.getBoundingClientRect();
  const textWidth = bbox.width;
  const textHeight = bbox.height;

  // Set the dimensions and position of the bounding box
  textBox.style.width = text_length+padding_text + 'px';
  textBox.style.height = (textHeight + paddingV * 2) + 'px';
  textBox.style.left = '51%';
  textBox.style.top = '20%';
  textBox.style.transform = 'translate(-50%, -50%)';

  // Position the text within the bounding box
  explainText.style.left = '50%';
  explainText.style.top = '20%';
  explainText.style.transform = 'translate(-50%, -50%)';
  explainText.maxWidth = text_length+ 'px';


  // Append a rect to each group
  bars.attr('height', 80).attr('y',-40)
  .attr('fill','white')
  .attr('stroke','black')
  .attr('stroke-width',1)
  .attr('opacity',1)
  barGroups.on('click',function(event){
    event.stopPropagation();
    text = d3.select(this).select('text').text()
    for(i in info){
      if(info[i].Full===text){
        openOverlay(text,info[i])
      }
    }
  })

  labels1.style('opacity',1).attr("fill", 'black')
  labels2.style('opacity',1).attr("fill", 'black')
  next = 1


}
function change_AQI(){
  console.log("Explain-Animation: change_AQI")
  
  explainText = document.getElementById('explain-text');

  const textBox = document.getElementById('text-box');
  
  const paddingH = 20; // Horizontal padding
  const paddingV = 10; // Vertical padding

  // Set the text content
  explainText.innerHTML = ' For public communication purpose, instead of reporting the concentration, scientists first convert these raw numbers into a value range from 0 - 500 based on a math equation.';
  explainText.maxWidth = text_length+ 'px';
  // Get the dimensions of the text
  const bbox = explainText.getBoundingClientRect();
  const textWidth = bbox.width;
  const textHeight = bbox.height;

  // Set the dimensions and position of the bounding box
  textBox.style.width = text_length+padding_text + 'px';
  textBox.style.height = (textHeight + paddingV * 2) + 'px';
  textBox.style.left = '51%';
  textBox.style.top = '20%';
  textBox.style.transform = 'translate(-50%, -50%)';

  // Position the text within the bounding box
  explainText.style.left = '50%';
  explainText.style.top = '20%';
  explainText.style.transform = 'translate(-50%, -50%)';
  

  /*
  explain_text.text('For public communication purpose, instead of reporting the concentration, scientists first convert these raw numbers into a value range from 0 -- 500 based on a math equation.')
  .call(wrapText, text_length);
  bbox = explain_text.node().getBBox();
  textWidth = bbox.width;
  textHeight = bbox.height;
  text_box
      .attr('y', bbox.y - padding_v / 2)
      .attr('width', text_length+padding_text)
      .attr('height', textHeight + padding_v)
  */
  if(next==1){
  // Now append a text element to each group
  line = barGroups.append('line')
  .attr('x1', 0)
  .attr('y1', 0)
  .attr('x2', 0) // 初始时设置与 x1 相同，使其不可见
  .attr('y2', 0)
  .attr('stroke', 'black')
  .attr('stroke-width', 2);
// 使用过渡动画来绘制横线
line.transition()
  .duration(500) // 过渡时间，1000毫秒 = 1秒
  .attr('x2', barwidth) // 根据文本宽度调整终点的 x 坐标
  line.transition()
  .delay(700)
  .style('opacity', 0); // 根据文本宽度调整终点的 x 坐标  

  labels2.transition()
  .delay(700) // 这里的延迟需要比横线的动画时间长一些
  .on('start', function() {
    d3.select(this).text(function(d) {
      return d.Value; // Assuming each datum has a label property
    })
  });
  }
else{
  labels2.text(function(d) {
    return d.Value; // Assuming each datum has a label property
  })
}
  // Append a rect to each group
  bars.attr('height', 80).attr('y',-40)
  .attr('fill','white')
  .attr('stroke','black')
  .attr('stroke-width',1)
  .attr('opacity',1)
  labels1.style('opacity',1).attr("fill", 'black')
  labels2.style('opacity',1).attr("fill", 'black')
}
function color_code(date, data, info){
  console.log("Explain-Animation: color_code")
  next = 0
  
  explainText = document.getElementById('explain-text');

  const textBox = document.getElementById('text-box');
  
  const paddingH = 20; // Horizontal padding
  const paddingV = 10; // Vertical padding

  // Set the text content
  explainText.innerHTML = ' For public communication purpose, instead of reporting the concentration, scientists first convert these raw numbers into a value range from 0 - 500 based on a math equation.';
  explainText.maxWidth = text_length+ 'px';
  // Get the dimensions of the text
  const bbox = explainText.getBoundingClientRect();
  const textWidth = bbox.width;
  const textHeight = bbox.height;

  // Set the dimensions and position of the bounding box
  textBox.style.width = text_length+padding_text + 'px';
  textBox.style.height = (textHeight + paddingV * 2) + 'px';
  textBox.style.left = '51%';
  textBox.style.top = '20%';
  textBox.style.transform = 'translate(-50%, -50%)';

  // Position the text within the bounding box
  explainText.style.left = '50%';
  explainText.style.top = '20%';
  explainText.style.transform = 'translate(-50%, -50%)';
  // Append a rect to each group
  bars
  .attr('fill','None')
  .transition()
  .duration(1000)
  .attr('height', 80).attr('y',-40)
    .attr('fill', function(d){
      if(AQI_value < parseInt(d.Value)){
        AQI_value = parseInt(d.Value)
        DP = d.Type
      }
      return color_fill(d.Value,view_type)
    })
    .attr("stroke", 'None')

    labels2.attr("fill", function(d){
      if((d.Value<101)&&(d.Value>50)){
        return 'black'
      }
      else{
        return 'white'
      }
    })  .transition()
      .duration(1000)
    .attr("y",0)
}
function create_bar(date, data, info){
  console.log("Explain-Animation: create_bar")
  back = 0
  
  explainText = document.getElementById('explain-text');

  const textBox = document.getElementById('text-box');
  
  const paddingH = 20; // Horizontal padding
  const paddingV = 10; // Vertical padding

  // Set the text content
  explainText.innerHTML = 'What if for each pollutant we create a bar, and use the <b>AQI value as each bar’s height</b>?';
  explainText.maxWidth = text_length+ 'px';
  // Get the dimensions of the text
  const bbox = explainText.getBoundingClientRect();
  const textWidth = bbox.width;
  const textHeight = bbox.height;

  // Set the dimensions and position of the bounding box
  textBox.style.width = text_length+padding_text+ 'px';
  textBox.style.height = (textHeight + paddingV * 2) + 'px';
  textBox.style.left = '51%';
  textBox.style.top = '20%';
  textBox.style.transform = 'translate(-50%, -50%)';

  // Position the text within the bounding box
  explainText.style.left = '50%';
  explainText.style.top = '20%';
  explainText.style.transform = 'translate(-50%, -50%)';
  bars
  .transition()
  .duration(1000)
  .style('opacity',1)
  .attr('height',d => bar_height_bar(d.Value, outerRadius, innerRadius ))
  .attr('y',d => 50-bar_height_bar(d.Value, outerRadius, innerRadius ))

labels1
.transition()
.delay(function(d,i) {
  return i * 100; // Delay each subsequent bar by an additional 100ms
})
.duration(800)
.attr('y',80)

labels2
.transition()
.delay(function(d,i) {
  return i * 100; // Delay each subsequent bar by an additional 100ms
})
.duration(800)
.attr('y',d => 30-bar_height_bar(d.Value, outerRadius, innerRadius ))
.attr("fill","black")
info_group.selectAll("*").remove()
}
function move_bar(date, data, info,distance){
console.log("Explain-Animation: move_bar")
explainText = document.getElementById('explain-text');

const textBox = document.getElementById('text-box');

const paddingH = 20; // Horizontal padding
const paddingV = 10; // Vertical padding

// Set the text content
explainText.innerHTML = 'And of AQI of Day will take the <b>worst case</b>, which is the <b>highest AQI value</b> among all the pollutants. The pollutant that has the highest AQI is the <b>Driver Pollutant</b> of the day.';
explainText.maxWidth = text_length+ 'px';
// Get the dimensions of the text
const bbox = explainText.getBoundingClientRect();
const textWidth = bbox.width;
const textHeight = bbox.height;

// Set the dimensions and position of the bounding box
textBox.style.width = text_length+padding_text + 'px';
textBox.style.height = (textHeight + paddingV * 2) + 'px';
textBox.style.left = '51%';
textBox.style.top = '20%';
textBox.style.transform = 'translate(-50%, -50%)';

// Position the text within the bounding box
explainText.style.left = '50%';
explainText.style.top = '20%';
explainText.style.transform = 'translate(-50%, -50%)';
// Append a rect to each group

info_group.selectAll("*").remove()
  barwidth = 160
  padding_bar = 120
  barGroups
  .transition()
  .delay(function(d,i) {
    return i * 100; // Delay each subsequent bar by an additional 100ms
  })
  .duration(800)
  .attr("transform", function(d,i) {
    return `translate(${(i-5/2)*(padding_bar+barwidth)-50},0)`;
  });


  bars
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

  .transition()
  .delay(function(d,i) {
    return i * 100; // Delay each subsequent bar by an additional 100ms
  })
  .duration(800)
  .attr('width',barwidth)
  .attr('y',d => distance+50-bar_height_bar(d.Value, outerRadius, innerRadius ))
  if(back==0){
  labels1
  .transition()
  .delay(function(d,i) {
    return i * 100; // Delay each subsequent bar by an additional 100ms
  })
  .duration(800)
  .attr('y', function() {
    // Get the current 'y' value and parse it to an integer, then add 50
    return parseInt(d3.select(this).attr('y')) + distance;})
  .text(function(d) {
    for(i in info){
      if ( d.Type==info[i].Name){
        return info[i].Full
      }
    }
  })
  labels2
  .transition()
  .delay(function(d,i) {
    return i * 100; // Delay each subsequent bar by an additional 100ms
  })
  .duration(800)
  .attr('y', function() {
    // Get the current 'y' value and parse it to an integer, then add 50
    return parseInt(d3.select(this).attr('y')) + distance;})

  }
  else{
      labels1.attr("x", barwidth / 2).style('font-size',22)
      labels2.attr("x", barwidth / 2)
      .style('font-size',28)

  }

arrow= d3.arrow1()
   .id("my-arrow-9")
info_group.call(arrow);
AQI_y = distance+50-bar_height_bar(AQI_value, outerRadius, innerRadius )
/*
AQI_line_0 = info_group
.append("polyline")
      .attr("marker-end", `url(#${arrow.id()})`)
      .attr("points", [[(5/2)*(padding_bar+barwidth)-50+barwidth, AQI_y],
      [(-5/2)*(padding_bar+barwidth)-75, AQI_y]])
      .attr("stroke", color_fill(AQI_value)) // arrow.attr can also be used as a getter
      .attr("fill", color_fill(AQI_value))
      .attr("stroke-width", 5)
      .attr("opacity",1)
*/
AQI_line_0 = info_group
.append("line")
     .attr("x1",(5/2)*(padding_bar+barwidth)-50+barwidth)
     .attr("x2",(-5/2)*(padding_bar+barwidth)-75)
     .attr("y1",AQI_y)
     .attr("y2",AQI_y)
      .attr("stroke", color_fill(AQI_value,view_type)) // arrow.attr can also be used as a getter
      .attr("fill", color_fill(AQI_value,view_type))
      .attr("stroke-width", 5)
      .attr("opacity",1)
AQI_text_0 = info_group.append("text")
.attr("class","sub_title")
.attr("x",0)
.attr("y",AQI_y-20 )
.attr("text-anchor", "middle")
.text("AQI = "+AQI_value)
.attr('fill',color_fill(AQI_value,view_type))
.attr("opacity",1)
info_group
.attr("transform", `translate(0,-900)`)
.transition()
  .delay(1000)
  .duration(1500)
.attr("transform", `translate(0,0)`)

}

function stack(distance,info){
  console.log("Explain-Animation: stack")
  back = 1
  
  
  explainText = document.getElementById('explain-text');

  const textBox = document.getElementById('text-box');
  
  const paddingH = 20; // Horizontal padding
  const paddingV = 10; // Vertical padding

  // Set the text content
  explainText.innerHTML = 'The AQI of the day is <b>136</b>, which is <b>Unhealthy for Sensitive Group!</b>.';
  explainText.maxWidth = text_length+ 'px';
  // Get the dimensions of the text
  const bbox = explainText.getBoundingClientRect();
  const textWidth = bbox.width;
  const textHeight = bbox.height;

  // Set the dimensions and position of the bounding box
  textBox.style.width = text_length+padding_text + 'px';
  textBox.style.height = (textHeight + paddingV * 2) + 'px';
  textBox.style.left = '51%';
  textBox.style.top = '20%';
  textBox.style.transform = 'translate(-50%, -50%)';

  // Position the text within the bounding box
  explainText.style.left = '50%';
  explainText.style.top = '20%';
  explainText.style.transform = 'translate(-50%, -50%)';
  d3.select('#bar_chart').select('svg').select('#circle_bar').remove()
  barwidth = 30
  barwidth_bar = 70
  padding_bar = 30
  move_x = 520


  barGroups
  .transition()
  .delay(function(d,i) {
    return i * 100; // Delay each subsequent bar by an additional 100ms
  })
  .duration(800)
  .attr('y', function() {
    // Get the current 'y' value and parse it to an integer, then add 50
    return parseInt(d3.select(this).attr('y')) + distance;})
  .attr("transform", function(d,i) {
      return `translate(${(i-5/2)*(padding_bar+barwidth_bar)-move_x},0)`;
    })
  barGroups.on('click',function(event){
      event.stopPropagation();
      text = d3.select(this).select('text').text()
      for(i in info){
        if(info[i].Name===text){
          openOverlay(text,info[i])
        }
      }
    })

  bars
  .transition()
  .delay(function(d,i) {
    return i * 100; // Delay each subsequent bar by an additional 100ms
  })
  .duration(800)
  .attr('width',barwidth_bar)

  labels1.attr("x", barwidth_bar / 2).style('font-size',14).text(d => d.Type)
  labels2.attr("x", barwidth_bar / 2).style('font-size',14)
  /*
  AQI_line_0
  .transition()
  .duration(800)
  .attr("points", [[(5/2)*(padding_bar+barwidth_bar)-move_x+barwidth_bar, AQI_y],
  [(-5/2)*(padding_bar+barwidth_bar)-move_x, AQI_y]])
  */
  AQI_line_0
      .transition()
      .duration(800)
       .attr("x1",(5/2)*(padding_bar+barwidth_bar)-move_x+barwidth_bar)
       .attr("x2",(-5/2)*(padding_bar+barwidth_bar)-move_x)


  AQI_text_0
  .transition()
  .duration(800)
  .attr("x",barwidth_bar/2-move_x)
  // Define the blink function
}

function add_rosa(date,data,info){



  console.log("Explain-Animation: add_rosa")
  
  explainText = document.getElementById('explain-text');

  const textBox = document.getElementById('text-box');
  
  const paddingH = 20; // Horizontal padding
  const paddingV = 10; // Vertical padding

  // Set the text content
  explainText.innerHTML = 'We can further arrange the bars in to a circle by <b>rounding the x-axis</b>. Now the daily AQI is represented in the flower-like shape.';
  explainText.maxWidth = text_length+ 'px';
  // Get the dimensions of the text
  const bbox = explainText.getBoundingClientRect();
  const textWidth = bbox.width;
  const textHeight = bbox.height;

  // Set the dimensions and position of the bounding box
  textBox.style.width = text_length+padding_text + 'px';
  textBox.style.height = (textHeight + paddingV * 2) + 'px';
  textBox.style.left = '51%';
  textBox.style.top = '20%';
  textBox.style.transform = 'translate(-50%, -50%)';

  // Position the text within the bounding box
  explainText.style.left = '50%';
  explainText.style.top = '20%';
  explainText.style.transform = 'translate(-50%, -50%)';

  function blinkBar(index,blinkCount) {
    blinkDuration = 500
    const numberOfBlinks = 1;
    // Check if the current index exceeds the number of bars
    if (index >= bars.size()) {
      return; // Stop the recursion if we've blinked all bars
    }
    // Select the current bar using the index
    const currentBar = bars.filter((d, i) => i === index);
    const currentlabel1 = labels1.filter((d, i) => i === index);
    const currentlabel2 = labels2.filter((d, i) => i === index);

    // Perform a single blink cycle (fade out and in)
    currentBar.transition()
      .duration(blinkDuration)
      .attr('opacity', 0) // Fade to transparent
      .transition()
      .duration(blinkDuration)
      .attr('opacity', 1) // Fade back to original color
      .on('end', () => {
        if (blinkCount < numberOfBlinks - 1) {
          // If we haven't reached the desired number of blinks, blink again
          blinkBar(index, blinkCount + 1);
        } else {
          // Move to the next bar once we've reached the desired number of blinks
          blinkBar(index + 1, 0);
        }
      });
    // Perform a single blink cycle (fade out and in)
    currentlabel1.transition()
      .duration(blinkDuration)
      .attr('opacity', 0) // Fade to transparent
      .transition()
      .duration(blinkDuration)
      .attr('opacity', 1) // Fade back to original color
      .on('end', () => {
        if (blinkCount < numberOfBlinks - 1) {
          // If we haven't reached the desired number of blinks, blink again
          blinkBar(index, blinkCount + 1);
        } else {
          // Move to the next bar once we've reached the desired number of blinks
          blinkBar(index + 1, 0);
        }
      });
  // Perform a single blink cycle (fade out and in)
  currentlabel2.transition()
    .duration(blinkDuration)
    .attr('opacity', 0) // Fade to transparent
    .transition()
    .duration(blinkDuration)
    .attr('opacity', 1) // Fade back to original color
    .on('end', () => {
      if (blinkCount < numberOfBlinks - 1) {
        // If we haven't reached the desired number of blinks, blink again
        blinkBar(index, blinkCount + 1);
      } else {
        // Move to the next bar once we've reached the desired number of blinks
        blinkBar(index + 1, 0);
      }
    });
  }

  // Start the blinking effect with the first bar and initial blink count of 0
  blinkBar(0, 0);
  AQI_line_0.transition()
    .delay(6*1000) // Initial delay of 6000ms
    .duration(500) // Duration of the color change
    .style('opacity', 0) // Change color to blinkColor
    .transition() // Chain another transition to return to the original color
    .duration(500) // Duration of the return transition
    .style('opacity', 1)
  create_rosa(date,data,info)


}
//create_rosa(data)
function create_rosa(date,data,info){
  d3.select("#Realtime-dot").style("display", "block")
  console.log(d3.select("Realtime-dot"))
// Delay the display change by 20 seconds (20000 milliseconds)
setTimeout(function() {
  d3.select("#bubbleContainer_rosa")
    .style("display", "flex")
    .on("click", function() {
      console.log("Explain: jump to homepage");
      // Redirect to another HTML page on the same domain
      window.location.href = '/';
    });
}, 5000); // 20 seconds delay


circle_bar = d3.select('#bar_chart').select('svg').append('g').attr("id",'circle_bar').attr("transform",`translate(${width*0.6}, ${height / 2})`)


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
  .attr('transform', d => `rotate(${calculateRotation(d)})`)
  .style('opacity',0)
  .transition()
  .delay(function(d, i) {
    return i * 1000; // Delay each subsequent bar by an additional 100ms
  })
  .duration(800)
  .style('opacity',1)

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
.style('opacity',0)
.transition()
.delay(function() {
  return 6 * 1000; // Delay each subsequent bar by an additional 100ms
})
.duration(800)
.style('opacity',1)
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
  .style('opacity',0)
  .transition()
  .delay(function(d,i) {
    return i * 1000; // Delay each subsequent bar by an additional 100ms
  })
  .duration(800)
  .style('opacity',1)
  var yAxis = layer3
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
const padding_v = 10;
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
      return `translate(${20*indicate+(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.cos(Math.PI+angleScale(data[i].Type))},
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
      .style('opacity',0)
      .transition()
      .delay(function() {
        return i * 1000; // Delay each subsequent bar by an additional 100ms
      })
      .duration(800)
      .style('opacity',1)
    text.append("tspan")
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
      .style('opacity',0)
      .transition()
      .delay(function() {
        return i * 1000; // Delay each subsequent bar by an additional 100ms
      })
      .duration(800)
      .style('opacity',1)


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
      .style('stroke-width', '3')
      .style('opacity',0)
      .transition()
      .delay(function() {
        return i * 1000; // Delay each subsequent bar by an additional 100ms
      })
      .duration(800)
      .style('opacity',1)

  text_group = layer3.append("g")
      .attr("transform",  function(){
        var indicate = 1
        if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
          indicate = 1}
        else{indicate = -1}
      return `translate(${(textWidth+padding_h)*indicate+(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.cos(Math.PI+angleScale(data[i].Type))},
      ${(bar_height(AQI_value, outerRadius, innerRadius)+buttun_line_padding)*Math.sin(Math.PI+angleScale(data[i].Type))})`
    })


    if(data[i].Type==DP){
    DP_group = text_group.append("g")
    .attr("text-anchor", "middle").attr("transform", function(){
      var indicate = 1
      if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
        indicate = 1}
      else{indicate = -1}
    return `translate(${-indicate*70},${indicate*50})`})

    DP_info = DP_group.append("text").attr("x",80).attr("y",10);
    DP_info = DP_group.append("text").attr("x",106).attr("y",5);
    DP_group.append("path")
    .attr("d", "M0,-7 L10,-7 L20,0 L10,7 L-5,7 L-5,-7 Z") // Triangle path with the tip centered at (0,0)
    .attr("fill", color_fill(AQI_value,view_type))
    .style("opacity",0)
    .transition()
    .delay(function() {
      return i * 1000; // Delay each subsequent bar by an additional 100ms
    })
    .duration(800)
    .style("opacity",1)
  // Draw the exclamation mark using rectangles for simplicity

  DP_group.append("rect")
    .attr("x", -1) // X position (centered at 0,0)
    .attr("y", -2) // Y position (above the bottom)
    .attr("width", 10) // Width of the exclamation mark
    .attr("height", 3) // Height of the exclamation mark's stick
    .attr("fill", "#fff") // Fill with white color
    .style("opacity",0)
    .transition()
    .delay(function() {
      return i * 1000; // Delay each subsequent bar by an additional 100ms
    })
    .duration(800)
    .style("opacity",1)

    // Append the text "Driver Pollutant"
    DP_info.append("tspan")
    .attr("dx", "-20")
    .attr("dy", "1")        
    .text(" Driver Pollutant")
    .style("font-weight", "bold")
    .style("fill", color_fill(AQI_value,view_type)); // Style the text color


      const bbox = DP_group.node().getBBox();
      const textWidth = bbox.width;
      const textHeight = bbox.height;
      DP_group.attr("text-anchor", "middle").attr("transform", function(){
            var indicate = 1
            if (Math.cos(Math.PI+angleScale(data[i].Type))>0){
              indicate = 1}
            else{indicate = -1}
            return `translate(${-1.52*textWidth},${indicate*(textHeight+15)})`})
            .style("opacity",0)
                .transition()
                .delay(function() {
                  return i * 1000; // Delay each subsequent bar by an additional 100ms
                })
                .duration(800)
                .style("opacity",1)

        }
}


circle_bar.attr('transform', `translate(${width*0.7}, ${height*0.45}) scale(${scaleFactor})`)
circle_bar.append("rect").attr("width",900).attr("height",700)
.attr("x",-450).attr("y",-350).attr("fill","blue").attr("opacity",0)
.on('click', function() {
  console.log("Explain: jump to homepage")
  // Redirect to another HTML page on the same domain
  window.location.href = '/';
});
}

function bar_height_bar(d, max, min){
  var res;
  if(d<151){
    res =  d;}
  else if (d<301){res= 200+(d-200)/2;}
  else if (d<501){res = 200+(300-200)/2+(d-300)/4;}
  return res*1.5
}
function bar_height_2(d, max, min){
  return 4.5*Math.pow(d,0.65)+barwidth
}
function bar_height(d, max, min){
  var res;
  if(d<151){
    res =  d;}
  else if (d<301){res= 200+(d-200)/2;}
  else if (d<501){res = 200+(300-200)/2+(d-300)/4;}
  return res*0.85+barwidth
}

function text_to_display(dateString){
  // Function to parse the date in m/d/y format
const parseDate = d3.timeParse("%m/%d/%y");

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
function wrapText(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.5, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}


function openOverlay(buttonText,info) {
  console.log("Explain: Open_Info_Card: "+buttonText)
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
  console.log("Explain: Info_card_filp")
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
document.addEventListener('click', function(event) {
  resetTimer(len)})

  document.getElementById('color_bar').addEventListener('click', function(){
    console.log("Explain: Open_Info_Card: Color")
    event.stopPropagation();
    document.getElementById('overlay_color').style.display = 'block';
  });