function buildMetadata(sample) {
  // Grab json and populate panel
  // console.log(`buildMetadata(${sample})`);
  var url = `/metadata/${sample}`;
  d3.json(url).then(function(response) {
    // console.log(`response: ${response}`)
    var data = response;
    var panel = d3.select("#sample-metadata");
    panel.html("");
    Object.entries(data).forEach(([key,value]) => {
      panel.append("p")
      .text(`${key}: ${value}`)
      .append("br")
    });
  })
}

function buildCharts(sample) {
  // // Grab json and populate charts
  // console.log(sample);
  var url = `/samples/${sample}`;
  d3.json(url).then(function(response) {

    // Bubble
    var trace1 = [{
      x: response.otu_ids,
      y: response.sample_values,
      marker: {
        size: response.sample_values,
        color: response.otu_ids },
      mode: "markers",
      hovertext: response.otu_labels,
      type: "scatter"
    }];

    var layout1 = {
      height: 700,
      width: 1200,
      title: 'Samples by OTU ID',
      xaxis: {title: 'OTU ID'},
      yaxis: {title: 'Sample Values'}
    };
    var chart1 = document.getElementById('bubble');
    Plotly.newPlot(chart1, trace1, layout1)

    // Pie
    // sort the object and then pull out the top 10
    var myObject = response
    var count = 0
    var myNewObjects = []
    while (count < myObject.otu_ids.length) {
      var newObject = {
        "otu_ids":myObject.otu_ids[count],
        "sample_values":myObject.sample_values[count],
        "otu_labels":myObject.otu_labels[count]
      }
      myNewObjects.push(newObject)
      count = count + 1
    }
    var sortedresponse = myNewObjects.sort(function(obj1, obj2) {
      return obj2.sample_values - obj1.sample_values;
    });
    var slicedresponse = sortedresponse.slice(0,10);

     var trace2 = [{
      values: slicedresponse.map(element => element.sample_values),
      labels: slicedresponse.map(element => element.otu_ids),
      hovertext: slicedresponse.map(element => element.otu_labels),
      type: "pie"
    }];

    var layout2 = {
      height: 500,
      width: 500,
      title: "Top 10 Samples"
    };

    var chart2 = document.getElementById('pie');
    Plotly.newPlot(chart2, trace2, layout2)
  });

  // Gauge
  var wf_url = `/wfreq/${sample}`;
  d3.json(wf_url).then(function(response) {
    var level = response.WFREQ * (180/9);
    var degrees = 180 - level,
    radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);
    var data = [{ type: 'scatter', x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'frequency',
        text: response.WFREQ,
        hoverinfo: 'text+name'},
    { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1'],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(14, 127, 0, .5)', 
        'rgba(30, 154, 22, .5)', 
        'rgba(57, 202, 42, .5)', 
        'rgba(84, 209, 95, .5)', 
        'rgba(111, 206, 145, .5)', 
        'rgba(140, 226, 202, .5)', 
        'rgba(180, 231, 210, .5)', 
        'rgba(205, 236, 220, .5)', 
        'rgba(230, 240, 230, .5)', 
        'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1'],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false}];

    var layout3 = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: 'Belly Button Washing <br> Frequency Scrubs per Week',
      height: 500,
      width: 500,
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };
    var plot = document.getElementById('gauge')
    Plotly.newPlot(plot, data, layout3);
  });
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
