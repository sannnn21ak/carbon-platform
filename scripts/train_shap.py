import ast
import os

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


RAW_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'raw_data', 'emissions_normalized.csv')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'shap_outputs')


def parse_list_column(series, prefix):
    """Convert stringified list values into binary indicator columns."""
    list_values = series.apply(lambda item: ast.literal_eval(item) if isinstance(item, str) else [])
    all_values = sorted({value for row in list_values for value in row if value})
    result = pd.DataFrame(
        {
            f"{prefix}_{value}": list_values.apply(lambda row: int(value in row))
            for value in all_values
        },
        index=series.index,
    )
    return result


def load_and_prepare_data(csv_path=RAW_DATA_PATH):
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=['carbon_emission'])

    recycling = parse_list_column(df['recycling'], 'recycling')
    cooking_with = parse_list_column(df['cooking_with'], 'cooking')

    df = pd.concat([df, recycling, cooking_with], axis=1)
    df = df.drop(columns=['recycling', 'cooking_with'])

    y = df['carbon_emission']
    X = df.drop(columns=['carbon_emission', 'transport_co2', 'food_co2', 'energy_co2', 'waste_co2', 'other_co2'])

    return X, y


def build_pipeline(numeric_features, categorical_features):
    numeric_transformer = Pipeline(
        [
            ('scaler', StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        [
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        [
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features),
        ],
        remainder='passthrough',
    )

    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)

    pipeline = Pipeline(
        [
            ('preprocessor', preprocessor),
            ('model', model),
        ]
    )

    return pipeline


def save_shap_outputs(explainer, shap_values, X_test, feature_names):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    summary_path = os.path.join(OUTPUT_DIR, 'shap_summary.png')
    shap.plots.beeswarm(shap_values, show=False)
    plt.tight_layout()
    plt.savefig(summary_path, dpi=150)
    plt.close()

    summary_csv_path = os.path.join(OUTPUT_DIR, 'shap_feature_importance.csv')
    shap_abs = np.abs(shap_values.values).mean(axis=0)
    shap_summary = pd.DataFrame(
        {
            'feature': feature_names,
            'mean_abs_shap_value': shap_abs,
        }
    ).sort_values('mean_abs_shap_value', ascending=False)
    shap_summary.to_csv(summary_csv_path, index=False)

    sample_df = X_test.reset_index(drop=True).copy()
    shap_df = pd.DataFrame(shap_values.values, columns=feature_names)
    output_sample = pd.concat([sample_df.iloc[:10], shap_df.iloc[:10]], axis=1)
    sample_path = os.path.join(OUTPUT_DIR, 'shap_sample_explanations.csv')
    output_sample.to_csv(sample_path, index=False)

    print(f"Saved SHAP summary plot to: {summary_path}")
    print(f"Saved SHAP feature importance CSV to: {summary_csv_path}")
    print(f"Saved sample SHAP explanations CSV to: {sample_path}")


def main():
    print('Loading dataset and preparing features...')
    X, y = load_and_prepare_data()

    numeric_features = [
        'monthly_grocery_bill',
        'vehicle_monthly_distance_km',
        'waste_bag_weekly_count',
        'tv_pc_daily_hours',
        'new_clothes_monthly',
        'internet_daily_hours',
    ]

    categorical_features = [
        'body_type',
        'sex',
        'diet',
        'how_often_shower',
        'heating_energy_source',
        'transport',
        'vehicle_type',
        'social_activity',
        'air_travel_frequency',
        'waste_bag_size',
        'energy_efficiency',
    ]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipeline = build_pipeline(numeric_features, categorical_features)
    print('Training RandomForestRegressor model...')
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f'RMSE: {rmse:.2f}')
    print(f'MAE: {mae:.2f}')
    print(f'R2: {r2:.4f}')

    preprocessor = pipeline.named_steps['preprocessor']
    model = pipeline.named_steps['model']

    transformed_X_train = preprocessor.transform(X_train)
    transformed_X_test = preprocessor.transform(X_test)
    feature_names = preprocessor.get_feature_names_out()

    print('Building SHAP explainer...')
    explainer = shap.Explainer(model, transformed_X_train, feature_names=feature_names)
    shap_values = explainer(transformed_X_test)

    print('Saving SHAP outputs...')
    save_shap_outputs(explainer, shap_values, X_test, feature_names)

    model_path = os.path.join(OUTPUT_DIR, 'carbon_model.joblib')
    joblib.dump(pipeline, model_path)
    print(f'Saved trained model pipeline to: {model_path}')


if __name__ == '__main__':
    main()
