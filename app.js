// ==========================================
// Horizon3D - Main Application Logic
// ==========================================

// --- Destination Data ---
const DESTINATIONS = {
    america: {
        name: "United States",
        capital: "Washington, D.C.",
        continent: "North America",
        desc: "From the neon energy of Times Square to the awe-inspiring vistas of the Grand Canyon and the iconic Golden Gate Bridge, the United States offers a diverse landscape of cultures, cities, and natural wonders.",
        image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80", // SF Bridge
        currency: "USD ($)",
        language: "English",
        timezone: -5, // EST (UTC-5)
        tempOffset: 22, // Base temp
        flightPriceBase: 2500,
        flightCode: "HZ-804"
    },
    japan: {
        name: "Japan",
        capital: "Tokyo",
        continent: "Asia",
        desc: "A mesmerizing blend of ancient traditions and futuristic innovation. Walk through tranquil Shinto shrines, view majestic Mount Fuji framed by cherry blossoms, and immerse yourself in Tokyo's neon-soaked streets.",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", // Pagoda
        currency: "JPY (¥)",
        language: "Japanese",
        timezone: 9, // JST (UTC+9)
        tempOffset: 19,
        flightPriceBase: 3800,
        flightCode: "HZ-412"
    },
    france: {
        name: "France",
        capital: "Paris",
        continent: "Europe",
        desc: "Renowned for its gastronomy, fashion, and art. Stroll along the Seine, marvel at the Eiffel Tower, explore world-class galleries like the Louvre, and experience the romantic charm of the French Riviera.",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80", // Paris
        currency: "EUR (€)",
        language: "French",
        timezone: 1, // CET (UTC+1)
        tempOffset: 16,
        flightPriceBase: 1900,
        flightCode: "HZ-109"
    },
    egypt: {
        name: "Egypt",
        capital: "Cairo",
        continent: "Africa",
        desc: "Step back in time to the cradle of civilization. Gaze upon the Great Pyramids of Giza, explore the mysterious Valley of the Kings, cruise along the historic Nile River, and discover timeless treasures.",
        image: "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&w=1200&q=80", // Pyramids
        currency: "EGP (E£)",
        language: "Arabic",
        timezone: 2, // EET (UTC+2)
        tempOffset: 32,
        flightPriceBase: 3200,
        flightCode: "HZ-550"
    },
    australia: {
        name: "Australia",
        capital: "Canberra",
        continent: "Oceania",
        desc: "An island continent boasting golden sandy beaches, the sprawling Outback, and rich marine life. Explore the Sydney Opera House, dive the Great Barrier Reef, and encounter unique native wildlife.",
        image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1200&q=80", // Sydney
        currency: "AUD ($)",
        language: "English",
        timezone: 10, // AEST (UTC+10)
        tempOffset: 24,
        flightPriceBase: 4200,
        flightCode: "HZ-993"
    }
};

// --- Agent Data ---
const AGENTS = [
    {
        id: "elena",
        name: "Elena Rostova",
        role: "VIP Luxury Advisor",
        rating: "4.9",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
        bio: "Specializes in bespoke European flights and first-class services."
    },
    {
        id: "marcus",
        name: "Marcus Vance",
        role: "Supersonic Fleet Coordinator",
        rating: "5.0",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80",
        bio: "Expert in technical fleet layouts, scheduling, and custom flight paths."
    },
    {
        id: "sophia",
        name: "Sophia Lin",
        role: "Global Concierge Specialist",
        rating: "4.8",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80",
        bio: "Specializes in complex multi-destination itineraries and visa consultation."
    }
];

// --- Global App State ---
let currentCountryKey = "america";
let currentStep = 1;
let selectedSeat = null;
let selectedAgentId = "elena";
let timeInterval = null;

