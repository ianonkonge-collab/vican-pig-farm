// Initialize local storage data
if (!localStorage.getItem('schedules')) localStorage.setItem('schedules', JSON.stringify([]));
if (!localStorage.getItem('pigs')) localStorage.setItem('pigs', JSON.stringify([]));
if (localStorage.getItem('autoSchedulesInitialized') !== 'true') {
  initializeAutoSchedules();
  localStorage.setItem('autoSchedulesInitialized', 'true');
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function initializeAutoSchedules() {
  const schedules = getData('schedules');
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Check if auto schedules already exist
  const existingAutoSchedules = schedules.filter(s => s.autoSchedule === true);
  if (existingAutoSchedules.length > 0) {
    return; // Already initialized
  }
  
  // Daily cleaning at 11:00 AM
  const morningCleaning = {
    id: 'AUTO-SCH-CLEAN-11AM-' + Date.now(),
    type: 'cleaning',
    pigId: null,
    date: todayStr,
    time: '11:00',
    notes: 'Daily morning cleaning',
    recurrence: 'daily',
    completed: false,
    autoSchedule: true,
    createdAt: new Date().toISOString()
  };
  
  // Daily cleaning at 4:00 PM
  const afternoonCleaning = {
    id: 'AUTO-SCH-CLEAN-4PM-' + Date.now() + 1,
    type: 'cleaning',
    pigId: null,
    date: todayStr,
    time: '16:00',
    notes: 'Daily afternoon cleaning',
    recurrence: 'daily',
    completed: false,
    autoSchedule: true,
    createdAt: new Date().toISOString()
  };
  
  // Daily manure removal
  const manureRemoval = {
    id: 'AUTO-SCH-MANURE-DAILY-' + Date.now() + 2,
    type: 'cleaning',
    pigId: null,
    date: todayStr,
    time: '08:00',
    notes: 'Daily manure removal',
    recurrence: 'daily',
    autoSchedule: true,
    isManureRemoval: true,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  // Deep cleaning with water and disinfectant every 3 days
  const deepCleaning = {
    id: 'AUTO-SCH-DEEP-CLEAN-' + Date.now() + 3,
    type: 'cleaning',
    pigId: null,
    date: todayStr,
    time: '10:00',
    notes: 'Deep cleaning with water and disinfectant',
    recurrence: 'every3days',
    autoSchedule: true,
    isDeepCleaning: true,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  // Automated feeding schedules for Pregnant Sows - 7:00 AM (1.5kg each)
  const pregnantSowMorningFeed = {
    id: 'AUTO-SCH-FEED-PREGNANT-7AM-' + Date.now() + 4,
    type: 'feeding',
    pigType: 'Breeding Sow',
    pigId: null,
    date: todayStr,
    time: '07:00',
    feedAmount: 1.5,
    feedType: 'Pregnant Sow Feed',
    notes: 'Daily morning feeding for pregnant sows - 1.5kg each',
    recurrence: 'daily',
    autoSchedule: true,
    isPregnantSowFeed: true,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  // Automated feeding schedules for Pregnant Sows - 2:30 PM (1.5kg each)
  const pregnantSowAfternoonFeed = {
    id: 'AUTO-SCH-FEED-PREGNANT-230PM-' + Date.now() + 5,
    type: 'feeding',
    pigType: 'Breeding Sow',
    pigId: null,
    date: todayStr,
    time: '14:30',
    feedAmount: 1.5,
    feedType: 'Pregnant Sow Feed',
    notes: 'Daily afternoon feeding for pregnant sows - 1.5kg each',
    recurrence: 'daily',
    autoSchedule: true,
    isPregnantSowFeed: true,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  // Automated feeding schedules for Gilts - 7:00 AM (1.25kg each)
  const giltMorningFeed = {
    id: 'AUTO-SCH-FEED-GILT-7AM-' + Date.now() + 6,
    type: 'feeding',
    pigType: 'Gilt',
    pigId: null,
    date: todayStr,
    time: '07:00',
    feedAmount: 1.25,
    feedType: 'Gilt Feed',
    notes: 'Daily morning feeding for gilts - 1.25kg each',
    recurrence: 'daily',
    autoSchedule: true,
    isGiltFeed: true,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  // Automated feeding schedules for Gilts - 2:30 PM (1.25kg each)
  const giltAfternoonFeed = {
    id: 'AUTO-SCH-FEED-GILT-230PM-' + Date.now() + 7,
    type: 'feeding',
    pigType: 'Gilt',
    pigId: null,
    date: todayStr,
    time: '14:30',
    feedAmount: 1.25,
    feedType: 'Gilt Feed',
    notes: 'Daily afternoon feeding for gilts - 1.25kg each',
    recurrence: 'daily',
    autoSchedule: true,
    isGiltFeed: true,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  schedules.push(morningCleaning, afternoonCleaning, manureRemoval, deepCleaning,
                pregnantSowMorningFeed, pregnantSowAfternoonFeed,
                giltMorningFeed, giltAfternoonFeed);
  setData('schedules', schedules);
  
  // Generate next 30 days of recurring schedules
  generateRecurringSchedules();
}

let currentFilters = { type: 'all', status: 'all', date: '' };

function generateRecurringSchedules() {
  const schedules = getData('schedules');
  const pigs = getData('pigs');
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30); // Generate for next 30 days
  
  // Get all auto-scheduled recurring tasks
  const autoTasks = schedules.filter(s => s.autoSchedule === true && s.recurrence && s.recurrence !== 'none');
  
  autoTasks.forEach(baseTask => {
    const baseDate = new Date(baseTask.date + 'T' + baseTask.time);
    
    // Check if this is a pig-type-specific feeding schedule
    if (baseTask.pigType && (baseTask.isPregnantSowFeed || baseTask.isGiltFeed)) {
      // Get all pigs of this type
      const matchingPigs = pigs.filter(p => p.pigType === baseTask.pigType);
      
      // Generate schedules for each matching pig
      matchingPigs.forEach(pig => {
        for (let d = new Date(baseDate); d <= maxDate; ) {
          const dateStr = d.toISOString().split('T')[0];
          
          // Check if schedule already exists for this pig and date
          const exists = schedules.some(s => 
            s.date === dateStr && 
            s.time === baseTask.time && 
            s.type === baseTask.type &&
            s.pigId === pig.id &&
            (baseTask.isPregnantSowFeed ? s.isPregnantSowFeed : false) &&
            (baseTask.isGiltFeed ? s.isGiltFeed : false)
          );
          
          if (!exists && d >= today) {
            const newSchedule = {
              ...baseTask,
              id: 'AUTO-' + baseTask.id + '-' + pig.id + '-' + d.getTime(),
              pigId: pig.id,
              date: dateStr,
              completed: false,
              completedAt: null
            };
            schedules.push(newSchedule);
          }
          
          // Move to next occurrence
          if (baseTask.recurrence === 'daily') {
            d.setDate(d.getDate() + 1);
          } else if (baseTask.recurrence === 'every3days') {
            d.setDate(d.getDate() + 3);
          } else if (baseTask.recurrence === 'weekly') {
            d.setDate(d.getDate() + 7);
          } else if (baseTask.recurrence === 'monthly') {
            d.setMonth(d.getMonth() + 1);
          } else {
            break;
          }
        }
      });
    } else {
      // Regular recurring schedule (cleaning, etc.)
      for (let d = new Date(baseDate); d <= maxDate; ) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Check if schedule already exists for this date
        const exists = schedules.some(s => 
          s.date === dateStr && 
          s.time === baseTask.time && 
          s.type === baseTask.type &&
          (baseTask.isManureRemoval ? s.isManureRemoval : !s.isManureRemoval) &&
          (baseTask.isDeepCleaning ? s.isDeepCleaning : !s.isDeepCleaning) &&
          !s.pigId // General schedules don't have pigId
        );
        
        if (!exists && d >= today) {
          const newSchedule = {
            ...baseTask,
            id: 'AUTO-' + baseTask.id + '-' + d.getTime(),
            date: dateStr,
            completed: false,
            completedAt: null
          };
          schedules.push(newSchedule);
        }
        
        // Move to next occurrence
        if (baseTask.recurrence === 'daily') {
          d.setDate(d.getDate() + 1);
        } else if (baseTask.recurrence === 'every3days') {
          d.setDate(d.getDate() + 3);
        } else if (baseTask.recurrence === 'weekly') {
          d.setDate(d.getDate() + 7);
        } else if (baseTask.recurrence === 'monthly') {
          d.setMonth(d.getMonth() + 1);
        } else {
          break;
        }
      }
    }
  });
  
  setData('schedules', schedules);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadPigs();
  // Generate recurring schedules (including feeding schedules for pigs)
  generateRecurringSchedules();
  renderSchedules();
  updateStats();
  
  // Set default date to today
  document.getElementById('scheduleDate').valueAsDate = new Date();
  
  // Handle schedule type change
  document.getElementById('scheduleType').addEventListener('change', (e) => {
    const type = e.target.value;
    const pigSelection = document.getElementById('pigSelection');
    const feedingDetails = document.getElementById('feedingDetails');
    const vaccinationDetails = document.getElementById('vaccinationDetails');
    
    // Reset all
    pigSelection.classList.add('hidden');
    feedingDetails.classList.add('hidden');
    vaccinationDetails.classList.add('hidden');
    
    if (type === 'feeding') {
      pigSelection.classList.remove('hidden');
      feedingDetails.classList.remove('hidden');
    } else if (type === 'vaccination' || type === 'vet') {
      pigSelection.classList.remove('hidden');
      if (type === 'vaccination') {
        vaccinationDetails.classList.remove('hidden');
      }
    }
  });

  // Initialize with feeding tab
  showScheduleTab('feeding');
});

function loadPigs() {
  const pigs = getData('pigs');
  const select = document.getElementById('selectedPig');
  select.innerHTML = '<option value="">All Pigs</option>';
  pigs.forEach(pig => {
    const option = document.createElement('option');
    option.value = pig.id;
    option.textContent = `${pig.tag} - ${pig.breed || 'Unknown'}`;
    select.appendChild(option);
  });
}

function showScheduleModal() {
  document.getElementById('scheduleModal').classList.remove('hidden');
  document.getElementById('scheduleModal').classList.add('flex');
}

function hideScheduleModal() {
  document.getElementById('scheduleModal').classList.add('hidden');
  document.getElementById('scheduleModal').classList.remove('flex');
  document.getElementById('scheduleForm').reset();
  document.getElementById('feedingDetails').classList.add('hidden');
  document.getElementById('vaccinationDetails').classList.add('hidden');
  document.getElementById('pigSelection').classList.add('hidden');
}

function updateStats() {
  const schedules = getData('schedules');
  const today = new Date().toDateString();
  const now = new Date();
  
  const todayTasks = schedules.filter(s => {
    const scheduleDate = new Date(s.date + 'T' + s.time);
    return scheduleDate.toDateString() === today && !s.completed;
  }).length;
  
  const pendingTasks = schedules.filter(s => !s.completed && new Date(s.date + 'T' + s.time) >= now).length;
  
  const completedToday = schedules.filter(s => {
    if (!s.completed) return false;
    const completedDate = new Date(s.completedAt);
    return completedDate.toDateString() === today;
  }).length;
  
  document.getElementById('todayCount').textContent = todayTasks;
  document.getElementById('pendingCount').textContent = pendingTasks;
  document.getElementById('completedCount').textContent = completedToday;
}

function getScheduleStatus(schedule) {
  if (schedule.completed) return 'completed';
  
  const scheduleDateTime = new Date(schedule.date + 'T' + schedule.time);
  const now = new Date();
  
  if (scheduleDateTime < now) return 'overdue';
  if (scheduleDateTime.toDateString() === now.toDateString()) return 'upcoming';
  return 'pending';
}

function formatDateTime(date, time) {
  const d = new Date(date + 'T' + time);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options) + ' at ' + formatTime(time);
}

function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getTypeIcon(type) {
  const icons = {
    feeding: 'fas fa-seedling',
    cleaning: 'fas fa-spray-can',
    vaccination: 'fas fa-syringe',
    vet: 'fas fa-user-md'
  };
  return icons[type] || 'fas fa-calendar';
}

function getTypeColor(type) {
  const colors = {
    feeding: 'bg-green-100 text-green-800',
    cleaning: 'bg-blue-100 text-blue-800',
    vaccination: 'bg-yellow-100 text-yellow-800',
    vet: 'bg-red-100 text-red-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

let currentTab = 'feeding';

function showScheduleTab(tab) {
  currentTab = tab;
  
  // Hide all sections
  document.querySelectorAll('.schedule-section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
    button.classList.remove('border-green-500', 'border-blue-500', 'border-yellow-500');
    button.classList.remove('bg-green-50', 'bg-blue-50', 'bg-yellow-50');
  });
  
  // Show selected section and activate tab
  const section = document.getElementById(tab + 'Section');
  const tabButton = document.getElementById('tab-' + tab);
  
  if (section && tabButton) {
    section.classList.remove('hidden');
    
    const colors = {
      feeding: { border: 'border-green-500', bg: 'bg-green-50' },
      cleaning: { border: 'border-blue-500', bg: 'bg-blue-50' },
      vaccination: { border: 'border-yellow-500', bg: 'bg-yellow-50' }
    };
    
    tabButton.classList.add('active', colors[tab].border, colors[tab].bg);
  }
  
  renderSchedules();
}

function renderSchedules() {
  const schedules = getData('schedules');
  const pigs = getData('pigs');
  
  // Separate schedules by type
  const feedingSchedules = schedules.filter(s => s.type === 'feeding');
  const cleaningSchedules = schedules.filter(s => s.type === 'cleaning');
  const vaccinationSchedules = schedules.filter(s => s.type === 'vaccination' || s.type === 'vet');
  
  // Sort each category by date and time
  const sortSchedules = (arr) => {
    return [...arr].sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA - dateB;
    });
  };
  
  // Render each category
  renderScheduleCategory('feeding', sortSchedules(feedingSchedules), pigs);
  renderScheduleCategory('cleaning', sortSchedules(cleaningSchedules), pigs);
  renderScheduleCategory('vaccination', sortSchedules(vaccinationSchedules), pigs);
  
  // Update counts
  document.getElementById('feedingCount').textContent = `${feedingSchedules.filter(s => !s.completed).length} pending`;
  document.getElementById('cleaningCount').textContent = `${cleaningSchedules.filter(s => !s.completed).length} pending`;
  document.getElementById('vaccinationCount').textContent = `${vaccinationSchedules.filter(s => !s.completed).length} pending`;
}

function renderScheduleCategory(category, schedules, pigs) {
  const listElement = document.getElementById(category + 'List');
  
  if (!listElement) return;
  
  if (schedules.length === 0) {
    listElement.innerHTML = `
      <div class="glass-effect rounded-2xl professional-shadow p-12 text-center">
        <i class="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-bold text-gray-700 mb-2">No ${category.charAt(0).toUpperCase() + category.slice(1)} Schedules</h3>
        <p class="text-gray-500 mb-4">Add a new ${category} schedule to get started</p>
        <button onclick="showScheduleModal()" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold">
          <i class="fas fa-plus mr-2"></i>Add ${category.charAt(0).toUpperCase() + category.slice(1)} Schedule
        </button>
      </div>
    `;
    return;
  }
  
  listElement.innerHTML = schedules.map(s => {
    const status = getScheduleStatus(s);
    const pig = s.pigId ? pigs.find(p => p.id === s.pigId) : null;
    const statusClasses = {
      completed: 'status-completed',
      pending: 'status-pending',
      overdue: 'status-overdue',
      upcoming: 'status-upcoming'
    };
    
    return `
    <div class="schedule-card glass-effect rounded-xl professional-shadow p-6 ${statusClasses[status]}">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-3">
            <div class="${getTypeColor(s.type)} p-3 rounded-lg">
              <i class="${getTypeIcon(s.type)} text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800 capitalize">${s.type}</h3>
              ${pig ? `<p class="text-sm text-gray-600">Pig: ${pig.tag} - ${pig.breed || 'Unknown'}</p>` : '<p class="text-sm text-gray-600">All Pigs</p>'}
            </div>
          </div>
          
          <div class="space-y-2 mb-4">
            <p class="text-gray-700">
              <i class="fas fa-calendar-alt mr-2 text-purple-600"></i>
              ${formatDateTime(s.date, s.time)}
            </p>
            
            ${s.type === 'feeding' && s.feedAmount ? `
              <p class="text-gray-700">
                <i class="fas fa-seedling mr-2 text-green-600"></i>
                Feed Amount: ${s.feedAmount} kg ${s.feedType ? `(${s.feedType})` : ''}
              </p>
            ` : ''}
            
            ${(s.type === 'vaccination' || s.type === 'vet') && s.vaccineType ? `
              <p class="text-gray-700">
                <i class="fas fa-syringe mr-2 text-yellow-600"></i>
                Vaccine: ${s.vaccineType} ${s.vaccineDosage ? `(${s.vaccineDosage})` : ''}
              </p>
            ` : ''}
            
            ${s.notes ? `
              <p class="text-gray-600 text-sm">
                <i class="fas fa-comment mr-2"></i>
                ${s.notes}
              </p>
            ` : ''}
            
            ${s.isManureRemoval ? `
              <span class="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                <i class="fas fa-trash-alt mr-1"></i>Manure Removal
              </span>
            ` : ''}
            ${s.isDeepCleaning ? `
              <span class="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold">
                <i class="fas fa-hand-sparkles mr-1"></i>Deep Cleaning (Water & Disinfectant)
              </span>
            ` : ''}
            ${s.isPregnantSowFeed ? `
              <span class="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-semibold">
                <i class="fas fa-baby mr-1"></i>Pregnant Sow Feeding (1.5kg)
              </span>
            ` : ''}
            ${s.isGiltFeed ? `
              <span class="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                <i class="fas fa-seedling mr-1"></i>Gilt Feeding (1.25kg)
              </span>
            ` : ''}
            ${s.recurrence && s.recurrence !== 'none' ? `
              <span class="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                <i class="fas fa-redo mr-1"></i>Repeats ${s.recurrence === 'every3days' ? 'every 3 days' : s.recurrence}
              </span>
            ` : ''}
            ${s.autoSchedule ? `
              <span class="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                <i class="fas fa-robot mr-1"></i>Auto Scheduled
              </span>
            ` : ''}
          </div>
          
          <div class="flex items-center space-x-2">
            ${!s.completed ? `
              <button onclick="completeSchedule('${s.id}')" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
                <i class="fas fa-check mr-1"></i>Mark Complete
              </button>
              <button onclick="deleteSchedule('${s.id}')" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold">
                <i class="fas fa-trash mr-1"></i>Delete
              </button>
            ` : `
              <span class="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold">
                <i class="fas fa-check-circle mr-1"></i>Completed
              </span>
              ${s.completedAt ? `<span class="text-sm text-gray-500">Completed on ${new Date(s.completedAt).toLocaleString()}</span>` : ''}
            `}
            
            ${status === 'overdue' ? `
              <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                <i class="fas fa-exclamation-triangle mr-1"></i>Overdue
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
    `;
  }).join('');
}

// Make showScheduleTab globally accessible
window.showScheduleTab = showScheduleTab;

function applyFilters() {
  currentFilters.type = document.getElementById('filterType').value;
  currentFilters.status = document.getElementById('filterStatus').value;
  currentFilters.date = document.getElementById('filterDate').value;
  renderSchedules();
}

function clearFilters() {
  document.getElementById('filterType').value = 'all';
  document.getElementById('filterStatus').value = 'all';
  document.getElementById('filterDate').value = '';
  currentFilters = { type: 'all', status: 'all', date: '' };
  renderSchedules();
}

function completeSchedule(scheduleId) {
  const schedules = getData('schedules');
  const schedule = schedules.find(s => s.id === scheduleId);
  
  if (!schedule) return;
  
  schedule.completed = true;
  schedule.completedAt = new Date().toISOString();
  
  // Handle recurrence - only create next instance if not auto-scheduled
  // Auto-scheduled tasks will be generated by generateRecurringSchedules()
  if (schedule.recurrence && schedule.recurrence !== 'none' && !schedule.autoSchedule) {
    const nextSchedule = { ...schedule };
    nextSchedule.id = 'SCH-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    nextSchedule.completed = false;
    nextSchedule.completedAt = null;
    
    const currentDate = new Date(schedule.date + 'T' + schedule.time);
    let nextDate = new Date(currentDate);
    
    switch (schedule.recurrence) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'every3days':
        nextDate.setDate(nextDate.getDate() + 3);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
    
    nextSchedule.date = nextDate.toISOString().split('T')[0];
    schedules.push(nextSchedule);
  }
  
  setData('schedules', schedules);
  generateRecurringSchedules(); // Regenerate recurring schedules
  renderSchedules();
  updateStats();
}

function deleteSchedule(scheduleId) {
  const schedules = getData('schedules');
  const schedule = schedules.find(s => s.id === scheduleId);
  
  if (!schedule) return;
  
  // Prevent deletion of base auto-schedule templates
  if (schedule.autoSchedule && schedule.id.startsWith('AUTO-SCH-')) {
    if (!confirm('This is an auto-scheduled task template. Deleting it will stop generating future occurrences. Continue?')) {
      return;
    }
  } else if (schedule.autoSchedule) {
    if (!confirm('This is an auto-scheduled recurring task. Are you sure you want to delete it?')) {
      return;
    }
  } else {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
  }
  
  const filtered = schedules.filter(s => s.id !== scheduleId);
  setData('schedules', filtered);
  renderSchedules();
  updateStats();
}

// Handle form submission
document.getElementById('scheduleForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    id: 'SCH-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    type: document.getElementById('scheduleType').value,
    pigId: document.getElementById('selectedPig').value || null,
    date: document.getElementById('scheduleDate').value,
    time: document.getElementById('scheduleTime').value,
    notes: document.getElementById('scheduleNotes').value,
    recurrence: document.getElementById('recurrence').value,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  if (formData.type === 'feeding') {
    formData.feedAmount = parseFloat(document.getElementById('feedAmount').value) || null;
    formData.feedType = document.getElementById('feedType').value || null;
  } else if (formData.type === 'vaccination') {
    formData.vaccineType = document.getElementById('vaccineType').value || null;
    formData.vaccineDosage = document.getElementById('vaccineDosage').value || null;
  }
  
  // Auto-switch to the appropriate tab after adding schedule
  if (formData.type === 'feeding') {
    showScheduleTab('feeding');
  } else if (formData.type === 'cleaning') {
    showScheduleTab('cleaning');
  } else if (formData.type === 'vaccination' || formData.type === 'vet') {
    showScheduleTab('vaccination');
  }
  
  const schedules = getData('schedules');
  schedules.push(formData);
  setData('schedules', schedules);
  
  hideScheduleModal();
  renderSchedules();
  updateStats();
  
  // Show success message
  alert('Schedule added successfully!');
});

