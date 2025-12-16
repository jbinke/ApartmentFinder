// Sample data for demonstration
const sampleApartments = [
    {
        name: "Starlight Residences",
        corporation: "Luxe Living Properties",
        address: "456 Moonlight Ave, Moapa, NV",
        website: "https://starlightresidences.example.com",
        units: [
            {
                name: "Unit 3A - Studio",
                baseRent: 1450,
                unitSpecs: "Studio, 1 bath, 550 sq ft",
                distanceMiles: 2.3,
                distanceMinutes: 8,
                features: ["patio", "washer", "wifi", "security", "shower"],
                utilities: {
                    electric: 85,
                    water: 40,
                    trash: 25,
                    internet: 0,
                    parkingFee: 50,
                    petFee: 30,
                    otherMonthly: 0
                },
                oneTimeFees: [
                    { name: "Application Fee", amount: 50 },
                    { name: "Security Deposit", amount: 1450 }
                ]
            },
            {
                name: "Unit 5B - 1 Bedroom",
                baseRent: 1750,
                unitSpecs: "1 bed, 1 bath, 750 sq ft",
                distanceMiles: 2.3,
                distanceMinutes: 8,
                features: ["patio", "washer", "tub", "security", "wifi", "pets", "ac", "heating"],
                utilities: {
                    electric: 95,
                    water: 45,
                    trash: 25,
                    internet: 0,
                    parkingFee: 50,
                    petFee: 30,
                    otherMonthly: 0
                },
                oneTimeFees: [
                    { name: "Application Fee", amount: 50 },
                    { name: "Security Deposit", amount: 1750 },
                    { name: "Pet Deposit", amount: 300 }
                ]
            }
        ]
    },
    {
        name: "Desert Oasis Apartments",
        corporation: "Desert Property Management",
        address: "789 Cactus Rd, Moapa, NV",
        website: "https://desertoasis.example.com",
        units: [
            {
                name: "Garden Unit",
                baseRent: 1600,
                unitSpecs: "2 bed, 1 bath, 900 sq ft",
                distanceMiles: 4.7,
                distanceMinutes: 15,
                features: ["patio", "washer", "tub", "parking", "security", "ac"],
                utilities: {
                    electric: 90,
                    water: 50,
                    trash: 30,
                    internet: 60,
                    parkingFee: 0,
                    petFee: 40,
                    otherMonthly: 20
                },
                oneTimeFees: [
                    { name: "Application Fee", amount: 75 },
                    { name: "Security Deposit", amount: 1600 },
                    { name: "Admin Fee", amount: 200 }
                ]
            }
        ]
    }
];

// Work location
const WORK_ADDRESS = "1 Lincoln St, Moapa, NV";

// Load apartments from localStorage or use sample data
let apartments = JSON.parse(localStorage.getItem('apartments')) || sampleApartments;

// DOM Elements
const apartmentForm = document.getElementById('apartmentForm');
const apartmentsContainer = document.getElementById('apartmentsContainer');
const noApartmentsMessage = document.getElementById('noApartmentsMessage');
const clearBtn = document.getElementById('clearBtn');
const addCustomFeeBtn = document.getElementById('addCustomFee');

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Render any existing apartments
    renderApartments();
    
    // Set up event listeners
    setupEventListeners();
    
    // Add cute decorations
    addCuteDecorations();
});

function setupEventListeners() {
    // Add new apartment form submission
    apartmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addApartment();
    });
    
    // Clear all apartments button
    clearBtn.addEventListener('click', clearAllApartments);
    
    // Add custom fee button
    addCustomFeeBtn.addEventListener('click', addCustomFee);
    
    // Set up unknown utility buttons
    document.querySelectorAll('.unknown-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.getAttribute('data-for');
            const input = document.getElementById(field);
            const isUnknown = this.classList.contains('active');
            
            if (isUnknown) {
                // Mark as known
                this.classList.remove('active');
                input.disabled = false;
                input.value = '';
                input.placeholder = '0.00';
            } else {
                // Mark as unknown
                this.classList.add('active');
                input.disabled = true;
                input.value = '';
                input.placeholder = 'Unknown';
            }
        });
    });
    
    // Set up one-time fee checkboxes
    document.querySelectorAll('.one-time-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const amountField = document.getElementById(this.id + 'Amount');
            amountField.disabled = !this.checked;
            if (!this.checked) {
                amountField.value = '';
            }
        });
    });
}

