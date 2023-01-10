const depthSlider = document.getElementById('depth-slider');
const scenarioSelect = document.getElementById('scenario-select');

const depths = ['0 ft','1 ft','2 ft','3 ft','4 ft','5 ft','6 ft','7 ft','8 ft','9 ft','10 ft'];
const maxDepth = 10;
const ariaDepths = ['0 feet','1 foot','2 feet','3 feet','4 feet','5 feet','6 feet','7 feet','8 feet','9 feet','10 feet'];
const projYears = [2005, 2040, 2060, 2080, 2100, 2150];
const baselineYear = 2005;

let activeScenario = 'Intermediate';
let activeGauge = 'MOKUOLOE_ISLAND';


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
    start: sliderStart, // Initial value is set by global variable defined in slr_map.
    range: { min: 0, max: 10 },
    step: 1,
    orientation: 'vertical',
    direction: 'rtl',
    ariaFormat: ariaFormat,
    connect: [true, false],

    pips: {mode: 'values', values: [0,1,2,3,4,5,6,7,8,9,10], density:50, format:format},
});

// Add secondary axis with ticks for scenario years
function generateSecondaryPips(activeGauge, activeScenario){
    // Clear out previous ticks
    let existingPips = document.querySelectorAll('.noUi-pips-vertical-secondary');
    existingPips.forEach(pipDiv => {
        pipDiv.remove();
      });
    let projDepths = [];

    // Get NOAA SLR projection data for active gauge and scenario
    let gaugeProj = slr_proj.filter(function (proj) {
	    return proj.stationName === activeGauge && proj.scenario === activeScenario;
    });

    // Get RSL by scenario year
    projYears.forEach(function(yr){
        let obj = gaugeProj.find(proj => proj.projectionYear == yr)
        projDepths.push(obj.projectionRsl)
    })

    const pipsdiv = document.getElementsByClassName("noUi-pips")[0];
    let secondaryPips = [];

    // Generate secondary pips
    for(let i=0; i < projYears.length; i++){
        // Position of element relative to slider
        let pct = projDepths[i]/maxDepth * 100; 
        if (pct <= 100){ 
            let newMarkerDiv = '<div class="noUi-marker noUi-marker-vertical-secondary noUi-marker-large" style="bottom: '
                + pct +'%;"></div>';
            // Add 'Baseline' to baseline year 
            let yearLabel =  projYears[i] == baselineYear ? 'Baseline<br>('+ projYears[i]+')': projYears[i];
            // Shift baseline (0 ft) label down since it is 2 lines
            let adjPct = pct == 0 ? -2 : pct;
            let newValueDiv ='<div class="noUi-value noUi-value-vertical-secondary noUi-value-large" style="bottom: '
                + adjPct + '%;">' + yearLabel +'</div>';
            secondaryPips += newMarkerDiv + newValueDiv;
        }
    }
    pipsdiv.insertAdjacentHTML('afterend', '<div class="noUi-pips noUi-pips-vertical-secondary">'+ secondaryPips +'</div>');
};

// Regenerate secondary pips when scenario is changed
scenarioSelect.addEventListener('change',(e) => {
    let selectedScenario = e.target.value;
    activeScenario = selectedScenario.split(' ').join('-');
    generateSecondaryPips(activeGauge, activeScenario);
})

// Initialize secondary pips
generateSecondaryPips(activeGauge,activeScenario);


// Update map and map controls when slider value is updated
depthSlider.noUiSlider.on('update', function(value) {
    const activeDepth = layerTags[parseInt(value)];

    // Switch layers in all layer groups 
    for (let i = 0; i < layerGroups.length; i++){
        const group = layerGroups[i].group;
        const layers = layerGroups[i].layers;
        // Find layer(s) with name that contains correct tag
        const newLayers = layers.filter(layer => layer.options.name.includes(activeDepth));
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
        depthLabel.innerHTML = 'Present level';
        depthLabelLegend.innerHTML = 'Present level';
    }
    else {
        depthLabel.innerHTML = '+ '+ depths[parseInt(value)];
        depthLabelLegend.innerHTML = '+ '+ depths[parseInt(value)];
    }
}
)

