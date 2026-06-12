import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, CheckSquare } from 'lucide-react';

const AIInsights = ({ result }) => {
  const { total, breakdown, inputs } = result;

  // State for Interactive planner
  const [selectedActions, setSelectedActions] = useState([]);
  const [plannerOpen, setPlannerOpen] = useState(true);

  // State for Chatbot
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hi! I'm Sparky, your AI Carbon Coach. 🌿 I've analyzed your annual footprint of ${(total / 1000).toFixed(2)} tons of CO₂. Ask me anything about how to reduce it, or try out the Interactive Action Planner!`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Generate localized action items based on user inputs
  const actionItems = [];

  if (inputs.transport === 'private' && inputs.vehicle_type !== 'electric') {
    const electricDiff = Math.max(0, Math.round(inputs.vehicle_distance * (0.3688 - 0.00078) * 12));
    actionItems.push({
      id: 'ev',
      category: 'transport',
      title: `Switch Petrol/Diesel car to an EV`,
      saving: electricDiff,
      tip: `Saves approx. ${electricDiff.toLocaleString()} kg CO₂/year. Electric vehicles have near-zero tailpipe emissions.`
    });
  }

  if (inputs.transport === 'private' && inputs.vehicle_type === 'petrol') {
    const hybridDiff = Math.max(0, Math.round(inputs.vehicle_distance * (0.3688 - 0.1621) * 12));
    actionItems.push({
      id: 'hybrid',
      category: 'transport',
      title: `Switch Petrol car to Hybrid vehicle`,
      saving: hybridDiff,
      tip: `Saves approx. ${hybridDiff.toLocaleString()} kg CO₂/year by combining electric braking power.`
    });
  }

  if (inputs.transport !== 'walk_bicycle' && inputs.vehicle_distance > 100) {
    const publicDiff = Math.max(0, Math.round(inputs.vehicle_distance * 0.5 * (0.3688 - 0.0645) * 12));
    actionItems.push({
      id: 'carpool',
      category: 'transport',
      title: `Use public transit/walk for half of trips`,
      saving: publicDiff,
      tip: `Saves approx. ${publicDiff.toLocaleString()} kg CO₂/year. Commutes over train/bus distribute emissions.`
    });
  }

  if (inputs.diet === 'omnivore' || inputs.diet === 'pescatarian') {
    actionItems.push({
      id: 'vegetarian',
      category: 'food',
      title: `Adopt a Vegetarian Diet`,
      saving: 134,
      tip: `Saves 134 kg CO₂/year. Eliminating red meat reduces livestock methane emissions substantially.`
    });
  }

  if (inputs.diet !== 'vegan') {
    actionItems.push({
      id: 'vegan_diet',
      category: 'food',
      title: `Adopt a fully Vegan Diet`,
      saving: 161,
      tip: `Saves 161 kg CO₂/year. Dairy and egg industries are major sources of agricultural emissions.`
    });
  }

  if (inputs.grocery_bill > 100) {
    const grocerySave = Math.round(inputs.grocery_bill * 0.1 * 0.913 * 12);
    actionItems.push({
      id: 'grocery',
      category: 'food',
      title: `Reduce food waste & buy local items by 10%`,
      saving: grocerySave,
      tip: `Saves approx. ${grocerySave} kg CO₂/year by reducing transport and farm-to-landfill waste.`
    });
  }

  if (inputs.heating_energy === 'coal' || inputs.heating_energy === 'wood' || inputs.heating_energy === 'natural gas') {
    actionItems.push({
      id: 'heating',
      category: 'energy',
      title: `Switch to clean electric heating / heat pump`,
      saving: 235,
      tip: `Saves 235 kg CO₂/year. Heat pumps draw heat from outside air, yielding up to 4x efficiency.`
    });
  }

  if (inputs.energy_efficiency !== 'Yes') {
    actionItems.push({
      id: 'efficiency',
      category: 'energy',
      title: `Install LED bulbs & energy efficient appliances`,
      saving: 67,
      tip: `Saves 67 kg CO₂/year. LED bulbs use 75% less energy and last 25 times longer than incandescent.`
    });
  }

  if (!inputs.recycling.includes('Paper') || !inputs.recycling.includes('Metal')) {
    actionItems.push({
      id: 'recycle_more',
      category: 'waste',
      title: `Actively sort Paper and Metal recycling`,
      saving: 279,
      tip: `Saves up to 279 kg CO₂/year. Reusing metals and paper fibers saves high smelting/pulping energies.`
    });
  }

  if (inputs.waste_bag_count > 2) {
    actionItems.push({
      id: 'compost',
      category: 'waste',
      title: `Start composting organic waste`,
      saving: 82,
      tip: `Saves 82 kg CO₂/year. Decaying organic matter in landfills releases methane; compost binds it as soil nutrients.`
    });
  }

  // Handle action toggle
  const toggleAction = (id) => {
    setSelectedActions(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Calculate potential reduction
  const totalSavings = actionItems
    .filter(item => selectedActions.includes(item.id))
    .reduce((sum, item) => sum + item.saving, 0);

  const projectedFootprint = Math.max(0, total - totalSavings);
  const reductionPct = ((totalSavings / (total || 1)) * 100).toFixed(0);

  // Hugging Face inference API via backend proxy — the token is kept server-side.
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputMessage('');
    setIsTyping(true);

    const modelName = import.meta.env.VITE_HF_MODEL || 'gpt2';

    const prompt = `You are Sparky, an enthusiastic expert AI Carbon Coach. The user's annual carbon footprint is ${(total/1000).toFixed(2)} tons CO₂e. Breakdown: Transport ${breakdown.transport} kg, Food ${breakdown.food} kg, Energy ${breakdown.energy} kg, Waste ${breakdown.waste} kg. Profile: diet=${inputs.diet}, transport=${inputs.transport} (${inputs.vehicle_type}), ${inputs.vehicle_distance} km/month, flights=${inputs.air_travel_frequency}, heating=${inputs.heating_energy}. User asks: "${userMsg}". Give a warm, practical, emoji-rich response in 2-4 sentences with concrete actionable advice tailored to their profile.`;

    const body = JSON.stringify({
      prompt,
      modelName
    });

    const url = "/api/hf-chat";
    let lastError = null;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      });

      const data = await res.json();
      if (!res.ok) {
        lastError = data?.error || `HTTP ${res.status}`;
        throw new Error(lastError);
      }

      const text = Array.isArray(data)
        ? data[0]?.generated_text || ''
        : data.generated_text || data[0]?.generated_text || '';

      if (text) {
        setMessages(prev => [...prev, { sender: 'bot', text: text.trim() }]);
        setIsTyping(false);
        return;
      }

      lastError = 'No generated text returned from Hugging Face.';
    } catch (fetchErr) {
      lastError = fetchErr.message || lastError;
    }

    // Hugging Face request failed — show error + local answer
    console.error('Hugging Face API failed:', lastError);
    const errorReply = `⚠️ Hugging Face API error: "${lastError}"\n\n💡 Local answer:\n\n${getLocalExpertReply(userMsg, inputs, breakdown, total)}`;
    setMessages(prev => [...prev, { sender: 'bot', text: errorReply }]);
    setIsTyping(false);
  };

  return (
    <div className="grid-cols-1-2">
      {/* Left panel: Interactive Planner */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckSquare size={18} className="text-emerald" aria-hidden="true" /> Action Planner
          </h3>
          <span className="badge badge-success">{actionItems.length} Suggestions</span>
        </div>

        {/* Projected Meter */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Projected Reduction:</span>
            <span style={{ fontWeight: '700', color: 'var(--accent-mint)' }}>-{totalSavings.toLocaleString()} kg CO₂/yr ({reductionPct}%)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Current: {(total/1000).toFixed(1)}t</span>
            <span>Target: {(projectedFootprint/1000).toFixed(1)}t</span>
          </div>

          <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '99px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, 100 - (projectedFootprint / (total || 1)) * 100))}%`,
                background: 'linear-gradient(90deg, var(--accent-emerald), var(--accent-mint))',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* Suggestion list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {actionItems.map((item) => {
            const isSelected = selectedActions.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleAction(item.id)}
                style={{
                  background: isSelected ? 'rgba(52, 211, 153, 0.06)' : 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--accent-mint)' : 'rgba(255, 255, 255, 0.05)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  textAlign: 'left'
                }}
              >
                <div style={{ color: isSelected ? 'var(--accent-mint)' : 'var(--text-muted)', marginTop: '2px' }}>
                  {isSelected ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <div style={{ width: '18px', height: '18px', border: '2px solid var(--text-muted)', borderRadius: '3px' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {item.tip}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel: Chatbot */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '540px', padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={18} className="text-emerald" aria-hidden="true" /> AI Carbon Coach
        </h3>

        {/* Chat log */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem', marginBottom: '1rem' }}>
          {messages.map((msg, i) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  flexDirection: isBot ? 'row' : 'row-reverse',
                  maxWidth: '85%'
                }}
              >
                <div style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  background: isBot ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                  color: isBot ? 'var(--accent-mint)' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '32px',
                  width: '32px'
                }}>
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>

                <div style={{
                  background: isBot ? 'rgba(255, 255, 255, 0.03)' : 'var(--accent-emerald)',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  borderTopLeftRadius: isBot ? '0' : '12px',
                  borderTopRightRadius: isBot ? '12px' : '0',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  border: isBot ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
              <div style={{
                padding: '0.5rem',
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.1)',
                color: 'var(--accent-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '32px',
                width: '32px'
              }}>
                <Bot size={16} />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '12px', borderTopLeftRadius: '0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                <span style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
          <label htmlFor="ai_input" className="sr-only">Ask Sparky about your carbon impact</label>
          <input
            id="ai_input"
            type="text"
            aria-label="Ask Sparky about your carbon impact"
            className="form-input"
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)' }}
            placeholder="Ask a question about your carbon impact..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            aria-label="Send message"
            className="glow-btn"
            style={{ padding: '0 1.25rem', borderRadius: 'var(--radius-md)' }}
            disabled={isTyping || !inputMessage.trim()}
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};

// Helper: returns human-readable name of highest emission category
function getHighestEmissionCategoryName(breakdown) {
  const key = getHighestBreakdownKey(breakdown);
  if (key === 'transport') return 'Transportation';
  if (key === 'food') return 'Diet & Groceries';
  if (key === 'energy') return 'Home Energy';
  if (key === 'waste') return 'Waste & Recycling';
  return 'General Profile';
}

// Helper: returns the raw key of the highest non-other emission category
function getHighestBreakdownKey(breakdown) {
  let highest = 'transport';
  let max = 0;
  Object.entries(breakdown).forEach(([k, v]) => {
    if (v > max && k !== 'other') {
      max = v;
      highest = k;
    }
  });
  return highest;
}

// Local Expert Knowledge Base — handles questions even when the external API is unavailable
function getLocalExpertReply(question, inputs, breakdown, total) {
  const q = question.toLowerCase();

  // ── Greetings ────────────────────────────────────────────
  if (q.match(/^(hi|hello|hey|sup|howdy|yo)\b/)) {
    return "Hey there! 👋 I'm Sparky, your local carbon expert. Ask me anything about CO₂, climate change, your footprint results, or what actions will make the biggest difference for you!";
  }

  // ── What is CO2 / Carbon / Greenhouse gas ────────────────
  if (q.includes('what is co2') || q.includes('what is carbon dioxide') || q.includes('co2 mean') || q.includes('co2?')) {
    return "🌍 CO₂ (Carbon Dioxide) is the primary greenhouse gas responsible for climate change. It's released when fossil fuels (petrol, coal, gas) are burned. It acts like a blanket around Earth, trapping heat. Every activity on this platform is measured in kg of CO₂-equivalent (CO₂e), which accounts for all warming gases.";
  }

  if (q.includes('carbon footprint') || q.includes('what is my footprint') || q.includes('what does') && q.includes('mean')) {
    return `🌿 Your carbon footprint is the total greenhouse gas emissions caused by your lifestyle in a year — currently **${(total/1000).toFixed(2)} tons CO₂e**. The global average is ~4.8 tons/year. The Paris Agreement target is under 2 tons per person by 2050. Your biggest contributor right now is **${getHighestEmissionCategoryName(breakdown)}**.`;
  }

  if (q.includes('greenhouse') || q.includes('global warming') || q.includes('climate change') || q.includes('climate')) {
    return "🌡️ Greenhouse gases (CO₂, methane, nitrous oxide) trap solar heat in the Earth's atmosphere, causing temperatures to rise. Individual actions — diet, transport, energy — are responsible for ~65% of all global emissions. Every kg of CO₂ you prevent matters! The actions in the planner to your left are all proven reductions.";
  }

  // ── How to reduce / tips ──────────────────────────────────
  if (q.includes('how to reduce') || q.includes('lower my') || q.includes('reduce my') || q.includes('cut my') || q.includes('improve')) {
    const top = getHighestEmissionCategoryName(breakdown);
    return `✅ Your fastest wins are in **${top}**. Here are the top 3 general strategies:\n1. 🚗 Switch to public transport or an EV (saves up to 1,000+ kg/yr)\n2. 🥗 Reduce meat consumption — even going vegetarian saves ~130 kg/yr\n3. ♻️ Recycle paper & metal and compost food waste (saves ~360 kg/yr combined)\nTick the boxes in the Action Planner to see your projected savings update live!`;
  }

  // ── Transport ─────────────────────────────────────────────
  if (q.match(/\b(car|drive|driving|vehicle|petrol|diesel|fuel|ev|electric car|hybrid|bus|train|transit|commute|transport)\b/)) {
    if (inputs.transport === 'private') {
      const vt = inputs.vehicle_type;
      if (vt === 'electric') return "⚡ Great choice — you're already driving an EV! Your vehicle's tailpipe emissions are near zero. To go further, charge from renewable energy sources (solar panels or a green energy tariff) to make your EV truly carbon-neutral.";
      return `🚗 You drive a ${vt} vehicle for ${inputs.vehicle_distance} km/month. Switching to an **EV** could cut ~${Math.round(inputs.vehicle_distance * 0.35 * 12)} kg CO₂/year. Even switching to a **hybrid** saves ~${Math.round(inputs.vehicle_distance * 0.2 * 12)} kg/year. Carpooling just 2 days/week gives a further 20% reduction!`;
    }
    return "🚲 You're already using public transit or active transport — that's one of the biggest single steps you can take! This saves over 1 tonne CO₂/year compared to private car commuting. Keep it up!";
  }

  // ── Flights / Air travel ──────────────────────────────────
  if (q.match(/\b(fly|flight|airplane|plane|aviation|air travel)\b/)) {
    const flightMap = { 'never': '0', 'rarely': '1–2', 'frequently': '3–5', 'very frequently': '6+' };
    return `✈️ Aviation is one of the most carbon-intensive activities — a single London↔NYC flight emits ~900 kg CO₂. You currently fly **${flightMap[inputs.air_travel_frequency] || inputs.air_travel_frequency}** times per year. Even replacing one long-haul flight with a train journey or video call can save hundreds of kg CO₂. Offset unavoidable flights through certified schemes like Gold Standard.`;
  }

  // ── Diet / Food ───────────────────────────────────────────
  if (q.match(/\b(meat|beef|chicken|pork|fish|diet|vegan|vegetarian|pescatarian|omnivore|food|grocery|eat|eating)\b/)) {
    const dietTips = {
      omnivore: "🥩 As an omnivore, your food emissions are highest. Beef is the worst offender — 1 kg of beef produces ~27 kg CO₂. Try **Meatless Mondays** first — just 1 day/week meat-free saves ~50 kg CO₂/year. Going fully vegetarian saves ~134 kg/year.",
      pescatarian: "🐟 Pescatarian is a good step! Fish has much lower emissions than red meat. Your next big win is reducing dairy — cheese and milk still carry significant emissions. Try plant-based milk alternatives to save another 30–50 kg CO₂/year.",
      vegetarian: "🥗 Vegetarian — well done! You've already cut a significant portion of food-related emissions. Reducing dairy and switching to plant-based proteins (lentils, tofu, beans) can save another 60 kg CO₂/year on your way to vegan.",
      vegan: "🌱 Vegan diet — you're at the lowest possible food footprint! Your food-related emissions are already minimal. Focus your energy on transport and energy habits for maximum additional impact."
    };
    return dietTips[inputs.diet] || "🥗 Choosing more plant-based meals is one of the most powerful individual climate actions available!";
  }

  // ── Energy / Heating / Electricity ────────────────────────
  if (q.match(/\b(heat|heating|energy|electricity|solar|coal|gas|boiler|appliance|led|light|efficient|efficiency)\b/)) {
    if (inputs.heating_energy === 'coal') return "🏭 Coal heating is the most carbon-intensive option (2× worse than gas). Switching to a **heat pump** (electric) could save ~430 kg CO₂/year. Even switching to natural gas would save ~200 kg/year as an interim step. Many governments offer subsidies for heat pump installations!";
    if (inputs.heating_energy === 'natural gas') return "🔥 Natural gas is cleaner than coal but still a fossil fuel. A **heat pump** runs on electricity and is 3–4× more efficient. Pair it with rooftop solar or a green energy tariff to cut your heating emissions to near zero.";
    if (inputs.heating_energy === 'wood') return "🪵 Wood burning produces particle pollution alongside CO₂. Modern **pellet boilers** are more efficient, but clean electric heat pumps remain the gold standard. If you have south-facing roof space, rooftop solar + a heat pump is a powerful combination.";
    return "⚡ Electric heating is great, especially on a renewable energy tariff! Boost efficiency with: LED lighting (75% less energy), smart thermostat (10% saving), draught-proofing, and unplugging devices on standby (phantom loads add up to 10% of your electricity bill).";
  }

  // ── Solar panels ──────────────────────────────────────────
  if (q.match(/\b(solar|panel|renewable|wind|green energy|clean energy|tariff)\b/)) {
    return "☀️ Rooftop solar panels generate clean electricity and can offset 1–2 tonnes of CO₂/year depending on your location. A typical 4kW system pays back its carbon cost in ~2 years and lasts 25+ years. Even without panels, switching to a **green energy tariff** from your supplier immediately zeroes out your grid electricity emissions!";
  }

  // ── Recycling / Waste ─────────────────────────────────────
  if (q.match(/\b(recycle|recycling|waste|garbage|compost|landfill|plastic|paper|glass|metal)\b/)) {
    const recycled = inputs.recycling || [];
    const missing = ['Paper', 'Metal', 'Glass', 'Plastic'].filter(r => !recycled.includes(r));
    if (missing.length > 0) return `♻️ You're not currently recycling: **${missing.join(', ')}**. Adding these saves up to **${missing.length * 80} kg CO₂/year** by avoiding high-energy virgin material production. Composting food scraps is also key — organic matter in landfills generates potent methane (28× more warming than CO₂).`;
    return "♻️ Great recycling habits! You're already sorting all major materials. Next level: **composting** food waste at home (saves ~82 kg CO₂/yr), avoiding single-use packaging, and choosing products with recycled content to close the loop.";
  }

  // ── Trees / Offsetting ────────────────────────────────────
  if (q.match(/\b(tree|trees|plant|offset|offsetting|carbon credit|carbon neutral|net zero)\b/)) {
    const trees = Math.round(total / 22);
    return `🌳 At ${(total/1000).toFixed(2)} tons CO₂/year, you'd need to plant **${trees} trees** and let them grow for a full year to offset your footprint. A single mature tree absorbs ~22 kg CO₂/year. While planting trees helps, **reducing emissions at source** is always more effective. Use certified offset schemes (Gold Standard, Verra) only for unavoidable emissions.`;
  }

  // ── Shopping / Clothes / Consumerism ─────────────────────
  if (q.match(/\b(clothes|clothing|fashion|shopping|buy|consume|product|gadget)\b/)) {
    return `👕 You buy ~${inputs.new_clothes} new items/month. The fashion industry emits ~10% of global CO₂. Each garment carries ~13.7 kg CO₂ in production. **3 simple steps:** (1) Buy second-hand/vintage, (2) Choose natural organic fibers over synthetics, (3) Repair & extend the life of what you own. This alone can save 100+ kg CO₂/year!`;
  }

  // ── Results / Score / Number ──────────────────────────────
  if (q.match(/\b(result|score|number|footprint|ton|kg|how much|how bad|good|bad|compare|average|benchmark)\b/)) {
    const globalAvg = 4800;
    const diff = total - globalAvg;
    const comparison = diff > 0
      ? `that's **${Math.abs(Math.round(diff/globalAvg*100))}% above** the global average of 4.8 tons`
      : `that's **${Math.abs(Math.round(diff/globalAvg*100))}% below** the global average — great work!`;
    return `📊 Your annual footprint is **${(total/1000).toFixed(2)} tons CO₂e** — ${comparison}. The Paris Climate target is 2 tons per person by 2050. Your biggest area is **${getHighestEmissionCategoryName(breakdown)}** (${breakdown[getHighestBreakdownKey(breakdown)].toLocaleString()} kg). Check the Dashboard tab for a full global benchmark comparison!`;
  }

  // ── Generic thoughtful fallback ───────────────────────────
  const top = getHighestEmissionCategoryName(breakdown);
  const topVal = breakdown[getHighestBreakdownKey(breakdown)];
  return `🌿 Great question! Based on your profile, your biggest opportunity is in **${top}** (${topVal.toLocaleString()} kg CO₂/year). Small consistent changes in this area — like switching energy sources, adjusting diet, or changing commute habits — compound into thousands of kg of savings over a lifetime. Check the Action Planner for personalised steps, or ask me about a specific topic like transport, diet, energy, or recycling!`;
}

export default AIInsights;