// Calculate total monthly cost for a unit
function calculateTotal(unit) {
    let total = unit.baseRent;
    
    // Add utilities (skip if unknown - marked as null)
    for (const utility in unit.utilities) {
        if (unit.utilities[utility] !== null && unit.utilities[utility] !== undefined) {
            total += unit.utilities[utility];
        }
    }
    
    return total.toFixed(2);
}

// Calculate total one-time fees for a unit
function calculateOneTimeTotal(unit) {
    if (!unit.oneTimeFees || unit.oneTimeFees.length === 0) return 0;
    
    return unit.oneTimeFees.reduce((sum, fee) => sum + fee.amount, 0);
}

// Format currency
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'Unknown';
    return '$' + parseFloat(amount).toFixed(2);
}

// Get selected features from checkboxes
function getSelectedFeatures() {
    const features = [];
    const checkboxes = document.querySelectorAll('.feature-checkbox:checked');
    checkboxes.forEach(checkbox => {
        features.push(checkbox.id);
    });
    return features;
}

// Get one-time fees from form
function getOneTimeFees() {
    const fees = [];
    
    // Check predefined fees
    const predefinedFees = [
        'applicationFee',
        'securityDeposit', 
        'adminFee',
        'petDeposit',
        'cleaningFee',
        'otherOneTime'
    ];
    
    predefinedFees.forEach(feeId => {
        const checkbox = document.getElementById(feeId);
        if (checkbox && checkbox.checked) {
            const amountField = document.getElementById(feeId + 'Amount');
            const amount = parseFloat(amountField.value) || 0;
            if (amount > 0) {
                // Convert fee ID to readable name
                const feeName = feeId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                fees.push({ name: feeName, amount: amount });
            }
        }
    });
    
    return fees;
}

