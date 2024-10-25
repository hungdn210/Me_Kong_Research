import pandas as pd
import glob
import re
import os
from datetime import datetime

def extract_station_name(filename):
    """Extract station name from the filename."""
    match = re.search(r'\[(.*?)\]', filename)
    if match:
        return match.group(1)
    return None

def calculate_years(start_date, end_date):
    """Calculate the number of years between two dates."""
    return end_date.year - start_date.year + (1 if (end_date.month, end_date.day) >= (start_date.month, end_date.day) else 0)

def get_common_duration(all_start_dates, all_end_dates):
    """Calculate the common duration for a list of start and end dates."""
    if all_start_dates and all_end_dates:
        common_start_date = max(all_start_dates)
        common_end_date = min(all_end_dates)
        if common_start_date <= common_end_date:
            return common_start_date, common_end_date
    return None, None

def process_category(csv_files, category_name):
    """Process each category and return the common duration and station names."""
    all_start_dates = []
    all_end_dates = []
    stations_with_data = []
    
    for file in csv_files:
        # Extract station name or use the full filename if extraction fails
        station_name = extract_station_name(file)
        if station_name is None:
            station_name = os.path.basename(file)
        
        # Load the CSV file
        df = pd.read_csv(file)
        
        # Convert 'timestamp' column to datetime
        df['Timestamp (UTC+07:00)'] = pd.to_datetime(df['Timestamp (UTC+07:00)'], errors='coerce')
        
        # Drop rows with invalid or missing timestamps
        df.dropna(subset=['Timestamp (UTC+07:00)'], inplace=True)
        
        if df.empty:
            continue  # Skip if the dataframe is empty after dropping NaN
        
        # Get start and end date
        start_date = df['Timestamp (UTC+07:00)'].min()
        end_date = df['Timestamp (UTC+07:00)'].max()
        
        # Append start and end dates for common duration calculation
        all_start_dates.append(start_date)
        all_end_dates.append(end_date)
        
        # Add station name to the list of stations with data
        stations_with_data.append(station_name)
    
    # Calculate common duration when all stations have data
    common_start_date, common_end_date = get_common_duration(all_start_dates, all_end_dates)
    
    # Format common duration
    if common_start_date and common_end_date:
        common_duration = f"{common_start_date.strftime('%Y-%m-%d')} -> {common_end_date.strftime('%Y-%m-%d')}"
    else:
        common_duration = "No common duration"
    
    return common_duration, stations_with_data

# Define paths for all categories
categories = {
    "Discharge Daily": r"./data/mrc/Discharge.Daily/*.csv",
    "Rainfall Manual": r"./data/mrc/Rainfall.Manual/*.csv",
    "Sediment Concentration": r"./data/mrc/Sediment.Concentration/*.csv",
    "Sediment Concentration (DSMP)": r"./data/mrc/Sediment.Concentration (DSMP)/*.csv",
    "Total Suspended Solids": r"./data/mrc/Total.Suspended.Solids/*.csv",
    "Water Level": r"./data/mrc/Water.Level/*.csv"
}

# Initialize summary variables
summary_data = []
all_station_names = set()

# Process each category
for category_name, path in categories.items():
    csv_files = glob.glob(path)
    common_duration, stations_with_data = process_category(csv_files, category_name)
    
    # Add all stations from this category to the overall station list
    all_station_names.update(stations_with_data)
    
    # Append to summary data
    summary_data.append({
        'Category': category_name,
        'Common Start Date': common_duration.split(' -> ')[0] if common_duration != "No common duration" else 'N/A',
        'Common End Date': common_duration.split(' -> ')[1] if common_duration != "No common duration" else 'N/A',
        'Stations with Data': ', '.join(stations_with_data)
    })

# Create a final summary DataFrame
summary_df = pd.DataFrame(summary_data)

# Add the final column with all unique station names
summary_df['All Stations'] = ', '.join(sorted(all_station_names))

# Save the summary DataFrame to a CSV file
summary_df.to_csv('overall_station_summary.csv', index=False)

print("Summary CSV created successfully.")