// Ticket Pricing Factors
const CLASS_MULTIPLIERS = {
    premium: 1.0,
    business: 1.6,
    first: 2.5
};

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
    // Render Lucide icons
    lucide.createIcons();

    // Setup Country Explorer
    initCountrySelector();
    updateCountryDisplay(currentCountryKey);

    // Setup Booking Form Inputs
    initBookingForm();

    // Set Min Date for Inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("bookingDate").value = today;
    document.getElementById("bookingDate").min = today;
    document.getElementById("apptDate").value = today;
    document.getElementById("apptDate").min = today;

    // Load active navigation highlights
    setupNavHighlight();
});

// --- Country Explorer Logic ---
function initCountrySelector() {
    const selector = document.getElementById("countrySelector");
    selector.innerHTML = "";

    Object.keys(DESTINATIONS).forEach((key) => {
        const dest = DESTINATIONS[key];
        const tab = document.createElement("div");
        tab.className = `country-tab glass-panel ${key === currentCountryKey ? 'active' : ''}`;
        tab.setAttribute("data-key", key);
        tab.innerHTML = `
            <img src="${dest.image}" alt="${dest.name}">
            <div class="country-tab-info">
                <h4>${dest.name}</h4>
                <p>${dest.continent}</p>
            </div>
        `;
        tab.addEventListener("click", () => {
            document.querySelectorAll(".country-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentCountryKey = key;
            updateCountryDisplay(key);
        });
        selector.appendChild(tab);
    });
}

function updateCountryDisplay(key) {
    const dest = DESTINATIONS[key];
    
    // Animate out details then animate in (simple GSAP crossfade)
    gsap.to("#countryDisplay", { opacity: 0, y: 15, duration: 0.25, onComplete: () => {
        document.getElementById("countryMainImage").src = dest.image;
        document.getElementById("countryName").innerText = dest.name;
        document.getElementById("countryCapital").innerText = `Capital: ${dest.capital}`;
        document.getElementById("countryContinent").innerText = dest.continent;
        document.getElementById("countryDesc").innerText = dest.desc;
        document.getElementById("countryCurrency").innerText = dest.currency;
        document.getElementById("countryLanguage").innerText = dest.language;
        
        // Update temperature randomly based on base temp
        const currentTemp = Math.round(dest.tempOffset + (Math.random() * 4 - 2));
        document.getElementById("countryTemp").innerText = `${currentTemp}°C`;

        // Manage Local Clock
        if (timeInterval) clearInterval(timeInterval);
        updateLocalTime(dest.timezone);
        timeInterval = setInterval(() => updateLocalTime(dest.timezone), 1000);

        gsap.to("#countryDisplay", { opacity: 1, y: 0, duration: 0.4 });
    }});
}

function updateLocalTime(timezoneOffset) {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (3600000 * timezoneOffset));
    
    let hours = localTime.getHours();
    let minutes = localTime.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    document.getElementById("countryTime").innerText = `${hours}:${minutes} ${ampm}`;
}

// Action when clicking "Fly to this Destination" from cards
function bookDestination() {
    const selectDest = document.getElementById("bookingDestination");
    selectDest.value = currentCountryKey;
    
    // Smooth scroll to booking
    scrollToBooking();
    
    // Update booking summary
    updateBookingSummary();
}

function scrollToBooking() {
    const section = document.getElementById("booking");
    section.scrollIntoView({ behavior: 'smooth' });
}

