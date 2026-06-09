import json
import os
import pandas as pd

def split_data():
    normalized_path = "raw_data/emissions_normalized.csv"
    output_dir = "carbon-platform/src/data"
    
    if not os.path.exists(normalized_path):
        print(f"Error: {normalized_path} does not exist. Run normalize.py first.")
        return
        
    print(f"Creating output directory: {output_dir}")
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Load data to calculate averages and ensure correct files
    df = pd.read_csv(normalized_path)
    platform_avg = int(df['carbon_emission'].mean())
    
    # Define transport data structure
    transport_data = {
        "base_transport": {
            "private": 1.299,
            "public": 2.014,
            "walk_bicycle": -3.313
        },
        "vehicle_type": {
            "petrol": 0.3688,
            "diesel": 0.2455,
            "lpg": 0.2746,
            "hybrid": 0.1621,
            "electric": 0.00078,
            "None": 0.0645
        },
        "air_travel": {
            "very frequently": 770.892,
            "frequently": 109.443,
            "rarely": -346.955,
            "never": -533.381
        }
    }
    
    # Define food data structure
    food_data = {
        "diet": {
            "omnivore": 96.265,
            "pescatarian": 6.918,
            "vegetarian": -37.751,
            "vegan": -65.432
        },
        "grocery_bill_multiplier": 0.913762
    }
    
    # Define energy data structure
    energy_data = {
        "heating_energy_source": {
            "electricity": -223.515,
            "coal": 208.387,
            "wood": 11.485,
            "natural gas": 3.643
        },
        "shower_frequency": {
            "more frequently": 21.714,
            "less frequently": -21.662,
            "daily": -12.323,
            "twice a day": 12.271
        },
        "energy_efficiency": {
            "Yes": -33.108,
            "No": 34.138,
            "Sometimes": -1.030
        },
        "cooking_appliances": {
            "Oven": 43.939,
            "Stove": 25.622,
            "Airfryer": 16.527,
            "Grill": 16.527,
            "Microwave": 10.158
        },
        "tv_pc_hour_multiplier": 2.428306,
        "internet_hour_multiplier": 7.124377
    }
    
    # Define country averages (in kg CO2 per capita per year)
    country_averages = {
        "United States": 16000,
        "Germany": 8900,
        "China": 7600,
        "Global Average": 4800,
        "Platform Average": platform_avg,
        "India": 1800
    }
    
    # Write JSON files
    with open(os.path.join(output_dir, "transport.json"), "w") as f:
        json.dump(transport_data, f, indent=2)
    with open(os.path.join(output_dir, "food.json"), "w") as f:
        json.dump(food_data, f, indent=2)
    with open(os.path.join(output_dir, "energy.json"), "w") as f:
        json.dump(energy_data, f, indent=2)
    with open(os.path.join(output_dir, "country_averages.json"), "w") as f:
        json.dump(country_averages, f, indent=2)
        
    print("Exported all JSON data successfully:")
    print(" - carbon-platform/src/data/transport.json")
    print(" - carbon-platform/src/data/food.json")
    print(" - carbon-platform/src/data/energy.json")
    print(" - carbon-platform/src/data/country_averages.json")

if __name__ == "__main__":
    split_data()
