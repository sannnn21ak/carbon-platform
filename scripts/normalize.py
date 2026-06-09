import pandas as pd
import numpy as np
import ast
import os

def normalize_data():
    clean_path = "raw_data/emissions_clean.csv"
    normalized_path = "raw_data/emissions_normalized.csv"
    
    if not os.path.exists(clean_path):
        print(f"Error: {clean_path} does not exist. Run clean.py first.")
        return
        
    print(f"Loading cleaned data from {clean_path}...")
    df = pd.read_csv(clean_path)
    
    # 1. Parse list columns
    def parse_list(x):
        if isinstance(x, str):
            try:
                return ast.literal_eval(x)
            except:
                return []
        return []
        
    df['parsed_recycling'] = df['recycling'].apply(parse_list)
    df['parsed_cooking_with'] = df['cooking_with'].apply(parse_list)
    
    # 2. Compute individual components in kg CO2 based on regression analysis
    print("Computing carbon footprint breakdowns in kg CO2...")
    
    # Transport CO2
    # Factors
    air_factors = {
        'very frequently': 770.892,
        'frequently': 109.443,
        'rarely': -346.955,
        'never': -533.381
    }
    trans_pref_factors = {
        'private': 1.299,
        'public': 2.014,
        'walk/bicycle': -3.313
    }
    vehicle_km_factors = {
        'petrol': 0.159489 + 0.209312,
        'diesel': 0.159489 + 0.086027,
        'lpg': 0.159489 + 0.115142,
        'hybrid': 0.159489 + 0.002660,
        'electric': 0.159489 - 0.158708,
        'None': 0.159489 - 0.094944 # Public transit / walking distance factor
    }
    
    def calc_transport_co2(row):
        co2 = trans_pref_factors.get(row['transport'], 0.0)
        co2 += air_factors.get(row['air_travel_frequency'], 0.0)
        v_type = row['vehicle_type']
        co2 += row['vehicle_monthly_distance_km'] * vehicle_km_factors.get(v_type, 0.159)
        return co2
        
    df['transport_co2'] = df.apply(calc_transport_co2, axis=1)
    
    # Food CO2
    diet_factors = {
        'omnivore': 96.265,
        'pescatarian': 6.918,
        'vegetarian': -37.751,
        'vegan': -65.432
    }
    grocery_factor = 0.913762
    
    def calc_food_co2(row):
        co2 = diet_factors.get(row['diet'], 0.0)
        co2 += row['monthly_grocery_bill'] * grocery_factor
        return co2
        
    df['food_co2'] = df.apply(calc_food_co2, axis=1)
    
    # Energy CO2
    heating_factors = {
        'electricity': -223.515,
        'coal': 208.387,
        'wood': 11.485,
        'natural gas': 3.643
    }
    shower_factors = {
        'more frequently': 21.714,
        'less frequently': -21.662,
        'daily': -12.323,
        'twice a day': 12.271
    }
    efficiency_factors = {
        'Yes': -33.108,
        'No': 34.138,
        'Sometimes': -1.030
    }
    cook_factors = {
        'Oven': 43.939,
        'Stove': 25.622,
        'Airfryer': 16.527,
        'Grill': 16.527,
        'Microwave': 10.158
    }
    tv_factor = 2.428306
    internet_factor = 7.124377
    
    def calc_energy_co2(row):
        co2 = heating_factors.get(row['heating_energy_source'], 0.0)
        co2 += shower_factors.get(row['how_often_shower'], 0.0)
        co2 += efficiency_factors.get(row['energy_efficiency'], 0.0)
        co2 += row['tv_pc_daily_hours'] * tv_factor
        co2 += row['internet_daily_hours'] * internet_factor
        for item in row['parsed_cooking_with']:
            co2 += cook_factors.get(item, 0.0)
        return co2
        
    df['energy_co2'] = df.apply(calc_energy_co2, axis=1)
    
    # Waste CO2
    bag_size_factors = {
        'extra large': 188.451,
        'large': 67.185,
        'medium': -69.840,
        'small': -185.795
    }
    bag_weekly_factor = 82.607
    recycle_factors = {
        'Paper': -142.455,
        'Metal': -136.656,
        'Glass': -83.158,
        'Plastic': -59.482
    }
    
    def calc_waste_co2(row):
        co2 = bag_size_factors.get(row['waste_bag_size'], 0.0)
        co2 += row['waste_bag_weekly_count'] * bag_weekly_factor
        for item in row['parsed_recycling']:
            co2 += recycle_factors.get(item, 0.0)
        return co2
        
    df['waste_co2'] = df.apply(calc_waste_co2, axis=1)
    
    # Other/Demographics CO2
    # Ensure exact sum by making other_co2 the residual
    df['other_co2'] = df['carbon_emission'] - (df['transport_co2'] + df['food_co2'] + df['energy_co2'] + df['waste_co2'])
    
    # Remove parsed temporary columns
    df = df.drop(columns=['parsed_recycling', 'parsed_cooking_with'])
    
    # Save normalized dataframe
    df.to_csv(normalized_path, index=False)
    print(f"Normalized data saved to {normalized_path}")
    print(f"Validation: Sum of breakdown categories matches total carbon_emission: {np.allclose(df['carbon_emission'], df['transport_co2'] + df['food_co2'] + df['energy_co2'] + df['waste_co2'] + df['other_co2'])}")
    
    # Print average breakdowns
    print("\n--- Average Carbon Emission Breakdown (kg CO2) ---")
    print(f"Total:      {df['carbon_emission'].mean():.2f}")
    print(f"Transport:  {df['transport_co2'].mean():.2f}")
    print(f"Food:       {df['food_co2'].mean():.2f}")
    print(f"Energy:     {df['energy_co2'].mean():.2f}")
    print(f"Waste:      {df['waste_co2'].mean():.2f}")
    print(f"Other:      {df['other_co2'].mean():.2f}")

if __name__ == "__main__":
    normalize_data()
