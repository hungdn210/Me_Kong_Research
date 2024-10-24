let environment_date_text = document.getElementById('enviroment_date_text');
let startDateInput = document.getElementById('start-date');
let endDateInput = document.getElementById('end-date');
let not_correct_date_range_element = document.getElementById('not_correct_date_range');
let modal = document.getElementById("graphModal");
let closeModalGraphButton = document.getElementsByClassName("close")[0];
let amountStationSelectionErrorAlert = document.getElementById('amount-station-selection-error-alert');
const dataVisualizationPanel = document.getElementById('data-visualization-panel');

// Define the array to hold environmental data
let selectedStations = []; // Array to store selected stations
let environmental_date_list = []; 
let selectedCategories = [];
let stationLocationData = [];
var curSelectedCategory; 
let visualizationType = 'visualize';
var map; // Declare map globally
stationMarkers = [];

function loadCSVDataForCategoriesDetails() {
  Papa.parse("../static/data/overall_station_summary.csv", {
    download: true,
    header: true,
    complete: function(results) {
      
      // Process the CSV data
      results.data.forEach((row, index) => {
        if(row.Category) {
          // Create the category object
          const categoryData = {
            categoryName: row.Category,
            startDate: row['Common Start Date'],
            endDate: row['Common End Date'],
            stations: row['Stations with Data'] ? row['Stations with Data'].split(',').map(s => s.trim()) : [] 
          };
  
          environmental_date_list.push(categoryData);
          
          // Create and append the dropdown option
          const option = document.createElement('option');
          option.value = index;
          option.textContent = row.Category;
          document.getElementById('category_select').appendChild(option);
        }
      });
      
      // Initialize the UI with the first category
      if (environmental_date_list.length > 0) {
        updateEnviromentalDate(0);
      } else {
        console.error("No environmental data found!");
      }
    },
    error: function(error) {
      console.error("Error loading CSV:", error); // Log if there's an error loading CSV
    }
  });
}

function loadCSVStationLocationData() {
  Papa.parse("../static/data/ListOfStationLocations.csv", {
    download: true,
    header: true,
    complete: function(results) {
      stationLocationData = results.data.map(row => ({
        STCODE: row.STCODE,
        STNAME: row.STNAME,
        COUNTRY: row.COUNTRY,
        LONGDEC: parseFloat(row.LONGDEC),
        LAT_DEC: parseFloat(row.LAT_DEC),
        ALT: parseFloat(row.ALT),
        X_UTM: parseInt(row.X_UTM, 10),
        Y_UTM: parseInt(row.Y_UTM, 10)
      }));
      
      // Once the data is loaded, initialize the map or update stations
      if (environmental_date_list[curSelectedCategory]) {
        showStationsOnMap(environmental_date_list[curSelectedCategory].stations);
      }

      console.log("Station location data loaded:", stationLocationData);
    },
    error: function(error) {
      console.error("Error loading station location CSV:", error);
    }
  });
}

function updateEnviromentalDate(category_id) {
  // Update the current selected category name
  curSelectedCategory = category_id;

  // Check if the category exists in the list
  if (!environmental_date_list[category_id]) {
    console.error("Category not found:", category_id);
    return;
  }

  // Set the date range text
  environment_date_text.innerHTML = `Data for <b>${environmental_date_list[category_id].categoryName}</b> can be selected from <b>${environmental_date_list[category_id].startDate}</b> to <b>${environmental_date_list[category_id].endDate}</b>`;

  // Set the min and max values for the date inputs
  startDateInput.min = environmental_date_list[category_id].startDate || '0000-00-00';
  startDateInput.max = environmental_date_list[category_id].endDate || '0000-00-00';
  endDateInput.min = environmental_date_list[category_id].startDate || '0000-00-00';
  endDateInput.max = environmental_date_list[category_id].endDate || '0000-00-00';

  // Set default values for the date inputs to the start and end of the range
  startDateInput.value = environmental_date_list[category_id].startDate || '0000-00-00';
  endDateInput.value = environmental_date_list[category_id].endDate || '0000-00-00';

  // Clear selected stations when a new category is selected
  selectedStations = []; // Clear the selected stations array
  updateSelectedStationsOnUI(); // Clear the UI display of selected stations

  // Update the stations dropdown based on the selected category
  updateStationsDropdown(environmental_date_list[category_id].stations);
  showStationsOnMap(environmental_date_list[category_id].stations); // Show stations on the map
}

