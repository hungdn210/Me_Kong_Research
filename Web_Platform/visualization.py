import glob
import pandas as pd
import plotly.express as px
import json
import re  # For regular expressions
import plotly
# Define paths for each category
CATEGORY_PATHS = {
    'Water Level': './static/data/mekong_data/Water.Level/*.csv',
    'Discharge Daily': './static/data/mekong_data/Discharge.Daily/*.csv',
    'Sediment Concentration': './static/data/mekong_data/Sediment.Concentration/*.csv',
    'Sediment Concentration (DSMP)': './static/data/mekong_data/Sediment.Concentration(DSMP)/*.csv',
    'Total Suspended Solids': './static/data/mekong_data/Total.Suspended.Solids/*.csv',
    'Rainfall Manual': './static/data/mekong_data/Rainfall.Manual/*.csv',
}

# Function to extract station name from filename
def extract_station_name(filename):
    match = re.search(r'\[(.*?)\]', filename)
    if match:
        return match.group(1)
    return os.path.basename(filename)

# Function to generate interactive plotly visualizations
def plot_interactive_chart(df, station_name, start_date, end_date, y_label, title):
    # Convert timestamp to datetime
    df['Timestamp'] = pd.to_datetime(df['Timestamp (UTC+07:00)'], utc=True)
    
    # Filter data based on date range
    df_filtered = df[(df['Timestamp'] >= pd.to_datetime(start_date).tz_localize('UTC')) & (df['Timestamp'] <= pd.to_datetime(end_date).tz_localize('UTC'))]

    # Create an area plot with Plotly (fills area under the line)
    fig = px.area(df_filtered, 
                  x='Timestamp', 
                  y='Value', 
                  title=title, 
                  labels={'Value': y_label},
                  template="plotly_white")  # A cleaner layout for better visibility
    
    # Customize title and axis fonts
    fig.update_layout(
        title={
            'text': title,
            'y': 0.9,  # Adjust vertical placement
            'x': 0.5,  # Center title
            'xanchor': 'center',
            'yanchor': 'top',
            'font': dict(size=24, color='black')  # Larger title
        },
        xaxis_title='Time (years)',  # X-axis label
        yaxis_title=y_label,  # Y-axis label
        font=dict(
            family="Arial, sans-serif",
            size=12,
            color="black"
        ),
        plot_bgcolor="white",  # Set background to white
        hovermode="x unified",  # Better hover information
        margin=dict(l=40, r=40, t=80, b=40),  # Add margin to prevent cutoff
        xaxis=dict(
            showline=True,
            showgrid=True,
            linecolor='black',
            gridcolor='LightGrey',
            tickformat="%Y"  # Show year format on X-axis
        ),
        yaxis=dict(
            showline=True,
            showgrid=True,
            linecolor='black',
            gridcolor='LightGrey'
        )
    )

    # Update line and area fill appearance
    fig.update_traces(
        mode='lines',
        line=dict(width=2, color='royalblue'),  # Line style
        fill='tozeroy',  # Fill the area under the line
        marker=dict(size=4, color='blue', symbol='circle')  # Customize markers
    )

    # Convert plot to JSON
    graph_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graph_json


# Function to generate visualizations based on selected categories
def generate_visualizations(selectedCategories):
    charts = []
    
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
                        graph_json = plot_interactive_chart(df, station_name, start_date, end_date, y_label="Water Level (m)", title=f"Water Level - {station_name}")
                    elif category_name == 'Discharge Daily':
                        graph_json = plot_interactive_chart(df, station_name, start_date, end_date, y_label="Discharge (m³/s)", title=f"Discharge Daily - {station_name}")
                    elif category_name == 'Sediment Concentration':
                        graph_json = plot_interactive_chart(df, station_name, start_date, end_date, y_label="Sediment Concentration (mg/l)", title=f"Sediment Concentration - {station_name}")
                    elif category_name == 'Total Suspended Solids':
                        graph_json = plot_interactive_chart(df, station_name, start_date, end_date, y_label="Total Suspended Solids (mg/l)", title=f"Total Suspended Solids - {station_name}")
                    elif category_name == 'Rainfall Manual':
                        graph_json = plot_interactive_chart(df, station_name, start_date, end_date, y_label="Rainfall (mm)", title=f"Rainfall - {station_name}")

                    charts.append(graph_json)
    
    return charts