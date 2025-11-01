// Initialize local storage data
if (!localStorage.getItem('pigs')) localStorage.setItem('pigs', JSON.stringify([]));
if (!localStorage.getItem('feed')) localStorage.setItem('feed', JSON.stringify([]));
if (!localStorage.getItem('sales')) localStorage.setItem('sales', JSON.stringify([]));
if (!localStorage.getItem('expenses')) localStorage.setItem('expenses', JSON.stringify([]));
if (!localStorage.getItem('schedules')) localStorage.setItem('schedules', JSON.stringify([]));
if (!localStorage.getItem('autoSchedulesInitialized')) {
  // Initialize auto schedules - this will be handled by schedule.js when loaded
  // Just set the flag so it doesn't try to initialize multiple times
  localStorage.setItem('autoSchedulesInitialized', 'false');
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function animateValue(element, start, end, duration, formatFn) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = start + (end - start) * easeOutQuart;
    
    if (formatFn) {
      element.textContent = formatFn(current);
    } else {
      element.textContent = Math.floor(current).toString();
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (formatFn) {
        element.textContent = formatFn(end);
      } else {
        element.textContent = end.toString();
      }
    }
  }
  
  requestAnimationFrame(update);
}

function updateDashboard() {
  const pigs = getData('pigs');
  const feed = getData('feed');
  const sales = getData('sales');
  const expenses = getData('expenses');

  const totalPigs = pigs.length;
  const feedStock = feed.reduce((sum, f) => sum + (f.quantity || 0), 0);
  const totalSales = sales.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const profit = totalSales - totalExpenses;

  const totalPigsEl = document.getElementById('totalPigs');
  const feedStockEl = document.getElementById('feedStock');
  const profitEl = document.getElementById('profit');

  // Get current values for animation
  const currentPigs = parseInt(totalPigsEl.textContent) || 0;
  const currentFeed = parseFloat(feedStockEl.textContent) || 0;
  const currentProfit = parseFloat(profitEl.textContent.replace('KES', '').replace(/,/g, '').trim()) || 0;

  // Animate the updates with formatting
  animateValue(totalPigsEl, currentPigs, totalPigs, 800);
  animateValue(feedStockEl, currentFeed, feedStock, 800, (val) => val.toFixed(1));
  animateValue(profitEl, currentProfit, profit, 800, (val) => `KES ${val >= 0 ? val.toFixed(2) : '-' + Math.abs(val).toFixed(2)}`);
}

// Hide loading screen and show main content
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    // Trigger animations for quote text
    const quoteElements = loadingScreen.querySelectorAll('.quote-reveal');
    quoteElements.forEach((el, index) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transition = 'opacity 0.8s ease-out';
      }, index * 300);
    });
    
    // Wait for animations, then fade out
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        // Update dashboard after loading screen is hidden
        updateDashboard();
      }, 800);
    }, 2500); // Show loading screen for 2.5 seconds minimum
  } else {
    updateDashboard();
  }
}

// Show loading screen on page load
document.addEventListener('DOMContentLoaded', () => {
  hideLoadingScreen();
  
  // Update dashboard periodically after initial load
  setInterval(() => {
    if (!document.getElementById('loadingScreen') || document.getElementById('loadingScreen').style.display === 'none') {
      updateDashboard();
    }
  }, 2000);
});

