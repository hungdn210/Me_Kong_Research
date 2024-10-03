import glob
import pandas as pd
import matplotlib.pyplot as plt
import os
import re
import matplotlib.dates as mdates

# Define paths for each category
CATEGORY_PATHS = {
    'Water Level': './static/data/mekong_data/Water.Level/*.csv',
    'Discharge Daily': './static/data/mekong_data/Discharge.Daily/*.csv',
    'Sediment Concentration': './static/data/mekong_data/Sediment.Concentration/*.csv',
    'Sediment Concentration (DSMP)': './static/data/mekong_data/Sediment.Concentration(DSMP)/*.csv',
    'Total Suspended Solids': './static/data/mekong_data/Total.Suspended.Solids/*.csv',
    'Rainfall Manual': './static/data/mekong_data/Rainfall.Manual/*.csv',
}


# Extract station name from file name
def extract_station_name(filename):
    match = re.search(r'\[(.*?)\]', filename)
    if match:
        return match.group(1)
    return os.path.basename(filename)

# Individual plotting functions for each category
def plot_water_level(df, station_name, start_date, end_date):
    # Check for the correct timestamp column
    if 'Timestamp (UTC+07:00)' in df.columns:
        df['Timestamp'] = pd.to_datetime(df['Timestamp (UTC+07:00)'], utc=True)
    else:
        print(f"Error: No valid 'Timestamp' column found for {station_name}")
        return

    # Filter data based on the date range
    df_filtered = df[(df['Timestamp'] >= pd.to_datetime(start_date).tz_localize('UTC')) & (df['Timestamp'] <= pd.to_datetime(end_date).tz_localize('UTC'))]

    plt.figure(figsize=(10, 6))
    plt.bar(df_filtered['Timestamp'], df_filtered['Value'], color='blue')
    plt.title(f'Water Level - {station_name}')
    plt.xlabel('Year')
    plt.ylabel('Water Level (m)')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.savefig(f'./static/images/Water Level_{station_name}.png')
    plt.close()

def plot_discharge_daily(df, station_name, start_date, end_date):
    # Check for the correct timestamp column
    if 'Timestamp (UTC+07:00)' in df.columns:
        df['Timestamp'] = pd.to_datetime(df['Timestamp (UTC+07:00)'], utc=True)
    else:
        print(f"Error: No valid 'Timestamp' column found for {station_name}")
        return

    # Filter data based on the date range
    df_filtered = df[(df['Timestamp'] >= pd.to_datetime(start_date).tz_localize('UTC')) & (df['Timestamp'] <= pd.to_datetime(end_date).tz_localize('UTC'))]

    plt.figure(figsize=(10, 6))
    plt.bar(df_filtered['Timestamp'], df_filtered['Value'], color='blue')
    plt.title(f'Discharge Daily - {station_name}')
    plt.xlabel('Year')
    plt.ylabel('Discharge (m³/s)')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.savefig(f'./static/images/Discharge Daily_{station_name}.png')
    plt.close()

def plot_sediment_concentration(df, station_name, start_date, end_date):
    # Check for the correct timestamp column
    if 'Timestamp (UTC+07:00)' in df.columns:
        df['Timestamp'] = pd.to_datetime(df['Timestamp (UTC+07:00)'], utc=True)
    else:
        print(f"Error: No valid 'Timestamp' column found for {station_name}")
        return

    # Filter data based on the date range
    df_filtered = df[(df['Timestamp'] >= pd.to_datetime(start_date).tz_localize('UTC')) & (df['Timestamp'] <= pd.to_datetime(end_date).tz_localize('UTC'))]

    plt.figure(figsize=(10, 6))
    plt.bar(df_filtered['Timestamp'], df_filtered['Value'], color='green')
    plt.title(f'Sediment Concentration - {station_name}')
    plt.xlabel('Year')
    plt.ylabel('Sediment Concentration (mg/l)')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.savefig(f'./static/images/Sediment Concentration_{station_name}.png')
    plt.close()