// Update the station select dropdown with new stations based on the category
function updateStationsDropdown(stations) {
  const stationSelect = document.getElementById('station_select');
  stationSelect.innerHTML = ''; // Clear the existing options

  // Add "All Stations" as the first option
  const allStationsOption = document.createElement('option');
  allStationsOption.value = 'All Stations';
  allStationsOption.textContent = 'All Stations';
  stationSelect.appendChild(allStationsOption);

  // Add individual stations as options
  stations.forEach(station => {
    const option = document.createElement('option');
    option.value = station;
    option.textContent = station;
    stationSelect.appendChild(option);
  });
}

function showStationsOnMap(stations) {
  // Clear all previous markers
  stationMarkers.forEach(marker => map.removeLayer(marker));
  stationMarkers = []; // Reset the markers array
  console.log('station location data', stationLocationData);
  console.log('stations required', stations);

  stations.forEach(stationName => {
    const station = stationLocationData.find(s => String(s.STNAME) === String(stationName));

    // Log found station data for debugging
    console.log('Matching station:', station);

    if (station && !isNaN(station.LAT_DEC) && !isNaN(station.LONGDEC)) {
      console.log('map', map);
      
      // Define the popup content with station details
      const popupContent = `
        <b>${station.STNAME}</b><br>
        Country: ${station.COUNTRY}<br>
        Latitude: ${station.LAT_DEC.toFixed(4)}<br>
        Longitude: ${station.LONGDEC.toFixed(4)}
      `;

      const marker = L.marker([station.LAT_DEC, station.LONGDEC])
        .bindPopup(popupContent) // Use the custom popup content
        .addTo(map);

      stationMarkers.push(marker); // Keep track of this marker
    } else {
      console.error(`Invalid coordinates for station: ${stationName}`, station);
    }
  });
}




// Function to add selected station to the array and UI
function addStation() {
  const stationSelect = document.getElementById('station_select');
  const selectedStation = stationSelect.value;

  // Check if "All Stations" is selected
  if (selectedStation === 'All Stations') {
    // Clear the selected stations array and add all stations to it
    selectedStations = environmental_date_list[curSelectedCategory].stations.slice();
    updateSelectedStationsOnUI();
  } else if (selectedStation && !selectedStations.includes(selectedStation)) { 
    // Add selected station if not already added
    selectedStations.push(selectedStation);
    updateSelectedStationsOnUI();
  } else {
    console.log("Station is already selected or invalid.");
  }
}

// Function to delete a station from the list
function deleteStation(index) {
  selectedStations.splice(index, 1); // Remove station by index
  updateSelectedStationsOnUI(); // Re-render the list
}

// Function to update selected stations on the UI
function updateSelectedStationsOnUI() {
  const container = document.getElementById('selected-stations-div');
  container.innerHTML = ''; // Clear the container

  selectedStations.forEach((station, index) => {
    // Create the div for each station
    const stationDiv = document.createElement('div');
    stationDiv.classList.add('selected-station-item');

    // Create the content for station name
    const stationInfo = document.createElement('span');
    stationInfo.textContent = station;

    // Create the delete button using an image
    const deleteButton = document.createElement('img');
    deleteButton.src = '../static/images/delete-button.png'; // Update the path to your delete button image
    deleteButton.alt = 'Delete';
    deleteButton.classList.add('delete-icon');
    deleteButton.onclick = function() {
      deleteStation(index);
    };

    // Append the info and delete button to the station div
    stationDiv.appendChild(stationInfo);
    stationDiv.appendChild(deleteButton);

    // Append the station div to the container
    container.appendChild(stationDiv);
  });
}

