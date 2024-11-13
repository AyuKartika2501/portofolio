if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

/* Description: Custom JS file */


(function($) {
    "use strict"; 
	
    /* Navbar Scripts */
    // jQuery to collapse the navbar on scroll
    $(window).on('scroll load', function() {
		if ($(".navbar").offset().top > 60) {
			$(".fixed-top").addClass("top-nav-collapse");
		} else {
			$(".fixed-top").removeClass("top-nav-collapse");
		}
    });
    
	// jQuery for page scrolling feature - requires jQuery Easing plugin
	$(function() {
		$(document).on('click', 'a.page-scroll', function(event) {
			var $anchor = $(this);
			$('html, body').stop().animate({
				scrollTop: $($anchor.attr('href')).offset().top
			}, 600, 'easeInOutExpo');
			event.preventDefault();
		});
    });

    // offcanvas script from Bootstrap + added element to close menu on click in small viewport
    $('[data-toggle="offcanvas"], .navbar-nav li a:not(.dropdown-toggle').on('click', function () {
        $('.offcanvas-collapse').toggleClass('open')
    })

    // hover in desktop mode
    function toggleDropdown (e) {
        const _d = $(e.target).closest('.dropdown'),
            _m = $('.dropdown-menu', _d);
        setTimeout(function(){
            const shouldOpen = e.type !== 'click' && _d.is(':hover');
            _m.toggleClass('show', shouldOpen);
            _d.toggleClass('show', shouldOpen);
            $('[data-toggle="dropdown"]', _d).attr('aria-expanded', shouldOpen);
        }, e.type === 'mouseleave' ? 300 : 0);
    }
    $('body')
    .on('mouseenter mouseleave','.dropdown',toggleDropdown)
    .on('click', '.dropdown-menu a', toggleDropdown);


    /* Move Form Fields Label When User Types */
    // for input and textarea fields
    $("input, textarea").keyup(function(){
		if ($(this).val() != '') {
			$(this).addClass('notEmpty');
		} else {
			$(this).removeClass('notEmpty');
		}
	});
	

    /* Back To Top Button */
    // create the back to top button
    $('body').prepend('<a href="body" class="back-to-top page-scroll">Back to Top</a>');
    var amountScrolled = 700;
    $(window).scroll(function() {
        if ($(window).scrollTop() > amountScrolled) {
            $('a.back-to-top').fadeIn('500');
        } else {
            $('a.back-to-top').fadeOut('500');
        }
    });


	/* Removes Long Focus On Buttons */
	$(".button, a, button").mouseup(function() {
		$(this).blur();
	});

})(jQuery);

// Membuat atau membuka IndexedDB
const dbRequest = indexedDB.open("ContactDB", 1);
let lastFeedbackTime = 0; // Menyimpan waktu pengiriman feedback terakhir
let currentUser = { name: "Ahmad Reza Yuansyah Putra", email: "jago@gmail.com" }; // Ganti dengan informasi pengguna yang sesuai

// Menyiapkan store dan index saat pertama kali dibuka
dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("ContactStore", { keyPath: "id", autoIncrement: true });
};

// Memuat feedback saat database dibuka
dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    loadFeedback(db); // Tampilkan feedback yang ada saat halaman dimuat

    // Fungsi untuk menyimpan feedback
    document.getElementById("contactForm").onsubmit = function(event) {
        event.preventDefault(); // Mencegah pengiriman form secara default

        const name = document.getElementById("cname").value;
        const email = document.getElementById("cemail").value;
        const message = document.getElementById("cmessage").value;

        // Validasi: pastikan feedback tidak kosong
        if (!name || !email || !message) {
            alert("Semua bidang harus diisi.");
            return;
        }

        // Validasi: cek waktu pengiriman feedback terakhir
        const currentTime = Date.now();
        if (currentTime - lastFeedbackTime < 30000) { // 30 detik
            alert("Anda hanya dapat mengirim feedback sekali setiap 30 detik.");
            return;
        }

        // Validasi: cek duplikat feedback
        const transaction = db.transaction("ContactStore", "readonly");
        const objectStore = transaction.objectStore("ContactStore");
        const getAllRequest = objectStore.getAll();

        getAllRequest.onsuccess = (event) => {
            const feedbacks = event.target.result;
            const isDuplicate = feedbacks.some(feedback => 
                feedback.name === name && feedback.email === email && feedback.message === message
            );

            if (isDuplicate) {
                alert("Feedback dengan nama dan email yang sama sudah ada.");
                return;
            }

            // Jika tidak ada duplikat, simpan feedback
            const writeTransaction = db.transaction("ContactStore", "readwrite");
            const writeObjectStore = writeTransaction.objectStore("ContactStore");

            writeObjectStore.add({ name, email, message });

            writeTransaction.oncomplete = () => {
                console.log("Feedback saved");
                loadFeedback(db); // Memperbarui daftar feedback setelah menyimpan
                lastFeedbackTime = Date.now(); // Perbarui waktu pengiriman feedback terakhir
                document.getElementById("contactForm").reset(); // Reset form setelah menyimpan
            };

            writeTransaction.onerror = (event) => {
                console.error("Error saving feedback:", event.target.error);
            };
        };

        getAllRequest.onerror = (event) => {
            console.error("Error getting feedbacks:", event.target.error);
        };
    };
};

// Fungsi untuk memuat dan menampilkan feedback
function loadFeedback(db) {
    const transaction = db.transaction("ContactStore", "readonly");
    const objectStore = transaction.objectStore("ContactStore");
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = (event) => {
        const feedbacks = event.target.result;
        const feedbackDisplay = document.getElementById("feedbackDisplay");
        feedbackDisplay.innerHTML = ""; // Bersihkan area tampilan sebelum menambah

        feedbacks.forEach(feedback => {
            const feedbackItem = document.createElement("div");
            feedbackItem.classList.add("feedback-item"); // Menambahkan kelas untuk gaya

            // Menambahkan HTML untuk menampilkan feedback dan tombol hapus
            feedbackItem.innerHTML = `
                <strong>${feedback.name} (${feedback.email}):</strong> ${feedback.message}
                <button class="delete-btn" data-id="${feedback.id}">Hapus</button>
            `;

            // Menambahkan event listener untuk tombol hapus
            feedbackItem.querySelector('.delete-btn').addEventListener('click', function() {
                // Cek apakah pengguna saat ini adalah pemilik feedback
                if (feedback.name === currentUser.name && feedback.email === currentUser.email) {
                    deleteFeedback(db, feedback.id);
                } else {
                    alert("Anda tidak memiliki hak untuk menghapus feedback ini.");
                }
            });

            feedbackDisplay.appendChild(feedbackItem);
        });
    };

    getAllRequest.onerror = (event) => {
        console.error("Error getting feedbacks:", event.target.error);
    };
}

// Fungsi untuk menghapus feedback dari IndexedDB
function deleteFeedback(db, id) {
    const transaction = db.transaction("ContactStore", "readwrite");
    const objectStore = transaction.objectStore("ContactStore");
    const deleteRequest = objectStore.delete(id);

    deleteRequest.onsuccess = () => {
        console.log("Feedback deleted");
        loadFeedback(db); // Memperbarui daftar feedback setelah menghapus
    };

    deleteRequest.onerror = (event) => {
        console.error("Error deleting feedback:", event.target.error);
    };
}
