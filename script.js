// ─── BOOK FORM VALIDATION + ORDER SUMMARY ───

(function () {
  const form            = document.getElementById('bookingForm');
  if (!form) return;

  const orderSummary    = document.getElementById('order-summary');
  const confirmationMsg = document.getElementById('confirmation-msg');
  const confirmBtn      = document.getElementById('confirmBtn');
  const backBtn         = document.getElementById('backBtn');
  const serviceSelect   = document.getElementById('service-type');
  const laundryOptions  = document.getElementById('laundry-options');
  const laundryStepErr  = document.getElementById('laundry-steps-error');

  // ── Show/hide laundry step cards when service = "laundry" ──
  if (serviceSelect && laundryOptions) {
    serviceSelect.addEventListener('change', function () {
      if (this.value === 'laundry') {
        laundryOptions.style.display = 'block';
      } else {
        laundryOptions.style.display = 'none';
        // uncheck all steps when switching away
        document.querySelectorAll('input[name="laundry-step"]').forEach(cb => cb.checked = false);
        clearLaundryError();
      }
    });
  }

  // Highlight selected cards
  document.querySelectorAll('.laundry-step-card input').forEach(cb => {
    cb.addEventListener('change', function () {
      clearLaundryError();
    });
  });

  function clearLaundryError() {
    if (laundryStepErr) laundryStepErr.classList.remove('show');
    document.querySelectorAll('.step-card-inner').forEach(c => c.classList.remove('error-border'));
  }

  // Set min date on date pickers to today
  const today = new Date().toISOString().split('T')[0];
  const pickupDateInput   = document.getElementById('pickup-date');
  const deliveryDateInput = document.getElementById('delivery-date');
  if (pickupDateInput)   pickupDateInput.min   = today;
  if (deliveryDateInput) deliveryDateInput.min = today;

  // Required base fields
  const requiredFields = [
    { id: 'name',          errorId: 'name-error',          msg: 'Please enter your full name.' },
    { id: 'phone',         errorId: 'phone-error',         msg: 'Please enter a valid phone number.' },
    { id: 'address',       errorId: 'address-error',       msg: 'Please enter your address.' },
    { id: 'pickup-date',   errorId: 'pickup-date-error',   msg: 'Please select a pickup date.' },
    { id: 'pickup-time',   errorId: 'pickup-time-error',   msg: 'Please select a pickup time.' },
    { id: 'delivery-date', errorId: 'delivery-date-error', msg: 'Please select a delivery date.' },
    { id: 'delivery-time', errorId: 'delivery-time-error', msg: 'Please select a delivery time.' },
    { id: 'service-type',  errorId: 'service-type-error',  msg: 'Please select a service type.' },
  ];

  // Service display labels + price ranges
  const serviceLabels = {
    'laundry':   'Laundry',
    'ironing':   'Steam Ironing & Pressing',
    'bedding':   'Bedding & Comforter Cleaning',
    'curtains':  'Curtain & Rug Cleaning',
    'stain':     'Stain Removal Treatment',
  };

  const servicePrices = {
    'ironing':   '₱15–₱25 / piece',
    'bedding':   '₱250–₱450 / set',
    'curtains':  '₱150–₱300 / piece',
    'stain':     '₱30–₱60 / item',
  };

  // Laundry step prices shown in summary
  const stepPrices = {
    wash: '₱40–₱55/kg',
    dry:  '₱25–₱35/kg',
    fold: '₱15–₱20/kg',
  };

  const stepLabels = {
    wash: 'Wash',
    dry:  'Dry',
    fold: 'Fold',
  };

  function showError(field, errorEl, msg) {
    field.classList.add('error');
    errorEl.textContent = msg;
    errorEl.classList.add('show');
  }

  function clearError(field, errorEl) {
    field.classList.remove('error');
    errorEl.classList.remove('show');
  }

  function validatePhone(value) {
    const cleaned = value.replace(/[-\s]/g, '');
    return /^(09|\+639)\d{9}$/.test(cleaned);
  }

  function validateDeliveryAfterPickup() {
    const pickupVal   = pickupDateInput   ? pickupDateInput.value   : '';
    const deliveryVal = deliveryDateInput ? deliveryDateInput.value : '';
    if (pickupVal && deliveryVal && deliveryVal < pickupVal) {
      const errorEl = document.getElementById('delivery-date-error');
      showError(deliveryDateInput, errorEl, 'Delivery date must be on or after pickup date.');
      return false;
    }
    return true;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}, ${y}`;
  }

  // Live clear errors
  requiredFields.forEach(({ id, errorId }) => {
    const field   = document.getElementById(id);
    const errorEl = document.getElementById(errorId);
    if (!field || !errorEl) return;
    field.addEventListener('input',  () => clearError(field, errorEl));
    field.addEventListener('change', () => clearError(field, errorEl));
  });

  // ── STEP 1 → STEP 2: validate then build summary ──
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    requiredFields.forEach(({ id, errorId, msg }) => {
      const field   = document.getElementById(id);
      const errorEl = document.getElementById(errorId);
      if (!field || !errorEl) return;
      const value = field.value.trim();
      if (!value) {
        showError(field, errorEl, msg);
        isValid = false;
      } else if (id === 'phone' && !validatePhone(value)) {
        showError(field, errorEl, 'Please enter a valid PH phone number (e.g. 09171234567).');
        isValid = false;
      } else {
        clearError(field, errorEl);
      }
    });

    if (!validateDeliveryAfterPickup()) isValid = false;

    // If laundry selected, require at least one step
    const serviceVal = serviceSelect ? serviceSelect.value : '';
    if (serviceVal === 'laundry') {
      const checkedSteps = [...document.querySelectorAll('input[name="laundry-step"]:checked')];
      if (checkedSteps.length === 0) {
        laundryStepErr.classList.add('show');
        document.querySelectorAll('.step-card-inner').forEach(c => c.classList.add('error-border'));
        isValid = false;
      }
    }

    if (!isValid) {
      const firstError = form.querySelector('.error, #laundry-steps-error.show');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // ── Build summary ──
    document.getElementById('sum-name').textContent    = document.getElementById('name').value.trim();
    document.getElementById('sum-phone').textContent   = document.getElementById('phone').value.trim();
    document.getElementById('sum-address').textContent = document.getElementById('address').value.trim();

    document.getElementById('sum-pickup').textContent =
      formatDate(pickupDateInput.value) + ' · ' + document.getElementById('pickup-time').value;
    document.getElementById('sum-delivery').textContent =
      formatDate(deliveryDateInput.value) + ' · ' + document.getElementById('delivery-time').value;

    // Service + steps
    let serviceSummary = serviceLabels[serviceVal] || serviceVal;
    let stepsSummaryHTML = '';

    if (serviceVal === 'laundry') {
      const selectedSteps = [...document.querySelectorAll('input[name="laundry-step"]:checked')]
        .map(cb => cb.value);

      const isAll = selectedSteps.includes('wash') && selectedSteps.includes('dry') && selectedSteps.includes('fold');

      if (isAll) {
        serviceSummary = 'Full-Service Wash, Dry & Fold';
        stepsSummaryHTML = '₱75–₱90 / kg (all three steps bundled)';
      } else {
        const stepLines = selectedSteps.map(s => `${stepLabels[s]} — ${stepPrices[s]}`).join('\n');
        serviceSummary = 'Laundry: ' + selectedSteps.map(s => stepLabels[s]).join(' + ');
        stepsSummaryHTML = stepLines;
      }
    } else {
      stepsSummaryHTML = servicePrices[serviceVal] || '';
    }

    document.getElementById('sum-service').textContent = serviceSummary;

    // Steps breakdown row
    const stepsRow = document.getElementById('sum-steps-row');
    const stepsEl  = document.getElementById('sum-steps');
    if (stepsRow && stepsEl) {
      if (stepsSummaryHTML) {
        stepsEl.style.whiteSpace = 'pre-line';
        stepsEl.textContent = stepsSummaryHTML;
        stepsRow.style.display = 'flex';
      } else {
        stepsRow.style.display = 'none';
      }
    }

    // Add-ons
    const checkedAddons = [...document.querySelectorAll('input[name="addons"]:checked')].map(cb => cb.value);
    const addonsRow = document.getElementById('sum-addons-row');
    if (addonsRow) {
      if (checkedAddons.length > 0) {
        document.getElementById('sum-addons').textContent = checkedAddons.join(', ');
        addonsRow.style.display = 'flex';
      } else {
        addonsRow.style.display = 'none';
      }
    }

    // Instructions
    const instrVal = document.getElementById('instructions').value.trim();
    const instrRow = document.getElementById('sum-instructions-row');
    if (instrRow) {
      if (instrVal) {
        document.getElementById('sum-instructions').textContent = instrVal;
        instrRow.style.display = 'block';
      } else {
        instrRow.style.display = 'none';
      }
    }

    form.style.display = 'none';
    orderSummary.style.display = 'block';
    window.scrollTo({ top: orderSummary.offsetTop - 120, behavior: 'smooth' });
  });

  // ── Back to form ──
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      orderSummary.style.display = 'none';
      form.style.display = 'block';
      window.scrollTo({ top: form.offsetTop - 120, behavior: 'smooth' });
    });
  }

  // ── Confirm booking ──
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      orderSummary.style.display = 'none';
      confirmationMsg.style.display = 'block';
      window.scrollTo({ top: confirmationMsg.offsetTop - 120, behavior: 'smooth' });
    });
  }
})();