function checkValidSelectedTimeRange() {
  // Get the selected start and end dates from the input fields
  const selectedStartDate = new Date(startDateInput.value);
  const selectedEndDate = new Date(endDateInput.value);
  
  // Check if selected dates are valid
  if (isNaN(selectedStartDate) || isNaN(selectedEndDate) || (selectedStartDate > selectedEndDate)) {
    not_correct_date_range_element.style.display = "block";
    return false;
  }

  // Get the current selected category
  const categoryData = environmental_date_list[curSelectedCategory];
  
  // Convert category start and end dates to Date objects
  const categoryStartDate = new Date(categoryData.startDate);
  const categoryEndDate = new Date(categoryData.endDate);
  
  // Check if the selected date range falls within the category date range
  if (selectedStartDate < categoryStartDate || selectedEndDate > categoryEndDate) {
      document.getElementById('not_correct_date_range').style.display = "block";
      return false;
  }

  // If everything is valid, hide the error message and return true
  document.getElementById('not_correct_date_range').style.display = "none";
  return true;
}

// Function to delete a category from the list
function deleteCategory(index) {
  selectedCategories.splice(index, 1); // Remove category by index
  updateSelectedCategoriesOnUI(); // Re-render the list
}

function addCategoryToList() {
  // Check if the selected time range is valid
  var checkValidDate = checkValidSelectedTimeRange();

  if (checkValidDate) {
    // Add all stations if no station is selected (default to all stations)
    if (selectedStations.length === 0) {
      selectedStations = environmental_date_list[curSelectedCategory].stations.slice();
    }

    // Check if "compare" mode is selected and validate that there are 2 or more stations
    if (visualizationType === 'compare' && selectedStations.length < 2) {
      amountStationSelectionErrorAlert.style.display = 'block'; // Show the error alert
      console.log("Please select at least 2 stations for comparison.");
      return; // Stop further execution
    } else {
      amountStationSelectionErrorAlert.style.display = 'none'; // Hide error if conditions are met
    }

    // Add the selected category to the list
    const selectedCategoryName = environmental_date_list[curSelectedCategory].categoryName;
    
    // Get the selected start and end dates from the input fields
    const selectedStartDate = startDateInput.value;
    const selectedEndDate = endDateInput.value;

    // Create a new category object to add to the selectedCategories array
    const newCategory = {
      categoryName: selectedCategoryName,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      stations: selectedStations.slice(), // Add the stations array to the category
      visualizationType: visualizationType
    };

    // Check if the category already exists in the selectedCategories array
    const categoryExists = selectedCategories.some(category =>
      category.categoryName === newCategory.categoryName &&
      category.startDate === newCategory.startDate &&
      category.endDate === newCategory.endDate &&
      JSON.stringify(category.stations) === JSON.stringify(newCategory.stations) &&
      category.visualizationType === newCategory.visualizationType // Compare visualization type as well
    );

    if (categoryExists) {
      console.log("Category already exists in the list.");
    } else {
      // Add the new category object to the selectedCategories array
      selectedCategories.push(newCategory);
      console.log("Selected Categories Array:", selectedCategories);
      updateSelectedCategoriesOnUI();
    }
    // Clear the selected stations array after adding the category
    selectedStations = [];
    updateSelectedStationsOnUI(); // Clear the selected stations from the UI
  } else {
    console.log("The selected date range is not valid.");
  }
}

function editCategory(index) {
  // Get the category to edit
  const categoryToEdit = selectedCategories[index];

  // Remove the category from the selectedCategories array
  selectedCategories.splice(index, 1); // Remove category by index
  updateSelectedCategoriesOnUI(); // Re-render the list

  // Prepopulate the form with the category's details
  curSelectedCategory = environmental_date_list.findIndex(category => category.categoryName === categoryToEdit.categoryName);
  
  // Set the category dropdown to the correct category
  document.getElementById('category_select').value = curSelectedCategory;

  // Set the start date and end date inputs
  startDateInput.value = categoryToEdit.startDate;
  endDateInput.value = categoryToEdit.endDate;

  // Set the selected stations
  selectedStations = categoryToEdit.stations.slice(); // Copy the stations array
  updateSelectedStationsOnUI(); // Update the UI with the selected stations

  // Set the visualization type
  visualizationType = categoryToEdit.visualizationType;
  document.getElementById('visualization_type').value = visualizationType;
}


