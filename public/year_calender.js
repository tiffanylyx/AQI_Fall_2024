var first_click = 1

const today = new Date();
d3.select("#right-div").style("width","70%")
d3.select("#left-div").style("width","30%")
const svg_calender = d3.select('#calendar').append('svg')
container = d3.select('#calendar');

// Get the width of the container div
containerWidth = container.node().getBoundingClientRect().width;
containerHeight = container.node().getBoundingClientRect().height;

const months = d3.range(0, 12); // Array [0, 1, ..., 11] for months
const gridWidth = (containerWidth)/3;
const gridHeight = containerHeight/1.7;

svg_calender.attr("width", containerWidth ) // 7 days for a week
  .attr("height", gridHeight*4+40); // 6 rows to accommodate all days



const dayWidth = (gridWidth-40)/7;
const dayHeight = gridHeight/7.5;
const day_array = ['S','M','T','W','T','F', 'S']

var svg_date;
Promise.all([
  d3.csv(csvFile1),
  d3.csv(csvFile2)
]).then(function([data, info]) {
  data.forEach(function(d) {
    d.Date_org = d.Date
    d.Date = d3.timeParse("%m/%d/%Y")(d.Date);
  });


});
function create_year(data, info,select_year){
  setTogglingEnabled(true);

  console.log("Calendar: select Year: ",select_year)
  d3.select("#tapBubble").style("display","none")
  d3.select("#centerBubble").style("display","flex")
  d3.select("#centerBubble").select("p").text("Scroll to explore monthly trends")
  d3.select("#tapBubble").select("p").text("Tap a month to explore")
  d3.select("#calendar").style("display","block")
  d3.select("#year-title").text(select_year)
  d3.select("#year-view-header").style("display","block")
  d3.select("#daily_chart").style("display","none")
  d3.select("#explain_text").style("display","block")
  d3.select("#right-div").style("width","70%")
  d3.select("#left-div").style("width","30%")
  container = d3.select('#calendar');

  // Get the width of the container div
  containerWidth = screen.width*0.6;
  containerHeight = screen.height*0.8;

  const gridWidth = (containerWidth)/3;
  const gridHeight = containerHeight/1.7;
  const day_array = ['S','M','T','W','T','F', 'S']
  d3.select("#calendar-header").style("display","none")
  d3.select("#calendar").style("overflow-y","auto")

  const dayWidth = (gridWidth-40)/7;
  const dayHeight = gridHeight/7.5;
  svg_calender.selectAll("*").remove()
  svg_calender.attr("width", containerWidth) // 7 days for a week
    .attr("height", gridHeight*4+80); // 6 rows to accommodate all days

  months.forEach(function(month, index) {

      monthGroup = svg_calender.append('g')
          .attr('transform', 'translate(' + ((index % 3) * gridWidth+10) + ',' + (Math.floor(index / 3) * gridHeight +10)+ ')');

      svg_header= monthGroup.append('g')
      svg_date = monthGroup.append('g').attr("class",month)
      svg_header.attr('transform', `translate(0, ${10})`);
      svg_date.attr('transform', `translate(0, ${40+dayHeight / 2})`);



      const cells_day = svg_header.selectAll("g")
        .data(day_array)
        .enter()
        .append("g")
        .attr("transform", (d, i) => {
          const x = (i % 7) * dayWidth; // Calculate x based on the day of the week
          const y = dayHeight*0.5; // Calculate y based on the week
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
        .attr('class','note')
        .style("font-size","16px")

      svg_header.append("text")
        .attr("x", (gridWidth-30) / 2)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .text(new Date(select_year, month).toLocaleString('en-us', { month: 'long' }) + " " + select_year)
        .attr('class','semi-title')


      create_calender(svg_date,month,data,info)
      monthGroup.append("rect")
      .attr("fill","white")
      .style("opacity",0)
      .attr("width",gridWidth)
      .attr("height",gridHeight)
      .on('click', function() {
          first_click = 1
          create_select_month(svg_calender,month,data,info,first_click)
          console.log('Calendar: Month ' + (month + 1) + ' clicked');
          // Logic to display the detailed view for the month
      });




})
}
function create_calender(svg_date,select_month,data,info){

  const monthData = data.filter(d => {
      const selectedDate = new Date(select_year, select_month, 1); // Creating a Date object for the selected year and month
      const dataDate = new Date(d.Date); // Creating a Date object for the data's date

      // Checking if the year and month of the data's date match the selected year and month
      return dataDate.getFullYear() === selectedDate.getFullYear() &&
             dataDate.getMonth() === selectedDate.getMonth();
  });
var data_for_day = []

// Define the start date of the month and the number of days in July 2023
const startDate = new Date(select_year, select_month, 1); // Months are zero-indexed, 6 represents July
const daysInMonth = new Date(select_year, select_month+1, 0).getDate(); // Get the last day of July

// Get the day of the week for July 1st, 2023
const startDay = startDate.getDay(); // For July 1st, 2023, this should be 6 (Saturday)

// Calculate the total number of calendar cells needed (including leading/trailing dates)
const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

// Generate an array for all the cells in the calendar
const calendarArray = Array.from({ length: totalCells }).map((_, i) => {
  let day = i - startDay + 1; // Calculate the day number
  return day > 0 && day <= daysInMonth ? day : ""; // Return day number or empty string
});
var day_w
var day_h
for(i in calendarArray){
  cell = svg_date.append("g")
  .attr("transform", function(){
    const x = (i % 7) * dayWidth; // Calculate x based on the day of the week
    const y = (Math.floor(i / 7)) * dayHeight+10; // Calculate y based on the week
    return `translate(${x}, ${y})`;
  });
  cell.append("rect")
    .attr('id','edge')
    .attr("width", dayWidth - 1) // Subtract 1 for grid gap
    .attr("height", dayHeight - 1)
    .style("fill", "#ffffff")
    .style("opacity",0)
    .style("stroke", "black")
    .style("stroke-width", 0)
    cell.append("text")
      .attr("x", dayWidth / 2)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em") // Vertical alignment
      .text(calendarArray[i])
      .attr('class','note')
      .attr("opacity",0.6)
      .style("font-size",8)
  var data_for_day = []
  if(calendarArray[i]>0){
    data_for_day = monthData.filter(d => d.Date.getDate() === calendarArray[i])
    if(data_for_day.length>0){
      if(chart_type=='circular'){
        create_rosa_small(data_for_day[0].Date_org,data_for_day,cell,info,screen.width/(50*bar_height(300)),dayWidth,dayHeight,'False')

      }
      else{
        create_bar_small(data_for_day[0].Date_org,data_for_day,cell,info,screen.width/(40*bar_height(300)),dayWidth,dayHeight,'False')
      }
    }
      }

}
}
function create_select_month_direct(svg_calender,select_date,data,info,first_click){
  setTogglingEnabled(false);
  select_year = select_date.getFullYear()
  select_month = select_date.getMonth()
  select_day = select_date.getDate()

    console.log("Calendar: select Year: ",select_year)
    d3.select("#tapBubble").style("display","none")
    d3.select("#centerBubble").style("display","flex")
    d3.select("#centerBubble").select("p").text("Scroll to explore monthly trends")
    d3.select("#tapBubble").select("p").text("Tap a month to explore")
    d3.select("#calendar").style("display","block")
    d3.select("#year-title").text(select_year)
    d3.select("#year-view-header").style("display","block")
    d3.select("#daily_chart").style("display","none")
    d3.select("#explain_text").style("display","block")
    d3.select("#right-div").style("width","70%")
    d3.select("#left-div").style("width","30%")
    container = d3.select('#calendar');

    // Get the width of the container div
    containerWidth = screen.width*0.6;
    containerHeight = screen.height*0.8;
    d3.select("#centerBubble").style("display","none")
    d3.select("#tapBubble").style("display","none")


    // Get the width of the container div
    containerWidth = screen.width*0.6;
    containerHeight = screen.height*0.8;

    d3.select("#calendar-header").style("display","none")
    d3.select("#calendar").style("overflow-y","auto")

    svg_calender.selectAll("*").remove()
    svg_calender.attr("width", containerWidth) // 7 days for a week
      .attr("height", containerHeight); // 6 rows to accommodate all days

  d3.select("#right-div").style("width","50vw")
  d3.select("#left-div").style("width","40vw")
  d3.select("#daily_chart").style("display","block")
  d3.select("#calendar-header").style("display","block")
  d3.select("#calendar").style("overflow-y","hidden")
  d3.select('#calendar-title')
  .text(new Date(select_year, select_month)
  .toLocaleString('en-us', { month: 'long' }) + " " + select_year)
  d3.select("#daily_chart").style("display","block")
  d3.select("#explain_text").style("display","none")
  container = d3.select('#calendar');
  // Get the width of the container div
  containerWidth = container.node().getBoundingClientRect().width;
  containerHeight = container.node().getBoundingClientRect().height;

   const gridWidth = (containerWidth)/3;
   const gridHeight = containerHeight/1.7;

  svg_calender.attr("width", containerWidth ) // 7 days for a week
    .attr("height", gridHeight*4+40); // 6 rows to accommodate all days

  size = screen.width/(28*bar_height(300))
  const dayWidth = containerWidth/7;
  const dayHeight = containerHeight/7;
  svg_calender.attr("width", containerWidth) // 7 days for a week
    .attr("height", containerHeight); // 6 row

  svg_calender.selectAll("*").remove()

  svg_header= svg_calender.append('g')
  svg_date = svg_calender.append('g')
  svg_header.attr('transform', `translate(0, ${10})`);
  svg_date.attr('transform', `translate(0, ${40+dayHeight / 2})`);

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
    .attr("width", dayWidth - 0.5) // Subtract 1 for grid gap
    .attr("height", dayHeight/2 )
    .style("fill", "none")
    .style("stroke", "#ffffff")
    .style("stroke-width",1)

  // Add text labels for each day
  cells_day.append("text")
    .attr("x", dayWidth / 2)
    .attr("y", (dayHeight/2-10) / 2)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em") // Vertical alignment
    .text(d => d)
    .attr('class','semi-title')

  const monthData = data.filter(d => {
      const selectedDate = new Date(select_year, select_month, 1); // Creating a Date object for the selected year and month
      const dataDate = new Date(d.Date); // Creating a Date object for the data's date

      // Checking if the year and month of the data's date match the selected year and month
      return dataDate.getFullYear() === selectedDate.getFullYear() &&
             dataDate.getMonth() === selectedDate.getMonth();
  });
  var data_for_day = []

  // Define the start date of the month and the number of days in July 2023
  const startDate = new Date(select_year, select_month, 1); // Months are zero-indexed, 6 represents July
  const daysInMonth = new Date(select_year, select_month+1, 0).getDate(); // Get the last day of July

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
      const y = (Math.floor(i / 7)-0.5) * dayHeight+20; // Calculate y based on the week
      return `translate(${x}, ${y})`;
    });
    cell.append("rect")
      .attr('id',function(){
        if(calendarArray[i]>0){
          return "edge"
        }
        else{
          return "empty"
        }
      })
      .attr("width", dayWidth -0.5) // Subtract 1 for grid gap
      .attr("height", dayHeight - 0.5)
      .style("fill", function(){
        if(calendarArray[i]==select_day){
          day_w = ((i-1) % 7) * dayWidth
          day_h = (Math.floor((i-1)/ 7)-0.5) * dayHeight+20
          console.log(day_w,day_h,select_day)
          return "#DCEBFE"
        }
        else if(calendarArray[i]>0){
          return "#ffffff"
        }
        else{
          return "#eeeeee"
        }
      })
      .style("opacity",1)
      .style("stroke", "#E4E4E7")
      .style("stroke-width",1)

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
      if(data_for_day.length>0){
        if(chart_type=='circular'){
          create_rosa_small(data_for_day[0].Date_org,data_for_day,cell,info,size,dayWidth,dayHeight,'True')

        }
        else{
          size = screen.width/(20*bar_height(300))
          create_bar_small(data_for_day[0].Date_org,data_for_day,cell,info,size,dayWidth,dayHeight,'True')

        }

        //create_rosa_small(data_for_day[0].Date_org,data_for_day,cell,info,size,dayWidth,dayHeight,'True')
      }
      else{
        cell.append("text").attr("x", dayWidth / 2)
        .attr("y", dayHeight/2+10)
        .attr("text-anchor", "middle")
        .text("Missing")
        .style("fill","#999999")
        .style("font-size",30)
        }
      }


}

