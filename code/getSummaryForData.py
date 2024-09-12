import pandas as pd
import glob
import re
import os
from datetime import datetime

def extract_station_name(filename):
    match = re.search(r'\[(.*?)\]', filename)
    if match:
        return match.group(1)
    return None

def find_missing_date_ranges(missing_dates):
    """Find and format missing date ranges from a list of missing dates."""
    if not missing_dates:
        return "None"
    
    missing_date_ranges = []
    start_date = missing_dates[0]
    end_date = missing_dates[0]
    
    for i in range(1, len(missing_dates)):
        current_date = missing_dates[i]
        if (current_date - end_date).days == 1:
            end_date = current_date
        else:
            missing_date_ranges.append(f"{start_date.strftime('%Y-%m-%d')} -> {end_date.strftime('%Y-%m-%d')}")
            start_date = current_date
            end_date = current_date
    
    missing_date_ranges.append(f"{start_date.strftime('%Y-%m-%d')} -> {end_date.strftime('%Y-%m-%d')}")
    
    return ', '.join(missing_date_ranges)

def calculate_years(start_date, end_date):
    """Calculate the number of years between two dates."""
    return end_date.year - start_date.year + (1 if (end_date.month, end_date.day) >= (start_date.month, start_date.day) else 0)

# Path to your CSV files

csv_files = glob.glob(r"D:\Project\1_Me_Kong_Project\data\mrc\Discharge.Daily\*.csv")
name_summary = "Discharge.Daily"

csv_files = glob.glob(r"D:\Project\1_Me_Kong_Project\data\mrc\Rainfall.Manual\*.csv")
name_summary = "Rainfall.Manual"

csv_files = glob.glob(r"D:\Project\1_Me_Kong_Project\data\mrc\Sediment.Concentration\*.csv")
name_summary = "Sediment.Concentration"

csv_files = glob.glob(r"D:\Project\1_Me_Kong_Project\data\mrc\Total.Suspended.Solids\*.csv")
name_summary = "Total.Suspended.Solids"

csv_files = glob.glob(r"D:\Project\1_Me_Kong_Project\data\mrc\Water.Level\*.csv")
name_summary = "Water.Level"

# Initialize a list to hold the data for each station
summary_data = []
all_start_dates = []
all_end_dates = []

for file in csv_files:
    # Extract station name or use the full filename if extraction fails
    station_name = extract_station_name(file)
    if station_name is None:
        station_name = os.path.basename(file)  # Use the full filename if no station name is found
    
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
    
    # Calculate length of data recorded in years
    length_of_data_years = calculate_years(start_date, end_date)
    
    # Append start and end dates for common duration calculation
    all_start_dates.append(start_date)
    all_end_dates.append(end_date)
    
    # Create a full date range
    full_range = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Reindex the DataFrame to include all dates in the full range
    df_reindexed = df.set_index('Timestamp (UTC+07:00)').reindex(full_range)
    
    # Find missing dates
    missing_dates = df_reindexed[df_reindexed.isnull().all(axis=1)].index
    missing_dates_list = missing_dates.tolist()
    
    # Find and format missing date ranges
    missing_dates_ranges_str = find_missing_date_ranges(missing_dates_list)
    
    # Check if there are any missing dates
    has_missing_data = len(missing_dates_list) > 0
    
    # Append the data for this station to the summary list
    summary_data.append({
        'Station Name': station_name,
        'Start Date': start_date.strftime('%Y-%m-%d'),
        'End Date': end_date.strftime('%Y-%m-%d'),
        'Length of Data (Years)': length_of_data_years,
        'Has Missing Data': 'TRUE' if has_missing_data else 'FALSE',
        #'Missing Date Ranges': missing_dates_ranges_str
    })

# Convert the summary data to a DataFrame
summary_df = pd.DataFrame(summary_data)

# Calculate common duration when all stations have data
if all_start_dates and all_end_dates:
    common_start_date = max(all_start_dates)
    common_end_date = min(all_end_dates)
    if common_start_date <= common_end_date:
        common_duration = f"{common_start_date.strftime('%Y-%m-%d')} -> {common_end_date.strftime('%Y-%m-%d')}"
    else:
        common_duration = "No common duration"
else:
    common_duration = "No common duration"

# Add common duration to the summary DataFrame
summary_df['Common Duration'] = common_duration

# Save the summary DataFrame to a CSV file
summary_df.to_csv(f'station_summary_{name_summary}.csv', index=False)
