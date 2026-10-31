// Mock data for realistic fallback and seamless offline demo experience

export const MOCK_USER = {
  id: "usr_78912",
  fullName: "Priya Sharma",
  email: "priya.sharma@example.com",
  phone: "+91 98765 43210",
  safetyScore: 78,
  status: "Safe",
  bloodGroup: "B+",
  emergencyPin: "9912",
  homeAddress: "Sector 15, Rohini, New Delhi",
  workAddress: "Barakhamba Road, Connaught Place, Central Delhi",
  locationSharing: true,
  currentLocation: {
    name: "Thakur Village, Kandivali East, Mumbai",
    lat: 19.21386,
    lng: 72.86698,
    accuracy: 12,
    timestamp: new Date().toISOString()
  }
};

export const MOCK_EMERGENCY_CONTACTS = [
  {
    id: "cnt_1",
    name: "Rajesh Sharma (Father)",
    relationship: "Parent",
    phone: "+91 98111 22334",
    isPrimary: true,
    verified: true,
    notifyOnSOS: true
  },
  {
    id: "cnt_2",
    name: "Ananya Verma (Sister)",
    relationship: "Sibling",
    phone: "+91 98222 33445",
    isPrimary: false,
    verified: true,
    notifyOnSOS: true
  },
  {
    id: "cnt_3",
    name: "Kabir Malhotra (Friend)",
    relationship: "Friend",
    phone: "+91 98333 44556",
    isPrimary: false,
    verified: true,
    notifyOnSOS: true
  }
];

