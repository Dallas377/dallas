/**
 * NutriTrack - Pure Vanilla JavaScript Calorie & Macro Tracker
 * Persistent client-side data storage using localStorage.
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_DATA = 'nutritrack_logs_v1';
  const STORAGE_KEY_SETTINGS = 'nutritrack_settings_v1';

  // Default User Goals
  const DEFAULT_SETTINGS = {
    dailyCalories: 2000,
    protein: 130,
    carbs: 220,
    fat: 65,
    water: 8
  };

  // Category Configuration
  const MEAL_CATEGORIES = [
    { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
    { id: 'lunch', name: 'Lunch', icon: '🥗' },
    { id: 'dinner', name: 'Dinner', icon: '🍲' },
    { id: 'snack', name: 'Snacks', icon: '🍎' }
  ];

  // Application State
  let currentDate = getTodayDateString();
  let appSettings = loadSettings();
  let appData = loadData();

  // DOM Elements Cache
  const datePicker = document.getElementById('datePicker');
  const dateDisplay = document.getElementById('dateDisplay');
  const prevDayBtn = document.getElementById('prevDayBtn');
  const nextDayBtn = document.getElementById('nextDayBtn');
  const todayBtn = document.getElementById('todayBtn');

  // Overview Stats
  const consumedCaloriesEl = document.getElementById('consumedCalories');
  const targetCaloriesEl = document.getElementById('targetCalories');
  const remainingCaloriesEl = document.getElementById('remainingCalories');
  const remainingCaptionEl = document.getElementById('remainingCaption');
  const budgetStatusBadge = document.getElementById('budgetStatusBadge');
  const calorieProgressBar = document.getElementById('calorieProgressBar');
  const progressPercentageEl = document.getElementById('progressPercentage');
  const progressDeltaEl = document.getElementById('progressDelta');

  // Macros Elements
  const proteinValEl = document.getElementById('proteinVal');
  const proteinGoalValEl = document.getElementById('proteinGoalVal');
  const proteinBarEl = document.getElementById('proteinBar');

  const carbsValEl = document.getElementById('carbsVal');
  const carbsGoalValEl = document.getElementById('carbsGoalVal');
  const carbsBarEl = document.getElementById('carbsBar');

  const fatsValEl = document.getElementById('fatsVal');
  const fatsGoalValEl = document.getElementById('fatsGoalVal');
  const fatsBarEl = document.getElementById('fatsBar');

  // Water Tracker Elements
  const waterCountEl = document.getElementById('waterCount');
  const waterGoalEl = document.getElementById('waterGoal');
  const waterGlassesContainer = document.getElementById('waterGlassesContainer');
  const decreaseWaterBtn = document.getElementById('decreaseWaterBtn');
  const increaseWaterBtn = document.getElementById('increaseWaterBtn');

  // Food Form
  const foodForm = document.getElementById('foodForm');
  const foodNameInput = document.getElementById('foodName');
  const foodMealSelect = document.getElementById('foodMeal');
  const foodCaloriesInput = document.getElementById('foodCalories');
  const foodProteinInput = document.getElementById('foodProtein');
  const foodCarbsInput = document.getElementById('foodCarbs');
  const foodFatInput = document.getElementById('foodFat');
  const presetChips = document.querySelectorAll('.chip');

  // Meals List
  const mealsContainer = document.getElementById('mealsContainer');
  const mealsSummaryText = document.getElementById('mealsSummaryText');
  const emptyLogState = document.getElementById('emptyLogState');
  const filterInput = document.getElementById('filterInput');
  const clearDayBtn = document.getElementById('clearDayBtn');

  // Settings Modal Elements
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const settingsForm = document.getElementById('settingsForm');
  const goalCaloriesInput = document.getElementById('goalCalories');
  const goalProteinInput = document.getElementById('goalProtein');
  const goalCarbsInput = document.getElementById('goalCarbs');
  const goalFatInput = document.getElementById('goalFat');
  const goalWaterInput = document.getElementById('goalWater');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');

  const toastNotification = document.getElementById('toastNotification');

  // =========================================================================
  // Initialization
  // =========================================================================

  function init() {
    // Check if first-time user: seed initial demonstration meals for today
    seedInitialDataIfEmpty();

    // Set Date Picker value
    datePicker.value = currentDate;
    updateDateDisplay();

    // Setup Event Listeners
    setupEventListeners();

    // Initial Render
    render();
  }

  // =========================================================================
  // Storage Handlers
  // =========================================================================

  function loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse settings from localStorage', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  function saveSettings(newSettings) {
    appSettings = { ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(appSettings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }

  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DATA);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse logs data from localStorage', e);
    }
    return {};
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(appData));
    } catch (e) {
      console.error('Failed to save log data to localStorage', e);
    }
  }

  function getDayData(dateStr) {
    if (!appData[dateStr]) {
      appData[dateStr] = {
        water: 0,
        items: []
      };
    }
    return appData[dateStr];
  }

  function seedInitialDataIfEmpty() {
    if (Object.keys(appData).length === 0) {
      const todayStr = getTodayDateString();
      appData[todayStr] = {
        water: 4,
        items: [
          {
            id: 'seed-1',
            name: 'Avocado Toast & 2 Poached Eggs',
            meal: 'breakfast',
            calories: 420,
            protein: 18,
            carbs: 34,
            fat: 22,
            time: '08:15'
          },
          {
            id: 'seed-2',
            name: 'Black Coffee with splash of milk',
            meal: 'breakfast',
            calories: 25,
            protein: 1,
            carbs: 2,
            fat: 1,
            time: '08:30'
          },
          {
            id: 'seed-3',
            name: 'Grilled Chicken Brown Rice Bowl',
            meal: 'lunch',
            calories: 610,
            protein: 52,
            carbs: 68,
            fat: 14,
            time: '12:45'
          },
          {
            id: 'seed-4',
            name: 'Greek Yogurt with Blueberries',
            meal: 'snack',
            calories: 160,
            protein: 15,
            carbs: 18,
            fat: 3,
            time: '16:00'
          }
        ]
      };
      saveData();
    }
  }

  // =========================================================================
  // Date Helpers
  // =========================================================================

  function getTodayDateString() {
    const today = new Date();
    return formatDate(today);
  }

  function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function shiftDate(offsetDays) {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + offsetDays);
    currentDate = formatDate(dateObj);
    datePicker.value = currentDate;
    updateDateDisplay();
    render();
  }

  function updateDateDisplay() {
    const todayStr = getTodayDateString();
    const [y, m, d] = currentDate.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);

    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const formattedLabel = targetDate.toLocaleDateString(undefined, options);

    if (currentDate === todayStr) {
      dateDisplay.textContent = `Today (${formattedLabel})`;
    } else {
      dateDisplay.textContent = formattedLabel;
    }
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================

  function setupEventListeners() {
    // Date Navigation
    prevDayBtn.addEventListener('click', () => shiftDate(-1));
    nextDayBtn.addEventListener('click', () => shiftDate(1));
    todayBtn.addEventListener('click', () => {
      currentDate = getTodayDateString();
      datePicker.value = currentDate;
      updateDateDisplay();
      render();
    });

    datePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        currentDate = e.target.value;
        updateDateDisplay();
        render();
      }
    });

    // Add Food Form
    foodForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAddFood();
    });

    // Quick Add Chips
    presetChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const name = chip.getAttribute('data-name');
        const cal = parseFloat(chip.getAttribute('data-cal')) || 0;
        const p = parseFloat(chip.getAttribute('data-p')) || 0;
        const c = parseFloat(chip.getAttribute('data-c')) || 0;
        const f = parseFloat(chip.getAttribute('data-f')) || 0;
        const meal = chip.getAttribute('data-meal') || 'snack';

        addItemToCurrentDate({
          name,
          meal,
          calories: cal,
          protein: p,
          carbs: c,
          fat: f
        });

        showToast(`Added "${name}" (${cal} kcal)`);
      });
    });

    // Water Tracker
    increaseWaterBtn.addEventListener('click', () => changeWater(1));
    decreaseWaterBtn.addEventListener('click', () => changeWater(-1));

    // Clear Day Action
    clearDayBtn.addEventListener('click', () => {
      const dayData = getDayData(currentDate);
      if (dayData.items.length === 0 && dayData.water === 0) {
        showToast('This day is already empty.');
        return;
      }
      if (confirm('Clear all logged items and water for this day?')) {
        dayData.items = [];
        dayData.water = 0;
        saveData();
        render();
        showToast('Cleared day successfully.');
      }
    });

    // Search / Filter Items
    filterInput.addEventListener('input', () => {
      renderMealsList();
    });

    // Settings Modal
    settingsBtn.addEventListener('click', openSettingsModal);
    closeModalBtn.addEventListener('click', closeSettingsModal);
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        closeSettingsModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
        closeSettingsModal();
      }
    });

    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsFromModal();
    });

    resetDefaultsBtn.addEventListener('click', () => {
      goalCaloriesInput.value = DEFAULT_SETTINGS.dailyCalories;
      goalProteinInput.value = DEFAULT_SETTINGS.protein;
      goalCarbsInput.value = DEFAULT_SETTINGS.carbs;
      goalFatInput.value = DEFAULT_SETTINGS.fat;
      goalWaterInput.value = DEFAULT_SETTINGS.water;
    });
  }

  // =========================================================================
  // Food Items Actions
  // =========================================================================

  function handleAddFood() {
    const name = foodNameInput.value.trim();
    const meal = foodMealSelect.value;
    const calories = parseFloat(foodCaloriesInput.value);
    const protein = parseFloat(foodProteinInput.value) || 0;
    const carbs = parseFloat(foodCarbsInput.value) || 0;
    const fat = parseFloat(foodFatInput.value) || 0;

    if (!name || isNaN(calories) || calories < 0) {
      alert('Please enter a valid food name and calories.');
      return;
    }

    addItemToCurrentDate({
      name,
      meal,
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10
    });

    // Reset Form
    foodForm.reset();
    foodMealSelect.value = meal; // Keep the same meal category for convenience
    foodNameInput.focus();
    showToast(`Added ${name} to ${meal}!`);
  }

  function addItemToCurrentDate(itemProps) {
    const dayData = getDayData(currentDate);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      time: timeStr,
      ...itemProps
    };

    dayData.items.push(newItem);
    saveData();
    render();
  }

  function deleteItem(itemId) {
    const dayData = getDayData(currentDate);
    const itemIndex = dayData.items.findIndex((item) => item.id === itemId);
    if (itemIndex > -1) {
      const removed = dayData.items.splice(itemIndex, 1)[0];
      saveData();
      render();
      showToast(`Removed "${removed.name}"`);
    }
  }

  // =========================================================================
  // Water Tracker Actions
  // =========================================================================

  function changeWater(delta) {
    const dayData = getDayData(currentDate);
    dayData.water = Math.max(0, (dayData.water || 0) + delta);
    saveData();
    renderWaterTracker();
  }

  function setWater(count) {
    const dayData = getDayData(currentDate);
    dayData.water = Math.max(0, count);
    saveData();
    renderWaterTracker();
  }

  // =========================================================================
  // Settings Actions
  // =========================================================================

  function openSettingsModal() {
    goalCaloriesInput.value = appSettings.dailyCalories;
    goalProteinInput.value = appSettings.protein;
    goalCarbsInput.value = appSettings.carbs;
    goalFatInput.value = appSettings.fat;
    goalWaterInput.value = appSettings.water;
    settingsModal.classList.remove('hidden');
  }

  function closeSettingsModal() {
    settingsModal.classList.add('hidden');
  }

  function saveSettingsFromModal() {
    const newSettings = {
      dailyCalories: parseInt(goalCaloriesInput.value, 10) || DEFAULT_SETTINGS.dailyCalories,
      protein: parseInt(goalProteinInput.value, 10) || DEFAULT_SETTINGS.protein,
      carbs: parseInt(goalCarbsInput.value, 10) || DEFAULT_SETTINGS.carbs,
      fat: parseInt(goalFatInput.value, 10) || DEFAULT_SETTINGS.fat,
      water: parseInt(goalWaterInput.value, 10) || DEFAULT_SETTINGS.water
    };

    saveSettings(newSettings);
    closeSettingsModal();
    render();
    showToast('Nutrition targets updated!');
  }

  // =========================================================================
  // Rendering
  // =========================================================================

  function render() {
    const dayData = getDayData(currentDate);

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    dayData.items.forEach((item) => {
      totalCalories += Number(item.calories) || 0;
      totalProtein += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFat += Number(item.fat) || 0;
    });

    totalCalories = Math.round(totalCalories);
    totalProtein = Math.round(totalProtein * 10) / 10;
    totalCarbs = Math.round(totalCarbs * 10) / 10;
    totalFat = Math.round(totalFat * 10) / 10;

    // Render Calorie Stats
    consumedCaloriesEl.textContent = totalCalories.toLocaleString();
    targetCaloriesEl.textContent = appSettings.dailyCalories.toLocaleString();

    const diff = appSettings.dailyCalories - totalCalories;
    const remainingEl = remainingCaloriesEl;

    if (diff >= 0) {
      remainingEl.textContent = diff.toLocaleString();
      remainingEl.classList.remove('is-over');
      remainingCaptionEl.textContent = 'Remaining';
      progressDeltaEl.textContent = `${diff.toLocaleString()} kcal left`;

      const pct = Math.min(100, Math.round((totalCalories / appSettings.dailyCalories) * 100));
      progressPercentageEl.textContent = `${pct}%`;
      calorieProgressBar.style.width = `${pct}%`;

      // Status badge and bar color
      if (pct >= 90) {
        budgetStatusBadge.textContent = 'Near Limit';
        budgetStatusBadge.className = 'status-badge badge-warning';
        calorieProgressBar.className = 'progress-bar-fill bar-warning';
      } else {
        budgetStatusBadge.textContent = 'On Track';
        budgetStatusBadge.className = 'status-badge badge-good';
        calorieProgressBar.className = 'progress-bar-fill';
      }
    } else {
      const overAmount = Math.abs(diff);
      remainingEl.textContent = `+${overAmount.toLocaleString()}`;
      remainingEl.classList.add('is-over');
      remainingCaptionEl.textContent = 'Over Target';
      progressDeltaEl.textContent = `${overAmount.toLocaleString()} kcal over`;

      const pct = Math.round((totalCalories / appSettings.dailyCalories) * 100);
      progressPercentageEl.textContent = `${pct}%`;
      calorieProgressBar.style.width = '100%';
      calorieProgressBar.className = 'progress-bar-fill bar-danger';

      budgetStatusBadge.textContent = 'Over Budget';
      budgetStatusBadge.className = 'status-badge badge-over';
    }

    // Render Macros
    proteinValEl.textContent = totalProtein;
    proteinGoalValEl.textContent = appSettings.protein;
    const proteinPct = Math.min(100, Math.round((totalProtein / appSettings.dailyCalories) * 100 * 4) || Math.round((totalProtein / appSettings.protein) * 100));
    proteinBarEl.style.width = `${Math.min(100, (totalProtein / appSettings.protein) * 100)}%`;

    carbsValEl.textContent = totalCarbs;
    carbsGoalValEl.textContent = appSettings.carbs;
    carbsBarEl.style.width = `${Math.min(100, (totalCarbs / appSettings.carbs) * 100)}%`;

    fatsValEl.textContent = totalFat;
    fatsGoalValEl.textContent = appSettings.fat;
    fatsBarEl.style.width = `${Math.min(100, (totalFat / appSettings.fat) * 100)}%`;

    // Render Water
    renderWaterTracker();

    // Render Meals
    renderMealsList();
  }

  function renderWaterTracker() {
    const dayData = getDayData(currentDate);
    const count = dayData.water || 0;
    const goal = appSettings.water || 8;

    waterCountEl.textContent = count;
    waterGoalEl.textContent = goal;

    waterGlassesContainer.innerHTML = '';

    const maxDisplayGlasses = Math.max(goal, count);
    for (let i = 1; i <= maxDisplayGlasses; i++) {
      const glass = document.createElement('div');
      glass.className = 'water-glass-icon' + (i <= count ? ' filled' : '');
      glass.title = `Glass ${i} of ${goal}`;

      const fill = document.createElement('div');
      fill.className = 'water-glass-fill';
      glass.appendChild(fill);

      glass.addEventListener('click', () => {
        if (count === i) {
          // If clicking the current level, decrease by 1
          setWater(i - 1);
        } else {
          setWater(i);
        }
      });

      waterGlassesContainer.appendChild(glass);
    }
  }

  function renderMealsList() {
    const dayData = getDayData(currentDate);
    const filterQuery = (filterInput.value || '').trim().toLowerCase();

    // Filter items
    const visibleItems = dayData.items.filter((item) => {
      if (!filterQuery) return true;
      return (
        item.name.toLowerCase().includes(filterQuery) ||
        item.meal.toLowerCase().includes(filterQuery)
      );
    });

    const totalCount = dayData.items.length;
    mealsSummaryText.textContent = `${totalCount} ${totalCount === 1 ? 'item' : 'items'} logged`;

    mealsContainer.innerHTML = '';

    if (totalCount === 0) {
      emptyLogState.classList.remove('hidden');
      return;
    } else {
      emptyLogState.classList.add('hidden');
    }

    // Render each category
    MEAL_CATEGORIES.forEach((category) => {
      const catItems = visibleItems.filter((i) => i.meal === category.id);

      // Even if catItems is empty when filtering, don't show block if search query is active
      if (catItems.length === 0 && filterQuery) {
        return;
      }

      const catCalories = catItems.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);

      const block = document.createElement('div');
      block.className = 'meal-category-block';

      // Header
      const header = document.createElement('div');
      header.className = 'meal-category-header';
      header.innerHTML = `
        <div class="category-name-tag">
          <span class="category-icon">${category.icon}</span>
          <span>${category.name} (${catItems.length})</span>
        </div>
        <span class="category-subtotal">${Math.round(catCalories)} kcal</span>
      `;
      block.appendChild(header);

      // Item List
      if (catItems.length > 0) {
        const list = document.createElement('ul');
        list.className = 'meal-items-list';

        catItems.forEach((item) => {
          const row = document.createElement('li');
          row.className = 'meal-item-row';

          // Left side
          const left = document.createElement('div');
          left.className = 'meal-item-left';

          const title = document.createElement('span');
          title.className = 'meal-item-title';
          title.textContent = item.name;

          const macros = document.createElement('div');
          macros.className = 'meal-item-macros';

          const parts = [];
          if (item.time) parts.push(`<span>⏰ ${item.time}</span>`);
          if (item.protein > 0) parts.push(`<span>🍗 ${item.protein}g P</span>`);
          if (item.carbs > 0) parts.push(`<span>🍞 ${item.carbs}g C</span>`);
          if (item.fat > 0) parts.push(`<span>🥑 ${item.fat}g F</span>`);

          macros.innerHTML = parts.join(' &bull; ');

          left.appendChild(title);
          left.appendChild(macros);

          // Right side
          const right = document.createElement('div');
          right.className = 'meal-item-right';

          const calBadge = document.createElement('span');
          calBadge.className = 'meal-item-calories';
          calBadge.textContent = `${item.calories} kcal`;

          const delBtn = document.createElement('button');
          delBtn.className = 'delete-item-btn';
          delBtn.innerHTML = '&times;';
          delBtn.title = 'Delete Item';
          delBtn.addEventListener('click', () => deleteItem(item.id));

          right.appendChild(calBadge);
          right.appendChild(delBtn);

          row.appendChild(left);
          row.appendChild(right);
          list.appendChild(row);
        });

        block.appendChild(list);
      }

      mealsContainer.appendChild(block);
    });
  }

  // =========================================================================
  // Toast Notifications
  // =========================================================================

  let toastTimeout = null;

  function showToast(message) {
    if (!toastNotification) return;

    toastNotification.textContent = message;
    toastNotification.classList.remove('hidden');

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 2800);
  }

  // Run app
  document.addEventListener('DOMContentLoaded', init);
})();

