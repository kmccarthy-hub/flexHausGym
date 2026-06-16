/**
 * FlexHaus "The Comeback" — Page Logic (always runs)
 * 
 * Handles form validation/submission, scroll reveal, hero CTA.
 * Independent of three.js — works even if 3D module fails to load.
 */
(function () {
  'use strict';

  var cfg = window.__flexhaus || {};

  // ─── DOM refs ───────────────────────────────────────────
  var momentumTexts = document.querySelectorAll('.momentum-text');
  var proofCards = document.querySelectorAll('.proof-card');
  var proofStat = document.querySelector('.proof-stat');
  var proofStatsRow = document.querySelector('.proof-stats-row');
  var heroCTA = document.querySelector('.hero-cta');
  var form = document.getElementById('comeback-form');
  var bookingCard = document.querySelector('.booking-card');
  var nameInput = document.getElementById('member-name');
  var contactInput = document.getElementById('member-contact');
  var consentInput = document.getElementById('marketing-consent');
  var submitBtn = document.getElementById('submit-booking');
  var slotDisplay = document.getElementById('slot-display');
  var changeLink = document.getElementById('slot-change');
  var pickerPanel = document.getElementById('picker-panel');
  var formDefault = document.querySelector('.form-default');
  var successMsg = document.querySelector('.success-message');
  var errorMsg = document.querySelector('.error-message');
  var classPicker = document.getElementById('picker-class');
  var dayPicker = document.getElementById('picker-day');
  var timePicker = document.getElementById('picker-time');
  var instructorPicker = document.getElementById('picker-instructor');

  // Mark form as initialized (so main.js can check)
  if (bookingCard) bookingCard._flexhausInitialized = true;

  // ─── Scroll Reveal (IntersectionObserver) ──────────────
  function initScrollReveal() {
    if (momentumTexts && momentumTexts.length) {
      momentumTexts.forEach(function (el) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            el.classList.toggle('visible', entry.isIntersecting);
          });
        }, { threshold: 0.4 });
        obs.observe(el);
      });
    }

    if (proofCards && proofCards.length) {
      proofCards.forEach(function (el, idx) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setTimeout(function () { el.classList.add('visible'); }, idx * 200);
            }
          });
        }, { threshold: 0.3 });
        obs.observe(el);
      });
    }

    if (proofStat) {
      var obs3 = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setTimeout(function () { proofStat.classList.add('visible'); }, 600);
          }
        });
      }, { threshold: 0.3 });
      obs3.observe(proofStat);
    }

    if (proofStatsRow) {
      var obs4 = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setTimeout(function () { proofStatsRow.classList.add('visible'); }, 800);
          }
        });
      }, { threshold: 0.3 });
      obs4.observe(proofStatsRow);
    }
  }

  // ─── Hero CTA ──────────────────────────────────────────
  if (heroCTA) {
    heroCTA.addEventListener('click', function (e) {
      e.preventDefault();
      var card = document.querySelector('.scene-card');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ─── Form Logic ────────────────────────────────────────
  function initForm() {
    if (!form || !nameInput || !contactInput || !submitBtn) return;

    var selected = {
      classType: 'Strength',
      day: 'Tuesday',
      time: 'Afternoon',
      instructor: 'Marta',
    };

    function updateSlotDisplay() {
      if (slotDisplay) {
        slotDisplay.textContent = selected.day + ', ' + selected.time.toLowerCase() + ' \u2014 ' + selected.classType + ' with ' + selected.instructor;
      }
    }

    function updateFromPicker() {
      selected.classType = classPicker ? classPicker.value : selected.classType;
      selected.day = dayPicker ? dayPicker.value : selected.day;
      selected.time = timePicker ? timePicker.value : selected.time;
      selected.instructor = instructorPicker ? instructorPicker.value : selected.instructor;
      updateSlotDisplay();
    }

    // Change link toggle
    if (changeLink && pickerPanel) {
      changeLink.addEventListener('click', function (e) {
        e.preventDefault();
        var isOpen = pickerPanel.classList.toggle('open');
        changeLink.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    // Picker change handlers
    [classPicker, dayPicker, timePicker, instructorPicker].forEach(function (el) {
      if (el) el.addEventListener('change', updateFromPicker);
    });

    // Validation
    function validateField(input) {
      var errorEl = input.parentNode.querySelector('.form-error');
      if (!input.value.trim()) {
        input.classList.add('error');
        if (errorEl) { errorEl.textContent = 'This field is required'; errorEl.classList.add('visible'); }
        return false;
      }
      if (input === contactInput) {
        var val = input.value.trim();
        var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        var isPhone = /^\+?[\d\s\-()]{7,15}$/.test(val);
        if (!isEmail && !isPhone) {
          input.classList.add('error');
          if (errorEl) { errorEl.textContent = 'Enter a valid email or phone number'; errorEl.classList.add('visible'); }
          return false;
        }
      }
      input.classList.remove('error');
      if (errorEl) errorEl.classList.remove('visible');
      return true;
    }

    function clearErrors() {
      [nameInput, contactInput].forEach(function (el) {
        el.classList.remove('error');
        var err = el.parentNode.querySelector('.form-error');
        if (err) err.classList.remove('visible');
      });
    }

    function showSuccess() {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      if (bookingCard) {
        bookingCard.classList.remove('error');
        bookingCard.classList.add('success');
      }
      submitBtn.classList.add('success');
      var btnText = submitBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = "You're booked!";
      if (formDefault) formDefault.style.display = 'none';
      if (successMsg) successMsg.classList.add('visible');
      // Signal to main.js 3D scene (if loaded)
      if (window.__flexhaus) window.__flexhaus.formSuccess = true;
      if (errorMsg) errorMsg.classList.remove('visible');
    }

    function mailtoFallback(data) {
      var subject = 'FlexHaus Comeback Booking';
      var body = 'Name: ' + encodeURIComponent(data.get('name') || '') +
        '%0D%0AContact: ' + encodeURIComponent(data.get('contact') || '') +
        '%0D%0AClass: ' + encodeURIComponent(data.get('class') || '') +
        '%0D%0ADay: ' + encodeURIComponent(data.get('day') || '') +
        '%0D%0ATime: ' + encodeURIComponent(data.get('time') || '') +
        '%0D%0AInstructor: ' + encodeURIComponent(data.get('instructor') || '') +
        '%0D%0AConsent: ' + encodeURIComponent(data.get('consent') || '');
      var mailto = 'mailto:hello@flexhaus.ie?subject=' + encodeURIComponent(subject) + '&body=' + body;
      showSuccess();
      window.location.href = mailto;
    }

    // Submit handler
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var nameValid = validateField(nameInput);
      var contactValid = validateField(contactInput);

      if (!nameValid || !contactValid) {
        if (bookingCard) bookingCard.classList.add('error');
        if (errorMsg) errorMsg.classList.add('visible');
        // Signal error to 3D scene
        if (window.__flexhaus) window.__flexhaus.formError = true;
        setTimeout(function () {
          if (window.__flexhaus) window.__flexhaus.formError = false;
        }, 2000);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add('loading');

      var formData = new URLSearchParams();
      formData.append('name', nameInput.value.trim());
      formData.append('contact', contactInput.value.trim());
      formData.append('consent', consentInput && consentInput.checked ? 'yes' : 'no');
      formData.append('class', selected.classType);
      formData.append('day', selected.day);
      formData.append('time', selected.time);
      formData.append('instructor', selected.instructor);
      formData.append('_subject', 'FlexHaus Comeback Booking');

      var formspreeUrl = form.getAttribute('data-formspree');
      if (formspreeUrl) {
        fetch(formspreeUrl, {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then(function (res) {
            if (res.ok) showSuccess();
            else mailtoFallback(formData);
          })
          .catch(function () { mailtoFallback(formData); });
      } else {
        mailtoFallback(formData);
      }
    });

    // Clear errors on input
    [nameInput, contactInput].forEach(function (el) {
      el.addEventListener('input', function () {
        el.classList.remove('error');
        var err = el.parentNode.querySelector('.form-error');
        if (err) err.classList.remove('visible');
        if (bookingCard) bookingCard.classList.remove('error');
        if (errorMsg) errorMsg.classList.remove('visible');
      });
    });
  }

  // ─── Boot ──────────────────────────────────────────────
  function boot() {
    // In reduced-motion or no-WebGL mode, make texts visible immediately
    if (!cfg.webglOk || cfg.reducedMotion) {
      document.documentElement.classList.add('no-webgl');
    }
    initScrollReveal();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
