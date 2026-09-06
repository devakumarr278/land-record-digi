import React from 'react';

export const REGION_DATA = [
  {
    state: "Tamil Nadu",
    center: [76.9558, 11.0168],
    zoom: 16.2,
    districts: [
      { name: "Coimbatore", center: [76.9558, 11.0168], zoom: 16.2 },
      { name: "Tiruppur", center: [77.3411, 11.1085], zoom: 15.5 },
      { name: "Erode", center: [77.7172, 11.3410], zoom: 15.5 },
      { name: "Salem", center: [78.1460, 11.6643], zoom: 15.5 },
      { name: "Chennai", center: [80.2707, 13.0827], zoom: 15.0 },
      { name: "Madurai", center: [78.1198, 9.9252], zoom: 15.5 },
      { name: "Dindigul", center: [77.9803, 10.3673], zoom: 15.5 },
      { name: "Thanjavur", center: [79.1378, 10.7870], zoom: 15.5 },
      { name: "Tiruchirappalli", center: [78.7047, 10.7905], zoom: 15.5 },
      { name: "Kanchipuram", center: [79.7036, 12.8342], zoom: 15.5 }
    ]
  },
  {
    state: "Karnataka",
    center: [77.5946, 12.9716],
    zoom: 15.0,
    districts: [
      { name: "Bengaluru Urban", center: [77.5946, 12.9716], zoom: 15.0 },
      { name: "Mysuru", center: [76.6394, 12.2958], zoom: 15.5 },
      { name: "Belagavi", center: [74.4977, 15.8497], zoom: 15.5 },
      { name: "Tumakuru", center: [77.1010, 13.3379], zoom: 15.5 },
      { name: "Dakshina Kannada", center: [74.8560, 12.9141], zoom: 15.5 },
      { name: "Dharwad", center: [75.0078, 15.4589], zoom: 15.5 }
    ]
  },
  {
    state: "Maharashtra",
    center: [73.8567, 18.5204],
    zoom: 15.0,
    districts: [
      { name: "Pune", center: [73.8567, 18.5204], zoom: 15.0 },
      { name: "Mumbai Suburban", center: [72.8777, 19.0760], zoom: 14.8 },
      { name: "Nagpur", center: [79.0882, 21.1458], zoom: 15.5 },
      { name: "Nashik", center: [73.7898, 19.9975], zoom: 15.5 },
      { name: "Thane", center: [72.9781, 19.2183], zoom: 15.2 },
      { name: "Kolhapur", center: [74.2433, 16.7050], zoom: 15.5 }
    ]
  },
  {
    state: "Andhra Pradesh",
    center: [80.6480, 16.5062],
    zoom: 15.0,
    districts: [
      { name: "Visakhapatnam", center: [83.2185, 17.6868], zoom: 15.0 },
      { name: "Krishna", center: [80.6480, 16.5062], zoom: 15.5 },
      { name: "Guntur", center: [80.4365, 16.3067], zoom: 15.5 },
      { name: "Chittoor", center: [79.1003, 13.2172], zoom: 15.5 },
      { name: "Kurnool", center: [78.0373, 15.8281], zoom: 15.5 }
    ]
  },
  {
    state: "Telangana",
    center: [78.4867, 17.3850],
    zoom: 15.0,
    districts: [
      { name: "Hyderabad", center: [78.4867, 17.3850], zoom: 15.0 },
      { name: "Ranga Reddy", center: [78.4340, 17.2403], zoom: 15.0 },
      { name: "Warangal", center: [79.5941, 17.9689], zoom: 15.5 },
      { name: "Karimnagar", center: [79.1288, 18.4386], zoom: 15.5 }
    ]
  },
  {
    state: "Kerala",
    center: [76.2673, 9.9312],
    zoom: 15.0,
    districts: [
      { name: "Palakkad", center: [76.6548, 10.7867], zoom: 15.5 },
      { name: "Ernakulam", center: [76.2673, 9.9312], zoom: 15.0 },
      { name: "Thiruvananthapuram", center: [76.9366, 8.5241], zoom: 15.0 },
      { name: "Kozhikode", center: [75.7804, 11.2588], zoom: 15.5 }
    ]
  },
  {
    state: "Gujarat",
    center: [72.5714, 23.0225],
    zoom: 15.0,
    districts: [
      { name: "Ahmedabad", center: [72.5714, 23.0225], zoom: 15.0 },
      { name: "Surat", center: [72.8311, 21.1702], zoom: 15.0 },
      { name: "Vadodara", center: [73.1812, 22.3072], zoom: 15.5 },
      { name: "Rajkot", center: [70.8022, 22.3039], zoom: 15.5 }
    ]
  },
  {
    state: "Uttar Pradesh",
    center: [80.9462, 26.8467],
    zoom: 15.0,
    districts: [
      { name: "Lucknow", center: [80.9462, 26.8467], zoom: 15.0 },
      { name: "Varanasi", center: [82.9739, 25.3176], zoom: 15.0 },
      { name: "Agra", center: [78.0081, 27.1767], zoom: 15.0 },
      { name: "Kanpur Nagar", center: [80.3319, 26.4499], zoom: 15.0 },
      { name: "Prayagraj", center: [81.8463, 25.4358], zoom: 15.0 }
    ]
  },
  {
    state: "West Bengal",
    center: [88.3639, 22.5726],
    zoom: 15.0,
    districts: [
      { name: "Kolkata", center: [88.3639, 22.5726], zoom: 15.0 },
      { name: "North 24 Parganas", center: [88.5200, 22.7200], zoom: 15.0 },
      { name: "Howrah", center: [88.2636, 22.5958], zoom: 15.0 },
      { name: "Darjeeling", center: [88.2627, 27.0410], zoom: 15.0 }
    ]
  }
];

export default function RegionSelector({ 
  selectedState = "Tamil Nadu", 
  selectedDistrict = "Coimbatore", 
  onStateChange, 
  onDistrictChange 
}) {
  const currentStateObj = REGION_DATA.find(r => r.state === selectedState) || REGION_DATA[0];
  const availableDistricts = currentStateObj.districts || [];

  const handleStateSelect = (e) => {
    const newState = e.target.value;
    const stateObj = REGION_DATA.find(r => r.state === newState);
    if (stateObj) {
      onStateChange(newState);
      if (stateObj.districts.length > 0) {
        onDistrictChange(stateObj.districts[0].name, stateObj.districts[0]);
      }
    }
  };

  const handleDistrictSelect = (e) => {
    const newDistrictName = e.target.value;
    const distObj = availableDistricts.find(d => d.name === newDistrictName);
    onDistrictChange(newDistrictName, distObj);
  };

  return (
    <div className="gis-region-selector-group">
      {/* State Selector */}
      <div className="gis-select-wrapper state-wrapper">
        <span className="gis-select-icon">📍</span>
        <select 
          className="gis-select-input" 
          value={selectedState} 
          onChange={handleStateSelect}
          aria-label="Select State"
        >
          {REGION_DATA.map(r => (
            <option key={r.state} value={r.state}>
              {r.state}
            </option>
          ))}
        </select>
        <span className="gis-select-arrow">▼</span>
      </div>

      {/* District Selector */}
      <div className="gis-select-wrapper district-wrapper">
        <span className="gis-select-icon">🏛️</span>
        <select 
          className="gis-select-input" 
          value={selectedDistrict} 
          onChange={handleDistrictSelect}
          aria-label="Select District"
        >
          {availableDistricts.map(d => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <span className="gis-select-arrow">▼</span>
      </div>
    </div>
  );
}
