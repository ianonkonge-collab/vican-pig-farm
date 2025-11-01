// Initialize local storage data
if (!localStorage.getItem('pigs')) localStorage.setItem('pigs', JSON.stringify([]));
if (!localStorage.getItem('feed')) localStorage.setItem('feed', JSON.stringify([]));
if (!localStorage.getItem('sales')) localStorage.setItem('sales', JSON.stringify([]));
if (!localStorage.getItem('expenses')) localStorage.setItem('expenses', JSON.stringify([]));
if (!localStorage.getItem('schedules')) localStorage.setItem('schedules', JSON.stringify([]));

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}
function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

const form = document.getElementById('pigForm');
const pigList = document.getElementById('pigList');
const tagInput = document.getElementById('tag');
const breedInput = document.getElementById('breed');
const pigTypeInput = document.getElementById('pigType');
const ageInput = document.getElementById('age');
const weightInput = document.getElementById('weight');
const healthInput = document.getElementById('health');

function getHealthBadgeClass(health) {
  const healthLower = (health || '').toLowerCase();
  if (healthLower.includes('healthy') || healthLower.includes('good')) {
    return 'bg-green-100 text-green-800';
  } else if (healthLower.includes('treatment') || healthLower.includes('sick')) {
    return 'bg-yellow-100 text-yellow-800';
  } else if (healthLower.includes('critical') || healthLower.includes('poor')) {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-blue-100 text-blue-800';
}

function calculateAgeInDays(birthDate) {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  const diffTime = Math.abs(now - birth);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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

function renderPigs() {
  const pigs = getData('pigs');
  if (pigs.length === 0) {
    pigList.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-gray-500">
          <i class="fas fa-inbox text-4xl mb-2 block"></i>
          No animals registered yet. Add your first animal above!
        </td>
      </tr>
    `;
    return;
  }
  
  pigList.innerHTML = pigs.map(p => {
    const age = p.age || (p.birthDate ? calculateAgeInDays(p.birthDate) : 0);
    return `
    <tr class="table-row border-t">
      <td class="py-4 px-6 whitespace-nowrap">
        <div class="flex items-center">
          <div class="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
            <i class="fas fa-tag"></i>
          </div>
          <div>
            <span class="font-semibold text-gray-900">${p.tag || 'N/A'}</span>
            ${p.id ? `<span class="text-xs text-gray-500 block">ID: ${p.id}</span>` : ''}
          </div>
        </div>
      </td>
      <td class="py-4 px-6 whitespace-nowrap">
        <div>
          <span class="text-gray-700 block">${p.breed || 'Unknown'}</span>
          ${p.pigType ? `<span class="text-xs text-purple-600 font-medium">${p.pigType}</span>` : ''}
        </div>
      </td>
      <td class="py-4 px-6 whitespace-nowrap">
        <div class="flex flex-col">
          <div class="flex items-center">
            <i class="fas fa-weight text-orange-500 mr-2"></i>
            <span class="text-gray-700 font-medium">${p.weight ? p.weight.toFixed(1) : '0'} kg</span>
          </div>
          <span class="text-xs text-gray-500 mt-1">
            <i class="fas fa-birthday-cake mr-1"></i>${getAgeDisplay(age)}
          </span>
        </div>
      </td>
      <td class="py-4 px-6 whitespace-nowrap">
        <span class="health-badge ${getHealthBadgeClass(p.health)}">
          <i class="fas fa-heartbeat mr-1"></i>${p.health || 'Not specified'}
        </span>
      </td>
      <td class="py-4 px-6 whitespace-nowrap">
        <button onclick="viewPigDetails('${p.id}')" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold">
          <i class="fas fa-eye mr-1"></i>View Details
        </button>
      </td>
    </tr>`;
  }).join('');
}

window.viewPigDetails = function(pigId) {
  const pigs = getData('pigs');
  const pig = pigs.find(p => p.id === pigId);
  if (!pig) {
    alert('Pig record not found');
    return;
  }
  
  // Store selected pig for detail view
  sessionStorage.setItem('selectedPig', JSON.stringify(pig));
  window.location.href = 'pig-details.html';
};

form.addEventListener('submit', e => {
  e.preventDefault();
  const age = parseInt(ageInput.value) || 0;
  const birthDate = age > 0 ? new Date(Date.now() - age * 24 * 60 * 60 * 1000).toISOString() : null;
  
  // Generate unique ID for the pig
  function generateUniquePigId() {
    const pigs = getData('pigs');
    let newId;
    let attempts = 0;
    
    do {
      // Generate ID using timestamp + random string + counter for extra uniqueness
      newId = 'PIG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9) + '-' + attempts;
      attempts++;
    } while (pigs.some(p => p.id === newId) && attempts < 100); // Safety limit
    
    return newId;
  }
  
  const newPig = {
    id: generateUniquePigId(),
    tag: tagInput.value.trim(),
    breed: breedInput.value.trim(),
    pigType: pigTypeInput.value || 'Unknown',
    age: age,
    birthDate: birthDate,
    weight: parseFloat(weightInput.value) || 0,
    health: healthInput.value.trim() || 'Not specified',
    dateAdded: new Date().toISOString(),
    weightHistory: [{ date: new Date().toISOString(), weight: parseFloat(weightInput.value) || 0 }],
    feedingHistory: [],
    vetCheckups: [],
    notes: ''
  };
  
  if (!newPig.tag) {
    alert('Please enter a tag number');
    return;
  }
  
  const pigs = getData('pigs');
  
  // Check if tag already exists
  if (pigs.some(p => p.tag === newPig.tag)) {
    alert('An animal with this tag number already exists!');
    return;
  }
  
  // Ensure ID is unique (double check)
  if (pigs.some(p => p.id === newPig.id)) {
    newPig.id = generateUniquePigId();
  }
  
  pigs.push(newPig);
  setData('pigs', pigs);
  
  // Generate feeding schedules for Breeding Sows and Gilts
  if (newPig.pigType === 'Breeding Sow' || newPig.pigType === 'Gilt') {
    generateFeedingSchedulesForPig(newPig);
  }
  
  // Show success animation
  const btn = form.querySelector('button');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check mr-2"></i>Added!';
  btn.classList.add('bg-green-600');
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.classList.remove('bg-green-600');
  }, 1500);
  
  form.reset();
  renderPigs();
});

function generateFeedingSchedulesForPig(pig) {
  const schedules = getData('schedules');
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  
  // Determine feed amount based on pig type
  const feedAmount = pig.pigType === 'Breeding Sow' ? 1.5 : 1.25;
  const feedType = pig.pigType === 'Breeding Sow' ? 'Pregnant Sow Feed' : 'Gilt Feed';
  const isPregnantSowFeed = pig.pigType === 'Breeding Sow';
  const isGiltFeed = pig.pigType === 'Gilt';
  
  // Generate daily feeding schedules at 7:00 AM and 2:30 PM for next 30 days
  const feedingTimes = ['07:00', '14:30'];
  
  feedingTimes.forEach(time => {
    for (let d = new Date(today + 'T' + time); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if schedule already exists
      const exists = schedules.some(s => 
        s.date === dateStr && 
        s.time === time && 
        s.type === 'feeding' &&
        s.pigId === pig.id
      );
      
      if (!exists) {
        const feedingSchedule = {
          id: 'AUTO-FEED-' + pig.id + '-' + time.replace(':', '') + '-' + d.getTime(),
          type: 'feeding',
          pigType: pig.pigType,
          pigId: pig.id,
          date: dateStr,
          time: time,
          feedAmount: feedAmount,
          feedType: feedType,
          notes: `Daily feeding for ${pig.tag} - ${feedAmount}kg`,
          recurrence: 'daily',
          autoSchedule: true,
          isPregnantSowFeed: isPregnantSowFeed,
          isGiltFeed: isGiltFeed,
          completed: false,
          createdAt: new Date().toISOString()
        };
        schedules.push(feedingSchedule);
      }
    }
  });
  
  setData('schedules', schedules);
}

renderPigs();

