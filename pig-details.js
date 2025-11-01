// Initialize local storage data
if (!localStorage.getItem('pigs')) localStorage.setItem('pigs', JSON.stringify([]));
if (!localStorage.getItem('schedules')) localStorage.setItem('schedules', JSON.stringify([]));

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getAgeDisplay(age) {
  if (!age || age === 0) return 'Unknown';
  if (age < 30) return `${age} days`;
  const months = Math.floor(age / 30);
  const days = age % 30;
  if (months < 12) {
    return days > 0 ? `${months}mo ${days}d` : `${months} months`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years} years`;
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const pigData = sessionStorage.getItem('selectedPig');
  
  if (!pigData) {
    document.getElementById('pigDetailsContainer').innerHTML = `
      <div class="glass-effect rounded-2xl professional-shadow p-8 text-center">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Pig Not Found</h2>
        <p class="text-gray-600 mb-4">No pig data available. Please select a pig from the animals page.</p>
        <a href="pigs.html" class="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl">
          <i class="fas fa-arrow-left mr-2"></i>Back to Animals
        </a>
      </div>
    `;
    return;
  }
  
  const pig = JSON.parse(pigData);
  renderPigDetails(pig);
});

function renderPigDetails(pig) {
  const schedules = getData('schedules');
  const pigSchedules = schedules.filter(s => s.pigId === pig.id);
  
  const age = pig.age || 0;
  const currentWeight = pig.weightHistory && pig.weightHistory.length > 0 
    ? pig.weightHistory[pig.weightHistory.length - 1].weight 
    : pig.weight || 0;
  
  document.getElementById('pigDetailsContainer').innerHTML = `
    <div class="glass-effect rounded-2xl professional-shadow p-8 mb-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <div class="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl">
            <i class="fas fa-paw text-white text-4xl"></i>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-800">${pig.tag || 'Unnamed'}</h1>
            <p class="text-gray-600">ID: ${pig.id || 'N/A'}</p>
          </div>
        </div>
        <button onclick="editPigDetails('${pig.id}')" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
          <i class="fas fa-edit mr-2"></i>Edit Details
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="info-card bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-600 font-medium">Breed</span>
            <i class="fas fa-dna text-2xl text-blue-600"></i>
          </div>
          <p class="text-2xl font-bold text-gray-800">${pig.breed || 'Unknown'}</p>
        </div>
        
        <div class="info-card bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-600 font-medium">Type</span>
            <i class="fas fa-fingerprint text-2xl text-purple-600"></i>
          </div>
          <p class="text-2xl font-bold text-gray-800">${pig.pigType || 'Unknown'}</p>
        </div>
        
        <div class="info-card bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-600 font-medium">Weight</span>
            <i class="fas fa-weight text-2xl text-orange-600"></i>
          </div>
          <p class="text-2xl font-bold text-gray-800">${currentWeight.toFixed(1)} kg</p>
        </div>
        
        <div class="info-card bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-600 font-medium">Age</span>
            <i class="fas fa-birthday-cake text-2xl text-green-600"></i>
          </div>
          <p class="text-2xl font-bold text-gray-800">${getAgeDisplay(age)}</p>
        </div>
        
        <div class="info-card bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-600 font-medium">Health</span>
            <i class="fas fa-heartbeat text-2xl text-pink-600"></i>
          </div>
          <p class="text-2xl font-bold text-gray-800">${pig.health || 'Not specified'}</p>
        </div>
        
        <div class="info-card bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-600 font-medium">Date Added</span>
            <i class="fas fa-calendar text-2xl text-gray-600"></i>
          </div>
          <p class="text-lg font-bold text-gray-800">${formatDate(pig.dateAdded)}</p>
        </div>
      </div>
    </div>
    
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="glass-effect rounded-2xl professional-shadow p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-weight text-purple-600 mr-2"></i>Weight History
        </h2>
        <div id="weightHistory" class="space-y-2">
          ${renderWeightHistory(pig.weightHistory || [])}
        </div>
        <button onclick="addWeightRecord('${pig.id}')" class="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
          <i class="fas fa-plus mr-2"></i>Add Weight Record
        </button>
      </div>
      
      <div class="glass-effect rounded-2xl professional-shadow p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-calendar-alt text-purple-600 mr-2"></i>Upcoming Schedules
        </h2>
        <div id="upcomingSchedules" class="space-y-2">
          ${renderUpcomingSchedules(pigSchedules)}
        </div>
        ${pigSchedules.length === 0 ? `
          <a href="schedule.html" class="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
            <i class="fas fa-plus mr-2"></i>Create Schedule
          </a>
        ` : ''}
      </div>
    </div>
    
    <div class="glass-effect rounded-2xl professional-shadow p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-sticky-note text-purple-600 mr-2"></i>Notes
      </h2>
      <div id="notesSection">
        <textarea id="pigNotes" rows="4" class="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-purple-500 mb-4">${pig.notes || ''}</textarea>
        <button onclick="saveNotes('${pig.id}')" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
          <i class="fas fa-save mr-2"></i>Save Notes
        </button>
      </div>
    </div>
  `;
}

function renderWeightHistory(history) {
  if (!history || history.length === 0) {
    return '<p class="text-gray-500 text-sm">No weight records yet</p>';
  }
  
  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  return sorted.slice(0, 5).map(record => `
    <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
      <span class="text-gray-700">${formatDate(record.date)}</span>
      <span class="font-bold text-gray-800">${record.weight.toFixed(1)} kg</span>
    </div>
  `).join('');
}

function renderUpcomingSchedules(schedules) {
  if (!schedules || schedules.length === 0) {
    return '<p class="text-gray-500 text-sm">No upcoming schedules</p>';
  }
  
  const upcoming = schedules
    .filter(s => !s.completed)
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .slice(0, 5);
  
  if (upcoming.length === 0) {
    return '<p class="text-gray-500 text-sm">No upcoming schedules</p>';
  }
  
  return upcoming.map(s => {
    const date = new Date(s.date + 'T' + s.time);
    return `
      <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
        <div>
          <span class="font-semibold text-gray-800 capitalize">${s.type}</span>
          <p class="text-xs text-gray-600">${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</p>
        </div>
        ${s.type === 'feeding' && s.feedAmount ? `<span class="text-sm text-green-600 font-medium">${s.feedAmount} kg</span>` : ''}
      </div>
    `;
  }).join('');
}

function addWeightRecord(pigId) {
  const weight = prompt('Enter new weight (kg):');
  if (!weight || isNaN(parseFloat(weight))) {
    alert('Please enter a valid weight');
    return;
  }
  
  const pigs = getData('pigs');
  const pig = pigs.find(p => p.id === pigId);
  
  if (!pig) return;
  
  if (!pig.weightHistory) pig.weightHistory = [];
  pig.weightHistory.push({
    date: new Date().toISOString(),
    weight: parseFloat(weight)
  });
  
  pig.weight = parseFloat(weight);
  
  const index = pigs.findIndex(p => p.id === pigId);
  pigs[index] = pig;
  setData('pigs', pigs);
  
  sessionStorage.setItem('selectedPig', JSON.stringify(pig));
  renderPigDetails(pig);
}

function saveNotes(pigId) {
  const notes = document.getElementById('pigNotes').value;
  const pigs = getData('pigs');
  const pig = pigs.find(p => p.id === pigId);
  
  if (!pig) return;
  
  pig.notes = notes;
  const index = pigs.findIndex(p => p.id === pigId);
  pigs[index] = pig;
  setData('pigs', pigs);
  
  sessionStorage.setItem('selectedPig', JSON.stringify(pig));
  alert('Notes saved successfully!');
}

function editPigDetails(pigId) {
  // In a real app, this would open an edit modal
  alert('Edit functionality - Update weight, health status, etc. This can be expanded with a full edit form.');
}

