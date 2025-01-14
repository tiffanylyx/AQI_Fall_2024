// Original console.log function
const originalConsoleLog = console.log;

// Redefine console.log
console.log = function(message, ...optionalParams) {
    originalConsoleLog(message, ...optionalParams);  // Keep normal log in the console

    // Send log message to the server
    fetch('/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({message, optionalParams})
    });
};
let view_type = "types"
let year_view_chart = "grid"
let chart_type = "circular"
function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(), // Split the text into words
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          x = 0, // x position
          y = text.attr("y"), // y position
          dy = 0, // Initial offset
          tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
  
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop(); // remove the word that was too much
          tspan.text(line.join(" "));
          line = [word]; // Start a new line with the overflow word
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
let colorRanges1 = [
  { threshold: 0, color: '#34B274' },
  { threshold: 50, color: '#164d31' },
  { threshold: 51, color: '#FDD000' },
  { threshold: 100, color: '#806800' },
  { threshold: 101, color: '#F4681A' },
  { threshold: 150, color: '#80360e' },
  { threshold: 151, color: '#D3112E' },
  { threshold: 200, color: '#660816' },
  { threshold: 201, color: '#8854D0' },
  { threshold: 300, color: '#422966' },
  { threshold: 301, color: '#731425' },
  { threshold: 500, color: '#380a12' },
  // ... Add other ranges here
];
let colorRanges2 = [
    { threshold: 0, color: '#34B274' },
    { threshold: 40, color: '#34B274' },
    { threshold: 50, color: '#FDD000' },
    { threshold: 90, color: '#FDD000' },
    { threshold: 100, color: '#F4681A' },
    { threshold: 140, color: '#F4681A' },
    { threshold: 150, color: '#D3112E' },
    { threshold: 190, color: '#D3112E' },
    { threshold: 200, color: '#8854D0' },
    { threshold: 280, color: '#8854D0' },
    { threshold: 300, color: '#731425' },
    { threshold: 500, color: '#731425' },
    // ... Add other ranges here
  ];
  let colorRanges = [
    { threshold: 0, color: '#34B274' },
    { threshold: 30, color: '#34B274' },
    { threshold: 50, color: '#FDD000' },
    { threshold: 80, color: '#FDD000' },
    { threshold: 100, color: '#F4681A' },
    { threshold: 130, color: '#F4681A' },
    { threshold: 150, color: '#D3112E' },
    { threshold: 180, color: '#D3112E' },
    { threshold: 200, color: '#8854D0' },
    { threshold: 260, color: '#8854D0' },
    { threshold: 300, color: '#731425' },
    { threshold: 500, color: '#731425' },
    // ... Add other ranges here
  ];

  // Create individual scales for each gradient range
const scales = colorRanges.slice(0, -1).map((range, i) => {
    const nextRange = colorRanges[i + 1];
    return {
      scale: d3.scaleLinear()
               .domain([range.threshold, nextRange.threshold])
               .range([range.color, nextRange.color]),
      maxThreshold: nextRange.threshold
    };
  });


function color_fill(d,view_type) {
if(view_type=='gradient'){
    if (d === 'Missing') {
    return '#bbbbbb'; // Missing data color
    } else if (d < colorRanges[0].threshold) {
    return colorRanges[0].color; // Use the first color below the first threshold
    } else {
    // Find the correct scale based on the value of d
    const scale = scales.find(s => d < s.maxThreshold);
    if (scale) {
        return scale.scale(d); // Return the color for the value within the range
    } else {
        return colorRanges[colorRanges.length - 1].color; // Use the last color above the last threshold
    }
    }
}
else if(view_type=='types'){
    if(d<51){
    return '#34B274';}
    else if (d<101){return '#FDD000';}
    else if (d<151){return '#F4681A';}
    else if (d<201){return '#D3112E';}
    else if (d<301){return '#8854D0';}
    else if (d<501){return '#731425';}
    else if (d=='Missing'){
    return '#bbbbbb'
    }
}

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
function color_fill2(d){
if(d=='Good'){
    return '#34B274';}
else if (d=='Moderate'){return '#FDD000';}
else if (d=='Unhealthy for sensitive group'){return '#F4681A';}
else if (d=='Unhealthy'){return '#D3112E';}
else if (d=='Very Unhealthy'){return '#8854D0';}
else if (d=='Hazardous'){return '#731425';}
else if (d=='Missing'){
    return '#bbbbbb'
}
}
document.addEventListener('DOMContentLoaded', function() {
    // Function to close the overlay
    function closeOverlay() {
      console.log('close')
      if (document.getElementById('calendar-dot')) {
        document.getElementById('calendar-dot').style.display = 'block';
    }
    
      document.getElementById('overlay').style.display = 'none';
      document.getElementById('overlay_DP').style.display = 'none';
      document.getElementById('overlay_color').style.display = 'none';
      document.getElementById('overlay_Missing').style.display = 'none';   
      var content1 = document.getElementById('overlay-content1');
      var content2 = document.getElementById('overlay-content2');
      content1.style.display = 'block';
      content2.style.display = 'none';
      var note_card = document.getElementById('note_card');
      note_card.textContent = "1/2"
    }
  
    // Set up the close icon event listener
    document.getElementById('close-icon').addEventListener('click', closeOverlay);
    document.getElementById('close-icon-DP').addEventListener('click', closeOverlay);
    document.getElementById('close-icon-color').addEventListener('click', closeOverlay);
    document.getElementById('close-icon-Missing').addEventListener('click', closeOverlay); 
    // Close the overlay when clicking outside
    document.addEventListener('click', function(event) {
      var overlay = document.getElementById('overlay');
      var overlayDP = document.getElementById('overlay_DP');
      var overlayColor = document.getElementById('overlay_color');
      var overlayMissing = document.getElementById('overlay_Missing');
      var content1 = document.getElementById('overlay-content1');
      var content2 = document.getElementById('overlay-content2');
      var overlay2 = document.getElementById('overlay2');
      var overlay3 = document.getElementById('overlay3');
      var overlay4 = document.getElementById('overlay4');    
  
      // Check if any overlay is currently displayed
      var isAnyOverlayVisible = (overlay.style.display !== 'none') ||
                                (overlayDP.style.display !== 'none') ||
                                (overlayColor.style.display !== 'none')||
                                (overlayMissing.style.display !== 'none');
  
      // Determine if the click was outside all overlays
      var isClickInsideOverlay = content1.contains(event.target) ||
                                 content2.contains(event.target) ||
                                 overlay2.contains(event.target) ||
                                 overlay3.contains(event.target) ||
                                 overlay4.contains(event.target) 
  
      if (!isClickInsideOverlay && isAnyOverlayVisible) {
        closeOverlay();
      }
    });
  });
  
  function wrapText(text, width,move = 0) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.5, // ems
          x = text.attr("x"),
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
  
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

  function bar_height_bar(d, max, min){
    var res;
    if(d<151){
      res =  d;}
    else if (d<301){res= 200+(d-200)/2;}
    else if (d<501){res = 200+(300-200)/2+(d-300)/4;}
    return res*1.3
  }