data_for_day = monthData.filter(d => d.Date.getDate() === select_day)
console.log(select_day)
if(chart_type=='circular'){
  create_rosa((1+select_month).toString()+"/"+select_day+"/"+select_year,data_for_day,info)
}
else{
  create_bar((1+select_month).toString()+"/"+select_day+"/"+select_year,data_for_day,info)
}

d3.select('#prev-month-btn').on('click', function() {
  console.log("Calendar: back-month")
    // Decrement the month and update year if needed
    select_month--;
    if (select_month < 0) {
        select_month = 11;
        select_year--;
    }
    if (select_year < 2014) {
        // Reset to the minimum limit
        select_year = 2014;
        select_month = 0;
    }
    first_click = 1
    create_select_month(svg_calender,select_month,data,info,first_click)
});

// Click event handler for the next month button
d3.select('#next-month-btn').on('click', function() {
    console.log("Calendar: next-month")
    // Increment the month and update year if needed
    select_month++;
    if (select_month > 11) {
        select_month = 0;
        select_year++;
    }
    if (select_year > 2023) {
        // Reset to the maximum limit
        select_year = 2023;
        select_month = 11;
    }
    first_click = 1
    create_select_month(svg_calender,select_month,data,info,first_click)
});
d3.select('#back-to-year-btn').on('click', function() {
  console.log("Calendar: back-to-year")
  create_year(data, info,select_year)
})
}
function create_select_month(svg_calender,select_month,data,info,first_click){
  setTogglingEnabled(false);

  // Get the width of the container div
  containerWidth = screen.width*0.6;
  containerHeight = screen.height*0.8;
  d3.select("#centerBubble").style("display","none")
  d3.select("#tapBubble").style("display","none")


  d3.select("#right-div").style("width","50vw")
  d3.select("#left-div").style("width","40vw")
  d3.select("#daily_chart").style("display","block")
  const day_array = ['Sun','Mon','Tue','Wed','Thu','Fri', 'Sat']
  d3.select("#calendar-header").style("display","block")
  d3.select("#calendar").style("overflow-y","hidden")
  d3.select('#calendar-title')
  .text(new Date(select_year, select_month)
  .toLocaleString('en-us', { month: 'long' }) + " " + select_year)
  d3.select("#daily_chart").style("display","block")
  d3.select("#explain_text").style("display","none")
  container = d3.select('#calendar');
  // Get the width of the container div
containerWidth = container.node().getBoundingClientRect().width;
containerHeight = container.node().getBoundingClientRect().height;

  const gridWidth = (containerWidth)/3;
  const gridHeight = containerHeight/1.7;

  svg_calender.attr("width", containerWidth ) // 7 days for a week
    .attr("height", gridHeight*4+40); // 6 rows to accommodate all days

  size = screen.width/(28*bar_height(300))
  const dayWidth = containerWidth/7;
  const dayHeight = containerHeight/7;
  svg_calender.attr("width", containerWidth) // 7 days for a week
    .attr("height", containerHeight); // 6 row

  svg_calender.selectAll("*").remove()

  svg_header= svg_calender.append('g')
  svg_date = svg_calender.append('g')
  svg_header.attr('transform', `translate(0, ${10})`);
  svg_date.attr('transform', `translate(0, ${40+dayHeight / 2})`);

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
    .attr("width", dayWidth - 0.5) // Subtract 1 for grid gap
    .attr("height", dayHeight/2 )
    .style("fill", "none")
    .style("stroke", "#ffffff")
    .style("stroke-width",1)

  // Add text labels for each day
  cells_day.append("text")
    .attr("x", dayWidth / 2)
    .attr("y", (dayHeight/2-10) / 2)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em") // Vertical alignment
    .text(d => d)
    .attr('class','semi-title')

  const monthData = data.filter(d => {
      const selectedDate = new Date(select_year, select_month, 1); // Creating a Date object for the selected year and month
      const dataDate = new Date(d.Date); // Creating a Date object for the data's date

      // Checking if the year and month of the data's date match the selected year and month
      return dataDate.getFullYear() === selectedDate.getFullYear() &&
             dataDate.getMonth() === selectedDate.getMonth();
  });
  var data_for_day = []

  // Define the start date of the month and the number of days in July 2023
  const startDate = new Date(select_year, select_month, 1); // Months are zero-indexed, 6 represents July
  const daysInMonth = new Date(select_year, select_month+1, 0).getDate(); // Get the last day of July

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
      const y = (Math.floor(i / 7)-0.5) * dayHeight+20; // Calculate y based on the week
      return `translate(${x}, ${y})`;
    });
    cell.append("rect")
      .attr('id',function(){
        if(calendarArray[i]>0){
          return "edge"
        }
        else{
          return "empty"
        }
      })
      .attr("width", dayWidth -0.5) // Subtract 1 for grid gap
      .attr("height", dayHeight - 0.5)
      .style("fill", function(){
        if(calendarArray[i]==select_day){
          day_w = ((i-1) % 7) * dayWidth
          day_h = (Math.floor((i-1)/ 7)-0.5) * dayHeight+20
          console.log(day_w,day_h,select_day)
          return "#DCEBFE"
        }
        else if(calendarArray[i]>0){
          return "#ffffff"
        }
        else{
          return "#eeeeee"
        }
      })
      .style("opacity",1)
      .style("stroke", "#E4E4E7")
      .style("stroke-width",1)

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
      if(data_for_day.length>0){
        if(chart_type=='circular'){
          create_rosa_small(data_for_day[0].Date_org,data_for_day,cell,info,size,dayWidth,dayHeight,'True')

        }
        else{
          size = screen.width/(20*bar_height(300))
          create_bar_small(data_for_day[0].Date_org,data_for_day,cell,info,size,dayWidth,dayHeight,'True')

        }

        //create_rosa_small(data_for_day[0].Date_org,data_for_day,cell,info,size,dayWidth,dayHeight,'True')
      }
      else{
        cell.append("text").attr("x", dayWidth / 2)
        .attr("y", dayHeight/2+10)
        .attr("text-anchor", "middle")
        .text("Missing")
        .style("fill","#999999")
        .style("font-size",30)
        }
      }


}

