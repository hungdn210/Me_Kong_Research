import glob
import pandas as pd
import matplotlib.pyplot as plt
import os
import re
import matplotlib.dates as mdates

# Get all CSV files in the directory for Rainfall
csv_files = glob.glob(r"D:\Project\1_Me_Kong_Project\data\mrc\Rainfall.Manual\*.csv")

# Function to extract station name from the file name
def extract_station_name(filename):
    match = re.search(r'\[(.*?)\]', filename)
    if match:
        return match.group(1)
    return os.path.basename(filename)  # Return the full filename if no station name is found

def plot_and_save_bar_graph(df, station_name):
    print(f"Processing {station_name} - Columns: {df.columns}")
    
    # Check if 'Timestamp' exists, otherwise use another field name
    if 'Timestamp' in df.columns:
        df['Timestamp'] = pd.to_datetime(df['Timestamp'], utc=True)  # Convert to datetime with UTC
    elif 'Timestamp (UTC+07:00)' in df.columns:
        df['Timestamp (UTC+07:00)'] = pd.to_datetime(df['Timestamp (UTC+07:00)'], utc=True)  # Alternative timestamp column
        df['Timestamp'] = df['Timestamp (UTC+07:00)']  # Rename it to 'Timestamp'
    else:
        print(f"Error: No Timestamp column found for {station_name}")
        return
    
    # Convert the comparison dates to UTC to match the data
    start_date = pd.to_datetime('1976-01-01').tz_localize('UTC')
    end_date = pd.to_datetime('2001-12-31').tz_localize('UTC')
    
    # Filter the data to the date range between 1976-01-01 and 2001-12-31
    df_filtered = df[(df['Timestamp'] >= start_date) & (df['Timestamp'] <= end_date)]
    
    if df_filtered.empty:
        print(f"No data for station {station_name} in the given range")
        return
    
    plt.figure(figsize=(10, 6))
    
    # Plot the rainfall data as a bar graph
    plt.bar(df_filtered['Timestamp'], df_filtered['Value'], label='Rainfall (mm)', color='blue')
    plt.title(f'Rainfall over Time - {station_name} (1976-2001)')
    
    # Set the x-axis to only display the year, using matplotlib.dates
    plt.gca().xaxis.set_major_locator(mdates.YearLocator())  # Show every year
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y'))  # Format as year only
    
    plt.xlabel('Year')  # Change 'Date' to 'Year'
    plt.ylabel('Rainfall (mm)')
    plt.grid(True)
    plt.xticks(rotation=45)  # Rotate labels for better readability
    
    # Save the plot as an image
    output_file = f'Rainfall[{station_name}].png'
    plt.savefig(output_file)
    plt.close()

# Loop through each CSV file and generate the bar graphs
for file in csv_files:
    station_name = extract_station_name(file)
    df = pd.read_csv(file)
    
    # Call the function to generate and save the bar graph
    plot_and_save_bar_graph(df, station_name)

print("Bar graphs have been successfully generated for all stations.")
