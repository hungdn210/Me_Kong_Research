from flask import Flask, render_template, request, jsonify
import json
from visualization import generate_visualizations  # Import the visualization generation logic

app = Flask(__name__)

# Route to render the main index.html page 
@app.route('/')
def index():
    return render_template('index.html')

# Route to serve the GeoJSON file for the Mekong Basin map
@app.route('/mekong_geojson')
def mekong_geojson():
    try: 
        with open('static/data/mekong_basin.geojson') as f:  # Make sure this path is correct
            geojson_data = json.load(f)
        return jsonify(geojson_data)  # Send the GeoJSON as a JSON response
    except FileNotFoundError:
        print("GeoJSON file not found.")
        return jsonify({"error": "GeoJSON file not found"}), 404

# Route to handle visualization generation based on selected categories
# Route to handle visualization generation based on selected categories
@app.route('/generate_visualization', methods=['POST'])
def generate_visualization():
    try:
        selected_categories = request.json
        print("Selected Categories:", selected_categories)  # Log the received data

        if not selected_categories:
            raise ValueError("No categories provided")

        charts = generate_visualizations(selected_categories)  # Get interactive charts in JSON format

        return jsonify({'charts': charts})

    except Exception as e:
        print(f"Error: {e}")  # Log the error for debugging
        return jsonify({'error': str(e)}), 400



if __name__ == '__main__':
    app.run(debug=True)

