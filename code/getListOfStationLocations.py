import os
import re
import pandas as pd
import glob

# Path to the root directory where all data files are stored
data_dir = "./data/mrc"

# Function to extract station metadata from a metadata file
def extract_metadata(file_path):
    station_data = {}
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            
            # Use regular expressions to extract relevant information
            station_name_match = re.search(r'Location name: (.*)', content)
            country_match = re.search(r'Country: (.*)', content)
            lon_match = re.search(r'Longitude: ([\d\.-]+)', content)
            lat_match = re.search(r'Latitude: ([\d\.-]+)', content)
            
            if station_name_match and country_match and lat_match and lon_match:
                station_data['STNAME'] = station_name_match.group(1).strip()
                station_data['COUNTRY'] = country_match.group(1).strip()
                station_data['LONGDEC'] = float(lon_match.group(1).strip())
                station_data['LAT_DEC'] = float(lat_match.group(1).strip())
            else:
                print(f"Metadata not complete in {file_path}")
    except Exception as e:
        print(f"Error reading metadata from {file_path}: {e}")
    return station_data

# Function to find metadata files matching a station name exactly
def find_station_metadata(station_name):
    # Search for a .txt file that has the station name inside square brackets []
    print(f"Looking for metadata for station: {station_name}")
    pattern = os.path.join(data_dir, "**", f"*[{station_name}]*.txt")
    files = glob.glob(pattern, recursive=True)
    
    # Filter potential matches by checking the content of the file
    for file in files:
        with open(file, 'r') as f:
            content = f.read()
            if station_name in content:
                print(f"Found metadata for {station_name} in {file}")
                return extract_metadata(file)
    
    print(f"Metadata not found for station: {station_name}")
    return None

# Main function to process stations and find metadata
def process_stations():
    # Initialize a list to store the station summaries
    summary_data = []
    processed_stations = set()  # To track stations already processed
    
    # Read your summary CSV file (which contains the 'All Stations' column)
    summary_csv = './Web_Platform/static/data/overall_station_summary.csv'
    summary_df = pd.read_csv(summary_csv)
    
    # Process each station from the 'All Stations' column
    for stations_list in summary_df['All Stations']:
        stations = [s.strip() for s in stations_list.split(',')]
        
        for station in stations:
            # Ensure we don't reprocess the same station
            if station.lower() not in processed_stations:
                metadata = find_station_metadata(station)
                if station == "Vientiane":
                    metadata['STNAME'] = "Vientiane"
                if metadata:
                    summary_data.append({
                        'STNAME': metadata['STNAME'],
                        'COUNTRY': metadata['COUNTRY'],
                        'LONGDEC': metadata['LONGDEC'],
                        'LAT_DEC': metadata['LAT_DEC']
                    })
                    processed_stations.add(station.lower())  # Track this station as processed
    
    # Convert the summary data into a DataFrame and save it
    summary_df = pd.DataFrame(summary_data)
    summary_df.to_csv('ListOfStationLocations.csv', index=False)

# Run the processing
process_stations()