// Clear feature checkboxes
function clearFeatureCheckboxes() {
    document.querySelectorAll('.feature-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Clear one-time fee checkboxes
function clearOneTimeCheckboxes() {
    document.querySelectorAll('.one-time-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        const amountField = document.getElementById(checkbox.id + 'Amount');
        if (amountField) {
            amountField.value = '';
            amountField.disabled = true;
        }
    });
}

// Create a simple map visualization
function createMapVisual(distanceMiles, distanceMinutes) {
    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-container';
    
    const mapPlaceholder = document.createElement('div');
    mapPlaceholder.className = 'map-placeholder';
    
    if (distanceMiles < 1) {
        mapPlaceholder.innerHTML = `
            <i class="fas fa-walking"></i>
            <p>Very close to work!</p>
            <p><strong>${distanceMiles} miles</strong> (${distanceMinutes} minutes)</p>
        `;
    } else if (distanceMiles < 3) {
        mapPlaceholder.innerHTML = `
            <i class="fas fa-bicycle"></i>
            <p>Close to work</p>
            <p><strong>${distanceMiles} miles</strong> (${distanceMinutes} minutes)</p>
        `;
    } else if (distanceMiles < 10) {
        mapPlaceholder.innerHTML = `
            <i class="fas fa-car"></i>
            <p>Short drive to work</p>
            <p><strong>${distanceMiles} miles</strong> (${distanceMinutes} minutes)</p>
        `;
    } else {
        mapPlaceholder.innerHTML = `
            <i class="fas fa-car-side"></i>
            <p>Drive to work</p>
            <p><strong>${distanceMiles} miles</strong> (${distanceMinutes} minutes)</p>
        `;
    }
    
    mapContainer.appendChild(mapPlaceholder);
    return mapContainer;
}

// Add a new apartment
function addApartment() {
    // Get basic apartment info
    const apartmentName = document.getElementById('apartmentName').value;
    const corporation = document.getElementById('corporation').value;
    const address = document.getElementById('address').value;
    const website = document.getElementById('website').value;
    
    // Get unit info
    const unitName = document.getElementById('unitName').value || "Unit 1";
    const baseRent = parseFloat(document.getElementById('baseRent').value) || 0;
    const unitSpecs = document.getElementById('unitSpecs').value;
    const distanceMiles = parseFloat(document.getElementById('distanceMiles').value) || 0;
    const distanceMinutes = parseFloat(document.getElementById('distanceMinutes').value) || 0;
    const features = getSelectedFeatures();
    
    // Get utility values or mark as unknown
    const utilities = {};
    const utilityFields = ['electric', 'water', 'trash', 'internet', 'parkingFee', 'petFee', 'otherMonthly'];
    
    utilityFields.forEach(field => {
        const input = document.getElementById(field);
        const unknownBtn = document.querySelector(`.unknown-btn[data-for="${field}"]`);
        
        // Check if the unknown button is active
        const isUnknown = unknownBtn && unknownBtn.classList.contains('active');
        
        if (isUnknown) {
            utilities[field] = null; // Mark as unknown
        } else {
            utilities[field] = parseFloat(input.value) || 0;
        }
    });
    
    // Get one-time fees
    const oneTimeFees = getOneTimeFees();
    
    // Create the new apartment object
    const newApartment = {
        name: apartmentName,
        corporation: corporation,
        address: address,
        website: website,
        units: [
            {
                name: unitName,
                baseRent: baseRent,
                unitSpecs: unitSpecs,
                distanceMiles: distanceMiles,
                distanceMinutes: distanceMinutes,
                features: features,
                utilities: utilities,
                oneTimeFees: oneTimeFees
            }
        ]
    };
    
    // Add to apartments array
    apartments.push(newApartment);
    
    // Save to localStorage
    localStorage.setItem('apartments', JSON.stringify(apartments));
    
    // Re-render the display
    renderApartments();
    
    // Reset the form
    resetForm();
    
    // Show success message
    alert(`Successfully added "${apartmentName}" to your comparison list!`);
}

// Reset the form
function resetForm() {
    // Reset main form fields
    document.getElementById('apartmentName').value = '';
    document.getElementById('corporation').value = '';
    document.getElementById('address').value = '';
    document.getElementById('website').value = '';
    document.getElementById('unitName').value = '';
    document.getElementById('baseRent').value = '';
    document.getElementById('unitSpecs').value = '';
    document.getElementById('distanceMiles').value = '';
    document.getElementById('distanceMinutes').value = '';
    
    // Reset utility fields and unknown buttons
    const utilityFields = ['electric', 'water', 'trash', 'internet', 'parkingFee', 'petFee', 'otherMonthly'];
    utilityFields.forEach(field => {
        const input = document.getElementById(field);
        const unknownBtn = document.querySelector(`.unknown-btn[data-for="${field}"]`);
        
        if (input) {
            input.value = '';
            input.disabled = false;
            input.placeholder = '0.00';
        }
        
        if (unknownBtn) {
            unknownBtn.classList.remove('active');
        }
    });
    
    // Reset feature checkboxes
    clearFeatureCheckboxes();
    
    // Reset one-time fees
    clearOneTimeCheckboxes();
    
    // Reset custom fee fields
    document.getElementById('customFeeName').value = '';
    document.getElementById('customFeeAmount').value = '';
    
    // Focus on the first field
    document.getElementById('apartmentName').focus();
}

// Add custom fee
function addCustomFee() {
    const name = document.getElementById('customFeeName').value.trim();
    const amount = parseFloat(document.getElementById('customFeeAmount').value);
    
    if (!name || isNaN(amount) || amount <= 0) {
        alert('Please enter both a fee name and a valid amount greater than 0.');
        return;
    }
    
    // Add to otherOneTime field
    const otherCheckbox = document.getElementById('otherOneTime');
    const otherAmountField = document.getElementById('otherOneTimeAmount');
    
    if (otherCheckbox && otherAmountField) {
        otherCheckbox.checked = true;
        otherAmountField.disabled = false;
        otherAmountField.value = amount;
        
        // Note: In a real implementation, we'd store the custom name
        // For now, we'll just use the amount in "Other Fee"
        
        // Clear custom inputs
        document.getElementById('customFeeName').value = '';
        document.getElementById('customFeeAmount').value = '';
        
        alert(`Custom fee "${name}" added! It will appear as "Other Fee" in the list.`);
    }
}

// Add unit to existing apartment complex
function addUnitToComplex(aptIndex) {
    const unitName = prompt("Enter a name for this unit (e.g., 'Unit 2B', 'Studio Loft'):", `Unit ${apartments[aptIndex].units.length + 1}`);
    if (!unitName) return;
    
    const baseRentInput = prompt("Enter the base rent for this unit:", "0");
    const baseRent = parseFloat(baseRentInput);
    if (isNaN(baseRent)) {
        alert("Please enter a valid number for rent");
        return;
    }
    
    const unitSpecs = prompt("Enter unit specifications (e.g., '2 bed, 1 bath, 850 sq ft'):", "");
    const distanceMilesInput = prompt(`Enter distance from work (${WORK_ADDRESS}) in miles:`, "0");
    const distanceMiles = parseFloat(distanceMilesInput) || 0;
    
    const distanceMinutesInput = prompt(`Enter estimated commute time in minutes:`, "0");
    const distanceMinutes = parseFloat(distanceMinutesInput) || 0;
    
    apartments[aptIndex].units.push({
        name: unitName,
        baseRent: baseRent,
        unitSpecs: unitSpecs || "",
        distanceMiles: distanceMiles,
        distanceMinutes: distanceMinutes,
        features: [],
        utilities: {
            electric: 0,
            water: 0,
            trash: 0,
            internet: 0,
            parkingFee: 0,
            petFee: 0,
            otherMonthly: 0
        },
        oneTimeFees: []
    });
    
    // Save and re-render
    localStorage.setItem('apartments', JSON.stringify(apartments));
    renderApartments();
    alert(`Unit added to ${apartments[aptIndex].name}!`);
}

// Delete apartment
function deleteApartment(index) {
    if (confirm('Are you sure you want to remove this entire apartment complex and all its units?')) {
        apartments.splice(index, 1);
        localStorage.setItem('apartments', JSON.stringify(apartments));
        renderApartments();
    }
}

// Delete unit
function deleteUnit(aptIndex, unitIndex) {
    if (confirm('Are you sure you want to remove this unit?')) {
        apartments[aptIndex].units.splice(unitIndex, 1);
        
        // If this was the last unit, remove the entire apartment
        if (apartments[aptIndex].units.length === 0) {
            apartments.splice(aptIndex, 1);
        }
        
        localStorage.setItem('apartments', JSON.stringify(apartments));
        renderApartments();
    }
}

// Clear all apartments
function clearAllApartments() {
    if (apartments.length > 0 && confirm('Are you sure you want to remove ALL apartments and units? This cannot be undone.')) {
        apartments = [];
        localStorage.removeItem('apartments');
        renderApartments();
    }
}

// Render all apartments
function renderApartments() {
    apartmentsContainer.innerHTML = '';
    
    if (apartments.length === 0) {
        noApartmentsMessage.style.display = 'block';
        return;
    }
    
    noApartmentsMessage.style.display = 'none';
    
    // Find the unit with lowest total cost for highlighting
    let lowestCost = Infinity;
    apartments.forEach(apt => {
        apt.units.forEach(unit => {
            const total = parseFloat(calculateTotal(unit));
            if (total < lowestCost) lowestCost = total;
        });
    });
    
    apartments.forEach((apartment, aptIndex) => {
        const apartmentCard = document.createElement('div');
        apartmentCard.className = 'apartment-complex';
        
        let apartmentHTML = `
            <div class="apartment-header">
                <div>
                    <h3 class="apartment-name">${apartment.name}</h3>
                    ${apartment.corporation ? `<div class="corporation-name"><i class="fas fa-building"></i> ${apartment.corporation}</div>` : ''}
                    <p class="apartment-address">${apartment.address}</p>
                    ${apartment.website ? `<a href="${apartment.website}" target="_blank" class="website-link"><i class="fas fa-external-link-alt"></i> Visit Website</a>` : ''}
                </div>
                <button class="btn-danger" onclick="deleteApartment(${aptIndex})"><i class="fas fa-trash"></i></button>
            </div>
            
            <div class="units-section">
                <h4 style="color: var(--accent2); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-door-closed"></i> Available Units (${apartment.units.length})
                </h4>
        `;
        
        apartment.units.forEach((unit, unitIndex) => {
            const totalCost = calculateTotal(unit);
            const oneTimeTotal = calculateOneTimeTotal(unit);
            const isLowestCost = parseFloat(totalCost) === lowestCost;
            
            // Feature badges
            let featureBadges = '';
            const featureIcons = {
                patio: 'fas fa-umbrella-beach',
                washer: 'fas fa-tshirt',
                tub: 'fas fa-bath',
                shower: 'fas fa-shower',
                garage: 'fas fa-warehouse',
                parking: 'fas fa-car',
                security: 'fas fa-shield-alt',
                wifi: 'fas fa-wifi',
                pets: 'fas fa-paw',
                furnished: 'fas fa-couch',
                ac: 'fas fa-snowflake',
                heating: 'fas fa-fire'
            };
            
            const featureLabels = {
                patio: 'Patio/Balcony',
                washer: 'Washer/Dryer',
                tub: 'Tub',
                shower: 'Shower',
                garage: 'Garage',
                parking: 'Outdoor Parking',
                security: 'Security',
                wifi: 'WiFi Included',
                pets: 'Pet Friendly',
                furnished: 'Furnished',
                ac: 'A/C',
                heating: 'Heating'
            };
            
            if (unit.features && unit.features.length > 0) {
                featureBadges = '<div class="features-display">';
                unit.features.forEach(feature => {
                    if (featureIcons[feature]) {
                        featureBadges += `
                            <div class="feature-badge">
                                <i class="${featureIcons[feature]}"></i>
                                ${featureLabels[feature] || feature}
                            </div>
                        `;
                    }
                });
                featureBadges += '</div>';
            }
            
            // One-time fees display
            let oneTimeFeesHTML = '';
            if (unit.oneTimeFees && unit.oneTimeFees.length > 0) {
                oneTimeFeesHTML = '<div class="one-time-fees-display">';
                oneTimeFeesHTML += '<div class="one-time-fees-title">One-Time Fees:</div>';
                
                unit.oneTimeFees.forEach(fee => {
                    oneTimeFeesHTML += `
                        <div class="one-time-fee-item">
                            <span>${fee.name}:</span>
                            <span>${formatCurrency(fee.amount)}</span>
                        </div>
                    `;
                });
                
                oneTimeFeesHTML += `
                    <div class="one-time-fee-item" style="font-weight: bold; margin-top: 5px; padding-top: 5px; border-top: 1px dashed var(--border);">
                        <span>Total One-Time Fees:</span>
                        <span>${formatCurrency(oneTimeTotal)}</span>
                    </div>
                `;
                
                oneTimeFeesHTML += '</div>';
            }
            
            // Create utility items HTML
            let utilitiesHTML = '';
            utilitiesHTML += '<div class="utilities-title">Monthly Utilities & Fees:</div>';
            
            // Electric
            if (unit.utilities.electric === null) {
                utilitiesHTML += '<div class="utility-item"><span>Electric:</span><span class="utility-unknown">Unknown</span></div>';
            } else if (unit.utilities.electric > 0) {
                utilitiesHTML += `<div class="utility-item"><span>Electric:</span><span>${formatCurrency(unit.utilities.electric)}</span></div>`;
            }
            
            // Water
            if (unit.utilities.water === null) {
                utilitiesHTML += '<div class="utility-item"><span>Water:</span><span class="utility-unknown">Unknown</span></div>';
            } else if (unit.utilities.water > 0) {
                utilitiesHTML += `<div class="utility-item"><span>Water:</span><span>${formatCurrency(unit.utilities.water)}</span></div>`;
            }
            
            // Trash
            if (unit.utilities.trash === null) {
                utilitiesHTML += '<div class="utility-item"><span>Trash:</span><span class="utility-unknown">Unknown</span></div>';
            } else if (unit.utilities.trash > 0) {
                utilitiesHTML += `<div class="utility-item"><span>Trash:</span><span>${formatCurrency(unit.utilities.trash)}</span></div>`;
            }
            
            // Internet
            if (unit.utilities.internet === null) {
                utilitiesHTML += '<div class="utility-item"><span>Internet:</span><span class="utility-unknown">Unknown</span></div>';
            } else if (unit.utilities.internet > 0) {
                utilitiesHTML += `<div class="utility-item"><span>Internet:</span><span>${formatCurrency(unit.utilities.internet)}</span></div>`;
            }
            
            // Parking Fee
            if (unit.utilities.parkingFee === null) {
                utilitiesHTML += '<div class="utility-item"><span>Parking Fee:</span><span class="utility-unknown">Unknown</span></div>';
            } else if (unit.utilities.parkingFee > 0) {
                utilitiesHTML += `<div class="utility-item"><span>Parking Fee:</span><span>${formatCurrency(unit.utilities.parkingFee)}</span></div>`;
            }
            
            // Pet Fee
            if (unit.utilities.petFee === null) {
                utilitiesHTML += '<div class="utility-item"><span>Pet Fee:</span><span class="utility-unknown">Unknown</span></div>';
            } else if (unit.utilities.petFee > 0) {
                utilitiesHTML += `<div class="utility-item"><span>Pet Fee:</span><span>${formatCurrency(unit.utilities.petFee)}</span></div>`;
            }
            
            // Other Monthly
            if (unit.utilities.otherMonthly === null) {
                utilitiesHTML += '<div class="utility-item"><span>Other Monthly:</span><span class="utility-unknown">Unknown</span></div>';
            } else if (unit.utilities.otherMonthly > 0) {
                utilitiesHTML += `<div class="utility-item"><span>Other Monthly:</span><span>${formatCurrency(unit.utilities.otherMonthly)}</span></div>`;
            }
            
            apartmentHTML += `
                <div class="unit-card">
                    <div class="unit-header">
                        <div class="unit-name">${unit.name}</div>
                        <button class="btn-danger" onclick="deleteUnit(${aptIndex}, ${unitIndex})" style="padding: 6px 12px; font-size: 0.9rem;">Remove</button>
                    </div>
                    
                    <div class="price">${formatCurrency(unit.baseRent)}<span style="font-size: 0.9rem; color: var(--accent2); font-weight: normal;">/month</span></div>
                    
                    <div class="unit-specs">${unit.unitSpecs || 'No specs provided'}</div>
                    
                    ${unit.distanceMiles ? createMapVisual(unit.distanceMiles, unit.distanceMinutes).outerHTML : '<p>No distance info</p>'}
                    
                    <div class="utilities-section">
                        ${utilitiesHTML}
                        
                        ${featureBadges}
                        
                        <div class="total-cost">
                            <span>Total Monthly Cost:</span>
                            <span>${formatCurrency(totalCost)}</span>
                        </div>
                        ${isLowestCost ? '<div class="best-value-badge"><i class="fas fa-crown"></i> Best Value</div>' : ''}
                        
                        ${oneTimeFeesHTML}
                    </div>
                </div>
            `;
        });
        
        apartmentHTML += `
            </div>
            <button class="btn-add-unit" onclick="addUnitToComplex(${aptIndex})" style="margin-top: 15px;">
                <i class="fas fa-plus"></i> Add Another Unit to ${apartment.name}
            </button>
        `;
        
        apartmentCard.innerHTML = apartmentHTML;
        apartmentsContainer.appendChild(apartmentCard);
    });
}

// Add cute floating decorations
function addCuteDecorations() {
    const decorations = ['fa-star', 'fa-heart', 'fa-home', 'fa-moon', 'fa-sun', 'fa-cloud', 'fa-house-heart', 'fa-sparkles'];
    for (let i = 0; i < 8; i++) {
        const dec = document.createElement('div');
        dec.className = 'cute-decoration';
        dec.style.top = `${Math.random() * 100}%`;
        dec.style.left = `${Math.random() * 100}%`;
        dec.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
        dec.style.opacity = `${Math.random() * 0.15 + 0.05}`;
        dec.innerHTML = `<i class="fas ${decorations[Math.floor(Math.random() * decorations.length)]}"></i>`;
        document.body.appendChild(dec);
    }
}

// Make functions available globally
window.addUnitToComplex = addUnitToComplex;
window.deleteApartment = deleteApartment;
window.deleteUnit = deleteUnit;