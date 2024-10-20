// can we make payment outside? do you have whatsapp +94776721445 

document.querySelector('#startCharts').addEventListener('click', onRecord);
//new main.js    
/*
const app = initializeApp(firebaseConfig); 
const db = getFirestore(app); 
 
// Get a list of cities from your database
async function getCities(db) {
  const citiesCol = collection(db, 'cities');  
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}*/    
       
    
    
const inProduction = false; // hide video and tmp canvas
const channel = 'r'; // red only, green='g' and blue='b' channels can be added

let video, c_tmp, ctx_tmp; // video from rear-facing-camera and tmp canvas
let frameCount = 0; // count number of video frames processed 
let delay = 0; // delay = 100; should give us 10 fps, estimated around 7
let numOfQualityFrames = 0; // TODO: count the number of quality frames
let xMeanArr = [];
let xMean = 0;
let initTime;
let isSignal = 0;
let acFrame = 0.008; // start with dummy flat signal
let acWindow = 0.008;
let nFrame = 0;
const WINDOW_LENGTH = 300; // 300 frames = 5s @ 60 FPS
let acdc = Array(WINDOW_LENGTH).fill(0.5);
let ac = Array(WINDOW_LENGTH).fill(0.5);
var fval=0;
let isPrinting = false;
let allValues = [];
// draw the signal data as it comes
let lineArr = [];
const MAX_LENGTH = 100;
const DURATION = 100;
let chart = realTimeLineChart();
var pwrval=0;
var zramval=0;
let constraintsObj = {
  audio: false,
  video: {
    maxWidth: 1280,
    maxHeight: 720,
    frameRate: { ideal: 60 },
    facingMode: 'environment' // rear-facing-camera
  }
}; 

function setWH() {
  let [w, h] = [video.videoWidth, video.videoHeight];
  document.getElementById('solar-nuclear-photovoltaic-delay').innerHTML = `Frame compute delay: ${delay}`;
  document.getElementById('solar-nuclear-photovoltaic-resolution').innerHTML = `Video resolution: ${w} x ${h}`;
  c_tmp.setAttribute('width', w);
  c_tmp.setAttribute('height', h); 
}

function init() {
  c_tmp = document.getElementById('output-canvas');
  c_tmp.style.display = 'none';
  if (inProduction) {
    c_tmp.style.display = 'none';
  }
  ctx_tmp = c_tmp.getContext('2d');
}
    
function computeFrame(soundfreq) { //console.log(soundfreq)
  if (nFrame > DURATION) {
    ctx_tmp.drawImage(video,
      0, 0, video.videoWidth, video.videoHeight);
    let frame = ctx_tmp.getImageData(
      0, 0, video.videoWidth, video.videoHeight);
  
    // process each frame
    const count = frame.data.length / 4;
    let rgbRed = 0;
    for (let i = 0; i < count; i++) {
      rgbRed += frame.data[i * 4];
    }
    // invert to plot the PPG signal
    xMean = 1 - rgbRed / (count * 255);
    
     if (isPrinting) { 
    ccalc(xMean) 
     }
    let xMeanData = {
      time: (new Date() - initTime) / 1000,
      x: xMean
    };

    acdc[nFrame % WINDOW_LENGTH] = xMean;

    // TODO: calculate AC from AC-DC only each WINDOW_LENGTH time:
    if (nFrame % WINDOW_LENGTH == 0) {
      // console.log(`nFrame = ${nFrame}`);
      // console.log(`ac = ${acdc}`);
      // console.log(`ac-detrended = ${detrend(acdc)}`);
      document.getElementById('solar-nuclear-photovoltaic-signal-window').innerHTML = `nWindow: ${nFrame / WINDOW_LENGTH}`;
      if ((nFrame / 100) % 2 == 0) {
        isSignal = 1;
        ac = detrend(acdc);
        acWindow = windowMean(ac);
      } else {
        ac = Array(WINDOW_LENGTH).fill(acWindow);
        isSignal = 0;
      }
    }

    acFrame = ac[nFrame % WINDOW_LENGTH];

    xMeanArr.push(xMeanData);


   let now = new Date();
let currentDateTime = now.toLocaleString('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});



   
    document.getElementById('solar-nuclear-photovoltaic-frame-time').innerHTML = `Frame time: ${currentDateTime}`;
    document.getElementById('solar-nuclear-photovoltaic-video-time').innerHTML = `Video time: ${(video.currentTime.toFixed(2))}`;
    document.getElementById('solar-nuclear-photovoltaic-signal').innerHTML = `X: ${xMeanData.x}`;
    
    const fps = (++frameCount / video.currentTime).toFixed(3);
    document.getElementById('solar-nuclear-photovoltaic-frame-fps').innerHTML = `Frame count: ${frameCount}, FPS: ${fps}`;

    ctx_tmp.putImageData(frame, 0, 0);
  }
  nFrame += 1;
  setTimeout(computeFrame, delay); // continue with delay
} 

function windowMean(y) {
  const n = y.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += y[i]
  }  

  return sum / n;
}

