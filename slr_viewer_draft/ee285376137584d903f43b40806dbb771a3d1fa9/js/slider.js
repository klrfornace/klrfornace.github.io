const depthSlider = document.getElementById('depth-slider');
const scenarioSelect = document.getElementById('scenario-select');
// const scenarioRadio = document.querySelector('.scenario-radio-group');

const depths = ['0 ft','1 ft','2 ft','3 ft','4 ft','5 ft','6 ft','7 ft','8 ft','9 ft','10 ft'];
const maxDepth = 10;
const ariaDepths = ['0 feet','1 foot','2 feet','3 feet','4 feet','5 feet','6 feet','7 feet','8 feet','9 feet','10 feet'];
const projYears = [2000, 2040, 2060, 2080, 2100, 2150];
const baselineYear = 2000;

let activeScenario = 'Intermediate';
let activeGauge = 'MOKUOLOE_ISLAND';
let activeDepth = 0;

const format = {
    to: function(value) {
        return depths[Math.round(value)];
    },
    from: function (value) {
        return depths.indexOf(value);
    }
};

// ARIA format uses full word for feet to avoid reading out "ft"
const ariaFormat = {
    to: function(value) {
        return ariaDepths[Math.round(value)];
    },
    from: function (value) {
        return ariaDepths.indexOf(value);
    }
};


noUiSlider.create(depthSlider, {
    start: 0,
    range: { min: 0, max: 10 },
    step: 1,
    orientation: 'vertical',
    direction: 'rtl',
    ariaFormat: ariaFormat,
    connect: [true, false],

    pips: {mode: 'values', values: [0,1,2,3,4,5,6,7,8,9,10], density:50, format:format},
});


// Add secondary axis with ticks for scenario years
// First create initial secondary pips and labels with initial active scenario/gauge
secondaryPips = '';
let gaugeProj = slr_proj.filter(function (proj) {
    return proj.stationName === activeGauge && proj.scenario === activeScenario;
});

let projDepths = [];
projYears.forEach(function(yr){
    let obj = gaugeProj.find(proj => proj.projectionYear == yr)
    projDepths.push(obj.projectionRsl)
})

// Generate secondary pips
for(let i=0; i < projYears.length; i++){
    // Position of element relative to slider
    let pct = projDepths[i]/maxDepth * 100; 
    let displayClass = '';
    // Hide off-scale ticks/labels
    if (pct > 100){ 
        displayClass = 'pip-hidden';
    }
    let newMarkerDiv = '<div class="noUi-marker noUi-marker-vertical-secondary noUi-marker-large' + displayClass +'" id="' + projYears[i] + '-pip" style="bottom: '
        + pct +'%;"></div>';
    // Add 'Baseline' to baseline year 
    let yearLabel =  projYears[i] == baselineYear ? 'Baseline<br>('+ projYears[i]+')': projYears[i];
    // Shift baseline (0 ft) label down since it is 2 lines
    let adjPct = pct == 0 ? -2 : pct;
    let newValueDiv ='<div class="noUi-value noUi-value-vertical-secondary noUi-value-large' + displayClass +'" id="' + projYears[i] + '-label" style="bottom: '
        + adjPct + '%;">' + yearLabel +'</div>';
    secondaryPips += newMarkerDiv + newValueDiv;
};

const pipsdiv = document.getElementsByClassName("noUi-pips")[0];
pipsdiv.insertAdjacentHTML('afterend', '<div class="noUi-pips noUi-pips-vertical-secondary">'+ secondaryPips +'</div>');

// Function to adjust position of pips when scenario/gauge is changed
function regenerateSecondaryPips(activeGauge, activeScenario){
    // Get NOAA SLR projection data for new active gauge/scenario
    const gaugeProj = slr_proj.filter(function (proj) {
	    return proj.stationName === activeGauge && proj.scenario === activeScenario;
    });

    // Get RSL by scenario year
    let projDepths = [];
    projYears.forEach(function(yr){
        let obj = gaugeProj.find(proj => proj.projectionYear == yr)
        projDepths.push(obj.projectionRsl)
    })

    // Move secondary pips to new positions
    for(let i=0; i < projYears.length; i++){
        const yearPip = document.getElementById(projYears[i]+'-pip');
        const yearLabel = document.getElementById(projYears[i]+'-label');
        // Position of element relative to slider
        let pct = projDepths[i]/maxDepth * 100; 
        yearPip.style = 'bottom: ' + pct + '%';
        let adjPct = pct == 0 ? -2 : pct;
        yearLabel.style = 'bottom: ' + adjPct + '%';

        // Hide any off-scale pips
        if (pct <= 100){ 
            yearPip.classList.remove('pip-hidden');
            yearLabel.classList.remove('pip-hidden');
        }
        else{
            yearPip.classList.add('pip-hidden');
            yearLabel.classList.add('pip-hidden');
        }
    }
}

// Add functionality to scenario button group
// Change button styling, regenerate secondary pips, and switch scenario-dependent layers when scenario is changed
const scenarioBtnGroup = document.querySelectorAll('.scenario-button');

for (let button of scenarioBtnGroup){
    button.onclick = () => {
        button.classList.add("active-scenario");
        const otherButton = Array.from(scenarioBtnGroup).find((btn) => btn!=button);
        otherButton.classList.remove("active-scenario");
        activeScenario = button.id == "intermediate"? "Intermediate":"Intermediate-High";
        regenerateSecondaryPips(activeGauge, activeScenario);

        // Change layers based on active scenario. 
        // Tags: intermediate, interhigh
        // For layers that are independent, use "all-scenarios" tag to leave layers unchanged when scenario changes. 
        const scenarioTag = activeScenario == "Intermediate"? "intermediate":"interhigh";
        for (let i = 0; i < layerGroups.length; i++){
            const group = layerGroups[i].group;
            const layers = layerGroups[i].layers;
            // Find layer(s) with name that contains correct tag
            const newLayers = layers.filter(layer => layer.options.name.includes(scenarioTag));
            // Remove old layer/add new layer
            group.eachLayer(function(layer) {
                if (!layer.options.name.includes("all-scenarios")){ // Ignore layers that are independent of scenario
                    group.removeLayer(layer); 
                }
            });
            newLayers.forEach(layer => {
                group.addLayer(layer);
            });
        }
    }
}

// Update map and map controls when slider value is updated
depthSlider.noUiSlider.on('update', function(value) {
    // layers all contain a tag from 00ft to 10ft
    const currentDepth = parseInt(value).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + 'ft'; 

    // Switch layers in all layer groups 
    for (let i = 0; i < layerGroups.length; i++){
        const group = layerGroups[i].group;
        const layers = layerGroups[i].layers;
        // Find layer(s) with name that contains correct tag
        const newLayers = layers.filter(layer => layer.options.name.includes(currentDepth));
        // Remove old layer/add new layer
        group.eachLayer(function(layer) {
            group.removeLayer(layer);
        });
        newLayers.forEach(layer => {
            group.addLayer(layer);
        });
    }

    // Update depth displayed in header and legend
    const depthLabel = document.getElementById("depth-level-label");
    const depthLabelLegend = document.getElementById("legend-depth-label");
    if (parseInt(value) == 0){
        depthLabel.innerHTML = 'Baseline (2000)';
        depthLabelLegend.innerHTML = 'Baseline (2000)';
    }
    else {
        depthLabel.innerHTML = '+ '+ depths[parseInt(value)];
        depthLabelLegend.innerHTML = '+ '+ depths[parseInt(value)];
    }

    // Set global variable for other uses
    activeDepth = parseInt(value);
}
)

