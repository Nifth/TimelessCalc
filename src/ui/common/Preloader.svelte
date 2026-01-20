<script lang="ts">
  export let loadingComplete: boolean = false;
  export let progress: number = 0;

  let displayProgress: number = 0;

  function updateDisplayProgress() {
    if (displayProgress < progress) {
      displayProgress += Math.max(1, (progress - displayProgress) * 0.1);
      if (displayProgress >= progress) {
        displayProgress = progress;
      }
      requestAnimationFrame(updateDisplayProgress);
    }
  }

  $: if (progress !== displayProgress) {
    updateDisplayProgress();
  }
</script>

<div class="preloader-overlay" role="status" aria-live="polite">
  <div class="preloader-content">
    <div class="logo-container">
      <div class="gem-icon"></div>
      <div class="sparkle sparkle-1"></div>
      <div class="sparkle sparkle-2"></div>
      <div class="sparkle sparkle-3"></div>
    </div>
    <div class="progress-bar">
      <div
        class="wave-indicator"
        class:loading-complete={loadingComplete}
      ></div>
    </div>
    <p class="loading-text" aria-label="Loading Path of Exile Passive Tree">
      Loading Path of Exile Passive Tree...
    </p>
    <p class="loading-subtext">Preparing your destiny</p>
  </div>
</div>

<style>
  .preloader-overlay {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    overflow: hidden;
  }

  .preloader-overlay::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 30% 40%,
        rgba(255, 140, 0, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 70% 60%,
        rgba(220, 20, 60, 0.08) 0%,
        transparent 50%
      );
    animation: backgroundShift 8s ease-in-out infinite;
  }

  @keyframes backgroundShift {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  .preloader-content {
    text-align: center;
    color: white;
    position: relative;
    z-index: 1;
  }

  .logo-container {
    position: relative;
    margin-bottom: 30px;
  }

  .gem-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #ff8c00 0%, #ff4500 50%, #dc143c 100%);
    clip-path: polygon(50% 0%, 0% 25%, 25% 100%, 75% 100%, 100% 25%);
    position: relative;
    box-shadow:
      0 0 30px rgba(255, 140, 0, 0.6),
      inset 0 0 20px rgba(255, 255, 255, 0.3);
    animation: gemPulse 2s ease-in-out infinite;
  }

  @keyframes gemPulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow:
        0 0 30px rgba(255, 140, 0, 0.6),
        inset 0 0 20px rgba(255, 255, 255, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow:
        0 0 40px rgba(255, 140, 0, 0.8),
        inset 0 0 25px rgba(255, 255, 255, 0.4);
    }
  }

  .sparkle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #ffffff;
    border-radius: 50%;
    animation: sparkleTwinkle 1.5s ease-in-out infinite;
  }

  .sparkle-1 {
    top: 20px;
    left: 10px;
    animation-delay: 0s;
  }

  .sparkle-2 {
    top: 50px;
    right: 15px;
    animation-delay: 0.5s;
  }

  .sparkle-3 {
    bottom: 25px;
    left: 20px;
    animation-delay: 1s;
  }

  @keyframes sparkleTwinkle {
    0%,
    100% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  .progress-bar {
    width: 200px;
    height: 3px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    margin: 0 auto 20px;
    overflow: hidden;
    position: relative;
  }

  .wave-indicator {
    height: 100%;
    background: rgba(255, 140, 0, 0.9);
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: 0;
    animation: waveEffect 2s ease-in-out infinite;
    box-shadow: 0 0 15px rgba(255, 140, 0, 0.6);
  }

  .wave-indicator.loading-complete {
    animation: completionWave 0.8s ease-out;
    width: 100% !important;
  }

  @keyframes waveEffect {
    0% {
      width: 0%;
      left: 0%;
    }
    25% {
      width: 40%;
      left: 0%;
    }
    50% {
      width: 80%;
      left: 0%;
    }
    75% {
      width: 40%;
      left: 60%;
    }
    100% {
      width: 0%;
      left: 100%;
    }
  }

  @keyframes completionWave {
    0% {
      background: rgba(255, 140, 0, 0.9);
      box-shadow: 0 0 15px rgba(255, 140, 0, 0.6);
    }
    50% {
      background: rgba(0, 255, 0, 0.9);
      box-shadow: 0 0 25px rgba(0, 255, 0, 0.8);
    }
    100% {
      background: rgba(0, 255, 0, 0.7);
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
    }
  }

  .loading-text {
    font-family: Fontin, sans-serif;
    font-size: 20px;
    margin: 0 0 10px 0;
    font-weight: 600;
    background: linear-gradient(45deg, #ffffff 0%, #ff8c00 50%, #ffffff 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textShimmer 3s ease-in-out infinite;
  }

  @keyframes textShimmer {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  .loading-subtext {
    font-family: Fontin, sans-serif;
    font-size: 14px;
    margin: 0;
    opacity: 0.7;
    color: #cccccc;
    font-style: italic;
  }
</style>