function detrend(y) {
  const n = y.length;
  let x = [];
  for (let i = 0; i <= n; i++) {
    x.push(i);
  }

  let sx = 0;
  let sy = 0;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sx += x[i];
    sy += y[i];
    sxy += x[i] * y[i];
    sxx += x[i] * x[i];
  }
  const mx = sx / n;
  const my = sy / n;
  const xx = n * sxx - sx * sx;
  const xy = n * sxy - sx * sy;
  const slope = xy / xx;
  const intercept = my - slope * mx;

  detrended = [];
  for (let i = 0; i < n; i++) {
    detrended.push(y[i] - (intercept + slope * i));
  }

  return detrended;
}

function onRecord() {
  this.disabled = true;
  $('#charts').show()
  $('#wrapper').hide()
  navigator.mediaDevices.getUserMedia(constraintsObj)
    .then(function(mediaStreamObj) {

      // we must turn on the LED / torch
      const track = mediaStreamObj.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track)
      const photoCapabilities = imageCapture.getPhotoCapabilities()
        .then(() => {
          track.applyConstraints({
              advanced: [{ torch: true }]
            })
            .catch(err => console.log('No torch', err));
        })
        .catch(err => console.log('No torch', err));

      video = document.getElementById('video');
      if (inProduction) {
        video.style.display = 'none';
      }

      if ("srcObject" in video) {
        video.srcObject = mediaStreamObj;
      } else {
        // for older versions of browsers
        video.src = window.URL.createObjectURL(mediaStreamObj);
      }

      video.onloadedmetadata = function(ev) {
        video.play();
      };

      init();
      video.addEventListener('play', setWH);
      video.addEventListener('play', computeFrame);
      video.addEventListener('play', drawLineChart);

      video.onpause = function() {
        console.log('paused');
      };
    })
    .catch(error => console.log(error));

  
 
}
 
function pauseVideo() {
  video.pause();
  video.currentTime = 0;
}

function seedData() {
  let now = new Date();

  for (let i = 0; i < MAX_LENGTH; ++i) {
    lineArr.push({
      time: new Date(now.getTime() - initTime - ((MAX_LENGTH - i) * DURATION)),
      x: 0.5,
      signal: isSignal
    });
  }
}

function updateData() {
  let now = new Date();

  let lineData = {
    time: now - initTime,
    x: acFrame,
    signal: isSignal
  };
  lineArr.push(lineData);
//console.log(lineData)
  // if (lineArr.length > 1) {
  lineArr.shift();
  // }
  d3.select("#solar-nuclear-photovoltaic-chart").datum(lineArr).call(chart);
} 

function resize() {
  if (d3.select("#chart svg").empty()) {
    return;
  }
  chart.width(+d3.select("#solar-nuclear-photovoltaic-chart").style("width").replace(/(px)/g, ""));
  d3.select("#solar-nuclear-photovoltaic-chart").call(chart);
}

function drawLineChart() {
  initTime = new Date();

  seedData();
  window.setInterval(updateData, 100);
  d3.select("#solar-nuclear-photovoltaic-chart").datum(lineArr).call(chart);
  d3.select(window).on('resize', resize);
}
 // Function to generate unique IDs
function generateID(num) {
  return "cal" + num;
}

// Function to create and populate the table
function createTable() {
  var tbody = document.getElementById("table-body");
  var count = 1; // To keep track of the calculation ID

  for (var row = 1; row <= 10; row++) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.textContent = row;
      tr.appendChild(td);

      for (var col = 1; col <= 10; col++) {
          var td = document.createElement("td");
          var div = document.createElement("div");
          div.id = generateID(count++);
          div.textContent = "Content";
          td.appendChild(div);
          tr.appendChild(td);
      }

      tbody.appendChild(tr);
  }
}
// Function to create bars