function updateSelectedCategoriesOnUI() {
  const container = document.getElementById('current_selected_element_div');
  container.innerHTML = ''; // Clear the container

  selectedCategories.forEach((category, index) => {
    // Create the div for each category
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category-item');

    // Combine category and stations info using innerHTML with line breaks
    const categoryContent = document.createElement('span');

    // Use a clear conditional assignment for the current visualization type
    const currentVisualizationType = category.visualizationType === "visualize" 
        ? "Single Station Data Visualization" 
        : "Multiple Stations Comparison";

    // Create the content with more readable formatting and clearer variable use
    categoryContent.innerHTML = `
        <b>${category.categoryName}:</b> ${category.startDate} to ${category.endDate}<br>
        <span style="font-weight: bold;">Type
        :</span> ${currentVisualizationType}<br>
        <span style="font-weight: normal;"><b>Selected Stations:</b> ${category.stations.join(', ')}
    `;

    // Create a container to hold both the edit and delete icons
    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex'; // Use flexbox to align the icons horizontally

    // Create the edit button using an image
    const editIcon = document.createElement('img');
    editIcon.src = '../static/images/edit-button.png';  // Path to your edit-button.png file
    editIcon.alt = 'Edit';
    editIcon.classList.add('edit-button');  // Add a class if you want to style the icon
    editIcon.onclick = function() {
      editCategory(index);
    };

    // Create the delete button using an image
    const deleteButton = document.createElement('img');
    deleteButton.src = '../static/images/delete-button.png'; // Update the path to your delete button image
    deleteButton.alt = 'Delete';
    deleteButton.classList.add('delete-icon');
    deleteButton.onclick = function() {
      deleteCategory(index);
    };

    // Append the edit and delete icons to the icon container
    iconContainer.appendChild(editIcon);
    iconContainer.appendChild(deleteButton);

    // Append the content and icon container to the category div
    categoryDiv.appendChild(categoryContent);
    categoryDiv.appendChild(iconContainer);

    // Append the category div to the container
    container.appendChild(categoryDiv);
  });
}

// Add event listener to the select element to update the date range when category changes
document.getElementById('category_select').addEventListener('change', function() {
  updateEnviromentalDate(parseInt(this.value)); // Convert the selected value to an integer
});

// Add event listener to the Add Station button
document.getElementById('add-station-button').addEventListener('click', addStation);

//Add event listener to the add category button
document.getElementById('add-category-button').addEventListener('click', addCategoryToList);


//********************************** VISUALISATION TYPE CHANGED **********************************/
document.getElementById('visualization_type').addEventListener('change', function() {
  // Update the variable when the user selects an option
  visualizationType = this.value;
  console.log("Visualization Type selected:", visualizationType);
});


//********************************** WORLD MAP **********************************/
document.addEventListener("DOMContentLoaded", function() { 
  // Initialize the map, set minZoom, and maxBounds
  map = L.map('map', {
      minZoom: 3, // Set minimum zoom level to prevent zooming out too much
      maxZoom: 19 // Maximum zoom level
  }).setView([15.8700, 100.9925], 5);  // Initial center around SE Asia

  // Set bounds to restrict map panning to a certain area (optional)
  var bounds = L.latLngBounds(
      L.latLng(-10, 40), // Southwest corner
      L.latLng(50, 150) // Northeast corner
  );
  map.setMaxBounds(bounds);
  map.on('drag', function() {
      map.panInsideBounds(bounds, { animate: false });
  });

  // Add a satellite tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Fetch the Mekong GeoJSON and add it to the map with custom style and interactions
  fetch('/mekong_geojson')
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
      // Custom style for the GeoJSON layer
      const geojsonStyle = {
          color: 'none',  // No border
          weight: 0,      // No border thickness
          fillColor: '#6baed6',  // Light blue fill color
          fillOpacity: 0.7       // Fill opacity (transparency)
      };

      // Add the GeoJSON to the map with the custom style
      L.geoJSON(data, {
          style: geojsonStyle,
          onEachFeature: function (feature, layer) {
              // Add tooltips or popups (optional)
              if (feature.properties && feature.properties.name) {
                  layer.bindTooltip(feature.properties.name, {permanent: true, direction: 'auto'});
              }
          }
      }).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
});