export const MOCK_ROUTES = [
  {
    id: "rt_safe_01",
    name: "Via Janpath & Aurobindo Marg (Safest Route)",
    tag: "RECOMMENDED",
    tagType: "safe", // 'safe' | 'balanced' | 'risky'
    distanceKm: 14.2,
    etaMinutes: 32,
    safetyScore: 92,
    riskLevel: "Low Risk",
    description: "Highest lighting density, active police PCR vans every 12 mins, and 4 verified 24/7 safe havens.",
    color: "#10B981", // Emerald Green
    lightingScore: 96,
    cctvCoverage: "94% Density",
    patrolFrequency: "Every 15 min",
    trafficLevel: "Moderate (Flowing)",
    hazardsCount: 0,
    coordinates: [
      [28.6315, 77.2167], // Connaught Place
      [28.6250, 77.2185], // Janpath
      [28.6120, 77.2110], // Rajpath / Central Vista
      [28.5950, 77.2090], // Safdarjung Tomb
      [28.5800, 77.2150], // INA / Dilli Haat
      [28.5670, 77.2080], // AIIMS Hospital
      [28.5450, 77.2060], // Hauz Khas
      [28.5280, 77.2050]  // Saket District Centre
    ],
    steps: [
      { id: 1, instruction: "Head south on Radial Road 1 toward Janpath", distance: "400 m", turn: "straight" },
      { id: 2, instruction: "Continue straight on Janpath Road (Well-lit)", distance: "1.2 km", turn: "straight" },
      { id: 3, instruction: "Turn slight right onto Aurobindo Marg", distance: "3.5 km", turn: "right" },
      { id: 4, instruction: "Pass AIIMS 24/7 Police Checkpost (Safe Haven)", distance: "2.1 km", turn: "straight" },
      { id: 5, instruction: "Continue past Hauz Khas main arterial", distance: "4.8 km", turn: "straight" },
      { id: 6, instruction: "Arrive at Saket District Centre destination", distance: "200 m", turn: "destination" }
    ],
    safetyBreakdown: {
      crimeRiskScore: 12, // 12/100 (Lower is safer)
      streetLightingScore: 96,
      liveTrafficScore: 84,
      accidentProneScore: 14,
      policePresenceScore: 92,
      crowdDensityScore: 88,
      verifiedSafeHavens: 4,
      womenHelpbooths: 3
    },
    weather: {
      tempC: 24,
      condition: "Clear Sky",
      precipitationChance: 0,
      visibilityKm: 9.8,
      windSpeedKmh: 11,
      airQuality: "Moderate (AQI 142)"
    }
  },
  {
    id: "rt_balanced_02",
    name: "Via Ring Road & Barapullah Elevated",
    tag: "BALANCED",
    tagType: "balanced",
    distanceKm: 12.6,
    etaMinutes: 26,
    safetyScore: 78,
    riskLevel: "Moderate Risk",
    description: "Fast arterial road, good lighting on elevated stretch, but fewer pedestrian safe shelters.",
    color: "#F59E0B", // Amber Yellow
    lightingScore: 78,
    cctvCoverage: "71% Density",
    patrolFrequency: "Every 30 min",
    trafficLevel: "Heavy near Lajpat Nagar",
    hazardsCount: 1,
    coordinates: [
      [28.6315, 77.2167],
      [28.6280, 77.2280], // Barakhamba
      [28.6050, 77.2450], // Pragati Maidan
      [28.5830, 77.2420], // Nizamuddin
      [28.5690, 77.2340], // Barapullah flyover
      [28.5490, 77.2210], // South Ext
      [28.5280, 77.2050]  // Saket
    ],
    steps: [
      { id: 1, instruction: "Head east on Barakhamba Road toward Mandi House", distance: "800 m", turn: "straight" },
      { id: 2, instruction: "Merge onto Barapullah Elevated Corridor", distance: "4.2 km", turn: "right" },
      { id: 3, instruction: "Caution: Reduced CCTV coverage on flyover ramp", distance: "1.5 km", turn: "straight", alert: true },
      { id: 4, instruction: "Exit toward Ring Road South Extension", distance: "3.1 km", turn: "left" },
      { id: 5, instruction: "Turn right onto Press Enclave Marg", distance: "2.8 km", turn: "right" },
      { id: 6, instruction: "Arrive at Saket District Centre destination", distance: "200 m", turn: "destination" }
    ],
    safetyBreakdown: {
      crimeRiskScore: 32,
      streetLightingScore: 78,
      liveTrafficScore: 68,
      accidentProneScore: 38,
      policePresenceScore: 65,
      crowdDensityScore: 70,
      verifiedSafeHavens: 2,
      womenHelpbooths: 1
    },
    weather: {
      tempC: 24,
      condition: "Clear Sky",
      precipitationChance: 0,
      visibilityKm: 9.8,
      windSpeedKmh: 11,
      airQuality: "Moderate (AQI 142)"
    }
  },
  {
    id: "rt_fastest_03",
    name: "Via Mehrauli-Badarpur Backlink Road",
    tag: "FASTEST (UNSAFE)",
    tagType: "risky",
    distanceKm: 9.8,
    etaMinutes: 20,
    safetyScore: 62,
    riskLevel: "High Risk",
    description: "Shortest route, but contains 2 poorly lit forested stretches, isolated underpasses, and high crime incident history after 8 PM.",
    color: "#EF4444", // Emergency Red
    lightingScore: 48,
    cctvCoverage: "38% Density",
    patrolFrequency: "Infrequent (over 60 min)",
    trafficLevel: "Low / Isolated",
    hazardsCount: 3,
    coordinates: [
      [28.6315, 77.2167],
      [28.6180, 77.2050],
      [28.5900, 77.1950], // Chanakyapuri back alley
      [28.5600, 77.1800], // Sanjay Van peripheral
      [28.5400, 77.1900], // Mehrauli isolated bypass
      [28.5280, 77.2050]  // Saket
    ],
    steps: [
      { id: 1, instruction: "Head southwest via service road", distance: "600 m", turn: "straight" },
      { id: 2, instruction: "Turn onto secondary unlit link road", distance: "2.4 km", turn: "left", alert: true },
      { id: 3, instruction: "Warning: Poorly lit 800m stretch ahead. Stay alert", distance: "1.8 km", turn: "straight", alert: true },
      { id: 4, instruction: "Isolated forested bypass road (Sanjay Van stretch)", distance: "3.2 km", turn: "right", alert: true },
      { id: 5, instruction: "Re-enter urban corridor onto MB Road", distance: "1.6 km", turn: "left" },
      { id: 6, instruction: "Arrive at Saket District Centre destination", distance: "200 m", turn: "destination" }
    ],
    safetyBreakdown: {
      crimeRiskScore: 68,
      streetLightingScore: 48,
      liveTrafficScore: 90,
      accidentProneScore: 58,
      policePresenceScore: 35,
      crowdDensityScore: 22,
      verifiedSafeHavens: 0,
      womenHelpbooths: 0
    },
    weather: {
      tempC: 24,
      condition: "Clear Sky",
      precipitationChance: 0,
      visibilityKm: 8.5,
      windSpeedKmh: 9,
      airQuality: "Moderate (AQI 142)"
    }
  }
];

