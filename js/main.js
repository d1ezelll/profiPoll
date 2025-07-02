document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.quiz-slide');
  const nextBtns = document.querySelectorAll('.next-btn');
  const prevBtns = document.querySelectorAll('.prev-btn');
  const skipBtns = document.querySelectorAll('.skip-btn');
  const radioInputs = document.querySelectorAll('input[type="radio"]');
  const specifyInput = document.querySelector('.specify-input');
  const otherOption = document.querySelector('input[value="Other"]');
  
  let currentSlide = 0;
  

  showSlide(currentSlide);
  
  
  if (otherOption) {
    otherOption.addEventListener('change', function() {
      specifyInput.style.display = this.checked ? 'block' : 'none';
      updateNextButton();
    });
    
    specifyInput.addEventListener('input', updateNextButton);
  }
  
  
  radioInputs.forEach(input => {
    input.addEventListener('change', updateNextButton);
  });
  
  
  nextBtns.forEach(btn => {
    btn.addEventListener('click', goToNextSlide);
  });
  
  
  prevBtns.forEach(btn => {
    btn.addEventListener('click', goToPrevSlide);
  });
  
  
  skipBtns.forEach(btn => {
    btn.addEventListener('click', goToNextSlide);
  });
  
  function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[n].classList.add('active');
    
    
    const prevBtn = slides[n].querySelector('.prev-btn');
    if (prevBtn) prevBtn.disabled = n === 0;
    
    
    const nextBtn = slides[n].querySelector('.next-btn');
    if (nextBtn) nextBtn.disabled = !isAnswerSelected(n);
  }
  
  function updateNextButton() {
    const currentActiveSlide = document.querySelector('.quiz-slide.active');
    const nextBtn = currentActiveSlide.querySelector('.next-btn');
    if (nextBtn) nextBtn.disabled = !isAnswerSelected(currentSlide);
  }
  
  function isAnswerSelected(slideIndex) {
    const slide = slides[slideIndex];
    const selectedRadio = slide.querySelector('input[type="radio"]:checked');
    
    if (!selectedRadio) return false;
    
    if (selectedRadio.value === 'Other') {
      return specifyInput.value.trim() !== '';
    }
    
    return true;
  }
  
  function goToNextSlide() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      showSlide(currentSlide);
    }
  }
  
  function goToPrevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      showSlide(currentSlide);
    }
  }
});


document.addEventListener('DOMContentLoaded', function() {
    const burgerBtn = document.querySelector('.burger-btn');
    const headerMenu = document.querySelector('.header-menu');
    
    burgerBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        headerMenu.classList.toggle('active');
        
        
        if (headerMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    
    const menuItems = document.querySelectorAll('.header-menu__item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            burgerBtn.classList.remove('active');
            headerMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
});
