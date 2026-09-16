// заставка при запуске приложения
document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splash-screen");
    const mainScreen = document.getElementById("main-screen");
    // таймер на 3 секунды
    setTimeout(() => {
        // мы плавно скрываем заставку и показываем главный экран
        splashScreen.classList.add("hidden");
        // показываем затем главный экран
        mainScreen.classList.remove("hidden"); }, 3000);
});