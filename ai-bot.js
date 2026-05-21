// ==========================================
// Horizon3D - FlyAI Chatbot Assistant
// ==========================================

// Chat panel toggle state
let isChatOpen = false;

function toggleChatPanel() {
    const chatPanel = document.getElementById("chatPanel");
    isChatOpen = !isChatOpen;
    
    if (isChatOpen) {
        chatPanel.classList.add("open");
        // Focus input
        setTimeout(() => document.getElementById("chatInput").focus(), 300);
    } else {
        chatPanel.classList.remove("open");
    }
}

// Handle sending suggestion chips
function sendSuggestedMessage(text) {
    document.getElementById("chatInput").value = text;
    sendChatMessage();
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Main Send Message Function
function sendChatMessage() {
    const inputEl = document.getElementById("chatInput");
    const userText = inputEl.value.trim();
    if (!userText) return;

    // Append User Message to UI
    appendMessage(userText, "user");
    inputEl.value = "";

    // Show Typing Indicator
    const typingIndicatorId = showTypingIndicator();

    // Process and respond after delay
    setTimeout(() => {
        removeTypingIndicator(typingIndicatorId);
        const botResponse = generateBotResponse(userText);
        appendMessage(botResponse, "bot");
    }, 1000);
}

function appendMessage(text, sender) {
    const messageContainer = document.getElementById("chatMessages");
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = text; // allows styled HTML tags (like bold/bullet points)
    
    messageContainer.appendChild(msgDiv);
    
    // Auto Scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function showTypingIndicator() {
    const messageContainer = document.getElementById("chatMessages");
    const indicatorDiv = document.createElement("div");
    const uniqueId = "typing-" + Date.now();
    
    indicatorDiv.id = uniqueId;
    indicatorDiv.className = "chat-message bot";
    indicatorDiv.style.display = "flex";
    indicatorDiv.style.alignItems = "center";
    indicatorDiv.style.gap = "5px";
    indicatorDiv.innerHTML = `
        <span style="width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both;"></span>
        <span style="width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.2s;"></span>
        <span style="width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.4s;"></span>
        <style>
            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1.0); }
            }
        </style>
    `;
    
    messageContainer.appendChild(indicatorDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    return uniqueId;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// --- AI Response Engine ---
function generateBotResponse(input) {
    const text = input.toLowerCase().trim();

    // Check if input resembles a booking code lookup (starts with HZ-)
    const bookingMatch = text.match(/hz-\d{6}/i);
    if (bookingMatch) {
        const bookingId = bookingMatch[0].toUpperCase();
        const storedBooking = localStorage.getItem(bookingId);
        
        if (storedBooking) {
            const data = JSON.parse(storedBooking);
            return `
                <strong>🔍 Verification Successful!</strong><br>
                Booking ID: <strong>${data.bookingId}</strong><br>
                Passenger: ${data.passengerName}<br>
                Route: ${data.flightCode} to <strong>${data.destination}</strong><br>
                Seat: <strong>${data.seat}</strong><br>
                Consultant: ${data.agentName}<br>
                Consultation: <em>${data.consultationTime}</em><br>
                Status: <span style="color:#10b981; font-weight:600;">${data.status}</span><br><br>
                Your flight status is fully confirmed. You will receive an SMS reminder 2 hours prior to flight departure.
            `;
        } else {
            return `
                ❌ Booking Reference ID <strong>${bookingId}</strong> was not found in our database.<br><br>
                Please make sure you copied it correctly (e.g. <code>HZ-847291</code>). If you haven't booked yet, please fill out the booking form in our terminal section.
            `;
        }
    }

    // Checking status question without code
    if (text.includes("booking status") || text.includes("check my booking") || text.includes("check booking") || text.includes("my ticket")) {
        return `
            To verify your flight and consultation details, please type your **Booking Reference ID** (e.g. <code>HZ-123456</code>).<br><br>
            If you completed a booking in this session, the reference code can be found at the final step of the Booking Terminal.
        `;
    }

    // Specific Country Guideline matches
    if (text.includes("america") || text.includes("united states") || text.includes("usa") || text.includes("us ")) {
        return `
            <strong>✈️ Travel Guidelines for United States (USA):</strong><br>
            <ul>
                <li><strong>Visa:</strong> A valid passport and an approved ESTA (Visa Waiver Program) or B1/B2 tourist visa is required for entry.</li>
                <li><strong>Baggage:</strong> Allowance is up to 2 checked bags (23kg each) for Business/Premium, and 3 bags (32kg) for First class.</li>
                <li><strong>Weather & Packing:</strong> Temperate climate. Bring light jackets for coastal cities, and power adapters (Type A/B, 120V).</li>
                <li><strong>Attractions:</strong> Golden Gate Bridge (SF), Central Park (NY), Grand Canyon (AZ).</li>
            </ul>
        `;
    }

    if (text.includes("japan") || text.includes("tokyo") || text.includes("kyoto")) {
        return `
            <strong>✈️ Travel Guidelines for Japan:</strong><br>
            <ul>
                <li><strong>Visa:</strong> Visa-free entry for up to 90 days for most tourist passport holders.</li>
                <li><strong>Baggage:</strong> 2 bags up to 23kg. Large baggage on Shinkansen bullet trains requires reservation.</li>
                <li><strong>Essential Tips:</strong> Cash is widely used, carry a small trash bag (public bins are rare), plug Type A (100V).</li>
                <li><strong>Attractions:</strong> Mt. Fuji, Fushimi Inari Shrine (Kyoto), Shibuya Crossing (Tokyo).</li>
            </ul>
        `;
    }

    if (text.includes("france") || text.includes("paris") || text.includes("europe")) {
        return `
            <strong>✈️ Travel Guidelines for France:</strong><br>
            <ul>
                <li><strong>Visa:</strong> Schengen Visa required for non-exempt countries, or ETIAS registration starting soon.</li>
                <li><strong>Baggage:</strong> 2 checked bags (23kg). Excess luggage charged at gate.</li>
                <li><strong>Local Tips:</strong> Learn basic greetings ('Bonjour', 'Merci') which is highly appreciated. Power plugs are Type C/E (230V).</li>
                <li><strong>Attractions:</strong> Eiffel Tower, Louvre Museum, Palace of Versailles, French Riviera.</li>
            </ul>
        `;
    }

    if (text.includes("egypt") || text.includes("cairo") || text.includes("pyramid")) {
        return `
            <strong>✈️ Travel Guidelines for Egypt:</strong><br>
            <ul>
                <li><strong>Visa:</strong> Visa-on-Arrival available for $25 USD for major nationalities, or via e-visa portal online.</li>
                <li><strong>Baggage:</strong> 2 checked bags. Secure bags at Cairo Airport (CAI).</li>
                <li><strong>Tips & Packing:</strong> Bring lightweight cotton clothing, sunglasses, sunscreen. Plug Type C/F (220V).</li>
                <li><strong>Attractions:</strong> Pyramids of Giza, Sphinx, Luxor Valley, Egyptian Museum.</li>
            </ul>
        `;
    }

    if (text.includes("australia") || text.includes("sydney") || text.includes("melbourne")) {
        return `
            <strong>✈️ Travel Guidelines for Australia:</strong><br>
            <ul>
                <li><strong>Visa:</strong> All non-residents must obtain an Electronic Travel Authority (ETA) or visitor visa prior to travel.</li>
                <li><strong>Baggage:</strong> Strict domestic limits apply. International allowance: 2 bags (23kg).</li>
                <li><strong>Tips & Packing:</strong> Strict biosecurity border laws (declare all food/wood). Use SPF 50+ sunscreen. Plug Type I (230V).</li>
                <li><strong>Attractions:</strong> Sydney Opera House, Great Barrier Reef, Uluru.</li>
            </ul>
        `;
    }

    // Baggage FAQs
    if (text.includes("baggage") || text.includes("bag ") || text.includes("luggage") || text.includes("weight")) {
        return `
            <strong>💼 Horizon3D Baggage Allowances:</strong><br>
            <ul>
                <li><strong>Apex First Class:</strong> 3 checked bags (up to 32kg/70lbs each) + 2 carry-on items.</li>
                <li><strong>Starlight Business:</strong> 2 checked bags (up to 23kg/50lbs each) + 1 carry-on item.</li>
                <li><strong>Premium Economy:</strong> 1 checked bag (up to 23kg/50lbs) + 1 carry-on item.</li>
            </ul>
            *Excess weight is subject to $150 USD surcharge per item.
        `;
    }

    // Consultation support
    if (text.includes("consultation") || text.includes("appointment") || text.includes("agent") || text.includes("specialist") || text.includes("meeting")) {
        return `
            Our travel specialists are online and ready to assist you. To secure an appointment:<br>
            1. Scroll down to the **Booking Terminal** section.<br>
            2. Complete Step 1 (Flight) and Step 2 (Seat selection).<br>
            3. On **Step 3 (Agent Consultation)**, choose your preferred agent (Elena, Marcus, or Sophia) and time slot.<br><br>
            Meeting links for Video or Hologram calls are instantly attached to your boarding ticket.
        `;
    }

    // Flight paths / speed FAQs
    if (text.includes("fast") || text.includes("speed") || text.includes("mach") || text.includes("airplane") || text.includes("fleet")) {
        return `
            Our supersonic fleet operates at unmatched velocities:<br>
            • **AeroStream Mach-X**: Mach 2.2 supersonic jet. (Fastest transcontinental voyager).<br>
            • **Starlight Quantum**: Mach 3.5 luxury glider path.<br>
            • **Apex SkyLiner**: Mach 0.92 high-capacity double-decker passenger liner.<br><br>
            You can interact with them and explore full flight characteristics in our **3D Hangar** showroom above.
        `;
    }

    // Polite Greetings
    if (text.includes("hello") || text.includes("hi ") || text.includes("hey") || text.includes("greetings")) {
        return "Hello! How can I assist you with your travels today? You can ask me for flight details, baggage guidelines, destination requirements, or check booking confirmation codes.";
    }

    if (text.includes("thank") || text.includes("thanks") || text.includes("appreciate")) {
        return "You're very welcome! Let me know if there's anything else I can do to make your Horizon3D journey perfect. Bon voyage! ✈️";
    }

    // Default Fallback
    return `
        I can help with flight guidelines, visa rules, baggage allowances, and checking confirmation details.<br><br>
        • Try asking: <em>"What are the visa rules for Japan?"</em> or <em>"Show baggage allowances"</em><br>
        • Or input a booking code like: <code>HZ-804152</code> to check confirmation status.
    `;
}
