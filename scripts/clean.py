import pandas as pd
import os

def clean_data():
    raw_path = "raw_data/emissions_raw.csv"
    clean_path = "raw_data/emissions_clean.csv"
    
    if not os.path.exists(raw_path):
        print(f"Error: {raw_path} does not exist.")
        return
        
    print(f"Loading raw data from {raw_path}...")
    df = pd.read_csv(raw_path)
    print(f"Original shape: {df.shape}")
    
    # 1. Rename columns to snake_case
    col_mapping = {
        'Body Type': 'body_type',
        'Sex': 'sex',
        'Diet': 'diet',
        'How Often Shower': 'how_often_shower',
        'Heating Energy Source': 'heating_energy_source',
        'Transport': 'transport',
        'Vehicle Type': 'vehicle_type',
        'Social Activity': 'social_activity',
        'Monthly Grocery Bill': 'monthly_grocery_bill',
        'Frequency of Traveling by Air': 'air_travel_frequency',
        'Vehicle Monthly Distance Km': 'vehicle_monthly_distance_km',
        'Waste Bag Size': 'waste_bag_size',
        'Waste Bag Weekly Count': 'waste_bag_weekly_count',
        'How Long TV PC Daily Hour': 'tv_pc_daily_hours',
        'How Many New Clothes Monthly': 'new_clothes_monthly',
        'How Long Internet Daily Hour': 'internet_daily_hours',
        'Energy efficiency': 'energy_efficiency',
        'Recycling': 'recycling',
        'Cooking_With': 'cooking_with',
        'CarbonEmission': 'carbon_emission'
    }
    df = df.rename(columns=col_mapping)
    
    # 2. Fill vehicle_type NaN with 'None' since these correspond to public/walk-bike users
    df['vehicle_type'] = df['vehicle_type'].fillna('None')
    
    # 3. Drop any rows with remaining null values (if any)
    initial_rows = len(df)
    df = df.dropna()
    dropped_rows = initial_rows - len(df)
    if dropped_rows > 0:
        print(f"Dropped {dropped_rows} rows containing missing values.")
        
    # 4. Remove duplicate rows
    initial_rows = len(df)
    df = df.drop_duplicates()
    dropped_dupes = initial_rows - len(df)
    if dropped_dupes > 0:
        print(f"Dropped {dropped_dupes} duplicate rows.")
        
    print(f"Cleaned shape: {df.shape}")
    
    # Ensure scripts directory exists
    os.makedirs(os.path.dirname(clean_path), exist_ok=True)
    df.to_csv(clean_path, index=False)
    print(f"Cleaned data saved to {clean_path}")

if __name__ == "__main__":
    clean_data()