export const MOCK_EMERGENCY_SERVICES = [
  {
    id: "srv_pol_01",
    name: "Connaught Place Police Station & Women Desk",
    type: "police",
    categoryLabel: "Police Station",
    distanceKm: 0.6,
    etaMinutes: 3,
    address: "Block B, Outer Circle, Connaught Place, New Delhi",
    phone: "+91 11 2341 2233",
    helpline: "112 / 1091",
    lat: 28.6328,
    lng: 77.2195,
    verified: true,
    open24x7: true,
    badges: ["Women Helpdesk", "PCR Van Stand", "24x7 Duty Officer"]
  },
  {
    id: "srv_hosp_01",
    name: "Dr. Ram Manohar Lohia (RML) Hospital",
    type: "hospital",
    categoryLabel: "Hospital (Emergency)",
    distanceKm: 1.4,
    etaMinutes: 5,
    address: "Baba Kharak Singh Marg, Connaught Place, New Delhi",
    phone: "+91 11 2336 5525",
    helpline: "102 / 108",
    lat: 28.6250,
    lng: 77.2025,
    verified: true,
    open24x7: true,
    badges: ["Trauma ICU", "Ambulance Bay", "Blood Bank"]
  },
  {
    id: "srv_fire_01",
    name: "Connaught Circus Fire Station",
    type: "fire",
    categoryLabel: "Fire Station",
    distanceKm: 0.9,
    etaMinutes: 4,
    address: "Barakhamba Road / Fire Brigade Lane, New Delhi",
    phone: "+91 11 2341 4000",
    helpline: "101",
    lat: 28.6310,
    lng: 77.2255,
    verified: true,
    open24x7: true,
    badges: ["Fast Rescue Unit", "Chemical Hazard Unit"]
  },
  {
    id: "srv_pharm_01",
    name: "Apollo Pharmacy 24x7 Health & Wellness",
    type: "pharmacy",
    categoryLabel: "24x7 Pharmacy",
    distanceKm: 0.4,
    etaMinutes: 2,
    address: "Radial Road 4, Janpath Market, Connaught Place",
    phone: "+91 11 4151 7788",
    helpline: "1860 500 0101",
    lat: 28.6295,
    lng: 77.2180,
    verified: true,
    open24x7: true,
    badges: ["First Aid Ready", "Emergency O2", "Female Staff"]
  },
  {
    id: "srv_women_01",
    name: "Delhi Commission for Women (DCW) Safe Zone",
    type: "women_desk",
    categoryLabel: "Women Helpdesk",
    distanceKm: 1.1,
    etaMinutes: 4,
    address: "Vikas Bhawan, Near ITO Metro, New Delhi",
    phone: "+91 11 2337 9181",
    helpline: "181 (Women in Distress)",
    lat: 28.6288,
    lng: 77.2405,
    verified: true,
    open24x7: true,
    badges: ["Legal Counseling", "Emergency Escort", "Safe Haven"]
  },
  {
    id: "srv_pol_02",
    name: "Parliament Street Police Headquarters",
    type: "police",
    categoryLabel: "Police Station",
    distanceKm: 1.8,
    etaMinutes: 6,
    address: "Sansad Marg, Janpath, New Delhi",
    phone: "+91 11 2374 5555",
    helpline: "112",
    lat: 28.6210,
    lng: 77.2130,
    verified: true,
    open24x7: true,
    badges: ["Command Control Center", "Quick Reaction Team"]
  }
];

export const MOCK_SEARCH_PRESETS = [
  { label: "Connaught Place, Central Delhi", lat: 28.6315, lng: 77.2167 },
  { label: "Saket District Centre, South Delhi", lat: 28.5280, lng: 77.2050 },
  { label: "Delhi University North Campus", lat: 28.6890, lng: 77.2090 },
  { label: "Cyber City, DLF Phase 2, Gurugram", lat: 28.4950, lng: 77.0890 },
  { label: "Noida Electronic City, Sector 62", lat: 28.6280, lng: 77.3680 },
  { label: "Hauz Khas Social / Village Hub", lat: 28.5490, lng: 77.1950 },
  { label: "Indira Gandhi International Airport (T3)", lat: 28.5562, lng: 77.1000 }
];
