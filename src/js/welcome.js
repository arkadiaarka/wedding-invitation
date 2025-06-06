// src/js/welcome.js

import {data} from "../assets/data/data.js";
import {addClassElement, getQueryParameter, removeClassElement} from "../utils/helper.js";
import { generateRandomId, generateRandomColor, getCurrentDateTime } from "../utils/helper.js";
import { comentarService } from "../services/comentarService.js";


export const welcome = () => {
    const welcomeElement = document.querySelector('.welcome');
    const homeElement = document.querySelector('.home');
    const navbarElement = document.querySelector('header nav');
    const attendancePopupOverlay = document.querySelector('.attendance-popup-overlay');
    const confirmHadirButton = document.querySelector('#confirm-hadir');
    const confirmTidakHadirButton = document.querySelector('#confirm-tidak-hadir');

    const nameInput = document.querySelector('#name'); // Sudah ada
    // Tambahkan referensi ke elemen textarea untuk pesan
    const messageInput = document.querySelector('#message'); // Tambahkan ini


    const [_, figureElement, weddingToElement, openWeddingButton] = welcomeElement.children;
    const [audioMusic, audioButton] = document.querySelector('.audio').children;
    const [iconButton] = audioButton.children;

   const generateFigureContent = (bride) => {
    const {L: {name: brideLName}, P: {name: bridePName}, couple: coupleImage} = bride;
    return `
        <img src="${coupleImage}" alt="couple animation">
        <figcaption>
          <div class="brideLName">${brideLName}</div>
          <div class="ampersand">&amp;</div>
          <div class="bridePName">${bridePName}</div>
        </figcaption>`;
};

    const generateParameterContent = () => {
        const params = getQueryParameter('to');

        if (params) {
            weddingToElement.innerHTML = `Kepada Yth Bapak/Ibu/Saudara/i<br><span>${params}</span>`;
            if (nameInput) {
                 nameInput.value = params;
            }
        } else {
            weddingToElement.innerHTML = `Kepada Yth Bapak/Ibu/Saudara/i<br><span>Teman-teman semua</span>`;
            if (nameInput) {
                nameInput.value = 'Teman-teman semua';
            }
        }
    }

    const initialAudio = () => {
        let isPlaying = false;

        audioMusic.src = data.audio;
        audioMusic.type = 'audio/mp3';
        audioMusic.load(); // Memuat (preload) audio di awal

        audioButton.addEventListener('click', () => {
            if (isPlaying) {
                addClassElement(audioButton, 'active');
                removeClassElement(iconButton, 'bx-play-circle');
                addClassElement(iconButton, 'bx-pause-circle');
                audioMusic.play();
            } else {
                removeClassElement(audioButton, 'active');
                removeClassElement(iconButton, 'bx-pause-circle');
                addClassElement(iconButton, 'bx-play-circle');
                audioMusic.pause();
            }
            isPlaying = !isPlaying;
        });
    };

    openWeddingButton.addEventListener('click', () => {
        addClassElement(document.body, 'active');
        addClassElement(welcomeElement, 'hide');

        setTimeout(() => {
            addClassElement(homeElement, 'active');
            addClassElement(navbarElement, 'active');
            addClassElement(audioButton, 'show');
            removeClassElement(iconButton, 'bx-play-circle');
            addClassElement(iconButton, 'bx-pause-circle');

            addClassElement(document.body, 'no-scroll');
            audioMusic.pause();

            if (attendancePopupOverlay) {
                 addClassElement(attendancePopupOverlay, 'active');
            } else {
                console.error("Elemen attendancePopupOverlay tidak ditemukan!");
            }

        }, 1500);

        setTimeout(() => {
            addClassElement(audioButton, 'active');
        }, 3000);
    });

    const sendAttendanceConfirmation = async (status) => {
        const guestName = nameInput ? nameInput.value : 'Tamu Anonim';
        // Ambil nilai dari messageInput. Jika kosong, kirim string kosong.
        const userMessage = messageInput ? messageInput.value.trim() : ''; 
        
        // Perbaiki cara pesan dikirim
        // Sekarang, 'message' akan menjadi pesan dari user jika ada, atau string kosong
        // Pesan konfirmasi ('Konfirmasi Hadir'/'Tidak Hadir') akan ditambahkan di Apps Script
        const attendanceData = {
            id: generateRandomId(),
            name: guestName,
            status: status === 'y' ? 'Hadir' : 'Tidak Hadir', // Tetap kirim status 'Hadir'/'Tidak Hadir'
            message: userMessage, // Kirim pesan yang diketik user (bisa kosong)
            date: getCurrentDateTime(),
            color: generateRandomColor(),
        };

        try {
            const response = await comentarService.addComentar(attendanceData);
            console.log('Konfirmasi kehadiran terkirim:', response);

        } catch (error) {
            console.error('Error saat mengirim konfirmasi kehadiran:', error);
        }
    };


    if (confirmHadirButton) {
        confirmHadirButton.addEventListener('click', async () => {
            removeClassElement(attendancePopupOverlay, 'active');

            audioMusic.play();
            removeClassElement(document.body, 'no-scroll');

            // Panggil sendAttendanceConfirmation dengan status 'y' (Hadir)
            // Nilai message yang dikirim akan diambil dari messageInput (yang mungkin kosong)
            await sendAttendanceConfirmation('y'); 

            const statusSelect = document.querySelector('#status');
            if (statusSelect) {
                statusSelect.value = 'y';
            }
        });
    }

    if (confirmTidakHadirButton) {
        confirmTidakHadirButton.addEventListener('click', async () => {
            removeClassElement(attendancePopupOverlay, 'active');

            audioMusic.play();
            removeClassElement(document.body, 'no-scroll');

            // Panggil sendAttendanceConfirmation dengan status 'n' (Tidak Hadir)
            // Nilai message yang dikirim akan diambil dari messageInput (yang mungkin kosong)
            await sendAttendanceConfirmation('n');

            const statusSelect = document.querySelector('#status');
            if (statusSelect) {
                statusSelect.value = 'n';
            }
        });
    }

    const initializeWelcome = () => {
        figureElement.innerHTML = generateFigureContent(data.bride);
        generateParameterContent();
        addClassElement(welcomeElement, 'active');
    }

    initializeWelcome();
    initialAudio();
}