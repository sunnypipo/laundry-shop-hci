// ─── BOOK FORM VALIDATION ───

(function () {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const confirmationMsg = document.getElementById('confirmation-msg');

  // Set min date on date pickers to today
  const today = new Date().toISOString().split('T')[0];
  const pickupDateInput = document.getElementById('pickup-date');
  const deliveryDateInput = document.getElementById('delivery-date');

  if (pickupDateInput) pickupDateInput.min = today;
  if (deliveryDateInput) deliveryDateInput.min = today;

  // Required fields config
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
    // Accept formats: 09XXXXXXXXX, +639XXXXXXXXX, 09XX-XXX-XXXX
    const cleaned = value.replace(/[-\s]/g, '');
    return /^(09|\+639)\d{9}$/.test(cleaned);
  }

  function validateDeliveryAfterPickup() {
    const pickupVal = pickupDateInput ? pickupDateInput.value : '';
    const deliveryVal = deliveryDateInput ? deliveryDateInput.value : '';
    if (pickupVal && deliveryVal && deliveryVal < pickupVal) {
      const errorEl = document.getElementById('delivery-date-error');
      showError(deliveryDateInput, errorEl, 'Delivery date must be on or after pickup date.');
      return false;
    }
    return true;
  }

  // Live clear errors on input
  requiredFields.forEach(({ id, errorId }) => {
    const field = document.getElementById(id);
    const errorEl = document.getElementById(errorId);
    if (!field || !errorEl) return;
    field.addEventListener('input', () => clearError(field, errorEl));
    field.addEventListener('change', () => clearError(field, errorEl));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    requiredFields.forEach(({ id, errorId, msg }) => {
      const field = document.getElementById(id);
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

    // Cross-field: delivery must be >= pickup
    if (!validateDeliveryAfterPickup()) {
      isValid = false;
    }

    if (isValid) {
      form.style.display = 'none';
      confirmationMsg.style.display = 'block';
      window.scrollTo({ top: confirmationMsg.offsetTop - 120 });
    } else {
      // Scroll to first error
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }
  });
})();
