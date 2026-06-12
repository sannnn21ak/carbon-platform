import React, { useState } from 'react';
import { User, Car, Utensils, Zap, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import transportData from '../data/transport.json';
import foodData from '../data/food.json';
import energyData from '../data/energy.json';

const Calculator = ({ onCalculate }) => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    body_type: 'normal',
    sex: 'female',
    social_activity: 'sometimes',
    transport: 'public',
    vehicle_type: 'None',
    vehicle_distance: 500,
    air_travel_frequency: 'rarely',
    diet: 'vegetarian',
    grocery_bill: 150,
    cooking_appliances: ['Stove', 'Microwave'],
    shower_frequency: 'daily',
    heating_energy: 'electricity',
    energy_efficiency: 'Sometimes',
    tv_pc_hours: 4,
    internet_hours: 6,
    waste_bag_size: 'medium',
    waste_bag_count: 3,
    recycling: ['Paper', 'Plastic'],
    new_clothes: 2
  });

  const updateInput = (key, value) => {
    setInputs((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-set vehicle type if transport changes
      if (key === 'transport' && value !== 'private') {
        updated.vehicle_type = 'None';
      } else if (key === 'transport' && value === 'private' && prev.vehicle_type === 'None') {
        updated.vehicle_type = 'petrol';
      }
      return updated;
    });
  };

  const handleToggleArray = (key, val) => {
    setInputs((prev) => {
      const current = prev[key];
      const updated = current.includes(val)
        ? current.filter((x) => x !== val)
        : [...current, val];
      return { ...prev, [key]: updated };
    });
  };

  const calculateEmissions = () => {
    // 1. Transport CO2
    let transport_co2 = transportData.base_transport[inputs.transport] || 0.0;
    transport_co2 += transportData.air_travel[inputs.air_travel_frequency] || 0.0;
    const vType = inputs.transport === 'private' ? inputs.vehicle_type : 'None';
    const distFactor = transportData.vehicle_type[vType] || 0.159;
    transport_co2 += inputs.vehicle_distance * distFactor;

    // 2. Food CO2
    let food_co2 = foodData.diet[inputs.diet] || 0.0;
    food_co2 += inputs.grocery_bill * foodData.grocery_bill_multiplier;

    // 3. Energy CO2
    let energy_co2 = energyData.heating_energy_source[inputs.heating_energy] || 0.0;
    energy_co2 += energyData.shower_frequency[inputs.shower_frequency] || 0.0;
    energy_co2 += energyData.energy_efficiency[inputs.energy_efficiency] || 0.0;
    energy_co2 += inputs.tv_pc_hours * energyData.tv_pc_hour_multiplier;
    energy_co2 += inputs.internet_hours * energyData.internet_hour_multiplier;
    inputs.cooking_appliances.forEach((app) => {
      energy_co2 += energyData.cooking_appliances[app] || 0.0;
    });

    // 4. Waste CO2
    let waste_size_factor = 0.0;
    if (inputs.waste_bag_size === 'small') waste_size_factor = -185.795;
    else if (inputs.waste_bag_size === 'medium') waste_size_factor = -69.840;
    else if (inputs.waste_bag_size === 'large') waste_size_factor = 67.185;
    else if (inputs.waste_bag_size === 'extra large') waste_size_factor = 188.451;

    let waste_co2 = waste_size_factor;
    waste_co2 += inputs.waste_bag_count * 82.607;
    
    // Recycling offsets
    const recycle_offsets = {
      Paper: -142.455,
      Metal: -136.656,
      Glass: -83.158,
      Plastic: -59.482
    };
    inputs.recycling.forEach((item) => {
      waste_co2 += recycle_offsets[item] || 0.0;
    });

    // 5. Other/Demographics & Intercept CO2
    let other_co2 = 1094.63; // Intercept
    other_co2 += inputs.sex === 'male' ? 165.578 : -165.578;
    
    const body_type_factors = {
      obese: 293.126,
      underweight: -237.180,
      normal: -136.159,
      overweight: 80.212
    };
    other_co2 += body_type_factors[inputs.body_type] || 0.0;

    const social_activity_factors = {
      often: 84.725,
      never: -80.160,
      sometimes: -4.565
    };
    other_co2 += social_activity_factors[inputs.social_activity] || 0.0;
    other_co2 += inputs.new_clothes * 13.763;

    // Total Carbon Footprint (kg CO2 per year)
    const carbon_emission = Math.max(0, Math.round(transport_co2 + food_co2 + energy_co2 + waste_co2 + other_co2));
    
    onCalculate({
      total: carbon_emission,
      breakdown: {
        transport: Math.max(0, Math.round(transport_co2)),
        food: Math.max(0, Math.round(food_co2)),
        energy: Math.max(0, Math.round(energy_co2)),
        waste: Math.max(0, Math.round(waste_co2)),
        other: Math.max(0, Math.round(other_co2))
      },
      inputs
    });
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else calculateEmissions();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="glass-card animate-slide-up" style={{ padding: '2.5rem' }}>
      {/* Step Progress */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            STEP {step} OF 4
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-mint)', fontWeight: '700' }}>
            {step === 1 && 'Personal Profile'}
            {step === 2 && 'Travel & Transport'}
            {step === 3 && 'Diet & Grocery'}
            {step === 4 && 'Home Energy & Waste'}
          </span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '99px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(step / 4) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent-emerald), var(--accent-mint))',
              transition: 'width 0.4s ease',
              boxShadow: 'var(--shadow-glow)'
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div style={{ minHeight: '350px' }}>
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="card-title"><User size={24} className="logo-icon" aria-hidden="true" /> Personal Profile</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Let's start with basic background. These demographic factors influence overall household sharing, baseline metabolism, and consumption habits in the database.
            </p>

            <div className="form-group">
              <label id="body_type_label" className="form-label">Body Type / Physical Size</label>
              <div role="radiogroup" aria-labelledby="body_type_label" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {['underweight', 'normal', 'overweight', 'obese'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={inputs.body_type === type}
                    onClick={() => updateInput('body_type', type)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: inputs.body_type === type ? 'var(--accent-mint)' : 'var(--border-color)',
                      background: inputs.body_type === type ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-primary)',
                      color: inputs.body_type === type ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Biological Sex</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['female', 'male'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={inputs.sex === s}
                        onClick={() => updateInput('sex', s)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor: inputs.sex === s ? 'var(--accent-mint)' : 'var(--border-color)',
                          background: inputs.sex === s ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-primary)',
                          color: inputs.sex === s ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="social_activity" className="form-label">Social Activity Frequency</label>
                <select
                  id="social_activity"
                  className="form-select"
                  value={inputs.social_activity}
                  onChange={(e) => updateInput('social_activity', e.target.value)}
                >
                  <option value="never">Never (Stay at home)</option>
                  <option value="sometimes">Sometimes (Moderate outings)</option>
                  <option value="often">Often (Frequent gatherings/dining out)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="new_clothes" className="form-label">New Clothes Purchased Monthly: <span style={{ color: 'var(--accent-mint)' }}>{inputs.new_clothes} items</span></label>
              <div className="slider-container">
                <input
                  id="new_clothes"
                  type="range"
                  min="0"
                  max="20"
                  className="slider-input"
                  value={inputs.new_clothes}
                  onChange={(e) => updateInput('new_clothes', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="card-title"><Car size={24} className="logo-icon" aria-hidden="true" /> Travel & Transportation</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Transportation is one of the largest segments of an individual's carbon footprint. Let's look at your commuting and flying habits.
            </p>

            <div className="form-group">
              <label id="transport_label" className="form-label">Primary Mode of Commuting</label>
              <div role="radiogroup" aria-labelledby="transport_label" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { id: 'walk_bicycle', label: 'Walk / Bicycle' },
                  { id: 'public', label: 'Public Transit' },
                  { id: 'private', label: 'Private Vehicle' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    role="radio"
                    aria-checked={inputs.transport === mode.id}
                    onClick={() => updateInput('transport', mode.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: inputs.transport === mode.id ? 'var(--accent-mint)' : 'var(--border-color)',
                      background: inputs.transport === mode.id ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-primary)',
                      color: inputs.transport === mode.id ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {inputs.transport === 'private' && (
              <div className="grid-cols-2 animate-fade-in">
                <div className="form-group">
                  <label htmlFor="vehicle_type" className="form-label">Fuel / Engine Type</label>
                  <select
                    id="vehicle_type"
                    className="form-select"
                    value={inputs.vehicle_type}
                    onChange={(e) => updateInput('vehicle_type', e.target.value)}
                  >
                    <option value="petrol">Petrol (Standard Gasoline)</option>
                    <option value="diesel">Diesel</option>
                    <option value="lpg">LPG (Liquefied Petroleum Gas)</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric (EV)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="vehicle_distance" className="form-label">Monthly Distance: <span style={{ color: 'var(--accent-mint)' }}>{inputs.vehicle_distance} km</span></label>
                  <div className="slider-container">
                    <input
                      id="vehicle_distance"
                      type="range"
                      min="0"
                      max="5000"
                      step="50"
                      className="slider-input"
                      value={inputs.vehicle_distance}
                      onChange={(e) => updateInput('vehicle_distance', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label id="air_travel_label" className="form-label">Air Travel Frequency (Flights per Year)</label>
              <div role="radiogroup" aria-labelledby="air_travel_label" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {['never', 'rarely', 'frequently', 'very frequently'].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    role="radio"
                    aria-checked={inputs.air_travel_frequency === freq}
                    onClick={() => updateInput('air_travel_frequency', freq)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: inputs.air_travel_frequency === freq ? 'var(--accent-mint)' : 'var(--border-color)',
                      background: inputs.air_travel_frequency === freq ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-primary)',
                      color: inputs.air_travel_frequency === freq ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="card-title"><Utensils size={24} className="logo-icon" aria-hidden="true" /> Diet & Grocery</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Food choices have huge carbon variations. Meat production generally accounts for much higher emissions compared to plant-based items.
            </p>

            <div className="form-group">
              <label id="diet_label" className="form-label">Eating Habit / Diet Type</label>
              <div role="radiogroup" aria-labelledby="diet_label" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {[
                  { id: 'vegan', label: 'Vegan' },
                  { id: 'vegetarian', label: 'Vegetarian' },
                  { id: 'pescatarian', label: 'Pescatarian' },
                  { id: 'omnivore', label: 'Omnivore' }
                ].map((dietOption) => (
                  <button
                    key={dietOption.id}
                    type="button"
                    role="radio"
                    aria-checked={inputs.diet === dietOption.id}
                    onClick={() => updateInput('diet', dietOption.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: inputs.diet === dietOption.id ? 'var(--accent-mint)' : 'var(--border-color)',
                      background: inputs.diet === dietOption.id ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-primary)',
                      color: inputs.diet === dietOption.id ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {dietOption.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="grocery_bill" className="form-label">Monthly Grocery Bill: <span style={{ color: 'var(--accent-mint)' }}>${inputs.grocery_bill}</span></label>
              <div className="slider-container">
                <input
                  id="grocery_bill"
                  type="range"
                  min="30"
                  max="400"
                  step="10"
                  className="slider-input"
                  value={inputs.grocery_bill}
                  onChange={(e) => updateInput('grocery_bill', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cooking Appliances Used Regularly (Select all that apply)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {['Stove', 'Oven', 'Microwave', 'Grill', 'Airfryer'].map((app) => {
                  const isChecked = inputs.cooking_appliances.includes(app);
                  return (
                    <button
                      key={app}
                      type="button"
                      aria-pressed={isChecked}
                      onClick={() => handleToggleArray('cooking_appliances', app)}
                      style={{
                        padding: '0.65rem 0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid',
                        borderColor: isChecked ? 'var(--accent-mint)' : 'var(--border-color)',
                        background: isChecked ? 'rgba(52, 211, 153, 0.12)' : 'var(--bg-primary)',
                        color: isChecked ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                    >
                      {app}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h3 className="card-title"><Zap size={24} className="logo-icon" aria-hidden="true" /> Home Energy & Waste</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your home's heating energy, appliances, and waste disposal have direct environmental impact.
            </p>

            <div className="grid-cols-2">
                <div className="form-group">
                <label htmlFor="heating_energy" className="form-label">Heating Energy Source</label>
                <select
                  id="heating_energy"
                  className="form-select"
                  value={inputs.heating_energy}
                  onChange={(e) => updateInput('heating_energy', e.target.value)}
                >
                  <option value="electricity">Clean Electricity / Heat Pump</option>
                  <option value="natural gas">Natural Gas</option>
                  <option value="wood">Wood Burning</option>
                  <option value="coal">Coal Heating</option>
                </select>
              </div>

                <div className="form-group">
                <label htmlFor="energy_efficiency" className="form-label">Energy Efficiency Devices?</label>
                <select
                  id="energy_efficiency"
                  className="form-select"
                  value={inputs.energy_efficiency}
                  onChange={(e) => updateInput('energy_efficiency', e.target.value)}
                >
                  <option value="Yes">Yes (Using efficient appliances, LED lights)</option>
                  <option value="Sometimes">Sometimes / Partially</option>
                  <option value="No">No / Not interested</option>
                </select>
              </div>
            </div>

            <div className="grid-cols-3" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="shower_frequency" className="form-label">Showering Frequency</label>
                <select
                  id="shower_frequency"
                  className="form-select"
                  value={inputs.shower_frequency}
                  onChange={(e) => updateInput('shower_frequency', e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="less frequently">Less Frequently</option>
                  <option value="daily">Daily</option>
                  <option value="twice a day">Twice a Day</option>
                  <option value="more frequently">More Frequently</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="waste_bag_count" className="form-label">Weekly Waste Bags: <span style={{ color: 'var(--accent-mint)' }}>{inputs.waste_bag_count}</span></label>
                <div className="slider-container" style={{ paddingTop: '0.45rem' }}>
                  <input
                    id="waste_bag_count"
                    type="range"
                    min="0"
                    max="10"
                    className="slider-input"
                    value={inputs.waste_bag_count}
                    onChange={(e) => updateInput('waste_bag_count', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="waste_bag_size" className="form-label">Waste Bag Size</label>
                <select
                  id="waste_bag_size"
                  className="form-select"
                  value={inputs.waste_bag_size}
                  onChange={(e) => updateInput('waste_bag_size', e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra large">Extra Large</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label id="recycling_label" className="form-label">Recycled Materials (Select all you actively sort)</label>
              <div role="group" aria-labelledby="recycling_label" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {['Paper', 'Plastic', 'Glass', 'Metal'].map((mat) => {
                  const isChecked = inputs.recycling.includes(mat);
                  return (
                    <button
                      key={mat}
                      type="button"
                      aria-pressed={isChecked}
                      onClick={() => handleToggleArray('recycling', mat)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid',
                        borderColor: isChecked ? 'var(--accent-mint)' : 'var(--border-color)',
                        background: isChecked ? 'rgba(52, 211, 153, 0.12)' : 'var(--bg-primary)',
                        color: isChecked ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label htmlFor="tv_pc_hours" className="form-label">Daily TV / PC: <span style={{ color: 'var(--accent-mint)' }}>{inputs.tv_pc_hours} hrs</span></label>
                <input
                  id="tv_pc_hours"
                  type="range"
                  min="0"
                  max="24"
                  className="slider-input"
                  value={inputs.tv_pc_hours}
                  onChange={(e) => updateInput('tv_pc_hours', parseInt(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="internet_hours" className="form-label">Daily Internet: <span style={{ color: 'var(--accent-mint)' }}>{inputs.internet_hours} hrs</span></label>
                <input
                  id="internet_hours"
                  type="range"
                  min="0"
                  max="24"
                  className="slider-input"
                  value={inputs.internet_hours}
                  onChange={(e) => updateInput('internet_hours', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
        {step > 1 ? (
          <button type="button" className="glow-btn-secondary" onClick={prevStep}>
            <ChevronLeft size={18} aria-hidden="true" /> Back
          </button>
        ) : (
          <div />
        )}

        <button type="button" className="glow-btn" onClick={nextStep}>
          {step === 4 ? (
            <>
              Calculate Footprint <Award size={18} aria-hidden="true" />
            </>
          ) : (
            <>
              Next Step <ChevronRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Calculator;