data_for_day = monthData.filter(d => d.Date.getDate() === select_day)
if(chart_type=='circular'){
  create_rosa((1+select_month).toString()+"/"+select_day+"/"+select_year,data_for_day,info)
}
else{
  create_bar((1+select_month).toString()+"/"+select_day+"/"+select_year,data_for_day,info)
}

d3.select('#prev-month-btn').on('click', function() {
  console.log("Calendar: back-month")
    // Decrement the month and update year if needed
    select_month--;
    if (select_month < 0) {
        select_month = 11;
        select_year--;
    }
    if (select_year < 2014) {
        // Reset to the minimum limit
        select_year = 2014;
        select_month = 0;
    }
    first_click = 1
    create_select_month(svg_calender,select_month,data,info,first_click)
});

// Click event handler for the next month button
d3.select('#next-month-btn').on('click', function() {
    console.log("Calendar: next-month")
    // Increment the month and update year if needed
    select_month++;
    if (select_month > 11) {
        select_month = 0;
        select_year++;
    }
    if (select_year > 2023) {
        // Reset to the maximum limit
        select_year = 2023;
        select_month = 11;
    }
    first_click = 1
    create_select_month(svg_calender,select_month,data,info,first_click)
});
d3.select('#back-to-year-btn').on('click', function() {
  console.log("Calendar: back-to-year")
  create_year(data, info,select_year)
})
}
function create_bar_small(date,data_select,group,info,size,width,height,click){
  AQI_value = 0
  let move_y = 100
  barwidth = 40
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
var padding_bar = 0

const circle_bar = group.append('g').attr("id",'circle_bar').attr("transform",`translate(${width/2+10}, ${height*0.55})`)
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
      return 8
    }
    else{ return 0}
  })