function createBars(data) {

          const getRandomColor = () => {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };

        // Select the SVG using the class name
        const svg = d3.select("#chart-canvas"),
              margin = {top: 40, right: 40, bottom: 40, left: 40},
              width = window.innerWidth - margin.left - margin.right,
              height = 700;

        const x = d3.scaleBand()
                    .domain(d3.range(data.length))
                    .range([margin.left, width - margin.right])
                    .padding(0.1);

        const y = d3.scaleLinear()
                    .domain([0, d3.max(data)])  // domain is based on data values
                    .range([height - margin.bottom, margin.top]);  // range is fixed to chart height

        // Append bars with random colors
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => x(i))
            .attr("y", d => y(d))
            .attr("width", x.bandwidth())
            .attr("height", d => height - margin.bottom - y(d))  // height scales to fit within the fixed chart height
            .attr("fill", () => getRandomColor());  // Assign random color to each bar

        // Append rotated text labels (rotate from the middle of the label)
        svg.selectAll("text")
            .data(data) 
            .enter()
            .append("text")
            .attr("x", (d, i) => x(i) + x.bandwidth() / 2)  // Center the text horizontally
            .attr("y", d => y(d) - 5)  // Position the text slightly above the bar
            .attr("text-anchor", "middle")
            .attr("font-size", "8px")
            .attr("fill", "black")
            .attr("font-size", "5px") 
            .attr("color", "yellow") 
            .attr("transform", (d, i) => {
                const xPosition = x(i) + x.bandwidth() / 2 -12;
                const yPosition = y(d) - 20;
                return `rotate(270, ${xPosition}, ${yPosition})`;  // Rotate around the label's center
            })
            .text(d => d);
  
}
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {
    var audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    var microphone = audioContext.createMediaStreamSource(stream);
    
    microphone.connect(analyser);
    
    analyser.fftSize = 32768; 
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength); // Initialize dataArray here
  })
  .catch(function(err) {
    console.error('Error accessing microphone:', err);
  });



navigator.getBattery().then(function(battery) {
  pwrval = battery.level;
 
  battery.addEventListener('levelchange', function() {
    pwrval = battery.level;

  });
}); 


function updateMemoryUsage() {
  if (window.performance && window.performance.memory) {
    var memoryInfo = window.performance.memory;
    zramval = (memoryInfo.usedJSHeapSize/100000000) || 'N/A';

  }
}

// Call the function initially
updateMemoryUsage();

setInterval(updateMemoryUsage, 5000);

// Function to calculate values and update the chart
function ccalc(xval) {

  var cal = [
    xval + fval / zramval / pwrval,
    xval + fval / zramval / pwrval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval
  ];  
//  updatemicdata(cal)


  createBars(cal); // Update the chart with new calculation values
}

// Example usage




navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {  
    var audioContext = new AudioContext();
    var analyser = audioContext.createAnalyser();
    var microphone = audioContext.createMediaStreamSource(stream);
    
    microphone.connect(analyser);
    
    // Set up FFT with a suitable fftSize for 16k resolution
    analyser.fftSize = 32768; // 16k resolution with a sample size of 32k (32768)
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    
    function update() {
      // Get the frequency data
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate the average value
      var sum = dataArray.reduce(function(a, b) { return a + b; }, 0);
      fval = sum / bufferLength;
      
      requestAnimationFrame(update);
    }
    
   update();
  })
  .catch(function(err) {
    console.error('Error accessing microphone:', err);
  });




function manualTranspose(array) {
    const transposed = [];
    const numRows = array.length;
    const numCols = array[0].length;
    
    for (let col = 0; col < numCols; col++) {
        transposed[col] = [];
        for (let row = 0; row < numRows; row++) {
            transposed[col][row] = array[row][col];
         // console.log(array[row][col])
        }
    }
    
    return transposed;
}
document.querySelector('#export100').addEventListener('click', generateChartsAndDownloadPDF);