//********************************** GENERATE VISUALIZATION **********************************/

function showLargeGraph(graphJson) {
  modal.style.display = "block";
  // Render the graph in the modal using Plotly
  Plotly.newPlot('modal-graph', JSON.parse(graphJson));
}

closeModalGraphButton.onclick = function() {
  modal.style.display = "none";
  document.getElementById('modal-graph').innerHTML = ''; // Clear the graph content
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    document.getElementById('modal-graph').innerHTML = ''; // Clear the graph content
  }
}

document.getElementById('generate-visualization').addEventListener('click', function() {
  const selectedCategoriesList = JSON.stringify(selectedCategories);
  console.log(selectedCategories);  // Check if this has valid data before the fetch request

  if (selectedCategories.length === 0) {
    // Show the error message if no categories are selected
    document.getElementById('no-category-selected-alert').style.display = 'block';
    setTimeout(function() {
      document.getElementById('no-category-selected-alert').style.display = 'none';
    }, 5000);
    return; // Exit the function to prevent further execution
  } else {
    // Hide the error message if categories are selected
    document.getElementById('no-category-selected-alert').style.display = 'none';
    // Show loading GIF and hide the graph container
    const mapViewDiv = document.getElementById('map-view');
    const dataVisualizationDiv = document.getElementById('data-visualization-panel');
    const graphDataImagesDiv = document.getElementById('graph-data-images');
    const loadingGif = document.getElementById('loading-gif');
    
    // Show the loading GIF and hide other contents initially
    mapViewDiv.style.width = '60%'; //change the width of map to be smaller
    dataVisualizationDiv.style.width = '20%';
    dataVisualizationDiv.style.display = 'block'; //show the data visualization div
    graphDataImagesDiv.innerHTML = '';  // Clear any existing visualizations or graphs
    loadingGif.style.display = 'block';  // Show the GIF
  
    // Make the fetch request to generate the visualizations
    fetch('/generate_visualization', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: selectedCategoriesList
    })
    .then(response => response.json())
    .then(data => {
      console.log('Charts:', data.charts);  // Debugging
      loadingGif.style.display = 'none';
  
      // Render each Plotly chart from the JSON
      data.charts.forEach(chartJson => {
        const graphDiv = document.createElement('div');
        const viewButton = document.createElement('button');
        
        // Button to view larger graph
        viewButton.textContent = "Open Detailed View";
        viewButton.style.width = "60%";
        viewButton.style.borderRadius = "30px";
        viewButton.style.marginLeft = "20%";
        viewButton.onclick = function() {
            showLargeGraph(chartJson);  // Open the modal and show the larger graph
        };
    
        // Append the button and graph to the container
        graphDataImagesDiv.appendChild(graphDiv);
        graphDataImagesDiv.appendChild(viewButton);
    
        // Render the small graph
        Plotly.newPlot(graphDiv, JSON.parse(chartJson));
      });
    })
    .catch(error => {
      console.error('Error generating visualization:', error);
      loadingGif.style.display = 'none';
    });
    //loadingGif.style.display = 'none';
  }
});

//********************************** LOADING THE CSV **********************************/
// Initialize the CSV data on page load
document.addEventListener('DOMContentLoaded', function() {
  loadCSVStationLocationData(); // Load and parse the station data
  loadCSVDataForCategoriesDetails(); // Load and parse the CSV data when the document is ready
});
