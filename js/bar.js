let labels = [];
let bars = {};
let graphWrapper;
let AccurateStateTracker = [];
var amount = document.getElementById('10').value;
const rbs = document.querySelectorAll('input[name="choice"]');



// these are the colors of our bars
let colors = ['#d8bfd8', '#008080'];
let lightColors = ['#f7f2f7', '#e5f2f2'];

// This function makes the bar graph
// it takes in a URL to a teachable machine model,
// so we can retrieve the labels of our classes for the bars
export async function setupBarGraph(URL) {
    // the metatadata json file contains the text labels of your model
    const metadataURL = `${URL}metadata.json`;
    // get the metadata fdrom the file URL
    const response = await fetch(metadataURL);
    const json = await response.json();
    // get the names of the labels from the metadata of the model
    labels = json.labels;
    // get the area of the webpage we want to build the bar graph
    graphWrapper = document.getElementById('graph-wrapper');
    // make a bar in the graph for each label in the metadata
    labels.forEach((label, index) => makeBar(label, index));
}

// This function makes a bar in the graph
function makeBar(label, index) {
  
  
    // make the elements of the bar
    let barWrapper = document.createElement('div');
    let barEl = document.createElement('progress');
    let percentEl = document.createElement('span');
    let labelEl = document.createElement('span');
  
    switch(label)
    {
      case 'CStar':
        labelEl.innerText = 'Correct Jump';
        break;
      case 'CStand':
        labelEl.innerText = 'Correct Stand';
        break;     
      case 'WStar2':
        labelEl.innerText = 'Hands are too High';
        break;  
      case 'WStar':
        labelEl.innerText = 'Hands are too Low';
        break;
    }
  
    
  
    // assemble the elements
    barWrapper.appendChild(labelEl);    
    barWrapper.appendChild(barEl);
    barWrapper.appendChild(percentEl);
  
    let graphWrapper = document.getElementById('graph-wrapper');
    graphWrapper.appendChild(barWrapper);

    // style the elements
    let color = colors[index % colors.length];
    let lightColor = lightColors[index % colors.length];
    barWrapper.style.color = color;
    barWrapper.style.setProperty('--color', color);
    barWrapper.style.setProperty('--color-light', lightColor);

    // save references to each element, so we can update them later
    bars[label] = {
        bar: barEl,
        percent: percentEl
      
    };

}

// This function takes data (retrieved in the model.js file)
// The data is in the form of an array of objects like this:
// [{ className:class1, probability:0.75 }, { className:class2, probability:0.25 }, ... ]
// it uses this data to update the progress and labels of of each bar in the graph
export function updateBarGraph(data) {
    // iterate through each element in the data
    data.forEach(({ className, probability }) => {
        // get the HTML elements that we stored in the makeBar function
        let barElements = bars[className];
        let barElement = barElements.bar;
        let percentElement = barElements.percent;
        
        // set the progress on the bar
        barElement.value = probability;
        // set the percent value on the label
        let strPercentage = convertToPercent(probability);
        percentElement.innerText = strPercentage;
        if (strPercentage == "100%")
        {
          if(className=="CStand")
          {
            if(AccurateStateTracker.includes("WStar") || AccurateStateTracker.includes("WStar2"))
            {
              AccurateStateTracker = [];
            }
            else if(AccurateStateTracker.includes("CStar"))
            {
              let squatCounter = document.getElementById('span-squat-counter');
              squatCounter.innerText = parseInt(squatCounter.innerText)+1;
              let selectedValue;
                for (const rb of rbs) {
                if (rb.checked) {
                    selectedValue = rb.value;
                    break;
                }
            }
            if(squatCounter.innerText == selectedValue)
            {
                window.location.href = "success.html";
            }
              
              AccurateStateTracker = [];
            }
          }
          AccurateStateTracker.push(className);
          //alert(AccurateStateTracker);
          
        }
              
    });
}

// This function converts a decimal number (between 0 and 1)
// to an integer percent (between 0% and 100%)
function convertToPercent(num) {
    num *= 100;
    num = Math.round(num);
    return `${num}%`;
}