// Function to generate charts based on the transposed array
function generateChartsAndDownloadPDF() {
  isPrinting = true;
}
document.querySelector('#showascii').addEventListener('click', showascii);
function showascii(){
var n=pwrval
var i= xMean
var a=fval
var b=zramval
function convertToLaTeX(asciiEquation) {
    // Convert summation notation
    asciiEquation = asciiEquation.replace(/sum_\((.*?)\)\^(.*?) /g, '\\sum_{$1}^{$2} ');
    
    // Convert fractions and parentheses
    asciiEquation = asciiEquation.replace(/\(\((.*?)\)\/(.*?)\)/g, '\\left( \\frac{$1}{$2} \\right)');
    
    // Convert exponents
    asciiEquation = asciiEquation.replace(/\^(.)/g, '^{$1}');
    
    // Return the converted LaTeX equation
    return asciiEquation;
}

// Test conversion
var asciiarray = [
    `sum_(${i}=${b})^${n} ${i}^${a}=(((${n}(${n}+1))/2))^2`,
    `sum_(${i}=1)^${n} ${i}^${b}=(((${n}(${n}+1))/2))^2`,
    `sum_(${i}=1)^${n} ${i}^${b}=(((${n}(${n}+1))/${b}))^2`,
    `sum_(${i}=1)^${n} ${i}^${a}=(((${n}(${n}+1))/2))^2`,
    `sum_(${i}=1)^${n} ${i}^${a}=(((${n}(${n}+1))/2))^${b}`
];

var asciiarray2 = asciiarray.map(convertToLaTeX);
 console.log(asciiarray)
    var $contentDiv = $('#asciicontent');  // Use jQuery object, not raw DOM element

    // Append each equation as a paragraph
    $.each(asciiarray2, function(index, equation) {
        var p = $('<p></p>').html(`Equation ${index + 1}: \\(${equation}\\)`);
        $contentDiv.append(p);  // Use jQuery's append method
    });

    MathJax.typesetPromise().then(function () {

        // Generate PDF after MathJax renders the LaTeX
        var element = $('#asciicontent')[0];  // Get the DOM element from jQuery

        // Configure margins for the PDF
        var opt = {
            margin:       10,      // 10 units (could be in mm, inches, or px depending on configuration)
            filename:     'equations.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Create PDF with configured margins
        html2pdf().set(opt).from(element).save().then(function () {
            console.log("PDF generated with margin");
    //     $('#asciicontent').empty()
        });
    });
} 



function realTimeLineChart() {
  var margin = { top: 20, right: 20, bottom: 50, left: 50 },
    width = 600,
    height = 400,
    duration = 500,
    color = ['#cc1f1f','#FFFF00','#39FF14','#185dd0']; // Red, Yellow, Green ,Blue

  function chart(selection) {
    selection.each(function(data) {
      data = ['x'].map(function(c) {
        return {
          label: c,
          values: data.map(function(d) {
            return { time: +d.time, value: d[c] + zramval + fval + pwrval, signal: +d.signal };
          })
        };
      });

      var t = d3.transition().duration(duration).ease(d3.easeLinear),
        x = d3.scaleTime().rangeRound([0, width - margin.left - margin.right]),
        y = d3.scaleLinear().rangeRound([height - margin.top - margin.bottom, 0]),
        z = d3.scaleOrdinal(color);

      var xMin = d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.time; }) });
      var xMax = new Date(new Date(d3.max(data, function(c) {
        return d3.max(c.values, function(d) { return d.time; })
      })).getTime() - (duration * 2));

      x.domain([xMin, xMax]);
      y.domain([
        d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.value; }) }),
        d3.max(data, function(c) { return d3.max(c.values, function(d) { return d.value; }) })
      ]);
      z.domain(data.map(function(c) { return c.label; }));

      var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.time); })
        .y(function(d) { return y(d.value); });

      var svg = d3.select(this).selectAll("svg").data([data]);
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "axis x");
      gEnter.append("g").attr("class", "axis y");
      gEnter.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom);
      gEnter.append("g")
        .attr("class", "lines")
        .attr("clip-path", "url(#clip)")
        .selectAll(".data").data(data).enter()
        .append("path")
        .attr("class", "data");

      var svg = selection.select("svg");
      svg.attr('width', width).attr('height', height);
      var g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.select("defs clipPath rect")
        .transition(t)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.right);

      g.selectAll("g path.data")
        .data(data)
        .style("stroke-width", 3)
        .style("fill", "none")
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .on("start", tick);

      function tick() {
        var path = d3.select(this)
          .attr("d", function(d) { return line(d.values); })
          .attr("transform", null);

        // Get the current value (height) of the line
        var currentValue = path.data()[0].values.slice(-1)[0].value;

        // Set the color based on the current value
        if (currentValue <= 2) {
          path.style("stroke", color[3]); //blue
        } else if (currentValue <= 5) {
          path.style("stroke", color[2]); // green
        } else if (currentValue <= 8) {
          path.style("stroke", color[1]); // yellow
        } else {
          path.style("stroke", color[0]); // red
        }

        var xMinLess = new Date(new Date(xMin).getTime() - duration);
        d3.active(this)
          .attr("transform", "translate(" + x(xMinLess) + ",0)")
          .transition()
          .on("start", tick);
      }
    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };  

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = _;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  return chart;
}