AQI_y =-bar_height_bar(AQI_value, outerRadius, innerRadius )+move_y
  AQI_line_0 = layer1
  .append("line")
  .attr("x1",(3)*(padding_bar+barwidth))
  .attr("x2",(-3)*(padding_bar+barwidth))
       .attr("y1",AQI_y)
       .attr("y2",AQI_y)
        .attr("stroke", color_fill(AQI_value,view_type)) // arrow.attr can also be used as a getter
        .attr("fill", color_fill(AQI_value,view_type))
        .attr("stroke-width", 10)
        .attr("opacity",0)
layer1.attr('transform', `scale(${size})`)
layer2.attr('transform', `scale(${size})`)
layer3.attr('transform', `scale(${size})`)
if(click=='True'){

  group.on("click", function(){
    create_bar(date,data,info)
    svg_calender.selectAll('#edge').style('fill',"#ffffff")
    group.select('#edge').style('fill',"#DCEBFE")
  })}

}
function create_rosa_small(date,data,group,info,size,width,height,click){
  barwidth = 25
  AQI_value = 0
const circle_bar = group.append('g').attr("id",'circle_bar').attr("transform",`translate(${width/2}, ${height*0.55})`)
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
.attr("stroke",color_fill(AQI_value,view_type))
.attr("stroke-width",10)


  var yAxis = layer3
      .attr("text-anchor", "middle");

  var yTick = yAxis
    .selectAll("g")
    .data(rank)
    .enter().append("g");
layer2.attr('transform', `scale(${size})`)
layer3.attr('transform', `scale(${size})`)
if(click=='True'){

group.on("click", function(){
  console.log("Calendar: Open Daily Calendar: "+date)
  create_rosa(date,data,info)
    svg_calender.selectAll('#edge').style('fill',"#ffffff")
  group.select('#edge').style('fill',"#DCEBFE")
})}
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
  return res*0.85+barwidth
}
