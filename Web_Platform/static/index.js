let environment_date_text = document.getElementById('enviroment_date_text');
let startDateInput = document.getElementById('start-date');
let endDateInput = document.getElementById('end-date');
let not_correct_date_range_element = document.getElementById('not_correct_date_range');

// Define the array to hold environmental data
let selectedStations = []; // Array to store selected stations
let environmental_date_list = [];
let selectedCategories = [];
var curSelectedCategory;

function loadCSVData() {
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

  // Update the stations dropdown based on the selected category
  updateStationsDropdown(environmental_date_list[category_id].stations);
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
      stations: selectedStations.slice() // Add the stations array to the category
    };

    // Check if the category already exists in the selectedCategories array
    const categoryExists = selectedCategories.some(category =>
      category.categoryName === newCategory.categoryName &&
      category.startDate === newCategory.startDate &&
      category.endDate === newCategory.endDate &&
      JSON.stringify(category.stations) === JSON.stringify(newCategory.stations)
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

function updateSelectedCategoriesOnUI() {
  const container = document.getElementById('current_selected_element_div');
  container.innerHTML = ''; // Clear the container

  selectedCategories.forEach((category, index) => {
    // Create the div for each category
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category-item');

    // Combine category and stations info using innerHTML with line breaks
    const categoryContent = document.createElement('span');
    categoryContent.innerHTML = `<b>${category.categoryName}:</b> ${category.startDate} to ${category.endDate}<br><span style="font-weight: normal;"><b>Selected stations:</b> ${category.stations.join(', ')}</span>`;

    // Create the delete button using an image
    const deleteButton = document.createElement('img');
    deleteButton.src = '../static/images/delete-button.png'; // Update the path to your delete button image
    deleteButton.alt = 'Delete';
    deleteButton.classList.add('delete-icon');
    deleteButton.onclick = function() {
      deleteCategory(index);
    };

    // Append the combined content and delete button to the category div
    categoryDiv.appendChild(categoryContent);
    categoryDiv.appendChild(deleteButton);

    // Append the category div to the container
    container.appendChild(categoryDiv);
  });
}

// Initialize the CSV data on page load
document.addEventListener('DOMContentLoaded', function() {
  loadCSVData(); // Load and parse the CSV data when the document is ready
});


// Add event listener to the select element to update the date range when category changes
document.getElementById('category_select').addEventListener('change', function() {
  updateEnviromentalDate(parseInt(this.value)); // Convert the selected value to an integer
});

// Add event listener to the Add Station button
document.getElementById('add-station-button').addEventListener('click', addStation);

//Add event listener to the add category button
document.getElementById('add-category-button').addEventListener('click', addCategoryToList);




//********************************** WORLD MAP **********************************/
document.addEventListener("DOMContentLoaded", function() { 
  // Initialize the map, center it to a global view
  var map = L.map('map').setView([15.8700, 100.9925], 5);  // Center around SE Asia with zoom level 5

  // Add a satellite tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Fetch the Mekong GeoJSON and add it to the map
  fetch('/mekong_geojson')
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
      // Add the GeoJSON to the map
      L.geoJSON(data, {
        style: function (feature) {
          return { color: 'blue' }; // Set the line color for Mekong River
        }
      }).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
});


//********************************** GENERATE VISUALIZATION **********************************/

document.getElementById('generate-visualization').addEventListener('click', function() {
  const selectedCategoriesList = JSON.stringify(selectedCategories);
  console.log(selectedCategories);  // Check if this has valid data before the fetch request

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
        const graphContainer = document.getElementById('graph-container');
        graphContainer.innerHTML = '';  // Clear previous graphs

        data.charts.forEach(chartPath => {
            const img = document.createElement('img');
            img.src = chartPath;
            img.alt = 'Generated Chart';
            img.style.width = '100%';  // Adjust image size as needed
            graphContainer.appendChild(img);
        });
    })
    .catch(error => {
        console.error('Error generating visualization:', error);
    });
});