// --- Booking Wizard Flow Logic ---
function initBookingForm() {
    // Populate Destinations Dropdown
    const selectDest = document.getElementById("bookingDestination");
    selectDest.innerHTML = "";
    Object.keys(DESTINATIONS).forEach(key => {
        const option = document.createElement("option");
        option.value = key;
        option.innerText = DESTINATIONS[key].name;
        selectDest.appendChild(option);
    });

    // Populate Agent Selection List
    const agentContainer = document.getElementById("agentCards");
    agentContainer.innerHTML = "";
    AGENTS.forEach(agent => {
        const card = document.createElement("div");
        card.className = `agent-card glass-panel ${agent.id === selectedAgentId ? 'active' : ''}`;
        card.setAttribute("data-agent-id", agent.id);
        card.innerHTML = `
            <img src="${agent.image}" alt="${agent.name}" class="agent-img">
            <div class="agent-info">
                <h4>${agent.name}</h4>
                <p>${agent.role}</p>
                <div class="agent-rating">
                    <i data-lucide="star" style="width: 14px; height: 14px; fill: #fbbf24;"></i>
                    <span>${agent.rating} (${Math.round(Math.random() * 50 + 20)} reviews)</span>
                </div>
            </div>
        `;
        card.addEventListener("click", () => {
            document.querySelectorAll(".agent-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            selectedAgentId = agent.id;
        });
        agentContainer.appendChild(card);
    });

    // Inputs value change listeners to update summary live
    selectDest.addEventListener("change", () => {
        updateBookingSummary();
    });
    document.getElementById("bookingTravelClass").addEventListener("change", () => {
        updateBookingSummary();
    });

    // Setup seat selection listeners
    document.querySelectorAll(".seat:not(.taken)").forEach(seat => {
        seat.addEventListener("click", () => {
            document.querySelectorAll(".seat").forEach(s => s.classList.remove("selected"));
            
            if (selectedSeat === seat.getAttribute("data-seat")) {
                // Toggle off
                selectedSeat = null;
                seat.classList.remove("selected");
            } else {
                // Select new
                selectedSeat = seat.getAttribute("data-seat");
                seat.classList.add("selected");
            }
            updateBookingSummary();
        });
    });

    // Initial sum update
    updateBookingSummary();
}

function updateBookingSummary() {
    const destKey = document.getElementById("bookingDestination").value;
    const dest = DESTINATIONS[destKey];
    const travelClass = document.getElementById("bookingTravelClass").value;
    const selectedAircraft = currentSelectedPlane; // Variable set in three-canvas.js

    // Bind flight number
    document.getElementById("summaryFlightCode").innerText = `FLIGHT ${dest.flightCode}`;
    document.getElementById("summaryDest").innerText = dest.name;
    document.getElementById("summaryPlane").innerText = selectedAircraft ? selectedAircraft.name : "Supersonic Jet";
    
    const classTextMap = {
        first: "Apex First Class",
        business: "Starlight Business",
        premium: "Apex Premium Economy"
    };
    document.getElementById("summaryClass").innerText = classTextMap[travelClass];
    
    // Bind seat selection
    document.getElementById("summarySeat").innerText = selectedSeat ? selectedSeat : "Not Selected";

    // Ticket price calculation
    let basePrice = dest.flightPriceBase;
    let multiplier = CLASS_MULTIPLIERS[travelClass];
    let finalPrice = Math.round(basePrice * multiplier);
    
    // Add seat premium for first row
    if (selectedSeat && selectedSeat.startsWith("1")) {
        finalPrice += 500;
    }
    
    document.getElementById("summaryPrice").innerText = `$${finalPrice.toLocaleString()}`;
}

// Next Step logic & validations
function nextStep() {
    if (currentStep === 1) {
        // Validate Step 1
        const name = document.getElementById("passengerName").value.trim();
        const email = document.getElementById("passengerEmail").value.trim();
        const date = document.getElementById("bookingDate").value;

        if (!name) {
            alert("Please enter passenger full name.");
            return;
        }
        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        if (!date) {
            alert("Please select a departure date.");
            return;
        }
    } else if (currentStep === 2) {
        // Validate Step 2: seat selection
        if (!selectedSeat) {
            alert("Please choose your seat inside the aircraft cabin before proceeding.");
            return;
        }
    } else if (currentStep === 3) {
        // Validate Step 3: consultation appointment date
        const apptDate = document.getElementById("apptDate").value;
        if (!apptDate) {
            alert("Please select a date for your travel consultation.");
            return;
        }

        // Process final booking confirmation
        generateFinalBooking();
    }

    if (currentStep < 4) {
        currentStep++;
        goToStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        goToStep(currentStep);
    }
}

function goToStep(step) {
    // Hide all panels
    document.querySelectorAll(".wizard-panel").forEach(p => p.classList.remove("active"));
    
    // Activate specific panel
    document.getElementById(`wizardPanel${step}`).classList.add("active");
    
    // Progress nodes color styling
    for (let i = 1; i <= 4; i++) {
        const node = document.getElementById(`stepNode${i}`);
        if (i < step) {
            node.className = "step-node completed";
        } else if (i === step) {
            node.className = "step-node active";
        } else {
            node.className = "step-node";
        }
    }

    // Update Progress Bar length
    const progressPercent = ((step - 1) / 3) * 100;
    document.getElementById("wizardProgressBar").style.width = `${progressPercent}%`;

    // Manage Prev & Next button visibilities
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const wizardActions = document.getElementById("wizardActions");

    if (step === 4) {
        wizardActions.style.display = "none"; // Hide actions on confirmation screen
    } else {
        wizardActions.style.display = "flex";
        btnPrev.style.visibility = step === 1 ? "hidden" : "visible";
        btnNext.innerHTML = step === 3 ? '<span>Confirm & Book</span> <i data-lucide="check"></i>' : '<span>Next Step</span> <i data-lucide="arrow-right"></i>';
        lucide.createIcons();
    }
}

// Generate receipt booking details and save to local storage
function generateFinalBooking() {
    const bookingId = "HZ-" + Math.floor(100000 + Math.random() * 900000);
    const name = document.getElementById("passengerName").value;
    const destKey = document.getElementById("bookingDestination").value;
    const destName = DESTINATIONS[destKey].name;
    const flightCode = DESTINATIONS[destKey].flightCode;
    const seat = selectedSeat;
    
    const agent = AGENTS.find(a => a.id === selectedAgentId);
    const apptDate = document.getElementById("apptDate").value;
    const apptTime = document.getElementById("apptTime").options[document.getElementById("apptTime").selectedIndex].text;
    const apptType = document.getElementById("apptType").options[document.getElementById("apptType").selectedIndex].text;

    // Save detailed object to local storage
    const bookingDetails = {
        bookingId: bookingId,
        passengerName: name,
        destination: destName,
        flightCode: flightCode,
        seat: seat,
        agentName: agent.name,
        consultationTime: `${apptDate} at ${apptTime} (${apptType})`,
        status: "Confirmed",
        timestamp: new Date().toLocaleString()
    };

    localStorage.setItem(bookingId, JSON.stringify(bookingDetails));

    // Bind values to receipt UI
    document.getElementById("receiptBookingId").innerText = bookingId;
    document.getElementById("receiptPassengerName").innerText = name;
    document.getElementById("receiptFlight").innerText = `${flightCode} to ${destName}`;
    document.getElementById("receiptSeat").innerText = seat;
    document.getElementById("receiptConsultant").innerText = agent.name;
    document.getElementById("receiptConsultationTime").innerText = `${apptDate} at ${apptTime.split(" ")[0]} ${apptTime.split(" ")[1]} (${apptType.split(" ")[0]})`;
    
    lucide.createIcons();
}

function resetBookingWizard() {
    // Clear selections
    selectedSeat = null;
    document.querySelectorAll(".seat").forEach(s => s.classList.remove("selected"));
    
    // Clear Inputs
    document.getElementById("passengerName").value = "";
    document.getElementById("passengerEmail").value = "";
    
    // Go to first screen
    currentStep = 1;
    goToStep(currentStep);
    updateBookingSummary();
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// --- Navigation Active Highlights on scroll ---
function setupNavHighlight() {
    const navLinks = document.querySelectorAll("nav a");
    const sections = document.querySelectorAll("section");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 300)) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").substring(1) === current) {
                link.classList.add("active");
            }
        });
    });
}