def plot_sediment_concentrationDSMP(df, station_name, start_date, end_date):
    # Check for the correct timestamp column
    if 'Timestamp (UTC+07:00)' in df.columns:
        df['Timestamp'] = pd.to_datetime(df['Timestamp (UTC+07:00)'], utc=True)
    else:
        print(f"Error: No valid 'Timestamp' column found for {station_name}")
        return

    # Filter data based on the date range
    df_filtered = df[(df['Timestamp'] >= pd.to_datetime(start_date).tz_localize('UTC')) & (df['Timestamp'] <= pd.to_datetime(end_date).tz_localize('UTC'))]

    plt.figure(figsize=(10, 6))
    plt.bar(df_filtered['Timestamp'], df_filtered['Value'], color='green')
    plt.title(f'Sediment Concentration - {station_name}')
    plt.xlabel('Year')
    plt.ylabel('Sediment Concentration (mg/l)')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.savefig(f'./static/images/Sediment Concentration (DSMP)_{station_name}.png')
    plt.close()

def plot_total_suspended_solids(df, station_name, start_date, end_date):
    # Check for the correct timestamp column
    if 'Timestamp (UTC+07:00)' in df.columns:
        df['Timestamp'] = pd.to_datetime(df['Timestamp (UTC+07:00)'], utc=True)
    else:
        print(f"Error: No valid 'Timestamp' column found for {station_name}")
        return

    # Filter data based on the date range
    df_filtered = df[(df['Timestamp'] >= pd.to_datetime(start_date).tz_localize('UTC')) & (df['Timestamp'] <= pd.to_datetime(end_date).tz_localize('UTC'))]

    plt.figure(figsize=(10, 6))
    plt.bar(df_filtered['Timestamp'], df_filtered['Value'], color='blue')
    plt.title(f'Total Suspended Solids - {station_name}')
    plt.xlabel('Year')
    plt.ylabel('Total Suspended Solids (mg/l)')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.savefig(f'./static/images/Total Suspended Solids_{station_name}.png')
    plt.close()

def plot_rainfall(df, station_name, start_date, end_date):
    # Check for the correct timestamp column
    if 'Timestamp (UTC+07:00)' in df.columns:
        df['Timestamp'] = pd.to_datetime(df['Timestamp (UTC+07:00)'], utc=True)
    else:
        print(f"Error: No valid 'Timestamp' column found for {station_name}")
        return

    # Filter data based on the date range
    df_filtered = df[(df['Timestamp'] >= pd.to_datetime(start_date).tz_localize('UTC')) & (df['Timestamp'] <= pd.to_datetime(end_date).tz_localize('UTC'))]

    plt.figure(figsize=(10, 6))
    plt.bar(df_filtered['Timestamp'], df_filtered['Value'], color='blue')
    plt.title(f'Rainfall - {station_name}')
    plt.xlabel('Year')
    plt.ylabel('Rainfall (mm)')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.savefig(f'./static/images/Rainfall Manual_{station_name}.png')
    plt.close()

# Function to handle different categories
def generate_visualizations(selectedCategories):
    for category in selectedCategories:
        category_name = category['categoryName']
        start_date = category['startDate']
        end_date = category['endDate']
        stations = category['stations']
        
        # Get the path for the category data
        if category_name in CATEGORY_PATHS:
            csv_files = glob.glob(CATEGORY_PATHS[category_name])

            # Process each station
            for file in csv_files:
                station_name = extract_station_name(file)
                if station_name in stations:
                    df = pd.read_csv(file)
                    
                    if category_name == 'Water Level':
                        plot_water_level(df, station_name, start_date, end_date)
                    elif category_name == 'Discharge Daily':
                        plot_discharge_daily(df, station_name, start_date, end_date)
                    elif category_name == 'Sediment Concentration':
                        plot_sediment_concentration(df, station_name, start_date, end_date)
                    elif category_name == 'Sediment Concentration (DSMP)':
                        plot_sediment_concentrationDSMP(df, station_name, start_date, end_date)
                    elif category_name == 'Total Suspended Solids':
                        plot_total_suspended_solids(df, station_name, start_date, end_date)
                    elif category_name == 'Rainfall Manual':
                        plot_rainfall(df, station_name, start_date, end_date)

    print("Visualizations complete.")
