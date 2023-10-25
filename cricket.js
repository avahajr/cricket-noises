document.addEventListener("DOMContentLoaded", function (event) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create audio nodes
  const phasor = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  const cos1 = audioContext.createOscillator();
  const cos2 = audioContext.createOscillator();
  const sig = audioContext.createGain();
  const mul1 = audioContext.createGain();
  const mul2 = audioContext.createGain();
  const mul3 = audioContext.createGain();
  const mul4 = audioContext.createGain();
  const min = audioContext.createWaveShaper();
  const wrap = audioContext.createWaveShaper();
  const mul5 = audioContext.createGain();
  const mul6 = audioContext.createGain();
  const mul7 = audioContext.createGain();
  const mul8 = audioContext.createGain();
  const sub = audioContext.createGain();
  const mul9 = audioContext.createGain();
  const mul10 = audioContext.createGain();
  const add = audioContext.createGain();

  // Set parameters
  phasor.type = "sine";
  phasor.frequency.value = 1; // Adjust the frequency as needed
  gain1.gain.value = 0.1;
  cos1.type = "sine";
  cos2.type = "sine";
  sig.gain.value = 1.43;
  mul1.gain.value = 40.6;
  mul2.gain.value = 1;
  mul3.gain.value = 3147;
  mul4.gain.value = 2;
  mul5.gain.value = 0.3;
  mul6.gain.value = -4;
  mul7.gain.value = 1;
  mul8.gain.value = 0.5;
  mul9.gain.value = 1;
  mul10.gain.value = -1;

  // Connect the nodes
  phasor.connect(mul1);
  phasor.connect(mul2);
  cos1.connect(sub);
  cos2.connect(mul3);
  gain1.connect(phasor.frequency);
  mul1.connect(gain1);
  mul2.connect(sub);
  mul3.connect(sig);
  mul4.connect(cos1.frequency);
  mul5.connect(cos2.frequency);
  mul6.connect(min);
  mul7.connect(wrap);
  mul8.connect(mul9);
  mul8.connect(mul10);
  mul9.connect(sub);
  mul10.connect(min);
  sub.connect(mul5);
  sub.connect(mul6);
  min.connect(wrap);
  wrap.connect(mul4);
  add.connect(gain1);

  // Connect to the audio destination
  sig.connect(audioContext.destination);

  // Start the audio
  phasor.start();
});
