// заставка при запуске приложения
document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splash-screen");
    const mainScreen = document.getElementById("main-screen");
    // полоса загрузки
    const loadingLine = document.getElementById('loading-line');
    const loadingText = document.getElementById('loading-text');
    let procent = 0;
    // запускаем счетчик процентов
    const a = setInterval(() => {
        if (procent >= 100) {
            // останавливаем загрузку когда будет 100%
            clearInterval(a);
            // 3 секунды загрузка
            setTimeout(() => {
                // скрываем экран загрузки и показываем главный экран
                splashScreen.classList.add("hidden");
                mainScreen.classList.remove("hidden");
            }, 300);
        } else {
            procent += 1; //увеличиваем на 1 процент
            // обноваляем элементы
            if (loadingLine && loadingText) {
                loadingLine.style.width = procent + '%';
                loadingText.innerText = procent + '%';
            }
        }
    }, 25) // 25 милисекунд на каждый шаг
});