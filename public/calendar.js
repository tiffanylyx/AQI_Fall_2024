var select_month = 6
select_date = 193

const svg_calender = d3.select('#calender').append('svg')
const svg_header= svg_calender.append('g')
const svg_date = svg_calender.append('g')

// Set the dimensions for each day cell and the SVG canvas size
const dayWidth = width/6;
const dayHeight = height/7.5;
const margin_top = 0
svg_header.attr('transform', `translate(0, ${margin_top})`);
svg_date.attr('transform', `translate(0, ${margin_top+dayHeight / 2})`);
svg_calender.attr("width", dayWidth * 7) // 7 days for a week
  .attr("height", dayHeight*7); // 6 rows to accommodate all days

  // Create a group for each cell in the calendar
  const day_array = ['Sun','Mon','Tue','Wed','Thur','Fri', 'Sat']


  const cells_day = svg_header.selectAll("g")
    .data(day_array)
    .enter()
    .append("g")
    .attr("transform", (d, i) => {
      const x = (i % 7) * dayWidth; // Calculate x based on the day of the week
      const y = (Math.floor(i / 7)) * dayHeight*0.45; // Calculate y based on the week
      return `translate(${x}, ${y})`;
    });

  // Add rectangles for each day cell
  cells_day.append("rect")
    .attr("width", dayWidth - 1) // Subtract 1 for grid gap
    .attr("height", dayHeight/2 - 10)
    .style("fill", "none")
    .style("stroke", "none");

  // Add text labels for each day
  cells_day.append("text")
    .attr("x", dayWidth / 2)
    .attr("y", (dayHeight/2-10) / 2)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em") // Vertical alignment
    .text(d => d)
    .attr('class','semi-title')
    Promise.all([
      d3.csv(csvFile1),
      d3.csv(csvFile2)
    ]).then(function([data, info]) {
  data.forEach(function(d) {
    d.Date_org = d.Date
    d.Date = d3.timeParse("%m/%d/%Y")(d.Date);
  });
  year = 2023
  d3.select('#calendar-title')
  .text(new Date(year, select_month)
  .toLocaleString('en-us', { month: 'long' }) + " " + year)

  create_calender(select_month,data,info)
  // Click event handler for the previous month button
  d3.select('#prev-month-btn').on('click', function() {
      // Decrement the month and update year if needed
      select_month--;
      if (select_month < 0) {
          select_month = 11;
          year--;
      }
      if (year < 2023) {
          // Reset to the minimum limit
          year = 2023;
          select_month = 0;
      }
      create_calender(select_month, data,info);
  });

  // Click event handler for the next month button
  d3.select('#next-month-btn').on('click', function() {
      // Increment the month and update year if needed
      select_month++;
      if (select_month > 11) {
          select_month = 0;
          year++;
      }
      if (year > 2023) {
          // Reset to the maximum limit
          year = 2023;
          select_month = 11;
      }
        console.log(info)
      create_calender(select_month, data,info);
  });

})
function create_calender(select_month,data,info){


  svg_date.selectAll('*').remove()
  d3.select('#calendar-title').text(new Date(year, select_month).toLocaleString('en-us', { month: 'long' }) + " " + year);

// Filter for the month of February
const monthData = data.filter(d => d.Date.getMonth() === select_month); // Month is zero-indexed, 1 = February

var data_for_day = []

// Define the start date of the month and the number of days in July 2023
const startDate = new Date(2023, select_month, 1); // Months are zero-indexed, 6 represents July
const daysInMonth = new Date(2023, select_month+1, 0).getDate(); // Get the last day of July

// Get the day of the week for July 1st, 2023
const startDay = startDate.getDay(); // For July 1st, 2023, this should be 6 (Saturday)

// Calculate the total number of calendar cells needed (including leading/trailing dates)
const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

// Generate an array for all the cells in the calendar
const calendarArray = Array.from({ length: totalCells }).map((_, i) => {
  let day = i - startDay + 1; // Calculate the day number
  return day > 0 && day <= daysInMonth ? day : ""; // Return day number or empty string
});

for(i in calendarArray){

  cell = svg_date.append("g")
  .attr("transform", function(){
    const x = (i % 7) * dayWidth; // Calculate x based on the day of the week
    const y = (Math.floor(i / 7)) * dayHeight-5; // Calculate y based on the week
    return `translate(${x}, ${y})`;
  });
  cell.append("rect")
    .attr('id','edge')
    .attr("width", dayWidth - 1) // Subtract 1 for grid gap
    .attr("height", dayHeight - 1)
    .style("fill", "#F5F6F6")
    .style("opacity",function(){
      if((select_month==6)&&(calendarArray[i]==18)) {
       return 1
      }
      else{return 0}
    })
    .style("stroke", "black")
    .style("stroke-width", function(){
      if((select_month==6)&&(calendarArray[i]==18)){
       return 2
      }
      else{return 0}
    })

  cell.append("text")
    .attr("x", dayWidth / 2)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em") // Vertical alignment
    .text(calendarArray[i])
    .attr('class','note')

  var data_for_day = []

  if(calendarArray[i]>0){
    data_for_day = monthData.filter(d => d.Date.getDate() === calendarArray[i])


    create_rosa_small(data_for_day[0].Date_org,data_for_day,cell,info,True)
  }

}
}


function create_rosa_small(date,data,group,info,click){
  barwidth = 40
  AQI_value = 0
const circle_bar = group.append('g').attr("id",'circle_bar').attr("transform",`translate(${dayWidth/2}, ${dayHeight*0.55})`)
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
    if(AQI_value<parseInt(d.Value)){
      AQI_value = parseInt(d.Value)
      DP = d.Type
    }
    return color_fill(d.Value)
  })
  .attr("stroke", function(d){
    if(d.Type==DP){
      return 'Black'
    }
    else{ return 'None'}
  })
  .attr("stroke-width", function(d){
    if(d.Type==DP){
      return 10
    }
    else{ return 0}
  })
  // First translate to the bottom center, then rotate
  .attr('transform', d => `rotate(${calculateRotation(d)})`);
const circle = layer3.append('circle')
.attr('cx', 0)
.attr('cy', 0)
.attr('r',barwidth/1.5)
.attr("fill","white")

const AQI_mark =  layer2.append('circle')
.attr('cx', 0)
.attr('cy', 0)
.attr('r',bar_height(AQI_value, outerRadius, innerRadius ))
//.attr("fill",color_fill(AQI_value))
.attr("fill",'none')
//.style('fill-opacity',0.3)
.attr("stroke",color_fill(AQI_value))
.attr("stroke-width",10)



  var yAxis = layer3
      .attr("text-anchor", "middle");

  var yTick = yAxis
    .selectAll("g")
    .data(rank)
    .enter().append("g");
layer2.attr('transform', `scale(${0.27})`)
layer3.attr('transform', `scale(${0.27})`)
if(click==True){

group.on("click", function(){
  create_rosa(date,data,info)
    svg_calender.selectAll('#edge').style('stroke-width',0).style("opacity",0)
  group.select('#edge').style('stroke','black').style('stroke-width',2).style("opacity",1)

})}
}
