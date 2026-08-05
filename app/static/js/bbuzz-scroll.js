(() => {
  const story = document.querySelector(".scroll-story");
  const video = document.querySelector("#bee-video");
  const steps = [...document.querySelectorAll("[data-story-step]")];
  const progressBar = document.querySelector(".story-progress span");
  if (!story || !video || !steps.length) return;

  let duration = 0;
  let targetTime = 0;
  let displayedTime = 0;
  let activeStep = -1;
  let ticking = false;

  const setStep = (index) => {
    if (index === activeStep) return;
    activeStep = index;
    steps.forEach((step, position) => {
      step.classList.toggle("is-active", position === index);
    });
  };

  const getProgress = () => {
    const rect = story.getBoundingClientRect();
    const distance = story.offsetHeight - window.innerHeight;
    return distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
  };

  const update = () => {
    const progress = getProgress();
    targetTime = duration * progress;
    progressBar.style.transform = `scaleX(${progress})`;

    const section = Math.min(steps.length - 1, Math.floor(progress * steps.length));
    setStep(section);

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(scrub);
    }
  };

  const scrub = () => {
    displayedTime += (targetTime - displayedTime) * 0.16;
    if (duration && Math.abs(video.currentTime - displayedTime) > 0.015) {
      video.currentTime = Math.min(duration, Math.max(0, displayedTime));
    }
    if (Math.abs(targetTime - displayedTime) > 0.01) {
      requestAnimationFrame(scrub);
    } else {
      ticking = false;
    }
  };

  const ready = () => {
    duration = Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.05) : 0;
    video.pause();
    setStep(0);
    update();
  };

  video.addEventListener("loadedmetadata", ready, { once: true });
  video.addEventListener("canplay", () => video.pause());
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) video.pause();
  });

  if (video.readyState >= 1) ready();
})();
